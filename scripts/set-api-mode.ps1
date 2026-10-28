param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('docker', 'local')]
  [string]$Mode,
  [switch]$SkipApiHealthCheck
)

$ErrorActionPreference = 'Stop'
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $repositoryRoot

$envPath = Join-Path $repositoryRoot '.env'
if (-not (Test-Path $envPath)) {
  throw 'Arquivo .env não encontrado na raiz. Copie .env.example para .env e configure os valores locais primeiro.'
}

$backendUpstream = if ($Mode -eq 'local') {
  'host.docker.internal:3000'
} else {
  'urbancandy-backend:3030'
}

if ($Mode -eq 'local' -and -not $SkipApiHealthCheck) {
  & curl.exe --fail --silent --show-error --max-time 5 --output NUL http://127.0.0.1:3000/api/health
  if ($LASTEXITCODE -ne 0) {
    throw 'Backend local não respondeu em http://127.0.0.1:3000/api/health. Inicie-o com NODE_ENV=development antes de trocar o modo.'
  }
}

$originalBytes = [System.IO.File]::ReadAllBytes($envPath)
$hasUtf8Bom = $originalBytes.Length -ge 3 -and
  $originalBytes[0] -eq 0xEF -and
  $originalBytes[1] -eq 0xBB -and
  $originalBytes[2] -eq 0xBF
$encoding = [System.Text.UTF8Encoding]::new($hasUtf8Bom)
$originalContent = [System.IO.File]::ReadAllText($envPath, $encoding)
$lineEnding = if ($originalContent.Contains("`r`n")) { "`r`n" } else { "`n" }
$matchingLines = [regex]::Matches($originalContent, '(?m)^\s*BACKEND_UPSTREAM\s*=.*$')

if ($matchingLines.Count -gt 1) {
  throw 'O .env contém mais de uma definição BACKEND_UPSTREAM. Remova a duplicata e tente novamente.'
}

$upstreamLine = "BACKEND_UPSTREAM=$backendUpstream"
$updatedContent = $originalContent
if ($matchingLines.Count -eq 1) {
  $updatedContent = [regex]::Replace(
    $originalContent,
    '(?m)^\s*BACKEND_UPSTREAM\s*=.*$',
    [System.Text.RegularExpressions.MatchEvaluator]{ param($match) $upstreamLine },
    1
  )
} else {
  if ($updatedContent.Length -gt 0 -and -not $updatedContent.EndsWith("`n")) {
    $updatedContent += $lineEnding
  }
  $updatedContent += $upstreamLine
  if ($originalContent.EndsWith("`n")) { $updatedContent += $lineEnding }
}

[System.IO.File]::WriteAllText($envPath, $updatedContent, $encoding)

try {
  if ($Mode -eq 'local') {
    & docker compose up -d --no-deps urbancandy-frontend
    if ($LASTEXITCODE -ne 0) { throw 'Docker Compose não conseguiu iniciar o frontend necessário para urbancandy.local.' }
  }

  & docker compose up -d --no-deps --force-recreate urbancandy-nginx
  if ($LASTEXITCODE -ne 0) { throw 'Docker Compose não conseguiu recriar o Nginx.' }

  Start-Sleep -Seconds 3
  $nginxConfig = & docker compose exec -T urbancandy-nginx cat /etc/nginx/conf.d/urbancandy.conf
  if ($LASTEXITCODE -ne 0) { throw 'Não foi possível verificar a configuração gerada do Nginx.' }
  if (-not ($nginxConfig -match [regex]::Escape("proxy_pass http://$backendUpstream;"))) {
    throw 'O Nginx não aplicou o backend selecionado.'
  }

  & docker compose exec -T urbancandy-nginx nginx -t
  if ($LASTEXITCODE -ne 0) { throw 'A configuração gerada do Nginx é inválida.' }

  if (-not $SkipApiHealthCheck) {
    $healthy = $false
    $lastStatus = 'sem resposta'
    for ($attempt = 0; $attempt -lt 12; $attempt++) {
      $lastStatus = (& curl.exe --silent --insecure --max-time 5 --output NUL --write-out '%{http_code}' https://urbancandy.local/api/health | Out-String).Trim()
      if ($LASTEXITCODE -eq 0 -and $lastStatus -eq '200') {
        $healthy = $true
        break
      }
      Start-Sleep -Seconds 2
    }
    if (-not $healthy) { throw "A verificação de saúde da API pelo domínio urbancandy.local falhou (HTTP $lastStatus)." }
  }

  Write-Host "Modo $Mode ativo em https://urbancandy.local."
} catch {
  $operationError = $_
  [System.IO.File]::WriteAllText($envPath, $originalContent, $encoding)
  try {
    & docker compose up -d --no-deps --force-recreate urbancandy-nginx
    if ($LASTEXITCODE -ne 0) {
      throw 'Docker Compose não conseguiu restaurar o Nginx ao modo anterior.'
    }
  } catch {
    throw "A troca falhou e a configuração anterior foi restaurada no .env, mas o Nginx não pôde ser recriado. Erro original: $($operationError.Exception.Message) Erro ao restaurar: $($_.Exception.Message)"
  }
  throw $operationError
}

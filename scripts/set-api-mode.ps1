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
$frontendUpstream = if ($Mode -eq 'local') {
  'host.docker.internal:5173'
} else {
  'urbancandy-frontend:5173'
}

if ($Mode -eq 'local' -and -not $SkipApiHealthCheck) {
  & curl.exe --fail --silent --show-error --max-time 5 --output NUL http://127.0.0.1:3000/api/health
  if ($LASTEXITCODE -ne 0) {
    throw 'Backend local não respondeu em http://127.0.0.1:3000/api/health. Inicie-o com NODE_ENV=development antes de trocar o modo.'
  }

  & curl.exe --fail --silent --show-error --max-time 5 --output NUL http://127.0.0.1:5173/
  if ($LASTEXITCODE -ne 0) {
    throw 'Frontend Vite local não respondeu em http://127.0.0.1:5173. Inicie-o em UrbanCandy_front antes de trocar o modo.'
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
$updatedContent = $originalContent
$httpPortMatches = [regex]::Matches($originalContent, '(?m)^\s*HTTP_PORT\s*=\s*(.*?)\s*$')
if ($httpPortMatches.Count -gt 1) {
  throw 'O .env da raiz contém mais de uma definição HTTP_PORT. Remova a duplicata e tente novamente.'
}

$configuredHttpPort = if ($httpPortMatches.Count -eq 1) {
  $httpPortMatches[0].Groups[1].Value.Trim().Trim('"').Trim("'")
} else {
  '80'
}
$mobileApiPort = 80
if (-not [int]::TryParse($configuredHttpPort, [ref]$mobileApiPort) -or
  $mobileApiPort -lt 1 -or $mobileApiPort -gt 65535) {
  throw 'HTTP_PORT no .env da raiz deve ser um número entre 1 e 65535.'
}

$mobileEnvPath = Join-Path $repositoryRoot 'UrbanCandy_mobile\.env'
$mobileEnvUpdatedContent = $null
$mobileEnvEncoding = $null
$mobileEnvWriteAttempted = $false

if (Test-Path $mobileEnvPath) {
  $mobileEnvBytes = [System.IO.File]::ReadAllBytes($mobileEnvPath)
  $mobileHasUtf8Bom = $mobileEnvBytes.Length -ge 3 -and
    $mobileEnvBytes[0] -eq 0xEF -and
    $mobileEnvBytes[1] -eq 0xBB -and
    $mobileEnvBytes[2] -eq 0xBF
  $mobileEnvEncoding = [System.Text.UTF8Encoding]::new($mobileHasUtf8Bom)
  $mobileEnvContent = [System.IO.File]::ReadAllText($mobileEnvPath, $mobileEnvEncoding)
  $mobileApiUrlPattern = '(?m)^\s*EXPO_PUBLIC_API_URL\s*=\s*(.*?)\s*$'
  $mobileApiUrlMatches = [regex]::Matches($mobileEnvContent, $mobileApiUrlPattern)

  if ($mobileApiUrlMatches.Count -gt 1) {
    throw 'O UrbanCandy_mobile\.env contém mais de uma definição EXPO_PUBLIC_API_URL. Remova a duplicata e tente novamente.'
  }

  if ($mobileApiUrlMatches.Count -eq 1) {
    $configuredMobileApiUrl = $mobileApiUrlMatches[0].Groups[1].Value.Trim()
    try {
      $mobileApiUri = [Uri]::new($configuredMobileApiUrl)
    } catch {
      throw 'EXPO_PUBLIC_API_URL no UrbanCandy_mobile\.env deve ser uma URL absoluta válida.'
    }
    if (-not $mobileApiUri.IsAbsoluteUri -or
      $mobileApiUri.Scheme -notin @('http', 'https') -or
      $mobileApiUri.Query -or $mobileApiUri.Fragment -or $mobileApiUri.UserInfo) {
      throw 'EXPO_PUBLIC_API_URL no UrbanCandy_mobile\.env deve ser uma URL HTTP(S) sem query, fragmento ou credenciais.'
    }

    $mobileApiUriBuilder = [System.UriBuilder]::new($mobileApiUri)
    $mobileApiAddress = $null
    if ([System.Net.IPAddress]::TryParse($mobileApiUri.Host, [ref]$mobileApiAddress) -and
      $mobileApiAddress.AddressFamily -eq [System.Net.Sockets.AddressFamily]::InterNetwork -and
      -not $mobileApiAddress.IsLoopback -and
      $mobileApiAddress.IPAddressToString -ne '10.0.2.2') {
      $mobileLanAddress = Get-NetIPConfiguration |
        Where-Object { $_.NetAdapter.Status -eq 'Up' -and $_.IPv4DefaultGateway -and $_.IPv4Address } |
        ForEach-Object {
          $_.IPv4Address |
            Where-Object { $_.IPAddress -notmatch '^169\.254\.' } |
            Select-Object -First 1 -ExpandProperty IPAddress
        } |
        Select-Object -First 1

      if (-not $mobileLanAddress) {
        throw 'Não foi possível detectar o IP IPv4 ativo do computador para configurar o acesso mobile pelo Nginx.'
      }

      $mobileApiUriBuilder.Host = $mobileLanAddress
    }
    $mobileApiUriBuilder.Port = $mobileApiPort
    $updatedMobileApiUrl = $mobileApiUriBuilder.Uri.GetLeftPart([System.UriPartial]::Path).TrimEnd('/')
    $mobileEnvUpdatedContent = [regex]::Replace(
      $mobileEnvContent,
      $mobileApiUrlPattern,
      [System.Text.RegularExpressions.MatchEvaluator]{
        param($match)
        "EXPO_PUBLIC_API_URL=$updatedMobileApiUrl"
      },
      1
    )
  } else {
    Write-Warning 'EXPO_PUBLIC_API_URL não está configurada em UrbanCandy_mobile\.env; o modo do Expo não foi alterado.'
  }
} else {
  Write-Warning 'UrbanCandy_mobile\.env não existe; configure EXPO_PUBLIC_API_URL para habilitar a troca automática do modo no Expo.'
}

foreach ($setting in @{
    BACKEND_UPSTREAM = $backendUpstream
    FRONTEND_UPSTREAM = $frontendUpstream
  }.GetEnumerator()) {
  $settingPattern = "(?m)^\s*$([regex]::Escape($setting.Key))\s*=.*$"
  $matchingLines = [regex]::Matches($updatedContent, $settingPattern)

  if ($matchingLines.Count -gt 1) {
    throw "O .env contém mais de uma definição $($setting.Key). Remova a duplicata e tente novamente."
  }

  $settingLine = "$($setting.Key)=$($setting.Value)"
  if ($matchingLines.Count -eq 1) {
    $updatedContent = [regex]::Replace(
      $updatedContent,
      $settingPattern,
      [System.Text.RegularExpressions.MatchEvaluator]{ param($match) $settingLine },
      1
    )
  } else {
    if ($updatedContent.Length -gt 0 -and -not $updatedContent.EndsWith("`n")) {
      $updatedContent += $lineEnding
    }
    $updatedContent += $settingLine
    if ($originalContent.EndsWith("`n")) { $updatedContent += $lineEnding }
  }
}

[System.IO.File]::WriteAllText($envPath, $updatedContent, $encoding)

try {
  & docker compose up -d --no-deps urbancandy-frontend
  if ($LASTEXITCODE -ne 0) { throw 'Docker Compose não conseguiu iniciar o frontend do UrbanCandy.' }

  & docker compose up -d --no-deps --force-recreate urbancandy-nginx
  if ($LASTEXITCODE -ne 0) { throw 'Docker Compose não conseguiu recriar o Nginx.' }

  Start-Sleep -Seconds 3
  $nginxConfig = & docker compose exec -T urbancandy-nginx cat /etc/nginx/conf.d/urbancandy.conf
  if ($LASTEXITCODE -ne 0) { throw 'Não foi possível verificar a configuração gerada do Nginx.' }
  if (-not ($nginxConfig -match [regex]::Escape("proxy_pass http://$backendUpstream;"))) {
    throw 'O Nginx não aplicou o backend selecionado.'
  }
  if (-not ($nginxConfig -match [regex]::Escape("set `$frontend_upstream $frontendUpstream;"))) {
    throw 'O Nginx não aplicou o frontend selecionado.'
  }

  & docker compose exec -T urbancandy-nginx nginx -t
  if ($LASTEXITCODE -ne 0) { throw 'A configuração gerada do Nginx é inválida.' }

  if ($Mode -eq 'local') {
    & docker compose exec -T urbancandy-nginx wget --quiet --spider --header='Host: urbancandy.local' "http://$frontendUpstream/"
    if ($LASTEXITCODE -ne 0) {
      throw 'O Nginx não conseguiu acessar o Vite local em host.docker.internal:5173.'
    }
  }

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

    $mobileApiStatus = (& curl.exe --silent --max-time 5 --output NUL --write-out '%{http_code}' "http://127.0.0.1:$mobileApiPort/api/health" | Out-String).Trim()
    if ($LASTEXITCODE -ne 0 -or $mobileApiStatus -ne '200') {
      throw "A rota HTTP da API pelo Nginx para o mobile falhou (HTTP $mobileApiStatus)."
    }
  }

  if ($null -ne $mobileEnvUpdatedContent) {
    $mobileEnvWriteAttempted = $true
    [System.IO.File]::WriteAllText($mobileEnvPath, $mobileEnvUpdatedContent, $mobileEnvEncoding)
    Write-Host "API mobile roteada pelo Nginx na porta HTTP $mobileApiPort."
  }

  Write-Host "Modo $Mode ativo em https://urbancandy.local."
} catch {
  $operationError = $_
  [System.IO.File]::WriteAllText($envPath, $originalContent, $encoding)
  if ($mobileEnvWriteAttempted) {
    [System.IO.File]::WriteAllText($mobileEnvPath, $mobileEnvContent, $mobileEnvEncoding)
  }
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

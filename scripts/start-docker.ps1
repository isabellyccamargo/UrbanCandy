$ErrorActionPreference = 'Stop'
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $repositoryRoot

& docker compose up --build -d
if ($LASTEXITCODE -ne 0) {
  throw 'Docker Compose não conseguiu iniciar os serviços do UrbanCandy.'
}

& (Join-Path $PSScriptRoot 'set-api-mode.ps1') -Mode docker
if ($LASTEXITCODE -ne 0) {
  throw 'Os serviços Docker iniciaram, mas não foi possível selecionar e validar a API do Docker.'
}

foreach ($service in @(
  @{ Name = 'Grafana'; Url = 'http://localhost:3001/api/health' },
  @{ Name = 'Prometheus'; Url = 'http://localhost:9090/-/healthy' }
)) {
  $ready = $false
  for ($attempt = 0; $attempt -lt 24; $attempt++) {
    try {
      $response = Invoke-WebRequest -Uri $service.Url -TimeoutSec 5
      if ($response.StatusCode -eq 200) {
        $ready = $true
        break
      }
    } catch {
      Start-Sleep -Seconds 5
    }
  }
  if (-not $ready) {
    throw "$($service.Name) não respondeu no endereço esperado: $($service.Url)."
  }
}

$prometheusReady = $false
for ($attempt = 0; $attempt -lt 24; $attempt++) {
  try {
    $targets = Invoke-RestMethod -Uri 'http://localhost:9090/api/v1/targets' -TimeoutSec 5
    $apiTargets = @($targets.data.activeTargets | Where-Object {
      $_.labels.job -eq 'urbancandy-backend' -and $_.health -eq 'up'
    })
    $healthTargets = @($targets.data.activeTargets | Where-Object {
      $_.labels.job -eq 'urbancandy-api-health' -and $_.health -eq 'up'
    })
    if ($apiTargets.Count -gt 0 -and $healthTargets.Count -gt 0) {
      $prometheusReady = $true
      break
    }
  } catch {
    Start-Sleep -Seconds 5
  }
  Start-Sleep -Seconds 5
}
if (-not $prometheusReady) {
  throw 'Prometheus iniciou, mas ainda não está coletando as métricas e a verificação de saúde da API.'
}

Write-Host 'UrbanCandy Docker está disponível em https://urbancandy.local.'
Write-Host 'Grafana: http://localhost:3001 | Prometheus: http://localhost:9090'

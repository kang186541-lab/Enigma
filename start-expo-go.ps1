# ─── Expo Go 로컬 실행 스크립트 (PowerShell) ─────────────
# 사용법:  .\start-expo-go.ps1            (LAN, 같은 Wi-Fi)
#          .\start-expo-go.ps1 tunnel     (터널, 다른 네트워크)

Set-Location $PSScriptRoot

# 1) 로컬 IP 자동 감지
$LOCAL_IP = (Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notmatch '127\.' -and $_.IPAddress -notmatch '169\.254' } |
  Select-Object -First 1).IPAddress

if (-not $LOCAL_IP) {
  Write-Host "!! Wi-Fi IP not found" -ForegroundColor Red
  exit 1
}

$MODE = if ($args[0] -eq "tunnel") { "--tunnel" } else { "--lan" }

Write-Host ""
Write-Host "  LinguaAI - Expo Go" -ForegroundColor Yellow
Write-Host "  IP:     $LOCAL_IP" -ForegroundColor Cyan
Write-Host "  Server: http://${LOCAL_IP}:5000" -ForegroundColor Cyan
Write-Host "  Mode:   $MODE" -ForegroundColor Cyan
Write-Host ""

# 2) EXPO_PUBLIC_DOMAIN 처리 — 모드별로 분기
#    LAN 모드: .env.local의 EXPO_PUBLIC_DOMAIN을 LAN IP로 갱신 (다른 키 보존)
#    Tunnel 모드: phone이 다른 네트워크에 있으므로 LAN IP를 박으면 API 못 닿음.
#                기존 EXPO_PUBLIC_DOMAIN을 보존하고, 없으면 사용자에게 안내 후 종료.
#    이전 버전은 tunnel 모드에서도 .env.local과 process env를 LAN IP로 덮어써서
#    Metro 번들은 tunnel로 받지만 API 호출은 죽는 함정이 있었음.
$envPath = ".env.local"

if ($MODE -eq "--tunnel") {
  # tunnel 모드: 기존 EXPO_PUBLIC_DOMAIN 보존, 없으면 fail-fast
  $existingDomain = $null
  if (Test-Path $envPath) {
    $domainLine = Get-Content -Path $envPath -Encoding UTF8 |
      Where-Object { $_ -match '^\s*EXPO_PUBLIC_DOMAIN\s*=' } |
      Select-Object -First 1
    if ($domainLine -and ($domainLine -match '^\s*EXPO_PUBLIC_DOMAIN\s*=\s*(.*)$')) {
      # trim 공백 + surrounding quotes ('value', "value")
      $raw = $matches[1].Trim()
      $raw = $raw -replace '^"(.*)"$', '$1'
      $raw = $raw -replace "^'(.*)'$", '$1'
      $raw = $raw.Trim()
      if ($raw) { $existingDomain = $raw }
    }
  }

  if (-not $existingDomain) {
    Write-Host ""
    Write-Host "!! tunnel 모드는 외부에서 닿을 수 있는 API host가 필요합니다." -ForegroundColor Red
    Write-Host "   .env.local에 EXPO_PUBLIC_DOMAIN=<your-public-host> 를 설정한 뒤 다시 실행하세요." -ForegroundColor Yellow
    Write-Host "   (예: ngrok https URL host:port, Railway 도메인 등)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   같은 Wi-Fi에서 테스트하려면 인자 없이 실행하세요 (LAN 모드)." -ForegroundColor Yellow
    Write-Host ""
    exit 1
  }

  Write-Host "  Tunnel: preserving EXPO_PUBLIC_DOMAIN=$existingDomain (.env.local untouched)" -ForegroundColor Cyan
  $env:EXPO_PUBLIC_DOMAIN = $existingDomain
} else {
  # LAN 모드: 기존 .env.local 유지하며 EXPO_PUBLIC_DOMAIN 라인만 교체/추가
  $envLine = "EXPO_PUBLIC_DOMAIN=${LOCAL_IP}:5000"
  $existingLines = @()
  if (Test-Path $envPath) {
    $existingLines = Get-Content -Path $envPath -Encoding UTF8
  }
  $replaced = $false
  $updatedLines = foreach ($line in $existingLines) {
    if ($line -match '^\s*EXPO_PUBLIC_DOMAIN\s*=') {
      $replaced = $true
      $envLine
    } else {
      $line
    }
  }
  if (-not $replaced) {
    $updatedLines = @($updatedLines) + $envLine
  }
  Set-Content -Path $envPath -Value $updatedLines -Encoding UTF8
  if ($replaced) {
    Write-Host "  .env.local updated (EXPO_PUBLIC_DOMAIN replaced, other keys preserved)" -ForegroundColor Green
  } else {
    Write-Host "  .env.local updated (EXPO_PUBLIC_DOMAIN appended, other keys preserved)" -ForegroundColor Green
  }
  $env:EXPO_PUBLIC_DOMAIN = "${LOCAL_IP}:5000"
}

# 3) 나머지 환경 변수 설정 (EXPO_PUBLIC_DOMAIN은 위에서 모드별로 설정)
$env:PORT = "5000"
$env:NODE_ENV = "development"

# 4) Metro 캐시 클리어 + 서버 + Expo 동시 실행
Write-Host "  Starting server + expo (cache cleared)..." -ForegroundColor Green
Write-Host ""

npx concurrently --names "SERVER,EXPO" --prefix-colors "cyan,yellow" "npx tsx server/index.ts" "npx expo start $MODE --clear"

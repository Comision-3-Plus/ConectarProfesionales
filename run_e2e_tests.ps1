# PowerShell script to run E2E tests inside Docker container

Write-Host "╔══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                                      ║" -ForegroundColor Cyan
Write-Host "║           E2E TEST SUITE - MODULE 1 (Auth/KYC)                      ║" -ForegroundColor Cyan
Write-Host "║           QA Automation Engineer Setup & Execution                  ║" -ForegroundColor Cyan
Write-Host "║                                                                      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Docker is running
Write-Host "[1/4] Checking Docker status..." -ForegroundColor Yellow
docker ps | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker is running" -ForegroundColor Green
Write-Host ""

# Step 2: Check if containers are up
Write-Host "[2/4] Checking if containers are running..." -ForegroundColor Yellow
$apiContainer = docker ps --filter "name=marketplace_api" --format "{{.Names}}"
if (-not $apiContainer) {
    Write-Host "✗ API container is not running. Run: docker-compose up -d" -ForegroundColor Red
    exit 1
}
Write-Host "✓ API container is running: $apiContainer" -ForegroundColor Green
Write-Host ""

# Step 3: Install dev dependencies inside container
Write-Host "[3/4] Installing dev dependencies inside container..." -ForegroundColor Yellow
docker-compose exec -T api pip install -q -r requirements-dev.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dev dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dev dependencies installed successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Run E2E tests
Write-Host "[4/4] Executing E2E Test Suite..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
docker-compose exec -T api pytest tests/test_e2e_module_1.py -v --tb=short
$testResult = $LASTEXITCODE
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Summary
if ($testResult -eq 0) {
    Write-Host "╔══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                                                                      ║" -ForegroundColor Green
    Write-Host "║                     ✓ ALL TESTS PASSED ✓                            ║" -ForegroundColor Green
    Write-Host "║                                                                      ║" -ForegroundColor Green
    Write-Host "║  Module 1 (Auth/KYC) is ready for Production!                       ║" -ForegroundColor Green
    Write-Host "║  Tech Lead & Product Owner can approve moving to Module 2.          ║" -ForegroundColor Green
    Write-Host "║                                                                      ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    exit 0
} else {
    Write-Host "╔══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║                                                                      ║" -ForegroundColor Red
    Write-Host "║                     ✗ TESTS FAILED ✗                                ║" -ForegroundColor Red
    Write-Host "║                                                                      ║" -ForegroundColor Red
    Write-Host "║  Module 1 has issues that need to be fixed before approval.         ║" -ForegroundColor Red
    Write-Host "║  Please review the test output above.                               ║" -ForegroundColor Red
    Write-Host "║                                                                      ║" -ForegroundColor Red
    Write-Host "╚══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Red
    exit 1
}

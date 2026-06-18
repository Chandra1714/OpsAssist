# OpsAssist Start Script
Write-Host "=== OpsAssist Startup ===" -ForegroundColor Green
Write-Host ""

# Kill old processes
Write-Host "Stopping old servers..." -ForegroundColor Yellow
Get-Process uvicorn -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "Starting backend server..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    cd "C:\Users\User\Downloads\OpsAssist\opsassist-ai"
    & ".\backend\venv311\Scripts\python.exe" -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
} -Name "OpsAssist-Backend"

Write-Host "Starting frontend server..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    cd "C:\Users\User\Downloads\OpsAssist\frontend"
    $env:Path += ";C:\Program Files\nodejs"
    & "C:\Program Files\nodejs\npm.cmd" run dev -- --host 0.0.0.0 --port 5173
} -Name "OpsAssist-Frontend"

Write-Host ""
Write-Host "Waiting for servers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "=== SERVERS RUNNING ===" -ForegroundColor Green
Write-Host "Backend:  http://localhost:8000/docs" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop servers" -ForegroundColor Yellow

# Keep script alive
while ($true) {
    if ((Get-Job -Name "OpsAssist-Backend" -ErrorAction SilentlyContinue).State -eq "Failed") {
        Write-Host "Backend crashed! Restarting..." -ForegroundColor Red
        Remove-Job -Name "OpsAssist-Backend" -ErrorAction SilentlyContinue
        $backendJob = Start-Job -ScriptBlock {
            cd "C:\Users\User\Downloads\OpsAssist\opsassist-ai"
            & ".\backend\venv311\Scripts\python.exe" -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
        } -Name "OpsAssist-Backend"
    }
    Start-Sleep -Seconds 5
}

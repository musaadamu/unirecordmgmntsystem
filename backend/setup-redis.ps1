# Redis Setup Script for Windows
# This script downloads and sets up Redis for Windows

Write-Host "Setting up Redis for Windows..." -ForegroundColor Green

# Create Redis directory
$redisDir = "C:\Redis"
if (!(Test-Path $redisDir)) {
    New-Item -ItemType Directory -Path $redisDir -Force
    Write-Host "Created Redis directory: $redisDir" -ForegroundColor Yellow
}

# Download Redis for Windows
$redisUrl = "https://github.com/redis-windows/redis-windows/releases/download/8.2.1/Redis-8.2.1-Windows-x64-msys2.zip"
$zipFile = "$redisDir\redis.zip"

Write-Host "Downloading Redis..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $redisUrl -OutFile $zipFile -UseBasicParsing
    Write-Host "Redis downloaded successfully!" -ForegroundColor Green
} catch {
    Write-Host "Failed to download Redis: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Extract Redis
Write-Host "Extracting Redis..." -ForegroundColor Yellow
try {
    Expand-Archive -Path $zipFile -DestinationPath $redisDir -Force
    Remove-Item $zipFile
    Write-Host "Redis extracted successfully!" -ForegroundColor Green
} catch {
    Write-Host "Failed to extract Redis: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Create Redis configuration file
$configContent = @"
# Redis Configuration
port 6379
bind 127.0.0.1
timeout 0
save 900 1
save 300 10
save 60 10000
rdbcompression yes
dbfilename dump.rdb
dir ./
maxmemory-policy allkeys-lru
"@

$configFile = "$redisDir\redis.conf"
$configContent | Out-File -FilePath $configFile -Encoding UTF8
Write-Host "Redis configuration created: $configFile" -ForegroundColor Green

# Create start script
$startScript = @"
@echo off
echo Starting Redis Server...
cd /d C:\Redis\Redis-8.2.1-Windows-x64-msys2
redis-server.exe redis.conf
"@

$startBat = "$redisDir\start-redis.bat"
$startScript | Out-File -FilePath $startBat -Encoding ASCII
Write-Host "Redis start script created: $startBat" -ForegroundColor Green

Write-Host "`nRedis setup completed!" -ForegroundColor Green
Write-Host "To start Redis:" -ForegroundColor Yellow
Write-Host "1. Run: $startBat" -ForegroundColor White
Write-Host "2. Or manually: cd C:\Redis && redis-server.exe redis.conf" -ForegroundColor White
Write-Host "`nRedis will be available at: redis://localhost:6379" -ForegroundColor Cyan

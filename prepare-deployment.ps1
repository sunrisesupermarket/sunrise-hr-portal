# Sunrise HR Portal - Deployment Preparation Script
# Run this script to prepare your application for cPanel deployment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Sunrise HR Portal - Deployment Prep" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean development files
Write-Host "[1/5] Cleaning development files..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force uploads -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force credentials -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
Write-Host "  ✓ Development files removed" -ForegroundColor Green

# Step 2: Remove obsolete Google service files
Write-Host "[2/5] Removing obsolete files..." -ForegroundColor Yellow
Remove-Item services\emailService.js -ErrorAction SilentlyContinue
Remove-Item services\googleDrive.js -ErrorAction SilentlyContinue
Remove-Item services\googleSheets.js -ErrorAction SilentlyContinue
Remove-Item list-drive.js -ErrorAction SilentlyContinue
Remove-Item verify_setup.js -ErrorAction SilentlyContinue
Write-Host "  ✓ Obsolete files removed" -ForegroundColor Green

# Step 3: Check for .env file
Write-Host "[3/5] Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "  ✓ .env file found" -ForegroundColor Green
    Write-Host "  ⚠ IMPORTANT: Verify it contains PRODUCTION credentials!" -ForegroundColor Red
} else {
    Write-Host "  ✗ .env file NOT found!" -ForegroundColor Red
    Write-Host "  → Create .env file with production Supabase credentials" -ForegroundColor Yellow
    Write-Host "  → See PRODUCTION_ENV.md for template" -ForegroundColor Yellow
}

# Step 4: List files to be deployed
Write-Host "[4/5] Files ready for deployment:" -ForegroundColor Yellow
$filesToDeploy = @(
    "admin/",
    "hr/",
    "services/",
    ".env",
    "favicon.png",
    "footer.css",
    "index.html",
    "logo.png",
    "package.json",
    "public_form.js",
    "server.js"
)

foreach ($file in $filesToDeploy) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (MISSING)" -ForegroundColor Red
    }
}

# Step 5: Instructions
Write-Host ""
Write-Host "[5/5] Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Verify .env has PRODUCTION Supabase credentials" -ForegroundColor Cyan
Write-Host "  2. Ensure BASE_PATH=/sunrise in .env" -ForegroundColor Cyan
Write-Host "  3. Create ZIP file of all files listed above" -ForegroundColor Cyan
Write-Host "  4. Follow cpanel_deployment.md guide" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Preparation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To create deployment ZIP:" -ForegroundColor Yellow
Write-Host "  1. Select all files in this folder" -ForegroundColor White
Write-Host "  2. Right-click > Send to > Compressed folder" -ForegroundColor White
Write-Host "  3. Name it: sunrise-hr-portal.zip" -ForegroundColor White
Write-Host ""

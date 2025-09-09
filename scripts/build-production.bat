@echo off
echo 🚀 Building StripeForm for production...

REM Check if .env.local exists
if not exist .env.local (
    echo ❌ .env.local file not found!
    echo Please create .env.local with your production environment variables.
    echo You can copy from env.template and fill in your values.
    pause
    exit /b 1
)

REM Clean previous build
echo 🧹 Cleaning previous build...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out

REM Install dependencies if needed
echo 📦 Checking dependencies...
call npm ci --only=production

REM Build the application
echo 🔨 Building application...
call npm run build

REM Check build status
if %errorlevel% equ 0 (
    echo ✅ Build completed successfully!
    echo 📁 Build output is in the .next directory
    echo 🚀 Ready for deployment!
) else (
    echo ❌ Build failed!
    pause
    exit /b 1
)

pause

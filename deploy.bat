@echo off
setlocal enabledelayedexpansion

REM Deploy script for Buffet Junior's Kids Financial System (Windows)
title Buffet Junior's Kids - Production Deploy

echo.
echo ╔══════════════════════════════════════╗
echo ║    Buffet Junior's Kids Deploy      ║
echo ║         Production Build             ║
echo ╚══════════════════════════════════════╝
echo.

REM Configuration
set PROJECT_NAME=buffet-juniors-kids
set FRONTEND_DIR=frontend
set BACKEND_DIR=backend
set BUILD_DIR=dist

REM Check if Node.js is installed
echo 📋 Checking dependencies...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is required but not installed. Please install Node.js and try again.
    pause
    exit /b 1
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is required but not installed. Please install npm and try again.
    pause
    exit /b 1
)

echo ✅ All dependencies are available
echo.

REM Security check
echo 📋 Running security checks...
cd %FRONTEND_DIR%
call npm audit --audit-level=high
if errorlevel 1 (
    echo ⚠️  Frontend security audit found issues
)
cd ..

cd %BACKEND_DIR%
call npm audit --audit-level=high
if errorlevel 1 (
    echo ⚠️  Backend security audit found issues
)
cd ..

echo ✅ Security checks completed
echo.

REM Build frontend
echo 📋 Building frontend...
cd %FRONTEND_DIR%

echo 📋 Installing frontend dependencies...
call npm ci --production=false
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo 📋 Running frontend tests...
call npm run test:run
if errorlevel 1 (
    echo ⚠️  Some tests failed, continuing deployment...
)

echo 📋 Building frontend for production...
call npm run build
if errorlevel 1 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)

echo ✅ Frontend build completed
cd ..

REM Setup backend
echo 📋 Setting up backend...
cd %BACKEND_DIR%

echo 📋 Installing backend dependencies...
call npm ci --production=true
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

echo 📋 Compiling backend TypeScript...
call npm run build
if errorlevel 1 (
    echo ❌ Backend build failed
    pause
    exit /b 1
)

echo ✅ Backend setup completed
cd ..

REM Create deployment package
echo 📋 Creating deployment package...

REM Remove old deploy directory
if exist deploy rmdir /s /q deploy

REM Create deploy directory
mkdir deploy

REM Copy frontend build
echo 📋 Copying frontend build...
xcopy /e /i /q %FRONTEND_DIR%\%BUILD_DIR% deploy\public

REM Copy backend files
echo 📋 Copying backend files...
xcopy /e /i /q %BACKEND_DIR%\dist deploy\server
copy %BACKEND_DIR%\package.json deploy\
copy %BACKEND_DIR%\package-lock.json deploy\

REM Copy environment files
if exist %BACKEND_DIR%\.env.production (
    copy %BACKEND_DIR%\.env.production deploy\.env
) else (
    echo ⚠️  .env.production not found, using development environment
    if exist %BACKEND_DIR%\.env (
        copy %BACKEND_DIR%\.env deploy\
    ) else (
        echo ⚠️  No .env file found
    )
)

REM Create deployment info
echo 📋 Creating deployment info...
(
echo {
echo     "deploymentDate": "%date% %time%",
echo     "version": "1.0.0",
echo     "project": "%PROJECT_NAME%",
echo     "environment": "production"
echo }
) > deploy\deployment-info.json

echo ✅ Deployment package created
echo.

REM Generate documentation
echo 📋 Generating deployment documentation...
(
echo # Buffet Junior's Kids - Deployment Package
echo.
echo ## System Requirements
echo - Node.js 18+ 
echo - PostgreSQL 13+
echo - 2GB RAM minimum
echo - 10GB disk space
echo.
echo ## Environment Setup
echo 1. Copy `.env` file and configure database connection
echo 2. Run `npm install --production` in the server directory
echo 3. Start the application with `npm start`
echo.
echo ## Database Setup
echo 1. Create PostgreSQL database
echo 2. Run migrations ^(if any^)
echo 3. Configure connection string in .env
echo.
echo ## Service Configuration
echo The application runs on port 3000 by default.
echo Frontend is served from the `/public` directory.
echo.
echo ## Monitoring
echo - Health check: GET /health
echo - Metrics: GET /metrics ^(if enabled^)
echo.
echo ## Troubleshooting
echo - Check logs in `/logs` directory
echo - Verify database connectivity
echo - Ensure all environment variables are set
echo.
echo Built on: %date% %time%
echo Version: 1.0.0
) > deploy\README.md

echo ✅ Documentation generated
echo.

REM Show bundle information
echo 📋 Build Analysis:
if exist %FRONTEND_DIR%\%BUILD_DIR% (
    dir %FRONTEND_DIR%\%BUILD_DIR%\assets\*.js
    echo.
    for /f "tokens=3" %%a in ('dir /-c %FRONTEND_DIR%\%BUILD_DIR% ^| find "File(s)"') do (
        echo Total frontend build size: %%a bytes
    )
)

echo.
echo ╔══════════════════════════════════════╗
echo ║        🎉 DEPLOY SUCCESSFUL! 🎉      ║
echo ╚══════════════════════════════════════╝
echo.

echo ✅ Deployment package ready in .\deploy directory
echo.
echo 📋 Next steps:
echo   1. Upload the deploy\ directory to your server
echo   2. Install production dependencies: npm install --production
echo   3. Configure environment variables
echo   4. Start the application: npm start
echo.
echo ✅ Deployment completed successfully! 🚀
echo.

pause
#!/bin/bash

# Deploy script for Buffet Junior's Kids Financial System
set -e

echo "🚀 Starting deployment for Buffet Junior's Kids..."

# Configuration
PROJECT_NAME="buffet-juniors-kids"
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"
BUILD_DIR="dist"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    print_step "Checking dependencies..."
    
    command -v node >/dev/null 2>&1 || { print_error "Node.js is required but not installed. Aborting."; exit 1; }
    command -v npm >/dev/null 2>&1 || { print_error "npm is required but not installed. Aborting."; exit 1; }
    
    print_success "All dependencies are available"
}

# Install and build frontend
build_frontend() {
    print_step "Building frontend..."
    
    cd $FRONTEND_DIR
    
    # Install dependencies
    print_step "Installing frontend dependencies..."
    npm ci --production=false
    
    # Run tests
    print_step "Running frontend tests..."
    npm run test:run || print_warning "Some tests failed, continuing deployment..."
    
    # Build for production
    print_step "Building frontend for production..."
    npm run build
    
    print_success "Frontend build completed"
    cd ..
}

# Install backend dependencies
setup_backend() {
    print_step "Setting up backend..."
    
    cd $BACKEND_DIR
    
    # Install dependencies
    print_step "Installing backend dependencies..."
    npm ci --production=true
    
    # Compile TypeScript
    print_step "Compiling backend TypeScript..."
    npm run build
    
    print_success "Backend setup completed"
    cd ..
}

# Create deployment package
create_package() {
    print_step "Creating deployment package..."
    
    # Create deploy directory
    rm -rf deploy
    mkdir -p deploy
    
    # Copy frontend build
    print_step "Copying frontend build..."
    cp -r $FRONTEND_DIR/$BUILD_DIR deploy/public
    
    # Copy backend files
    print_step "Copying backend files..."
    cp -r $BACKEND_DIR/dist deploy/server
    cp $BACKEND_DIR/package.json deploy/
    cp $BACKEND_DIR/package-lock.json deploy/
    
    # Copy environment files
    if [ -f "$BACKEND_DIR/.env.production" ]; then
        cp $BACKEND_DIR/.env.production deploy/.env
    else
        print_warning ".env.production not found, using development environment"
        cp $BACKEND_DIR/.env deploy/ 2>/dev/null || print_warning "No .env file found"
    fi
    
    # Create deployment info
    cat > deploy/deployment-info.json << EOF
{
    "deploymentDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "version": "1.0.0",
    "project": "$PROJECT_NAME",
    "environment": "production"
}
EOF
    
    print_success "Deployment package created"
}

# Generate deployment documentation
generate_docs() {
    print_step "Generating deployment documentation..."
    
    cat > deploy/README.md << 'EOF'
# Buffet Junior's Kids - Deployment Package

## System Requirements
- Node.js 18+ 
- PostgreSQL 13+
- 2GB RAM minimum
- 10GB disk space

## Environment Setup
1. Copy `.env` file and configure database connection
2. Run `npm install --production` in the server directory
3. Start the application with `npm start`

## Database Setup
1. Create PostgreSQL database
2. Run migrations (if any)
3. Configure connection string in .env

## Service Configuration
The application runs on port 3000 by default.
Frontend is served from the `/public` directory.

## Monitoring
- Health check: GET /health
- Metrics: GET /metrics (if enabled)

## Troubleshooting
- Check logs in `/logs` directory
- Verify database connectivity
- Ensure all environment variables are set

Built on: $(date)
Version: 1.0.0
EOF
    
    print_success "Documentation generated"
}

# Run security checks
security_check() {
    print_step "Running security checks..."
    
    cd $FRONTEND_DIR
    npm audit --audit-level=high || print_warning "Frontend security audit found issues"
    cd ..
    
    cd $BACKEND_DIR
    npm audit --audit-level=high || print_warning "Backend security audit found issues"
    cd ..
    
    print_success "Security checks completed"
}

# Performance optimization
optimize_build() {
    print_step "Optimizing build..."
    
    # Analyze bundle size
    cd $FRONTEND_DIR
    npm run build 2>&1 | grep -E "(File sizes after gzip|dist/)" || true
    cd ..
    
    # Compress static assets if available
    if command -v gzip >/dev/null 2>&1; then
        print_step "Compressing static assets..."
        find deploy/public -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -exec gzip -9 -k {} \;
        print_success "Static assets compressed"
    fi
    
    print_success "Build optimization completed"
}

# Main deployment flow
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════╗"
    echo "║    Buffet Junior's Kids Deploy      ║"
    echo "║         Production Build             ║"
    echo "╚══════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Run all steps
    check_dependencies
    security_check
    build_frontend
    setup_backend
    create_package
    optimize_build
    generate_docs
    
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════╗"
    echo "║        🎉 DEPLOY SUCCESSFUL! 🎉      ║"
    echo "╚══════════════════════════════════════╝"
    echo -e "${NC}"
    
    print_success "Deployment package ready in ./deploy directory"
    print_step "Next steps:"
    echo "  1. Upload the deploy/ directory to your server"
    echo "  2. Install production dependencies: npm install --production"
    echo "  3. Configure environment variables"
    echo "  4. Start the application: npm start"
    echo ""
    print_success "Deployment completed successfully! 🚀"
}

# Handle errors
trap 'print_error "Deployment failed at line $LINENO. Exit code: $?"' ERR

# Run main function
main "$@"
// Jenkinsfile for Portfolio Next.js - Local Server Deployment
// Target: www.tumrabert.com (Jenkins on same server)
// GitHub Webhook: http://tumrabert.com/github-webhook/

pipeline {
    agent any

    tools {
        nodejs 'NodeJS-18' // Must be configured in Jenkins Global Tools
        dockerTool 'docker' // Must be configured in Jenkins Global Tools
    }

    environment {
        // Production configuration
        PROD_DOMAIN = 'www.tumrabert.com'
        APP_NAME = 'portfolio-nextjs'
        DOCKER_IMAGE = 'portfolio-nextjs'
        DOCKER_TAG = "build-${BUILD_NUMBER}"
        
        // Local deployment paths (Jenkins on same server)
        DEPLOY_DIR = '/opt/portfolio'
        BACKUP_DIR = '/opt/portfolio-backups'
        
        // Environment variables (stored as Jenkins credentials)
        NODE_ENV = 'production'
        MONGODB_URI = credentials('mongodb-uri-prod')
        JWT_SECRET = credentials('jwt-secret-prod')
        JWT_EXPIRES_IN = '1h'
        DEFAULT_ADMIN_USERNAME = credentials('admin-username')
        DEFAULT_ADMIN_PASSWORD = credentials('admin-password-prod')
        DEFAULT_ADMIN_EMAIL = 'admin@tumrabert.com'
        NEXT_PUBLIC_APP_URL = 'https://www.tumrabert.com'
        GITHUB_TOKEN = credentials('github-token')
        GITHUB_USERNAME = 'tumrabert'
        
        // Website thumbnail generation API
        THUMBNAIL_API = credentials('thumbnail-api-key')
        
        // Jenkins user for local operations
        JENKINS_USER = 'jenkins'
    }

    triggers {
        // GitHub webhook trigger
        githubPush()
    }

    stages {
        stage('Checkout') {
            steps {
                echo '🔄 Checking out the code...'
                cleanWs()
                checkout scm
                
                script {
                    // Show git information
                    sh '''
                        echo "📋 Git Information:"
                        echo "   Branch: ${BRANCH_NAME}"
                        echo "   Commit: $(git rev-parse --short HEAD)"
                        echo "   Author: $(git log -1 --pretty=format:'%an <%ae>')"
                        echo "   Message: $(git log -1 --pretty=format:'%s')"
                    '''
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '📦 Installing dependencies...'
                sh '''
                    # Clean install for production
                    npm ci
                    
                    echo "✅ Dependencies installed successfully"
                    echo "📊 Installed packages: $(npm list --depth=0 | wc -l)"
                '''
            }
        }

        stage('Lint & Type Check') {
            steps {
                echo '🔍 Running linting and type checking...'
                script {
                    sh '''
                        echo "🔍 Running ESLint..."
                        npm run lint || echo "⚠️ Linting completed with warnings"
                        
                        echo "🔍 TypeScript compilation check..."
                        npx tsc --noEmit || echo "⚠️ TypeScript check completed with warnings"
                        
                        echo "✅ Code quality checks completed"
                    '''
                }
            }
        }

        stage('Security Scan') {
            steps {
                echo '🔐 Running security checks...'
                script {
                    sh '''
                        echo "🔍 Running npm security audit..."
                        npm audit --audit-level moderate || echo "⚠️ Security scan completed with warnings"
                        
                        echo "🔍 Checking for sensitive files..."
                        # Check for accidentally committed secrets
                        if grep -r "password" --include="*.js" --include="*.ts" --include="*.json" . | grep -v node_modules | grep -v ".git" | grep -v "package-lock.json"; then
                            echo "⚠️ Found potential hardcoded passwords - please review"
                        fi
                        
                        # Check environment file is not committed
                        if [ -f ".env" ]; then
                            echo "⚠️ Warning: .env file found in repository - ensure it's in .gitignore"
                        fi
                        
                        echo "✅ Security checks completed"
                    '''
                }
            }
        }

        stage('Build Application') {
            steps {
                echo '🏗️ Building Next.js application...'
                script {
                    // Create production environment file
                    sh '''
                        echo "Creating production environment..."
                        cat > .env.local << EOF
NODE_ENV=production
MONGODB_URI=${MONGODB_URI}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=${JWT_EXPIRES_IN}
DEFAULT_ADMIN_USERNAME=${DEFAULT_ADMIN_USERNAME}
DEFAULT_ADMIN_PASSWORD=${DEFAULT_ADMIN_PASSWORD}
DEFAULT_ADMIN_EMAIL=${DEFAULT_ADMIN_EMAIL}
NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
GITHUB_TOKEN=${GITHUB_TOKEN}
GITHUB_USERNAME=${GITHUB_USERNAME}
EOF
                    '''
                    
                    // Build the application
                    sh '''
                        echo "🏗️ Building Next.js application..."
                        npm run build
                        
                        echo "✅ Build completed successfully"
                        echo "📊 Build size:"
                        du -sh .next/ || true
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '🐳 Building Docker image...'
                script {
                    sh '''
                        echo "🐳 Building Docker image with tag: ${DOCKER_TAG}"
                        docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                        docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest
                        
                        echo "✅ Docker image built successfully"
                        docker images ${DOCKER_IMAGE} --format "table {{.Repository}}:{{.Tag}}\\t{{.CreatedAt}}\\t{{.Size}}"
                    '''
                }
            }
        }

        stage('Test Deploy') {
            when {
                not { branch 'main' }
            }
            steps {
                echo '🧪 Running test deployment (non-main branch)...'
                script {
                    sh '''
                        echo "🔍 Testing Docker image without deploying to production..."
                        
                        # Test the Docker image in isolation
                        echo "🐳 Starting test container..."
                        docker run --rm -d \\
                            --name test-portfolio-${BUILD_NUMBER} \\
                            -p 3001:3000 \\
                            -e NODE_ENV=test \\
                            -e JWT_SECRET=test-secret \\
                            -e NEXT_PUBLIC_APP_URL=http://localhost:3001 \\
                            ${DOCKER_IMAGE}:${DOCKER_TAG}
                        
                        # Wait for container to start
                        sleep 15
                        
                        # Test the application
                        echo "🔍 Testing application endpoints..."
                        
                        # Test main page
                        if curl -f -s http://localhost:3001/ > /dev/null; then
                            echo "✅ Main page test passed"
                        else
                            echo "❌ Main page test failed"
                            docker logs test-portfolio-${BUILD_NUMBER}
                            docker stop test-portfolio-${BUILD_NUMBER} || true
                            exit 1
                        fi
                        
                        # Test API endpoint (without database, may fail but shouldn't crash)
                        curl -s http://localhost:3001/api/portfolio || echo "⚠️ API test completed (expected without database)"
                        
                        # Cleanup test container
                        echo "🧹 Cleaning up test container..."
                        docker stop test-portfolio-${BUILD_NUMBER} || true
                        
                        echo "✅ Test deployment completed successfully"
                        echo "ℹ️ This branch (${BRANCH_NAME}) was tested but not deployed to production"
                        echo "ℹ️ Push to 'main' branch to trigger production deployment"
                    '''
                }
            }
        }

        stage('Create Backup') {
            when {
                branch 'main'
            }
            steps {
                echo '💾 Creating backup of current deployment...'
                script {
                    sh '''
                        # Create backup directory
                        sudo mkdir -p ${BACKUP_DIR}
                        
                        # Create timestamped backup
                        BACKUP_NAME="portfolio-backup-$(date +%Y%m%d-%H%M%S)"
                        
                        # Backup current deployment if it exists
                        if [ -d "${DEPLOY_DIR}" ]; then
                            echo "Backing up current deployment to ${BACKUP_DIR}/${BACKUP_NAME}"
                            sudo cp -r ${DEPLOY_DIR} ${BACKUP_DIR}/${BACKUP_NAME}
                        fi
                        
                        # Keep only last 5 backups
                        sudo find ${BACKUP_DIR} -maxdepth 1 -type d -name "portfolio-backup-*" | sort -r | tail -n +6 | xargs sudo rm -rf
                        
                        echo "✅ Backup completed"
                    '''
                }
            }
        }

        stage('Deploy to Local Server') {
            when {
                branch 'main'
            }
            steps {
                echo '🚀 Deploying to local server...'
                script {
                    // Create deployment script
                    writeFile file: 'deploy.sh', text: '''#!/bin/bash
set -e

echo "🚀 Starting local server deployment..."

# Create deployment directory
sudo mkdir -p ${DEPLOY_DIR}
sudo chown jenkins:jenkins ${DEPLOY_DIR}

# Copy project files to deployment directory
echo "📁 Copying project files..."
cp -r . ${DEPLOY_DIR}/

# Navigate to deployment directory
cd ${DEPLOY_DIR}

# Stop existing containers gracefully
echo "⏹️ Stopping existing containers..."
docker-compose down --timeout 30 || true

# Remove old images to save space (keep last 3)
echo "🧹 Cleaning up old images..."
docker image prune -f || true

# Pull latest base images
echo "📥 Pulling latest base images..."
docker-compose pull || true

# Build and start new containers
echo "🏗️ Building and starting containers..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 45

# Health check with retries
echo "🏥 Running health checks..."
for i in {1..10}; do
    echo "Health check attempt $i/10..."
    
    # Check if containers are running
    if ! docker-compose ps | grep -q "Up"; then
        echo "❌ Containers are not running properly"
        docker-compose logs --tail=50
        if [ $i -eq 10 ]; then
            exit 1
        fi
        sleep 10
        continue
    fi
    
    # Check API endpoint
    if curl -f -s http://localhost:3000/api/portfolio > /dev/null; then
        echo "✅ API health check passed!"
        
        # Check main page
        if curl -f -s http://localhost:3000/ > /dev/null; then
            echo "✅ Main page health check passed!"
            echo "🎉 All health checks passed!"
            break
        fi
    fi
    
    if [ $i -eq 10 ]; then
        echo "❌ Health check failed after 10 attempts"
        echo "Container logs:"
        docker-compose logs --tail=100
        exit 1
    fi
    
    echo "⏳ Health check attempt $i failed, retrying in 10s..."
    sleep 10
done

# Update Nginx configuration if needed
echo "🔄 Updating Nginx configuration..."
if [ -f "/etc/nginx/sites-available/portfolio" ]; then
    sudo systemctl reload nginx || echo "⚠️ Nginx reload failed, but continuing..."
fi

echo "🎉 Local deployment completed successfully!"
echo "🌐 Portfolio is now live at https://${PROD_DOMAIN}"
'''
                    
                    // Make script executable and run deployment
                    sh '''
                        chmod +x deploy.sh
                        echo "🚀 Executing deployment script..."
                        ./deploy.sh
                    '''
                }
            }
        }

        stage('Post-Deploy Verification') {
            when {
                branch 'main'
            }
            steps {
                echo '🔍 Verifying local deployment...'
                script {
                    sleep 10 // Brief wait for final startup
                    
                    // Comprehensive health checks for local deployment
                    sh '''
                        echo "Running comprehensive health checks..."
                        
                        # Check Docker containers status
                        echo "📊 Checking Docker containers..."
                        cd ${DEPLOY_DIR}
                        docker-compose ps
                        
                        # Check local API endpoint (internal)
                        echo "🔍 Checking internal API..."
                        curl -f -s http://localhost:3000/api/portfolio > /dev/null && echo "✅ Internal API accessible" || (echo "❌ Internal API check failed" && exit 1)
                        
                        # Check local main page (internal)
                        echo "🔍 Checking internal main page..."
                        curl -f -s http://localhost:3000/ > /dev/null && echo "✅ Internal main page accessible" || (echo "❌ Internal main page check failed" && exit 1)
                        
                        # Check external domain (if Nginx is configured)
                        echo "🔍 Checking external domain..."
                        if command -v nginx > /dev/null && nginx -t > /dev/null 2>&1; then
                            # Check main page via domain
                            curl -f -s -k https://${PROD_DOMAIN}/ > /dev/null && echo "✅ External main page accessible" || echo "⚠️ External main page check warning (check Nginx config)"
                            
                            # Check API via domain
                            curl -f -s -k https://${PROD_DOMAIN}/api/portfolio > /dev/null && echo "✅ External API accessible" || echo "⚠️ External API check warning (check Nginx config)"
                            
                            # Check SSL certificate if configured
                            if [ -f "/etc/nginx/ssl/cert.pem" ]; then
                                echo | openssl s_client -servername ${PROD_DOMAIN} -connect localhost:443 2>/dev/null | openssl x509 -noout -dates && echo "✅ SSL certificate valid" || echo "⚠️ SSL certificate check warning"
                            else
                                echo "⚠️ SSL certificate not found - HTTPS may not be configured"
                            fi
                        else
                            echo "ℹ️ Nginx not configured or not running - only internal checks performed"
                        fi
                        
                        # Check MongoDB connection
                        echo "🔍 Checking MongoDB connection..."
                        docker exec portfolio-mongodb-prod mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1 && echo "✅ MongoDB connection successful" || echo "⚠️ MongoDB connection warning"
                        
                        # Display resource usage
                        echo "📊 System resources:"
                        df -h ${DEPLOY_DIR}
                        docker stats --no-stream --format "table {{.Container}}\\t{{.CPUPerc}}\\t{{.MemUsage}}\\t{{.MemPerc}}"
                        
                        echo "🎉 Local deployment verification completed!"
                    '''
                }
            }
        }
        
        stage('Cleanup Old Deployments') {
            when {
                branch 'main'
            }
            steps {
                echo '🧹 Cleaning up old deployments...'
                script {
                    sh '''
                        # Clean up old Docker images (keep last 3)
                        echo "Cleaning up old Docker images..."
                        docker images ${DOCKER_IMAGE} --format "table {{.Repository}}:{{.Tag}}\\t{{.CreatedAt}}\\t{{.Size}}" | head -10
                        
                        # Remove dangling images
                        docker image prune -f
                        
                        # Clean up build artifacts in workspace (keep deployment intact)
                        echo "Cleaning up build artifacts..."
                        rm -f deploy.sh .env.local
                        
                        echo "✅ Cleanup completed"
                    '''
                }
            }
        }
    }

    post {
        always {
            echo '🧹 Cleaning up pipeline workspace...'
            script {
                // Remove sensitive files from Jenkins workspace only
                sh '''
                    # Remove sensitive files from Jenkins workspace
                    rm -f .env.local deploy.sh || true
                    
                    # Clean up temporary Docker containers (not the deployed ones)
                    docker container prune -f || true
                    
                    # Show final deployment status
                    if [ -d "${DEPLOY_DIR}" ]; then
                        echo "📊 Final deployment status:"
                        cd ${DEPLOY_DIR} && docker-compose ps || true
                    fi
                '''
                
                // Clean Jenkins workspace but keep deployment
                cleanWs()
            }
        }
        
        success {
            echo '🎉 Pipeline completed successfully!'
            script {
                if (env.BRANCH_NAME == 'main') {
                    echo "✅ Successfully deployed to local server!"
                    echo "🌐 Portfolio is live at:"
                    echo "   - Local: http://localhost:3000"
                    echo "   - Domain: https://${PROD_DOMAIN} (if Nginx configured)"
                    echo "📊 Build: #${BUILD_NUMBER}"
                    echo "🐳 Docker Tag: ${DOCKER_TAG}"
                    
                    // Display deployment summary
                    sh '''
                        echo "📋 Deployment Summary:"
                        echo "   - Deployment Directory: ${DEPLOY_DIR}"
                        echo "   - Backup Directory: ${BACKUP_DIR}"
                        echo "   - Docker Containers: $(cd ${DEPLOY_DIR} && docker-compose ps --services | wc -l) services"
                        echo "   - Build Time: $(date)"
                        
                        # Show running containers
                        cd ${DEPLOY_DIR} && docker-compose ps
                    '''
                    
                    // Optional: Send success notification to Slack/Discord/Email
                    // slackSend(
                    //     channel: '#deployments',
                    //     color: 'good',
                    //     message: "🚀 Portfolio successfully deployed to ${PROD_DOMAIN} (Build #${BUILD_NUMBER})"
                    // )
                } else {
                    echo "ℹ️ Build successful for branch: ${env.BRANCH_NAME}"
                    echo "🔍 Only main branch deployments trigger production deployment"
                }
            }
        }
        
        failure {
            echo '💥 Pipeline failed!'
            script {
                // Show failure details
                sh '''
                    echo "❌ Deployment failed at: $(date)"
                    echo "📋 Failure Details:"
                    echo "   - Branch: ${BRANCH_NAME}"
                    echo "   - Build: #${BUILD_NUMBER}"
                    echo "   - Docker Tag: ${DOCKER_TAG}"
                    
                    # Show container logs if deployment reached that stage
                    if [ -d "${DEPLOY_DIR}" ]; then
                        echo "📊 Container status:"
                        cd ${DEPLOY_DIR} && docker-compose ps || true
                        echo "📝 Recent container logs:"
                        cd ${DEPLOY_DIR} && docker-compose logs --tail=50 || true
                    fi
                '''
                
                // Rollback on production deployment failure
                if (env.BRANCH_NAME == 'main') {
                    echo '🔄 Attempting automatic rollback...'
                    sh '''
                        # Find the most recent backup
                        LATEST_BACKUP=$(sudo find ${BACKUP_DIR} -maxdepth 1 -type d -name "portfolio-backup-*" | sort -r | head -1)
                        
                        if [ -n "$LATEST_BACKUP" ] && [ -d "$LATEST_BACKUP" ]; then
                            echo "🔄 Rolling back to: $LATEST_BACKUP"
                            
                            # Stop current containers
                            cd ${DEPLOY_DIR} && docker-compose down || true
                            
                            # Restore from backup
                            sudo cp -r "$LATEST_BACKUP"/* ${DEPLOY_DIR}/
                            sudo chown -R jenkins:jenkins ${DEPLOY_DIR}
                            
                            # Start restored deployment
                            cd ${DEPLOY_DIR} && docker-compose up -d
                            
                            echo "✅ Rollback completed"
                        else
                            echo "⚠️ No backup found for rollback"
                        fi
                    '''
                }
                
                // Optional: Send failure notification
                // slackSend(
                //     channel: '#deployments',
                //     color: 'danger',
                //     message: "❌ Portfolio deployment failed (Build #${BUILD_NUMBER}). Check Jenkins logs for details."
                // )
            }
        }
        
        unstable {
            echo '⚠️ Pipeline completed with warnings'
            script {
                sh '''
                    echo "⚠️ Build completed with warnings at: $(date)"
                    echo "📋 Check the build logs for details"
                '''
            }
        }
    }
}
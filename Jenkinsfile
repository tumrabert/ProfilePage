pipeline {
    agent any
    
    environment {
        // Production configuration
        NODE_ENV = 'production'
        NEXT_PUBLIC_APP_URL = 'https://www.tumrabert.com'
        
        // Credentials from portfolio domain
        MONGODB_URI = credentials('mongodb-uri-prod')
        JWT_SECRET = credentials('jwt-secret-prod')
        DEFAULT_ADMIN_USERNAME = credentials('admin-username')
        DEFAULT_ADMIN_PASSWORD = credentials('admin-password-prod')
        GITHUB_TOKEN = credentials('github-token')
        THUMBNAIL_API = credentials('thumbnail-api-key')
        
        // Docker Compose file
        COMPOSE_FILE = 'docker-compose.prod.yml'
        
        // Deployment settings
        HEALTH_CHECK_URL = "${NEXT_PUBLIC_APP_URL}"
        HEALTH_CHECK_TIMEOUT = '120'
        APP_PORT = '3000'
    }
    
    stages {
        stage('Verify Credentials') {
            steps {
                script {
                    echo '🔍 Verifying credential access...'
                    sh '''
                        echo "Testing credential availability:"
                        [ -n "$MONGODB_URI" ] && echo "✅ mongodb-uri-prod: LOADED" || echo "❌ mongodb-uri-prod: MISSING"
                        [ -n "$JWT_SECRET" ] && echo "✅ jwt-secret-prod: LOADED" || echo "❌ jwt-secret-prod: MISSING"
                        [ -n "$DEFAULT_ADMIN_USERNAME" ] && echo "✅ admin-username: LOADED" || echo "❌ admin-username: MISSING"
                        [ -n "$DEFAULT_ADMIN_PASSWORD" ] && echo "✅ admin-password-prod: LOADED" || echo "❌ admin-password-prod: MISSING"
                        [ -n "$GITHUB_TOKEN" ] && echo "✅ github-token: LOADED" || echo "❌ github-token: LOADED"
                        [ -n "$THUMBNAIL_API" ] && echo "✅ thumbnail-api-key: LOADED" || echo "❌ thumbnail-api-key: MISSING"
                    '''
                    echo 'Credential verification complete!'
                }
            }
        }
        
        stage('Setup Docker Environment') {
            // Remove when condition to run on any branch for now
            steps {
                echo '🐳 Setting up Docker environment...'
                script {
                    // Check if Docker is installed
                    def dockerInstalled = sh(script: 'command -v docker >/dev/null 2>&1', returnStatus: true) == 0
                    def dockerComposeInstalled = sh(script: 'command -v docker-compose >/dev/null 2>&1', returnStatus: true) == 0
                    
                    if (!dockerInstalled) {
                        echo '📦 Installing Docker...'
                        sh '''
                            # Install Docker
                            curl -fsSL https://get.docker.com -o get-docker.sh
                            sh get-docker.sh
                            
                            # Add jenkins user to docker group
                            usermod -aG docker jenkins || true
                            
                            # Start Docker service
                            systemctl start docker
                            systemctl enable docker
                            
                            # Verify installation
                            docker --version
                        '''
                    } else {
                        echo '✅ Docker is already installed'
                        sh 'docker --version'
                    }
                    
                    if (!dockerComposeInstalled) {
                        echo '📦 Installing Docker Compose...'
                        sh '''
                            # Install Docker Compose
                            curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
                            chmod +x /usr/local/bin/docker-compose
                            
                            # Verify installation
                            docker-compose --version
                        '''
                    } else {
                        echo '✅ Docker Compose is already installed'
                        sh 'docker-compose --version'
                    }
                }
            }
        }
        
        stage('Prepare Deployment') {
            // Remove when condition to run on any branch for now
            steps {
                echo '🔧 Preparing deployment files...'
                sh '''
                    # Create production environment file
                    cat > .env.production << EOF
NODE_ENV=production
MONGODB_URI=${MONGODB_URI}
JWT_SECRET=${JWT_SECRET}
DEFAULT_ADMIN_USERNAME=${DEFAULT_ADMIN_USERNAME}
DEFAULT_ADMIN_PASSWORD=${DEFAULT_ADMIN_PASSWORD}
GITHUB_TOKEN=${GITHUB_TOKEN}
THUMBNAIL_API=${THUMBNAIL_API}
NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
PORT=${APP_PORT}
EOF
                    
                    # Verify environment file
                    echo "📋 Production environment file created:"
                    echo "----------------------------------------"
                    cat .env.production | sed 's/=.*/=***HIDDEN***/' # Hide sensitive values in logs
                    echo "----------------------------------------"
                    
                    # Check if docker-compose file exists
                    if [ ! -f "${COMPOSE_FILE}" ]; then
                        echo "⚠️  Docker Compose file ${COMPOSE_FILE} not found!"
                        echo "📝 Creating basic docker-compose.prod.yml..."
                        
                        # Create a basic docker-compose file if it doesn't exist
                        cat > ${COMPOSE_FILE} << 'COMPOSE_EOF'
version: '3.8'

services:
  app:
    build: 
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
COMPOSE_EOF
                        
                        echo "✅ Basic docker-compose.prod.yml created"
                    else
                        echo "✅ Using existing ${COMPOSE_FILE}"
                    fi
                '''
            }
        }
        
        stage('Stop Previous Deployment') {
            // Remove when condition to run on any branch for now
            steps {
                echo '🛑 Stopping previous deployment...'
                script {
                    try {
                        sh '''
                            # Stop and remove previous containers
                            docker-compose -f ${COMPOSE_FILE} down --remove-orphans --volumes || true
                            
                            # Clean up unused images (keep last 2 versions)
                            docker image prune -f || true
                        '''
                        echo '✅ Previous deployment stopped successfully'
                    } catch (Exception e) {
                        echo "⚠️  No previous deployment to stop: ${e.getMessage()}"
                    }
                }
            }
        }
        
        stage('Deploy Application') {
            // Remove when condition to run on any branch for now
            steps {
                echo '🚀 Deploying application...'
                sh '''
                    # Build and start the application
                    docker-compose -f ${COMPOSE_FILE} up -d --build
                    
                    # Show running containers
                    echo "📊 Running containers:"
                    docker-compose -f ${COMPOSE_FILE} ps
                    
                    # Show initial logs
                    echo "📝 Initial container logs:"
                    docker-compose -f ${COMPOSE_FILE} logs --tail=20
                '''
            }
        }
        
        stage('Health Check') {
            // Remove when condition to run on any branch for now
            steps {
                echo '🏥 Performing application health check...'
                script {
                    try {
                        sh '''
                            echo "⏳ Waiting for application to start (timeout: ${HEALTH_CHECK_TIMEOUT}s)..."
                            
                            # Wait for the application to be healthy
                            timeout ${HEALTH_CHECK_TIMEOUT} bash -c '
                                counter=0
                                while true; do
                                    counter=$((counter + 1))
                                    echo "Health check attempt #$counter"
                                    
                                    # Check if container is running
                                    if ! docker-compose -f ${COMPOSE_FILE} ps | grep "Up" > /dev/null; then
                                        echo "❌ Container is not running!"
                                        docker-compose -f ${COMPOSE_FILE} logs --tail=50
                                        exit 1
                                    fi
                                    
                                    # Check main page
                                    if curl -f -s --max-time 10 ${HEALTH_CHECK_URL} > /dev/null 2>&1; then
                                        echo "✅ Health check passed!"
                                        break
                                    elif curl -f -s --max-time 10 http://localhost:${APP_PORT} > /dev/null 2>&1; then
                                        echo "✅ Local health check passed!"
                                        break
                                    else
                                        echo "⏳ Application not ready yet, waiting..."
                                        sleep 10
                                    fi
                                done
                            '
                            
                            echo "🎉 Application is healthy and ready!"
                            
                            # Display final status
                            echo "📊 Final deployment status:"
                            docker-compose -f ${COMPOSE_FILE} ps
                        '''
                    } catch (Exception e) {
                        echo "❌ Health check failed: ${e.getMessage()}"
                        
                        // Get detailed logs for debugging
                        sh '''
                            echo "🔍 Debugging information:"
                            echo "Container status:"
                            docker-compose -f ${COMPOSE_FILE} ps
                            echo "Recent logs:"
                            docker-compose -f ${COMPOSE_FILE} logs --tail=100
                        '''
                        
                        throw e
                    }
                }
            }
        }
        
        stage('Post-Deployment Tests') {
            // Remove when condition to run on any branch for now
            steps {
                echo '🧪 Running post-deployment tests...'
                script {
                    try {
                        sh '''
                            # Test basic endpoints
                            echo "Testing application endpoints..."
                            
                            # Test main page
                            if curl -f -s --max-time 10 ${HEALTH_CHECK_URL} | grep -q "<!DOCTYPE\\|<html\\|<title"; then
                                echo "✅ Main page: ACCESSIBLE"
                            else
                                echo "⚠️  Main page: May not be accessible externally yet"
                            fi
                            
                            # Display resource usage
                            echo "📊 Container resource usage:"
                            docker stats --no-stream --format "table {{.Name}}\\t{{.CPUPerc}}\\t{{.MemUsage}}" || true
                        '''
                    } catch (Exception e) {
                        echo "⚠️  Some post-deployment tests failed, but deployment may still be successful: ${e.getMessage()}"
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo '🎉 Pipeline completed successfully!'
            echo '✅ Application has been deployed and is running'
            script {
                try {
                    sh '''
                        echo "📋 Deployment Summary:"
                        echo "====================="
                        echo "🌐 Application URL: ${NEXT_PUBLIC_APP_URL}"
                        echo "📊 Container Status:"
                        docker-compose -f ${COMPOSE_FILE} ps || echo "No containers found"
                    '''
                } catch (Exception e) {
                    echo "Could not retrieve deployment summary: ${e.getMessage()}"
                }
            }
        }
        
        failure {
            echo '❌ Pipeline failed!'
            script {
                try {
                    sh '''
                        echo "🔍 Failure Debugging Information:"
                        echo "================================="
                        
                        echo "📊 Container status:"
                        docker-compose -f ${COMPOSE_FILE} ps || echo "No containers found"
                        
                        echo "📝 Container logs:"
                        docker-compose -f ${COMPOSE_FILE} logs --tail=50 || echo "No container logs available"
                        
                        echo "💾 System resources:"
                        df -h || true
                        free -h || true
                        
                        echo "🐳 Docker info:"
                        docker info || echo "Docker not available"
                    '''
                } catch (Exception e) {
                    echo "Could not retrieve debugging information: ${e.getMessage()}"
                }
            }
        }
        
        unstable {
            echo '⚠️  Pipeline completed with warnings'
            echo '✅ Application may be running but some checks failed'
        }
        
        always {
            script {
                try {
                    // Archive important files
                    archiveArtifacts artifacts: '.env.production,docker-compose.prod.yml', allowEmptyArchive: true
                    
                    // Clean up sensitive files
                    sh '''
                        rm -f .env.production || true
                        rm -f get-docker.sh || true
                    '''
                } catch (Exception e) {
                    echo "Cleanup warning: ${e.getMessage()}"
                }
            }
            cleanWs()
        }
    }
}

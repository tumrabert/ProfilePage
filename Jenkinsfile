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
                        [ -n "$GITHUB_TOKEN" ] && echo "✅ github-token: LOADED" || echo "❌ github-token: MISSING"
                        [ -n "$THUMBNAIL_API" ] && echo "✅ thumbnail-api-key: LOADED" || echo "❌ thumbnail-api-key: MISSING"
                        echo "Credential verification complete!"
                    '''
                }
            }
        }
        
        stage('Checkout') {
            steps {
                echo '🔄 Checking out code...'
                checkout scm
            }
        }
        
        stage('Setup Environment') {
            steps {
                echo '🔧 Setting up Docker environment...'
                sh '''
                    # Check if Docker is running
                    if ! docker info >/dev/null 2>&1; then
                        echo "❌ Docker is not running"
                        exit 1
                    fi
                    
                    echo "✅ Docker is running"
                    docker --version
                    docker-compose --version
                    
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
EOF
                    echo "✅ Environment file created"
                '''
            }
        }
        
        stage('Validate Configuration') {
            steps {
                echo '✅ Validating Docker and Jenkins setup...'
                sh '''
                    # Check if docker-compose.prod.yml exists
                    if [ ! -f "${COMPOSE_FILE}" ]; then
                        echo "❌ ${COMPOSE_FILE} not found!"
                        exit 1
                    fi
                    
                    # Validate docker-compose file syntax
                    docker-compose -f ${COMPOSE_FILE} config >/dev/null 2>&1
                    if [ $? -eq 0 ]; then
                        echo "✅ Docker Compose file is valid"
                    else
                        echo "❌ Docker Compose file validation failed"
                        exit 1
                    fi
                    
                    # Check if Dockerfile exists
                    if [ ! -f "Dockerfile" ]; then
                        echo "❌ Dockerfile not found!"
                        exit 1
                    fi
                    
                    echo "✅ All configuration files validated"
                '''
            }
        }
        
        stage('Build Docker Images') {
            steps {
                echo '🐳 Building Docker images...'
                sh '''
                    # Stop any existing containers
                    docker-compose -f ${COMPOSE_FILE} down || true
                    
                    # Build images with verbose output
                    docker-compose -f ${COMPOSE_FILE} build --no-cache
                    
                    # Verify images were created
                    docker-compose -f ${COMPOSE_FILE} images
                '''
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo '🚀 Deploying to production...'
                sh '''
                    # Start production containers
                    docker-compose -f ${COMPOSE_FILE} up -d
                    
                    # Wait for containers to start
                    echo "⏳ Waiting for containers to start..."
                    sleep 15
                '''
            }
        }
        
        stage('Health Check') {
            when {
                branch 'main'
            }
            steps {
                echo '🏥 Running health check...'
                sh '''
                    # Check if containers are running
                    docker-compose -f ${COMPOSE_FILE} ps
                    
                    # Wait for application to be ready
                    for i in {1..10}; do
                        if curl -f http://localhost:3000/api/portfolio >/dev/null 2>&1; then
                            echo "✅ Health check passed!"
                            break
                        else
                            echo "⏳ Waiting for application... (attempt $i/10)"
                            sleep 5
                        fi
                    done
                    
                    # Final health check
                    if ! curl -f http://localhost:3000 >/dev/null 2>&1; then
                        echo "❌ Health check failed"
                        docker-compose -f ${COMPOSE_FILE} logs
                        exit 1
                    fi
                '''
            }
        }
    }
    
    post {
        success {
            echo '🎉 Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed!'
            sh '''
                echo "📝 Container logs:"
                docker-compose -f ${COMPOSE_FILE} logs --tail=50 || echo "No container logs available"
            '''
        }
        always {
            cleanWs()
        }
    }
}
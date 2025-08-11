pipeline {
    agent none
    
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
            agent any
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
        
        stage('Build Application') {
            agent {
                docker {
                    image 'node:18-alpine'
                    args '-v /var/run/docker.sock:/var/run/docker.sock'
                }
            }
            steps {
                echo '🔄 Checking out code...'
                checkout scm
                
                echo '🏗️ Building Next.js application...'
                sh '''
                    # Install dependencies
                    npm ci
                    
                    # Build the application
                    NODE_ENV=development npm run build
                    
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
                '''
            }
        }
        
        stage('Build and Deploy') {
            agent {
                docker {
                    image 'docker/compose:latest'
                    args '-v /var/run/docker.sock:/var/run/docker.sock -v $WORKSPACE:$WORKSPACE'
                }
            }
            when {
                branch 'main'
            }
            steps {
                echo '🔧 Setting up workspace...'
                checkout scm
                
                echo '🐳 Building and deploying with Docker Compose...'
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
EOF
                    
                    # Stop any existing containers
                    docker-compose -f ${COMPOSE_FILE} down || true
                    
                    # Build and start containers
                    docker-compose -f ${COMPOSE_FILE} up -d --build
                    
                    # Wait for containers to start
                    sleep 15
                    
                    # Check container status
                    docker-compose -f ${COMPOSE_FILE} ps
                '''
            }
        }
        
        stage('Health Check') {
            agent any
            when {
                branch 'main'
            }
            steps {
                echo '🏥 Running health check...'
                sh '''
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
            agent any
            steps {
                echo '❌ Pipeline failed!'
                sh '''
                    echo "📝 Container logs:"
                    docker-compose -f ${COMPOSE_FILE} logs --tail=50 || echo "No container logs available"
                '''
            }
        }
        always {
            cleanWs()
        }
    }
}
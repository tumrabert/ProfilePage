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
        
        stage('Setup and Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo '🔧 Deploying with Docker (install Docker first)...'
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
                    
                    echo "⚠️  Docker is required but not installed."
                    echo "📋 To deploy this application, please:"
                    echo "1. Install Docker on Jenkins server:"
                    echo "   curl -fsSL https://get.docker.com -o get-docker.sh"
                    echo "   sh get-docker.sh"
                    echo "   usermod -aG docker jenkins"
                    echo "   systemctl start docker"
                    echo "   systemctl restart jenkins"
                    echo ""
                    echo "2. Or use the simple deployment:"
                    echo "   Install Node.js 18+ and run: npm ci && npm run build && npm start"
                    echo ""
                    echo "📁 Production environment file created at: .env.production"
                    echo "🐳 Docker Compose file available at: ${COMPOSE_FILE}"
                    echo ""
                    echo "✅ Configuration ready - install Docker to complete deployment!"
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
            script {
                try {
                    sh '''
                        echo "📝 Container logs:"
                        docker-compose -f docker-compose.prod.yml logs --tail=50 || echo "No container logs available"
                    '''
                } catch (Exception e) {
                    echo "Could not retrieve container logs: ${e.getMessage()}"
                }
            }
        }
        always {
            cleanWs()
        }
    }
}
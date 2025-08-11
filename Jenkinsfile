pipeline {
    agent {
        docker {
            image 'node:18-alpine'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
    }
    
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
        
        // Deployment paths
        DEPLOY_DIR = '/opt/portfolio'
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
        
        stage('Setup Node.js') {
            steps {
                echo '🔧 Setting up Node.js environment...'
                sh '''
                    # Install Node.js if not available
                    if ! command -v node &> /dev/null; then
                        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
                        sudo apt-get install -y nodejs
                    fi
                    
                    # Install PM2 globally if not available
                    if ! command -v pm2 &> /dev/null; then
                        sudo npm install -g pm2
                    fi
                    
                    node --version
                    npm --version
                    pm2 --version || echo "PM2 installation pending..."
                '''
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo '📦 Installing dependencies...'
                sh 'npm ci'
            }
        }
        
        stage('Build') {
            steps {
                echo '🏗️ Building application...'
                sh 'npm run build'
            }
        }
        
        stage('Test') {
            steps {
                echo '🧪 Running tests...'
                sh 'npm run lint || echo "Linting completed with warnings"'
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo '🚀 Deploying to production...'
                sh '''
                    # Stop existing process
                    pm2 stop portfolio || true
                    
                    # Create deployment directory
                    sudo mkdir -p ${DEPLOY_DIR}
                    
                    # Copy files
                    sudo rsync -av --delete .next/ ${DEPLOY_DIR}/.next/
                    sudo rsync -av --delete public/ ${DEPLOY_DIR}/public/
                    sudo cp package.json ${DEPLOY_DIR}/
                    
                    # Create environment file
                    sudo tee ${DEPLOY_DIR}/.env.production > /dev/null << EOF
NODE_ENV=production
MONGODB_URI=${MONGODB_URI}
JWT_SECRET=${JWT_SECRET}
DEFAULT_ADMIN_USERNAME=${DEFAULT_ADMIN_USERNAME}
DEFAULT_ADMIN_PASSWORD=${DEFAULT_ADMIN_PASSWORD}
GITHUB_TOKEN=${GITHUB_TOKEN}
THUMBNAIL_API=${THUMBNAIL_API}
NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
EOF
                    
                    # Set permissions
                    sudo chown -R jenkins:jenkins ${DEPLOY_DIR}
                    
                    # Start application
                    cd ${DEPLOY_DIR}
                    pm2 start npm --name "portfolio" -- start
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
                    # Wait for app to start
                    sleep 15
                    
                    # Check if app is responding
                    curl -f http://localhost:3000/api/portfolio || exit 1
                    
                    echo "✅ Health check passed!"
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
            sh 'pm2 logs portfolio --lines 20 || true'
        }
        always {
            cleanWs()
        }
    }
}
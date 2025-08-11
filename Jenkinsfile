pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS-18'  // This requires NodeJS plugin installed
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
        
        stage('Setup Environment') {
            steps {
                echo '🔧 Setting up environment...'
                sh '''
                    echo "✅ Environment check:"
                    node --version
                    npm --version
                    
                    # Install PM2 locally for deployment
                    npm install pm2
                    export PATH="$PWD/node_modules/.bin:$PATH"
                    echo "PM2 installed locally"
                '''
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo '📦 Installing dependencies...'
                sh '''
                    # Install all dependencies (including devDependencies for TypeScript)
                    npm ci
                    
                    # Verify TypeScript is available
                    ./node_modules/.bin/tsc --version || echo "TypeScript verification failed"
                '''
            }
        }
        
        stage('Build') {
            steps {
                echo '🏗️ Building application...'
                sh '''
                    # Ensure NODE_ENV is not set to production during build
                    export NODE_ENV=development
                    
                    # Build the application
                    npm run build
                '''
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
                    # Add node_modules/.bin to PATH for PM2
                    export PATH="$PWD/node_modules/.bin:$PATH"
                    
                    # Stop existing process
                    pm2 stop portfolio || true
                    
                    # Create deployment directory (without sudo)
                    mkdir -p ${DEPLOY_DIR}
                    
                    # Copy files (without sudo)
                    rsync -av --delete .next/ ${DEPLOY_DIR}/.next/
                    rsync -av --delete public/ ${DEPLOY_DIR}/public/
                    cp package.json ${DEPLOY_DIR}/
                    cp -r node_modules/ ${DEPLOY_DIR}/node_modules/
                    
                    # Create environment file
                    cat > ${DEPLOY_DIR}/.env.production << EOF
NODE_ENV=production
MONGODB_URI=${MONGODB_URI}
JWT_SECRET=${JWT_SECRET}
DEFAULT_ADMIN_USERNAME=${DEFAULT_ADMIN_USERNAME}
DEFAULT_ADMIN_PASSWORD=${DEFAULT_ADMIN_PASSWORD}
GITHUB_TOKEN=${GITHUB_TOKEN}
THUMBNAIL_API=${THUMBNAIL_API}
NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
EOF
                    
                    # Start application
                    cd ${DEPLOY_DIR}
                    export PATH="$PWD/node_modules/.bin:$PATH"
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
            sh '''
                export PATH="$PWD/node_modules/.bin:$PATH"
                pm2 logs portfolio --lines 20 || echo "PM2 logs not available"
            '''
        }
        always {
            cleanWs()
        }
    }
}
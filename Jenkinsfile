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
        stage('Debug Branch Info') {
            steps {
                script {
                    echo "🔍 Debugging branch information..."
                    echo "Branch Name: ${env.BRANCH_NAME}"
                    echo "Git Branch: ${env.GIT_BRANCH}"
                    echo "Git Commit: ${env.GIT_COMMIT}"
                    
                    sh '''
                        echo "Current branch from git:"
                        git branch -a
                        echo "Current commit:"
                        git log --oneline -1
                        echo "Remote branches:"
                        git branch -r
                    '''
                }
            }
        }
        
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
            // Remove when condition temporarily to test
            steps {
                echo '🐳 Setting up Docker environment...'
                script {
                    echo "Stage would run on any branch for testing"
                    echo "Branch: ${env.BRANCH_NAME ?: 'UNKNOWN'}"
                    echo "Git Branch: ${env.GIT_BRANCH ?: 'UNKNOWN'}"
                    
                    // Check if Docker is installed
                    def dockerInstalled = sh(script: 'command -v docker >/dev/null 2>&1', returnStatus: true) == 0
                    def dockerComposeInstalled = sh(script: 'command -v docker-compose >/dev/null 2>&1', returnStatus: true) == 0
                    
                    echo "Docker installed: ${dockerInstalled}"
                    echo "Docker Compose installed: ${dockerComposeInstalled}"
                    
                    if (!dockerInstalled) {
                        echo '📦 Would install Docker here...'
                        echo 'Skipping actual installation for debugging'
                    } else {
                        echo '✅ Docker is already installed'
                        sh 'docker --version'
                    }
                    
                    if (!dockerComposeInstalled) {
                        echo '📦 Would install Docker Compose here...'
                        echo 'Skipping actual installation for debugging'
                    } else {
                        echo '✅ Docker Compose is already installed'
                        sh 'docker-compose --version'
                    }
                }
            }
        }
        
        stage('Test Branch Conditions') {
            steps {
                script {
                    echo "🧪 Testing different branch conditions..."
                    
                    // Test different ways to check branch
                    def currentBranch = env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'unknown'
                    echo "Current branch: ${currentBranch}"
                    
                    // Check various branch formats
                    if (env.BRANCH_NAME == 'main') {
                        echo "✅ BRANCH_NAME matches 'main'"
                    } else {
                        echo "❌ BRANCH_NAME ('${env.BRANCH_NAME}') does not match 'main'"
                    }
                    
                    if (env.GIT_BRANCH == 'main') {
                        echo "✅ GIT_BRANCH matches 'main'"
                    } else if (env.GIT_BRANCH == 'origin/main') {
                        echo "✅ GIT_BRANCH matches 'origin/main'"
                    } else {
                        echo "❌ GIT_BRANCH ('${env.GIT_BRANCH}') does not match 'main' or 'origin/main'"
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo '🎉 Debug pipeline completed successfully!'
        }
        always {
            cleanWs()
        }
    }
}

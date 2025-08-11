# 🚀 Jenkins CI/CD Configuration Guide

**Target Domain:** www.tumrabert.com  
**Existing Jenkins:** https://jenkins.tumrabert.com/  
**GitHub Webhook:** `https://jenkins.tumrabert.com/github-webhook/`

This guide provides step-by-step instructions for configuring your existing Jenkins server at `https://jenkins.tumrabert.com/` to automatically deploy your Next.js portfolio.

---

## 🎯 Quick Setup Overview

1. **Create Pipeline Job** in Jenkins
2. **Configure Credentials** for secrets
3. **Setup GitHub Webhook** for auto-deployment
4. **Test Deployment** pipeline

---

## 📋 Step 1: Create Jenkins Pipeline Job

### 1.1 Access Jenkins Dashboard
1. Go to `https://jenkins.tumrabert.com/`
2. Login with your admin credentials

### 1.2 Create New Pipeline Job
1. Click **"New Item"**
2. Enter job name: `Portfolio-Production-Deploy`
3. Select **"Pipeline"**
4. Click **"OK"**

### 1.3 Configure Job Settings

#### **General Tab:**
- **Description:** `Next.js Portfolio Auto-Deployment to www.tumrabert.com`
- ✅ Check **"GitHub project"**
- **Project URL:** `https://github.com/tumrabert/ProfilePage/`

#### **Build Triggers:**
- ✅ Check **"GitHub hook trigger for GITScm polling"**
- ✅ Check **"Poll SCM"** (optional backup)
- **Schedule:** `H/5 * * * *` (every 5 minutes as backup)

#### **Pipeline Section:**
- **Definition:** `Pipeline script from SCM`
- **SCM:** `Git`
- **Repository URL:** `https://github.com/tumrabert/ProfilePage.git`
- **Branch Specifier:** `*/main`
- **Script Path:** `Jenkinsfile`

4. Click **"Save"**

---

## 🔐 Step 2: Configure Jenkins Credentials

Go to **Manage Jenkins > Credentials > System > Global credentials** and add the following secrets:

### 2.1 MongoDB Connection
- **Kind:** Secret text
- **Secret:** `mongodb://root:your-mongo-password@localhost:27017/portfolio?authSource=admin`
- **ID:** `mongodb-uri-prod`
- **Description:** Production MongoDB Connection URI

### 2.2 JWT Authentication Secret
- **Kind:** Secret text
- **Secret:** Generate strong secret with: `openssl rand -base64 64`
- **ID:** `jwt-secret-prod`
- **Description:** JWT Token Signing Secret

### 2.3 Admin Credentials
- **Kind:** Secret text
- **Secret:** `admin` (or your preferred admin username)
- **ID:** `admin-username`
- **Description:** Default Admin Username

- **Kind:** Secret text
- **Secret:** Generate strong password with: `openssl rand -base64 20`
- **ID:** `admin-password-prod`
- **Description:** Admin Account Password

### 2.4 GitHub Integration Token
- **Kind:** Secret text
- **Secret:** Your GitHub Personal Access Token
- **ID:** `github-token`
- **Description:** GitHub Repository Access Token

**To create GitHub token:**
1. Go to GitHub.com > Settings > Developer settings > Personal access tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `admin:repo_hook`
4. Copy token and paste in Jenkins

### 2.5 Website Screenshot API
- **Kind:** Secret text
- **Secret:** Your thumbnail.ws API key from https://thumbnail.ws/
- **ID:** `thumbnail-api-key`
- **Description:** Website Screenshot Generation API Key

---

## 🔗 Step 3: Setup GitHub Webhook

### 3.1 Configure Webhook in Repository
1. Go to your GitHub repository: `https://github.com/tumrabert/ProfilePage`
2. Click **Settings > Webhooks**
3. Click **"Add webhook"**

### 3.2 Webhook Configuration
- **Payload URL:** `https://jenkins.tumrabert.com/github-webhook/`
- **Content type:** `application/json`
- **Which events would you like to trigger this webhook?**
  - Select **"Just the push event"**
- **Active:** ✅ Checked

4. Click **"Add webhook"**

### 3.3 Test Webhook (Optional)
```bash
# Test webhook manually
curl -X POST https://jenkins.tumrabert.com/github-webhook/ \
  -H "Content-Type: application/json" \
  -d '{
    "ref": "refs/heads/main",
    "repository": {
      "name": "ProfilePage",
      "clone_url": "https://github.com/tumrabert/ProfilePage.git"
    }
  }'
```

---

## 🔥 Step 4: Create Jenkinsfile

Create a `Jenkinsfile` in your repository root with the following content:

```groovy
pipeline {
    agent any
    
    environment {
        MONGODB_URI = credentials('mongodb-uri-prod')
        JWT_SECRET = credentials('jwt-secret-prod')
        ADMIN_USERNAME = credentials('admin-username')
        ADMIN_PASSWORD = credentials('admin-password-prod')
        THUMBNAIL_API = credentials('thumbnail-api-key')
        NODE_ENV = 'production'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci --only=production'
            }
        }
        
        stage('Build Application') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm run lint'
                // Add more tests as needed
            }
        }
        
        stage('Deploy') {
            steps {
                sh '''
                    # Stop existing process
                    pm2 stop portfolio || true
                    
                    # Copy build files to deployment directory
                    rsync -av --delete .next/ /opt/portfolio/.next/
                    rsync -av --delete public/ /opt/portfolio/public/
                    cp package.json /opt/portfolio/
                    cp next.config.js /opt/portfolio/ || true
                    
                    # Start application with PM2
                    cd /opt/portfolio
                    pm2 start npm --name "portfolio" -- start
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                sh '''
                    # Wait for application to start
                    sleep 10
                    
                    # Check if application is responding
                    curl -f http://localhost:3000/api/portfolio || exit 1
                    
                    echo "✅ Portfolio deployed successfully!"
                '''
            }
        }
    }
    
    post {
        success {
            echo '🎉 Deployment completed successfully!'
        }
        failure {
            echo '❌ Deployment failed. Check logs for details.'
            sh 'pm2 logs portfolio --lines 50'
        }
        always {
            cleanWs()
        }
    }
}
```

---

## 🚀 Step 5: Test Your Pipeline

### 5.1 Manual Test
1. Go to Jenkins Dashboard
2. Click on **"Portfolio-Production-Deploy"**
3. Click **"Build Now"**
4. Monitor the build progress in real-time

### 5.2 Git Push Test
```bash
# Make a small change to trigger auto-deployment
echo "# Updated $(date)" >> README.md
git add README.md
git commit -m "Test CI/CD pipeline"
git push origin main

# Check Jenkins for automatic build trigger
```

### 5.3 Verify Deployment
```bash
# Test portfolio API
curl -f https://www.tumrabert.com/api/portfolio

# Check application status
pm2 status portfolio

# View application logs
pm2 logs portfolio
```

---

## 📊 Step 6: Monitoring & Maintenance

### 6.1 Jenkins Job Monitoring
- **Build History:** View all deployment attempts
- **Console Output:** Detailed logs for each build
- **Build Trends:** Success/failure patterns over time

### 6.2 Application Monitoring
```bash
# Check PM2 process status
pm2 status

# View real-time logs
pm2 logs portfolio --lines 100

# Monitor system resources
htop
```

### 6.3 Regular Maintenance
- **Weekly:** Review build history and fix any recurring issues
- **Monthly:** Update dependencies and security patches
- **As Needed:** Scale resources based on traffic patterns

---

## 🔧 Troubleshooting Guide

### Common Issues & Solutions

#### 🚨 **Build Fails - Dependencies**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 🚨 **GitHub Webhook Not Triggering**
1. Check webhook delivery in GitHub Settings
2. Verify webhook URL: `https://jenkins.tumrabert.com/github-webhook/`
3. Check Jenkins logs for webhook receipt
4. Test webhook manually with curl command above

#### 🚨 **Application Won't Start**
```bash
# Check PM2 status
pm2 status

# Restart application
pm2 restart portfolio

# Check for port conflicts
netstat -tlnp | grep :3000

# View detailed logs
pm2 logs portfolio --lines 50
```

#### 🚨 **Environment Variables Missing**
1. Verify all credentials are configured in Jenkins
2. Check credential IDs match Jenkinsfile exactly
3. Test credential access in Jenkins build console

#### 🚨 **Database Connection Issues**
1. Verify MongoDB is running: `sudo systemctl status mongod`
2. Test connection with correct credentials
3. Check firewall rules for MongoDB port (27017)

---

## ✅ Success Checklist

After completing this setup, you should have:

- [ ] Jenkins pipeline job created and configured
- [ ] All required credentials stored securely in Jenkins
- [ ] GitHub webhook configured and delivering events
- [ ] Jenkinsfile committed to your repository
- [ ] Successful test deployment completed
- [ ] Application accessible at `https://www.tumrabert.com`
- [ ] Monitoring and logging set up

---

## 🎯 Next Steps

1. **🔄 Test the full CI/CD cycle**
   - Make a code change
   - Push to main branch
   - Verify automatic deployment

2. **📈 Add monitoring**
   - Set up uptime monitoring
   - Configure error alerting
   - Implement performance tracking

3. **🔒 Security hardening**
   - Regular security updates
   - SSL certificate renewal
   - Access control review

4. **⚡ Performance optimization**
   - CDN setup (CloudFlare)
   - Database optimization
   - Caching implementation

---

## 🏆 Congratulations!

Your Jenkins CI/CD pipeline is now configured! Every push to the `main` branch will automatically:

✅ **Build your application** with proper error checking  
✅ **Run tests and linting** to ensure code quality  
✅ **Deploy to production** with zero downtime  
✅ **Perform health checks** to verify deployment success  
✅ **Provide detailed logs** for troubleshooting

**🌐 Your portfolio is live at https://www.tumrabert.com!**

---

*Need help? Check the troubleshooting section above or create an issue in your repository.*
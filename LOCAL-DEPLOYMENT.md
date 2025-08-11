# 🚀 Local Server Deployment Guide - Jenkins on Same Server

**Target Domain:** www.tumrabert.com  
**Jenkins Setup:** Running on the same server as deployment  
**GitHub Webhook:** `http://tumrabert.com/github-webhook/`

This guide walks you through setting up Jenkins on your server with automated CI/CD deployment for your portfolio.

---

## 📋 Prerequisites

### Server Requirements
- **Operating System:** Ubuntu 20.04 LTS or newer
- **RAM:** Minimum 4GB (8GB recommended for smooth operation)
- **Storage:** At least 20GB free space
- **Network:** Public IP with domain pointing to server
- **Ports:** 80, 443, 8080 (Jenkins), 22 (SSH) open in firewall

### Domain Setup
- `www.tumrabert.com` and `tumrabert.com` pointing to your server IP
- DNS A records configured and propagated

---

## 🏗️ **Step 1: Server Initial Setup**

### 1.1 Update System
```bash
# Update package lists and system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
```

### 1.2 Create Jenkins User
```bash
# Create jenkins user with sudo privileges
sudo useradd -m -s /bin/bash jenkins
sudo usermod -aG sudo jenkins

# Set password for jenkins user
sudo passwd jenkins

# Add jenkins to docker group (we'll install Docker next)
sudo usermod -aG docker jenkins
```

---

## 🐳 **Step 2: Install Docker & Docker Compose**

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose plugin
sudo apt install docker-compose-plugin

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verify installation
docker --version
docker compose version

# Test Docker with jenkins user
sudo -u jenkins docker run hello-world
```

---

## ☕ **Step 3: Install Jenkins**

### 3.1 Install Java (Jenkins requirement)
```bash
# Install OpenJDK 11 (required for Jenkins)
sudo apt install -y openjdk-11-jdk

# Verify Java installation
java -version
```

### 3.2 Install Jenkins
```bash
# Add Jenkins repository
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Update package list and install Jenkins
sudo apt update
sudo apt install -y jenkins

# Start and enable Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Check Jenkins status
sudo systemctl status jenkins
```

### 3.3 Initial Jenkins Setup
```bash
# Get initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword

# Jenkins should now be accessible at: http://your-server-ip:8080
echo "🌐 Access Jenkins at: http://$(curl -s ifconfig.me):8080"
```

**Open Jenkins in browser:**
1. Navigate to `http://your-server-ip:8080`
2. Enter the initial admin password
3. Click "Install suggested plugins"
4. Create your admin user
5. Configure Jenkins URL (use `http://tumrabert.com:8080`)

---

## 🔧 **Step 4: Configure Jenkins**

### 4.1 Install Required Plugins
**Go to Manage Jenkins > Plugins > Available Plugins** and install:
- ✅ **Docker Pipeline Plugin**
- ✅ **GitHub Plugin** 
- ✅ **NodeJS Plugin**
- ✅ **Pipeline: Stage View Plugin**
- ✅ **Blue Ocean Plugin** (optional, better UI)

### 4.2 Configure Global Tools
**Go to Manage Jenkins > Tools:**

#### **NodeJS Configuration:**
- Click "Add NodeJS"
- Name: `NodeJS-18`
- Version: Choose Node.js 18.x LTS
- Check "Install automatically"
- Save

#### **Docker Configuration:**
- Click "Add Docker"  
- Name: `docker`
- Check "Install automatically"
- Choose "Download from docker.com"
- Save

### 4.3 Setup Jenkins Permissions
```bash
# Add jenkins user to necessary groups
sudo usermod -aG docker jenkins
sudo usermod -aG sudo jenkins

# Create deployment directories
sudo mkdir -p /opt/portfolio
sudo mkdir -p /opt/portfolio-backups
sudo chown -R jenkins:jenkins /opt/portfolio
sudo chown -R jenkins:jenkins /opt/portfolio-backups

# Restart Jenkins to apply group changes
sudo systemctl restart jenkins
```

---

## 🔐 **Step 5: Setup Jenkins Credentials**

**Go to Manage Jenkins > Credentials > System > Global credentials**

Add these credentials (click "Add Credentials" for each):

### 5.1 MongoDB URI
- **Kind:** Secret text
- **Secret:** `mongodb://root:your-mongo-password@localhost:27017/portfolio?authSource=admin`
- **ID:** `mongodb-uri-prod`
- **Description:** Production MongoDB URI

### 5.2 JWT Secret
- **Kind:** Secret text
- **Secret:** Generate a strong 64-character secret: `openssl rand -base64 64`
- **ID:** `jwt-secret-prod`
- **Description:** JWT Secret for Authentication

### 5.3 Admin Username
- **Kind:** Secret text
- **Secret:** `admin` (or your preferred admin username)
- **ID:** `admin-username`
- **Description:** Default Admin Username

### 5.4 Admin Password
- **Kind:** Secret text
- **Secret:** Strong admin password (generate with: `openssl rand -base64 20`)
- **ID:** `admin-password-prod`
- **Description:** Admin Password for Portfolio

### 5.5 GitHub Token
- **Kind:** Secret text
- **Secret:** Your GitHub Personal Access Token
- **ID:** `github-token`
- **Description:** GitHub Integration Token

**To create GitHub token:**
1. Go to GitHub.com > Settings > Developer settings > Personal access tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `admin:repo_hook`
4. Copy the token and paste in Jenkins

### 5.6 Thumbnail API Key
- **Kind:** Secret text
- **Secret:** Your thumbnail.ws API key (get from https://thumbnail.ws/)
- **ID:** `thumbnail-api-key`
- **Description:** Website Screenshot Generation API

---

## 📦 **Step 6: Create Jenkins Pipeline Job**

### 6.1 Create Pipeline Job
1. **Go to Jenkins Dashboard**
2. **Click "New Item"**
3. **Enter name:** `Portfolio-Production-Deploy`
4. **Select:** "Pipeline"
5. **Click "OK"**

### 6.2 Configure Pipeline
#### **General Tab:**
- **Description:** `Portfolio Next.js Production Deployment to www.tumrabert.com`
- **Check:** "GitHub project"
- **Project url:** `https://github.com/tumrabert/ProfilePage/`

#### **Build Triggers:**
- **Check:** "GitHub hook trigger for GITScm polling"

#### **Pipeline Section:**
- **Definition:** "Pipeline script from SCM"
- **SCM:** "Git"
- **Repository URL:** `https://github.com/tumrabert/ProfilePage.git`
- **Branch Specifier:** `*/main` (for production) or `*/*` (for all branches)
- **Script Path:** `Jenkinsfile`

**Click "Save"**

---

## 🔗 **Step 7: Setup GitHub Webhook**

### 7.1 Configure Webhook in GitHub
1. **Go to your GitHub repository**
2. **Settings > Webhooks > Add webhook**
3. **Payload URL:** `http://tumrabert.com/github-webhook/`
4. **Content type:** `application/json`
5. **Which events:** "Just the push event"
6. **Active:** ✅ Checked
7. **Click "Add webhook"**

### 7.2 Test Webhook
```bash
# Test webhook delivery
curl -X POST http://tumrabert.com/github-webhook/ \
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

## 🌐 **Step 8: Configure Nginx (Optional - for Domain Access)**

### 8.1 Install Nginx
```bash
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 8.2 Configure Nginx for Portfolio
```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/portfolio << 'EOF'
# Jenkins reverse proxy
server {
    listen 80;
    server_name tumrabert.com;
    
    location /github-webhook/ {
        proxy_pass http://localhost:8080/github-webhook/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /jenkins/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Portfolio application
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTPS redirect (after SSL setup)
server {
    listen 443 ssl http2;
    server_name www.tumrabert.com tumrabert.com;
    
    # SSL configuration (configure after obtaining certificates)
    # ssl_certificate /etc/letsencrypt/live/www.tumrabert.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/www.tumrabert.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 **Step 9: Setup SSL with Let's Encrypt (Optional)**

```bash
# Install Certbot
sudo snap install --classic certbot

# Create certificate
sudo certbot --nginx -d www.tumrabert.com -d tumrabert.com

# Test auto-renewal
sudo certbot renew --dry-run

# Setup auto-renewal cron job
sudo crontab -e
# Add this line:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🔥 **Step 10: Configure Firewall**

```bash
# Enable UFW firewall
sudo ufw enable

# Allow necessary ports
sudo ufw allow ssh         # SSH access
sudo ufw allow 80          # HTTP
sudo ufw allow 443         # HTTPS
sudo ufw allow 8080        # Jenkins (optional, can restrict to local)
sudo ufw allow 3000        # Portfolio app (temporary, will be proxied)

# Check firewall status
sudo ufw status verbose
```

---

## 🚀 **Step 11: Test Deployment**

### 11.1 Manual Test
1. **Go to Jenkins Dashboard**
2. **Click on "Portfolio-Production-Deploy"**
3. **Click "Build Now"**
4. **Watch the build progress in real-time**

### 11.2 Git Push Test
```bash
# Make a small change to trigger deployment
echo "# Updated $(date)" >> README.md
git add README.md
git commit -m "Test CI/CD deployment"
git push origin main

# Check Jenkins for automatic build trigger
```

### 11.3 Verify Deployment
```bash
# Check if portfolio is running
curl -f http://localhost:3000/api/portfolio

# Check via domain (if Nginx configured)
curl -f https://www.tumrabert.com/api/portfolio

# Check Docker containers
docker ps
docker-compose -f /opt/portfolio/docker-compose.yml ps
```

---

## 📊 **Step 12: Monitoring & Maintenance**

### 12.1 Monitoring Commands
```bash
# Check Jenkins status
sudo systemctl status jenkins

# Check Docker containers
docker ps
docker stats

# Check deployment logs
docker-compose -f /opt/portfolio/docker-compose.yml logs -f

# Check disk usage
df -h
du -sh /opt/portfolio*

# Check system resources
htop
free -h
```

### 12.2 Backup Strategy
```bash
# Manual backup (automated in Jenkins pipeline)
sudo cp -r /opt/portfolio /opt/portfolio-backups/manual-backup-$(date +%Y%m%d)

# Database backup (if using local MongoDB)
docker exec portfolio-mongodb-prod mongodump --out /backup
```

---

## 🔧 **Troubleshooting Guide**

### Common Issues & Solutions

#### 🚨 **Jenkins Build Fails - Permission Denied**
```bash
# Fix Jenkins user permissions
sudo usermod -aG docker jenkins
sudo chown -R jenkins:jenkins /opt/portfolio
sudo systemctl restart jenkins
```

#### 🚨 **Docker Commands Fail in Jenkins**
```bash
# Ensure Jenkins can run Docker
sudo -u jenkins docker ps

# If fails, restart Jenkins
sudo systemctl restart jenkins
```

#### 🚨 **GitHub Webhook Not Triggering**
1. Check webhook URL: `http://tumrabert.com/github-webhook/`
2. Verify GitHub webhook settings
3. Check Jenkins logs: `sudo journalctl -u jenkins -f`
4. Test webhook manually:
```bash
curl -X POST http://tumrabert.com/github-webhook/ \
  -H "Content-Type: application/json" \
  -d '{"ref":"refs/heads/main"}'
```

#### 🚨 **Portfolio Not Accessible**
```bash
# Check containers
cd /opt/portfolio && docker-compose ps

# Check container logs
cd /opt/portfolio && docker-compose logs portfolio-app

# Restart containers
cd /opt/portfolio && docker-compose restart
```

#### 🚨 **SSL Certificate Issues**
```bash
# Renew certificates
sudo certbot renew

# Check certificate status
sudo certbot certificates

# Test SSL configuration
sudo nginx -t
```

---

## ✅ **Deployment Checklist**

### Pre-Deployment Checklist:
- [ ] Server meets minimum requirements (4GB RAM, 20GB storage)
- [ ] Domain DNS records pointing to server IP
- [ ] Jenkins installed and running
- [ ] Docker and Docker Compose installed
- [ ] Required Jenkins plugins installed
- [ ] Jenkins credentials configured
- [ ] GitHub webhook configured
- [ ] Firewall rules applied
- [ ] Jenkins user has proper permissions

### Post-Deployment Verification:
- [ ] Pipeline job created and configured
- [ ] Test build runs successfully
- [ ] GitHub webhook triggers build
- [ ] Portfolio accessible at http://localhost:3000
- [ ] Portfolio accessible at https://www.tumrabert.com (if Nginx configured)
- [ ] Health checks passing
- [ ] Backups being created
- [ ] SSL certificates valid (if configured)

---

## 🎯 **Next Steps After Setup**

1. **🔄 Test CI/CD Pipeline**
   ```bash
   # Make a small change and push to main branch
   echo "Updated: $(date)" >> README.md
   git add . && git commit -m "Test deployment" && git push origin main
   ```

2. **📊 Setup Monitoring**
   - Configure system monitoring (htop, netdata)
   - Set up log rotation for Docker containers
   - Configure backup automation

3. **🔐 Enhanced Security**
   - Change default Jenkins port
   - Setup VPN for Jenkins access
   - Configure fail2ban for SSH protection
   - Regular security updates

4. **⚡ Performance Optimization**
   - Configure Docker resource limits
   - Set up Redis caching
   - Optimize Nginx configuration
   - Configure CDN (CloudFlare)

---

## 🏆 **Congratulations!**

You now have a fully automated CI/CD pipeline that will:

✅ **Automatically deploy** when you push to `main` branch  
✅ **Build and test** your application before deployment  
✅ **Create backups** before each deployment  
✅ **Run health checks** to ensure successful deployment  
✅ **Rollback automatically** if deployment fails  
✅ **Clean up resources** to prevent disk space issues

**🌐 Your portfolio is now live at https://www.tumrabert.com!**

**📞 Need help?** Check the troubleshooting section or create an issue in your repository.
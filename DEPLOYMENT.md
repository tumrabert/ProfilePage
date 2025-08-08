# 🚀 Production Deployment Guide for www.tumrabert.com

This guide explains how to deploy the Portfolio Next.js application to production using Jenkins CI/CD pipeline.

## 📋 Prerequisites

### Server Requirements
- Ubuntu 20.04 LTS or newer
- Docker and Docker Compose installed
- Jenkins server with required plugins
- Domain name pointed to your server (www.tumrabert.com)

### Jenkins Configuration
1. **Required Plugins:**
   - Docker Pipeline Plugin
   - SSH Agent Plugin
   - Credentials Plugin
   - NodeJS Plugin

2. **Tools Configuration (Manage Jenkins > Tools):**
   - NodeJS: `NodeJS-18` (Node.js 18.x)
   - Docker: `docker` (Latest Docker)

3. **Credentials Setup (Manage Jenkins > Credentials):**
   ```
   - mongodb-uri-prod: MongoDB connection string
   - jwt-secret-prod: JWT secret key (256-bit)
   - admin-password-prod: Admin account password
   - github-token: GitHub personal access token
   - prod-server-ssh: SSH private key for deployment server
   ```

## 🔧 Server Setup

### 1. Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin

# Create deployment user
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG docker deploy
sudo mkdir -p /opt/portfolio
sudo chown deploy:deploy /opt/portfolio
```

### 2. SSL Certificate Setup

#### Option A: Let's Encrypt (Recommended)
```bash
# Install Certbot
sudo apt install snapd
sudo snap install --classic certbot

# Generate certificates
sudo certbot certonly --standalone -d www.tumrabert.com -d tumrabert.com

# Copy certificates to project directory
sudo mkdir -p /opt/portfolio/ssl
sudo cp /etc/letsencrypt/live/www.tumrabert.com/fullchain.pem /opt/portfolio/ssl/cert.pem
sudo cp /etc/letsencrypt/live/www.tumrabert.com/privkey.pem /opt/portfolio/ssl/key.pem
sudo chown deploy:deploy /opt/portfolio/ssl/*

# Setup auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Option B: Self-Signed (Development)
```bash
# Generate self-signed certificate
sudo mkdir -p /opt/portfolio/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \\
  -keyout /opt/portfolio/ssl/key.pem \\
  -out /opt/portfolio/ssl/cert.pem \\
  -subj \"/C=US/ST=State/L=City/O=Organization/CN=www.tumrabert.com\"
sudo chown deploy:deploy /opt/portfolio/ssl/*
```

### 3. Configure Firewall
```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH, HTTP, and HTTPS
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Check status
sudo ufw status
```

### 4. Setup MongoDB (External)
```bash
# For production, consider using MongoDB Atlas or a managed service
# If self-hosting, ensure proper security:
# - Enable authentication
# - Use strong passwords
# - Configure replica sets
# - Enable SSL
# - Regular backups
```

## 🔐 Security Configuration

### 1. Environment Variables
Create `/opt/portfolio/.env` with production values:
```bash
# Copy the template and update values
cp .env.production /opt/portfolio/.env
nano /opt/portfolio/.env
```

### 2. SSH Key Setup
```bash
# Generate SSH key for Jenkins deployment
ssh-keygen -t ed25519 -C \"jenkins@deployment\" -f jenkins_deploy_key

# Add public key to deploy user
sudo -u deploy mkdir -p /home/deploy/.ssh
sudo -u deploy cat jenkins_deploy_key.pub >> /home/deploy/.ssh/authorized_keys
sudo -u deploy chmod 600 /home/deploy/.ssh/authorized_keys

# Add private key to Jenkins credentials as 'prod-server-ssh'
```

### 3. MongoDB Security
```bash
# Use MongoDB Atlas (recommended) or secure self-hosted instance
# - Enable authentication
# - Use strong passwords
# - Configure IP whitelisting
# - Enable audit logging
# - Use encrypted connections
```

## 🚀 Jenkins Pipeline Setup

### 1. Create New Pipeline Job
1. Go to Jenkins Dashboard
2. Click \"New Item\"
3. Enter \"Portfolio-Production-Deploy\"
4. Select \"Pipeline\"
5. Click \"OK\"

### 2. Configure Pipeline
1. **General:**
   - Description: \"Portfolio Next.js Production Deployment\"
   - Check \"GitHub project\" and enter repository URL

2. **Build Triggers:**
   - Check \"GitHub hook trigger for GITScm polling\"

3. **Pipeline:**
   - Definition: \"Pipeline script from SCM\"
   - SCM: \"Git\"
   - Repository URL: Your GitHub repository
   - Branch: `*/main` for production deployments
   - Script Path: `portfolio-nextjs/Jenkinsfile`

### 3. Configure GitHub Webhook
1. Go to your GitHub repository settings
2. Navigate to \"Webhooks\"
3. Add webhook:
   - Payload URL: `http://your-jenkins-server/github-webhook/`
   - Content type: `application/json`
   - Events: \"Just the push event\"

## 📊 Monitoring and Maintenance

### 1. Log Files
```bash
# Application logs
docker-compose logs -f portfolio-app

# Nginx logs
docker-compose logs -f nginx

# MongoDB logs
docker-compose logs -f mongodb

# System logs
sudo journalctl -u docker -f
```

### 2. Health Checks
```bash
# Application health
curl -f https://www.tumrabert.com/api/portfolio

# SSL certificate expiry
echo | openssl s_client -servername www.tumrabert.com -connect www.tumrabert.com:443 2>/dev/null | openssl x509 -noout -dates

# Docker container status
docker ps
docker-compose ps
```

### 3. Backup Strategy
```bash
# MongoDB backup (if self-hosted)
docker exec portfolio-mongodb-prod mongodump --out /backup --authenticationDatabase admin

# Application backup
tar -czf portfolio-backup-$(date +%Y%m%d).tar.gz /opt/portfolio

# SSL certificates backup
cp -r /etc/letsencrypt/live/www.tumrabert.com /backup/ssl/
```

### 4. Updating the Application
The Jenkins pipeline handles updates automatically when code is pushed to the main branch. Manual deployment:
```bash
cd /opt/portfolio
git pull origin main
docker-compose down
docker-compose up -d --build
```

## 🔧 Troubleshooting

### Common Issues

1. **SSL Certificate Issues:**
   ```bash
   # Check certificate validity
   openssl x509 -in /opt/portfolio/ssl/cert.pem -text -noout
   
   # Renew Let's Encrypt certificate
   sudo certbot renew
   ```

2. **Docker Issues:**
   ```bash
   # Restart Docker service
   sudo systemctl restart docker
   
   # Clean up Docker resources
   docker system prune -a
   ```

3. **Database Connection Issues:**
   ```bash
   # Check MongoDB connectivity
   docker exec -it portfolio-mongodb-prod mongosh
   
   # Verify environment variables
   docker exec portfolio-nextjs-prod env | grep MONGODB_URI
   ```

4. **Application Not Starting:**
   ```bash
   # Check application logs
   docker-compose logs portfolio-app
   
   # Restart application
   docker-compose restart portfolio-app
   ```

### Performance Optimization

1. **Enable Gzip Compression:** Already configured in Nginx
2. **Static File Caching:** Configured with 1-year expiry
3. **Database Indexing:** Ensure proper MongoDB indexes
4. **CDN Integration:** Consider CloudFlare or AWS CloudFront
5. **Image Optimization:** Use Next.js Image component

## 📞 Support

- **Application Issues:** Check Docker logs and GitHub Issues
- **Server Issues:** Check system logs (`journalctl`)
- **SSL Issues:** Check certificate expiry and Let's Encrypt logs
- **DNS Issues:** Verify domain configuration and propagation

---

## 🎯 Quick Deployment Checklist

- [ ] Server setup complete
- [ ] SSL certificates configured
- [ ] Environment variables set
- [ ] Jenkins pipeline configured
- [ ] GitHub webhook configured
- [ ] Firewall rules applied
- [ ] Domain DNS pointing to server
- [ ] MongoDB connection tested
- [ ] First deployment successful
- [ ] Health checks passing
- [ ] Monitoring alerts configured

🎉 **Your portfolio is now live at https://www.tumrabert.com!**
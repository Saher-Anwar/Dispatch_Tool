# EC2 Deployment Guide

## Prerequisites

Make sure your EC2 instance has Docker and Docker Compose installed:

```bash
# Install Docker
sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
# Log out and back in for group changes to take effect
```

## Deployment Steps

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd Dispatch_Tool
   ```

2. **Run the application:**
   ```bash
   docker-compose up -d
   ```

3. **Access your application:**
   - Frontend: `http://your-ec2-ip`
   - Backend API: `http://your-ec2-ip:8000`
   - Database: `your-ec2-ip:3307`

## Services

- **Frontend**: React app served by Nginx on port 80
- **Backend**: Flask API on port 8000
- **Database**: MySQL on port 3307

## Environment Variables

The `.env` file contains all necessary configuration. Update these values as needed for your production environment.

## Stopping the Application

```bash
docker-compose down
```

## Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f api
docker-compose logs -f mysql
```

## Security Notes

- Update the JWT secret key in production
- Change default database passwords
- Consider using environment-specific `.env` files
- Set up proper firewall rules for your EC2 instance
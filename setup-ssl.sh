#!/bin/bash

# SSL Setup Script for Let's Encrypt
set -e

DOMAIN="204.236.215.249"  # Your EC2 IP
EMAIL="your-email@example.com"  # Replace with your email

echo "Setting up SSL certificates for $DOMAIN"

# Step 1: Create temporary nginx config without SSL
echo "Creating temporary nginx config..."
cat > frontend/nginx-temp.conf << 'EOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy to backend
    location /api/ {
        proxy_pass http://api-service:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOF

# Step 2: Update Dockerfile to use temp config
echo "Updating frontend Dockerfile..."
sed -i 's/COPY nginx.conf/COPY nginx-temp.conf/' frontend/Dockerfile

# Step 3: Start services with temporary config
echo "Starting services..."
docker-compose down
docker-compose up --build -d

# Step 4: Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# Step 5: Generate SSL certificate
echo "Generating SSL certificate..."
docker-compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot --email $EMAIL --agree-tos --no-eff-email -d $DOMAIN

# Step 6: Update nginx config to use SSL
echo "Updating nginx config for SSL..."
sed -i "s/domain/$DOMAIN/g" frontend/nginx.conf
sed -i 's/COPY nginx-temp.conf/COPY nginx.conf/' frontend/Dockerfile

# Step 7: Rebuild with SSL config
echo "Rebuilding with SSL configuration..."
docker-compose up --build -d frontend

echo "SSL setup complete! Your site should now be available at https://$DOMAIN"
echo "Note: Update the EMAIL variable in this script with your actual email address"
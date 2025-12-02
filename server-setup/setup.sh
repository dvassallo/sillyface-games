#!/bin/bash
#
# VibeHost Server Setup Script
# Idempotent setup for deploying multiple static web apps with automatic subdomain routing
# Safe to run multiple times - skips steps that are already complete
#
# Usage: ./setup.sh <domain> <cloudflare_api_token> <email>
# Example: ./setup.sh example.com cf_token_xxx admin@example.com

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_skip() { echo -e "${YELLOW}[SKIP]${NC} $1"; }

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run this script as root (sudo ./setup.sh ...)"
    exit 1
fi

# Check arguments
if [ $# -lt 3 ]; then
    echo "Usage: $0 <domain> <cloudflare_api_token> <email>"
    echo ""
    echo "Arguments:"
    echo "  domain              Your domain name (e.g., example.com)"
    echo "  cloudflare_api_token  Cloudflare API token with DNS edit permissions"
    echo "  email               Email for Let's Encrypt notifications"
    echo ""
    echo "Example:"
    echo "  sudo $0 example.com cf_xxxxxxxxxxxxx admin@example.com"
    exit 1
fi

DOMAIN=$1
CF_API_TOKEN=$2
EMAIL=$3

log_info "Starting VibeHost server setup for domain: $DOMAIN"

# ============================================
# Step 1: Install packages (idempotent)
# ============================================
if ! command -v nginx &> /dev/null; then
    log_info "Installing Nginx..."
    apt-get update -qq
    apt-get install -y -qq nginx
else
    log_skip "Nginx already installed"
fi

if ! command -v certbot &> /dev/null; then
    log_info "Installing Certbot with Cloudflare DNS plugin..."
    apt-get update -qq
    apt-get install -y -qq certbot python3-certbot-dns-cloudflare
else
    log_skip "Certbot already installed"
fi

# ============================================
# Step 2: Create directory structure (idempotent)
# ============================================
if [ ! -d "/var/www/apps" ]; then
    log_info "Creating directory structure..."
    mkdir -p /var/www/apps
    mkdir -p /var/www/apps/_root
else
    log_skip "Directory structure already exists"
    mkdir -p /var/www/apps/_root  # Ensure _root exists
fi

# Create default landing page only if it doesn't exist
if [ ! -f "/var/www/apps/_root/index.html" ]; then
    log_info "Creating default landing page..."
    cat > /var/www/apps/_root/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VibeHost</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: system-ui, -apple-system, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            color: #e8e8e8;
        }
        .container {
            text-align: center;
            padding: 2rem;
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            background: linear-gradient(90deg, #00d9ff, #00ff88);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        p {
            font-size: 1.2rem;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>VibeHost</h1>
        <p>Your apps are deployed and ready.</p>
    </div>
</body>
</html>
EOF
else
    log_skip "Landing page already exists"
fi

# Set permissions
chown -R www-data:www-data /var/www/apps
chmod -R 755 /var/www/apps

# ============================================
# Step 3: Configure Cloudflare credentials (always update)
# ============================================
log_info "Updating Cloudflare credentials..."
mkdir -p /etc/letsencrypt
cat > /etc/letsencrypt/cloudflare.ini << EOF
dns_cloudflare_api_token = $CF_API_TOKEN
EOF
chmod 600 /etc/letsencrypt/cloudflare.ini

# ============================================
# Step 4: Obtain wildcard SSL certificate (idempotent)
# ============================================
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    log_info "Obtaining wildcard SSL certificate from Let's Encrypt..."
    log_info "This may take a minute while DNS propagates..."

    certbot certonly \
        --dns-cloudflare \
        --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini \
        --dns-cloudflare-propagation-seconds 30 \
        -d "$DOMAIN" \
        -d "*.$DOMAIN" \
        --email "$EMAIL" \
        --agree-tos \
        --non-interactive

    if [ $? -ne 0 ]; then
        log_error "Failed to obtain SSL certificate. Please check your Cloudflare API token and DNS settings."
        exit 1
    fi

    log_info "SSL certificate obtained successfully!"
else
    log_skip "SSL certificate already exists for $DOMAIN"
fi

# ============================================
# Step 5: Configure Nginx (always update config)
# ============================================
log_info "Configuring Nginx..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if nginx config template exists
if [ -f "$SCRIPT_DIR/nginx-apps.conf" ]; then
    # Use the template from the repo
    sed "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" "$SCRIPT_DIR/nginx-apps.conf" > /etc/nginx/sites-available/apps
else
    # Generate inline if template not found
    cat > /etc/nginx/sites-available/apps << EOF
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name *.$DOMAIN $DOMAIN;
    return 301 https://\$host\$request_uri;
}

# Main HTTPS server with dynamic subdomain routing
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    
    server_name ~^(?<subdomain>.+)\.$DOMAIN\$;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    
    root /var/www/apps/\$subdomain;
    index index.html index.htm;
    
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    location / {
        try_files \$uri \$uri/ /index.html =404;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# Root domain server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    
    root /var/www/apps/_root;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOF
fi

# Enable the site
ln -sf /etc/nginx/sites-available/apps /etc/nginx/sites-enabled/apps

# Remove default site if it exists
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
log_info "Testing Nginx configuration..."
nginx -t

if [ $? -ne 0 ]; then
    log_error "Nginx configuration test failed!"
    exit 1
fi

# Reload Nginx
log_info "Reloading Nginx..."
systemctl reload nginx
systemctl enable nginx

# ============================================
# Step 6: Set up automatic certificate renewal (idempotent)
# ============================================
if ! systemctl is-enabled certbot.timer &>/dev/null 2>&1; then
    log_info "Setting up automatic certificate renewal..."
    systemctl enable certbot.timer
    systemctl start certbot.timer
else
    log_skip "Certificate auto-renewal already configured"
fi

# Add a post-renewal hook to reload Nginx (idempotent)
mkdir -p /etc/letsencrypt/renewal-hooks/deploy
cat > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh << 'EOF'
#!/bin/bash
systemctl reload nginx
EOF
chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

# ============================================
# Done!
# ============================================
echo ""
echo "============================================"
log_info "VibeHost setup complete!"
echo "============================================"
echo ""
echo "Server IP: $(hostname -I | awk '{print $1}')"
echo "Domain: $DOMAIN"
echo ""
echo "Your server is ready to receive deployments."
echo ""
echo "Example:"
echo "   /myapp/index.html  →  https://myapp.$DOMAIN"
echo "   /blog/index.html   →  https://blog.$DOMAIN"
echo ""
echo "Root domain: https://$DOMAIN"
echo ""

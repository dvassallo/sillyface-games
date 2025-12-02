# VibeHost

**Zero-config deployment for multiple static web apps with automatic subdomain routing.**

Deploy dozens of static websites from a single GitHub repository. Each folder becomes its own subdomain automatically—no configuration needed when adding new apps.

```
/myapp/index.html   →   https://myapp.yourdomain.com
/blog/index.html    →   https://blog.yourdomain.com
/portfolio/         →   https://portfolio.yourdomain.com
```

## Features

- **Zero-config subdomains**: Add a folder, push, and it's live at `foldername.yourdomain.com`
- **Automatic SSL**: Let's Encrypt certificates issued automatically for each subdomain
- **Automatic setup**: Server is configured on first deploy—no manual SSH required
- **Simple deployment**: Git push triggers automatic deployment
- **Fast & secure**: Nginx serves static files with gzip, caching, and security headers
- **No vendor lock-in**: Works with any DNS provider—just needs A records

## How It Works

```
┌─────────────────┐      Push to main      ┌─────────────────────────────────┐
│  GitHub Repo    │ ─────────────────────► │  Your Server                    │
│                 │      (rsync/SSH)       │                                 │
│  /app1/         │                        │  /var/www/apps/app1/            │
│  /app2/         │                        │  /var/www/apps/app2/            │
│  /blog/         │                        │  /var/www/apps/blog/            │
└─────────────────┘                        └──────────┬──────────────────────┘
                                                      │
                                                      ▼
                                           ┌─────────────────────────┐
                                           │  Nginx                  │
                                           │  *.yourdomain.com       │
                                           │  Dynamic routing        │
                                           │  Per-subdomain SSL      │
                                           └─────────────────────────┘
```

Nginx uses regex to capture the subdomain and map it directly to a folder:

```nginx
server_name ~^(?<subdomain>.+)\.yourdomain\.com$;
root /var/www/apps/$subdomain;
```

This means **any new folder automatically works** without touching server configuration.

## Prerequisites

Before starting, you'll need:

- [ ] **A domain name** you control
- [ ] **A Linux server** (Ubuntu 20.04+ or Debian 11+ recommended)
  - Fresh VPS from DigitalOcean, Linode, Vultr, Hetzner, etc. ($5-6/month is fine)
  - Root SSH access with key authentication
  - Ports 80 and 443 open in your firewall
- [ ] **A GitHub repository** (fork this one or use as template)

## Setup Guide

### Step 1: Configure DNS

Add these DNS records at your domain registrar or DNS provider:

| Type | Name | Value |
|------|------|-------|
| A | `@` | `your.server.ip` |
| A | `*` | `your.server.ip` |

The wildcard (`*`) record ensures all subdomains point to your server.

### Step 2: Prepare Your Server

1. **Create a new VPS** with Ubuntu 22.04 or Debian 12

2. **Enable root SSH key access**:
   
   Generate a deployment key on your local machine:
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/vibehost_deploy -N ""
   ```
   
   Add the public key to your server's root user:
   ```bash
   ssh-copy-id -i ~/.ssh/vibehost_deploy.pub root@your.server.ip
   ```

3. **Open ports 80 and 443** in your firewall/security group

### Step 3: Configure GitHub Repository

1. **Fork this repository** or use it as a template

2. **Add GitHub Secrets** (Settings → Secrets and variables → Actions → New repository secret):

   | Secret Name | Value |
   |-------------|-------|
   | `DOMAIN` | Your domain name (e.g., `example.com`) |
   | `DEPLOY_KEY` | Contents of `~/.ssh/vibehost_deploy` (the private key) |
   | `LETSENCRYPT_EMAIL` | Your email for SSL certificate notifications |

   > **Note**: For `DEPLOY_KEY`, paste the entire private key including `-----BEGIN` and `-----END` lines.

### Step 4: Deploy!

1. **Create an app folder** in your repository:
   ```
   myapp/
   └── index.html
   ```

2. **Add some content** to `myapp/index.html`:
   ```html
   <!DOCTYPE html>
   <html>
   <head>
       <title>My App</title>
   </head>
   <body>
       <h1>Hello from myapp!</h1>
   </body>
   </html>
   ```

3. **Push to main**:
   ```bash
   git add .
   git commit -m "Add myapp"
   git push origin main
   ```

4. **Wait for the action to complete** (first deploy takes ~2-3 minutes for server setup)

5. **Visit your app**: `https://myapp.yourdomain.com`

On the first push, the workflow automatically:
- Detects the server isn't set up yet
- Installs Nginx and Certbot
- Configures everything
- Issues SSL certificates for each app
- Deploys your apps

Subsequent pushes deploy quickly (~30 seconds, plus ~10 seconds per new app for SSL).

## Usage

### Adding New Apps

Just create a new folder and push:

```bash
mkdir coolsite
echo "<h1>Cool Site!</h1>" > coolsite/index.html
git add coolsite
git commit -m "Add coolsite"
git push
```

Visit `https://coolsite.yourdomain.com` — it works automatically!

### Project Structure

```
your-repo/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Handles setup + deployment
├── server-setup/               # Server configuration (not deployed)
│   ├── setup.sh
│   └── nginx-apps.conf
├── app1/                       # → https://app1.yourdomain.com
│   └── index.html
├── app2/                       # → https://app2.yourdomain.com
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── blog/                       # → https://blog.yourdomain.com
│   └── index.html
├── README.md                   # Not deployed
└── LICENSE                     # Not deployed
```

### What Gets Deployed

The workflow deploys all folders **except**:
- `.git/`
- `.github/`
- `server-setup/`
- `README.md`, `LICENSE`, and any `.md` files

### Root Domain

The root domain (`https://yourdomain.com`) automatically displays an index of all your apps with links to each subdomain. This is generated dynamically on each deploy—no configuration needed.

To use a custom landing page instead, create a `_root/` folder in your repo with your own `index.html`.

### Force Re-run Setup

If you need to re-run the server setup (e.g., after changing the domain):

1. Go to **Actions** tab
2. Select the latest **"Deploy Apps"** workflow
3. Click **"Re-run all jobs"** → check **"Enable debug logging"**

Or trigger manually:
1. Go to **Actions** → **"Deploy Apps"**
2. Click **"Run workflow"**
3. Check **"Force re-run server setup"**
4. Click **"Run workflow"**

## Troubleshooting

### First Deploy Issues

**Workflow fails immediately**:
- Verify all GitHub Secrets are configured correctly
- Check that `DEPLOY_KEY` includes the full private key with BEGIN/END lines
- Ensure your server allows root SSH login with key authentication

**SSL certificate errors**:
- Verify DNS A records are pointing to your server (both `@` and `*`)
- DNS propagation can take up to 24-48 hours (usually much faster)
- Check that ports 80 and 443 are open

### Deployment Issues

**App not showing up after push**:
- Check the Actions tab for deployment errors
- Verify the folder name matches the subdomain you're visiting
- Ensure there's an `index.html` in the folder

**"Connection refused" or timeout**:
- Verify ports 80 and 443 are open on your server
- Check that Nginx is running: `ssh root@server "systemctl status nginx"`

### Checking Server Status

```bash
# SSH into your server
ssh root@your.server.ip

# Check Nginx status
systemctl status nginx

# View deployed apps
ls -la /var/www/apps/

# Check Nginx error log
tail -50 /var/log/nginx/error.log

# Test Nginx config
nginx -t

# Check SSL certificate status
certbot certificates
```

## Advanced Configuration

### Custom 404 Pages

Add a `404.html` to any app folder for a custom error page.

### Single Page Apps (SPAs)

The default Nginx config includes a fallback to `index.html` for SPAs:
```nginx
try_files $uri $uri/ /index.html =404;
```

React Router, Vue Router, etc. work out of the box.

### Caching

Static assets (JS, CSS, images, fonts) are cached for 30 days by default. Modify `server-setup/nginx-apps.conf` to adjust.

## Security Notes

- SSH key authentication only (no passwords)
- Nginx includes security headers (X-Frame-Options, X-Content-Type-Options)
- Automatic HTTPS redirect
- TLS 1.2+ only with modern cipher suites
- Automatic certificate renewal via Certbot

## Future Roadmap

- [ ] **Node.js app support**: Detect `package.json`, run with PM2, proxy to port
- [ ] **Build step support**: Run `npm build` before deployment
- [ ] **Preview deployments**: Deploy PRs to `pr-123.yourdomain.com`
- [ ] **Rollback support**: Easy rollback to previous deployments

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Let's Encrypt](https://letsencrypt.org/) for free SSL certificates
- [Nginx](https://nginx.org/) for being an excellent web server

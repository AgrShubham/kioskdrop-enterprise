# 🚀 Complete Deployment Guide: KioskDrop Enterprise

This comprehensive guide provides step-by-step instructions to deploy **KioskDrop Enterprise** across:
1. [**Vercel Serverless (100% Free)**](#part-1-100-free-vercel-deployment-serverless) — using the [`vercel-serverless`](https://github.com/AgrShubham/kioskdrop-enterprise/tree/vercel-serverless) branch.
2. [**DigitalOcean / AWS EC2 / Hetzner (Docker & Docker Compose)**](#part-2-docker--docker-compose-on-any-vps-digitalocean-aws-ec2-hetzner) — using the [`main`](https://github.com/AgrShubham/kioskdrop-enterprise/tree/main) branch.
3. [**1-Click Cloud PaaS (Railway / Render)**](#part-3-1-click-cloud-paas-railway--render) — using the [`main`](https://github.com/AgrShubham/kioskdrop-enterprise/tree/main) branch.
4. [**Domain Setup & Free SSL (Nginx & Certbot)**](#part-4-domain-configuration--free-ssl-with-nginx--certbot).
5. [**Maintenance, Logs & Backup Operations**](#part-5-maintenance-monitoring--database-backups).

---

## 🧭 Branch Decision Matrix

Choose your deployment target and use the corresponding GitHub branch:

| Deployment Platform | Recommended Branch | Database Used | Real-Time Engine | Pricing |
| :--- | :--- | :--- | :--- | :--- |
| **Vercel** | **`vercel-serverless`** | Free Cloud PostgreSQL (Neon / Supabase) | BroadcastChannel + Adaptive Polling | **100% Free** |
| **DigitalOcean / AWS / VPS** | **`main`** | SQLite with WAL mode (`/app/prisma/dev.db`) | Persistent Server-Sent Events (SSE) Route Handler | ~$4–$6/month |
| **Railway.app / Render** | **`main`** | SQLite with persistent volume mount | Persistent Server-Sent Events (SSE) Route Handler | Free tier / ~$5/month |

---

## Part 1: 100% Free Vercel Deployment (Serverless)

Vercel is ideal for zero-maintenance serverless hosting. Because serverless lambdas require an external database, this deployment pairs with a **free serverless PostgreSQL** database.

### Step 1: Provision a Free Cloud PostgreSQL Database
Choose **Option A** (built directly into Vercel) or **Option B** (standalone Neon.tech):

#### **Option A: 1-Click Vercel Marketplace Neon (Recommended)**
1. Log into your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click the **Storage** tab in the top navigation bar.
3. Under **"Marketplace Database Providers"**, locate **Neon** (green square icon) $\rightarrow$ Click **"Create"**.
4. Click **Continue / Install** to authorize the Neon integration on your team/account.
5. In the creation modal:
   * **Database Name:** e.g., `kioskdrop-db`
   * **Region:** Select your nearest region (e.g., `Washington, D.C. (iad1)` or `Frankfurt (fra1)`)
   * **Plan:** Free Tier (256MB compute, 0.5GB storage, 100% free)
6. Under **"Connect to Project"**, select your **`kioskdrop-enterprise`** project.
   * *Vercel will automatically inject `DATABASE_URL` and `POSTGRES_PRISMA_URL` directly into your project's Environment Variables with zero manual copy-pasting!*

#### **Option B: Standalone Neon.tech (Alternative)**
1. Sign up for free at [neon.tech](https://neon.tech/).
2. Create a new project named `kioskdrop-enterprise`.
3. In your dashboard, copy the **Connection string** (choose `Pooled connection`):
   ```text
   postgresql://kioskdrop_owner:YOUR_PASSWORD@ep-xyz-pooler.us-east-2.aws.neon.tech/kioskdrop?sslmode=require
   ```
4. Paste this connection string as `DATABASE_URL` in your Vercel Project Settings $\rightarrow$ Environment Variables.

---

### Step 2: Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. Select **Import Git Repository** and choose `AgrShubham/kioskdrop-enterprise`.
3. **CRITICAL: Select the Branch**:
   * Change the branch to deploy from `main` to **`vercel-serverless`**.
4. In the **Environment Variables** section:
   * **`PIN_HMAC_SECRET`**: Enter any 32-character random string (e.g., `0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef`).
   * **`DATABASE_URL`**: *(If you connected Neon via Option A above, Vercel auto-populates this! If using Option B, paste your connection string here).*
5. Click **Deploy**.

> [!NOTE]
> **What happens automatically during build:**
> The build script (`scripts/prepare-build.js`) detects PostgreSQL, dynamically switches Prisma to `provider = "postgresql"`, executes `prisma db push` to generate all tables and indexes in your database, and compiles Next.js.
> Vercel Cron will automatically sweep expired reservations every 10 minutes via `/api/cron/sweep`.

---

## Part 2: Docker & Docker Compose on Any VPS (DigitalOcean / AWS EC2 / Hetzner)

This is the **primary reference architecture** (running on the `main` branch). It provides a self-contained, lightning-fast Node.js server with persistent SQLite, live Server-Sent Events, and hardware sensor emulation.

### Step 1: Create a Cloud Virtual Server (VPS)
* **DigitalOcean:** Create a Droplet $\rightarrow$ **Ubuntu 24.04 LTS** $\rightarrow$ Basic Plan ($4 to $6/month is more than enough).
* **AWS EC2:** Launch Instance $\rightarrow$ **Ubuntu Server 24.04 LTS** $\rightarrow$ Instance Type: `t3.micro` or `t4g.micro` (Free Tier eligible).
  * *AWS Security Group Rule:* Open inbound ports **22** (SSH), **80** (HTTP), **443** (HTTPS), and **3000** (Optional testing).

---

### Step 2: SSH into Your Server & Install Docker

Connect via your terminal:
```bash
ssh root@YOUR_SERVER_IP
```

Run these commands to install Docker and Docker Compose:
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker engine
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verify Docker installation
docker --version
docker compose version
```

---

### Step 3: Clone the Repository & Configure Environment

```bash
# Clone the repository
git clone https://github.com/AgrShubham/kioskdrop-enterprise.git
cd kioskdrop-enterprise

# Ensure you are on the main branch
git checkout main

# Create environment configuration
cp .env.example .env
```

Edit your `.env` file with `nano .env`:
```env
DATABASE_URL="file:/app/prisma/dev.db"
PIN_HMAC_SECRET="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
NEXT_PUBLIC_APP_URL="http://YOUR_SERVER_IP:3000"
NODE_ENV="production"
```
*(Press `Ctrl + O` then `Enter` to save, and `Ctrl + X` to exit nano).*

---

### Step 4: Build and Launch the Application

Run Docker Compose:
```bash
docker compose up -d --build
```

#### What Docker Compose Does Automatically:
1. Builds the multi-stage `Dockerfile` creating an ultra-lightweight standalone Node.js Alpine container (~120MB).
2. Runs `npx prisma migrate deploy` inside `docker-entrypoint.sh` to initialize the database tables.
3. Automatically seeds initial hardware SKUs, Smart Locker bays, meeting rooms, and personas.
4. Mounts the persistent volume `kioskdrop_enterprise_db` to `/app/prisma` so your database is never lost on restarts.
5. Launches the app on port `3000`.

Check running status:
```bash
docker ps
```
You should see `kioskdrop_enterprise` status as `Up`. You can now open `http://YOUR_SERVER_IP:3000` in your web browser!

---

## Part 3: 1-Click Cloud PaaS (Railway / Render)

If you want a managed container with persistent disks and zero server management:

### Railway.app (Zero DevOps)
1. Go to [Railway.app](https://railway.app/) and sign in with GitHub.
2. Click **New Project** $\rightarrow$ **Deploy from GitHub repo** $\rightarrow$ Select `AgrShubham/kioskdrop-enterprise` (branch: `main`).
3. Click on the newly created Service $\rightarrow$ **Settings** $\rightarrow$ Scroll to **Volumes**:
   * Click **Add Volume**.
   * Set **Mount Path** to: `/app/prisma`.
4. Go to the **Variables** tab and set:
   * `DATABASE_URL` = `file:/app/prisma/dev.db`
   * `PIN_HMAC_SECRET` = `any-random-32-char-string`
5. Railway automatically builds the container and provides a live HTTPS domain!

### Render.com
1. Go to [Render.com](https://render.com/) $\rightarrow$ **New Web Service**.
2. Connect your repository: `AgrShubham/kioskdrop-enterprise` (branch: `main`).
3. Select **Docker** environment.
4. Scroll to **Disks** $\rightarrow$ Click **Add Disk**:
   * Name: `kioskdrop-storage`
   * Mount Path: `/app/prisma`
   * Size: `1 GB`
5. Set Environment Variable: `DATABASE_URL` = `file:/app/prisma/dev.db`.
6. Click **Create Web Service**.

---

## Part 4: Domain Configuration & Free SSL with Nginx & Certbot

To point your custom domain (e.g., `kiosk.yourcompany.com`) with a free Let's Encrypt SSL certificate on your VPS:

### Step 1: Point Your DNS Record
In your domain registrar (GoDaddy, Namecheap, Cloudflare):
* Add an **A Record**:
  * **Host:** `@` (or subdomain like `kiosk`)
  * **Value / IP:** `YOUR_SERVER_IP`
  * **TTL:** Automatic or 300s

---

### Step 2: Install and Configure Nginx

On your server terminal:
```bash
sudo apt install nginx -y
```

Create an Nginx configuration file for KioskDrop:
```bash
sudo nano /etc/nginx/sites-available/kioskdrop
```

Paste the following configuration (replace `kiosk.yourcompany.com` with your domain):
```nginx
server {
    listen 80;
    server_name kiosk.yourcompany.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        
        # Essential headers for Next.js and SSE streaming
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Disable buffering for real-time Server-Sent Events (SSE)
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

Enable the configuration and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/kioskdrop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### Step 3: Install Free SSL with Let's Encrypt Certbot

```bash
# Install Certbot and the Nginx plugin
sudo apt install certbot python3-certbot-nginx -y

# Obtain and install the SSL certificate
sudo certbot --nginx -d kiosk.yourcompany.com
```
* Enter your email when prompted.
* Agree to terms.
* Certbot will automatically configure HTTPS, redirect HTTP to HTTPS, and establish automatic SSL renewal!

You can now access your application securely at:
**`https://kiosk.yourcompany.com`**

---

## Part 5: Maintenance, Monitoring & Database Backups

### 1. View Live Application Logs
To monitor real-time IoT events, unlock events, or triage logs:
```bash
# View last 100 lines and follow live output
docker logs -f --tail 100 kioskdrop_enterprise
```

### 2. Updating the Application to New Commits
Whenever you push new code to the `main` branch on GitHub:
```bash
cd /path/to/kioskdrop-enterprise
git pull origin main
docker compose up -d --build
```
*(Your SQLite database in the Docker volume is completely preserved during rebuilds).*

### 3. Backing Up the SQLite Database
To take a snapshot backup of your database:
```bash
# Copy the database file directly out of the running container
docker cp kioskdrop_enterprise:/app/prisma/dev.db ./dev_backup_$(date +%Y%m%d_%H%M%S).db
```

### 4. Restarting the Application
```bash
# Restart the container
docker compose restart

# Stop the container
docker compose down

# Start the container
docker compose up -d
```

---

<div align="center">

**KioskDrop Enterprise Deployment Guide**  
*Built for reliability, enterprise zero-trust security, and zero downtime.*

[Back to GitHub Repository](https://github.com/AgrShubham/kioskdrop-enterprise)

</div>

# Production Deploy

Kiến trúc mục tiêu: Cloudflare -> Nginx trên VPS -> Docker Next.js app bind localhost -> PostgreSQL private Docker network.

## 1. Chuẩn bị VPS Ubuntu

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg nginx certbot python3-certbot-nginx ufw
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
docker version
```

## 2. Tạo thư mục app

```bash
sudo mkdir -p /opt/tekvora
sudo chown -R $USER:$USER /opt/tekvora
cd /opt/tekvora
mkdir -p /var/www/certbot
```

## 3. Tạo `.env.production` trên VPS

Không commit file này.

```bash
cat > /opt/tekvora/.env.production <<'EOF'
APP_PORT=3008
DOCKER_IMAGE=ghcr.io/OWNER/REPO:latest

POSTGRES_DB=tekvora
POSTGRES_USER=tekvora
POSTGRES_PASSWORD=replace-with-a-long-random-password
DATABASE_URL=postgresql://tekvora:replace-with-a-long-random-password@postgres:5432/tekvora?schema=public

NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_SITE_URL=https://your-domain.com
EOF
chmod 600 /opt/tekvora/.env.production
```

`POSTGRES_PASSWORD` trong `DATABASE_URL` phải trùng với `POSTGRES_PASSWORD`.

## 4. Login GHCR trên VPS

Tạo GitHub token có quyền đọc package nếu package private.

```bash
echo "YOUR_GHCR_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

## 5. Cấu hình Nginx

Sửa domain trong `deploy/nginx/site.conf`:

- `server_name tekvora.example.com www.tekvora.example.com`
- đường dẫn certificate `/etc/letsencrypt/live/tekvora.example.com/...`

Copy file:

```bash
sudo cp deploy/nginx/cloudflare-real-ip.conf /etc/nginx/snippets/cloudflare-real-ip.conf
sudo cp deploy/nginx/site.conf /etc/nginx/sites-available/tekvora.conf
sudo ln -s /etc/nginx/sites-available/tekvora.conf /etc/nginx/sites-enabled/tekvora.conf
```

Nếu chưa có certificate, tạo cert trước khi bật server 443 hoặc tạm comment block 443.

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 6. Bật firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

Không mở port `3008` public. Compose production chỉ bind `127.0.0.1:3008:3008`.

## 7. Chạy lần đầu

Workflow GitHub Actions sẽ upload `docker-compose.production.yml` thành `/opt/tekvora/docker-compose.yml`. Nếu chạy thủ công:

```bash
cd /opt/tekvora
docker compose --env-file .env.production -f docker-compose.yml pull
docker compose --env-file .env.production -f docker-compose.yml up -d
docker compose --env-file .env.production -f docker-compose.yml ps
```

## 8. Logs và kiểm tra

```bash
cd /opt/tekvora
docker compose --env-file .env.production -f docker-compose.yml logs -f app
docker compose --env-file .env.production -f docker-compose.yml logs -f postgres
curl -I http://127.0.0.1:3008/api/health
sudo nginx -t
sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log
```

## 9. Rollback image

Lấy image cũ từ GHCR hoặc GitHub Actions run trước, rồi sửa `DOCKER_IMAGE`:

```bash
cd /opt/tekvora
sed -i 's|^DOCKER_IMAGE=.*|DOCKER_IMAGE=ghcr.io/OWNER/REPO:OLD_SHA|' .env.production
docker compose --env-file .env.production -f docker-compose.yml pull app
docker compose --env-file .env.production -f docker-compose.yml up -d app
```

## 10. GitHub Secrets

Thêm các secret trong repository:

- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`
- `DOCKER_IMAGE`, ví dụ `ghcr.io/owner/repo`
- `GHCR_TOKEN`, cần nếu package private hoặc VPS không đọc được bằng token mặc định

## 11. Cloudflare

Trên Cloudflare cần làm thủ công:

- DNS `A/AAAA` trỏ về VPS và bật proxy nếu muốn dùng Cloudflare edge.
- SSL/TLS đặt `Full (strict)` sau khi Let's Encrypt hoạt động.
- Bật WAF/rate limiting/bot protection theo nhu cầu.
- Không bật rule cache HTML toàn site nếu app có admin/auth.

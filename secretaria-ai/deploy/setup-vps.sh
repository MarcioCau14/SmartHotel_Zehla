#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# ZEHLA SmartHotel — VPS Setup Script (FASE_07)
# Uso: bash deploy/setup-vps.sh
# ============================================================

APP_DIR="/var/www/zehla"
REPO_URL="https://github.com/MarcioCau14/SmartHotel_Zehla.git"
BRANCH="develop"
NODE_VERSION="22"

echo "=== 1. System dependencies ==="
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx certbot python3-certbot-nginx ufw

echo "=== 2. Node.js $NODE_VERSION via NodeSource ==="
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g bun pm2

echo "=== 3. Clone repository ==="
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR
git clone --branch $BRANCH $REPO_URL $APP_DIR

echo "=== 4. Install & Build ==="
cd $APP_DIR
bun install --frozen-lockfile
bunx prisma generate
bun run build

echo "=== 5. Environment variables ==="
if [ ! -f .env ]; then
  echo "Crie o arquivo .env em $APP_DIR com as variáveis de produção."
  echo "Veja .env.example para referência."
  exit 1
fi

echo "=== 6. PM2 ==="
cp ecosystem.config.js $APP_DIR/.next/standalone/
pm2 start $APP_DIR/.next/standalone/ecosystem.config.js
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER

echo "=== 7. Nginx ==="
sudo cp deploy/nginx.conf /etc/nginx/sites-available/zehla
sudo ln -sf /etc/nginx/sites-available/zehla /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo "=== 8. SSL (Let's Encrypt) ==="
sudo certbot --nginx -d seuzella.com -d www.seuzella.com --non-interactive --agree-tos -m admin@seuzella.com

echo "=== 9. Firewall ==="
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo "=== 10. Backup (daily 3am) ==="
(crontab -l 2>/dev/null; echo "0 3 * * * cd $APP_DIR && pg_dump -U zehla zehla_db > backups/daily/\$(date +\\%Y-\\%m-\\%d).sql") | crontab -

echo ""
echo "Deploy concluído! Aplicação rodando em https://seuzella.com"
echo "Comandos úteis:"
echo "  pm2 status              — status dos processos"
echo "  pm2 logs zehla-app      — logs da aplicação"
echo "  sudo nginx -t           — testar config Nginx"
echo "  sudo certbot renew      — renovar SSL"

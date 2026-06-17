#!/bin/bash
# Script de Implantação Automatizada do Zélla na Hostinger KVM4
# Execute como root na VPS.

echo "======================================"
echo " Iniciando Setup do Zélla (KVM4) "
echo "======================================"

# 1. Atualizar Pacotes e Instalar Dependências
echo "[1/6] Atualizando pacotes do sistema..."
apt-get update && apt-get upgrade -y
apt-get install -y curl wget git vim ufw nginx certbot python3-certbot-nginx

# 2. Instalar Docker e Docker Compose
echo "[2/6] Instalando Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker root

# 3. Configurar Firewall (UFW)
echo "[3/6] Configurando Firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

# 4. Clonar Repositório
echo "[4/6] Configurando o código fonte..."
cd /var/www
# git clone https://github.com/MarcioCau14/SmartHotel_Zehla zella
# cd zella
echo "Neste ponto, faça o pull ou copie os arquivos para /var/www/zella"

# 5. Configurar Nginx
echo "[5/6] Configurando Proxy Reverso Nginx..."
cp /var/www/zella/deploy/nginx.conf /etc/nginx/sites-available/zella
ln -s /etc/nginx/sites-available/zella /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
systemctl restart nginx

# 6. Gerar Certificados SSL (Certbot)
echo "[6/6] Gerando certificados SSL (Certbot)..."
certbot --nginx -d meuzella.com -d app.meuzella.com -d api.meuzella.com --non-interactive --agree-tos -m admin@meuzella.com

echo "======================================"
echo " Setup Completo! O Zélla está blindado."
echo "======================================"

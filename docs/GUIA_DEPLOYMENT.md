# Guía de Deployment - LeadMaster Central Hub

## 📋 Índice

1. [Introducción](#introducción)
2. [Prerequisitos](#prerequisitos)
3. [Instalación](#instalación)
4. [Configuración](#configuración)
5. [Deployment](#deployment)
6. [Verificación](#verificación)
7. [Mantenimiento](#mantenimiento)
8. [Troubleshooting](#troubleshooting)

## 🎯 Introducción

Esta guía proporciona instrucciones detalladas para hacer deployment del sistema LeadMaster Central Hub en diferentes entornos (staging, producción).

### Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Frontend      │────│   Backend       │────│   Base de       │
│   React + Vite  │    │   Node.js       │    │   Datos MySQL   │
│   Puerto 5174   │    │   Puerto 3011   │    │   Puerto 3306   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Módulos del Sistema

- **Session Manager**: Administra conexiones WhatsApp
- **Auth**: Autenticación JWT multi-cliente
- **Sender**: Envío de mensajes masivos
- **Listener**: Respuestas automáticas
- **Leads**: Gestión de leads
- **Campaigns**: Gestión de campañas

## ⚙️ Prerequisitos

### Sistema Operativo
- Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- Usuarios con permisos sudo

### Software Requerido

```bash
# Node.js (versión 18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# MySQL/MariaDB
sudo apt update
sudo apt install mysql-server mysql-client

# Herramientas adicionales
sudo apt install git curl wget nginx pm2 -g
```

### Puertos Necesarios
- **3011**: Backend API
- **5174**: Frontend (desarrollo)
- **80/443**: Nginx (producción)
- **3306**: MySQL

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/your-org/leadmaster-central-hub.git
cd leadmaster-central-hub
```

### 2. Configurar Base de Datos

```bash
# Crear base de datos
mysql -u root -p
```

```sql
CREATE DATABASE leadmaster_db;
CREATE USER 'leadmaster_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON leadmaster_db.* TO 'leadmaster_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Importar Esquema

```bash
# Importar tablas base
mysql -u leadmaster_user -p leadmaster_db < AUXILIAR/ll_tables.sql
mysql -u leadmaster_user -p leadmaster_db < AUXILIAR/ll_whatsapp_sessions.sql

# Si tienes datos de ejemplo
mysql -u leadmaster_user -p leadmaster_db < AUXILIAR/iunaorg_dyd.sql
```

## ⚙️ Configuración

### 1. Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

```bash
# Base de datos
DB_HOST=localhost
DB_USER=leadmaster_user
DB_PASSWORD=secure_password
DB_NAME=leadmaster_db
DB_PORT=3306

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# WhatsApp
WHATSAPP_SESSION_PATH=./tokens

# Servidor
PORT=3011
NODE_ENV=production

# Logging
LOG_LEVEL=info
```

### 2. Configuración del Frontend

Editar `frontend/src/services/api.js`:

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com/api' 
  : 'http://localhost:3011';
```

### 3. Configuración de Nginx (Producción)

```nginx
# /etc/nginx/sites-available/leadmaster
server {
    listen 80;
    server_name your-domain.com;

    # Frontend estático
    location / {
        root /var/www/leadmaster/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3011/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket para WhatsApp
    location /ws/ {
        proxy_pass http://localhost:3011;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🚀 Deployment

### Opción 1: Script de Deployment Automatizado

```bash
# Deployment completo
./scripts/deploy.sh start

# Ver estado
./scripts/deploy.sh status

# Ver logs
./scripts/deploy.sh logs

# Reiniciar servicios
./scripts/deploy.sh restart

# Detener servicios
./scripts/deploy.sh stop
```

### Opción 2: Deployment Manual

#### Backend

```bash
# Instalar dependencias
npm install

# Iniciar en modo producción
NODE_ENV=production npm start

# O con PM2 (recomendado para producción)
pm2 start src/index.js --name leadmaster-backend
pm2 save
pm2 startup
```

#### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Para desarrollo
npm run dev

# Para producción
npm run build
sudo cp -r dist/* /var/www/leadmaster/frontend/
```

### Opción 3: Deployment con Docker

```bash
# Construir imagen
docker build -t leadmaster-backend .

# Ejecutar con docker-compose
docker-compose up -d

# Ver logs
docker-compose logs -f
```

## ✅ Verificación

### 1. Verificar Servicios

```bash
# Backend health check
curl http://localhost:3011/health
# Respuesta esperada: {"status":"healthy","timestamp":"..."}

# Verificar API de campañas
curl http://localhost:3011/api/campaigns
# Debe retornar array de campañas

# Frontend
curl http://localhost:5174
# Debe retornar HTML de la aplicación
```

### 2. Verificar Base de Datos

```bash
mysql -u leadmaster_user -p -e "
USE leadmaster_db;
SHOW TABLES;
SELECT COUNT(*) as campaign_count FROM ll_campanias_whatsapp;
"
```

### 3. Verificar Logs

```bash
# Logs del sistema
tail -f /var/log/leadmaster/backend.log
tail -f /var/log/leadmaster/frontend.log

# Logs de PM2 (si se usa)
pm2 logs leadmaster-backend
```

### 4. Tests de Funcionalidad

```bash
# Ejecutar tests
npm test

# Tests end-to-end
npm run test:e2e
```

## 🔧 Mantenimiento

### Actualizaciones

```bash
# Backup de base de datos
mysqldump -u leadmaster_user -p leadmaster_db > backup_$(date +%Y%m%d).sql

# Actualizar código
git pull origin main

# Reinstalar dependencias
npm install
cd frontend && npm install

# Reiniciar servicios
./scripts/deploy.sh restart
```

### Monitoreo

```bash
# Estado de servicios
systemctl status nginx
pm2 status

# Uso de recursos
htop
df -h
free -h

# Logs en tiempo real
tail -f /var/log/nginx/access.log
tail -f /var/log/leadmaster/backend.log
```

### Backup Automatizado

```bash
# Crear script de backup
sudo nano /etc/cron.daily/leadmaster-backup

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/leadmaster"
mkdir -p $BACKUP_DIR

# Backup de base de datos
mysqldump -u leadmaster_user -p$DB_PASSWORD leadmaster_db > $BACKUP_DIR/db_$DATE.sql

# Backup de archivos de sesión WhatsApp
tar -czf $BACKUP_DIR/tokens_$DATE.tar.gz tokens/

# Limpiar backups antiguos (más de 7 días)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

chmod +x /etc/cron.daily/leadmaster-backup
```

## 🛠️ Troubleshooting

### Problemas Comunes

#### 1. Backend no inicia

```bash
# Verificar logs
tail -f /var/log/leadmaster/backend.log

# Verificar puerto
netstat -tlnp | grep 3011

# Verificar base de datos
mysql -u leadmaster_user -p -e "SELECT 1"
```

**Soluciones:**
- Verificar que MySQL esté funcionando
- Verificar credenciales en `.env`
- Verificar que el puerto 3011 no esté ocupado

#### 2. Frontend no carga

```bash
# Verificar Nginx
sudo systemctl status nginx
sudo nginx -t

# Verificar archivos estáticos
ls -la /var/www/leadmaster/frontend/
```

**Soluciones:**
- Verificar configuración de Nginx
- Reconstruir frontend: `npm run build`
- Verificar permisos de archivos

#### 3. Error de base de datos

```bash
# Verificar conexión
mysql -u leadmaster_user -p leadmaster_db -e "SELECT 1"

# Verificar tablas
mysql -u leadmaster_user -p leadmaster_db -e "SHOW TABLES"
```

**Soluciones:**
- Verificar que MySQL esté ejecutándose
- Verificar credenciales
- Importar esquema si es necesario

#### 4. WhatsApp no conecta

```bash
# Verificar permisos de tokens
ls -la tokens/
chmod -R 755 tokens/

# Verificar logs de session-manager
grep "session-manager" /var/log/leadmaster/backend.log
```

**Soluciones:**
- Verificar permisos del directorio tokens/
- Escanear código QR nuevamente
- Verificar conexión a internet

### Comandos de Diagnóstico

```bash
# Estado general del sistema
./scripts/deploy.sh status

# Verificar puertos
netstat -tlnp | grep -E "(3011|5174|80|443)"

# Verificar procesos
ps aux | grep -E "(node|nginx|mysql)"

# Verificar espacio en disco
df -h

# Verificar memoria
free -h

# Verificar conectividad
curl -I http://localhost:3011/health
curl -I http://localhost:5174
```

## 📞 Soporte

Para soporte adicional:

1. **Logs**: Siempre incluir logs relevantes
2. **Configuración**: Verificar archivos `.env` y configuración
3. **Entorno**: Especificar SO, versiones de Node.js, MySQL
4. **Pasos**: Detallar pasos para reproducir el problema

---

## 📄 Archivos de Configuración de Referencia

### .env.example
```bash
# Base de datos
DB_HOST=localhost
DB_USER=leadmaster_user
DB_PASSWORD=CHANGE_THIS_PASSWORD
DB_NAME=leadmaster_db
DB_PORT=3306

# JWT
JWT_SECRET=CHANGE_THIS_JWT_SECRET_IN_PRODUCTION

# WhatsApp
WHATSAPP_SESSION_PATH=./tokens

# Servidor
PORT=3011
NODE_ENV=development

# Logging
LOG_LEVEL=info
```

### package.json scripts
```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest",
    "test:e2e": "playwright test",
    "deploy": "./scripts/deploy.sh start"
  }
}
```

---

**Última actualización**: 2025-12-19  
**Versión del documento**: 1.0
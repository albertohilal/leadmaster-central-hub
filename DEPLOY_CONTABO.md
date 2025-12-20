# Deploy a Contabo - LeadMaster Central Hub

## 1. Commit y Push del código actualizado

```bash
# En tu máquina local
cd /home/beto/Documentos/Github/leadmaster-central-hub

# Commit del .env actualizado (sin subirlo a GitHub)
git add .
git commit -m "feat: módulo sync-contacts listo para producción"
git push origin main
```

## 2. Conectar a Contabo vía SSH

```bash
ssh root@desarrolloydisenioweb.com.ar
# O el usuario/IP que uses
```

## 3. Actualizar código en servidor

```bash
# En Contabo
cd /var/www/leadmaster-central-hub  # O la ruta donde esté

# Pull últimos cambios
git pull origin main

# Instalar nuevas dependencias
npm install
```

## 4. Configurar variables de entorno

```bash
# Editar .env en Contabo
nano .env
```

**Agregar estas variables:**
```bash
# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
GOOGLE_REDIRECT_URI=https://desarrolloydisenioweb.com.ar/sync-contacts/callback

# Puerto (verificar que sea el correcto)
PORT=3012
```

## 5. Reiniciar aplicación

```bash
# Si usas PM2
pm2 restart leadmaster-hub

# O si usas systemd
sudo systemctl restart leadmaster-hub

# Verificar logs
pm2 logs leadmaster-hub --lines 50
```

## 6. Verificar que el módulo está activo

```bash
# Test desde Contabo
curl http://localhost:3012/health
```

## 7. Probar autorización OAuth

Desde el navegador, ir a:
```
https://desarrolloydisenioweb.com.ar/sync-contacts/authorize/51
```

Esto debería:
- Redirigir a Google para autorizar
- Solicitar permisos de contactos
- Redirigir de vuelta y guardar tokens

## 8. Verificar primera sincronización

```bash
# Desde Contabo o con Postman/Insomnia
curl -X POST https://desarrolloydisenioweb.com.ar/sync-contacts/sync/51 \
  -H "Authorization: Bearer TU_TOKEN_JWT_DE_HABY"
```

---

## Troubleshooting

### Error: "Cannot find module 'googleapis'"
```bash
cd /var/www/leadmaster-central-hub
npm install googleapis
pm2 restart leadmaster-hub
```

### Error: "GOOGLE_CLIENT_ID is not defined"
- Verificar que el `.env` tiene las variables correctas
- Reiniciar el servidor después de editar `.env`

### Error 404 en /sync-contacts/authorize/51
- Verificar que el módulo está cargado en src/index.js
- Revisar logs: `pm2 logs leadmaster-hub`

---

## Checklist Deploy

- [ ] Git pull en Contabo
- [ ] npm install ejecutado
- [ ] .env actualizado con Google OAuth
- [ ] Servidor reiniciado
- [ ] Health check OK
- [ ] Módulo sync-contacts responde
- [ ] Autorización OAuth funciona
- [ ] Primera sincronización exitosa

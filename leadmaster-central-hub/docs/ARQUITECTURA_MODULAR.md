# Estructura propuesta para leadmaster-central-hub
# -----------------------------
# Envíos masivos (campañas, mensajes) - Estructura y Endpoints

## 📦 Estructura modular propuesta

```

```
leadmaster-central-hub/
│
├── src/
│   ├── index.js                # Entry point principal (Express)
│   ├── config/                  # Configuración y utilidades globales
│   ├── modules/
│   │   ├── session-manager/     # Gestión de sesiones/conexiones WhatsApp
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── ...
│   │   ├── sender/              # Envíos masivos (campañas, mensajes)

## 🚦 Endpoints principales propuestos

### Campañas
- `GET /sender/campaigns` — Listar campañas
- `POST /sender/campaigns` — Crear campaña
- `GET /sender/campaigns/:id` — Detalle de campaña
- `PUT /sender/campaigns/:id` — Editar campaña
- `DELETE /sender/campaigns/:id` — Eliminar campaña

### Envíos/Mensajes
- `POST /sender/messages/send` — Enviar mensaje individual
- `POST /sender/messages/send-bulk` — Enviar mensajes masivos (campaña)
- `GET /sender/messages/status/:id` — Estado de envío

## 🔗 Integración
- Todos los envíos deben usar la sesión activa de WhatsApp (validar antes de enviar).
- Sin código inline: toda lógica en controladores y servicios.
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── ...
│   │   ├── listener/            # Listener y respuestas automáticas (IA, reglas)
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── ...
│   │   ├── scraper/             # Scraping y enriquecimiento de leads (Google Places, etc)
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── ...
│   │   └── leads/               # Gestión de leads, clientes, integración con Dolibarr
│   │       ├── controllers/
│   │       ├── routes/
│   │       ├── services/
│   │       └── ...
│   ├── services/                # Servicios globales reutilizables
│   └── utils/                   # Utilidades generales
│
├── scripts/                     # Scripts de verificación, migración, etc.
├── .env                         # Variables de entorno
├── package.json
├── README.md
└── ...
```

## Descripción de módulos clave
- **session-manager:**
  - Inicia, cierra, reconecta y monitorea sesiones WhatsApp por cliente.
  - Endpoints: conectar, desconectar, estado, logs, etc.
- **sender:**
  - Lógica de envío masivo, campañas, programación, reportes.
  - Usa la sesión activa del cliente.
- **listener:**
  - Escucha mensajes entrantes y ejecuta respuestas automáticas (IA, reglas, etc).
  - Puede consumir eventos de session-manager.
- **scraper:**
  - Scraping de Google Places y otras fuentes para alimentar leads/clientes.
  - Similar a la lógica de desarrolloydisenio-api.
- **leads:**
  - Gestión de leads, clientes, integración con Dolibarr y otras fuentes.

## Notas
- Cada módulo es independiente y puede tener sus propios controladores, rutas y servicios.
- El workspace puede incluir los proyectos legacy como referencia para migración y comparación.
- La estructura es escalable y permite agregar nuevos canales o integraciones fácilmente.

---

_Esta estructura está documentada en este archivo para referencia y planificación._

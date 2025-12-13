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


## 🚦 Endpoints principales implementados


### Campañas
- `GET /sender/campaigns` — Listar campañas
  - **Response:**
    ```json
    [
      { "id": 1, "nombre": "Campaña Demo", "estado": "activa" }
    ]
    ```
- `POST /sender/campaigns` — Crear campaña
  - **Request:**
    ```json
    { "nombre": "Campaña Test", "descripcion": "Campaña de prueba" }
    ```
  - **Response:**
    ```json
    { "id": 1017, "nombre": "Campaña Test", "descripcion": "Campaña de prueba", "estado": "activa", "creada": "2025-12-13T15:08:13.000Z" }
    ```
- `GET /sender/campaigns/:id` — Detalle de campaña
  - **Response:**
    ```json
    { "id": 1, "nombre": "Campaña Demo", "estado": "activa", "descripcion": "Demo", "creada": "2025-12-13T00:00:00.000Z" }
    ```
- `PUT /sender/campaigns/:id` — Editar campaña
  - **Request:**
    ```json
    { "nombre": "Campaña Editada" }
    ```
  - **Response:**
    ```json
    { "id": 1, "nombre": "Campaña Editada", "descripcion": "Demo", "estado": "activa", "actualizada": "2025-12-13T15:29:06.146Z" }
    ```
- `DELETE /sender/campaigns/:id` — Eliminar campaña
  - **Response:**
    ```json
    { "success": true, "id": 1 }
    ```


### Envíos y Mensajes
- `GET /sender/envios` — Listar envíos
  - **Response:**
    ```json
    [
      { "id": 1, "campaña": "Campaña Demo", "destinatario": "+5491112345678", "estado": "enviado", "fecha": "2025-12-13" },
      { "id": 2, "campaña": "Campaña Navidad", "destinatario": "+5491198765432", "estado": "pendiente", "fecha": "2025-12-13" }
    ]
    ```
- `POST /sender/messages/send` — Enviar mensaje individual
  - **Request:**
    ```json
    { "destinatario": "+5491112345678", "mensaje": "Hola!" }
    ```
  - **Response:**
    ```json
    { "id": 446, "destinatario": "+5491112345678", "mensaje": "Hola!", "estado": "enviado", "fecha": "2025-12-13T15:29:15.017Z" }
    ```
- `POST /sender/messages/send-bulk` — Enviar mensajes masivos (campaña)
  - **Request:**
    ```json
    { "campañaId": 1, "mensajes": [ { "destinatario": "+5491112345678", "mensaje": "Hola!" } ] }
    ```
  - **Response:**
    ```json
    { "campañaId": 1, "enviados": 1, "estado": "procesando" }
    ```
- `GET /sender/messages/status/:id` — Estado de envío
  - **Response:**
    ```json
    { "id": "1", "estado": "enviado", "fecha": "2025-12-13T00:00:00.000Z" }
    ```

---

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

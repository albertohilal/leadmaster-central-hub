# LeadMaster Central Hub

Sistema modular completo para gestión de leads y comunicación automatizada con WhatsApp.

## 🚀 Características Principales

### ✅ Backend (Node.js + Express)
- **Session Manager:** Gestión multi-sesión de WhatsApp con venom-bot
- **Sender:** Envíos masivos y campañas programadas
- **Listener:** Respuestas automáticas con IA (OpenAI GPT-4)
- **API REST:** Arquitectura modular y desacoplada
- **Tests:** Suite completa con Playwright (29/29 tests passing)

### ✅ Frontend (React + Vite + Tailwind CSS)
- **Dashboard:** Métricas en tiempo real del sistema
- **Gestión WhatsApp:** Control de sesión, QR, estado y logs
- **Leads Manager:** CRUD completo con filtros y búsqueda
- **Listener Control:** Gestión de modos y respuestas automáticas
- **Campaigns:** Creación y monitoreo de envíos masivos
- **Configuración:** Panel de ajustes del sistema

## 📁 Estructura del Proyecto

```
leadmaster-central-hub/
├── src/                        # Backend Node.js
│   ├── modules/
│   │   ├── session-manager/    # Gestión de sesiones WhatsApp
│   │   ├── sender/             # Envíos masivos
│   │   ├── listener/           # Bot responder con IA
│   │   └── auth/               # Sistema de autenticación JWT
│   ├── services/               # Servicios compartidos
│   ├── config/                 # Configuración y DB pool
│   └── index.js                # Punto de entrada
│
├── frontend/                   # Dashboard React
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   ├── contexts/           # Auth context
│   │   ├── services/           # API client
│   │   └── App.jsx
│   ├── public/
│   │   └── assets/             # Logos y recursos
│   └── package.json
│
├── tests/                      # Tests de API con Playwright
├── docs/                       # 📚 Documentación consolidada
│   ├── README.md              # Índice de documentación
│   ├── PRIORIDADES_DESARROLLO.md
│   ├── ARQUITECTURA_MODULAR.md
│   ├── AUTENTICACION.md       # Sistema de auth JWT
│   ├── INSTALACION_AUTH.md    # Guía de instalación auth
│   ├── frontend/              # Docs específicas de frontend
│   │   ├── ARQUITECTURA_FRONTEND.md
│   │   ├── GUIA_RAPIDA.md
│   │   └── PRIORIDADES_FRONTEND.md
│   └── backend/               # Futuras docs de backend
│
└── package.json
```

## 🛠️ Instalación y Configuración

### Prerequisitos
- Node.js 18+
- MySQL
- OpenAI API Key

### 1. Instalar Dependencias del Backend

```bash
npm install
```

### 2. Configurar Variables de Entorno

Copiar `.env.example` a `.env` y configurar:

```env
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=iunaorg_dyd

# OpenAI
OPENAI_API_KEY=tu_api_key

# Puertos
PORT=3010
FRONTEND_PORT=5173
```

### 3. Instalar Dependencias del Frontend

```bash
cd frontend
npm install
```

## 🚀 Iniciar la Aplicación

### Opción 1: Backend y Frontend por Separado

**Terminal 1 - Backend:**
```bash
node src/index.js
```
El backend estará disponible en: http://localhost:3010

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
El frontend estará disponible en: http://localhost:5173

### Opción 2: Usando Tasks de VS Code

El proyecto incluye tasks configuradas:
- "Start leadmaster-central-hub (fixed)"
- Luego manualmente iniciar el frontend

## 📡 Endpoints de API

### Session Manager
- `GET /session-manager/status` - Estado de la sesión
- `GET /session-manager/qr` - Obtener código QR
- `POST /session-manager/disconnect` - Cerrar sesión

### Listener
- `GET /listener/status` - Estado del listener
- `POST /listener/mode` - Cambiar modo (off/listen/respond)
- `POST /listener/ia/enable` - Habilitar IA para un lead
- `POST /listener/ia/disable` - Deshabilitar IA para un lead

### Sender
- `POST /sender/messages/send` - Enviar mensaje individual
- `POST /sender/messages/bulk` - Envío masivo
- `GET /sender/messages/status/:id` - Estado de mensaje

Ver documentación completa en: `docs/ENDPOINTS_SESSION_MANAGER.md`

## 🧪 Testing

Ejecutar suite de tests:

```bash
npx playwright test
```

Ver reporte:

```bash
npx playwright show-report
```

**Cobertura actual:** 29/29 tests passing ✅

## 📱 Uso del Dashboard

1. Abre http://localhost:5173 en tu navegador
2. El dashboard mostrará el estado del sistema en tiempo real
3. Navega por las secciones usando el menú lateral:
   - **Dashboard:** Métricas generales
   - **WhatsApp:** Gestionar sesión y QR
   - **Leads:** CRUD de leads con toggle de IA
   - **Listener:** Control de respuestas automáticas
   - **Campañas:** Crear y monitorear envíos masivos
   - **Configuración:** Ajustes del sistema

## 📚 Documentación

### Backend
- **Arquitectura Modular:** `docs/ARQUITECTURA_MODULAR.md`
- **Prioridades de Desarrollo:** `docs/PRIORIDADES_DESARROLLO.md`
- **Endpoints:** `docs/ENDPOINTS_SESSION_MANAGER.md`

### Frontend
- **Arquitectura Completa:** `frontend/docs/ARQUITECTURA_FRONTEND.md` ⭐
  - Stack tecnológico explicado
  - Componentes React
  - Flujo de datos
  - Patrones y buenas prácticas
- **Guía Rápida:** `frontend/docs/GUIA_RAPIDA.md` ⭐
  - Inicio rápido
  - Tareas comunes
  - Debugging
  - Tips y trucos

## 🎯 Stack Tecnológico

### Backend
- Node.js + Express
- MySQL (base de datos)
- Venom-bot (WhatsApp)
- OpenAI GPT-4 (IA)
- Playwright (testing)

### Frontend
- React 18.2
- Vite 5 (build tool)
- Tailwind CSS 3
- React Router 6
- Axios (HTTP client)

## 🔐 Seguridad

- **JWT Authentication:** Sistema completo con tokens y bcrypt
- **Protección de rutas:** Middleware en todos los módulos backend
- **Variables sensibles:** `.env` no versionado
- **Validación de datos:** En backend y frontend
- **Multi-tenant:** Sesiones por cliente_id
- **Manejo de errores:** Consistente y seguro

## 📚 Documentación

La documentación completa está consolidada en `/docs/`:

- **[Índice de documentación](docs/README.md)** - Punto de entrada
- **[Prioridades de desarrollo](docs/PRIORIDADES_DESARROLLO.md)** - Plan maestro
- **[Arquitectura modular](docs/ARQUITECTURA_MODULAR.md)** - Backend
- **[Sistema de autenticación](docs/AUTENTICACION.md)** - JWT completo
- **[Arquitectura frontend](docs/frontend/ARQUITECTURA_FRONTEND.md)** - React/Vite/Tailwind
- **[Guía rápida frontend](docs/frontend/GUIA_RAPIDA.md)** - Inicio rápido

## 🚧 Roadmap

### Completado ✅
- [x] Gestión de sesiones WhatsApp multi-cliente
- [x] Envíos masivos y campañas
- [x] Listener con IA (OpenAI GPT-4)
- [x] **Frontend completo con React**
- [x] **Sistema de autenticación JWT**
- [x] **Branding DyD integrado**
- [x] Suite de tests (29/29 passing)

### Próximas Funcionalidades
- [ ] Gestión de leads/clientes (Backend API completa)
- [ ] Integración con Dolibarr
- [ ] Scraping de Google Places
- [ ] WebSockets para tiempo real
- [ ] Analytics avanzados y reportes

## 🤝 Contribución

Este es un proyecto de Desarrollo y Diseño. Para contribuir:
1. Lee la [documentación completa](docs/README.md)
2. Sigue la arquitectura modular establecida
3. Escribe tests para nuevas funcionalidades
4. Actualiza la documentación en `/docs/`

## 📄 Licencia

© 2025 Desarrollo y Diseño - Todos los derechos reservados

---

**Para comenzar a desarrollar en el frontend:**
Lee primero `/frontend/docs/ARQUITECTURA_FRONTEND.md` para entender React, Vite y Tailwind CSS desde cero.

**Para tareas rápidas:**
Usa `/frontend/docs/GUIA_RAPIDA.md` como referencia rápida.
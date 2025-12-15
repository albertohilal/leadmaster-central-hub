# Agenda de la Próxima Jornada

Fecha: 14 de diciembre de 2025

## Objetivos
- Dejar el proyecto con estructura base (backend y frontend) lista para implementar lógica.
- Preparar autenticación, scheduler y tareas de ejecución en VS Code.
- Revisar documentación para reflejar el scaffold y flujos principales.

## Tareas

### Scaffold backend
- Crear estructura Express modular en `src/modules/{auth, session-manager, listener, sender}`.
- Añadir rutas y controladores base (placeholders) y server bootstrap en `src/index.js` (puerto `3010`).
- Preparar carpetas comunes: `src/config`, `src/services`, `src/utils`.

### Scaffold frontend
- Inicializar Vite React con router, layout (`Header`/`Sidebar`), `AuthContext`.
- Crear vistas base de campañas y programaciones.
- Configurar `VITE_API_URL` para llamadas al backend.

### Auth + scheduler
- Implementar middleware JWT.
- Añadir scheduler mínimo para programaciones.
- Preparar perfiles de Chrome por `clienteId` para sesiones de WhatsApp.

### VS Code tasks
- Agregar tasks para backend (`node src/index.js`) y frontend (`npm run dev`).

### Lanzamiento y verificación local
- Correr backend en `http://localhost:3010` y frontend en `http://localhost:5173`.
- Realizar smoke tests básicos de rutas y vistas.

### Documentación
- Actualizar `docs/ARQUITECTURA_MODULAR.md` con el scaffold y responsabilidades.
- Consolidar `docs/PRIORIDADES_FRONTEND.md` con vistas y flujos principales.

## Estado actual
- Checklist verificado y requisitos aclarados en `.github/copilot-instructions.md`.
- Listener auditado: consume únicamente APIs de `session-manager` vía `whatsappService`.
- Tests de guardrails agregados y validados.

## Notas
- Mantener separación estricta de módulos: el `listener` no debe tocar Venom directamente.
- Usar entorno de prueba (`NODE_ENV=test`) para bypass de auth en suites de test, y JWT en producción.
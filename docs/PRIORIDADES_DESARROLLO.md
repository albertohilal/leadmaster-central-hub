# Prioridades de desarrollo - leadmaster-central-hub

> **Regla clave:** Ningún endpoint, router ni módulo debe tener código inline. Todo handler, lógica o respuesta debe estar en controladores o servicios desacoplados.

## Orden de prioridades

1. **Gestión de sesiones/conexiones WhatsApp** ✅ _completado_
   - Multi-sesión, login/logout, estado, reconexión.
   - Endpoints: iniciar sesión, cerrar sesión, estado de sesión, logs.
   - Implementado con venom-bot centralizado en session-manager.
2. **Envíos masivos (campañas, mensajes)** ✅ _completado_
   - Creación y gestión de campañas, envíos, reportes.
   - Integración con la sesión activa del cliente.
   - Módulo sender integrado con session-manager.
3. **Listener y respuestas automáticas (IA, reglas)** ✅ _completado_
   - Escucha de mensajes entrantes y respuestas automáticas.
   - Integración con IA y reglas personalizadas.
   - Control de IA por lead persistente en MySQL.
   - Integración con OpenAI para respuestas inteligentes.
   - Módulo listener integrado con session-manager.
   - **Suite de tests automatizados con Playwright (29 tests de API REST)**
   - **100% de cobertura de tests (29/29 tests passing)** ✅
4. **Frontend Web (Dashboard)** 🎨 ✅ _completado_
   - Interfaz web completa con React + Vite + Tailwind CSS
   - Dashboard principal con estado del sistema
   - Gestión visual de sesión WhatsApp (QR, estado, logs)
   - Panel de campañas y envíos masivos
   - Gestión de leads/clientes con búsqueda y filtros
   - Control del listener y respuestas automáticas
   - Configuración del sistema
   - **Sistema de autenticación completo con JWT** ✅
   - **Login con tabla ll_usuarios (bcrypt + JWT)** ✅
   - **Protección de todas las rutas con middleware** ✅
   - **Branding DyD con logos integrados** ✅
   - **Sistema multi-tenant por cliente_id** ✅
   - **Ubicación:** `/frontend/`
   - **Documentación:** 
     - `/docs/frontend/ARQUITECTURA_FRONTEND.md` (guía completa React/Vite/Tailwind)
     - `/docs/frontend/GUIA_RAPIDA.md` (inicio rápido)
     - `/docs/frontend/PRIORIDADES_FRONTEND.md` (fases de desarrollo)
     - `/docs/AUTENTICACION.md` (sistema de auth completo)
5. **Gestión de leads/clientes (Backend)**
   - Consulta, edición y administración de leads/clientes existentes.
   - Integración con Dolibarr y otras fuentes (sin scraping nuevo por ahora).
6. **Scraping y enriquecimiento de leads**
   - Scraping de Google Places y otras fuentes para alimentar leads/clientes.
   - Similar a la lógica de desarrolloydisenio-api.

## Notas
- El primer objetivo es entregar un sistema funcional para Haby, sin incorporar nuevos leads por el momento.
- El workspace debe mantener los proyectos legacy como referencia, pero toda la lógica nueva debe seguir la arquitectura modular y desacoplada.
- La documentación y las prioridades deben mantenerse actualizadas en este archivo.

---

_Este archivo sirve como guía de prioridades y estándar de calidad para el desarrollo del sistema._

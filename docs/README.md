# Documentación - LeadMaster Central Hub

Documentación completa del sistema LeadMaster Central Hub.

## 📚 Índice de documentación

### 📋 Planificación y prioridades
- **[PRIORIDADES_DESARROLLO.md](PRIORIDADES_DESARROLLO.md)** - Plan maestro de desarrollo del proyecto
- **[frontend/PRIORIDADES_FRONTEND.md](frontend/PRIORIDADES_FRONTEND.md)** - Fases de desarrollo del frontend
- **[AGENDA_PROXIMA_JORNADA.md](AGENDA_PROXIMA_JORNADA.md)** - Agenda con objetivos y tareas próximas

### 🏗️ Arquitectura
- **[ARQUITECTURA_MODULAR.md](ARQUITECTURA_MODULAR.md)** - Arquitectura modular del backend
- **[frontend/ARQUITECTURA_FRONTEND.md](frontend/ARQUITECTURA_FRONTEND.md)** - Arquitectura del frontend React

### 🔐 Autenticación y seguridad
- **[AUTENTICACION.md](AUTENTICACION.md)** - Sistema de autenticación JWT completo
- **[INSTALACION_AUTH.md](INSTALACION_AUTH.md)** - Guía de instalación del sistema de auth

### 🔌 API y endpoints
- **[ENDPOINTS_SESSION_MANAGER.md](ENDPOINTS_SESSION_MANAGER.md)** - Documentación de endpoints del session-manager

### 🚀 Guías rápidas
- **[frontend/GUIA_RAPIDA.md](frontend/GUIA_RAPIDA.md)** - Inicio rápido para desarrollo frontend

---

## 📂 Estructura de documentación

```
/docs/
├── README.md                          # Este archivo (índice)
├── PRIORIDADES_DESARROLLO.md         # Plan maestro del proyecto
├── ARQUITECTURA_MODULAR.md           # Arquitectura backend
├── AUTENTICACION.md                  # Sistema de auth JWT
├── INSTALACION_AUTH.md               # Instalación del auth
├── ENDPOINTS_SESSION_MANAGER.md      # API del session-manager
├── frontend/                         # 📁 Documentación del frontend
│   ├── ARQUITECTURA_FRONTEND.md     # Guía completa React/Vite/Tailwind
│   ├── GUIA_RAPIDA.md               # Inicio rápido frontend
│   └── PRIORIDADES_FRONTEND.md      # Fases de desarrollo frontend
└── backend/                          # 📁 Futura documentación backend
    └── (pendiente)
```

---

## 🎯 Por dónde empezar

### Si eres nuevo en el proyecto:
1. Lee **[PRIORIDADES_DESARROLLO.md](PRIORIDADES_DESARROLLO.md)** para entender el alcance
2. Revisa **[ARQUITECTURA_MODULAR.md](ARQUITECTURA_MODULAR.md)** para la estructura backend
3. Lee **[AUTENTICACION.md](AUTENTICACION.md)** para entender la seguridad

### Si vas a trabajar en el frontend:
1. Lee **[frontend/ARQUITECTURA_FRONTEND.md](frontend/ARQUITECTURA_FRONTEND.md)** - guía completa para principiantes
2. Consulta **[frontend/GUIA_RAPIDA.md](frontend/GUIA_RAPIDA.md)** - tareas comunes
3. Revisa **[frontend/PRIORIDADES_FRONTEND.md](frontend/PRIORIDADES_FRONTEND.md)** - estado del desarrollo

### Si vas a consumir la API:
1. Revisa **[ENDPOINTS_SESSION_MANAGER.md](ENDPOINTS_SESSION_MANAGER.md)**
2. Lee **[AUTENTICACION.md](AUTENTICACION.md)** para JWT tokens

---

## 📝 Mantener la documentación

**Reglas:**
- ✅ Un solo lugar para cada tipo de documentación
- ✅ Documentación de frontend en `/docs/frontend/`
- ✅ Documentación de backend en `/docs/backend/`
- ✅ Documentación general en `/docs/`
- ❌ NO crear `/frontend/docs/` (duplicación)
- ❌ NO documentar en archivos dispersos

**Al agregar nueva documentación:**
1. Crear archivo en `/docs/` o subcarpeta apropiada
2. Actualizar este README.md con el link
3. Actualizar PRIORIDADES_DESARROLLO.md si aplica

---

**Última actualización:** 14 de diciembre de 2025  
**Proyecto:** LeadMaster Central Hub - Desarrollo y Diseño

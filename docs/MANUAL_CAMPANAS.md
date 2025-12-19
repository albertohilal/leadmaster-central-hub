# Manual de Usuario - Gestión de Campañas

## Índice
1. [Acceso a la Gestión de Campañas](#acceso)
2. [Vista General](#vista-general)
3. [Estadísticas Principales](#estadisticas)
4. [Programación de Campañas](#programacion)
5. [Gestión de Campañas Existentes](#gestion-campanas)
6. [Funciones Avanzadas](#funciones-avanzadas)
7. [Guía de Solución de Problemas](#troubleshooting)

---

## 1. Acceso a la Gestión de Campañas {#acceso}

### Navegación
1. Inicia sesión en LeadMaster con tus credenciales
2. En el panel lateral izquierdo, haz clic en "📨 Campañas"
3. Serás redirigido a la vista principal de gestión de campañas

### Permisos Requeridos
- **Usuario Cliente**: Acceso completo a sus propias campañas
- **Usuario Admin**: Acceso a todas las campañas del sistema

---

## 2. Vista General {#vista-general}

La interfaz de Campañas está dividida en tres secciones principales:

### Encabezado
- **Título**: "Gestión de Campañas"
- **Descripción**: "Administra tus envíos masivos de WhatsApp"
- **Botón de Acción**: "+ Nueva Campaña" (azul, esquina superior derecha)

### Secciones Principales
1. **Panel de Estadísticas** (4 tarjetas en fila)
2. **Programación de Campañas** (2 columnas)
3. **Lista de Campañas** (vista detallada)

---

## 3. Estadísticas Principales {#estadisticas}

### Tarjetas de Métricas
Las estadísticas se muestran en 4 tarjetas:

#### 📊 Activas
- **Descripción**: Campañas actualmente en ejecución
- **Color**: Verde (indica estado positivo)
- **Valor**: Número de campañas con estado "activa"

#### 📋 Completadas  
- **Descripción**: Campañas finalizadas exitosamente
- **Color**: Azul (indica finalización)
- **Valor**: Número de campañas con estado "completada"

#### 📤 Mensajes Enviados
- **Descripción**: Total de mensajes enviados por todas las campañas
- **Color**: Gris (neutral)
- **Valor**: 200 (valor fijo por ahora)

#### 📈 Total Campañas
- **Descripción**: Número total de campañas creadas
- **Color**: Gris (neutral)
- **Valor**: Suma de todas las campañas

---

## 4. Programación de Campañas {#programacion}

### 4.1 Nueva Programación (Columna Izquierda)

#### Campos del Formulario

##### **Campaña**
- **Campo**: Desplegable "Selecciona campaña"
- **Función**: Elegir la campaña a programar
- **Obligatorio**: ✅ Sí

##### **Días de la semana**
- **Opciones**: Lun, Mar, Mié, Jue, Vie, Sáb, Dom
- **Función**: Seleccionar múltiples días (checkboxes)
- **Comportamiento**: Permite seleccionar uno o varios días
- **Obligatorio**: ✅ Sí (al menos un día)

##### **Horarios**
- **Hora inicio**: Campo de tiempo (formato HH:MM:SS)
- **Hora fin**: Campo de tiempo (formato HH:MM:SS)
- **Valor por defecto**: 09:00:00 - 01:00:00
- **Obligatorio**: ✅ Sí

##### **Configuración Adicional**
- **Cupo diario**: Número de mensajes por día (campo numérico)
- **Fecha inicio**: Selector de fecha (dd/mm/aaaa)
- **Fecha fin**: Selector de fecha opcional
- **Comentario**: Campo de texto libre

##### **Botón de Acción**
- **Texto**: "Crear Programación" (azul)
- **Función**: Guardar la nueva programación

### 4.2 Programaciones Existentes (Columna Derecha)

#### Filtros Disponibles
- **Estado**: Desplegable con opciones:
  - Todos
  - Pendiente
  - Aprobada 
  - Rechazada
  - Pausada

#### **Botón Actualizar**
- **Icono**: 🔄
- **Función**: Recargar lista de programaciones

#### Tarjetas de Programación

Cada programación se muestra como una tarjeta con:

##### **Información Principal**
- **Título**: Nombre de la campaña o "Campaña [ID]"
- **Layout**: Grid de 2 columnas en desktop

##### **Detalles**
- 📅 **Días**: Lista de días seleccionados (MON, TUE, etc.)
- 🕒 **Horario**: Rango de horas (HH:MM - HH:MM)
- 👥 **Cupo diario**: Número de mensajes permitidos
- 📊 **Estado**: Badge con color según estado:
  - 🟢 Verde: Aprobada
  - 🟡 Amarillo: Pendiente
  - 🔴 Rojo: Rechazada
  - ⚫ Gris: Otros estados

##### **Comentarios del Admin** (si existen)
- **Diseño**: Caja azul con borde izquierdo
- **Contenido**: Comentario del administrador

---

## 5. Gestión de Campañas Existentes {#gestion-campanas}

### 5.1 Lista de Campañas

#### Formato de Tarjeta Individual

##### **Encabezado**
- **Nombre de campaña**: Título principal (texto grande, negrita)
- **Estado**: Badge coloreado junto al nombre
  - 🟢 "Activa" (verde)
  - 🔵 "Completada" (azul)
  - 🟡 "Programada" (amarillo)
  - ⚫ "Pausada" (gris)
- **Descripción**: Texto explicativo bajo el título
- **Fecha de creación**: Texto pequeño gris
- **Botón**: "Ver Estadísticas" (azul, lado derecho)

##### **Barra de Progreso**
- **Etiqueta**: "Progreso del envío"
- **Contador**: "X / Y" (enviados / total)
- **Visual**: Barra horizontal verde
- **Altura**: 12px con esquinas redondeadas

##### **Métricas (Grid 2x2 en móvil, 1x4 en desktop)**

**🏢 Destinatarios**
- **Fondo**: Gris claro
- **Valor**: Número total de destinatarios
- **Descripción**: "Destinatarios"

**✅ Enviados**
- **Fondo**: Verde claro
- **Color texto**: Verde
- **Valor**: Mensajes enviados exitosamente

**❌ Fallidos**
- **Fondo**: Rojo claro  
- **Color texto**: Rojo
- **Valor**: Mensajes que fallaron

**📈 Tasa de Éxito**
- **Fondo**: Azul claro
- **Color texto**: Azul
- **Valor**: Porcentaje de éxito (Enviados/Total * 100)

### 5.2 Crear Nueva Campaña

#### Acceso
- Clic en botón "+ Nueva Campaña" (esquina superior derecha)
- Se abre modal/ventana emergente

#### Campos del Modal

##### **Información Básica**
- **Nombre**: Campo de texto obligatorio
- **Placeholder**: "Ej: Promoción Navidad 2025"
- **Descripción**: Campo de texto opcional (área de texto, 3 filas)

##### **Configuración**
- **Mensaje**: Campo de área de texto (contenido del mensaje)
- **Programada**: Checkbox para envío programado
- **Fecha de envío**: Selector de fecha (si está programada)

##### **Botones**
- **Cancelar**: Cierra el modal sin guardar
- **Guardar**: Crea la campaña y actualiza la lista

---

## 6. Funciones Avanzadas {#funciones-avanzadas}

### 6.1 Estados de Campaña

#### Estados Disponibles
- **Activa**: Campaña en ejecución
- **Completada**: Finalizada exitosamente
- **Programada**: Pendiente de ejecución
- **Pausada**: Temporalmente detenida

#### Transiciones de Estado
```
Programada → Activa → Completada
     ↓           ↓
   Pausada ← Pausada
```

### 6.2 Programación Inteligente

#### Funciones del Sistema
- **Validación de horarios**: Evita conflictos de programación
- **Cupos diarios**: Control automático de límites
- **Estados de aprobación**: Workflow de autorización admin

#### Algoritmo de Envío
1. **Filtrado por día**: Solo campañas del día actual
2. **Verificación de horario**: Dentro del rango programado
3. **Control de cupo**: Respeta límite diario
4. **Distribución**: Envío uniforme en el rango horario

### 6.3 Métricas y Análisis

#### Cálculos Automáticos
- **Tasa de éxito**: (Enviados / Total) × 100
- **Progreso**: (Enviados + Fallidos) / Total × 100
- **Eficiencia**: Enviados / (Enviados + Fallidos) × 100

#### Colores de Estado
- **Verde**: Éxito, activo, aprobado
- **Azul**: Información, completado
- **Amarillo**: Advertencia, pendiente
- **Rojo**: Error, rechazado, fallido
- **Gris**: Neutral, pausado, inactivo

---

## 7. Guía de Solución de Problemas {#troubleshooting}

### Problemas Comunes

#### "No se pueden crear programaciones"
**Posibles causas:**
- No hay campañas disponibles
- Usuario sin permisos
- Error de conexión

**Solución:**
1. Verificar que existan campañas creadas
2. Contactar admin si no tienes permisos
3. Actualizar la página

#### "Programación no se guarda"
**Posibles causas:**
- Campos obligatorios vacíos
- Conflicto de horarios
- Error de validación

**Solución:**
1. Revisar todos los campos obligatorios:
   - ✅ Campaña seleccionada
   - ✅ Al menos un día marcado
   - ✅ Horario válido (inicio < fin)
   - ✅ Cupo > 0
2. Verificar formato de fechas
3. Intentar con horarios diferentes

#### "Estadísticas no se actualizan"
**Posibles causas:**
- Cache del navegador
- Error de sincronización

**Solución:**
1. Hacer clic en "🔄 Actualizar"
2. Refrescar la página (F5)
3. Limpiar cache del navegador

#### "Campaña no aparece en la lista"
**Posibles causas:**
- Campaña de otro cliente
- Estado filtrado
- Error de permisos

**Solución:**
1. Verificar usuario correcto
2. Revisar filtros aplicados
3. Contactar soporte técnico

### Limitaciones del Sistema

#### Restricciones Técnicas
- **Máximo programaciones**: Sin límite específico
- **Horario mínimo**: 1 hora de duración
- **Cupo mínimo**: 1 mensaje por día
- **Días múltiples**: Permite selección multiple

#### Funciones Beta
- Estadísticas en tiempo real
- Programación avanzada por zonas horarias
- Templates de mensaje dinámicos

---

## Contacto y Soporte

### Información de Contacto
- **Sistema**: LeadMaster Central Hub v1.0.0
- **Desarrollado por**: Desarrollo y Diseño
- **Año**: © 2025

### Reportar Problemas
1. Capturar pantalla del error
2. Anotar pasos para reproducir
3. Contactar al administrador del sistema
4. Proporcionar usuario y hora del incidente

---

**Última actualización**: 19 de diciembre de 2025  
**Versión del manual**: 1.0.0
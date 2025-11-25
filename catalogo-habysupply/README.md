# Catálogo HabySupply - Sistema de Procesamiento Automático de Catálogos PDF

Sistema automatizado para procesar catálogos en PDF, extraer información de productos, detectar imágenes y almacenar datos en MySQL utilizando OpenAI Vision API.

## 📋 Características

- ✅ Extracción de páginas PDF a imágenes PNG de alta resolución
- ✅ Detección y división de bloques de productos en cada página
- ✅ Análisis de texto con extracción de SKU, nombres, precios y descripciones
- ✅ Detección automática de imágenes de productos usando visión computacional
- ✅ Análisis inteligente con OpenAI GPT-4 Vision para matching SKU-imagen
- ✅ Almacenamiento estructurado en base de datos MySQL
- ✅ Scripts modulares y reutilizables

## 🏗️ Estructura del Proyecto

```
catalogo-habysupply/
│
├── pdf/                          # Catálogos PDF de entrada
│   └── catalogo.pdf
│
├── output/                       # Archivos generados
│   ├── pages/                   # Páginas extraídas (PNG)
│   ├── blocks/                  # Bloques de productos divididos
│   ├── productos/               # Imágenes de productos extraídas
│   ├── productos_texto.json     # Productos extraídos del texto
│   ├── image_map.json           # Mapeo de imágenes a bloques
│   └── productos_completos.json # Productos finales con imágenes
│
├── scripts/                      # Scripts de procesamiento
│   ├── extract_pages.js         # Extracción de páginas PDF
│   ├── detect_blocks.js         # División en bloques
│   ├── parse_text.js            # Análisis de texto
│   ├── extract_images.js        # Extracción de imágenes
│   ├── match_images_to_sku.js   # Matching con OpenAI Vision
│   └── to_mysql.js              # Inserción en base de datos
│
├── config/                       # Configuración
│   ├── database.js              # Conexión MySQL
│   └── openai.js                # Cliente OpenAI
│
├── .env                         # Variables de entorno
├── .gitignore                   # Archivos ignorados
├── package.json                 # Dependencias del proyecto
└── README.md                    # Este archivo
```

## 🚀 Instalación

### Prerrequisitos

- **Node.js** v18 o superior
- **npm** o **yarn**
- **MySQL** 5.7 o superior
- **Poppler** (para pdf-poppler)
- **OpenAI API Key** (para GPT-4 Vision)

#### Instalar Poppler (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install poppler-utils
```

#### Instalar Poppler (macOS)
```bash
brew install poppler
```

### Instalación del Proyecto

1. **Clonar el repositorio**
```bash
git clone https://github.com/albertohilal/catalogo-habysupply.git
cd catalogo-habysupply
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Editar el archivo `.env` con tus credenciales:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=catalogo_habysupply

# PDF Processing Configuration
PDF_INPUT_PATH=./pdf/catalogo.pdf
OUTPUT_PAGES_DIR=./output/pages
OUTPUT_BLOCKS_DIR=./output/blocks
OUTPUT_PRODUCTOS_DIR=./output/productos
```

4. **Crear base de datos MySQL**
```sql
CREATE DATABASE catalogo_habysupply CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. **Colocar el catálogo PDF**

Copiar tu archivo PDF en la carpeta `pdf/` con el nombre `catalogo.pdf` o actualizar la ruta en `.env`.

## 📖 Uso

### Proceso Completo (Automático)

Ejecutar todos los scripts en secuencia:

```bash
npm run process:all
```

### Ejecución Individual de Scripts

#### 1. Extraer Páginas del PDF
Convierte el PDF en imágenes PNG de alta resolución:

```bash
npm run extract:pages
# o
node scripts/extract_pages.js
```

**Salida:** `output/pages/page-1.png`, `page-2.png`, etc.

#### 2. Detectar y Dividir Bloques
Divide cada página en bloques de productos (por defecto: mitad superior/inferior):

```bash
npm run detect:blocks
# o
node scripts/detect_blocks.js
```

**Salida:** `output/blocks/page-1_top.png`, `page-1_bottom.png`, etc.

#### 3. Analizar Texto del PDF
Extrae información textual (SKU, nombres, precios, descripciones):

```bash
npm run parse:text
# o
node scripts/parse_text.js
```

**Salida:** `output/productos_texto.json`

**Ejemplo de salida:**
```json
[
  {
    "sku": "PEN-002",
    "nombre": "BRONC V2 WIRELESS",
    "descripcion": "Auriculares inalámbricos con cancelación de ruido",
    "precio_lista": 15999.99,
    "precio_efectivo": 13499.99,
    "pagina": 8
  }
]
```

#### 4. Extraer Imágenes de Productos
Detecta y extrae imágenes individuales de cada bloque:

```bash
npm run extract:images
# o
node scripts/extract_images.js
```

**Salida:** 
- `output/productos/page-1_top_img1.png`, etc.
- `output/image_map.json` (mapeo de imágenes a bloques)

#### 5. Matching con OpenAI Vision
Usa GPT-4 Vision para analizar bloques y asociar SKUs con imágenes:

```bash
npm run match:sku
# o
node scripts/match_images_to_sku.js
```

**Salida:** `output/productos_completos.json`

**Ejemplo de salida:**
```json
[
  {
    "sku": "PEN-002",
    "nombre": "BRONC V2 WIRELESS",
    "descripcion": "Auriculares inalámbricos...",
    "precio_lista": 15999.99,
    "precio_efectivo": 13499.99,
    "pagina": 8,
    "posicion": "top",
    "num_imagenes": 2,
    "tipo_producto": "Auriculares",
    "imagenes": [
      "productos/page-8_top_img1.png",
      "productos/page-8_top_img2.png"
    ],
    "matched": true,
    "confidence": "high"
  }
]
```

#### 6. Insertar en MySQL
Carga todos los productos e imágenes en la base de datos:

```bash
npm run to:mysql
# o
node scripts/to_mysql.js
```

**Acciones:**
- Crea tablas automáticamente si no existen
- Inserta o actualiza productos (por SKU)
- Asocia imágenes con productos

## 🗄️ Esquema de Base de Datos

### Tabla: `productos`
```sql
CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(100) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio_lista DECIMAL(10, 2),
  precio_efectivo DECIMAL(10, 2),
  pagina INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabla: `imagenes`
```sql
CREATE TABLE imagenes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  ruta_imagen VARCHAR(500) NOT NULL,
  tipo ENUM('principal', 'accesorio') DEFAULT 'principal',
  orden INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);
```

## 🛠️ Tecnologías Utilizadas

- **Node.js** - Runtime de JavaScript
- **pdf-poppler** - Conversión de PDF a imágenes
- **pdf-parse** - Extracción de texto de PDF
- **sharp** - Procesamiento de imágenes de alto rendimiento
- **jimp** - Análisis y manipulación de imágenes
- **OpenAI GPT-4 Vision** - Análisis inteligente de imágenes
- **MySQL2** - Base de datos relacional
- **dotenv** - Gestión de variables de entorno

## 🔧 Personalización

### Cambiar el Método de División de Bloques

Editar `scripts/detect_blocks.js` para implementar diferentes estrategias de división (por ejemplo, detección automática de bordes, grid 3x3, etc.).

### Ajustar Expresiones Regulares

Modificar los regex en `scripts/parse_text.js` para adaptarse a diferentes formatos de catálogo:

```javascript
const skuRegex = /SKU[:\s]*([A-Z0-9\-]+)/gi;
const priceRegex = /\$\s*(\d+[\.,]?\d*)/g;
```

### Configurar Prompts de OpenAI

Editar `config/openai.js` para personalizar las instrucciones del modelo Vision.

## 📊 Ejemplo de Flujo Completo

```bash
# 1. Preparar entorno
npm install
# Configurar .env con credenciales
# Colocar catalogo.pdf en pdf/

# 2. Ejecutar pipeline completo
npm run process:all

# 3. Insertar en base de datos
npm run to:mysql

# 4. Verificar resultados
ls -lh output/pages/
ls -lh output/blocks/
cat output/productos_completos.json
```

## 🐛 Troubleshooting

### Error: "poppler not found"
```bash
# Ubuntu/Debian
sudo apt-get install poppler-utils

# macOS
brew install poppler
```

### Error: "OpenAI API connection failed"
- Verificar que `OPENAI_API_KEY` esté correctamente configurada en `.env`
- Asegurar saldo suficiente en la cuenta de OpenAI
- Verificar límites de rate limit de la API

### Error: "Database connection failed"
- Verificar que MySQL esté en ejecución
- Comprobar credenciales en `.env`
- Asegurar que la base de datos exista

### Imágenes no se extraen correctamente
- Ajustar parámetros de detección en `scripts/extract_images.js`
- Aumentar o disminuir el umbral de `contentRatio`
- Implementar algoritmos más sofisticados de detección de bordes

## 📝 Licencia

MIT

## 👤 Autor

Alberto Hilal

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Soporte

Para preguntas o problemas, abre un issue en GitHub.

---

**⚡ Happy Coding!**

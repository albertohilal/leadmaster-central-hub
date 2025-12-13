// Punto de entrada principal
require('dotenv').config();

const express = require('express');
const app = express();

app.use(express.json());

// Placeholder para rutas principales
app.get('/', (req, res) => {
  res.json({
    name: 'Leadmaster Central Hub',
    status: 'ok',
    version: '1.0.0',
    modules: ['sender', 'listener', 'scraper', 'leads']
  });
});

// Importar rutas del módulo sender
const senderRoutes = require('./modules/sender/routes');
app.use('/sender', senderRoutes);

// Importar rutas del módulo session-manager
const sessionManagerRoutes = require('./modules/session-manager/routes');
app.use('/session-manager', sessionManagerRoutes);


// Importar rutas del módulo listener
const listenerRoutes = require('./modules/listener/routes/listenerRoutes');
app.use('/listener', listenerRoutes);

const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
  console.log(`Leadmaster Central Hub corriendo en http://localhost:${PORT}`);
  
  // Inicializar cliente WhatsApp automáticamente al arrancar
  const sessionService = require('./modules/session-manager/services/sessionService');
  console.log('🟢 Inicializando sesión de WhatsApp...');
  sessionService.getOrCreateClient();
});

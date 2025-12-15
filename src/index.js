// Punto de entrada principal
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();

// Configurar CORS para permitir requests del frontend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

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

// Importar rutas del módulo auth
const authRoutes = require('./modules/auth/routes/authRoutes');
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
  console.log(`Leadmaster Central Hub corriendo en http://localhost:${PORT}`);
  console.log('⚪ WhatsApp en espera. Usa el botón "Conectar WhatsApp" desde el dashboard.');
  
  // Cargar sesiones existentes (opcional) y arrancar scheduler
  if (process.env.NODE_ENV !== 'test') {
    const sessionService = require('./modules/session-manager/services/sessionService');
    const { start: startProgramacionScheduler } = require('./modules/sender/services/programacionScheduler');
    setTimeout(() => {
      if (String(process.env.SESSION_AUTO_RECONNECT || 'false').toLowerCase() === 'true') {
        console.log('🔄 [session-manager] Buscando sesiones guardadas...');
        sessionService.loadExistingSessions();
      } else {
        console.log('⏸️ [session-manager] Auto-reconexión desactivada. Los clientes iniciarán sesión desde el botón Conectar WhatsApp.');
      }
      console.log('⏱️ [sender] Iniciando scheduler de programaciones...');
      startProgramacionScheduler();
    }, 3000); // Esperar 3 segundos después de iniciar el servidor
  }
});

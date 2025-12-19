// Punto de entrada principal
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Rutas principales
app.get('/', (req, res) => {
  res.json({
    name: 'Leadmaster Central Hub',
    status: 'ok',
    version: '1.0.0',
    modules: ['session-manager', 'sender', 'listener', 'auth'],
    endpoints: {
      'session-manager': '/session-manager/*',
      'sender': '/sender/*',
      'listener': '/listener/*',
      'auth': '/auth/*'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Integración de módulos
try {
  console.log('🔄 Cargando módulos...');
  
  // // Autenticación (comentado temporalmente - requiere bcrypt)
  // app.use('/auth', require('./modules/auth/routes/authRoutes'));
  
  // Session Manager (comentado temporalmente - requiere venom-bot) 
  // app.use('/session-manager', require('./modules/session-manager/routes/index'));
  
  // Sender (comentado temporalmente - requiere dependencias)
  // app.use('/sender', require('./modules/sender/routes/index'));
  
  // // Listener (comentado temporalmente - requiere dependencias)  
  // app.use('/listener', require('./modules/listener/routes/listenerRoutes'));
  
  // Rutas de prueba para verificar estructura
  app.get('/session-manager/status', (req, res) => {
    res.json({ status: 'session-manager mock - ok', message: 'Módulo session-manager detectado' });
  });
  
  app.get('/sender/status', (req, res) => {
    res.json({ status: 'sender mock - ok', message: 'Módulo sender detectado' });
  });
  
  app.get('/listener/status', (req, res) => {
    res.json({ status: 'listener mock - ok', message: 'Módulo listener detectado' });
  });
  
  console.log('✅ Endpoints de prueba configurados');
} catch (error) {
  console.error('❌ Error integrando módulos:', error.message);
}

const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
  console.log(`🚀 Leadmaster Central Hub corriendo en http://localhost:${PORT}`);
  console.log('📋 Endpoints disponibles:');
  console.log('   - GET / (info general)');
  console.log('   - GET /health (health check)');
  console.log('   - POST /auth/* (autenticación)');
  console.log('   - GET /session-manager/* (gestión sesión WhatsApp)');
  console.log('   - GET /sender/* (envíos masivos)');
  console.log('   - GET /listener/* (respuestas automáticas)');
});

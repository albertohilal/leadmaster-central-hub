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
  
  // Autenticación (activado)
  app.use('/auth', require('./modules/auth/routes/authRoutes'));
  console.log('✅ Módulo auth activado');
  
  // Session Manager (activando)
  app.use('/session-manager', require('./modules/session-manager/routes/index'));
  console.log('✅ Módulo session-manager activado');
  
  // Sender (activando)
  app.use('/sender', require('./modules/sender/routes/index'));
  console.log('✅ Módulo sender activado');
  
  // Listener (activando)
  app.use('/listener', require('./modules/listener/routes/listenerRoutes'));
  console.log('✅ Módulo listener activado');
  
  // Ya no necesitamos rutas mock - todos los módulos están activos
  console.log('🎉 TODOS LOS MÓDULOS ACTIVADOS - SISTEMA LISTO PARA PRODUCCIÓN');
  
  console.log('✅ Endpoints de prueba configurados');
} catch (error) {
  console.error('❌ Error integrando módulos:', error.message);
  console.error('Stack:', error.stack);
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

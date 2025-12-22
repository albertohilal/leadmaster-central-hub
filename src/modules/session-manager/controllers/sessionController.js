// Controlador para gestión de sesiones WhatsApp multi-tenant
const sessionService = require('../services/sessionService');
const QRCode = require('qrcode');

exports.status = (req, res) => {
  const clienteId = req.user.cliente_id;
  const state = sessionService.getSessionState(clienteId);
  res.json({ 
    status: 'session-manager ok',
    clienteId,
    whatsappState: state
  });
};

exports.login = (req, res) => {
  try {
    const clienteId = req.user.cliente_id;
    const currentState = sessionService.getSessionState(clienteId);
    
    // Si ya está conectado o conectando, no hacer nada
    if (currentState.ready) {
      return res.json({ 
        success: true,
        message: 'WhatsApp ya está conectado',
        state: currentState
      });
    }
    
    if (currentState.connecting) {
      return res.json({ 
        success: true,
        message: 'WhatsApp ya se está conectando',
        state: currentState
      });
    }
    
    // NUEVO: Limpiar tokens corruptos antes de iniciar
    console.log(`🧹 [session-controller] Limpiando tokens corruptos para cliente ${clienteId}`);
    sessionService.cleanTokens(clienteId);
    
    // Iniciar conexión para este cliente
    console.log(`🟢 [session-controller] Cliente ${clienteId} solicitó conectar WhatsApp`);
    sessionService.getOrCreateClient(clienteId);
    
    res.json({ 
      success: true,
      message: 'Iniciando conexión WhatsApp. Escanea el QR cuando aparezca.',
      state: sessionService.getSessionState(clienteId)
    });
  } catch (error) {
    console.error('❌ [session-controller] Error en login:', error.message);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const clienteId = req.user.cliente_id;
    console.log(`🔴 [session-controller] Cliente ${clienteId} solicitó desconectar WhatsApp`);
    await sessionService.disconnect(clienteId);
    res.json({ 
      success: true,
      message: 'WhatsApp desconectado correctamente',
      state: sessionService.getSessionState(clienteId)
    });
  } catch (error) {
    console.error('❌ [session-controller] Error en logout:', error.message);
    res.status(500).json({ 
      success: false,
      error: error.message,
      state: sessionService.getSessionState(req.user.cliente_id)
    });
  }
};

exports.state = (req, res) => {
  const clienteId = req.user.cliente_id;
  const state = sessionService.getSessionState(clienteId);
  res.json(state);
};

// Endpoint para obtener el QR como imagen PNG (base64)
exports.qr = async (req, res) => {
  const clienteId = req.user.cliente_id;
  const qr = sessionService.getQR(clienteId);
  
  if (!qr) {
    return res.status(404).json({ 
      error: 'QR no disponible. Espera a que se genere o verifica el estado en /session-manager/state' 
    });
  }
  
  try {
    const qrDataURL = await QRCode.toDataURL(qr, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' }
    });
    const base64Data = qrDataURL.replace(/^data:image\/png;base64,/, '');
    const imgBuffer = Buffer.from(base64Data, 'base64');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(imgBuffer);
  } catch (err) {
    res.status(500).json({ error: 'Error generando QR', details: err.message });
  }
};

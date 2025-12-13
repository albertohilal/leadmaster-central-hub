// Controlador para gestión de sesiones WhatsApp
const sessionService = require('../services/sessionService');
const QRCode = require('qrcode');

exports.status = (req, res) => {
  res.json({ status: 'session-manager ok' });
};

exports.login = (req, res) => {
  // Lógica de login (placeholder)
  res.json({ message: 'login iniciado (placeholder)' });
};

exports.logout = (req, res) => {
  // Lógica de logout (placeholder)
  res.json({ message: 'logout iniciado (placeholder)' });
};

exports.state = (req, res) => {
  const state = sessionService.getSessionState();
  res.json(state);
};

// Endpoint para obtener el QR como imagen PNG (base64)
exports.qr = async (req, res) => {
  const qr = sessionService.getQR();
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

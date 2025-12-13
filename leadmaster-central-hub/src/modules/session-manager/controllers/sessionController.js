// Controlador para gestión de sesiones WhatsApp
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


// --- Lógica real de QR WhatsApp ---
const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
let wappClient = null;
let lastQR = null;
let clientReady = false;

// Inicializar cliente WhatsApp si no existe
function getOrCreateClient() {
  if (!wappClient) {
    wappClient = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });
    wappClient.on('qr', qr => {
      lastQR = qr;
      clientReady = false;
      console.log('🔑 [session-manager] QR recibido. Escanéalo con WhatsApp.');
      console.log(qr);
    });
    wappClient.on('ready', () => {
      clientReady = true;
      console.log('✅ [session-manager] Cliente WhatsApp listo (ready)');
    });
    wappClient.on('authenticated', () => {
      clientReady = false;
      console.log('🔐 [session-manager] Cliente autenticado');
    });
    wappClient.on('disconnected', () => {
      clientReady = false;
      lastQR = null;
      wappClient = null;
      console.log('⚠️ [session-manager] Cliente WhatsApp desconectado');
    });
    console.log('🟢 [session-manager] Inicializando cliente WhatsApp...');
    wappClient.initialize();
  }
  return wappClient;
}

exports.state = (req, res) => {
  getOrCreateClient();
  res.json({
    state: clientReady ? 'conectado' : (lastQR ? 'qr' : 'desconectado'),
    hasQR: !!lastQR
  });
};

// Endpoint para obtener el QR como imagen PNG (base64)
exports.qr = async (req, res) => {
  getOrCreateClient();
  if (!lastQR) {
    return res.status(404).json({ error: 'QR no disponible. Espera a que se genere.' });
  }
  try {
    const qrDataURL = await QRCode.toDataURL(lastQR, {
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

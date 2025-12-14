// Servicio central de gestión de sesiones WhatsApp con venom-bot
const venom = require('venom-bot');

let wappClient = null;
let lastQR = null;
let clientReady = false;

// Inicializar cliente WhatsApp si no existe
function getOrCreateClient() {
  if (!wappClient) {
    console.log('🟢 [session-manager] Inicializando cliente WhatsApp con venom-bot...');
    
    venom
      .create({
        session: 'leadmaster-central-hub',
        headless: false,
        useChrome: true,
        executablePath: '/usr/bin/google-chrome-stable',
        disableSpins: true,
        browserArgs: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ],
        puppeteerOptions: {
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          headless: true
        },
        catchQR: (base64Qr, asciiQR, attempts, urlCode) => {
          lastQR = base64Qr;
          clientReady = false;
          console.log('🔑 [session-manager] QR recibido. Escanéalo con WhatsApp.');
          console.log('📱 [session-manager] Accede a /session-manager/qr para obtener el QR como imagen');
          console.log(`Intento ${attempts}/5`);
        },
        statusFind: (statusSession, sessionName) => {
          console.log(`🔍 [session-manager] Estado: ${statusSession}`);
        }
      })
      .then((client) => {
        wappClient = client;
        clientReady = true;
        lastQR = null;
        console.log('✅ [session-manager] Cliente WhatsApp listo (ready)');
      })
      .catch((error) => {
        console.error('❌ [session-manager] Error al iniciar cliente:', error.message);
        clientReady = false;
        wappClient = null;
      });
  }
  return wappClient;
}

// Obtener el cliente (sin inicializar si no existe)
function getClient() {
  return wappClient;
}

// Obtener estado de la sesión
function getSessionState() {
  getOrCreateClient(); // Asegura que el cliente esté inicializándose
  return {
    state: clientReady ? 'conectado' : (lastQR ? 'qr' : 'desconectado'),
    hasQR: !!lastQR,
    ready: clientReady
  };
}

// Obtener el QR actual
function getQR() {
  return lastQR;
}

// Verificar si el cliente está listo
function isReady() {
  return clientReady;
}

// Enviar mensaje (requiere cliente listo)
async function sendMessage(phoneNumber, message) {
  if (!clientReady || !wappClient) {
    throw new Error('Cliente WhatsApp no está listo. Estado: ' + getSessionState().state);
  }

  try {
    const formattedNumber = phoneNumber.includes('@c.us') 
      ? phoneNumber 
      : `${phoneNumber}@c.us`;
    
    await wappClient.sendText(formattedNumber, message);
    console.log(`✅ [session-manager] Mensaje enviado a ${phoneNumber}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ [session-manager] Error enviando mensaje a ${phoneNumber}:`, error.message);
    throw error;
  }
}

module.exports = {
  getOrCreateClient,
  getClient,
  getSessionState,
  getQR,
  isReady,
  sendMessage
};

// Servicio central de gestión de sesiones WhatsApp multi-tenant con venom-bot
const venom = require('venom-bot');
const path = require('path');
const fs = require('fs');

// Almacenar múltiples clientes (clienteId => { client, qr, ready, connecting })
const clientSessions = new Map();

/**
 * Cargar sesiones existentes del disco al iniciar
 */
function loadExistingSessions() {
  const tokensPath = path.join(__dirname, '../../../tokens');
  
  try {
    if (!fs.existsSync(tokensPath)) {
      console.log('📁 [session-manager] No hay sesiones previas');
      return;
    }

    const folders = fs.readdirSync(tokensPath);
    const clientFolders = folders.filter(f => f.startsWith('client_'));
    
    if (clientFolders.length === 0) {
      console.log('📁 [session-manager] No hay sesiones de clientes guardadas');
      return;
    }

    console.log(`📁 [session-manager] Encontradas ${clientFolders.length} sesiones guardadas`);
    
    clientFolders.forEach(folder => {
      const match = folder.match(/client_(\d+)/);
      if (match) {
        const clienteId = parseInt(match[1]);
        console.log(`🔄 [session-manager] Reconectando cliente ${clienteId}...`);
        
        // Inicializar sesión sin esperar (async)
        setTimeout(() => {
          getOrCreateClient(clienteId, folder);
        }, 2000); // Esperar 2 segundos entre cada reconexión
      }
    });
  } catch (error) {
    console.error('❌ [session-manager] Error cargando sesiones:', error.message);
  }
}

/**
 * Obtener o crear cliente para un cliente específico
 * @param {number} clienteId - ID del cliente
 * @param {string} sessionName - Nombre de la sesión (opcional)
 */
function getOrCreateClient(clienteId, sessionName = null) {
  const session = clientSessions.get(clienteId);
  
  // Si ya existe y está listo o conectando, retornar
  if (session && (session.ready || session.connecting)) {
    return session.client;
  }

  // Si no existe, crear nueva sesión
  if (!session || !session.connecting) {
    const name = sessionName || `client_${clienteId}`;
    console.log(`🟢 [session-manager] Inicializando WhatsApp para cliente ${clienteId} (${name})...`);
    
    // Inicializar estado
    clientSessions.set(clienteId, {
      client: null,
      qr: null,
      ready: false,
      connecting: true,
      sessionName: name
    });
    
    const userDataDir = path.join(process.env.HOME || '/home/beto', '.leadmaster-chrome-profiles', name);
    try {
      fs.mkdirSync(userDataDir, { recursive: true });
    } catch {}
    venom
      .create({
        session: name,
        headless: 'new',
        useChrome: true,
        executablePath: '/usr/bin/google-chrome-stable',
        disableSpins: true,
        folderNameToken: path.join(__dirname, '../../../tokens'),
        browserArgs: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          `--user-data-dir=${userDataDir}`,
          '--remote-debugging-port=0',
          '--disable-extensions',
          '--disable-features=Translate,OptimizationHints'
        ],
        puppeteerOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            `--user-data-dir=${userDataDir}`
          ],
          headless: 'new'
        },
        catchQR: (base64Qr, asciiQR, attempts, urlCode) => {
          const sess = clientSessions.get(clienteId);
          if (sess) {
            sess.qr = base64Qr;
            sess.ready = false;
            console.log(`🔑 [session-manager] QR recibido para cliente ${clienteId}. Intento ${attempts}/5`);
            console.log(`📱 [session-manager] QR disponible en: GET /session-manager/qr`);
            console.log(`🔗 [session-manager] URL Code: ${urlCode}`);
          } else {
            console.error(`❌ [session-manager] Sesión no encontrada para cliente ${clienteId}`);
          }
        },
        statusFind: (statusSession, sessionName) => {
          console.log(`🔍 [session-manager] Cliente ${clienteId}: ${statusSession}`);
        }
      })
      .then((client) => {
        const sess = clientSessions.get(clienteId);
        if (sess) {
          sess.client = client;
          sess.ready = true;
          sess.qr = null;
          sess.connecting = false;
          console.log(`✅ [session-manager] Cliente ${clienteId} WhatsApp listo`);
        }
      })
      .catch((error) => {
        console.error(`❌ [session-manager] Error cliente ${clienteId}:`, error.message);
        const sess = clientSessions.get(clienteId);
        if (sess) {
          sess.ready = false;
          sess.client = null;
          sess.connecting = false;
        }
      });
  }
  
  return clientSessions.get(clienteId)?.client;
}

/**
 * Obtener cliente ya existente (sin inicializar)
 */
function getClient(clienteId) {
  return clientSessions.get(clienteId)?.client;
}

/**
 * Obtener estado de la sesión de un cliente
 */
function getSessionState(clienteId) {
  const session = clientSessions.get(clienteId);
  
  if (!session) {
    return {
      state: 'desconectado',
      hasQR: false,
      ready: false,
      connecting: false
    };
  }
  
  return {
    state: session.ready ? 'conectado' : (session.connecting ? 'conectando' : (session.qr ? 'qr' : 'desconectado')),
    hasQR: !!session.qr,
    ready: session.ready,
    connecting: session.connecting
  };
}

/**
 * Obtener QR de un cliente
 */
function getQR(clienteId) {
  return clientSessions.get(clienteId)?.qr;
}

/**
 * Verificar si el cliente está listo
 */
function isReady(clienteId) {
  return clientSessions.get(clienteId)?.ready || false;
}

/**
 * Enviar mensaje para un cliente específico
 */
async function sendMessage(clienteId, phoneNumber, message) {
  const session = clientSessions.get(clienteId);
  
  if (!session || !session.ready || !session.client) {
    throw new Error(`Cliente ${clienteId} WhatsApp no está listo. Estado: ${getSessionState(clienteId).state}`);
  }

  try {
    const formattedNumber = phoneNumber.includes('@c.us') 
      ? phoneNumber 
      : `${phoneNumber}@c.us`;
    
    await session.client.sendText(formattedNumber, message);
    console.log(`✅ [session-manager] Mensaje enviado a ${phoneNumber} desde cliente ${clienteId}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ [session-manager] Error enviando mensaje cliente ${clienteId}:`, error.message);
    throw error;
  }
}

/**
 * Desconectar sesión de un cliente
 */
async function disconnect(clienteId) {
  const session = clientSessions.get(clienteId);
  
  try {
    if (session && session.client) {
      console.log(`🔴 [session-manager] Desconectando cliente ${clienteId}...`);
      
      // Intentar cerrar el cliente de venom-bot
      try {
        await session.client.logout();
        console.log(`✅ [session-manager] Logout ejecutado para cliente ${clienteId}`);
      } catch (logoutError) {
        console.warn(`⚠️ [session-manager] Error en logout, intentando close...`);
      }
      
      try {
        await session.client.close();
        console.log(`✅ [session-manager] Cliente ${clienteId} cerrado`);
      } catch (closeError) {
        console.warn(`⚠️ [session-manager] Error cerrando cliente: ${closeError.message}`);
      }
      
      // Eliminar tokens guardados
      const sessionName = session.sessionName || `client_${clienteId}`;
      const tokensPath = path.join(__dirname, '../../../tokens', sessionName);
      
      if (fs.existsSync(tokensPath)) {
        try {
          fs.rmSync(tokensPath, { recursive: true, force: true });
          console.log(`🗑️ [session-manager] Tokens eliminados para cliente ${clienteId}`);
        } catch (fsError) {
          console.warn(`⚠️ [session-manager] Error eliminando tokens: ${fsError.message}`);
        }
      }
    }
    
    // Eliminar de memoria
    clientSessions.delete(clienteId);
    console.log(`✅ [session-manager] Cliente ${clienteId} desconectado completamente`);
    
    return { success: true, message: 'Desconectado correctamente' };
  } catch (error) {
    console.error(`❌ [session-manager] Error al desconectar cliente ${clienteId}:`, error.message);
    // Forzar eliminación aunque falle
    clientSessions.delete(clienteId);
    throw error;
  }
}

/**
 * Obtener todas las sesiones activas
 */
function getAllSessions() {
  const sessions = [];
  clientSessions.forEach((session, clienteId) => {
    sessions.push({
      clienteId,
      sessionName: session.sessionName,
      state: getSessionState(clienteId)
    });
  });
  return sessions;
}

module.exports = {
  getOrCreateClient,
  getClient,
  getSessionState,
  getQR,
  isReady,
  sendMessage,
  disconnect,
  getAllSessions,
  loadExistingSessions
};

// Control de IA por lead (persistente en MySQL)
const pool = require('../db/db');

async function setIAControl(telefono, enabled) {
  if (!telefono) return { success: false, error: 'Teléfono requerido' };
  try {
    await pool.execute(
      'INSERT INTO ll_ia_control (telefono, ia_enabled) VALUES (?, ?) ON DUPLICATE KEY UPDATE ia_enabled = VALUES(ia_enabled)',
      [telefono, enabled]
    );
    return { success: true, telefono, ia_enabled: enabled };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function isIAEnabled(telefono) {
  if (!telefono) return true;
  try {
    const [rows] = await pool.execute('SELECT ia_enabled FROM ll_ia_control WHERE telefono = ?', [telefono]);
    if (rows.length > 0) return !!rows[0].ia_enabled;
    return true;
  } catch (err) {
    return true; // fallback seguro
  }
}
// Servicio principal del listener: gestiona modo y logs
const logs = [];
let mode = process.env.LISTENER_MODE || 'listen';

function getStatus() {
  return { mode };
}

function setMode(newMode) {
  if (['listen', 'respond'].includes(newMode)) {
    mode = newMode;
    return { success: true, mode };
  }
  return { success: false, error: 'Modo inválido' };
}

function getLogs() {
  return logs;
}


// Procesamiento real de mensajes entrantes
const iaService = require('./../ia/iaService');
const { isWhatsappSessionActive, enviarWhatsapp } = require('./whatsappService');

/**
 * Procesa un mensaje entrante y responde si corresponde (IA/reglas)
 * @param {Object} message - { cliente_id, telefono, texto }
 * @returns {Promise<Object>} { respuesta, enviado, error }
 */
async function onMessageReceived(message) {
  logs.push({ timestamp: Date.now(), message });
  if (mode !== 'respond') return { respuesta: null, enviado: false, error: 'Modo no respond' };
  
  const iaEnabled = await isIAEnabled(message.telefono);
  if (!iaEnabled) {
    console.log(`🔇 [listener] IA deshabilitada para ${message.telefono}`);
    return { respuesta: null, enviado: false, error: 'IA deshabilitada para este lead' };
  }

  // Validar sesión de WhatsApp
  const sesionActiva = await isWhatsappSessionActive(message.cliente_id);
  if (!sesionActiva) {
    const sessionService = require('../../session-manager/services/sessionService');
    const state = sessionService.getSessionState();
    const errorMsg = `Sesión de WhatsApp ${state.state}. ${state.state === 'qr' ? 'Escanea el QR en /session-manager/qr' : 'Verifica /session-manager/state'}`;
    
    console.warn(`⚠️ [listener] ${errorMsg}`);
    logs.push({ timestamp: Date.now(), error: errorMsg });
    return { respuesta: null, enviado: false, error: errorMsg };
  }

  // IA/reglas
  const respuesta = await iaService.responder(message);
  let enviado = false;
  let error = null;
  
  if (respuesta) {
    enviado = await enviarWhatsapp(message.cliente_id, message.telefono, respuesta);
    if (!enviado) {
      error = 'No se pudo enviar el mensaje por WhatsApp';
      console.error(`❌ [listener] ${error}`);
    } else {
      console.log(`✅ [listener] Respuesta enviada a ${message.telefono}: "${respuesta}"`);
    }
  }
  
  logs.push({ timestamp: Date.now(), response: respuesta, enviado, error });
  return { respuesta, enviado, error };
}

module.exports = {
  getStatus,
  setMode,
  getLogs,
  onMessageReceived,
  setIAControl,
  isIAEnabled,
};

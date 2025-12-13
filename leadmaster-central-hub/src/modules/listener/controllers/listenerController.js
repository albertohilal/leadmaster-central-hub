// POST /listener/test-message
exports.testMessage = async (req, res) => {
  let { cliente_id, telefono, texto } = req.body;
  if (!cliente_id || !telefono || !texto) {
    return res.status(400).json({ error: 'Faltan datos requeridos: cliente_id, telefono, texto' });
  }
  cliente_id = Number(cliente_id);
  try {
    const result = await listenerService.onMessageReceived({ cliente_id, telefono, texto });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Habilitar IA para un lead
exports.enableIA = async (req, res) => {
  const { telefono } = req.body;
  const result = await listenerService.setIAControl(telefono, true);
  res.json(result);
};

// Deshabilitar IA para un lead
exports.disableIA = async (req, res) => {
  const { telefono } = req.body;
  const result = await listenerService.setIAControl(telefono, false);
  res.json(result);
};
// ListenerController: gestiona eventos de mensajes entrantes y respuestas automáticas
const listenerService = require('../services/listenerService');

// GET /listener/status
exports.getStatus = (req, res) => {
  const status = listenerService.getStatus();
  res.json(status);
};

// POST /listener/mode
exports.setMode = (req, res) => {
  const { mode } = req.body;
  const result = listenerService.setMode(mode);
  res.json(result);
};

// GET /listener/logs
exports.getLogs = (req, res) => {
  const logs = listenerService.getLogs();
  res.json(logs);
};

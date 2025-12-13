// Controlador de mensajes (mock)
exports.send = (req, res) => {
  const { destinatario, mensaje } = req.body;
  if (!destinatario || !mensaje) {
    return res.status(400).json({ error: 'destinatario y mensaje son requeridos' });
  }
  res.status(201).json({ id: Math.floor(Math.random() * 10000), destinatario, mensaje, estado: 'enviado', fecha: new Date().toISOString() });
};

exports.sendBulk = (req, res) => {
  const { campañaId, mensajes } = req.body;
  if (!campañaId || !Array.isArray(mensajes)) {
    return res.status(400).json({ error: 'campañaId y mensajes[] son requeridos' });
  }
  res.status(201).json({ campañaId, enviados: mensajes.length, estado: 'procesando' });
};

exports.status = (req, res) => {
  const { id } = req.params;
  res.json({ id, estado: 'enviado', fecha: '2025-12-13T00:00:00.000Z' });
};

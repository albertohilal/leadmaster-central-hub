// Controlador de campañas (campañas WhatsApp)
exports.list = (req, res) => {
  // TODO: Integrar con base de datos real
  res.json([
    { id: 1, nombre: 'Campaña Demo', estado: 'activa' }
  ]);
};

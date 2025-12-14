

// Controlador de campañas (campañas WhatsApp)
exports.list = (req, res) => {
  // TODO: Integrar con base de datos real
  res.json([
    { id: 1, nombre: 'Campaña Demo', estado: 'activa' }
  ]);
};

// Detalle de campaña (mock)
exports.detail = (req, res) => {
  const { id } = req.params;
  // Simulación de búsqueda
  if (id === '1') {
    res.json({ id: 1, nombre: 'Campaña Demo', estado: 'activa', descripcion: 'Demo', creada: '2025-12-13T00:00:00.000Z' });
  } else {
    res.status(404).json({ error: 'Campaña no encontrada' });
  }
};

// Editar campaña (mock)
exports.update = (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;
  if (id !== '1') return res.status(404).json({ error: 'Campaña no encontrada' });
  res.json({ id: 1, nombre: nombre || 'Campaña Demo', descripcion: descripcion || 'Demo', estado: 'activa', actualizada: new Date().toISOString() });
};

// Eliminar campaña (mock)
exports.remove = (req, res) => {
  const { id } = req.params;
  if (id !== '1') return res.status(404).json({ error: 'Campaña no encontrada' });
  res.json({ success: true, id: 1 });
};

// Crear campaña (mock)
exports.create = (req, res) => {
  const { nombre, descripcion } = req.body;
  if (!nombre) {
    return res.status(400).json({ error: 'El nombre de la campaña es requerido' });
  }
  // Simulación de creación
  res.status(201).json({
    id: Math.floor(Math.random() * 10000),
    nombre,
    descripcion: descripcion || '',
    estado: 'activa',
    creada: new Date().toISOString()
  });
};

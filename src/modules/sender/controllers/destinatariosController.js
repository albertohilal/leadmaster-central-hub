const db = require('../../../config/db');

const destinatariosController = {
  // Obtener destinatarios de una campaña específica
  async getDestinatariosCampania(req, res) {
    try {
      const { campaniaId } = req.params;
      const clienteId = req.user.cliente_id;

      // Verificar que la campaña pertenece al cliente
      const [campaniaCheck] = await db.execute(
        'SELECT id FROM ll_campanias_whatsapp WHERE id = ? AND cliente_id = ?',
        [campaniaId, clienteId]
      );

      if (campaniaCheck.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Campaña no encontrada o no tienes permisos para verla'
        });
      }

      // Obtener los destinatarios con información detallada
      const [destinatarios] = await db.execute(`
        SELECT 
          env.id,
          env.telefono_wapp as telefono,
          env.nombre_destino as nombre,
          env.estado,
          env.fecha_envio,
          env.mensaje_final,
          lug.nombre as lugar_nombre,
          lug.direccion as lugar_direccion
        FROM ll_envios_whatsapp env
        LEFT JOIN ll_campanias_whatsapp camp ON env.campania_id = camp.id
        LEFT JOIN ll_lugares_clientes lug ON env.lugar_id = lug.id
        WHERE camp.id = ? AND camp.cliente_id = ?
        ORDER BY env.fecha_envio DESC
      `, [campaniaId, clienteId]);

      // Calcular estadísticas
      const estadisticas = {
        total: destinatarios.length,
        enviados: destinatarios.filter(d => d.estado === 'enviado').length,
        pendientes: destinatarios.filter(d => d.estado === 'pendiente').length,
        fallidos: destinatarios.filter(d => d.estado === 'fallido').length
      };

      res.json({
        success: true,
        data: {
          destinatarios,
          estadisticas
        }
      });
    } catch (error) {
      console.error('Error al obtener destinatarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener resumen de destinatarios (solo contadores)
  async getResumenDestinatarios(req, res) {
    try {
      const { campaniaId } = req.params;
      const clienteId = req.user.cliente_id;

      const [resumen] = await db.execute(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN env.estado = 'enviado' THEN 1 ELSE 0 END) as enviados,
          SUM(CASE WHEN env.estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
          SUM(CASE WHEN env.estado = 'fallido' THEN 1 ELSE 0 END) as fallidos
        FROM ll_envios_whatsapp env
        LEFT JOIN ll_campanias_whatsapp camp ON env.campania_id = camp.id
        WHERE camp.id = ? AND camp.cliente_id = ?
      `, [campaniaId, clienteId]);

      res.json({
        success: true,
        data: resumen[0] || { total: 0, enviados: 0, pendientes: 0, fallidos: 0 }
      });
    } catch (error) {
      console.error('Error al obtener resumen de destinatarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

module.exports = destinatariosController;
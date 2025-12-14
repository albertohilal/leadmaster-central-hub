import { useEffect, useState } from 'react';
import { senderAPI } from '../../services/api';

export default function ProgramacionesList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estado, setEstado] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await senderAPI.listProgramaciones(estado ? { estado } : undefined);
      setItems(res.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  if (loading) return <div className="p-4">Cargando programaciones...</div>;
  if (!items.length) return <div className="p-4 text-sm text-gray-600">Todavía no registraste programaciones.</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-sm">Estado:</label>
        <select
          className="border rounded p-1 text-sm"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobada">Aprobada</option>
          <option value="rechazada">Rechazada</option>
          <option value="pausada">Pausada</option>
        </select>
        <button
          onClick={load}
          className="ml-auto px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
        >
          Actualizar
        </button>
      </div>
      {items.map((p) => (
        <div key={p.id} className="p-3 bg-white rounded shadow">
          <div className="font-semibold">{p.campania_nombre || `Campaña ${p.campania_id}`}</div>
          <div className="text-sm text-gray-600">Días: {String(p.dias_semana || '').toUpperCase()}</div>
          <div className="text-sm text-gray-600">Horario: {p.hora_inicio} - {p.hora_fin}</div>
          <div className="text-sm text-gray-600">Cupo diario: {p.cupo_diario}</div>
          <div className="text-sm">Estado: {p.estado}</div>
          {p.comentario_admin && <div className="text-sm text-gray-600">Admin: {p.comentario_admin}</div>}
          {p.rechazo_motivo && <div className="text-sm text-red-600">Motivo rechazo: {p.rechazo_motivo}</div>}
        </div>
      ))}
    </div>
  );
}
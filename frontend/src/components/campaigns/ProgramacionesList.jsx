import { useEffect, useState } from 'react';
import { senderAPI } from '../../services/api';

export default function ProgramacionesList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await senderAPI.listProgramaciones();
        setItems(res.data || []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-4">Cargando programaciones...</div>;
  if (!items.length) return <div className="p-4 text-sm text-gray-600">Todavía no registraste programaciones.</div>;

  return (
    <div className="space-y-3">
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
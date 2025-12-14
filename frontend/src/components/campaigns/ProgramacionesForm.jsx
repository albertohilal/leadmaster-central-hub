import { useEffect, useState } from 'react';
import { senderAPI } from '../../services/api';

const DAYS = [
  { key: 'mon', label: 'Lun' },
  { key: 'tue', label: 'Mar' },
  { key: 'wed', label: 'Mié' },
  { key: 'thu', label: 'Jue' },
  { key: 'fri', label: 'Vie' },
  { key: 'sat', label: 'Sáb' },
  { key: 'sun', label: 'Dom' }
];

export default function ProgramacionesForm() {
  const [campanias, setCampanias] = useState([]);
  const [form, setForm] = useState({
    campania_id: '',
    dias_semana: [],
    hora_inicio: '09:00:00',
    hora_fin: '13:00:00',
    cupo_diario: 50,
    fecha_inicio: '',
    fecha_fin: '',
    comentario: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    senderAPI.getCampaigns()
      .then((res) => setCampanias(res.data || []))
      .catch(() => setCampanias([]));
  }, []);

  const toggleDay = (key) => {
    setForm((f) => {
      const has = f.dias_semana.includes(key);
      return {
        ...f,
        dias_semana: has ? f.dias_semana.filter((d) => d !== key) : [...f.dias_semana, key]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        ...form,
        fecha_fin: form.fecha_fin || null,
        cupo_diario: Number(form.cupo_diario)
      };
      const res = await senderAPI.createProgramacion(payload);
      if (res?.data?.success) {
        setMessage('Programación creada correctamente.');
        setForm({
          campania_id: '',
          dias_semana: [],
          hora_inicio: '09:00:00',
          hora_fin: '13:00:00',
          cupo_diario: 50,
          fecha_inicio: '',
          fecha_fin: '',
          comentario: ''
        });
      } else {
        setMessage('No se pudo crear la programación.');
      }
    } catch (err) {
      setMessage('Error al crear programación.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Nueva Programación</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Campaña</label>
          <select
            className="w-full border rounded p-2"
            value={form.campania_id}
            onChange={(e) => setForm((f) => ({ ...f, campania_id: e.target.value }))}
          >
            <option value="">Selecciona campaña</option>
            {campanias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Días de la semana</label>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((d) => (
              <label key={d.key} className="inline-flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={form.dias_semana.includes(d.key)}
                  onChange={() => toggleDay(d.key)}
                />
                <span>{d.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Hora inicio</label>
            <input
              type="time"
              step="1"
              className="w-full border rounded p-2"
              value={form.hora_inicio}
              onChange={(e) => setForm((f) => ({ ...f, hora_inicio: e.target.value + (e.target.value.length === 5 ? ':00' : '') }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hora fin</label>
            <input
              type="time"
              step="1"
              className="w-full border rounded p-2"
              value={form.hora_fin}
              onChange={(e) => setForm((f) => ({ ...f, hora_fin: e.target.value + (e.target.value.length === 5 ? ':00' : '') }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Cupo diario</label>
            <input
              type="number"
              min={1}
              className="w-full border rounded p-2"
              value={form.cupo_diario}
              onChange={(e) => setForm((f) => ({ ...f, cupo_diario: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha inicio</label>
            <input
              type="date"
              className="w-full border rounded p-2"
              value={form.fecha_inicio}
              onChange={(e) => setForm((f) => ({ ...f, fecha_inicio: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Fecha fin (opcional)</label>
            <input
              type="date"
              className="w-full border rounded p-2"
              value={form.fecha_fin}
              onChange={(e) => setForm((f) => ({ ...f, fecha_fin: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Comentario</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={form.comentario}
              onChange={(e) => setForm((f) => ({ ...f, comentario: e.target.value }))}
              placeholder="Preferencias, notas para admin, etc."
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={saving}
        >
          {saving ? 'Guardando...' : 'Crear Programación'}
        </button>

        {message && <p className="text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
}
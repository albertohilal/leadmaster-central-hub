import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import { senderAPI, leadsAPI } from '../../services/api';
import ProgramacionesForm from './ProgramacionesForm';
import ProgramacionesList from './ProgramacionesList';

const CampaignsManager = () => {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    mensaje: '',
    programada: false,
    fecha_envio: ''
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      // Mock data por ahora
      const mockCampaigns = [
        {
          id: 1,
          nombre: 'Campaña Navidad 2025',
          descripcion: 'Promoción especial de fin de año',
          estado: 'activa',
          fecha_creacion: '2025-12-10',
          total_destinatarios: 150,
          enviados: 120,
          fallidos: 5,
          pendientes: 25
        },
        {
          id: 2,
          nombre: 'Seguimiento Leads',
          descripcion: 'Contacto con leads potenciales',
          estado: 'completada',
          fecha_creacion: '2025-12-05',
          total_destinatarios: 80,
          enviados: 80,
          fallidos: 0,
          pendientes: 0
        }
      ];
      
      setCampaigns(mockCampaigns);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      mensaje: '',
      programada: false,
      fecha_envio: ''
    });
    setShowCreateModal(true);
  };

  const handleSaveCampaign = async () => {
    try {
      await senderAPI.createCampaign(formData);
      alert('Campaña creada exitosamente');
      setShowCreateModal(false);
      loadCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Error al crear campaña');
    }
  };

  const handleViewStats = async (campaign) => {
    try {
      // Por ahora usar datos del mock
      setSelectedCampaign(campaign);
      setShowStatsModal(true);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'activa':
        return 'bg-success';
      case 'completada':
        return 'bg-primary';
      case 'programada':
        return 'bg-warning';
      case 'pausada':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case 'activa':
        return 'Activa';
      case 'completada':
        return 'Completada';
      case 'programada':
        return 'Programada';
      case 'pausada':
        return 'Pausada';
      default:
        return estado;
    }
  };

  const calculateSuccessRate = (campaign) => {
    const total = campaign.total_destinatarios;
    const exitosos = campaign.enviados;
    return total > 0 ? Math.round((exitosos / total) * 100) : 0;
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Cargando campañas..." />;
  }

  return (
    <div className="space-y-6">
      {/* Título y acciones */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Campañas</h1>
          <p className="text-gray-600 mt-1">Administra tus envíos masivos de WhatsApp</p>
        </div>
        <Button variant="primary" onClick={handleCreateCampaign}>
          + Nueva Campaña
        </Button>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center py-4">
        {/* Programaciones (franjas por días/horarios/cupo) */}
        <Card title="Programación de Campañas" icon="⏱️">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ProgramacionesForm />
            </div>
            <div>
              <ProgramacionesList />
            </div>
          </div>
        </Card>
            <p className="text-sm text-gray-600">Total Campañas</p>
            <p className="text-4xl font-bold text-gray-800 mt-2">{campaigns.length}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">Activas</p>
            <p className="text-4xl font-bold text-success mt-2">
              {campaigns.filter(c => c.estado === 'activa').length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">Completadas</p>
            <p className="text-4xl font-bold text-primary mt-2">
              {campaigns.filter(c => c.estado === 'completada').length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">Mensajes Enviados</p>
            <p className="text-4xl font-bold text-gray-800 mt-2">
              {campaigns.reduce((sum, c) => sum + c.enviados, 0)}
            </p>
          </div>
        </Card>
      </div>

      {/* Lista de Campañas */}
      <Card title="Campañas" icon="📨">
        <div className="space-y-4">
          {campaigns.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay campañas creadas. ¡Crea tu primera campaña!
            </p>
          ) : (
            campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{campaign.nombre}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(campaign.estado)}`}>
                        {getStatusText(campaign.estado)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{campaign.descripcion}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Creada el {campaign.fecha_creacion}
                    </p>
                  </div>
                  <Button variant="primary" onClick={() => handleViewStats(campaign)}>
                    Ver Estadísticas
                  </Button>
                </div>

                {/* Barra de progreso */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progreso</span>
                    <span>
                      {campaign.enviados} / {campaign.total_destinatarios}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-success h-2 rounded-full transition-all"
                      style={{
                        width: `${(campaign.enviados / campaign.total_destinatarios) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Destinatarios</p>
                    <p className="text-lg font-bold text-gray-800">{campaign.total_destinatarios}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Enviados</p>
                    <p className="text-lg font-bold text-success">{campaign.enviados}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Fallidos</p>
                    <p className="text-lg font-bold text-danger">{campaign.fallidos}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Tasa de Éxito</p>
                    <p className="text-lg font-bold text-primary">{calculateSuccessRate(campaign)}%</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Modal Crear Campaña */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nueva Campaña"
        size="large"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la campaña *</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ej: Promoción Navidad 2025"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              rows="3"
              placeholder="Describe el objetivo de esta campaña..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje *</label>
            <textarea
              value={formData.mensaje}
              onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              rows="5"
              placeholder="Escribe el mensaje que se enviará a los destinatarios..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.mensaje.length} caracteres
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.programada}
              onChange={(e) => setFormData({ ...formData, programada: e.target.checked })}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label className="text-sm font-medium text-gray-700">Programar envío</label>
          </div>

          {formData.programada && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora de envío</label>
              <input
                type="datetime-local"
                value={formData.fecha_envio}
                onChange={(e) => setFormData({ ...formData, fecha_envio: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Los mensajes se enviarán solo a los leads con IA habilitada.
              Puedes gestionar esto desde la sección de Leads.
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSaveCampaign}>
              Crear Campaña
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Estadísticas */}
      <Modal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        title={selectedCampaign ? `Estadísticas: ${selectedCampaign.nombre}` : 'Estadísticas'}
      >
        {selectedCampaign && (
          <div className="space-y-6">
            {/* Resumen */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Destinatarios</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {selectedCampaign.total_destinatarios}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Enviados</p>
                <p className="text-3xl font-bold text-success mt-1">
                  {selectedCampaign.enviados}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Fallidos</p>
                <p className="text-3xl font-bold text-danger mt-1">
                  {selectedCampaign.fallidos}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-3xl font-bold text-warning mt-1">
                  {selectedCampaign.pendientes}
                </p>
              </div>
            </div>

            {/* Tasa de éxito */}
            <div className="p-6 bg-blue-50 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-2">Tasa de Éxito</p>
              <p className="text-5xl font-bold text-primary">
                {calculateSuccessRate(selectedCampaign)}%
              </p>
            </div>

            {/* Detalles */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Detalles de la Campaña</h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Estado:</dt>
                  <dd className="text-sm font-medium text-gray-800">{getStatusText(selectedCampaign.estado)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Fecha de creación:</dt>
                  <dd className="text-sm font-medium text-gray-800">{selectedCampaign.fecha_creacion}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Descripción:</dt>
                  <dd className="text-sm font-medium text-gray-800">{selectedCampaign.descripcion}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CampaignsManager;

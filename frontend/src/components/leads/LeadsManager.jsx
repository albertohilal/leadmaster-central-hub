import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import { leadsAPI, listenerAPI } from '../../services/api';

const LeadsManager = () => {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterIA, setFilterIA] = useState('all'); // all, enabled, disabled
  const [selectedLead, setSelectedLead] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    empresa: '',
    ia_habilitada: false
  });

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, searchQuery, filterIA]);

  const loadLeads = async () => {
    try {
      // Por ahora mock data, reemplazar con API real
      const mockLeads = [
        {
          id: 1,
          nombre: 'Juan Pérez',
          telefono: '+5491112345678',
          email: 'juan@example.com',
          empresa: 'Empresa ABC',
          ia_habilitada: true,
          fecha_creacion: '2025-12-01'
        },
        {
          id: 2,
          nombre: 'María García',
          telefono: '+5491198765432',
          email: 'maria@example.com',
          empresa: 'Empresa XYZ',
          ia_habilitada: false,
          fecha_creacion: '2025-12-05'
        }
      ];
      
      setLeads(mockLeads);
      setFilteredLeads(mockLeads);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = [...leads];

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(lead => 
        lead.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.telefono.includes(searchQuery) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.empresa.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por IA
    if (filterIA === 'enabled') {
      filtered = filtered.filter(lead => lead.ia_habilitada);
    } else if (filterIA === 'disabled') {
      filtered = filtered.filter(lead => !lead.ia_habilitada);
    }

    setFilteredLeads(filtered);
  };

  const handleToggleIA = async (lead) => {
    try {
      if (lead.ia_habilitada) {
        await listenerAPI.disableIA(lead.telefono);
      } else {
        await listenerAPI.enableIA(lead.telefono);
      }
      
      // Actualizar estado local
      setLeads(leads.map(l => 
        l.id === lead.id ? { ...l, ia_habilitada: !l.ia_habilitada } : l
      ));
      
      alert(`IA ${lead.ia_habilitada ? 'deshabilitada' : 'habilitada'} para ${lead.nombre}`);
    } catch (error) {
      console.error('Error toggling IA:', error);
      alert('Error al cambiar estado de IA');
    }
  };

  const handleViewDetail = (lead) => {
    setSelectedLead(lead);
    setShowDetailModal(true);
  };

  const handleEdit = (lead) => {
    setFormData(lead);
    setShowFormModal(true);
  };

  const handleCreateNew = () => {
    setFormData({
      nombre: '',
      telefono: '',
      email: '',
      empresa: '',
      ia_habilitada: false
    });
    setShowFormModal(true);
  };

  const handleSaveForm = async () => {
    try {
      if (formData.id) {
        // Actualizar
        await leadsAPI.update(formData.id, formData);
        setLeads(leads.map(l => l.id === formData.id ? formData : l));
      } else {
        // Crear nuevo
        const response = await leadsAPI.create(formData);
        setLeads([...leads, { ...formData, id: response.data.id }]);
      }
      
      setShowFormModal(false);
      alert('Lead guardado exitosamente');
    } catch (error) {
      console.error('Error saving lead:', error);
      alert('Error al guardar lead');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este lead?')) return;
    
    try {
      await leadsAPI.delete(id);
      setLeads(leads.filter(l => l.id !== id));
      alert('Lead eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert('Error al eliminar lead');
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Cargando leads..." />;
  }

  return (
    <div className="space-y-6">
      {/* Título y acciones */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Leads</h1>
          <p className="text-gray-600 mt-1">Administra tus leads y clientes</p>
        </div>
        <Button variant="primary" onClick={handleCreateNew}>
          + Nuevo Lead
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono, email o empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterIA}
              onChange={(e) => setFilterIA(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="enabled">Con IA</option>
              <option value="disabled">Sin IA</option>
            </select>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Mostrando {filteredLeads.length} de {leads.length} leads
        </div>
      </Card>

      {/* Tabla de Leads */}
      <Card title="Lista de Leads" icon="👥">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IA</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No se encontraron leads
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{lead.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{lead.telefono}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{lead.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{lead.empresa}</td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleToggleIA(lead)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          lead.ia_habilitada
                            ? 'bg-success text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {lead.ia_habilitada ? '✓ Activa' : 'Inactiva'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetail(lead)}
                          className="text-primary hover:text-blue-700"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => handleEdit(lead)}
                          className="text-warning hover:text-yellow-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="text-danger hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Detalle */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detalle del Lead"
      >
        {selectedLead && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Nombre</p>
              <p className="text-lg font-medium text-gray-800">{selectedLead.nombre}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Teléfono</p>
              <p className="text-lg font-medium text-gray-800">{selectedLead.telefono}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-medium text-gray-800">{selectedLead.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Empresa</p>
              <p className="text-lg font-medium text-gray-800">{selectedLead.empresa}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">IA Habilitada</p>
              <p className="text-lg font-medium text-gray-800">
                {selectedLead.ia_habilitada ? 'Sí' : 'No'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fecha de creación</p>
              <p className="text-lg font-medium text-gray-800">{selectedLead.fecha_creacion}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Formulario */}
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={formData.id ? 'Editar Lead' : 'Nuevo Lead'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="+54911..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <input
              type="text"
              value={formData.empresa}
              onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.ia_habilitada}
              onChange={(e) => setFormData({ ...formData, ia_habilitada: e.target.checked })}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label className="text-sm font-medium text-gray-700">Habilitar IA</label>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setShowFormModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSaveForm}>
              Guardar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LeadsManager;

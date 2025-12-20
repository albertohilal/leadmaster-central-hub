import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Download, Users, Building, MapPin, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import prospectosService from '../../services/prospectos';
import campanasService from '../../services/campanas';
import destinatariosService from '../../services/destinatarios';

const SelectorProspectosPage = () => {
  const navigate = useNavigate();
  
  // Estados para la página
  const [campanas, setCampanas] = useState([]);
  const [campaniaSeleccionada, setCampaniaSeleccionada] = useState('');
  const [prospectos, setProspectos] = useState([]);
  const [prospectosSeleccionados, setProspectosSeleccionados] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para filtros
  const [areas, setAreas] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [filtros, setFiltros] = useState({
    area: '',
    rubro: '',
    direccion: '',
    estado: '',
    tipo_cliente: ''
  });
  
  // Estados para búsqueda y paginación
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina] = useState(50);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Cargar prospectos cuando cambien los filtros
  useEffect(() => {
    cargarProspectos();
  }, [filtros, busqueda, paginaActual]);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      const [campanasData, areasData, rubrosData] = await Promise.all([
        campanasService.obtenerCampanas(),
        prospectosService.obtenerAreas(),
        prospectosService.obtenerRubros()
      ]);
      
      setCampanas(campanasData || []);
      setAreas(areasData.areas || []);
      setRubros(rubrosData.rubros || []);
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarProspectos = async () => {
    try {
      setLoading(true);
      const filtrosConBusqueda = {
        ...filtros,
        busqueda,
        limite: registrosPorPagina,
        offset: (paginaActual - 1) * registrosPorPagina
      };
      
      const response = await prospectosService.filtrarProspectos(filtrosConBusqueda);
      setProspectos(response.prospectos || []);
    } catch (error) {
      console.error('Error al cargar prospectos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
    setPaginaActual(1); // Resetear a la primera página
  };

  const handleSeleccionarProspecto = (prospecto) => {
    setProspectosSeleccionados(prev => {
      const yaSeleccionado = prev.find(p => p.rowid === prospecto.rowid);
      if (yaSeleccionado) {
        return prev.filter(p => p.rowid !== prospecto.rowid);
      } else {
        return [...prev, prospecto];
      }
    });
  };

  const handleSeleccionarTodos = () => {
    if (prospectosSeleccionados.length === prospectos.length) {
      setProspectosSeleccionados([]);
    } else {
      setProspectosSeleccionados([...prospectos]);
    }
  };

  const handleAgregarACampania = async () => {
    if (!campaniaSeleccionada || prospectosSeleccionados.length === 0) {
      alert('Selecciona una campaña y al menos un prospecto');
      return;
    }

    try {
      setLoading(true);
      const destinatarios = prospectosSeleccionados.map(p => ({
        nombre: p.nom,
        telefono: p.whatsapp || p.phone,
        empresa: p.nom,
        email: p.email
      }));

      await destinatariosService.agregarDestinatarios(campaniaSeleccionada, destinatarios);
      alert(`Se agregaron ${destinatarios.length} prospectos a la campaña`);
      setProspectosSeleccionados([]);
    } catch (error) {
      console.error('Error al agregar prospectos a campaña:', error);
      alert('Error al agregar prospectos a la campaña');
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltros({
      area: '',
      rubro: '',
      direccion: '',
      estado: '',
      tipo_cliente: ''
    });
    setBusqueda('');
    setPaginaActual(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/campaigns')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Volver a Campañas</span>
            </button>
            <div className="h-6 border-l border-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">Seleccionar Prospectos</h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {prospectosSeleccionados.length} seleccionados
            </span>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Panel de filtros lateral */}
        <div className="w-80 bg-white border-r border-gray-200 p-6">
          <div className="space-y-6">
            {/* Selección de campaña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaña de destino
              </label>
              <select
                value={campaniaSeleccionada}
                onChange={(e) => setCampaniaSeleccionada(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar campaña...</option>
                {campanas.map((campana) => (
                  <option key={campana.id} value={campana.id}>
                    {campana.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Buscador */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o empresa..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
                <button
                  onClick={limpiarFiltros}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Limpiar
                </button>
              </div>

              {/* Área */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Área
                </label>
                <select
                  value={filtros.area}
                  onChange={(e) => handleFiltroChange('area', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas las áreas</option>
                  {areas.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              {/* Rubro */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rubro
                </label>
                <select
                  value={filtros.rubro}
                  onChange={(e) => handleFiltroChange('rubro', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos los rubros</option>
                  {rubros.map((rubro) => (
                    <option key={rubro} value={rubro}>{rubro}</option>
                  ))}
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={filtros.estado}
                  onChange={(e) => handleFiltroChange('estado', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos los estados</option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              {/* Tipo de cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de cliente
                </label>
                <select
                  value={filtros.tipo_cliente}
                  onChange={(e) => handleFiltroChange('tipo_cliente', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos los tipos</option>
                  <option value="prospecto">Prospecto</option>
                  <option value="cliente">Cliente</option>
                  <option value="proveedor">Proveedor</option>
                </select>
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección contiene
                </label>
                <input
                  type="text"
                  placeholder="Filtrar por dirección..."
                  value={filtros.direccion}
                  onChange={(e) => handleFiltroChange('direccion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Acciones */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleAgregarACampania}
                disabled={!campaniaSeleccionada || prospectosSeleccionados.length === 0}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>Agregar a Campaña ({prospectosSeleccionados.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lista de prospectos */}
        <div className="flex-1 p-6">
          {/* Controles de la tabla */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-medium text-gray-900">
                    Prospectos disponibles ({prospectos.length})
                  </h2>
                  <button
                    onClick={handleSeleccionarTodos}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {prospectosSeleccionados.length === prospectos.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Mostrando {prospectos.length} resultados
                  </span>
                </div>
              </div>
            </div>

            {/* Tabla de prospectos */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={prospectosSeleccionados.length === prospectos.length && prospectos.length > 0}
                        onChange={handleSeleccionarTodos}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teléfono/WhatsApp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dirección
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        Cargando prospectos...
                      </td>
                    </tr>
                  ) : prospectos.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        No se encontraron prospectos con los filtros seleccionados
                      </td>
                    </tr>
                  ) : (
                    prospectos.map((prospecto) => {
                      const estaSeleccionado = prospectosSeleccionados.find(p => p.rowid === prospecto.rowid);
                      return (
                        <tr
                          key={prospecto.rowid}
                          className={`hover:bg-gray-50 cursor-pointer ${estaSeleccionado ? 'bg-blue-50' : ''}`}
                          onClick={() => handleSeleccionarProspecto(prospecto)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={!!estaSeleccionado}
                              onChange={() => handleSeleccionarProspecto(prospecto)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Building className="h-4 w-4 text-gray-400 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{prospecto.nom}</div>
                                {prospecto.name_alias && (
                                  <div className="text-sm text-gray-500">{prospecto.name_alias}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {prospecto.whatsapp && (
                                <div className="flex items-center text-green-600">
                                  <span className="mr-1">📱</span>
                                  {prospecto.whatsapp}
                                </div>
                              )}
                              {prospecto.phone && (
                                <div className="text-gray-600">
                                  📞 {prospecto.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {prospecto.email || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                              {prospecto.address ? (
                                <span>{prospecto.address}</span>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              prospecto.status === '1' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {prospecto.status === '1' ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {prospectos.length > 0 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Página {paginaActual} - {prospectos.length} resultados
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                      disabled={paginaActual === 1}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setPaginaActual(prev => prev + 1)}
                      disabled={prospectos.length < registrosPorPagina}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectorProspectosPage;
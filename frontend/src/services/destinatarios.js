import apiService from './api';

export const destinatariosService = {
  // Obtener destinatarios completos de una campaña
  async getDestinatariosCampania(campaniaId) {
    try {
      const response = await apiService.get(`/sender/destinatarios/campania/${campaniaId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener destinatarios de campaña:', error);
      throw error;
    }
  },

  // Obtener solo resumen de destinatarios de una campaña
  async getResumenDestinatarios(campaniaId) {
    try {
      const response = await apiService.get(`/sender/destinatarios/campania/${campaniaId}/resumen`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener resumen de destinatarios:', error);
      throw error;
    }
  }
};

export default destinatariosService;
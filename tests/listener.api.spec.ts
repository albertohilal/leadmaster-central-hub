import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3010';

test.describe('Listener API', () => {
  
  test('GET /listener/status - obtener estado del listener', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/listener/status`);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('mode');
    expect(data.mode).toMatch(/^(listen|respond)$/);
  });

  test('POST /listener/mode - cambiar modo a respond', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/listener/mode`, {
      data: { mode: 'respond' }
    });
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.mode).toBe('respond');
    
    // Verificar que el cambio persiste
    const statusResponse = await request.get(`${BASE_URL}/listener/status`);
    const statusData = await statusResponse.json();
    expect(statusData.mode).toBe('respond');
  });

  test('POST /listener/mode - cambiar modo a listen', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/listener/mode`, {
      data: { mode: 'listen' }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.mode).toBe('listen');
  });

  test('POST /listener/mode - rechazar modo inválido', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/listener/mode`, {
      data: { mode: 'invalid_mode' }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data).toHaveProperty('error');
  });

  test('POST /listener/ia/enable - habilitar IA para un lead', async ({ request }) => {
    const testPhone = '5491112345678';
    
    const response = await request.post(`${BASE_URL}/listener/ia/enable`, {
      data: { telefono: testPhone }
    });
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    // Si falla, mostrar el error para debugging
    if (!data.success) {
      console.log('Error en ia/enable:', data.error);
    }
    expect(data.success).toBe(true);
    expect(data.telefono).toBe(testPhone);
    expect(data.ia_enabled).toBe(true);
  });

  test('POST /listener/ia/disable - deshabilitar IA para un lead', async ({ request }) => {
    const testPhone = '5491112345678';
    
    const response = await request.post(`${BASE_URL}/listener/ia/disable`, {
      data: { telefono: testPhone }
    });
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    // Si falla, mostrar el error para debugging
    if (!data.success) {
      console.log('Error en ia/disable:', data.error);
    }
    expect(data.success).toBe(true);
    expect(data.telefono).toBe(testPhone);
    expect(data.ia_enabled).toBe(false);
  });

  test('POST /listener/ia/enable - validar teléfono requerido', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/listener/ia/enable`, {
      data: {},
      failOnStatusCode: false
    });
    
    // Puede retornar 400 o 200 con success:false según implementación
    const data = await response.json();
    
    if (response.status() === 400) {
      expect(data).toHaveProperty('error');
    } else {
      expect(data.success).toBe(false);
      expect(data).toHaveProperty('error');
    }
  });

  test('POST /listener/ia/disable - validar teléfono requerido', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/listener/ia/disable`, {
      data: {},
      failOnStatusCode: false
    });
    
    // Puede retornar 400 o 200 con success:false según implementación
    const data = await response.json();
    
    if (response.status() === 400) {
      expect(data).toHaveProperty('error');
    } else {
      expect(data.success).toBe(false);
      expect(data).toHaveProperty('error');
    }
  });

  test('POST /listener/test-message - simular mensaje en modo listen', async ({ request }) => {
    // Primero configurar modo listen
    await request.post(`${BASE_URL}/listener/mode`, {
      data: { mode: 'listen' }
    });
    
    const response = await request.post(`${BASE_URL}/listener/test-message`, {
      data: {
        cliente_id: 52,
        telefono: '5491112345678',
        texto: 'hola, soy un test'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data).toHaveProperty('respuesta');
    expect(data).toHaveProperty('enviado');
    expect(data.enviado).toBe(false); // En modo listen no envía
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('Modo no respond');
  });

  test('POST /listener/test-message - simular mensaje en modo respond', async ({ request }) => {
    // Configurar modo respond y habilitar IA
    await request.post(`${BASE_URL}/listener/mode`, {
      data: { mode: 'respond' }
    });
    
    await request.post(`${BASE_URL}/listener/ia/enable`, {
      data: { telefono: '5491112345678' }
    });
    
    const response = await request.post(`${BASE_URL}/listener/test-message`, {
      data: {
        cliente_id: 52,
        telefono: '5491112345678',
        texto: 'necesito información'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data).toHaveProperty('respuesta');
    expect(data).toHaveProperty('enviado');
    
    // Si la sesión no está activa, debe indicarlo
    if (data.error) {
      expect(data.error).toMatch(/Sesión de WhatsApp|IA deshabilitada/);
    }
  });

  test('POST /listener/test-message - validar campos requeridos', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/listener/test-message`, {
      data: { cliente_id: 52 }
    });
    
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('GET /listener/logs - obtener logs del listener', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/listener/logs`);
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(Array.isArray(data)).toBeTruthy();
    // Puede estar vacío o tener logs
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('timestamp');
    }
  });
});

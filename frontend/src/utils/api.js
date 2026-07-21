export const API_SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const BASE_URL = `${API_SERVER_URL}/api`;

export const getFileUrl = (relativeUrl) => {
  if (!relativeUrl) return '';
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  return `${API_SERVER_URL}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
};


const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('token');
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMsg = 'Something went wrong';
    try {
      const data = await response.json();
      errorMsg = data.message || errorMsg;
    } catch (e) {
      // Not a json
    }
    throw new Error(errorMsg);
  }
  
  try {
    return await response.json();
  } catch (e) {
    return null;
  }
};

const api = {
  get: async (endpoint) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  post: async (endpoint, body, isMultipart = false) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(isMultipart),
      body: isMultipart ? body : JSON.stringify(body)
    });
    return handleResponse(res);
  },

  put: async (endpoint, body) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse(res);
  },

  delete: async (endpoint) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};

export default api;
export { BASE_URL };

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('adminToken');

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    });
  } catch {
    throw new Error('Unable to reach the server. Please check your internet connection and try again.');
  }

  const data = await res.json().catch(() => ({}));

  // If token is expired or invalid (HTTP 401), clean up and redirect to login
  if (
    res.status === 401 ||
    (typeof data?.message === 'string' &&
      (data.message.toLowerCase().includes('expired token') ||
        data.message.toLowerCase().includes('token is missing') ||
        data.message.toLowerCase().includes('invalid token')))
  ) {
    localStorage.removeItem('adminToken');
    window.dispatchEvent(new CustomEvent('adminAuth:expired'));

    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  if (!res.ok || data.success === false) {
    if (res.status === 429) {
      throw new Error(data.message || 'Too many attempts. Please wait a few minutes and try again.');
    }
    if (res.status >= 500 && !data.message) {
      throw new Error('Our server ran into a problem. Please try again in a moment.');
    }
    throw new Error(data.message || 'Something went wrong. Please try again.');
  }
  return data;
}

export const adminAuthApi = {
  login: (payload) => request('/admin/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request('/admin/auth/me'),
  setupSuperAdmin: (payload) =>
    request('/admin/auth/setup-super-admin', { method: 'POST', body: JSON.stringify(payload) }),
  resetPasswordToken: (payload) =>
    request('/admin/auth/reset-password-token', { method: 'POST', body: JSON.stringify(payload) }),
  resetPassword: (payload) =>
    request('/admin/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),
  changePassword: (payload) =>
    request('/admin/auth/change-password', { method: 'POST', body: JSON.stringify(payload) }),
};

export const dashboardApi = {
  get: () => request('/admin/dashboard'),
};

export const productsApi = {
  getAll: () => request('/products'),
  create: (payload) => request('/products', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  uploadImage: async (file) => {
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();
    formData.append('image', file);

    let res;
    try {
      res = await fetch(`${BASE_URL}/products/upload-image`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
    } catch {
      throw new Error('Unable to reach the server. Please check your internet connection and try again.');
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      if (res.status >= 500 && !data.message) {
        throw new Error('Our server ran into a problem while uploading the image. Please try again.');
      }
      throw new Error(data.message || 'Image upload failed. Please try again.');
    }
    return data;
  },
  deleteImage: (imageUrl) =>
    request('/products/delete-image', {
      method: 'DELETE',
      body: JSON.stringify({ imageUrl }),
    }),
};

export const categoryApi = {
  getAll: () => request('/admin/categories'),
  create: (payload) => request('/admin/categories', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id) => request(`/admin/categories/${id}`, { method: 'DELETE' }),
};

export const inventoryApi = {
  summary: () => request('/admin/inventory/summary'),
  list: (filter) => request(`/admin/inventory${filter ? `?filter=${filter}` : ''}`),
  updateStock: (id, payload) =>
    request(`/admin/inventory/${id}/stock`, { method: 'PUT', body: JSON.stringify(payload) }),
};

export const ordersApi = {
  getAll: (status) => request(`/admin/orders${status ? `?status=${status}` : ''}`),
  getById: (id) => request(`/admin/orders/${id}`),
  updateStatus: (id, status) =>
    request(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  updateDeliveryDate: (id, expectedDeliveryDate) =>
    request(`/admin/orders/${id}/delivery-date`, { method: 'PUT', body: JSON.stringify({ expectedDeliveryDate }) }),
};

export const reportsApi = {
  sales: (period) => request(`/admin/reports/sales?period=${period}`),
  topProducts: () => request('/admin/reports/top-products'),
  orderStatus: () => request('/admin/reports/order-status'),
};

export const usersApi = {
  getAll: () => request('/admin/users'),
  remove: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
};

export const adminsApi = {
  getAll: () => request('/admin/admins'),
  create: (payload) => request('/admin/admins', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/admin/admins/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id) => request(`/admin/admins/${id}`, { method: 'DELETE' }),
  updateAdmin: (id, payload) => request(`/admin/admins/update/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
};

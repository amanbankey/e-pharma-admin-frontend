const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('adminToken');
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || 'Something went wrong');
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
    const res = await fetch(`${BASE_URL}/products/upload-image`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Image upload failed');
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
};

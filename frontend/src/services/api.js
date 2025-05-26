import axiosInstance from '../config/axios';

// API functions for Kasir-UUK application
export const api = {
  // Authentication
  login: (credentials) => axiosInstance.post('/api/auth/login', credentials),
  customerLogin: (credentials) => axiosInstance.post('/api/customers/login', credentials),
  registerCustomer: (customerData) => axiosInstance.post('/api/customers/register', customerData),
  logout: () => axiosInstance.post('/api/auth/logout'),

  // User profile
  getProfile: () => axiosInstance.get('/api/auth/me'),
  updateProfile: (data) => axiosInstance.put('/api/auth/updatedetails', data),

  // Products
  getProducts: () => axiosInstance.get('/api/products'),
  getProduct: (id) => axiosInstance.get(`/api/products/${id}`),
  createProduct: (data) => axiosInstance.post('/api/products', data),
  updateProduct: (id, data) => axiosInstance.put(`/api/products/${id}`, data),
  deleteProduct: (id) => axiosInstance.delete(`/api/products/${id}`),
  uploadProductImage: (id, formData) => axiosInstance.put(`/api/products/${id}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  getBestSellerProducts: () => axiosInstance.get('/api/products/best-sellers'),

  // Categories
  getCategories: () => axiosInstance.get('/api/categories'),
  getCategory: (id) => axiosInstance.get(`/api/categories/${id}`),
  createCategory: (data) => axiosInstance.post('/api/categories', data),
  updateCategory: (id, data) => axiosInstance.put(`/api/categories/${id}`, data),
  deleteCategory: (id) => axiosInstance.delete(`/api/categories/${id}`),

  // Customers
  getCustomers: () => axiosInstance.get('/api/customers'),
  getCustomer: (id) => axiosInstance.get(`/api/customers/${id}`),
  createCustomer: (data) => axiosInstance.post('/api/customers', data),
  updateCustomer: (id, data) => axiosInstance.put(`/api/customers/${id}`, data),
  deleteCustomer: (id) => axiosInstance.delete(`/api/customers/${id}`),

  // Transactions
  getTransactions: (params) => axiosInstance.get('/api/transactions', { params }),
  getTransaction: (id) => axiosInstance.get(`/api/transactions/${id}`),
  createTransaction: (data) => axiosInstance.post('/api/transactions', data),
  updateTransaction: (id, data) => axiosInstance.put(`/api/transactions/${id}`, data),
  getTransactionReport: (params) => axiosInstance.get('/api/transactions/report', { params }),

  // Dashboard/Reports
  getDashboardStats: () => axiosInstance.get('/api/dashboard/stats'),
  getSalesChartData: () => axiosInstance.get('/api/dashboard/sales-chart'),
  getSalesReport: (params) => axiosInstance.get('/api/reports/sales', { params }),
  getInventoryReport: (params) => axiosInstance.get('/api/reports/inventory', { params }),

  // Generic item methods (for backward compatibility)
  getItems: () => axiosInstance.get('/api/products'),
  getItem: (id) => axiosInstance.get(`/api/products/${id}`),
  createItem: (data) => axiosInstance.post('/api/products', data),
  updateItem: (id, data) => axiosInstance.put(`/api/products/${id}`, data),
  deleteItem: (id) => axiosInstance.delete(`/api/products/${id}`),
}; 
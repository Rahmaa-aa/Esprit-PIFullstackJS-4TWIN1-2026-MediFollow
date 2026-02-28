const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const api = {
  async postNoAuth(endpoint, data) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      const error = new Error(err.message || "Erreur API");
      error.status = res.status;
      throw error;
    }
    return res.json();
  },

  async post(endpoint, data) {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("doctorToken") || localStorage.getItem("patientToken") || localStorage.getItem("nurseToken");
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      const error = new Error(err.message || "Erreur API");
      error.status = res.status;
      throw error;
    }
    return res.json();
  },

  async put(endpoint, data) {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("doctorToken") || localStorage.getItem("patientToken") || localStorage.getItem("nurseToken");
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      const error = new Error(err.message || "Erreur API");
      error.status = res.status;
      throw error;
    }
    return res.json();
  },

  async delete(endpoint) {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("doctorToken") || localStorage.getItem("patientToken") || localStorage.getItem("nurseToken");
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      const error = new Error(err.message || "Erreur API");
      error.status = res.status;
      throw error;
    }
    return res.json().catch(() => ({}));
  },

  async get(endpoint) {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("doctorToken") || localStorage.getItem("patientToken") || localStorage.getItem("nurseToken");
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      const error = new Error(err.message || "Erreur API");
      error.status = res.status;
      throw error;
    }
    return res.json();
  },
};

export const authApi = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  confirmLogin: (token) => api.post("/auth/confirm-login", { token }),
  doctorLogin: (email, password) => api.postNoAuth("/auth/doctor-login", { email, password }),
  patientLogin: (email, password) => api.postNoAuth("/auth/patient-login", { email, password }),
  nurseLogin: (email, password) => api.postNoAuth("/auth/nurse-login", { email, password }),
  me: () => api.get("/auth/me"),
  updateMe: (data) => api.put("/auth/me", data),
};

export const doctorApi = {
  create: (data) => api.post("/doctors", data),
  getAll: () => api.get("/doctors"),
  getById: (id) => api.get(`/doctors/${id}`),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  delete: (id) => api.delete(`/doctors/${id}`),
};

export const patientApi = {
  create: (data) => api.post("/patients", data),
  getAll: () => api.get("/patients"),
  getById: (id) => api.get(`/patients/${id}`),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
};

export const nurseApi = {
  create: (data) => api.post("/nurses", data),
  getAll: () => api.get("/nurses"),
  getById: (id) => api.get(`/nurses/${id}`),
  update: (id, data) => api.put(`/nurses/${id}`, data),
  delete: (id) => api.delete(`/nurses/${id}`),
};

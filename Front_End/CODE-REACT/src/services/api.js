const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const okToken = (t) => (t && t !== "undefined" && t !== "null" ? t : null);

/**
 * Jeton aligné sur la session affichée : évite d'envoyer le token médecin/admin
 * alors que patientUser est encore en localStorage (ou l'inverse) → 403 / liste vide.
 */
const getValidToken = () => {
  try {
    if (localStorage.getItem("patientUser")) {
      const t = okToken(localStorage.getItem("patientToken"));
      if (t) return t;
    }
    if (localStorage.getItem("doctorUser")) {
      const t = okToken(localStorage.getItem("doctorToken"));
      if (t) return t;
    }
    if (localStorage.getItem("nurseUser")) {
      const t = okToken(localStorage.getItem("nurseToken"));
      if (t) return t;
    }
    if (localStorage.getItem("adminUser")) {
      const t = okToken(localStorage.getItem("adminToken"));
      if (t) return t;
    }
  } catch {
    /* ignore */
  }
  return (
    okToken(localStorage.getItem("adminToken")) ||
    okToken(localStorage.getItem("doctorToken")) ||
    okToken(localStorage.getItem("patientToken")) ||
    okToken(localStorage.getItem("nurseToken"))
  );
};

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
    const token = getValidToken();
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
    const token = getValidToken();
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
    const token = getValidToken();
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
    const token = getValidToken();
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
  staffLogin: (email, password) => api.postNoAuth("/auth/staff-login", { email, password }),
  passkeyRegisterOptions: (email, password) => api.postNoAuth("/auth/passkey/register/options", { email, password }),
  passkeyRegisterVerify: (email, response, deviceLabel) =>
    api.postNoAuth("/auth/passkey/register/verify", { email, response, deviceLabel }),
  passkeyAuthOptions: (email) => api.postNoAuth("/auth/passkey/auth/options", { email }),
  passkeyAuthVerify: (email, response) => api.postNoAuth("/auth/passkey/auth/verify", { email, response }),
  faceStatus: () => api.get("/auth/face/status"),
  faceEnroll: (descriptor) => api.post("/auth/face/enroll", { descriptor }),
  faceDisable: () => api.post("/auth/face/disable", {}),
  faceLogin: (descriptor, email) =>
    api.postNoAuth("/auth/face/login", email ? { email, descriptor } : { descriptor }),
  me: () => api.get("/auth/me"),
  updateMe: (data) => api.put("/auth/me", data),
};

export const doctorApi = {
  create: (data) => api.post("/doctors", data),
  getAll: () => api.get("/doctors"),
  getById: (id) => api.get(`/doctors/${id}`),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  delete: (id) => api.delete(`/doctors/${id}`),
  toggleActive: (id) => api.put(`/doctors/${id}/toggle-active`, {}),
};

export const patientApi = {
  create: (data) => api.post("/patients", data),
  getAll: () => api.get("/patients"),
  /** Médecin connecté : patients dont il est le référent (JWT). */
  getMyAssignedForDoctor: () => api.get("/patients/doctor/my-patients"),
  getById: (id) => api.get(`/patients/${id}`),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
  toggleActive: (id) => api.put(`/patients/${id}/toggle-active`, {}),
  getCareTeam: (id) => api.get(`/patients/${id}/care-team`),
};

export const nurseApi = {
  create: (data) => api.post("/nurses", data),
  getAll: () => api.get("/nurses"),
  getById: (id) => api.get(`/nurses/${id}`),
  update: (id, data) => api.put(`/nurses/${id}`, data),
  delete: (id) => api.delete(`/nurses/${id}`),
  toggleActive: (id) => api.put(`/nurses/${id}/toggle-active`, {}),
};

export const departmentApi = {
  summary: () => api.get("/departments/summary"),
  /** Médecin connecté : infirmiers du même département (JWT). */
  getMyNursesAsDoctor: () => api.get("/departments/doctor/my-nurses"),
  /** Médecin connecté : médecins du même département (JWT). */
  getMyDoctorsAsDoctor: () => api.get("/departments/doctor/my-doctors"),
  usersByDepartment: (department) =>
    api.get(`/departments/users?department=${encodeURIComponent(department)}`),
};

export const superAdminApi = {
  getAllUsers: () => api.get("/auth/users"),
  toggleUserActive: (id) => api.put(`/auth/users/${id}/toggle-active`, {}),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
  createAuditor: (data) => api.post("/auth/auditors", data),
  getAuditors: () => api.get("/auth/auditors"),
  getAuditorById: (id) => api.get(`/auth/auditors/${id}`),
  updateAuditor: (id, data) => api.put(`/auth/auditors/${id}`, data),
  deleteAuditor: (id) => api.delete(`/auth/auditors/${id}`),
  createCareCoordinator: (data) => api.post("/auth/care-coordinators", data),
  getCareCoordinators: () => api.get("/auth/care-coordinators"),
  getCareCoordinatorById: (id) => api.get(`/auth/care-coordinators/${id}`),
  updateCareCoordinator: (id, data) => api.put(`/auth/care-coordinators/${id}`, data),
  deleteCareCoordinator: (id) => api.delete(`/auth/care-coordinators/${id}`),
};
export const healthLogApi = {
  submit: (data) => api.post('/health-logs', data),
  getHistory: (patientId) =>
    api.get(`/health-logs/patient/${encodeURIComponent(String(patientId))}`),
  getLatest: (patientId) =>
    api.get(`/health-logs/patient/${encodeURIComponent(String(patientId))}/latest`),
};

export const medicationApi = {
  create: (data) => api.post('/medications', data),
  getByPatient: (patientId) => api.get(`/medications/patient/${patientId}`),
  toggleTaken: (id, localDate, slotIndex, recordedAt) =>
    api.put(`/medications/${id}/toggle-taken`, {
      ...(localDate ? { localDate } : {}),
      ...(typeof slotIndex === "number" ? { slotIndex } : {}),
      ...(recordedAt ? { recordedAt } : {}),
    }),
  update: (id, data) => api.put(`/medications/${id}`, data),
  remove: (id) => api.delete(`/medications/${id}`),
};

export const appointmentApi = {
  create: (data) => api.post('/appointments', data),
  getByPatient: (patientId) => api.get(`/appointments/patient/${patientId}`),
  getUpcoming: (patientId) => api.get(`/appointments/patient/${patientId}/upcoming`),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  remove: (id) => api.delete(`/appointments/${id}`),
};

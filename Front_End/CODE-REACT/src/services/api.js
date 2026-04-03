const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const okToken = (t) => (t && t !== "undefined" && t !== "null" ? t : null);

function messageFromApiErr(err) {
  const m = err?.message;
  if (Array.isArray(m)) return m[0] || err?.error || "Erreur API";
  if (typeof m === "string") return m;
  return err?.error || "Erreur API";
}

function attachApiErrorFields(error, err) {
  if (err && typeof err === "object") {
    if (err.code) error.code = err.code;
    if (Array.isArray(err.suggestedSlots)) error.suggestedSlots = err.suggestedSlots;
  }
}

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
      const error = new Error(messageFromApiErr(err));
      error.status = res.status;
      attachApiErrorFields(error, err);
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
      const error = new Error(messageFromApiErr(err));
      error.status = res.status;
      attachApiErrorFields(error, err);
      throw error;
    }
    return res.json();
  },

  /** POST multipart (sans Content-Type : le navigateur définit la boundary). */
  async postMultipart(endpoint, formData) {
    const token = getValidToken();
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      const error = new Error(messageFromApiErr(err));
      error.status = res.status;
      attachApiErrorFields(error, err);
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
      const error = new Error(messageFromApiErr(err));
      error.status = res.status;
      attachApiErrorFields(error, err);
      throw error;
    }
    return res.json();
  },

  async patch(endpoint, data = {}) {
    const token = getValidToken();
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      const error = new Error(messageFromApiErr(err));
      error.status = res.status;
      attachApiErrorFields(error, err);
      throw error;
    }
    return res.json().catch(() => ({}));
  },

  async patchWithAdminToken(endpoint, data = {}) {
    const token = okToken(localStorage.getItem("adminToken"));
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      const error = new Error(messageFromApiErr(err));
      error.status = res.status;
      attachApiErrorFields(error, err);
      throw error;
    }
    return res.json().catch(() => ({}));
  },

  async patchWithDoctorToken(endpoint, data = {}) {
    const token = okToken(localStorage.getItem("doctorToken"));
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      const error = new Error(messageFromApiErr(err));
      error.status = res.status;
      attachApiErrorFields(error, err);
      throw error;
    }
    return res.json().catch(() => ({}));
  },

  async patchWithNurseToken(endpoint, data = {}) {
    const token = okToken(localStorage.getItem("nurseToken"));
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      const error = new Error(messageFromApiErr(err));
      error.status = res.status;
      attachApiErrorFields(error, err);
      throw error;
    }
    return res.json().catch(() => ({}));
  },

  async patchWithPatientToken(endpoint, data = {}) {
    const token = okToken(localStorage.getItem("patientToken"));
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      const error = new Error(messageFromApiErr(err));
      error.status = res.status;
      attachApiErrorFields(error, err);
      throw error;
    }
    return res.json().catch(() => ({}));
  },

  async putWithAdminToken(endpoint, data) {
    const token = okToken(localStorage.getItem("adminToken"));
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
      const error = new Error(messageFromApiErr(err));
      error.status = res.status;
      attachApiErrorFields(error, err);
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
      const error = new Error(messageFromApiErr(err));
      error.status = res.status;
      attachApiErrorFields(error, err);
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
      const error = new Error(messageFromApiErr(err));
      error.status = res.status;
      attachApiErrorFields(error, err);
      throw error;
    }
    return res.json();
  },

  /** GET avec jeton admin uniquement (évite le conflit patient/admin dans getValidToken). */
  async getWithAdminToken(endpoint) {
    const token = okToken(localStorage.getItem("adminToken"));
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      const error = new Error(messageFromApiErr(err));
      error.status = res.status;
      attachApiErrorFields(error, err);
      throw error;
    }
    return res.json();
  },

  /** GET avec jeton médecin uniquement (sinon patientToken est pris en premier si patient encore en session). */
  async getWithDoctorToken(endpoint) {
    const token = okToken(localStorage.getItem("doctorToken"));
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      const error = new Error(messageFromApiErr(err));
      error.status = res.status;
      attachApiErrorFields(error, err);
      throw error;
    }
    return res.json();
  },

  /** GET avec jeton infirmier uniquement. */
  async getWithNurseToken(endpoint) {
    const token = okToken(localStorage.getItem("nurseToken"));
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      const error = new Error(messageFromApiErr(err));
      error.status = res.status;
      attachApiErrorFields(error, err);
      throw error;
    }
    return res.json();
  },

  /** GET avec jeton patient uniquement. */
  async getWithPatientToken(endpoint) {
    const token = okToken(localStorage.getItem("patientToken"));
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      const error = new Error(messageFromApiErr(err));
      error.status = res.status;
      attachApiErrorFields(error, err);
      throw error;
    }
    return res.json();
  },

  /** PUT avec jeton médecin uniquement. */
  async putWithDoctorToken(endpoint, data) {
    const token = okToken(localStorage.getItem("doctorToken"));
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
      const error = new Error(messageFromApiErr(err));
      error.status = res.status;
      attachApiErrorFields(error, err);
      throw error;
    }
    return res.json();
  },

  async postWithAdminToken(endpoint, data) {
    const token = okToken(localStorage.getItem("adminToken"));
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data ?? {}),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      const error = new Error(messageFromApiErr(err));
      error.status = res.status;
      attachApiErrorFields(error, err);
      throw error;
    }
    return res.json();
  },

  async putWithAdminToken(endpoint, data) {
    const token = okToken(localStorage.getItem("adminToken"));
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data ?? {}),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      const error = new Error(messageFromApiErr(err));
      error.status = res.status;
      attachApiErrorFields(error, err);
      throw error;
    }
    return res.json();
  },

  async deleteWithAdminToken(endpoint) {
    const token = okToken(localStorage.getItem("adminToken"));
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      const error = new Error(messageFromApiErr(err));
      error.status = res.status;
      attachApiErrorFields(error, err);
      throw error;
    }
    return res.json().catch(() => ({}));
  },

  async deleteWithDoctorToken(endpoint) {
    const token = okToken(localStorage.getItem("doctorToken"));
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      const error = new Error(messageFromApiErr(err));
      error.status = res.status;
      attachApiErrorFields(error, err);
      throw error;
    }
    return res.json().catch(() => ({}));
  },

  async deleteWithNurseToken(endpoint) {
    const token = okToken(localStorage.getItem("nurseToken"));
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      const error = new Error(messageFromApiErr(err));
      error.status = res.status;
      attachApiErrorFields(error, err);
      throw error;
    }
    return res.json().catch(() => ({}));
  },

  async deleteWithPatientToken(endpoint) {
    const token = okToken(localStorage.getItem("patientToken"));
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      const error = new Error(messageFromApiErr(err));
      error.status = res.status;
      attachApiErrorFields(error, err);
      throw error;
    }
    return res.json().catch(() => ({}));
  },

  async postWithDoctorToken(endpoint, data) {
    const token = okToken(localStorage.getItem("doctorToken"));
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data ?? {}),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      const error = new Error(messageFromApiErr(err));
      error.status = res.status;
      attachApiErrorFields(error, err);
      throw error;
    }
    return res.json();
  },

  async postWithPatientToken(endpoint, data) {
    const token = okToken(localStorage.getItem("patientToken"));
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data ?? {}),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      const error = new Error(messageFromApiErr(err));
      error.status = res.status;
      attachApiErrorFields(error, err);
      throw error;
    }
    return res.json();
  },

  async postWithNurseToken(endpoint, data) {
    const token = okToken(localStorage.getItem("nurseToken"));
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data ?? {}),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      const error = new Error(messageFromApiErr(err));
      error.status = res.status;
      attachApiErrorFields(error, err);
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
  /** Médecin connecté : patients dont il est le référent (JWT médecin obligatoire). */
  getMyAssignedForDoctor: () => api.getWithDoctorToken("/patients/doctor/my-patients"),
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
  getMyNursesAsDoctor: () => api.getWithDoctorToken("/departments/doctor/my-nurses"),
  /** Médecin connecté : médecins du même département (JWT). */
  getMyDoctorsAsDoctor: () => api.getWithDoctorToken("/departments/doctor/my-doctors"),
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
/** Messagerie équipe soignante (JWT patient / médecin / infirmier). */
export const chatApi = {
  getDepartmentContacts: () => {
    if (typeof localStorage !== "undefined" && localStorage.getItem("doctorUser")) {
      return api.getWithDoctorToken("/chat/department-contacts");
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("nurseUser")) {
      return api.getWithNurseToken("/chat/department-contacts");
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("patientUser")) {
      return api.getWithPatientToken("/chat/department-contacts");
    }
    return api.get("/chat/department-contacts");
  },
  /** Médecin, infirmier ou patient : groupes dont le connecté est membre. */
  getGroups: () => {
    if (typeof localStorage !== "undefined" && localStorage.getItem("doctorUser")) {
      return api.getWithDoctorToken("/chat/groups");
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("nurseUser")) {
      return api.getWithNurseToken("/chat/groups");
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("patientUser")) {
      return api.getWithPatientToken("/chat/groups");
    }
    return api.get("/chat/groups");
  },
  /** Création de groupe (médecin / infirmier uniquement). */
  createGroup: (payload) => {
    if (typeof localStorage !== "undefined" && localStorage.getItem("doctorUser")) {
      return api.postWithDoctorToken("/chat/groups", payload);
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("nurseUser")) {
      return api.postWithNurseToken("/chat/groups", payload);
    }
    return api.post("/chat/groups", payload);
  },
  getConversations: () => {
    if (typeof localStorage !== "undefined" && localStorage.getItem("doctorUser")) {
      return api.getWithDoctorToken("/chat/conversations");
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("nurseUser")) {
      return api.getWithNurseToken("/chat/conversations");
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("patientUser")) {
      return api.getWithPatientToken("/chat/conversations");
    }
    return api.get("/chat/conversations");
  },
  /** Fil patient : (patientId, params) — fil pair : ({ peerRole, peerId, before?, limit? }) */
  getMessages: (arg1, params = {}) => {
    const isGroup = arg1 && typeof arg1 === "object" && !Array.isArray(arg1) && arg1.groupId;
    const isPeer =
      arg1 &&
      typeof arg1 === "object" &&
      !Array.isArray(arg1) &&
      (arg1.peerRole === "doctor" || arg1.peerRole === "nurse") &&
      arg1.peerId;
    const q = new URLSearchParams();
    if (isGroup) {
      q.set("groupId", String(arg1.groupId));
      if (arg1.before) q.set("before", String(arg1.before));
      if (arg1.limit != null) q.set("limit", String(arg1.limit));
    } else if (isPeer) {
      q.set("peerRole", String(arg1.peerRole));
      q.set("peerId", String(arg1.peerId));
      if (arg1.before) q.set("before", String(arg1.before));
      if (arg1.limit != null) q.set("limit", String(arg1.limit));
    } else {
      const patientId = arg1;
      if (params.before) q.set("before", String(params.before));
      if (params.limit != null) q.set("limit", String(params.limit));
      const qs = q.toString();
      const path = `/chat/messages/${encodeURIComponent(patientId)}${qs ? `?${qs}` : ""}`;
      if (typeof localStorage !== "undefined" && localStorage.getItem("doctorUser")) {
        return api.getWithDoctorToken(path);
      }
      if (typeof localStorage !== "undefined" && localStorage.getItem("nurseUser")) {
        return api.getWithNurseToken(path);
      }
      if (typeof localStorage !== "undefined" && localStorage.getItem("patientUser")) {
        return api.getWithPatientToken(path);
      }
      return api.get(path);
    }
    const path = `/chat/messages?${q.toString()}`;
    if (isGroup || isPeer) {
      if (typeof localStorage !== "undefined" && localStorage.getItem("doctorUser")) {
        return api.getWithDoctorToken(path);
      }
      if (typeof localStorage !== "undefined" && localStorage.getItem("nurseUser")) {
        return api.getWithNurseToken(path);
      }
      if (typeof localStorage !== "undefined" && localStorage.getItem("patientUser")) {
        return api.getWithPatientToken(path);
      }
      return api.get(path);
    }
  },
  /** body = texte ; cible patient OU pair (pas les deux). */
  sendMessage: (payload) => {
    const data = { body: payload.body };
    if (payload.kind) data.kind = payload.kind;
    if (payload.patientId) data.patientId = payload.patientId;
    if (payload.groupId) {
      data.groupId = payload.groupId;
    } else if (payload.peerRole && payload.peerId) {
      data.peerRole = payload.peerRole;
      data.peerId = payload.peerId;
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("doctorUser")) {
      return api.postWithDoctorToken("/chat/messages", data);
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("nurseUser")) {
      return api.postWithNurseToken("/chat/messages", data);
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("patientUser")) {
      return api.postWithPatientToken("/chat/messages", data);
    }
    return api.post("/chat/messages", data);
  },
  /** FormData avec champ file (Blob) + patientId ou peerRole + peerId */
  sendVoiceMessage: (formData) => api.postMultipart("/chat/messages/voice", formData),
  /** FormData : file, category (image|video|document), caption optionnel, + routage */
  sendMediaMessage: (formData) => api.postMultipart("/chat/messages/media", formData),
  markRead: (patientId) => {
    const path = `/chat/read/${encodeURIComponent(patientId)}`;
    if (typeof localStorage !== "undefined" && localStorage.getItem("doctorUser")) {
      return api.patchWithDoctorToken(path, {});
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("nurseUser")) {
      return api.patchWithNurseToken(path, {});
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("patientUser")) {
      return api.patchWithPatientToken(path, {});
    }
    return api.patch(path, {});
  },
  markReadPeer: (peerRole, peerId) => {
    const path = `/chat/read-peer?peerRole=${encodeURIComponent(peerRole)}&peerId=${encodeURIComponent(peerId)}`;
    if (typeof localStorage !== "undefined" && localStorage.getItem("doctorUser")) {
      return api.patchWithDoctorToken(path, {});
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("nurseUser")) {
      return api.patchWithNurseToken(path, {});
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("patientUser")) {
      return api.patchWithPatientToken(path, {});
    }
    return api.patch(path, {});
  },
  /** Patient : marquer lu le fil avec un médecin ou un infirmier (distinct du fil staff–staff). */
  markReadPatientStaff: (peerRole, peerId) => {
    const path = `/chat/read-patient-staff?peerRole=${encodeURIComponent(peerRole)}&peerId=${encodeURIComponent(peerId)}`;
    if (typeof localStorage !== "undefined" && localStorage.getItem("patientUser")) {
      return api.patchWithPatientToken(path, {});
    }
    return api.patch(path, {});
  },
  markReadGroup: (groupId) => {
    const path = `/chat/read-group/${encodeURIComponent(groupId)}`;
    if (typeof localStorage !== "undefined" && localStorage.getItem("doctorUser")) {
      return api.patchWithDoctorToken(path, {});
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("nurseUser")) {
      return api.patchWithNurseToken(path, {});
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("patientUser")) {
      return api.patchWithPatientToken(path, {});
    }
    return api.patch(path, {});
  },
};

/** Notifications (JWT médecin, infirmier, patient ou admin). */
export const notificationApi = {
  getMine: () => {
    if (typeof localStorage !== "undefined" && localStorage.getItem("doctorUser")) {
      return api.getWithDoctorToken("/notifications/me");
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("nurseUser")) {
      return api.getWithNurseToken("/notifications/me");
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("adminUser")) {
      return api.getWithAdminToken("/notifications/me");
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("patientUser")) {
      return api.getWithPatientToken("/notifications/me");
    }
    return api.get("/notifications/me");
  },
  markRead: (id) => {
    const path = `/notifications/${encodeURIComponent(String(id))}/read`;
    if (typeof localStorage !== "undefined" && localStorage.getItem("doctorUser")) {
      return api.patchWithDoctorToken(path, {});
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("nurseUser")) {
      return api.patchWithNurseToken(path, {});
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("adminUser")) {
      return api.patchWithAdminToken(path, {});
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("patientUser")) {
      return api.patchWithPatientToken(path, {});
    }
    return api.patch(path, {});
  },
  markAllRead: () => {
    if (typeof localStorage !== "undefined" && localStorage.getItem("doctorUser")) {
      return api.patchWithDoctorToken("/notifications/read-all", {});
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("nurseUser")) {
      return api.patchWithNurseToken("/notifications/read-all", {});
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("adminUser")) {
      return api.patchWithAdminToken("/notifications/read-all", {});
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("patientUser")) {
      return api.patchWithPatientToken("/notifications/read-all", {});
    }
    return api.patch("/notifications/read-all", {});
  },
  deleteOne: (id) => {
    const path = `/notifications/${encodeURIComponent(id)}`;
    if (typeof localStorage !== "undefined" && localStorage.getItem("doctorUser")) {
      return api.deleteWithDoctorToken(path);
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("nurseUser")) {
      return api.deleteWithNurseToken(path);
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("adminUser")) {
      return api.deleteWithAdminToken(path);
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("patientUser")) {
      return api.deleteWithPatientToken(path);
    }
    return api.delete(path);
  },
  deleteAll: () => {
    if (typeof localStorage !== "undefined" && localStorage.getItem("doctorUser")) {
      return api.deleteWithDoctorToken("/notifications/all");
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("nurseUser")) {
      return api.deleteWithNurseToken("/notifications/all");
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("adminUser")) {
      return api.deleteWithAdminToken("/notifications/all");
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("patientUser")) {
      return api.deleteWithPatientToken("/notifications/all");
    }
    return api.delete("/notifications/all");
  },
};

/** Questionnaires & protocoles (JWT admin / médecin / patient). */
export const questionnaireApi = {
  adminListTemplates: () => api.getWithAdminToken("/questionnaires/admin/templates"),
  adminCreateTemplate: (data) => api.postWithAdminToken("/questionnaires/admin/templates", data),
  adminUpdateTemplate: (id, data) => api.putWithAdminToken(`/questionnaires/admin/templates/${encodeURIComponent(id)}`, data),
  adminDeleteTemplate: (id) => api.deleteWithAdminToken(`/questionnaires/admin/templates/${encodeURIComponent(id)}`),
  adminListProtocols: () => api.getWithAdminToken("/questionnaires/admin/protocols"),
  adminCreateProtocol: (data) => api.postWithAdminToken("/questionnaires/admin/protocols", data),
  adminUpdateProtocol: (id, data) => api.putWithAdminToken(`/questionnaires/admin/protocols/${encodeURIComponent(id)}`, data),
  adminDeleteProtocol: (id) => api.deleteWithAdminToken(`/questionnaires/admin/protocols/${encodeURIComponent(id)}`),
  doctorAssignProtocol: (data) => api.postWithDoctorToken("/questionnaires/doctor/assign-protocol", data),
  doctorAddAddon: (data) => api.postWithDoctorToken("/questionnaires/doctor/add-addon", data),
  doctorPatientSummary: (patientId) =>
    api.getWithDoctorToken(`/questionnaires/doctor/patient/${encodeURIComponent(patientId)}/summary`),
  doctorGetSubmission: (patientId, submissionId) =>
    api.getWithDoctorToken(
      `/questionnaires/doctor/patient/${encodeURIComponent(patientId)}/submission/${encodeURIComponent(submissionId)}`
    ),
  doctorProtocolsForPatient: (patientId) =>
    api.getWithDoctorToken(`/questionnaires/doctor/patient/${encodeURIComponent(patientId)}/protocols`),
  doctorTemplatesForPatient: (patientId) =>
    api.getWithDoctorToken(`/questionnaires/doctor/patient/${encodeURIComponent(patientId)}/templates`),
  patientPending: () => api.getWithPatientToken("/questionnaires/me/pending"),
  patientSchedule: () => api.getWithPatientToken("/questionnaires/me/schedule"),
  patientSubmit: (data) => api.postWithPatientToken("/questionnaires/me/submit", data),
};

export const healthLogApi = {
  submit: (data) => api.post('/health-logs', data),
  getHistory: (patientId) =>
    api.get(`/health-logs/patient/${encodeURIComponent(String(patientId))}`),
  getLatest: (patientId) =>
    api.get(`/health-logs/patient/${encodeURIComponent(String(patientId))}/latest`),
  /**
   * Dernière consigne du médecin après clôture d’une alerte (dashboard patient).
   * GET explicite + parse tolérant (corps vide / null) + jeton patient pour éviter un mauvais rôle dans getValidToken.
   */
  getLatestDoctorConsigne: async (patientId) => {
    const token = okToken(localStorage.getItem("patientToken"));
    const url = `${API_BASE}/health-logs/patient/${encodeURIComponent(String(patientId))}/latest-doctor-consigne`;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || !String(text).trim()) return null;
    try {
      const data = JSON.parse(text);
      if (data == null) return null;
      return data;
    } catch {
      return null;
    }
  },
  /** JWT infirmier — relevés urgents encore ouverts (suivi ou escaladés au médecin). */
  nursePendingAlerts: () => api.getWithNurseToken('/health-logs/nurse/pending-alerts'),
  escalateToDoctor: (healthLogId, note) =>
    api.postWithNurseToken(`/health-logs/${encodeURIComponent(String(healthLogId))}/escalate-to-doctor`, {
      note: note != null ? String(note) : '',
    }),
  /** JWT médecin référent — clôture + envoi de la consigne au patient (body.resolutionNote obligatoire). */
  doctorResolveVitalAlert: (healthLogId, body = {}) =>
    api.patchWithDoctorToken(`/health-logs/${encodeURIComponent(String(healthLogId))}/resolve`, {
      resolutionNote: String(body.resolutionNote ?? '').trim(),
    }),
  /** JWT médecin — historique des escalades infirmier → médecin (patients suivis). status: all | pending | resolved */
  doctorNurseEscalations: (status) => {
    const q =
      status && String(status) !== 'all'
        ? `?status=${encodeURIComponent(String(status))}`
        : '';
    return api.getWithDoctorToken(`/health-logs/doctor/nurse-escalations${q}`);
  },
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

export const doctorAvailabilityApi = {
  /** JWT médecin — mois au format YYYY-MM */
  getMyMonth: (yearMonth) =>
    api.getWithDoctorToken(`/doctor-availability/me/${encodeURIComponent(yearMonth)}`),
  saveMyMonth: (yearMonth, slots) =>
    api.putWithDoctorToken(`/doctor-availability/me/${encodeURIComponent(yearMonth)}`, { slots }),
};

export const appointmentApi = {
  create: (data) => api.post('/appointments', data),
  getByPatient: (patientId) => api.get(`/appointments/patient/${patientId}`),
  getUpcoming: (patientId) => api.get(`/appointments/patient/${patientId}/upcoming`),
  /** RDV confirmés à venir (JWT médecin) */
  getUpcomingForDoctor: () => api.getWithDoctorToken('/appointments/doctor/upcoming'),
  /** RDV confirmés pour un mois YYYY-MM (JWT médecin) — calendrier */
  getConfirmedForDoctorMonth: (yearMonth) =>
    api.getWithDoctorToken(`/appointments/doctor/month/${encodeURIComponent(yearMonth)}`),
  /** Demandes en attente (JWT admin / superadmin) */
  getPendingForAdmin: () => api.getWithAdminToken('/appointments/admin/pending'),
  /** RDV confirmés à venir (JWT admin / superadmin) */
  getConfirmedForAdmin: () => api.getWithAdminToken('/appointments/admin/confirmed'),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  /** Mise à jour côté admin (jeton admin explicite) */
  updateAsAdmin: (id, data) => api.putWithAdminToken(`/appointments/${id}`, data),
  remove: (id) => api.delete(`/appointments/${id}`),
};

/** JWT patient / médecin / infirmier — messagerie interne (API /mail). */
export const mailApi = {
  recipients: () => api.get('/mail/recipients'),
  storage: () => api.get('/mail/storage'),
  counts: () => api.get('/mail/counts'),
  listMessages: (params = {}) => {
    const q = new URLSearchParams();
    if (params.folder) q.set('folder', params.folder);
    if (params.starred) q.set('starred', 'true');
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    const s = q.toString();
    return api.get(`/mail/messages${s ? `?${s}` : ''}`);
  },
  getMessage: (stateId) => api.get(`/mail/messages/${encodeURIComponent(stateId)}`),
  send: (body) => api.post('/mail/send', body),
  saveDraft: (body) => api.post('/mail/drafts', body),
  getDraft: (messageId) => api.get(`/mail/drafts/${encodeURIComponent(messageId)}`),
  updateDraft: (messageId, body) =>
    api.patch(`/mail/drafts/${encodeURIComponent(messageId)}`, body),
  sendDraft: (messageId) => api.post(`/mail/drafts/${encodeURIComponent(messageId)}/send`, {}),
  markRead: (stateId, read = true) =>
    api.patch(`/mail/messages/${encodeURIComponent(stateId)}/read`, { read }),
  move: (stateId, folder) =>
    api.patch(`/mail/messages/${encodeURIComponent(stateId)}/move`, { folder }),
  deleteMessage: (stateId) =>
    api.delete(`/mail/messages/${encodeURIComponent(stateId)}`),
  emptyTrash: () => api.post('/mail/trash/empty', {}),
  star: (stateId, starred) =>
    api.patch(`/mail/messages/${encodeURIComponent(stateId)}/star`, { starred }),
  snooze: (stateId, until) =>
    api.patch(`/mail/messages/${encodeURIComponent(stateId)}/snooze`, { until: until || null }),
  listLabels: () => api.get('/mail/labels'),
  createLabel: (body) => api.post('/mail/labels', body),
  deleteLabel: (labelId) => api.delete(`/mail/labels/${encodeURIComponent(labelId)}`),
  addLabel: (stateId, labelId) =>
    api.post(`/mail/messages/${encodeURIComponent(stateId)}/labels/${encodeURIComponent(labelId)}`, {}),
  removeLabel: (stateId, labelId) =>
    api.delete(`/mail/messages/${encodeURIComponent(stateId)}/labels/${encodeURIComponent(labelId)}`),
};

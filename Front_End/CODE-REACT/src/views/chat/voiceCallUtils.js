/** Identifiant de salle WebRTC stable pour une paire d’utilisateurs (même chaîne des deux côtés). */
export function buildVoiceCallContext(session, def) {
    if (!session?.id || !def) return null;
    const self = `${session.role}:${String(session.id)}`;
    if (def.thread === "patientStaff") {
        const peer = `${def.peerRole}:${String(def.peerId)}`;
        return {
            roomId: [self, peer].sort().join("|"),
            remoteUserId: String(def.peerId),
            label: def.title || "Contact",
            routing: {
                patientId: String(def.patientId),
                peerRole: def.peerRole,
                peerId: String(def.peerId),
            },
        };
    }
    if (def.thread === "patient") {
        const peer = `patient:${String(def.patientId)}`;
        const staff = `${session.role}:${String(session.id)}`;
        return {
            roomId: [peer, staff].sort().join("|"),
            remoteUserId: String(def.patientId),
            label: def.title || "Patient",
            routing: { patientId: String(def.patientId) },
        };
    }
    if (def.thread === "peer") {
        const peer = `${def.peerRole}:${String(def.peerId)}`;
        return {
            roomId: [self, peer].sort().join("|"),
            remoteUserId: String(def.peerId),
            label: def.title || "Contact",
            routing: { peerRole: def.peerRole, peerId: String(def.peerId) },
        };
    }
    if (def.thread === "group") return null;
    return null;
}

export function getSelfDisplayName(session) {
    try {
        const key =
            session.role === "patient"
                ? "patientUser"
                : session.role === "doctor"
                  ? "doctorUser"
                  : session.role === "nurse"
                    ? "nurseUser"
                    : session.role === "carecoordinator"
                      ? "adminUser"
                      : null;
        if (!key) return "Utilisateur";
        const raw = localStorage.getItem(key);
        if (!raw) return "Utilisateur";
        const u = JSON.parse(raw);
        const name = `${u.firstName || ""} ${u.lastName || ""}`.trim();
        return name || u.email || "Utilisateur";
    } catch {
        return "Utilisateur";
    }
}

const DEFAULT_STUN = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
];

/** ICE (STUN/TURN) — en prod, ajoutez un TURN (Vercel + réseaux stricts) via VITE_WEBRTC_ICE_SERVERS. */
export const VOICE_ICE_SERVERS = (() => {
    const raw = import.meta.env.VITE_WEBRTC_ICE_SERVERS;
    if (typeof raw === "string" && raw.trim()) {
        try {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr) && arr.length > 0) return arr;
        } catch {
            console.warn("[WebRTC] VITE_WEBRTC_ICE_SERVERS invalide (JSON attendu), STUN public utilisé.");
        }
    }
    return DEFAULT_STUN;
})();

export function getApiOrigin() {
    return (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api\/?$/, "");
}

function okToken(t) {
    return t && t !== "undefined" && t !== "null" ? t : null;
}

export function getAuthTokenForSocket() {
    try {
        if (localStorage.getItem("patientUser")) return okToken(localStorage.getItem("patientToken"));
        if (localStorage.getItem("doctorUser")) return okToken(localStorage.getItem("doctorToken"));
        if (localStorage.getItem("nurseUser")) return okToken(localStorage.getItem("nurseToken"));
        const u = JSON.parse(localStorage.getItem("adminUser") || "null");
        if (u?.role === "carecoordinator") return okToken(localStorage.getItem("adminToken"));
    } catch {
        /* ignore */
    }
    return (
        okToken(localStorage.getItem("patientToken")) ||
        okToken(localStorage.getItem("doctorToken")) ||
        okToken(localStorage.getItem("nurseToken"))
    );
}

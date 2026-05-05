/**
 * Préférences chat par session : épinglage, masquage, blocage (localStorage).
 */

const PREFIX = "medifollow-chat-prefs";

function key(sessionId, kind) {
  return `${PREFIX}:${sessionId || "anon"}:${kind}`;
}

/** Clé stable identifiant un fil de discussion (alignée sur def dans chat.jsx). */
export function getThreadKey(def) {
  if (!def) return "";
  if (def.thread === "patientLegacy") return `legacy:${def.patientId}`;
  if (def.thread === "patientStaff") return `ps:${def.patientId}:${def.peerRole}:${def.peerId}`;
  if (def.thread === "patient") return `pat:${def.patientId}`;
    if (def.thread === "peer") return `peer:${def.peerRole}:${def.peerId}`;
    if (def.thread === "group") return `grp:${def.groupId}`;
    return "";
}

export function loadPinned(sessionId) {
  try {
    const raw = localStorage.getItem(key(sessionId, "pinned"));
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function savePinned(sessionId, ids) {
  try {
    localStorage.setItem(key(sessionId, "pinned"), JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

export function loadHidden(sessionId) {
  try {
    const raw = localStorage.getItem(key(sessionId, "hidden"));
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function saveHidden(sessionId, ids) {
  try {
    localStorage.setItem(key(sessionId, "hidden"), JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

export function loadBlocked(sessionId) {
  try {
    const raw = localStorage.getItem(key(sessionId, "blocked"));
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function saveBlocked(sessionId, ids) {
  try {
    localStorage.setItem(key(sessionId, "blocked"), JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

/** Retire les lignes « item » dont la clé est masquée. */
export function filterHiddenRows(rows, hiddenSet) {
  if (!hiddenSet || hiddenSet.size === 0) return rows;
  return rows.filter((r) => {
    if (r.type !== "item") return true;
    const k = getThreadKey(r.def);
    return !k || !hiddenSet.has(k);
  });
}

/** Dans chaque section, place les fils épinglés en tête (ordre = pinnedKeys). */
export function sortRowsByPinned(rows, pinnedKeys) {
  if (!pinnedKeys || pinnedKeys.length === 0) return rows;
  const order = new Map(pinnedKeys.map((k, i) => [k, i]));
  const out = [];
  const buf = [];
  const flush = () => {
    if (buf.length === 0) return;
    buf.sort((a, b) => {
      const ka = getThreadKey(a.def);
      const kb = getThreadKey(b.def);
      const ia = order.has(ka) ? order.get(ka) : 9999;
      const ib = order.has(kb) ? order.get(kb) : 9999;
      if (ia !== ib) return ia - ib;
      return 0;
    });
    out.push(...buf);
    buf.length = 0;
  };
  for (const r of rows) {
    if (r.type === "section") {
      flush();
      out.push(r);
    } else {
      buf.push(r);
    }
  }
  flush();
  return out;
}

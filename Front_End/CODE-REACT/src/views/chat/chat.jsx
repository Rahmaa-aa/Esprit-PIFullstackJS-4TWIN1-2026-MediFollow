import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Col, Form, Modal, Nav, Row, Tab, Spinner } from "react-bootstrap";
import user05 from "/assets/images/user/05.jpg";
import user06 from "/assets/images/user/06.jpg";
import user07 from "/assets/images/user/07.jpg";
import user08 from "/assets/images/user/08.jpg";
import user09 from "/assets/images/user/09.jpg";
import user10 from "/assets/images/user/10.jpg";
import ChatData from "../../components/chat-data";
import { chatApi } from "../../services/api";
import VoiceCallLayer from "./VoiceCallLayer";
import { buildVoiceCallContext } from "./voiceCallUtils";
import {
    filterHiddenRows,
    getThreadKey,
    loadBlocked,
    loadHidden,
    loadPinned,
    saveBlocked,
    saveHidden,
    savePinned,
    sortRowsByPinned,
} from "./chatThreadPrefs";

const generatePath = (path) => {
    const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "") || "";
    const p = (path || "").replace(/^\/+/, "");
    return `${window.origin}${base}/${p}`.replace(/([^:])\/\/+/g, "$1/");
};

const imgUrl = (path) => {
    if (!path) return user05;
    if (path.startsWith("data:") || path.startsWith("http")) return path;
    return generatePath(path.startsWith("/") ? path.slice(1) : path);
};

function getSession() {
    try {
        if (localStorage.getItem("adminUser")) {
            const u = JSON.parse(localStorage.getItem("adminUser"));
            if (u?.role === "carecoordinator") {
                return { id: String(u.id || u._id || ""), role: "carecoordinator" };
            }
        }
        if (localStorage.getItem("patientUser")) {
            const u = JSON.parse(localStorage.getItem("patientUser"));
            return { id: String(u.id || u._id || ""), role: "patient" };
        }
        if (localStorage.getItem("doctorUser")) {
            const u = JSON.parse(localStorage.getItem("doctorUser"));
            return { id: String(u.id || u._id || ""), role: "doctor" };
        }
        if (localStorage.getItem("nurseUser")) {
            const u = JSON.parse(localStorage.getItem("nurseUser"));
            return { id: String(u.id || u._id || ""), role: "nurse" };
        }
    } catch {
        /* ignore */
    }
    return { id: "", role: "" };
}

/** Options médecins / infirmiers (dédupliquées) pour création de groupe. */
function collectStaffMemberOptions(dc) {
    const seen = new Map();
    const add = (arr, role) => {
        for (const x of arr || []) {
            if (!x?.id) continue;
            const k = `${role}:${x.id}`;
            if (!seen.has(k)) {
                seen.set(k, {
                    role,
                    id: x.id,
                    label: x.displayName || `${x.firstName || ""} ${x.lastName || ""}`.trim() || x.id,
                });
            }
        }
    };
    add(dc.doctors, "doctor");
    add(dc.nurses, "nurse");
    add(dc.doctorsAll, "doctor");
    add(dc.nursesAll, "nurse");
    add(dc.coordinators, "carecoordinator");
    for (const p of dc.assignedPatients || []) {
        if (!p?.id) continue;
        const k = `patient:${p.id}`;
        if (!seen.has(k)) {
            seen.set(k, {
                role: "patient",
                id: p.id,
                label: p.displayName || `${p.firstName || ""} ${p.lastName || ""}`.trim() || p.id,
            });
        }
    }
    return [...seen.values()];
}

/** Construit les onglets + sections (même département / patients) pour le template */
function buildSidebarRows(dc, session, groups = [], t) {
    const rows = [];
    let box = 1;
    const departmentLabel = dc.department || "—";

    const pushSection = (title) => {
        rows.push({ type: "section", title });
    };

    const pushItem = (def) => {
        const eventKey = `chatbox${box++}`;
        rows.push({ type: "item", eventKey, def });
    };

    if (session.role === "patient" && dc.patientSelf) {
        const selfId = session.id;
        pushSection(t("chat.sections.myFollowUp"));
        pushItem({
            thread: "patientLegacy",
            patientId: selfId,
            title: t("chat.sections.patientThreadTitle"),
            subtitle: t("chat.sections.patientThreadSubtitle"),
            data: {
                title: t("chat.sections.patientThreadTitle"),
                userimg: imgUrl(dc.patientSelf.profileImage),
                userdetailname: dc.patientSelf.displayName || t("chat.sections.patient"),
                useraddress: departmentLabel,
                usersortname: (dc.patientSelf.displayName || "").split(" ")[0] || "—",
                usertelnumber: "—",
                userdob: "—",
                usergender: "—",
                userlanguage: "—",
            },
        });

        if (dc.assignedDoctor) {
            pushSection(t("chat.sections.referents"));
            const d = dc.assignedDoctor;
            pushItem({
                thread: "patientStaff",
                patientId: selfId,
                peerRole: "doctor",
                peerId: d.id,
                title: `Dr. ${d.displayName}`,
                subtitle: d.subtitle || t("chat.sections.doctorReferent"),
                data: {
                    title: `Dr. ${d.displayName}`,
                    userimg: imgUrl(d.profileImage),
                    userdetailname: d.displayName,
                    useraddress: d.department || departmentLabel,
                    usersortname: d.firstName || "",
                    usertelnumber: "—",
                    userdob: "—",
                    usergender: "—",
                    userlanguage: "—",
                },
            });
        }
        if (dc.assignedNurse) {
            if (!dc.assignedDoctor) pushSection(t("chat.sections.referents"));
            const n = dc.assignedNurse;
            pushItem({
                thread: "patientStaff",
                patientId: selfId,
                peerRole: "nurse",
                peerId: n.id,
                title: `${t("chat.sections.idePrefix")}${n.displayName}`,
                subtitle: n.subtitle || t("chat.sections.nurseReferent"),
                data: {
                    title: `${t("chat.sections.idePrefix")}${n.displayName}`,
                    userimg: imgUrl(n.profileImage),
                    userdetailname: n.displayName,
                    useraddress: n.department || departmentLabel,
                    usersortname: n.firstName || "",
                    usertelnumber: "—",
                    userdob: "—",
                    usergender: "—",
                    userlanguage: "—",
                },
            });
        }

        const coordDept = dc.coordinators || [];
        if (coordDept.length) {
            if (!dc.assignedDoctor && !dc.assignedNurse) pushSection(t("chat.sections.referents"));
            for (const c of coordDept) {
                pushItem({
                    thread: "patientStaff",
                    patientId: selfId,
                    peerRole: "carecoordinator",
                    peerId: c.id,
                    title: c.displayName,
                    subtitle: c.subtitle || t("chat.sections.peerCoordinatorDefault"),
                    data: {
                        title: c.displayName,
                        userimg: imgUrl(c.profileImage),
                        userdetailname: c.displayName,
                        useraddress: c.department || departmentLabel,
                        usersortname: c.firstName || "",
                        usertelnumber: "—",
                        userdob: "—",
                        usergender: "—",
                        userlanguage: "—",
                    },
                });
            }
        }

        const groupsPatient = Array.isArray(groups) ? groups : [];
        if (groupsPatient.length) {
            pushSection(t("chat.sections.groups"));
            for (const g of groupsPatient) {
                pushItem({
                    thread: "group",
                    groupId: g.id,
                    title: g.name,
                    subtitle: t("chat.sections.group"),
                    data: {
                        title: g.name,
                        userimg: user07,
                        userdetailname: g.name,
                        useraddress: departmentLabel,
                        usersortname: (g.name || "").slice(0, 2) || t("chat.sections.groupShort"),
                        usertelnumber: "—",
                        userdob: "—",
                        usergender: "—",
                        userlanguage: "—",
                    },
                });
            }
        }

        return { rows, departmentLabel };
    }

    if (session.role === "carecoordinator") {
        const medSame = dc.doctors || [];
        const nurSame = dc.nurses || [];
        const plist = dc.assignedPatients || [];
        if (plist.length) {
            pushSection(t("chat.sections.patientsSameDept"));
            for (const p of plist) {
                pushItem({
                    thread: "patient",
                    patientId: p.id,
                    title: p.displayName,
                    subtitle: p.subtitle || t("chat.sections.patient"),
                    data: {
                        title: p.displayName,
                        userimg: imgUrl(p.profileImage),
                        userdetailname: p.displayName,
                        useraddress: departmentLabel,
                        usersortname: (p.displayName || "").split(" ")[0] || "",
                        usertelnumber: "—",
                        userdob: "—",
                        usergender: "—",
                        userlanguage: "—",
                    },
                });
            }
        }
        pushSection(t("chat.sections.doctorsSameDept"));
        for (const d of medSame) {
            pushItem({
                thread: "peer",
                peerRole: "doctor",
                peerId: d.id,
                title: d.displayName,
                subtitle: d.subtitle || t("chat.sections.peerDoctorDefault"),
                data: {
                    title: d.displayName,
                    userimg: imgUrl(d.profileImage),
                    userdetailname: d.displayName,
                    useraddress: d.department || departmentLabel,
                    usersortname: d.firstName || "",
                    usertelnumber: "—",
                    userdob: "—",
                    usergender: "—",
                    userlanguage: "—",
                },
            });
        }
        pushSection(t("chat.sections.nursesSameDept"));
        for (const n of nurSame) {
            pushItem({
                thread: "peer",
                peerRole: "nurse",
                peerId: n.id,
                title: n.displayName,
                subtitle: n.subtitle || t("chat.sections.peerNurseDefault"),
                data: {
                    title: n.displayName,
                    userimg: imgUrl(n.profileImage),
                    userdetailname: n.displayName,
                    useraddress: n.department || departmentLabel,
                    usersortname: n.firstName || "",
                    usertelnumber: "—",
                    userdob: "—",
                    usergender: "—",
                    userlanguage: "—",
                },
            });
        }
        return { rows, departmentLabel };
    }

    if (session.role === "doctor" || session.role === "nurse") {
        const plist = dc.assignedPatients || [];
        if (plist.length) {
            pushSection(session.role === "doctor" ? t("chat.sections.myPatients") : t("chat.sections.patientsFollowed"));
            for (const p of plist) {
                pushItem({
                    thread: "patient",
                    patientId: p.id,
                    title: p.displayName,
                    subtitle: p.subtitle || t("chat.sections.patient"),
                    data: {
                        title: p.displayName,
                        userimg: imgUrl(p.profileImage),
                        userdetailname: p.displayName,
                        useraddress: departmentLabel,
                        usersortname: p.displayName.split(" ")[0] || "",
                        usertelnumber: "—",
                        userdob: "—",
                        usergender: "—",
                        userlanguage: "—",
                    },
                });
            }
        }
        const groupsList = Array.isArray(groups) ? groups : [];
        if (groupsList.length) {
            pushSection(t("chat.sections.groups"));
            for (const g of groupsList) {
                pushItem({
                    thread: "group",
                    groupId: g.id,
                    title: g.name,
                    subtitle: t("chat.sections.group"),
                    data: {
                        title: g.name,
                        userimg: user07,
                        userdetailname: g.name,
                        useraddress: departmentLabel,
                        usersortname: (g.name || "").slice(0, 2) || t("chat.sections.groupShort"),
                        usertelnumber: "—",
                        userdob: "—",
                        usergender: "—",
                        userlanguage: "—",
                    },
                });
            }
        }
        const medSame = dc.doctors || [];
        const nurSame = dc.nurses || [];
        const idSameDoc = new Set(medSame.map((d) => d.id));
        const idSameNur = new Set(nurSame.map((n) => n.id));
        const doctorsAll = dc.doctorsAll != null ? dc.doctorsAll : [];
        const nursesAll = dc.nursesAll != null ? dc.nursesAll : [];

        pushSection(t("chat.sections.doctorsSameDept"));
        for (const d of medSame) {
            pushItem({
                thread: "peer",
                peerRole: "doctor",
                peerId: d.id,
                title: d.displayName,
                subtitle: d.subtitle || t("chat.sections.peerDoctorDefault"),
                data: {
                    title: d.displayName,
                    userimg: imgUrl(d.profileImage),
                    userdetailname: d.displayName,
                    useraddress: d.department || departmentLabel,
                    usersortname: d.firstName || "",
                    usertelnumber: "—",
                    userdob: "—",
                    usergender: "—",
                    userlanguage: "—",
                },
            });
        }
        pushSection(t("chat.sections.nursesSameDept"));
        for (const n of nurSame) {
            pushItem({
                thread: "peer",
                peerRole: "nurse",
                peerId: n.id,
                title: n.displayName,
                subtitle: n.subtitle || t("chat.sections.peerNurseDefault"),
                data: {
                    title: n.displayName,
                    userimg: imgUrl(n.profileImage),
                    userdetailname: n.displayName,
                    useraddress: n.department || departmentLabel,
                    usersortname: n.firstName || "",
                    usertelnumber: "—",
                    userdob: "—",
                    usergender: "—",
                    userlanguage: "—",
                },
            });
        }
        const coordinatorsDept = dc.coordinators || [];
        if (coordinatorsDept.length) {
            pushSection(t("chat.sections.coordinators"));
            for (const c of coordinatorsDept) {
                if (String(c.id) === String(session.id)) continue;
                pushItem({
                    thread: "peer",
                    peerRole: "carecoordinator",
                    peerId: c.id,
                    title: c.displayName,
                    subtitle: c.subtitle || t("chat.sections.peerCoordinatorDefault"),
                    data: {
                        title: c.displayName,
                        userimg: imgUrl(c.profileImage),
                        userdetailname: c.displayName,
                        useraddress: c.department || departmentLabel,
                        usersortname: c.firstName || "",
                        usertelnumber: "—",
                        userdob: "—",
                        usergender: "—",
                        userlanguage: "—",
                    },
                });
            }
        }
        pushSection(t("chat.sections.allDoctors"));
        for (const d of doctorsAll) {
            if (idSameDoc.has(d.id)) continue;
            pushItem({
                thread: "peer",
                peerRole: "doctor",
                peerId: d.id,
                title: d.displayName,
                subtitle: d.subtitle || t("chat.sections.peerDoctorDefault"),
                data: {
                    title: d.displayName,
                    userimg: imgUrl(d.profileImage),
                    userdetailname: d.displayName,
                    useraddress: d.department || departmentLabel,
                    usersortname: d.firstName || "",
                    usertelnumber: "—",
                    userdob: "—",
                    usergender: "—",
                    userlanguage: "—",
                },
            });
        }
        pushSection(t("chat.sections.allNurses"));
        for (const n of nursesAll) {
            if (idSameNur.has(n.id)) continue;
            pushItem({
                thread: "peer",
                peerRole: "nurse",
                peerId: n.id,
                title: n.displayName,
                subtitle: n.subtitle || t("chat.sections.peerNurseDefault"),
                data: {
                    title: n.displayName,
                    userimg: imgUrl(n.profileImage),
                    userdetailname: n.displayName,
                    useraddress: n.department || departmentLabel,
                    usersortname: n.firstName || "",
                    usertelnumber: "—",
                    userdob: "—",
                    usergender: "—",
                    userlanguage: "—",
                },
            });
        }
        return { rows, departmentLabel };
    }

    return { rows: [], departmentLabel };
}

/** Texte affiché pour la recherche sidebar (médecin / infirmier) */
function staffSearchText(def) {
    const t = (def.title || "").trim();
    const d = (def.data?.userdetailname || "").trim();
    if (t && d && t.toLowerCase() !== d.toLowerCase()) return `${t} ${d}`;
    return t || d || "";
}

/** Correspondance : sous-chaîne du nom, mots qui commencent par chaque token, ou initiales (ex. « jd » pour Jean Dupont). */
function rowMatchesStaffSearch(def, rawQuery) {
    const q = (rawQuery || "").trim().toLowerCase();
    if (!q) return true;
    const full = staffSearchText(def).toLowerCase();
    if (!full) return false;
    if (full.includes(q)) return true;
    const sub = (def.subtitle || "").trim().toLowerCase();
    if (sub && sub.includes(q)) return true;
    const words = full.split(/\s+/).filter(Boolean);
    if (!words.length) return false;
    const initials = words.map((w) => w[0]).join("");
    if (initials.startsWith(q)) return true;
    const qParts = q.split(/\s+/).filter(Boolean);
    if (qParts.length > 1) {
        return qParts.every((qp, i) => words[i]?.startsWith(qp));
    }
    return words.some((w) => w.startsWith(q));
}

/** Filtre les lignes sidebar ; masque les sections vides. */
function filterSidebarRowsForStaffSearch(rows, query, role) {
    if (role !== "doctor" && role !== "nurse" && role !== "carecoordinator") return rows;
    if (!(query || "").trim()) return rows;
    const out = [];
    let i = 0;
    while (i < rows.length) {
        const r = rows[i];
        if (r.type === "section") {
            const title = r.title;
            const items = [];
            i += 1;
            while (i < rows.length && rows[i].type === "item") {
                if (rowMatchesStaffSearch(rows[i].def, query)) items.push(rows[i]);
                i += 1;
            }
            if (items.length) {
                out.push({ type: "section", title });
                out.push(...items);
            }
        } else if (r.type === "item") {
            if (rowMatchesStaffSearch(r.def, query)) out.push(r);
            i += 1;
        } else {
            i += 1;
        }
    }
    return out;
}

const STATIC_USER_DATA = [
    {
        title: "Team Discussions",
        userimg: user05,
        userdetailname: "Bini Jordan",
        useraddress: "Cape Town, RSA",
        usersortname: "Bini",
        usertelnumber: "072 143 9920",
        userdob: "July 12, 1989",
        usergender: "Male",
        userlanguage: "English",
    },
    {
        title: "Announcement",
        userimg: user06,
        useraddress: "Atlanta, USA",
        usersortname: "Mark",
        usertelnumber: "072 143 9920",
        userdob: "July 12, 1989",
        usergender: "Female",
        userlanguage: "English",
    },
    {
        title: "Doctors",
        userimg: user07,
        useraddress: "Cape Town, RSA",
        usersortname: "pai",
        usertelnumber: "072 143 9920",
        userdob: "July 12, 1989",
        usergender: "Male",
        userlanguage: "English",
    },
    {
        title: "Nurses",
        userimg: user08,
        userdetailname: "Barb Ackue",
        useraddress: "Cape Town, RSA",
        usersortname: "Babe",
        usertelnumber: "072 143 9920",
        userdob: "July 12, 1989",
        usergender: "Female",
        userlanguage: "English",
    },
    {
        title: "Testing Team",
        userimg: user09,
        userdetailname: "Peta Saireya",
        useraddress: "Cape Town, RSA",
        usersortname: "Pet",
        usertelnumber: "072 143 9920",
        userdob: "July 12, 1989",
        usergender: "Female",
        userlanguage: "English",
    },
    {
        title: "Paul Molive",
        userimg: user10,
        userdetailname: "Paul Molive",
        useraddress: "Cape Town, RSA",
        usersortname: "Pau",
        usertelnumber: "072 143 9920",
        userdob: "July 12, 1989",
        usergender: "Male",
        userlanguage: "English",
    },
    {
        title: "Paige Turner",
        userimg: user05,
        useraddress: "Cape Town, RSA",
        usersortname: "Pai",
        usertelnumber: "072 143 9920",
        userdob: "July 12, 1989",
        usergender: "Female",
        userlanguage: "English",
    },
    {
        title: "Barb Ackue",
        userimg: user06,
        useraddress: "Cape Town, RSA",
        usersortname: "Babe",
        usertelnumber: "072 143 9920",
        userdob: "July 12, 1989",
        usergender: "Female",
        userlanguage: "English",
    },
    {
        title: "Maya Didas",
        userimg: user07,
        userAddress: "Cape Town, RSA",
        userSortName: "Babe",
        userTelNumber: "072 143 9920",
        userDOB: "July 12, 1989",
        userGender: "Male",
        userLanguage: "English",
    },
    {
        title: "Monty Carlo",
        userimg: user08,
        userAddress: "Cape Town, RSA",
        userSortName: "Babe",
        userTelNumber: "072 143 9920",
        userDOB: "July 12, 1989",
        userGender: "Female",
        userLanguage: "English",
    },
];

const Chat = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const session = useMemo(() => getSession(), []);
    const deepLinkPeerSigRef = useRef("");
    const deepLinkPatientSigRef = useRef("");
    const [sidebar, setSidebar] = useState(false);
    const [sidebarRows, setSidebarRows] = useState([]);
    const [pinnedKeys, setPinnedKeys] = useState([]);
    const [hiddenKeys, setHiddenKeys] = useState(() => new Set());
    const [blockedKeys, setBlockedKeys] = useState(() => new Set());
    const [departmentLabel, setDepartmentLabel] = useState("");
    const [activeKey, setActiveKey] = useState("chatbox1");
    /** eventKey -> messages (tableau vide = chargé, sans clé = pas encore chargé) */
    const [messagesByKey, setMessagesByKey] = useState({});
    const [sending, setSending] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [unreadByPatientId, setUnreadByPatientId] = useState({});
    const [sidebarSearchQuery, setSidebarSearchQuery] = useState("");
    const [departmentContactsCache, setDepartmentContactsCache] = useState(null);
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [selectedMemberKeys, setSelectedMemberKeys] = useState(() => new Set());
    const [createGroupError, setCreateGroupError] = useState("");
    const [creatingGroup, setCreatingGroup] = useState(false);
    const voiceCallRef = useRef(null);

    const SidebarToggle = () => {
        if (window.innerWidth < 990) {
            setSidebar(!sidebar);
        }
    };

    useEffect(() => {
        if (!session.id) return;
        setPinnedKeys(loadPinned(session.id));
        setHiddenKeys(new Set(loadHidden(session.id)));
        setBlockedKeys(new Set(loadBlocked(session.id)));
    }, [session.id]);

    const displaySidebarRows = useMemo(() => {
        if (!sidebarRows.length) return [];
        const filtered = filterHiddenRows(sidebarRows, hiddenKeys);
        return sortRowsByPinned(filtered, pinnedKeys);
    }, [sidebarRows, hiddenKeys, pinnedKeys]);

    const displaySidebarRowsForList = useMemo(
        () => filterSidebarRowsForStaffSearch(displaySidebarRows, sidebarSearchQuery, session.role),
        [displaySidebarRows, sidebarSearchQuery, session.role],
    );

    const itemsOnlyAll = useMemo(
        () => displaySidebarRows.filter((r) => r.type === "item"),
        [displaySidebarRows],
    );

    const visibleSidebarItems = useMemo(
        () => displaySidebarRowsForList.filter((r) => r.type === "item"),
        [displaySidebarRowsForList],
    );

    const hasAnyThreadInSidebar = useMemo(
        () => sidebarRows.some((r) => r.type === "item"),
        [sidebarRows],
    );

    const tabDefByKey = useMemo(() => {
        const m = {};
        for (const r of displaySidebarRows) {
            if (r.type === "item") m[r.eventKey] = r.def;
        }
        return m;
    }, [displaySidebarRows]);

    const voicePeerContext = useMemo(
        () => buildVoiceCallContext(session, tabDefByKey[activeKey]),
        [session, activeKey, tabDefByKey],
    );

    const loadThread = useCallback(
        async (eventKey, defOverride) => {
            const def = defOverride || tabDefByKey[eventKey];
            if (!def || !session.id) return;
            setLoadError(null);
            try {
                if (def.thread === "patientLegacy" || def.thread === "patient") {
                    const rows = await chatApi.getMessages(def.patientId, { limit: 80 });
                    const list = Array.isArray(rows) ? rows : [];
                    setMessagesByKey((prev) => ({ ...prev, [eventKey]: list }));
                    await chatApi.markRead(def.patientId).catch(() => {});
                    const conv = await chatApi.getConversations().catch(() => []);
                    const u = {};
                    (Array.isArray(conv) ? conv : []).forEach((c) => {
                        if (c.patientId) u[c.patientId] = c.unreadCount || 0;
                    });
                    setUnreadByPatientId(u);
                } else if (def.thread === "group") {
                    const rows = await chatApi.getMessages({ groupId: def.groupId, limit: 80 });
                    const list = Array.isArray(rows) ? rows : [];
                    setMessagesByKey((prev) => ({ ...prev, [eventKey]: list }));
                    await chatApi.markReadGroup(def.groupId).catch(() => {});
                } else if (def.thread === "patientStaff") {
                    const rows = await chatApi.getMessages({
                        peerRole: def.peerRole,
                        peerId: def.peerId,
                        limit: 80,
                    });
                    const list = Array.isArray(rows) ? rows : [];
                    setMessagesByKey((prev) => ({ ...prev, [eventKey]: list }));
                    await chatApi.markReadPatientStaff(def.peerRole, def.peerId).catch(() => {});
                } else {
                    const rows = await chatApi.getMessages({
                        peerRole: def.peerRole,
                        peerId: def.peerId,
                        limit: 80,
                    });
                    const list = Array.isArray(rows) ? rows : [];
                    setMessagesByKey((prev) => ({ ...prev, [eventKey]: list }));
                    await chatApi.markReadPeer(def.peerRole, def.peerId).catch(() => {});
                }
            } catch (e) {
                setLoadError(e?.message || t("chat.errors.loadMessages"));
                setMessagesByKey((prev) => ({ ...prev, [eventKey]: [] }));
            }
        },
        [tabDefByKey, session.id, t],
    );

    useEffect(() => {
        const pr = searchParams.get("peerRole");
        const pid = searchParams.get("peerId");
        if (!pr || !pid) {
            deepLinkPeerSigRef.current = "";
        }
    }, [searchParams]);

    useEffect(() => {
        const pp = searchParams.get("patientId");
        if (!pp) {
            deepLinkPatientSigRef.current = "";
        }
    }, [searchParams]);

    useEffect(() => {
        const pr = searchParams.get("peerRole");
        const pid = searchParams.get("peerId");
        if (!pr || !pid || !session.id) return;
        const sig = `${pr}:${pid}`;
        if (deepLinkPeerSigRef.current === sig) return;
        const rows = displaySidebarRows.filter((r) => r.type === "item");
        const found = rows.find(
            (r) =>
                r.def?.thread === "peer" &&
                r.def.peerRole === pr &&
                String(r.def.peerId) === String(pid),
        );
        if (found) {
            deepLinkPeerSigRef.current = sig;
            setActiveKey(found.eventKey);
            loadThread(found.eventKey, found.def);
        }
    }, [searchParams, displaySidebarRows, session.id, loadThread]);

    useEffect(() => {
        const pp = searchParams.get("patientId");
        if (!pp || !session.id) return;
        const sig = `patient:${pp}`;
        if (deepLinkPatientSigRef.current === sig) return;
        const rows = displaySidebarRows.filter((r) => r.type === "item");
        const found = rows.find(
            (r) => r.def?.thread === "patient" && String(r.def.patientId) === String(pp),
        );
        if (found) {
            deepLinkPatientSigRef.current = sig;
            setActiveKey(found.eventKey);
            loadThread(found.eventKey, found.def);
        }
    }, [searchParams, displaySidebarRows, session.id, loadThread]);

    useEffect(() => {
        if (!session.id) {
            return;
        }
        let cancelled = false;
        setLoading(true);
        (async () => {
            try {
                const dc = await chatApi.getDepartmentContacts();
                if (cancelled) return;
                setDepartmentContactsCache(dc);
                let groups = [];
                if (session.role === "doctor" || session.role === "nurse" || session.role === "patient") {
                    groups = await chatApi.getGroups().catch(() => []);
                }
                const { rows, departmentLabel: dl } = buildSidebarRows(dc, session, groups, t);
                setDepartmentLabel(dl);
                setSidebarRows(rows);
                const p = loadPinned(session.id);
                const h = new Set(loadHidden(session.id));
                const b = loadBlocked(session.id);
                setPinnedKeys(p);
                setHiddenKeys(h);
                setBlockedKeys(new Set(b));
                const display = sortRowsByPinned(filterHiddenRows(rows, h), p);
                const first = display.find((r) => r.type === "item");
                if (first) {
                    setActiveKey(first.eventKey);
                    await loadThread(first.eventKey, first.def);
                }
            } catch (e) {
                if (!cancelled) setLoadError(e?.message || t("chat.errors.loadContacts"));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
        // loadThread intentionally omitted — stable enough; avoids refetch loop when tabDefByKey updates
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session.id, t]);

    const onSendMessage = async (text) => {
        const def = tabDefByKey[activeKey];
        if (!def || !text.trim()) return;
        setSending(true);
        setLoadError(null);
        try {
            if (def.thread === "patientLegacy" || def.thread === "patient") {
                await chatApi.sendMessage({ patientId: def.patientId, body: text });
            } else if (def.thread === "group") {
                await chatApi.sendMessage({ groupId: def.groupId, body: text });
            } else {
                await chatApi.sendMessage({
                    peerRole: def.peerRole,
                    peerId: def.peerId,
                    body: text,
                });
            }
            window.dispatchEvent(new CustomEvent("medifollow-notifications-refresh"));
            await loadThread(activeKey);
        } catch (e) {
            setLoadError(e?.message || t("chat.errors.sendFailed"));
        } finally {
            setSending(false);
        }
    };

    const onSendVoice = async (blob) => {
        const def = tabDefByKey[activeKey];
        if (!def || !blob || blob.size < 200) return;
        setSending(true);
        setLoadError(null);
        try {
            const fd = new FormData();
            fd.append("file", blob, "voice.webm");
            if (def.thread === "patientLegacy" || def.thread === "patient") {
                fd.append("patientId", def.patientId);
            } else if (def.thread === "group") {
                fd.append("groupId", def.groupId);
            } else {
                fd.append("peerRole", def.peerRole);
                fd.append("peerId", def.peerId);
            }
            await chatApi.sendVoiceMessage(fd);
            window.dispatchEvent(new CustomEvent("medifollow-notifications-refresh"));
            await loadThread(activeKey);
        } catch (e) {
            setLoadError(e?.message || t("chat.errors.voiceSendFailed"));
        } finally {
            setSending(false);
        }
    };

    const onSendMedia = async (file, category, caption) => {
        const def = tabDefByKey[activeKey];
        if (!def || !file) return;
        setSending(true);
        setLoadError(null);
        try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("category", category);
            if (caption) fd.append("caption", caption);
            if (def.thread === "patientLegacy" || def.thread === "patient") {
                fd.append("patientId", def.patientId);
            } else if (def.thread === "group") {
                fd.append("groupId", def.groupId);
            } else {
                fd.append("peerRole", def.peerRole);
                fd.append("peerId", def.peerId);
            }
            await chatApi.sendMediaMessage(fd);
            window.dispatchEvent(new CustomEvent("medifollow-notifications-refresh"));
            await loadThread(activeKey);
        } catch (e) {
            const msg = e?.message || t("chat.errors.mediaSendFailed");
            setLoadError(msg);
            throw e;
        } finally {
            setSending(false);
        }
    };

    const handleSelectTab = (k) => {
        if (!k) return;
        setActiveKey(k);
        loadThread(k);
    };

    const handleTogglePin = useCallback(
        (def) => {
            const k = getThreadKey(def);
            if (!k || !session.id) return;
            setPinnedKeys((prev) => {
                const next = prev.includes(k)
                    ? prev.filter((x) => x !== k)
                    : [k, ...prev.filter((x) => x !== k)];
                savePinned(session.id, next);
                return next;
            });
        },
        [session.id],
    );

    const handleHideThread = useCallback(
        (eventKey, def) => {
            const k = getThreadKey(def);
            if (!k || !session.id) return;
            setHiddenKeys((prev) => {
                const next = new Set(prev);
                next.add(k);
                saveHidden(session.id, [...next]);
                return next;
            });
            setPinnedKeys((prev) => {
                const next = prev.filter((x) => x !== k);
                savePinned(session.id, next);
                return next;
            });
            setMessagesByKey((prev) => {
                const p = { ...prev };
                delete p[eventKey];
                return p;
            });
        },
        [session.id],
    );

    const handleToggleBlock = useCallback(
        (def) => {
            const k = getThreadKey(def);
            if (!k || !session.id) return;
            setBlockedKeys((prev) => {
                const next = new Set(prev);
                if (next.has(k)) next.delete(k);
                else next.add(k);
                saveBlocked(session.id, [...next]);
                return next;
            });
        },
        [session.id],
    );

    const handleRestoreHiddenThreads = useCallback(() => {
        if (!session.id) return;
        saveHidden(session.id, []);
        setHiddenKeys(new Set());
    }, [session.id]);

    const memberOptions = useMemo(() => {
        if (!departmentContactsCache) return [];
        return collectStaffMemberOptions(departmentContactsCache).filter(
            (m) => !(String(m.id) === String(session.id) && m.role === session.role),
        );
    }, [departmentContactsCache, session.id, session.role]);

    const handleOpenCreateGroupModal = () => {
        setNewGroupName("");
        setSelectedMemberKeys(new Set());
        setCreateGroupError("");
        setShowCreateGroupModal(true);
    };

    const handleToggleMemberKey = (k) => {
        setSelectedMemberKeys((prev) => {
            const next = new Set(prev);
            if (next.has(k)) next.delete(k);
            else next.add(k);
            return next;
        });
    };

    const handleSubmitCreateGroup = async () => {
        setCreateGroupError("");
        const name = newGroupName.trim();
        if (!name) {
            setCreateGroupError(t("chat.errors.groupNameRequired"));
            return;
        }
        if (selectedMemberKeys.size < 1) {
            setCreateGroupError(t("chat.errors.groupMembersRequired"));
            return;
        }
        const members = [{ role: session.role, id: session.id }];
        for (const k of selectedMemberKeys) {
            const i = k.indexOf(":");
            if (i < 1) continue;
            const roleStr = k.slice(0, i);
            const id = k.slice(i + 1);
            if (roleStr === "patient") members.push({ role: "patient", id });
            else if (roleStr === "nurse") members.push({ role: "nurse", id });
            else members.push({ role: "doctor", id });
        }
        if (members.length < 2) {
            setCreateGroupError(t("chat.errors.groupMinMembers"));
            return;
        }
        setCreatingGroup(true);
        try {
            await chatApi.createGroup({ name, members });
            setShowCreateGroupModal(false);
            const dc = await chatApi.getDepartmentContacts();
            setDepartmentContactsCache(dc);
            const groups = await chatApi.getGroups().catch(() => []);
            const { rows, departmentLabel: dl } = buildSidebarRows(dc, session, groups, t);
            setDepartmentLabel(dl);
            setSidebarRows(rows);
        } catch (e) {
            setCreateGroupError(e?.message || t("chat.errors.groupCreateFailed"));
        } finally {
            setCreatingGroup(false);
        }
    };

    useEffect(() => {
        const items =
            session.role === "doctor" || session.role === "nurse" ? visibleSidebarItems : itemsOnlyAll;
        if (items.length === 0) return;
        const valid = new Set(items.map((i) => i.eventKey));
        if (!valid.has(activeKey)) {
            const first = items[0];
            setActiveKey(first.eventKey);
            loadThread(first.eventKey, first.def);
        }
    }, [session.role, visibleSidebarItems, itemsOnlyAll, activeKey, loadThread]);

    if (!session.id) {
        const userData = STATIC_USER_DATA;
        return (
            <>
                <Row className="cust-chat">
                    <Tab.Container defaultActiveKey={"chatbox1"}>
                        <Col lg={3} className={`chat-data-left scroller ${sidebar && "show"}`}>
                            <div className="chat-sidebar-channel scroller ps-3 ">
                                <div className="d-flex align-items-center justify-content-between pt-5 pt-lg-0 pb-3 pb-lg-0">
                                    <h5 className="ms-3 mb-0 mb-lg-2">{t("chat.demo.publicChannels")}</h5>
                                    <div className="sidebar-toggle bg-primary-subtle">
                                        <i
                                            className="ri-close-fill"
                                            style={{ fontSize: "1.6rem" }}
                                            onClick={() => {
                                                SidebarToggle();
                                            }}
                                        ></i>
                                    </div>
                                </div>
                                <ul className="iq-chat-ui nav flex-column nav-pills" role="tablist">
                                    <Nav.Item as="li">
                                        <Nav.Link as="a" className="d-none" data-bs-toggle="pill" eventKey="default-block" aria-selected="false" role="tab" tabIndex="-1">
                                            <div className="d-flex align-items-center" onClick={() => SidebarToggle()}>
                                                <div className="avatar me-3">
                                                    <img src={user05} alt="chatuserimage" className="avatar-50 rounded" />
                                                    <span className="avatar-status">
                                                        <i className="ri-checkbox-blank-circle-fill text-success"></i>
                                                    </span>
                                                </div>
                                                <div className="chat-sidebar-name">
                                                    <h6 className="mb-0">{t("chat.demo.teamDiscussions")}</h6>
                                                    <span>{t("chat.demo.loremPreview")}</span>
                                                </div>
                                                <div className="chat-meta float-end text-center mt-2">
                                                    <div className="chat-msg-counter bg-primary text-white">20</div>
                                                    <span className="text-nowrap">05 min</span>
                                                </div>
                                            </div>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item as="li">
                                        <Nav.Link as="a" eventKey="chatbox1">
                                            <div className="d-flex align-items-center cursor-pointer" onClick={() => SidebarToggle()}>
                                                <div className="avatar me-3">
                                                    <img src={user05} alt="chatuserimage" className="avatar-50 rounded" />
                                                    <span className="avatar-status">
                                                        <i className="ri-checkbox-blank-circle-fill text-success"></i>
                                                    </span>
                                                </div>
                                                <div className="chat-sidebar-name">
                                                    <h6 className="mb-0">{t("chat.demo.teamDiscussions")}</h6>
                                                    <span>{t("chat.demo.loremPreview")}</span>
                                                </div>
                                                <div className="chat-meta float-end text-center mt-2">
                                                    <div className="chat-msg-counter bg-primary text-white">20</div>
                                                    <span className="text-nowrap">05 min</span>
                                                </div>
                                            </div>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item as="li">
                                        <Nav.Link as="a" eventKey="chatbox2">
                                            <div className="d-flex align-items-center cursor-pointer" onClick={() => SidebarToggle()}>
                                                <div className="avatar me-3">
                                                    <img src={user06} alt="chatuserimage" className="avatar-50 rounded" />
                                                    <span className="avatar-status">
                                                        <i className="ri-checkbox-blank-circle-fill text-success"></i>
                                                    </span>
                                                </div>
                                                <div className="chat-sidebar-name">
                                                    <h6 className="mb-0">{t("chat.demo.announcement")}</h6>
                                                    <span>{t("chat.demo.thisSunday")}</span>
                                                </div>
                                                <div className="chat-meta float-end text-center mt-2">
                                                    <div className="chat-msg-counter bg-primary text-white">10</div>
                                                    <span className="text-nowrap">10 min</span>
                                                </div>
                                            </div>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item as="li">
                                        <h5 className="mt-3 ms-3">{t("chat.demo.privateChannels")}</h5>
                                        <Nav.Link as="a" eventKey="chatbox3">
                                            <div className="d-flex align-items-center cursor-pointer" onClick={() => SidebarToggle()}>
                                                <div className="avatar me-3">
                                                    <img src={user07} alt="chatuserimage" className="avatar-50 rounded" />
                                                    <span className="avatar-status">
                                                        <i className="ri-checkbox-blank-circle-fill text-warning"></i>
                                                    </span>
                                                </div>
                                                <div className="chat-sidebar-name">
                                                    <h6 className="mb-0">{t("chat.demo.doctors")}</h6>
                                                    <span>{t("chat.demo.thereAreMany")} </span>
                                                </div>
                                            </div>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item as="li">
                                        <Nav.Link as="a" eventKey="chatbox4">
                                            <div className="d-flex align-items-center cursor-pointer" onClick={() => SidebarToggle()}>
                                                <div className="avatar me-3">
                                                    <img src={user08} alt="chatuserimage" className="avatar-50 rounded" />
                                                    <span className="avatar-status">
                                                        <i className="ri-checkbox-blank-circle-fill text-success"></i>
                                                    </span>
                                                </div>
                                                <div className="chat-sidebar-name">
                                                    <h6 className="mb-0">{t("chat.demo.nurses")}</h6>
                                                    <span>{t("chat.demo.passagesOfLorem")}</span>
                                                </div>
                                            </div>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item as="li">
                                        <Nav.Link as="a" eventKey="chatbox5">
                                            <div className="d-flex align-items-center cursor-pointer" onClick={() => SidebarToggle()}>
                                                <div className="avatar me-3">
                                                    <img src={user09} alt="chatuserimage" className="avatar-50 rounded" />
                                                    <span className="avatar-status">
                                                        <i className="ri-checkbox-blank-circle-fill text-info"></i>
                                                    </span>
                                                </div>
                                                <div className="chat-sidebar-name">
                                                    <h6 className="mb-0">{t("chat.demo.otSpecial")}</h6>
                                                    <span>{t("chat.demo.loremUsed")}</span>
                                                </div>
                                            </div>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item as="li">
                                        <h5 className="mt-3 ms-3">{t("chat.demo.directMessage")}</h5>
                                        <Nav.Link as="a" eventKey="chatbox6" aria-selected="false" tabIndex="-1" role="tab">
                                            <div className="d-flex align-items-center cursor-pointer" onClick={() => SidebarToggle()}>
                                                <div className="avatar me-3">
                                                    <img src={user10} alt="chatuserimage" className="avatar-50 rounded" />
                                                    <span className="avatar-status">
                                                        <i className="ri-checkbox-blank-circle-fill text-dark"></i>
                                                    </span>
                                                </div>
                                                <div className="chat-sidebar-name">
                                                    <h6 className="mb-0">Paul Molive</h6>
                                                    <span>{t("chat.demo.translationBy")}</span>
                                                </div>
                                            </div>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item as="li">
                                        <Nav.Link as="a" eventKey="chatbox7">
                                            <div className="d-flex align-items-center cursor-pointer" onClick={() => SidebarToggle()}>
                                                <div className="avatar me-3">
                                                    <img src={user05} alt="chatuserimage" className="avatar-50 rounded" />
                                                    <span className="avatar-status">
                                                        <i className="ri-checkbox-blank-circle-fill text-success"></i>
                                                    </span>
                                                </div>
                                                <div className="chat-sidebar-name">
                                                    <h6 className="mb-0">Paige Turner</h6>
                                                    <span>{t("chat.demo.loremWhich")}</span>
                                                </div>
                                            </div>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item as="li">
                                        <Nav.Link as="a" eventKey="chatbox8">
                                            <div className="d-flex align-items-center cursor-pointer" onClick={() => SidebarToggle()}>
                                                <div className="avatar me-3">
                                                    <img src={user06} alt="chatuserimage" className="avatar-50 rounded" />
                                                    <span className="avatar-status">
                                                        <i className="ri-checkbox-blank-circle-fill text-primary"></i>
                                                    </span>
                                                </div>
                                                <div className="chat-sidebar-name">
                                                    <h6 className="mb-0">Barb Ackue</h6>
                                                    <span>{t("chat.demo.simplyRandom")}</span>
                                                </div>
                                            </div>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item as="li">
                                        <Nav.Link as="a" data-bs-toggle="pill" eventKey="chatbox9">
                                            <div className="d-flex align-items-center cursor-pointer" onClick={() => SidebarToggle()}>
                                                <div className="avatar me-3">
                                                    <img src={user07} alt="chatuserimage" className="avatar-50 rounded" />
                                                    <span className="avatar-status">
                                                        <i className="ri-checkbox-blank-circle-fill text-danger"></i>
                                                    </span>
                                                </div>
                                                <div className="chat-sidebar-name">
                                                    <h6 className="mb-0">Maya Didas</h6>
                                                    <span> {t("chat.demo.butLeap")}</span>
                                                </div>
                                            </div>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item as="li">
                                        <Nav.Link as="a" data-bs-toggle="pill" eventKey="chatbox10">
                                            <div className="d-flex align-items-center cursor-pointer" onClick={() => SidebarToggle()}>
                                                <div className="avatar me-3">
                                                    <img src={user08} alt="chatuserimage" className="avatar-50 rounded" />
                                                    <span className="avatar-status">
                                                        <i className="ri-checkbox-blank-circle-fill text-warning"></i>
                                                    </span>
                                                </div>
                                                <div className="chat-sidebar-name">
                                                    <h6 className="mb-0">Monty Carlo</h6>
                                                    <span>{t("chat.demo.contraryPopular")}</span>
                                                </div>
                                            </div>
                                        </Nav.Link>
                                    </Nav.Item>
                                </ul>
                            </div>
                        </Col>
                        <div className="col-lg-9">
                            <div className="chat-data chat-data-right">
                                <Tab.Content>
                                    <Tab.Pane className="fade" eventKey="default-block">
                                        <div className="chat-start">
                                            <span className="iq-start-icon text-primary">
                                                <i className="ri-message-3-line"></i>
                                            </span>
                                            <button id="chat-start" className="btn bg-primary mt-3">
                                                {t("chat.demo.startConversation")}
                                            </button>
                                        </div>
                                    </Tab.Pane>
                                    {userData.map((user, index) => (
                                        <Tab.Pane key={index} className="fade" eventKey={`chatbox${index + 1}`}>
                                            <ChatData data={user} SidebarToggle={SidebarToggle}></ChatData>
                                        </Tab.Pane>
                                    ))}
                                </Tab.Content>
                            </div>
                        </div>
                    </Tab.Container>
                </Row>
            </>
        );
    }

    const staffSearchActive =
        (session.role === "doctor" || session.role === "nurse") && sidebarSearchQuery.trim().length > 0;

    return (
        <>
            <VoiceCallLayer
                ref={voiceCallRef}
                session={session}
                peerContext={voicePeerContext}
                onAfterCallLogged={() => loadThread(activeKey)}
            />
            {loadError && (
                <div className="alert alert-warning py-2 small mb-2" role="alert">
                    {loadError}
                </div>
            )}
            <Row className="cust-chat">
                <Tab.Container activeKey={activeKey} onSelect={handleSelectTab}>
                    <Col lg={3} className={`chat-data-left scroller ${sidebar && "show"}`}>
                        <div className="chat-sidebar-channel scroller ps-3 ">
                            <div className="d-flex align-items-center justify-content-between pt-5 pt-lg-0 pb-3 pb-lg-0">
                                <div>
                                    <h5 className="ms-3 mb-0 mb-lg-2">{t("chat.sidebar.teamSameService")}</h5>
                                    <p className="ms-3 mb-0 small text-muted">{departmentLabel}</p>
                                </div>
                                <div className="sidebar-toggle bg-primary-subtle">
                                    <i
                                        className="ri-close-fill"
                                        style={{ fontSize: "1.6rem" }}
                                        onClick={() => {
                                            SidebarToggle();
                                        }}
                                    ></i>
                                </div>
                            </div>
                            {(session.role === "doctor" || session.role === "nurse") && (
                                <div className="form-group input-group mb-0 search-input chat-sidebar-search px-3 pb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={t("chat.sidebar.searchPlaceholder")}
                                        value={sidebarSearchQuery}
                                        onChange={(e) => setSidebarSearchQuery(e.target.value)}
                                        aria-label={t("chat.sidebar.searchAriaLabel")}
                                    />{" "}
                                    <span className="input-group-text">
                                        <svg
                                            className="icon-20 text-primary"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            aria-hidden
                                        >
                                            <circle
                                                cx="11.7669"
                                                cy="11.7666"
                                                r="8.98856"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M18.0186 18.4851L21.5426 22"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </span>
                                </div>
                            )}
                            {(session.role === "doctor" || session.role === "nurse") && (
                                <div className="px-3 pb-3">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="w-100"
                                        type="button"
                                        onClick={handleOpenCreateGroupModal}
                                    >
                                        <i className="ri-group-line me-1" aria-hidden />
                                        {t("chat.sidebar.createGroup")}
                                    </Button>
                                </div>
                            )}
                            {loading ? (
                                <div className="p-4 text-center">
                                    <Spinner animation="border" size="sm" />
                                </div>
                            ) : itemsOnlyAll.length === 0 && hasAnyThreadInSidebar && hiddenKeys.size > 0 ? (
                                <div className="p-3 small">
                                    <p className="text-muted mb-2">{t("chat.sidebar.allHidden")}</p>
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={handleRestoreHiddenThreads}
                                    >
                                        <i className="ri-arrow-go-back-line me-1" aria-hidden />
                                        {t("chat.sidebar.restoreHidden")}
                                    </button>
                                </div>
                            ) : itemsOnlyAll.length === 0 ? (
                                <div className="p-3 small text-muted">{t("chat.sidebar.noContacts")}</div>
                            ) : staffSearchActive && visibleSidebarItems.length === 0 ? (
                                <div className="p-3 small text-muted">
                                    {t("chat.sidebar.noSearchResults", { query: sidebarSearchQuery.trim() })}
                                </div>
                            ) : (
                                <>
                                <ul className="iq-chat-ui nav flex-column nav-pills" role="tablist">
                                    <Nav.Item as="li">
                                        <Nav.Link as="a" className="d-none" data-bs-toggle="pill" eventKey="default-block" aria-selected="false" role="tab" tabIndex="-1">
                                            <div className="d-flex align-items-center" onClick={() => SidebarToggle()}>
                                                <div className="avatar me-3">
                                                    <img src={user05} alt="" className="avatar-50 rounded" />
                                                </div>
                                                <div className="chat-sidebar-name">
                                                    <h6 className="mb-0">—</h6>
                                                    <span>—</span>
                                                </div>
                                            </div>
                                        </Nav.Link>
                                    </Nav.Item>
                                    {displaySidebarRowsForList.map((r, idx) => {
                                        if (r.type === "section") {
                                            return (
                                                <Nav.Item as="li" key={`sec-${idx}`}>
                                                    <h5 className="mt-3 ms-3">{r.title}</h5>
                                                </Nav.Item>
                                            );
                                        }
                                        const def = r.def;
                                        const tKey = getThreadKey(def);
                                        const isPinned = tKey && pinnedKeys.includes(tKey);
                                        const unread =
                                            (def.thread === "patientLegacy" || def.thread === "patient") &&
                                            def.patientId
                                                ? unreadByPatientId[def.patientId] || 0
                                                : 0;
                                        return (
                                            <Nav.Item as="li" key={r.eventKey}>
                                                <Nav.Link eventKey={r.eventKey}>
                                                    <div className="d-flex align-items-center cursor-pointer" onClick={() => SidebarToggle()}>
                                                        <div className="avatar me-3">
                                                            <img src={def.data.userimg} alt="" className="avatar-50 rounded" />
                                                            <span className="avatar-status">
                                                                <i className="ri-checkbox-blank-circle-fill text-success"></i>
                                                            </span>
                                                        </div>
                                                        <div className="chat-sidebar-name">
                                                            <h6 className="mb-0 d-flex align-items-center gap-1">
                                                                {isPinned && (
                                                                    <i className="ri-pushpin-fill text-primary" style={{ fontSize: "0.85rem" }} title={t("chat.sidebar.pinTitle")} aria-hidden />
                                                                )}
                                                                <span>{def.title}</span>
                                                            </h6>
                                                            <span className="small text-truncate d-block" style={{ maxWidth: 140 }}>
                                                                {def.subtitle}
                                                            </span>
                                                        </div>
                                                        {unread > 0 && (
                                                            <div className="chat-meta float-end text-center mt-2">
                                                                <div className="chat-msg-counter bg-primary text-white">{unread}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </Nav.Link>
                                            </Nav.Item>
                                        );
                                    })}
                                </ul>
                                {hiddenKeys.size > 0 ? (
                                    <div className="chat-restore-hidden px-3 pb-3 pt-2 mt-1 border-top border-secondary-subtle">
                                        <button
                                            type="button"
                                            className="btn btn-link btn-sm text-decoration-none p-0 d-inline-flex align-items-center gap-1 text-body-secondary"
                                            onClick={handleRestoreHiddenThreads}
                                        >
                                            <i className="ri-arrow-go-back-line" aria-hidden />
                                            <span>
                                                {t("chat.sidebar.restoreHidden")}
                                                <span className="text-muted"> ({hiddenKeys.size})</span>
                                            </span>
                                        </button>
                                    </div>
                                ) : null}
                                </>
                            )}
                        </div>
                    </Col>
                    <div className="col-lg-9">
                        <div className="chat-data chat-data-right">
                            <Tab.Content>
                                <Tab.Pane className="fade" eventKey="default-block">
                                    <div className="chat-start">
                                        <span className="iq-start-icon text-primary">
                                            <i className="ri-message-3-line"></i>
                                        </span>
                                        <button type="button" className="btn bg-primary mt-3">
                                            {t("chat.demo.startConversation")}
                                        </button>
                                    </div>
                                </Tab.Pane>
                                {itemsOnlyAll.map((r) => {
                                    const tk = getThreadKey(r.def);
                                    const blocked = tk ? blockedKeys.has(tk) : false;
                                    const pinned = tk ? pinnedKeys.includes(tk) : false;
                                    return (
                                        <Tab.Pane key={r.eventKey} className="fade" eventKey={r.eventKey}>
                                            <ChatData
                                                data={r.def.data}
                                                SidebarToggle={SidebarToggle}
                                                liveMessages={
                                                    activeKey === r.eventKey
                                                        ? messagesByKey[r.eventKey] ?? []
                                                        : undefined
                                                }
                                                onSendMessage={activeKey === r.eventKey ? onSendMessage : undefined}
                                                onSendVoice={activeKey === r.eventKey ? onSendVoice : undefined}
                                                onSendMedia={activeKey === r.eventKey ? onSendMedia : undefined}
                                                sending={activeKey === r.eventKey ? sending : false}
                                                session={session}
                                                voiceCallEnabled={activeKey === r.eventKey && !!voicePeerContext}
                                                onVoiceCall={
                                                    activeKey === r.eventKey && voicePeerContext
                                                        ? () => voiceCallRef.current?.startOutgoing()
                                                        : undefined
                                                }
                                                onVideoCall={
                                                    activeKey === r.eventKey && voicePeerContext
                                                        ? () => voiceCallRef.current?.startVideoCall?.()
                                                        : undefined
                                                }
                                                threadPinned={pinned}
                                                threadBlocked={blocked}
                                                onThreadTogglePin={() => handleTogglePin(r.def)}
                                                onThreadHide={() => handleHideThread(r.eventKey, r.def)}
                                                onThreadToggleBlock={() => handleToggleBlock(r.def)}
                                            />
                                        </Tab.Pane>
                                    );
                                })}
                            </Tab.Content>
                        </div>
                    </div>
                </Tab.Container>
            </Row>
            <Modal
                show={showCreateGroupModal}
                onHide={() => {
                    if (!creatingGroup) setShowCreateGroupModal(false);
                }}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>{t("chat.modalGroup.title")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {createGroupError ? (
                        <div className="alert alert-danger py-2 small" role="alert">
                            {createGroupError}
                        </div>
                    ) : null}
                    <Form.Group className="mb-3">
                        <Form.Label>{t("chat.modalGroup.groupName")}</Form.Label>
                        <Form.Control
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder={t("chat.modalGroup.placeholder")}
                            maxLength={120}
                        />
                    </Form.Group>
                    <Form.Label>
                        {t("chat.modalGroup.membersLabel")}
                    </Form.Label>
                    <div className="border rounded p-2" style={{ maxHeight: 220, overflowY: "auto" }}>
                        {memberOptions.length === 0 ? (
                            <span className="text-muted small">{t("chat.modalGroup.loadingContacts")}</span>
                        ) : (
                            memberOptions.map((m) => {
                                const k = `${m.role}:${m.id}`;
                                return (
                                    <Form.Check
                                        key={k}
                                        type="checkbox"
                                        id={`mg-${k.replace(/[^a-zA-Z0-9_-]/g, "_")}`}
                                        label={`${m.label} (${m.role === "doctor" ? t("chat.roles.doctor") : m.role === "nurse" ? t("chat.roles.nurse") : t("chat.roles.patient")})`}
                                        checked={selectedMemberKeys.has(k)}
                                        onChange={() => handleToggleMemberKey(k)}
                                        className="mb-1"
                                    />
                                );
                            })
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        type="button"
                        onClick={() => setShowCreateGroupModal(false)}
                        disabled={creatingGroup}
                    >
                        {t("chat.modalGroup.cancel")}
                    </Button>
                    <Button variant="primary" type="button" onClick={handleSubmitCreateGroup} disabled={creatingGroup}>
                        {creatingGroup ? t("chat.modalGroup.creating") : t("chat.modalGroup.create")}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default Chat;

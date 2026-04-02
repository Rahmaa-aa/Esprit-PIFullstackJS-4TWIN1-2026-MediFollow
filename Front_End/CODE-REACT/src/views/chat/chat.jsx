import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Col, Nav, Row, Tab, Spinner } from "react-bootstrap";
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

/** Construit les onglets + sections (même département / patients) pour le template */
function buildSidebarRows(dc, session) {
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
        pushSection("Mon suivi");
        pushItem({
            thread: "patientLegacy",
            patientId: selfId,
            title: "Mon fil patient",
            subtitle: "Équipe soignante",
            data: {
                title: "Mon fil patient",
                userimg: imgUrl(dc.patientSelf.profileImage),
                userdetailname: dc.patientSelf.displayName || "Patient",
                useraddress: departmentLabel,
                usersortname: (dc.patientSelf.displayName || "").split(" ")[0] || "—",
                usertelnumber: "—",
                userdob: "—",
                usergender: "—",
                userlanguage: "—",
            },
        });

        if (dc.assignedDoctor) {
            pushSection("Référents");
            const d = dc.assignedDoctor;
            pushItem({
                thread: "patientStaff",
                patientId: selfId,
                peerRole: "doctor",
                peerId: d.id,
                title: `Dr. ${d.displayName}`,
                subtitle: d.subtitle || "Médecin référent",
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
            if (!dc.assignedDoctor) pushSection("Référents");
            const n = dc.assignedNurse;
            pushItem({
                thread: "patientStaff",
                patientId: selfId,
                peerRole: "nurse",
                peerId: n.id,
                title: `IDE ${n.displayName}`,
                subtitle: n.subtitle || "Infirmier(ère) référent(e)",
                data: {
                    title: `IDE ${n.displayName}`,
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

        const adId = dc.assignedDoctor?.id;
        const anId = dc.assignedNurse?.id;
        pushSection("Médecins — même service");
        for (const d of dc.doctors || []) {
            if (adId && d.id === adId) continue;
            pushItem({
                thread: "patientStaff",
                patientId: selfId,
                peerRole: "doctor",
                peerId: d.id,
                title: d.displayName,
                subtitle: d.subtitle || "Médecin",
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
        pushSection("Infirmiers — même service");
        for (const n of dc.nurses || []) {
            if (anId && n.id === anId) continue;
            pushItem({
                thread: "patientStaff",
                patientId: selfId,
                peerRole: "nurse",
                peerId: n.id,
                title: n.displayName,
                subtitle: n.subtitle || "Infirmier(ère)",
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
            pushSection(session.role === "doctor" ? "Mes patients" : "Patients suivis");
            for (const p of plist) {
                pushItem({
                    thread: "patient",
                    patientId: p.id,
                    title: p.displayName,
                    subtitle: p.subtitle || "Patient",
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
        pushSection("Médecins — même service");
        for (const d of dc.doctors || []) {
            pushItem({
                thread: "peer",
                peerRole: "doctor",
                peerId: d.id,
                title: d.displayName,
                subtitle: d.subtitle || "Médecin",
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
        pushSection("Infirmiers — même service");
        for (const n of dc.nurses || []) {
            pushItem({
                thread: "peer",
                peerRole: "nurse",
                peerId: n.id,
                title: n.displayName,
                subtitle: n.subtitle || "Infirmier(ère)",
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
    const session = useMemo(() => getSession(), []);
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
                setLoadError(e?.message || "Chargement impossible");
                setMessagesByKey((prev) => ({ ...prev, [eventKey]: [] }));
            }
        },
        [tabDefByKey, session.id],
    );

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
                const { rows, departmentLabel: dl } = buildSidebarRows(dc, session);
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
                if (!cancelled) setLoadError(e?.message || "Erreur");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- init contacts une fois par session
    }, [session.id]);

    const onSendMessage = async (text) => {
        const def = tabDefByKey[activeKey];
        if (!def || !text.trim()) return;
        setSending(true);
        setLoadError(null);
        try {
            if (def.thread === "patientLegacy" || def.thread === "patient") {
                await chatApi.sendMessage({ patientId: def.patientId, body: text });
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
            setLoadError(e?.message || "Envoi impossible");
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
            } else {
                fd.append("peerRole", def.peerRole);
                fd.append("peerId", def.peerId);
            }
            await chatApi.sendVoiceMessage(fd);
            window.dispatchEvent(new CustomEvent("medifollow-notifications-refresh"));
            await loadThread(activeKey);
        } catch (e) {
            setLoadError(e?.message || "Envoi vocal impossible");
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
            } else {
                fd.append("peerRole", def.peerRole);
                fd.append("peerId", def.peerId);
            }
            await chatApi.sendMediaMessage(fd);
            window.dispatchEvent(new CustomEvent("medifollow-notifications-refresh"));
            await loadThread(activeKey);
        } catch (e) {
            const msg = e?.message || "Envoi du fichier impossible";
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

    useEffect(() => {
        const items = displaySidebarRows.filter((r) => r.type === "item");
        if (items.length === 0) return;
        const valid = new Set(items.map((i) => i.eventKey));
        if (!valid.has(activeKey)) {
            const first = items[0];
            setActiveKey(first.eventKey);
            loadThread(first.eventKey, first.def);
        }
    }, [displaySidebarRows, activeKey, loadThread]);

    if (!session.id) {
        const userData = STATIC_USER_DATA;
        return (
            <>
                <Row className="cust-chat">
                    <Tab.Container defaultActiveKey={"chatbox1"}>
                        <Col lg={3} className={`chat-data-left scroller ${sidebar && "show"}`}>
                            <div className="chat-sidebar-channel scroller ps-3 ">
                                <div className="d-flex align-items-center justify-content-between pt-5 pt-lg-0 pb-3 pb-lg-0">
                                    <h5 className="ms-3 mb-0 mb-lg-2">Public Channels</h5>
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
                                                    <h6 className="mb-0">Team Discussions</h6>
                                                    <span>Lorem Ipsum is</span>
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
                                                    <h6 className="mb-0">Team Discussions</h6>
                                                    <span>Lorem Ipsum is</span>
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
                                                    <h6 className="mb-0">Announcement</h6>
                                                    <span>This Sunday we</span>
                                                </div>
                                                <div className="chat-meta float-end text-center mt-2">
                                                    <div className="chat-msg-counter bg-primary text-white">10</div>
                                                    <span className="text-nowrap">10 min</span>
                                                </div>
                                            </div>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item as="li">
                                        <h5 className="mt-3 ms-3">Private Channels</h5>
                                        <Nav.Link as="a" eventKey="chatbox3">
                                            <div className="d-flex align-items-center cursor-pointer" onClick={() => SidebarToggle()}>
                                                <div className="avatar me-3">
                                                    <img src={user07} alt="chatuserimage" className="avatar-50 rounded" />
                                                    <span className="avatar-status">
                                                        <i className="ri-checkbox-blank-circle-fill text-warning"></i>
                                                    </span>
                                                </div>
                                                <div className="chat-sidebar-name">
                                                    <h6 className="mb-0">Doctors</h6>
                                                    <span>There are many </span>
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
                                                    <h6 className="mb-0">Nurses</h6>
                                                    <span>passages of Lorem</span>
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
                                                    <h6 className="mb-0">OT Special</h6>
                                                    <span>Lorem Ipsum used</span>
                                                </div>
                                            </div>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item as="li">
                                        <h5 className="mt-3 ms-3">Direct Message</h5>
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
                                                    <span>translation by</span>
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
                                                    <span>Lorem Ipsum which</span>
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
                                                    <span>simply random text</span>
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
                                                    <span> but also the leap</span>
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
                                                    <span>Contrary to popular</span>
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
                                                Start Conversation!
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

    const itemsOnly = displaySidebarRows.filter((r) => r.type === "item");

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
                                    <h5 className="ms-3 mb-0 mb-lg-2">Équipe — même service</h5>
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
                            {loading ? (
                                <div className="p-4 text-center">
                                    <Spinner animation="border" size="sm" />
                                </div>
                            ) : itemsOnly.length === 0 && hasAnyThreadInSidebar && hiddenKeys.size > 0 ? (
                                <div className="p-3 small">
                                    <p className="text-muted mb-2">Toutes les conversations sont masquées.</p>
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={handleRestoreHiddenThreads}
                                    >
                                        <i className="ri-arrow-go-back-line me-1" aria-hidden />
                                        Restaurer les conversations masquées
                                    </button>
                                </div>
                            ) : itemsOnly.length === 0 ? (
                                <div className="p-3 small text-muted">Aucun contact (vérifiez le département ou l&apos;affectation).</div>
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
                                    {displaySidebarRows.map((r, idx) => {
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
                                                                    <i className="ri-pushpin-fill text-primary" style={{ fontSize: "0.85rem" }} title="Épinglé" aria-hidden />
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
                                                Restaurer les conversations masquées
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
                                            Start Conversation!
                                        </button>
                                    </div>
                                </Tab.Pane>
                                {itemsOnly.map((r) => {
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
        </>
    );
};

export default Chat;

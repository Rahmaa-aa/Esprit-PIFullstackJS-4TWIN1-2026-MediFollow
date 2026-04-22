import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Form, Modal, Row } from "react-bootstrap";
import EmojiPicker from "emoji-picker-react";


import user01 from "/assets/images/user/1.jpg"

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api\/?$/, "");

function resolveMediaUrl(path) {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

function formatMsgTime(iso, lang) {
    if (!iso) return "";
    const loc = !lang || lang.startsWith("fr") ? "fr-FR" : lang.startsWith("ar") ? "ar" : "en-US";
    try {
        return new Intl.DateTimeFormat(loc, {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(iso));
    } catch {
        return "";
    }
}

/** Métadonnées d’appel enregistrées en JSON dans body (kind peut manquer côté API / anciennes lignes). */
function parseCallLogBody(body) {
    if (body == null || typeof body !== "string") return null;
    const t = body.trim();
    if (!t.startsWith("{")) return null;
    try {
        const j = JSON.parse(t);
        if (
            j &&
            typeof j === "object" &&
            ["ended", "declined", "missed", "cancelled"].includes(String(j.outcome || ""))
        ) {
            return j;
        }
    } catch {
        /* ignore */
    }
    return null;
}

const ChatData = (props) => {
    const { t, i18n } = useTranslation();

    const { SidebarToggle } = props
    const { title, userimg, userdetailname, useraddress, usersortname, usertelnumber, userdob, usergender, userlanguage } = props.data

    const liveMessages = props.liveMessages;
    const onSendMessage = props.onSendMessage;
    const onSendVoice = props.onSendVoice;
    const onSendMedia = props.onSendMedia;
    const sending = props.sending;
    const session = props.session || { id: "", role: "" };
    const voiceCallEnabled = props.voiceCallEnabled;
    const onVoiceCall = props.onVoiceCall;
    const onVideoCall = props.onVideoCall;

    const threadPinned = props.threadPinned ?? false;
    const threadBlocked = props.threadBlocked ?? false;
    const onThreadTogglePin = props.onThreadTogglePin;
    const onThreadHide = props.onThreadHide;
    const onThreadToggleBlock = props.onThreadToggleBlock;
    const hasThreadActions = !!(onThreadTogglePin || onThreadHide || onThreadToggleBlock);
    const inputLocked = threadBlocked;

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [confirmModal, setConfirmModal] = useState(null);
    const [show, setShow] = useState(false)
    const [draft, setDraft] = useState("");
    const [recording, setRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const cameraVideoRef = useRef(null);
    const cameraStreamRef = useRef(null);
    const docInputRef = useRef(null);
    const emojiPickerWrapperRef = useRef(null);
    const [cameraModalOpen, setCameraModalOpen] = useState(false);

    const stopCameraStream = () => {
        const stream = cameraStreamRef.current;
        if (stream) {
            stream.getTracks().forEach((t) => t.stop());
            cameraStreamRef.current = null;
        }
        const v = cameraVideoRef.current;
        if (v) {
            v.srcObject = null;
        }
    };

    useEffect(() => {
        return () => {
            stopCameraStream();
            const mr = mediaRecorderRef.current;
            if (mr && mr.state !== "inactive") {
                try {
                    mr.stop();
                } catch {
                    /* ignore */
                }
            }
        };
    }, []);

    useEffect(() => {
        if (!cameraModalOpen) return;
        const v = cameraVideoRef.current;
        const s = cameraStreamRef.current;
        if (v && s) {
            v.srcObject = s;
            v.play().catch(() => {});
        }
    }, [cameraModalOpen]);

    /** Fermer le sélecteur d’emojis au clic en dehors. */
    useEffect(() => {
        if (!showEmojiPicker) return;
        const onPointerDown = (e) => {
            const el = emojiPickerWrapperRef.current;
            if (el && !el.contains(e.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("touchstart", onPointerDown, { passive: true });
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("touchstart", onPointerDown);
        };
    }, [showEmojiPicker]);

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const onEmojiSelect = (emojiData) => {
        if (emojiData?.emoji) {
            setDraft((prev) => prev + emojiData.emoji);
        }
        setShowEmojiPicker(false);
    };

    const handleMediaFile = async (e, category) => {
        const input = e.target;
        const f = input.files?.[0];
        input.value = "";
        if (!f || !onSendMedia || sending || recording || inputLocked) return;
        try {
            await onSendMedia(f, category, draft.trim());
            setDraft("");
        } catch {
            /* parent affiche loadError */
        }
    };

    const closeCameraModal = () => {
        setCameraModalOpen(false);
        stopCameraStream();
    };

    const openCameraCapture = async () => {
        if (!onSendMedia || sending || recording || inputLocked) return;
        stopCameraStream();
        try {
            let stream = null;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: { ideal: "environment" },
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                    },
                    audio: false,
                });
            } catch {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            }
            cameraStreamRef.current = stream;
            setCameraModalOpen(true);
        } catch (err) {
            console.error(err);
            alert(t("chat.data.alertCamera"));
        }
    };

    const captureCameraPhoto = () => {
        const v = cameraVideoRef.current;
        if (!v || !onSendMedia || sending || recording || inputLocked) return;
        const w = v.videoWidth;
        const h = v.videoHeight;
        if (!w || !h) {
            alert(t("chat.data.alertCameraNotReady"));
            return;
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(v, 0, 0, w, h);
        canvas.toBlob(
            async (blob) => {
                if (!blob) return;
                const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });
                stopCameraStream();
                setCameraModalOpen(false);
                try {
                    await onSendMedia(file, "image", draft.trim());
                    setDraft("");
                } catch {
                    /* parent affiche loadError */
                }
            },
            "image/jpeg",
            0.92
        );
    };

    const isLive = Array.isArray(liveMessages);

    const runConfirm = () => {
        if (confirmModal === "remove") onThreadHide?.();
        else if (confirmModal === "block") onThreadToggleBlock?.();
        setConfirmModal(null);
    };

    /** Suppression = retrait de la liste (local) ; pas d’API serveur de wipe. */
    const openRemoveConversationModal = (e) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        setConfirmModal("remove");
    };

    const isMine = (m) => m.senderId === session.id && m.senderRole === session.role;

    const submitLive = (e) => {
        e.preventDefault();
        const text = draft.trim();
        if (!text || !onSendMessage || sending || inputLocked) return;
        onSendMessage(text);
        setDraft("");
    };

    const toggleVoiceRecording = async () => {
        if (!onSendVoice || sending || inputLocked) return;
        if (recording) {
            const mr = mediaRecorderRef.current;
            if (mr && mr.state !== "inactive") {
                mr.stop();
            } else {
                setRecording(false);
            }
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            chunksRef.current = [];
            let mimeType = "audio/webm";
            if (typeof MediaRecorder !== "undefined") {
                if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
                    mimeType = "audio/webm;codecs=opus";
                } else if (MediaRecorder.isTypeSupported("audio/webm")) {
                    mimeType = "audio/webm";
                }
            }
            const mr = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mr;
            mr.ondataavailable = (ev) => {
                if (ev.data.size) chunksRef.current.push(ev.data);
            };
            mr.onstop = () => {
                stream.getTracks().forEach((t) => t.stop());
                const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
                chunksRef.current = [];
                setRecording(false);
                mediaRecorderRef.current = null;
                if (blob.size >= 200 && onSendVoice) {
                    onSendVoice(blob);
                }
            };
            mr.start();
            setRecording(true);
        } catch (err) {
            console.error(err);
            alert(t("chat.data.alertMic"));
        }
    };

    return (
        <>
            <div className="chat-head">
                <header className="d-flex justify-content-between align-items-center pt-3 pe-3 pb-3 ps-3">
                    <div className="d-flex align-items-center">
                        <div className="sidebar-toggle bg-primary-subtle" onClick={() => SidebarToggle()}>
                            <i className="ri-menu-3-line"></i>
                        </div>
                        <div className="avatar chat-user-profile m-0 me-3" role="button" onClick={() => setShow(!show)}>
                            <img src={userimg} alt="avatar" className="avatar-50 rounded" />
                            <span className="avatar-status"><i className="ri-checkbox-blank-circle-fill text-success"></i></span>
                        </div>
                        <h5 className="mb-0">{title}</h5>
                    </div>
                    <div className={`chat-user-detail-popup scroller overflow-auto ${show && "show"}`} style={{}}>
                        <div className="user-profile text-center">
                            <button type="submit" className="close-popup p-3"><i className="ri-close-fill" onClick={() => {
                                setShow(!show)
                            }}></i></button>
                            <div className="user mb-4">
                                <a className="avatar m-0 d-inline-block chat-profile-popup-avatar">
                                    <img src={userimg} alt="" className="avatar-120 rounded object-cover" />
                                </a>
                                <div className="user-name mt-4">
                                    <h4>{userdetailname}</h4>
                                </div>
                                <div className="user-desc">
                                    <p>{useraddress}</p>
                                </div>
                            </div>
                            <hr />
                            <div className="chatuser-detail text-start mt-4">
                                <Row>
                                    <Col xs={6} md={6} className="title">{t("chat.data.name")}</Col>
                                    <Col xs={6} md={6} className="text-end">{usersortname}</Col>
                                </Row>
                                <hr />
                                <Row>
                                    <Col xs={6} md={6} className="title">{t("chat.data.tel")}</Col>
                                    <Col xs={6} md={6} className="text-end">{usertelnumber}</Col>
                                </Row>
                                <hr />
                                <Row>
                                    <Col xs={6} md={6} className="title">{t("chat.data.dob")}</Col>
                                    <Col xs={6} md={6} className="text-end">{userdob}</Col>
                                </Row>
                                <hr />
                                <Row>
                                    <Col xs={6} md={6} className="title">{t("chat.data.gender")}</Col>
                                    <Col xs={6} md={6} className="text-end">{usergender}</Col>
                                </Row>
                                <hr />
                                <Row>
                                    <Col xs={6} md={6} className="title">{t("chat.data.language")}</Col>
                                    <Col xs={6} md={6} className="text-end">{userlanguage}</Col>
                                </Row>
                                <hr />
                            </div>
                        </div>
                    </div>
                    <div className="chat-header-icons d-flex">
                        <button
                            type="button"
                            className="chat-icon-phone bg-primary-subtle ms-3"
                            onClick={() => {
                                if (isLive && voiceCallEnabled && onVoiceCall && !sending && !recording && !inputLocked) {
                                    onVoiceCall();
                                }
                            }}
                            disabled={!isLive || inputLocked || !voiceCallEnabled || !onVoiceCall || sending || recording}
                            title={
                                isLive && voiceCallEnabled
                                    ? t("chat.data.voiceCall")
                                    : t("chat.data.voiceCallUnavailable")
                            }
                            aria-label={t("chat.data.voiceCall")}
                        >
                            <i className="ri-phone-line" aria-hidden />
                        </button>
                        <button
                            type="button"
                            className="chat-icon-video bg-primary-subtle border-0"
                            onClick={() => {
                                if (isLive && voiceCallEnabled && onVideoCall && !sending && !recording && !inputLocked) {
                                    onVideoCall();
                                }
                            }}
                            disabled={!isLive || inputLocked || !voiceCallEnabled || !onVideoCall || sending || recording}
                            title={
                                isLive && voiceCallEnabled
                                    ? t("chat.data.videoCall")
                                    : t("chat.data.videoCallUnavailable")
                            }
                            aria-label={t("chat.data.videoCall")}
                        >
                            <i className="ri-vidicon-line" aria-hidden />
                        </button>
                        {onThreadHide ? (
                            <button
                                type="button"
                                className="chat-icon-delete bg-primary-subtle border-0"
                                title={t("chat.data.deleteThread")}
                                aria-label={t("chat.data.deleteThread")}
                                onClick={openRemoveConversationModal}
                            >
                                <i className="ri-delete-bin-line" aria-hidden />
                            </button>
                        ) : null}
                        {hasThreadActions ? (
                        <span className="bg-primary-subtle d-flex align-items-center justify-content-center">
                            <Dropdown>
                                <DropdownToggle as="i" className="ri-more-2-line cursor-pointer dropdown-toggle nav-hide-arrow cursor-pointer pe-0"
                                    id="dropdownMenuButton02" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
                                    role="menu"></DropdownToggle>
                                <DropdownMenu className="dropdown-menu-right" aria-labelledby="dropdownMenuButton02">
                                    {onThreadTogglePin ? (
                                        <DropdownItem
                                            as="button"
                                            type="button"
                                            onClick={() => onThreadTogglePin()}
                                        >
                                            <i className="fa fa-thumb-tack" aria-hidden />
                                            {" "}
                                            {threadPinned ? t("chat.data.unpin") : t("chat.data.pin")}
                                        </DropdownItem>
                                    ) : null}
                                    {onThreadHide ? (
                                        <DropdownItem
                                            as="button"
                                            type="button"
                                            onClick={openRemoveConversationModal}
                                        >
                                            <i className="fa fa-trash-o" aria-hidden />
                                            {" "}
                                            {t("chat.data.deleteThreadShort")}
                                        </DropdownItem>
                                    ) : null}
                                    {onThreadToggleBlock ? (
                                        <DropdownItem
                                            as="button"
                                            type="button"
                                            onClick={() => {
                                                if (threadBlocked) onThreadToggleBlock();
                                                else setConfirmModal("block");
                                            }}
                                        >
                                            <i className="fa fa-ban" aria-hidden />
                                            {" "}
                                            {threadBlocked ? t("chat.data.unblock") : t("chat.data.block")}
                                        </DropdownItem>
                                    ) : null}
                                </DropdownMenu>
                            </Dropdown>
                        </span>
                        ) : null}
                    </div>
                </header>
            </div>
            <div className="chat-content scroller">
                {isLive && inputLocked && (
                    <div className="px-3 py-2 small bg-warning-subtle text-dark border-bottom">
                        <i className="ri-forbid-line me-1" aria-hidden />
                        {t("chat.data.blockedBanner")}
                    </div>
                )}
                {isLive ? (
                    liveMessages.length === 0 ? (
                        <div className="p-4 text-muted small">
                            {t("chat.data.emptyMessages")}
                        </div>
                    ) : (
                        <div className="chat-live-messages text-start">
                        {liveMessages.map((m) => {
                            const mine = isMine(m);
                            return (
                                <div
                                    key={m.id}
                                    className={`d-flex w-100 mb-3 ${mine ? "justify-content-end" : "justify-content-start"}`}
                                    style={{ clear: "both" }}
                                >
                                    <div
                                        className={`d-flex gap-2 align-items-end ${mine ? "flex-row-reverse" : "flex-row"}`}
                                        style={{ maxWidth: "min(85%, 520px)" }}
                                    >
                                        <a className="avatar m-0 flex-shrink-0">
                                            <img
                                                src={mine ? user01 : userimg}
                                                alt=""
                                                className="avatar-50 rounded"
                                            />
                                        </a>
                                        <div className="d-flex flex-column" style={{ minWidth: 0 }}>
                                            <div
                                                className="rounded-3 px-3 py-2 text-start shadow-sm"
                                                style={{
                                                    background: mine ? "#089bab" : "var(--bs-body-bg)",
                                                    color: mine ? "#fff" : "var(--bs-body-color)",
                                                    border: mine ? "none" : "1px solid var(--bs-border-color, rgba(0,0,0,.12))",
                                                    wordBreak: "break-word",
                                                }}
                                            >
                                                {(() => {
                                                    const callMeta = parseCallLogBody(m.body);
                                                    const k =
                                                        m.kind === "call" || callMeta ? "call" : m.kind || "text";
                                                    const capCls = mine ? "text-white" : "";
                                                    if (k === "image" && m.mediaUrl) {
                                                        return (
                                                            <>
                                                                <img
                                                                    src={resolveMediaUrl(m.mediaUrl)}
                                                                    alt=""
                                                                    className="rounded img-fluid"
                                                                    style={{ maxHeight: 280, display: "block" }}
                                                                />
                                                                {m.body ? (
                                                                    <p className={`mb-0 mt-2 small ${capCls}`} style={{ whiteSpace: "pre-wrap", opacity: 0.95 }}>
                                                                        {m.body}
                                                                    </p>
                                                                ) : null}
                                                            </>
                                                        );
                                                    }
                                                    if (k === "video" && m.mediaUrl) {
                                                        return (
                                                            <>
                                                                <video
                                                                    controls
                                                                    className="w-100 rounded"
                                                                    style={{ maxHeight: 280 }}
                                                                    src={resolveMediaUrl(m.mediaUrl)}
                                                                />
                                                                {m.body ? (
                                                                    <p className={`mb-0 mt-2 small ${capCls}`} style={{ whiteSpace: "pre-wrap" }}>
                                                                        {m.body}
                                                                    </p>
                                                                ) : null}
                                                            </>
                                                        );
                                                    }
                                                    if (k === "document" && m.mediaUrl) {
                                                        const name = m.fileName || t("chat.data.documentFallback");
                                                        return (
                                                            <>
                                                                <a
                                                                    href={resolveMediaUrl(m.mediaUrl)}
                                                                    download={name}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={mine ? "text-white text-decoration-underline" : "text-primary"}
                                                                >
                                                                    <i className="ri-file-download-line me-1" aria-hidden />
                                                                    {name}
                                                                </a>
                                                                {m.body ? (
                                                                    <p className={`mb-0 mt-2 small ${capCls}`} style={{ whiteSpace: "pre-wrap" }}>
                                                                        {m.body}
                                                                    </p>
                                                                ) : null}
                                                            </>
                                                        );
                                                    }
                                                    if (k === "voice" && m.audioUrl) {
                                                        return (
                                                            <div className="d-flex align-items-center gap-2">
                                                                <i className="ri-mic-2-fill flex-shrink-0" aria-hidden />
                                                                <audio
                                                                    controls
                                                                    preload="metadata"
                                                                    src={resolveMediaUrl(m.audioUrl)}
                                                                    className="flex-grow-1"
                                                                    style={{ maxWidth: 260, minHeight: 36, verticalAlign: "middle" }}
                                                                />
                                                            </div>
                                                        );
                                                    }
                                                    if (k === "call") {
                                                        let callLabel = t("chat.data.callVoice");
                                                        try {
                                                            const j = callMeta || JSON.parse(m.body || "{}");
                                                            if (j.outcome === "ended" && j.durationSec != null) {
                                                                const min = Math.floor(j.durationSec / 60);
                                                                const sec = j.durationSec % 60;
                                                                callLabel =
                                                                    min > 0
                                                                        ? t("chat.data.callDuration", { min, sec })
                                                                        : t("chat.data.callDurationSec", { sec });
                                                            } else if (j.outcome === "declined") callLabel = t("chat.data.callDeclined");
                                                            else if (j.outcome === "missed") callLabel = t("chat.data.callMissed");
                                                            else if (j.outcome === "cancelled") callLabel = t("chat.data.callCancelled");
                                                        } catch {
                                                            /* ignore */
                                                        }
                                                        return (
                                                            <p className="d-flex align-items-center gap-2 mb-0">
                                                                <i className="ri-phone-fill flex-shrink-0" aria-hidden />
                                                                <span>{callLabel}</span>
                                                            </p>
                                                        );
                                                    }
                                                    return (
                                                        <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                                                            {m.body}
                                                        </p>
                                                    );
                                                })()}
                                            </div>
                                            <span
                                                className="mt-1"
                                                style={{
                                                    fontSize: "0.75rem",
                                                    color: "#828D99",
                                                    alignSelf: mine ? "flex-end" : "flex-start",
                                                }}
                                            >
                                                {formatMsgTime(m.createdAt, i18n.language)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        </div>
                    )
                ) : (
                    <>
                        <div className="chat">
                            <div className="chat-user">
                                <a className="avatar m-0">
                                    <img src={user01} alt="avatar" className="avatar-50 rounded" />
                                </a>
                                <span className="chat-time mt-1">6:45</span>
                            </div>
                            <div className="chat-detail">
                                <div className="chat-message">
                                    <p className="d-flex align-items-start gap-2 mb-0">
                                        <i className="ri-stethoscope-line text-primary flex-shrink-0 mt-1" aria-hidden />
                                        <span>{t("chat.data.demoHelp")}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="chat chat-left">
                            <div className="chat-user">
                                <a className="avatar m-0">
                                    <img src={userimg} alt="avatar" className="avatar-50 rounded" />
                                </a>
                                <span className="chat-time mt-1">6:48</span>
                            </div>
                            <div className="chat-detail">
                                <div className="chat-message">
                                    <p>Hey John, I am looking for the best admin template.</p>
                                    <p className="d-flex align-items-start gap-2 mb-0">
                                        <i className="ri-question-line text-muted flex-shrink-0 mt-1" aria-hidden />
                                        <span>Could you please help me find that information?</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="chat">
                            <div className="chat-user">
                                <a className="avatar m-0">
                                    <img src={user01} alt="avatar" className="avatar-50 rounded" />
                                </a>
                                <span className="chat-time mt-1">6:49</span>
                            </div>
                            <div className="chat-detail">
                                <div className="chat-message">
                                    <p>Absolutely!</p>
                                    <p>XRay Dashboard is the responsive bootstrap 5 admin
                                        template.</p>
                                </div>
                            </div>
                        </div>
                        <div className="chat chat-left">
                            <div className="chat-user">
                                <a className="avatar m-0">
                                    <img src={userimg} alt="avatar" className="avatar-50 rounded" />
                                </a>
                                <span className="chat-time mt-1">6:52</span>
                            </div>
                            <div className="chat-detail">
                                <div className="chat-message">
                                    <p>Looks clean and fresh UI.</p>
                                </div>
                            </div>
                        </div>
                        <div className="chat">
                            <div className="chat-user">
                                <a className="avatar m-0">
                                    <img src={user01} alt="avatar" className="avatar-50 rounded" />
                                </a>
                                <span className="chat-time mt-1">6:53</span>
                            </div>
                            <div className="chat-detail">
                                <div className="chat-message">
                                    <p>Thanks, from ThemeForest.</p>
                                </div>
                            </div>
                        </div>
                        <div className="chat chat-left">
                            <div className="chat-user">
                                <a className="avatar m-0">
                                    <img src={userimg} alt="avatar" className="avatar-50 rounded" />
                                </a>
                                <span className="chat-time mt-1">6:54</span>
                            </div>
                            <div className="chat-detail">
                                <div className="chat-message">
                                    <p className="d-flex align-items-start gap-2 mb-0">
                                        <i className="ri-checkbox-circle-line text-success flex-shrink-0 mt-1" aria-hidden />
                                        <span>Confirmed — I will proceed.</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="chat">
                            <div className="chat-user">
                                <a className="avatar m-0">
                                    <img src={user01} alt="avatar" className="avatar-50 rounded" />
                                </a>
                                <span className="chat-time mt-1">6:56</span>
                            </div>
                            <div className="chat-detail">
                                <div className="chat-message">
                                    <p>Okay Thanks..</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <div className="chat-footer p-3">
                {isLive && recording && (
                    <div className="small text-danger mb-2">
                        <i className="ri-record-circle-fill me-1" aria-hidden />
                        {t("chat.data.recordingHint")}
                    </div>
                )}
                <Form
                    className="d-flex align-items-center flex-nowrap gap-2 w-100"
                    style={{ minWidth: 0 }}
                    onSubmit={isLive && !inputLocked ? submitLive : undefined}
                >
                    {isLive && onSendMedia && !inputLocked && (
                        <>
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                className="d-none"
                                tabIndex={-1}
                                aria-hidden
                                onChange={(e) => handleMediaFile(e, "image")}
                            />
                            <input
                                ref={videoInputRef}
                                type="file"
                                accept="video/*"
                                className="d-none"
                                tabIndex={-1}
                                aria-hidden
                                onChange={(e) => handleMediaFile(e, "video")}
                            />
                            <input
                                ref={docInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                                className="d-none"
                                tabIndex={-1}
                                aria-hidden
                                onChange={(e) => handleMediaFile(e, "document")}
                            />
                        </>
                    )}
                    <div className="chat-attagement d-flex align-items-center flex-nowrap flex-shrink-0 gap-1 align-self-center">
                        <span ref={emojiPickerWrapperRef} className="position-relative flex-shrink-0">
                            <button
                                type="button"
                                className="btn btn-link p-1 border-0 text-body d-flex align-items-center justify-content-center"
                                style={{ minWidth: 36, minHeight: 36 }}
                                aria-label={t("chat.data.emojis")}
                                aria-expanded={showEmojiPicker}
                                disabled={!isLive || inputLocked}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (inputLocked) return;
                                    toggleEmojiPicker();
                                }}
                            >
                                <i className="fa fa-smile-o" style={{ fontSize: "1.25rem" }} />
                            </button>
                            {showEmojiPicker && (
                                <div
                                    className="position-absolute bottom-100 start-0 mb-1 shadow rounded overflow-hidden"
                                    style={{ zIndex: 1050 }}
                                    role="dialog"
                                    aria-label={t("chat.data.emojiPicker")}
                                >
                                    <EmojiPicker onEmojiClick={onEmojiSelect} width={300} height={400} />
                                </div>
                            )}
                        </span>
                        {isLive && onSendMedia && !inputLocked && (
                            <Dropdown drop="up" className="flex-shrink-0">
                                <DropdownToggle
                                    as="button"
                                    type="button"
                                    className="btn chat-attach-btn rounded-circle p-0 d-flex align-items-center justify-content-center border-0 text-white"
                                    disabled={sending || recording || inputLocked}
                                    title={t("chat.data.attachFile")}
                                    aria-label={t("chat.data.attachFile")}
                                    id="chat-attach-menu-toggle"
                                >
                                    <i className="ri-attachment-2" aria-hidden />
                                </DropdownToggle>
                                <DropdownMenu className="chat-attach-menu p-2 shadow-sm">
                                    <DropdownItem
                                        as="button"
                                        type="button"
                                        className="chat-attach-menu-item d-flex align-items-center gap-2"
                                        onClick={openCameraCapture}
                                    >
                                        <i className="ri-camera-line" aria-hidden />
                                        <span>{t("chat.data.takePhoto")}</span>
                                    </DropdownItem>
                                    <DropdownItem
                                        as="button"
                                        type="button"
                                        className="chat-attach-menu-item d-flex align-items-center gap-2"
                                        onClick={() => imageInputRef.current?.click()}
                                    >
                                        <i className="ri-image-2-line" aria-hidden />
                                        <span>{t("chat.data.imageGallery")}</span>
                                    </DropdownItem>
                                    <DropdownItem
                                        as="button"
                                        type="button"
                                        className="chat-attach-menu-item d-flex align-items-center gap-2"
                                        onClick={() => videoInputRef.current?.click()}
                                    >
                                        <i className="ri-film-line" aria-hidden />
                                        <span>{t("chat.data.video")}</span>
                                    </DropdownItem>
                                    <DropdownItem
                                        as="button"
                                        type="button"
                                        className="chat-attach-menu-item d-flex align-items-center gap-2"
                                        onClick={() => docInputRef.current?.click()}
                                    >
                                        <i className="ri-file-text-line" aria-hidden />
                                        <span>{t("chat.data.document")}</span>
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        )}
                        {isLive && onSendVoice && !inputLocked && (
                            <button
                                type="button"
                                className={`btn btn-link p-1 border-0 flex-shrink-0 d-flex align-items-center justify-content-center ${recording ? "text-danger" : "text-body"}`}
                                style={{ minWidth: 36, minHeight: 36 }}
                                onClick={toggleVoiceRecording}
                                disabled={sending || inputLocked}
                                title={recording ? t("chat.data.voiceSendHint") : t("chat.data.voiceRecord")}
                                aria-label={recording ? t("chat.data.voiceStopRecording") : t("chat.data.voiceRecord")}
                            >
                                <i className="ri-mic-fill" style={{ fontSize: "1.25rem", opacity: recording ? 1 : 0.85 }} />
                            </button>
                        )}
                    </div>
                    <input
                        type="text"
                        className="form-control flex-grow-1 min-w-0 w-auto"
                        id="chat-input-1"
                        placeholder={t("chat.data.placeholder")}
                        aria-label={t("chat.data.messageAria")}
                        aria-describedby="basic-addon2-1"
                        value={isLive ? draft : ""}
                        onChange={(e) => {
                            if (isLive) setDraft(e.target.value);
                        }}
                        disabled={!isLive || inputLocked || (isLive && (!onSendMessage || sending || recording))}
                    />
                    <button
                        type="submit"
                        className="btn btn-primary-subtle d-flex align-items-center flex-shrink-0 p-2"
                        disabled={isLive && (inputLocked || !draft.trim() || sending || recording)}
                    >
                        <i className="fa fa-paper-plane-o"
                            aria-hidden="true"></i><span className="d-none d-lg-block ms-1">{t("chat.data.send")}</span></button>
                </Form>
            </div>

            <Modal
                show={cameraModalOpen}
                onHide={closeCameraModal}
                centered
                size="lg"
                backdrop="static"
                className="chat-camera-modal"
                aria-labelledby="chat-camera-modal-title"
            >
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title id="chat-camera-modal-title" className="h6 fw-semibold">
                        {t("chat.data.cameraModalTitle")}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-2">
                    <div className="ratio ratio-4x3 bg-dark rounded overflow-hidden position-relative">
                        <video
                            ref={cameraVideoRef}
                            className="w-100 h-100"
                            style={{ objectFit: "cover" }}
                            playsInline
                            muted
                            autoPlay
                        />
                    </div>
                    <p className="small text-muted mb-0 mt-2">
                        {t("chat.data.cameraPreview")}
                    </p>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <button type="button" className="btn btn-outline-secondary" onClick={closeCameraModal}>
                        {t("chat.data.cancel")}
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={captureCameraPhoto}
                        disabled={sending || recording || inputLocked}
                    >
                        <i className="ri-camera-fill me-1" aria-hidden />
                        {t("chat.data.captureSend")}
                    </button>
                </Modal.Footer>
            </Modal>

            <Modal show={confirmModal !== null} onHide={() => setConfirmModal(null)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="h6">
                        {confirmModal === "remove" ? t("chat.data.confirmRemoveTitle") : t("chat.data.confirmBlockTitle")}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="small">
                    {confirmModal === "remove" ? (
                        <>{t("chat.data.confirmRemoveBody")}</>
                    ) : (
                        <>{t("chat.data.confirmBlockBody")}</>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" size="sm" onClick={() => setConfirmModal(null)}>
                        {t("chat.data.cancel")}
                    </Button>
                    <Button
                        variant={confirmModal === "remove" ? "danger" : "warning"}
                        size="sm"
                        onClick={runConfirm}
                    >
                        {confirmModal === "remove" ? t("chat.data.delete") : t("chat.data.block")}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default ChatData

import React, { useEffect, useRef, useState } from "react";
import { Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Form, Modal, Row } from "react-bootstrap";
import EmojiPicker from "emoji-picker-react";
import { Link } from "react-router-dom";


import user01 from "/assets/images/user/1.jpg"

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api\/?$/, "");

function resolveMediaUrl(path) {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

function formatMsgTime(iso) {
    if (!iso) return "";
    try {
        return new Intl.DateTimeFormat("fr-FR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(iso));
    } catch {
        return "";
    }
}

const ChatData = (props) => {

    const { SidebarToggle } = props
    const { title, userimg, userdetailname, useraddress, usersortname, usertelnumber, userdob, usergender, userlanguage } = props.data

    const liveMessages = props.liveMessages;
    const onSendMessage = props.onSendMessage;
    const onSendVoice = props.onSendVoice;
    const onSendMedia = props.onSendMedia;
    const sending = props.sending;
    const session = props.session || { id: "", role: "" };

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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
        if (!f || !onSendMedia || sending || recording) return;
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
        if (!onSendMedia || sending || recording) return;
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
            alert("Impossible d’accéder à la caméra. Vérifiez les autorisations du navigateur.");
        }
    };

    const captureCameraPhoto = () => {
        const v = cameraVideoRef.current;
        if (!v || !onSendMedia || sending || recording) return;
        const w = v.videoWidth;
        const h = v.videoHeight;
        if (!w || !h) {
            alert("La caméra n’est pas prête. Patientez une seconde.");
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

    const isMine = (m) => m.senderId === session.id && m.senderRole === session.role;

    const submitLive = (e) => {
        e.preventDefault();
        const t = draft.trim();
        if (!t || !onSendMessage || sending) return;
        onSendMessage(t);
        setDraft("");
    };

    const toggleVoiceRecording = async () => {
        if (!onSendVoice || sending) return;
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
            alert("Impossible d’accéder au microphone. Vérifiez les autorisations du navigateur.");
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
                                <a className="avatar m-0">
                                    <img src={userimg} alt="avatar" />
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
                                    <Col xs={6} md={6} className="title">Name:</Col>
                                    <Col xs={6} md={6} className="text-end">{usersortname}</Col>
                                </Row>
                                <hr />
                                <Row>
                                    <Col xs={6} md={6} className="title">Tel:</Col>
                                    <Col xs={6} md={6} className="text-end">{usertelnumber}</Col>
                                </Row>
                                <hr />
                                <Row>
                                    <Col xs={6} md={6} className="title">Date Of Birth:</Col>
                                    <Col xs={6} md={6} className="text-end">{userdob}</Col>
                                </Row>
                                <hr />
                                <Row>
                                    <Col xs={6} md={6} className="title">Gender:</Col>
                                    <Col xs={6} md={6} className="text-end">{usergender}</Col>
                                </Row>
                                <hr />
                                <Row>
                                    <Col xs={6} md={6} className="title">Language:</Col>
                                    <Col xs={6} md={6} className="text-end">{userlanguage}</Col>
                                </Row>
                                <hr />
                            </div>
                        </div>
                    </div>
                    <div className="chat-header-icons d-flex">
                        <Link to="#" className="chat-icon-phone bg-primary-subtle ms-3">
                            <i className="ri-phone-line"></i>
                        </Link>
                        <Link to="#" className="chat-icon-video bg-primary-subtle">
                            <i className="ri-vidicon-line"></i>
                        </Link>
                        <Link to="#" className="chat-icon-delete bg-primary-subtle">
                            <i className="ri-delete-bin-line"></i>
                        </Link>
                        <span className="bg-primary-subtle d-flex align-items-center justify-content-center">
                            <Dropdown>
                                <DropdownToggle as="i" className="ri-more-2-line cursor-pointer dropdown-toggle nav-hide-arrow cursor-pointer pe-0"
                                    id="dropdownMenuButton02" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
                                    role="menu"></DropdownToggle>
                                <DropdownMenu className="dropdown-menu-right" aria-labelledby="dropdownMenuButton02">
                                    <DropdownItem as="a" href="#"><i className="fa fa-thumb-tack"
                                        aria-hidden="true"></i>{" "}
                                        Pin to top</DropdownItem>
                                    <DropdownItem as="a" href="#"><i className="fa fa-trash-o" aria-hidden="true"></i>{" "}
                                        Delete chat</DropdownItem>
                                    <DropdownItem as="a" href="#"><i className="fa fa-ban" aria-hidden="true"></i>{" "}
                                        Block</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </span>
                    </div>
                </header>
            </div>
            <div className="chat-content scroller">
                {isLive ? (
                    liveMessages.length === 0 ? (
                        <div className="p-4 text-muted small">
                            Aucun message pour l’instant. Texte, emoji, photo, vidéo, document ou message vocal ci-dessous.
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
                                                    const k = m.kind || "text";
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
                                                        const name = m.fileName || "Document";
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
                                                {formatMsgTime(m.createdAt)}
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
                                        <span>How can we help? We&apos;re here for you.</span>
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
                        Enregistrement… cliquez à nouveau sur le micro pour envoyer.
                    </div>
                )}
                <Form
                    className="d-flex align-items-center flex-nowrap gap-2 w-100"
                    style={{ minWidth: 0 }}
                    onSubmit={isLive ? submitLive : undefined}
                >
                    {isLive && onSendMedia && (
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
                                aria-label="Emojis"
                                aria-expanded={showEmojiPicker}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
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
                                    aria-label="Sélecteur d’emojis"
                                >
                                    <EmojiPicker onEmojiClick={onEmojiSelect} width={300} height={400} />
                                </div>
                            )}
                        </span>
                        {isLive && onSendMedia && (
                            <Dropdown drop="up" className="flex-shrink-0">
                                <DropdownToggle
                                    as="button"
                                    type="button"
                                    className="btn chat-attach-btn rounded-circle p-0 d-flex align-items-center justify-content-center border-0 text-white"
                                    disabled={sending || recording}
                                    title="Joindre un fichier"
                                    aria-label="Joindre un fichier"
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
                                        <span>Prendre une photo</span>
                                    </DropdownItem>
                                    <DropdownItem
                                        as="button"
                                        type="button"
                                        className="chat-attach-menu-item d-flex align-items-center gap-2"
                                        onClick={() => imageInputRef.current?.click()}
                                    >
                                        <i className="ri-image-2-line" aria-hidden />
                                        <span>Image (galerie)</span>
                                    </DropdownItem>
                                    <DropdownItem
                                        as="button"
                                        type="button"
                                        className="chat-attach-menu-item d-flex align-items-center gap-2"
                                        onClick={() => videoInputRef.current?.click()}
                                    >
                                        <i className="ri-film-line" aria-hidden />
                                        <span>Vidéo</span>
                                    </DropdownItem>
                                    <DropdownItem
                                        as="button"
                                        type="button"
                                        className="chat-attach-menu-item d-flex align-items-center gap-2"
                                        onClick={() => docInputRef.current?.click()}
                                    >
                                        <i className="ri-file-text-line" aria-hidden />
                                        <span>Document</span>
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        )}
                        {isLive && onSendVoice && (
                            <button
                                type="button"
                                className={`btn btn-link p-1 border-0 flex-shrink-0 d-flex align-items-center justify-content-center ${recording ? "text-danger" : "text-body"}`}
                                style={{ minWidth: 36, minHeight: 36 }}
                                onClick={toggleVoiceRecording}
                                disabled={sending}
                                title={recording ? "Arrêter et envoyer le message vocal" : "Message vocal"}
                                aria-label={recording ? "Arrêter l’enregistrement" : "Enregistrer un message vocal"}
                            >
                                <i className="ri-mic-fill" style={{ fontSize: "1.25rem", opacity: recording ? 1 : 0.85 }} />
                            </button>
                        )}
                    </div>
                    <input
                        type="text"
                        className="form-control flex-grow-1 min-w-0 w-auto"
                        id="chat-input-1"
                        placeholder="Votre message…"
                        aria-label="Message"
                        aria-describedby="basic-addon2-1"
                        value={isLive ? draft : undefined}
                        onChange={isLive ? (e) => setDraft(e.target.value) : undefined}
                        disabled={isLive && (!onSendMessage || sending || recording)}
                    />
                    <button
                        type="submit"
                        className="btn btn-primary-subtle d-flex align-items-center flex-shrink-0 p-2"
                        disabled={isLive && (!draft.trim() || sending || recording)}
                    >
                        <i className="fa fa-paper-plane-o"
                            aria-hidden="true"></i><span className="d-none d-lg-block ms-1">Send</span></button>
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
                        Prendre une photo
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
                        Aperçu en direct — positionnez le cadre puis capturez.
                    </p>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <button type="button" className="btn btn-outline-secondary" onClick={closeCameraModal}>
                        Annuler
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={captureCameraPhoto}
                        disabled={sending || recording}
                    >
                        <i className="ri-camera-fill me-1" aria-hidden />
                        Capturer et envoyer
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default ChatData

import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";
import { io } from "socket.io-client";
import { chatApi } from "../../services/api";
import {
    VOICE_ICE_SERVERS,
    getApiOrigin,
    getAuthTokenForSocket,
    getSelfDisplayName,
} from "./voiceCallUtils";
import { startIncomingRingtone, startOutgoingRingback } from "./callRingtone";
import { detectDominantExpression } from "../../services/face-emotions";

/** Libellés face-api.js / FER (7 classes). */
const EMOTION_EMOJI = {
    neutral: "😐",
    happy: "🙂",
    sad: "😢",
    angry: "😠",
    fearful: "😨",
    disgusted: "🤢",
    surprised: "😮",
};

/** Secours si une clé i18n manque (ne jamais afficher `chat.voice.emotion.xxx` brut). */
const EMOTION_LABEL_DEFAULT_EN = {
    neutral: "Neutral",
    happy: "Happy",
    sad: "Sad",
    angry: "Angry",
    fearful: "Fearful",
    disgusted: "Disgusted",
    surprised: "Surprised",
};

/** Routage messagerie aligné sur POST /chat/messages (patient seul, patient+staff, ou pair). */
function sendCallLogToThread(routing, bodyJson) {
    const notifyBell = () => window.dispatchEvent(new CustomEvent("medifollow-notifications-refresh"));
    if (!routing) return Promise.resolve();
    let p;
    if (routing.patientId && routing.peerRole && routing.peerId) {
        p = chatApi.sendMessage({
            patientId: routing.patientId,
            peerRole: routing.peerRole,
            peerId: routing.peerId,
            body: bodyJson,
            kind: "call",
        });
    } else if (routing.patientId && !routing.peerRole) {
        p = chatApi.sendMessage({ patientId: routing.patientId, body: bodyJson, kind: "call" });
    } else if (routing.peerRole && routing.peerId) {
        p = chatApi.sendMessage({
            peerRole: routing.peerRole,
            peerId: routing.peerId,
            body: bodyJson,
            kind: "call",
        });
    } else {
        return Promise.resolve();
    }
    return Promise.resolve(p).then((res) => {
        notifyBell();
        return res;
    });
}

/** Détecte une offre WebRTC vidéo même si le champ socket `video` est absent (récepteur). */
function sdpOfferIndicatesVideo(offer) {
    if (!offer || typeof offer !== "object") return false;
    const sdp = typeof offer.sdp === "string" ? offer.sdp : "";
    return sdp.includes("m=video");
}

function cleanupPeer(pcRef, streamRef) {
    const pc = pcRef.current;
    if (pc) {
        try {
            pc.ontrack = null;
            pc.onicecandidate = null;
            pc.close();
        } catch {
            /* ignore */
        }
        pcRef.current = null;
    }
    const stream = streamRef.current;
    if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
    }
}

/** @typedef {'audio' | 'video'} CallMediaMode */

/**
 * Signalisation Socket.IO (/voice) + WebRTC audio ou vidéo 1:1.
 */
const VoiceCallLayer = forwardRef(function VoiceCallLayer({ session, peerContext, onAfterCallLogged }, ref) {
    const { t } = useTranslation();
    const [phase, setPhase] = useState("idle");
    const [pendingIncoming, setPendingIncoming] = useState(null);
    const [errorHint, setErrorHint] = useState(null);
    /** audio = appel vocal ; video = visio (caméra + micro). */
    const [mediaMode, setMediaMode] = useState(/** @type {CallMediaMode} */ ("audio"));
    const [camOff, setCamOff] = useState(false);
    /** Émotion dominante du patient (flux analysé : local si patient, distant si soignant). */
    const [patientEmotion, setPatientEmotion] = useState(/** @type {{ label: string, confidence: number } | null} */ (null));

    const phaseRef = useRef(phase);
    useEffect(() => {
        phaseRef.current = phase;
    }, [phase]);

    /** Sonnerie entrante (appel vocal ou vidéo). */
    useEffect(() => {
        if (phase !== "ringing") return undefined;
        return startIncomingRingtone(mediaMode === "video");
    }, [phase, mediaMode]);

    /** Tonalité d’attente côté appelant. */
    useEffect(() => {
        if (phase !== "outgoing") return undefined;
        return startOutgoingRingback(mediaMode === "video");
    }, [phase, mediaMode]);

    const socketRef = useRef(null);
    const pcRef = useRef(null);
    const localStreamRef = useRef(null);
    const remoteAudioRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const callMediaRef = useRef(/** @type {CallMediaMode} */ ("audio"));
    const roomIdRef = useRef(null);
    const remoteUserIdRef = useRef(null);
    const callRecordMediaRecorderRef = useRef(null);
    const callRecordChunksRef = useRef([]);
    const callRecordAudioContextRef = useRef(null);
    /** Si défini, `runHangupBody` est appelé après l’arrêt de l’enregistrement (fichier téléchargé). */
    const pendingHangupAfterRecordRef = useRef(null);
    const connectedAtRef = useRef(null);
    /** Flux distant si ontrack arrive avant le montage du <video> (récepteur / appelant). */
    const pendingRemoteStreamRef = useRef(null);
    /** Pair cible pour appels via window.medifollow.startCall (hors fil de chat). */
    const peerOverrideRef = useRef(null);

    const [micMuted, setMicMuted] = useState(false);
    const [callRecording, setCallRecording] = useState(false);
    /** Affichage MM:SS uniquement une fois la communication établie (appelant ou appelé). */
    const [callTimerLabel, setCallTimerLabel] = useState("00:00");
    /** Libellé contact si appel global (sans peerContext messagerie). */
    const [peerLabelFallback, setPeerLabelFallback] = useState(null);

    const peerDisplayName = peerContext?.label || peerLabelFallback || "…";

    const runHangupBody = useCallback((notifyPeer) => {
        connectedAtRef.current = null;
        setMicMuted(false);
        setCamOff(false);
        setCallRecording(false);
        setPatientEmotion(null);
        setMediaMode("audio");
        callMediaRef.current = "audio";
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        pendingRemoteStreamRef.current = null;
        const remote = remoteUserIdRef.current;
        const room = roomIdRef.current;
        const s = socketRef.current;
        if (notifyPeer && s?.connected && remote) {
            s.emit("voice:hangup", { toUserId: remote, roomId: room });
        }
        cleanupPeer(pcRef, localStreamRef);
        if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = null;
        }
        roomIdRef.current = null;
        remoteUserIdRef.current = null;
        peerOverrideRef.current = null;
        setPeerLabelFallback(null);
        setPendingIncoming(null);
        setPhase("idle");
        setErrorHint(null);
    }, []);

    useEffect(() => {
        if (phase !== "connected") {
            setCallTimerLabel("00:00");
            return undefined;
        }
        const tick = () => {
            const start = connectedAtRef.current;
            if (!start) return;
            const sec = Math.floor((Date.now() - start) / 1000);
            const m = Math.floor(sec / 60);
            const s = sec % 60;
            setCallTimerLabel(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [phase]);

    /** Si la session locale a une piste vidéo, forcer l’UI visio (filet de sécurité récepteur). */
    useEffect(() => {
        if (phase !== "connected") return;
        const stream = localStreamRef.current;
        if (stream?.getVideoTracks().length) {
            setMediaMode("video");
            callMediaRef.current = "video";
        }
    }, [phase]);

    /** Attache le flux distant au <video> même si ontrack arrive avant le montage React du popup. */
    const attachRemoteVideoStream = useCallback((rs) => {
        if (!rs) return;
        pendingRemoteStreamRef.current = rs;
        const tryAttach = () => {
            const el = remoteVideoRef.current;
            if (!el || !pendingRemoteStreamRef.current) return false;
            el.srcObject = pendingRemoteStreamRef.current;
            el.play().catch(() => {});
            pendingRemoteStreamRef.current = null;
            return true;
        };
        if (tryAttach()) return;
        requestAnimationFrame(() => {
            if (tryAttach()) return;
            requestAnimationFrame(() => {
                tryAttach();
            });
        });
    }, []);

    const handleRemoteTrack = useCallback((ev) => {
        let rs = ev.streams[0];
        if (!rs && ev.track) rs = new MediaStream([ev.track]);
        if (!rs) return;
        if (callMediaRef.current === "video") {
            attachRemoteVideoStream(rs);
        } else if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = rs;
            remoteAudioRef.current.play().catch(() => {});
        }
    }, [attachRemoteVideoStream]);

    /** Après paint : aperçu local + dernier flux distant en attente (récepteur). */
    useLayoutEffect(() => {
        if (mediaMode !== "video") return;
        if (phase !== "connected" && phase !== "outgoing") return;
        const ls = localStreamRef.current;
        const lv = localVideoRef.current;
        if (ls && lv) {
            lv.srcObject = ls;
            lv.play().catch(() => {});
        }
        const pending = pendingRemoteStreamRef.current;
        const rv = remoteVideoRef.current;
        if (pending && rv) {
            rv.srcObject = pending;
            rv.play().catch(() => {});
            pendingRemoteStreamRef.current = null;
        }
    }, [phase, mediaMode]);

    /** Détection d’émotions (FER / faceExpressionNet) sur le flux du patient : local si patient, distant si soignant. */
    useEffect(() => {
        const role = session?.role;
        const staffRoles = ["doctor", "nurse", "carecoordinator"];
        const isAnalyzing =
            mediaMode === "video" &&
            !camOff &&
            (phase === "connected" || (phase === "outgoing" && role === "patient"));
        if (!isAnalyzing || !role) {
            setPatientEmotion(null);
            return undefined;
        }

        const pickVideoEl = () => {
            if (role === "patient") return localVideoRef.current;
            if (staffRoles.includes(role)) return remoteVideoRef.current;
            return null;
        };

        let cancelled = false;
        let timerId = 0;

        const tick = async () => {
            const el = pickVideoEl();
            if (!el || cancelled) return;
            try {
                const res = await detectDominantExpression(el);
                if (cancelled) return;
                /* 7 classes softmax : le max est souvent < 0,35 ; 0,32 masquait tout le badge */
                if (res && res.confidence >= 0.12) {
                    setPatientEmotion({ label: res.label, confidence: res.confidence });
                } else {
                    setPatientEmotion(null);
                }
            } catch {
                if (!cancelled) setPatientEmotion(null);
            }
        };

        timerId = window.setInterval(tick, 850);
        void tick();

        return () => {
            cancelled = true;
            window.clearInterval(timerId);
        };
    }, [phase, mediaMode, session?.role, camOff]);

    const enqueueHangup = useCallback(
        async (notifyPeer) => {
            const ph = phaseRef.current;
            const t0 = connectedAtRef.current;
            const routing = (peerOverrideRef.current || peerContext)?.routing;
            if (notifyPeer && routing) {
                let outcome = "cancelled";
                let durationSec;
                if (ph === "connected") {
                    outcome = "ended";
                    durationSec = t0 != null ? Math.max(0, Math.floor((Date.now() - t0) / 1000)) : 0;
                } else if (ph === "outgoing") {
                    /* Pas de réponse côté appelé → appel manqué (notif + libellé chat-data). */
                    outcome = "missed";
                } else if (ph === "ringing") {
                    outcome = "cancelled";
                }
                const bodyJson = JSON.stringify({ outcome, durationSec });
                try {
                    await sendCallLogToThread(routing, bodyJson);
                    onAfterCallLogged?.();
                } catch (e) {
                    console.warn("Historique appel", e);
                }
            }
            runHangupBody(notifyPeer);
        },
        [peerContext, runHangupBody, onAfterCallLogged],
    );

    const hangup = useCallback(
        (notifyPeer) => {
            const mr = callRecordMediaRecorderRef.current;
            if (mr && mr.state === "recording") {
                pendingHangupAfterRecordRef.current = { notifyPeer };
                try {
                    mr.stop();
                } catch {
                    pendingHangupAfterRecordRef.current = null;
                    void enqueueHangup(notifyPeer);
                }
                return;
            }
            if (callRecordAudioContextRef.current) {
                try {
                    callRecordAudioContextRef.current.close();
                } catch {
                    /* ignore */
                }
                callRecordAudioContextRef.current = null;
            }
            callRecordChunksRef.current = [];
            void enqueueHangup(notifyPeer);
        },
        [enqueueHangup],
    );

    /** Perte de session (déconnexion) : raccrocher sans démonter le composant (évite erreurs portail Modal). */
    useEffect(() => {
        if (!session?.id && phaseRef.current !== "idle") {
            hangup(false);
        }
    }, [session?.id, hangup]);

    const toggleMicMute = useCallback(() => {
        const stream = localStreamRef.current;
        if (!stream) return;
        const nextMuted = !micMuted;
        stream.getAudioTracks().forEach((t) => {
            t.enabled = !nextMuted;
        });
        setMicMuted(nextMuted);
    }, [micMuted]);

    const toggleCam = useCallback(() => {
        const stream = localStreamRef.current;
        if (!stream) return;
        const next = !camOff;
        stream.getVideoTracks().forEach((t) => {
            t.enabled = !next;
        });
        setCamOff(next);
    }, [camOff]);

    const toggleCallRecording = useCallback(() => {
        if (!callRecording) {
            const local = localStreamRef.current;
            const remote =
                remoteAudioRef.current?.srcObject || remoteVideoRef.current?.srcObject;
            if (!local || !remote) {
                setErrorHint(t("chat.voice.errorStreamIncomplete"));
                return;
            }
            try {
                const ctx = new AudioContext();
                callRecordAudioContextRef.current = ctx;
                const dest = ctx.createMediaStreamDestination();
                ctx.createMediaStreamSource(local).connect(dest);
                ctx.createMediaStreamSource(remote).connect(dest);
                callRecordChunksRef.current = [];
                let mimeType = "audio/webm";
                if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
                    mimeType = "audio/webm;codecs=opus";
                } else if (!MediaRecorder.isTypeSupported("audio/webm")) {
                    setErrorHint(t("chat.voice.errorRecordUnsupported"));
                    try {
                        ctx.close();
                    } catch {
                        /* ignore */
                    }
                    callRecordAudioContextRef.current = null;
                    return;
                }
                const recorder = new MediaRecorder(dest.stream, { mimeType });
                callRecordMediaRecorderRef.current = recorder;
                recorder.ondataavailable = (e) => {
                    if (e.data.size) callRecordChunksRef.current.push(e.data);
                };
                recorder.onstop = () => {
                    const chunks = callRecordChunksRef.current;
                    if (chunks.length) {
                        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `medifollow-appel-${Date.now()}.webm`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                    }
                    callRecordChunksRef.current = [];
                    const c = callRecordAudioContextRef.current;
                    if (c) {
                        c.close().catch(() => {});
                        callRecordAudioContextRef.current = null;
                    }
                    setCallRecording(false);
                    callRecordMediaRecorderRef.current = null;
                    const pending = pendingHangupAfterRecordRef.current;
                    pendingHangupAfterRecordRef.current = null;
                    if (pending) {
                        void enqueueHangup(pending.notifyPeer);
                    }
                };
                recorder.start(1000);
                ctx.resume().catch(() => {});
                setCallRecording(true);
            } catch (e) {
                console.error(e);
                setErrorHint(t("chat.voice.errorRecordFailed"));
            }
        } else {
            pendingHangupAfterRecordRef.current = null;
            const mr = callRecordMediaRecorderRef.current;
            if (mr && mr.state !== "inactive") {
                try {
                    mr.stop();
                } catch {
                    /* ignore */
                }
            }
        }
    }, [callRecording, enqueueHangup, t]);

    useEffect(() => {
        if (!session?.id) return undefined;
        const token = getAuthTokenForSocket();
        if (!token) return undefined;

        const origin = getApiOrigin();
        const s = io(`${origin}/voice`, {
            auth: { token: `Bearer ${token}` },
            transports: ["websocket", "polling"],
            reconnection: true,
        });
        socketRef.current = s;

        const onIncoming = (payload) => {
            const ph = phaseRef.current;
            if (ph !== "idle" && ph !== "ringing") return;
            if (!payload?.fromUserId || !payload?.offer) return;
            window.dispatchEvent(new CustomEvent("medifollow-notifications-refresh"));
            const isVideo = !!payload.video || sdpOfferIndicatesVideo(payload.offer);
            setMediaMode(isVideo ? "video" : "audio");
            callMediaRef.current = isVideo ? "video" : "audio";
            setPendingIncoming({
                roomId: payload.roomId,
                fromUserId: payload.fromUserId,
                callerName: payload.callerName || t("chat.voice.contactFallback"),
                offer: payload.offer,
                video: isVideo,
            });
            setPhase("ringing");
        };

        const onIncomingAnswer = async (payload) => {
            if (!payload?.answer || !payload?.fromUserId) return;
            if (roomIdRef.current && payload.roomId && payload.roomId !== roomIdRef.current) return;
            const pc = pcRef.current;
            if (!pc) return;
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
                connectedAtRef.current = Date.now();
                setPhase("connected");
            } catch (e) {
                console.error(e);
                setErrorHint(t("chat.voice.errorConnectionFailed"));
                hangup(false);
            }
        };

        const onIce = async (payload) => {
            if (!payload?.candidate || !payload?.fromUserId) return;
            const pc = pcRef.current;
            if (!pc) return;
            const peer = remoteUserIdRef.current;
            if (peer && payload.fromUserId !== peer) return;
            try {
                await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
            } catch (e) {
                console.warn("ICE", e);
            }
        };

        const onRejected = () => {
            setErrorHint(t("chat.voice.errorCallRejected"));
            hangup(false);
        };

        const onRemoteHangup = () => {
            hangup(false);
        };

        s.on("voice:incoming", onIncoming);
        s.on("voice:incoming-answer", onIncomingAnswer);
        s.on("voice:ice", onIce);
        s.on("voice:rejected", onRejected);
        s.on("voice:hangup", onRemoteHangup);

        return () => {
            s.off("voice:incoming", onIncoming);
            s.off("voice:incoming-answer", onIncomingAnswer);
            s.off("voice:ice", onIce);
            s.off("voice:rejected", onRejected);
            s.off("voice:hangup", onRemoteHangup);
            s.disconnect();
            socketRef.current = null;
            cleanupPeer(pcRef, localStreamRef);
            if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = null;
            }
            if (localVideoRef.current) localVideoRef.current.srcObject = null;
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
            pendingRemoteStreamRef.current = null;
            roomIdRef.current = null;
            remoteUserIdRef.current = null;
        };
    }, [session?.id, hangup, t]);

    useEffect(() => {
        const ph = phaseRef.current;
        if (ph === "idle" || ph === "ringing") return;
        const ctx = peerOverrideRef.current || peerContext;
        if (!ctx?.roomId) {
            hangup(true);
            return;
        }
        if (roomIdRef.current && ctx.roomId !== roomIdRef.current) {
            hangup(true);
        }
    }, [peerContext?.roomId, hangup]);

    const startOutgoing = useCallback(async (opts = {}) => {
        const isVideo = !!opts.video;
        const ctx = peerOverrideRef.current || peerContext;
        if (!ctx?.remoteUserId || !ctx?.roomId) return;
        const s = socketRef.current;
        if (!s?.connected) {
            setErrorHint(t("chat.voice.errorSignalUnavailable"));
            peerOverrideRef.current = null;
            setPeerLabelFallback(null);
            return;
        }
        if (phaseRef.current !== "idle") {
            peerOverrideRef.current = null;
            setPeerLabelFallback(null);
            return;
        }

        connectedAtRef.current = null;
        setMediaMode(isVideo ? "video" : "audio");
        callMediaRef.current = isVideo ? "video" : "audio";
        setPhase("outgoing");
        setErrorHint(null);
        roomIdRef.current = ctx.roomId;
        remoteUserIdRef.current = ctx.remoteUserId;

        try {
            const stream = await navigator.mediaDevices.getUserMedia(
                isVideo ? { audio: true, video: { facingMode: "user" } } : { audio: true },
            );
            localStreamRef.current = stream;
            const pc = new RTCPeerConnection({ iceServers: VOICE_ICE_SERVERS });
            pcRef.current = pc;

            stream.getTracks().forEach((track) => pc.addTrack(track, stream));

            pc.onicecandidate = (e) => {
                if (e.candidate && ctx.remoteUserId) {
                    s.emit("voice:ice", {
                        roomId: ctx.roomId,
                        toUserId: ctx.remoteUserId,
                        candidate: e.candidate.toJSON(),
                    });
                }
            };

            pc.ontrack = handleRemoteTrack;

            const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: isVideo,
            });
            await pc.setLocalDescription(offer);

            s.emit("voice:invite", {
                roomId: ctx.roomId,
                toUserId: ctx.remoteUserId,
                offer: pc.localDescription,
                callerName: getSelfDisplayName(session),
                video: isVideo,
            });
            if (isVideo && localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
                localVideoRef.current.play().catch(() => {});
            }
        } catch (e) {
            console.error(e);
            setErrorHint(
                isVideo ? t("chat.voice.errorVideoDenied") : t("chat.voice.errorMicDenied"),
            );
            hangup(false);
        }
    }, [peerContext, session, hangup, handleRemoteTrack, t]);

    const acceptIncoming = useCallback(async () => {
        const p = pendingIncoming;
        const s = socketRef.current;
        if (!p || !s?.connected) return;

        const { roomId, fromUserId, offer, video: wantVideo } = p;
        const isVideo = !!wantVideo || sdpOfferIndicatesVideo(offer);
        setMediaMode(isVideo ? "video" : "audio");
        callMediaRef.current = isVideo ? "video" : "audio";
        roomIdRef.current = roomId;
        remoteUserIdRef.current = fromUserId;
        setPendingIncoming(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia(
                isVideo ? { audio: true, video: { facingMode: "user" } } : { audio: true },
            );
            localStreamRef.current = stream;
            const pc = new RTCPeerConnection({ iceServers: VOICE_ICE_SERVERS });
            pcRef.current = pc;

            stream.getTracks().forEach((track) => pc.addTrack(track, stream));

            pc.onicecandidate = (e) => {
                if (e.candidate) {
                    s.emit("voice:ice", {
                        roomId,
                        toUserId: fromUserId,
                        candidate: e.candidate.toJSON(),
                    });
                }
            };

            pc.ontrack = handleRemoteTrack;

            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            s.emit("voice:answer", {
                roomId,
                toUserId: fromUserId,
                answer: pc.localDescription,
            });
            connectedAtRef.current = Date.now();
            setPhase("connected");
            if (isVideo && localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
                localVideoRef.current.play().catch(() => {});
            }
        } catch (e) {
            console.error(e);
            setErrorHint(
                isVideo ? t("chat.voice.errorAcceptVideo") : t("chat.voice.errorAcceptAudio"),
            );
            hangup(false);
        }
    }, [pendingIncoming, hangup, handleRemoteTrack, t]);

    const rejectIncoming = useCallback(() => {
        const p = pendingIncoming;
        const s = socketRef.current;
        if (p?.fromUserId && s?.connected) {
            s.emit("voice:reject", { toUserId: p.fromUserId, roomId: p.roomId });
        }
        void (async () => {
            try {
                const r = (peerOverrideRef.current || peerContext)?.routing;
                if (r) {
                    await sendCallLogToThread(r, JSON.stringify({ outcome: "declined" }));
                    onAfterCallLogged?.();
                }
            } catch (e) {
                console.warn("Historique appel", e);
            }
        })();
        setMediaMode("audio");
        callMediaRef.current = "audio";
        setPendingIncoming(null);
        setPhase("idle");
    }, [pendingIncoming, peerContext, onAfterCallLogged]);

    useEffect(() => {
        if (!window.medifollow) window.medifollow = {};
        window.medifollow.startCall = async (toUserId, opts = {}) => {
            if (!session?.id) return;
            if (phaseRef.current !== "idle") return;
            const room = [
                `${session.role}:${session.id}`,
                `${opts.peerRole || "user"}:${toUserId}`,
            ]
                .sort()
                .join("|");
            const label = opts.peerName || "Contact";
            peerOverrideRef.current = {
                roomId: room,
                remoteUserId: String(toUserId),
                label,
                routing: undefined,
            };
            setPeerLabelFallback(label);
            await startOutgoing({ video: opts.video !== false });
        };
        return () => {
            if (window.medifollow) delete window.medifollow.startCall;
        };
    }, [session, startOutgoing]);

    useImperativeHandle(
        ref,
        () => ({
            startOutgoing,
            startVideoCall: () => startOutgoing({ video: true }),
        }),
        [startOutgoing],
    );

    const voiceModalOpen =
        !!session?.id && (phase === "outgoing" || phase === "ringing" || phase === "connected");

    const handleVoiceModalHide = useCallback(() => {
        if (phase === "ringing") rejectIncoming();
        else hangup(true);
    }, [phase, rejectIncoming, hangup]);

    /** Pas de react-bootstrap Modal (portail body) : évite NotFoundError removeChild. */
    useEffect(() => {
        if (!voiceModalOpen) return undefined;
        const onKey = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                handleVoiceModalHide();
            }
        };
        window.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [voiceModalOpen, handleVoiceModalHide]);

    return (
        <>
            <audio ref={remoteAudioRef} autoPlay playsInline className="d-none" />

            {/* Overlay fixe (sans portail) — entrant, sortant, en communication */}
            {voiceModalOpen ? (
                <div
                    className={`voice-call-modal-unified modal fade show d-block ${mediaMode === "video" ? "voice-call-modal--video" : ""}`}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 1055,
                        overflow: "hidden auto",
                    }}
                    tabIndex={-1}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="voice-call-modal-title"
                >
                    <div
                        className="modal-backdrop fade show"
                        style={{ position: "fixed", inset: 0, zIndex: 0 }}
                        aria-hidden
                    />
                    <div
                        className={`modal-dialog modal-dialog-centered voice-call-modal__dialog ${
                            mediaMode === "video" ? "voice-call-modal__dialog--video" : ""
                        }`}
                        style={{ position: "relative", zIndex: 1, pointerEvents: "auto" }}
                    >
                        <div className="modal-content voice-call-modal__content">
                            <div
                                className={`modal-body voice-call-modal__body text-center position-relative ${
                                    mediaMode === "video" && (phase === "outgoing" || phase === "connected")
                                        ? "voice-call-modal__body--video p-0"
                                        : ""
                                }`}
                            >
                    {phase === "ringing" && (
                        <>
                            <button
                                type="button"
                                className="btn-close btn-close-white position-absolute top-0 end-0 mt-2 me-2"
                                onClick={rejectIncoming}
                                aria-label={t("chat.voice.rejectAria")}
                                style={{ zIndex: 2 }}
                            />
                            <div className="voice-call-modal__avatar voice-call-modal__avatar--ring mb-3">
                                <i
                                    className={pendingIncoming?.video ? "ri-vidicon-fill text-white" : "ri-phone-fill text-white"}
                                    style={{ fontSize: "1.65rem" }}
                                    aria-hidden
                                />
                            </div>
                            <p id="voice-call-modal-title" className="voice-call-modal__title mb-2 fw-semibold">
                                {pendingIncoming?.video ? t("chat.voice.incomingVideo") : t("chat.voice.incomingAudio")}
                            </p>
                            <p className="voice-call-modal__subtitle small mb-4">
                                <strong className="text-white">{pendingIncoming?.callerName || t("chat.voice.contactFallback")}</strong>
                                <br />
                                {pendingIncoming?.video ? t("chat.voice.wantsVideo") : t("chat.voice.wantsAudio")}
                            </p>
                            <div className="d-flex flex-wrap gap-2 justify-content-center">
                                <button
                                    type="button"
                                    className="voice-call-btn voice-call-btn--secondary-outline"
                                    onClick={rejectIncoming}
                                >
                                    {t("chat.voice.reject")}
                                </button>
                                <button
                                    type="button"
                                    className="voice-call-btn voice-call-btn--primary-accept"
                                    onClick={acceptIncoming}
                                >
                                    <i className={pendingIncoming?.video ? "ri-vidicon-fill" : "ri-phone-fill"} aria-hidden />
                                    {t("chat.voice.accept")}
                                </button>
                            </div>
                        </>
                    )}

                    {mediaMode === "video" && (phase === "outgoing" || phase === "connected") && (
                        <div className={`voice-call-modal__video-wrap ${phase === "outgoing" ? "is-outgoing" : "is-live"}`}>
                            <video ref={remoteVideoRef} className="voice-call-modal__remote" playsInline autoPlay />
                            <video ref={localVideoRef} className="voice-call-modal__local" playsInline autoPlay muted />
                            {patientEmotion && EMOTION_EMOJI[patientEmotion.label] != null && (
                                <div
                                    className={`voice-call-modal__emotion-badge ${
                                        session?.role === "patient" && phase === "connected"
                                            ? "voice-call-modal__emotion-badge--pip"
                                            : "voice-call-modal__emotion-badge--main"
                                    }`}
                                    role="status"
                                    aria-live="polite"
                                    title={t("chat.voice.emotionHint")}
                                >
                                    <span className="voice-call-modal__emotion-emoji" aria-hidden>
                                        {EMOTION_EMOJI[patientEmotion.label]}
                                    </span>
                                    <span className="voice-call-modal__emotion-label">
                                        {t(`chat.voice.emotion.${patientEmotion.label}`, {
                                            defaultValue:
                                                EMOTION_LABEL_DEFAULT_EN[patientEmotion.label] ?? patientEmotion.label,
                                        })}
                                    </span>
                                </div>
                            )}
                            <div className="voice-call-modal__video-overlay">
                                {phase === "outgoing" && (
                                    <>
                                        <Spinner animation="border" role="status" variant="light" className="mb-2" />
                                        <p className="voice-call-modal__title mb-1 fw-semibold">{t("chat.voice.outgoingVideo")}</p>
                                        <p className="voice-call-modal__subtitle small mb-3">
                                            {t("chat.voice.connectingLine", { name: peerDisplayName })}
                                        </p>
                                        <div className="voice-call-toolbar">
                                            <button
                                                type="button"
                                                className={`voice-call-btn ${micMuted ? "voice-call-btn--accent" : "voice-call-btn--ghost"}`}
                                                onClick={toggleMicMute}
                                                title={micMuted ? t("chat.voice.micMuted") : t("chat.voice.micOn")}
                                            >
                                                <i className={micMuted ? "ri-mic-off-line" : "ri-mic-line"} aria-hidden />
                                            </button>
                                            <button
                                                type="button"
                                                className={`voice-call-btn ${camOff ? "voice-call-btn--accent" : "voice-call-btn--ghost"}`}
                                                onClick={toggleCam}
                                                title={camOff ? t("chat.voice.camOff") : t("chat.voice.camOn")}
                                            >
                                                <i className={camOff ? "ri-camera-off-line" : "ri-camera-line"} aria-hidden />
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            className="voice-call-btn voice-call-btn--hangup mt-2"
                                            onClick={() => hangup(true)}
                                            title={t("chat.voice.hangup")}
                                            aria-label={t("chat.voice.hangupAria")}
                                        >
                                            <i
                                                className="ri-phone-fill me-2"
                                                style={{ transform: "rotate(135deg)" }}
                                                aria-hidden
                                            />
                                            {t("chat.voice.hangup")}
                                        </button>
                                    </>
                                )}
                                {phase === "connected" && (
                                    <>
                                        <p className="voice-call-modal__title mb-1 fw-semibold">{t("chat.voice.videoConference")}</p>
                                        <p
                                            className="voice-call-modal__timer mb-1"
                                            aria-label={t("chat.voice.callDurationAria")}
                                            aria-live="polite"
                                        >
                                            {callTimerLabel}
                                        </p>
                                        <p className="voice-call-modal__subtitle small mb-2">
                                            {t("chat.voice.with")}{" "}
                                            <strong className="text-white">{peerDisplayName}</strong>
                                        </p>
                                        <div className="voice-call-toolbar">
                                            <button
                                                type="button"
                                                className={`voice-call-btn ${micMuted ? "voice-call-btn--accent" : "voice-call-btn--ghost"}`}
                                                onClick={toggleMicMute}
                                                title={micMuted ? t("chat.voice.micMuted") : t("chat.voice.micOn")}
                                                aria-pressed={micMuted}
                                            >
                                                <i className={micMuted ? "ri-mic-off-line" : "ri-mic-line"} aria-hidden />
                                                <span className="d-none d-sm-inline">
                                                    {micMuted ? t("chat.voice.microphoneMuted") : t("chat.voice.microphone")}
                                                </span>
                                            </button>
                                            <button
                                                type="button"
                                                className={`voice-call-btn ${camOff ? "voice-call-btn--accent" : "voice-call-btn--ghost"}`}
                                                onClick={toggleCam}
                                                title={camOff ? t("chat.voice.camOff") : t("chat.voice.camOn")}
                                                aria-pressed={camOff}
                                            >
                                                <i className={camOff ? "ri-camera-off-line" : "ri-camera-line"} aria-hidden />
                                                <span className="d-none d-sm-inline">{t("chat.voice.camera")}</span>
                                            </button>
                                            <button
                                                type="button"
                                                className={`voice-call-btn ${callRecording ? "voice-call-btn--record-on" : "voice-call-btn--ghost"}`}
                                                onClick={toggleCallRecording}
                                                title={
                                                    callRecording
                                                        ? t("chat.voice.recordStop")
                                                        : t("chat.voice.recordStart")
                                                }
                                                aria-pressed={callRecording}
                                            >
                                                <i
                                                    className={callRecording ? "ri-stop-circle-fill" : "ri-record-circle-line"}
                                                    aria-hidden
                                                />
                                                <span className="d-none d-sm-inline">
                                                    {callRecording ? t("chat.voice.recordStopShort") : t("chat.voice.recordShort")}
                                                </span>
                                            </button>
                                        </div>
                                        <p className="voice-call-modal__hint mb-2">
                                            {t("chat.voice.hintVideo")}
                                        </p>
                                        <button
                                            type="button"
                                            className="voice-call-btn voice-call-btn--hangup"
                                            onClick={() => hangup(true)}
                                            title={t("chat.voice.hangup")}
                                            aria-label={t("chat.voice.hangupAria")}
                                        >
                                            <i
                                                className="ri-phone-fill me-2"
                                                style={{ transform: "rotate(135deg)" }}
                                                aria-hidden
                                            />
                                            {t("chat.voice.hangup")}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {phase === "outgoing" && mediaMode === "audio" && (
                        <>
                            <div className="voice-call-modal__avatar voice-call-modal__avatar--ring mb-3">
                                <Spinner animation="border" role="status" variant="light" />
                            </div>
                            <p id="voice-call-modal-title" className="voice-call-modal__title mb-2 fw-semibold">
                                {t("chat.voice.outgoingAudio")}
                            </p>
                            <p className="voice-call-modal__subtitle small mb-3">
                                {t("chat.voice.connectingLine", { name: peerDisplayName })}
                            </p>
                            <div className="voice-call-toolbar">
                                <button
                                    type="button"
                                    className={`voice-call-btn ${micMuted ? "voice-call-btn--accent" : "voice-call-btn--ghost"}`}
                                    onClick={toggleMicMute}
                                    title={micMuted ? t("chat.voice.micMuted") : t("chat.voice.micOn")}
                                >
                                    <i className={micMuted ? "ri-mic-off-line" : "ri-mic-line"} aria-hidden />
                                    <span className="d-none d-sm-inline">
                                        {micMuted ? t("chat.voice.microphoneMuted") : t("chat.voice.microphone")}
                                    </span>
                                </button>
                            </div>
                            <button
                                type="button"
                                className="voice-call-btn voice-call-btn--hangup"
                                onClick={() => hangup(true)}
                                title={t("chat.voice.hangup")}
                                aria-label={t("chat.voice.hangupAria")}
                            >
                                <i className="ri-phone-fill me-2" style={{ transform: "rotate(135deg)" }} aria-hidden />
                                {t("chat.voice.hangup")}
                            </button>
                        </>
                    )}

                    {phase === "connected" && mediaMode === "audio" && (
                        <>
                            <div className="voice-call-modal__avatar mb-3">
                                <i className="ri-phone-fill text-white" style={{ fontSize: "1.85rem" }} aria-hidden />
                            </div>
                            <p id="voice-call-modal-title" className="voice-call-modal__title mb-2 fw-semibold">
                                {t("chat.voice.inCall")}
                            </p>
                            <p
                                className="voice-call-modal__timer mb-2"
                                aria-label={t("chat.voice.callDurationAria")}
                                aria-live="polite"
                            >
                                {callTimerLabel}
                            </p>
                            <p className="voice-call-modal__subtitle small mb-3">
                                {t("chat.voice.with")}{" "}
                                <strong className="text-white">{peerDisplayName}</strong>
                            </p>
                            <div className="voice-call-toolbar">
                                <button
                                    type="button"
                                    className={`voice-call-btn ${micMuted ? "voice-call-btn--accent" : "voice-call-btn--ghost"}`}
                                    onClick={toggleMicMute}
                                    title={micMuted ? t("chat.voice.micMuted") : t("chat.voice.micOn")}
                                    aria-pressed={micMuted}
                                >
                                    <i className={micMuted ? "ri-mic-off-line" : "ri-mic-line"} aria-hidden />
                                    <span className="d-none d-sm-inline">
                                        {micMuted ? t("chat.voice.microphoneMuted") : t("chat.voice.microphone")}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    className={`voice-call-btn ${callRecording ? "voice-call-btn--record-on" : "voice-call-btn--ghost"}`}
                                    onClick={toggleCallRecording}
                                    title={
                                        callRecording
                                            ? t("chat.voice.recordStop")
                                            : t("chat.voice.recordStart")
                                    }
                                    aria-pressed={callRecording}
                                >
                                    <i
                                        className={callRecording ? "ri-stop-circle-fill" : "ri-record-circle-line"}
                                        aria-hidden
                                    />
                                    <span className="d-none d-sm-inline">
                                        {callRecording ? t("chat.voice.recordStopShort") : t("chat.voice.recordShort")}
                                    </span>
                                </button>
                            </div>
                            <p className="voice-call-modal__hint mb-3">
                                {t("chat.voice.hintAudio")}
                            </p>
                            <button
                                type="button"
                                className="voice-call-btn voice-call-btn--hangup"
                                onClick={() => hangup(true)}
                                title={t("chat.voice.hangup")}
                                aria-label={t("chat.voice.hangupAria")}
                            >
                                <i className="ri-phone-fill me-2" style={{ transform: "rotate(135deg)" }} aria-hidden />
                                {t("chat.voice.hangup")}
                            </button>
                        </>
                    )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {errorHint && (
                <div
                    className="alert alert-warning py-2 small mb-0 position-fixed top-0 start-50 translate-middle-x mt-2"
                    style={{ zIndex: 1070 }}
                >
                    {errorHint}
                    <button type="button" className="btn btn-sm btn-link ms-2 p-0" onClick={() => setErrorHint(null)}>
                        {t("chat.voice.ok")}
                    </button>
                </div>
            )}
        </>
    );
});

export default VoiceCallLayer;

export function VoiceCallButton({ voiceCallEnabled, onVoiceCall, disabled }) {
    const { t } = useTranslation();
    if (!voiceCallEnabled) return null;
    return (
        <button
            type="button"
            className="btn btn-icon btn-sm rounded-circle btn-primary-subtle text-primary ms-2"
            title={t("chat.data.voiceCall")}
            aria-label={t("chat.data.voiceCall")}
            disabled={disabled}
            onClick={() => onVoiceCall?.()}
        >
            <i className="ri-phone-fill" style={{ fontSize: "1.15rem" }} />
        </button>
    );
}

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import VoiceCallLayer from "../views/chat/VoiceCallLayer";

function getSession() {
    try {
        if (localStorage.getItem("adminUser")) {
            const u = JSON.parse(localStorage.getItem("adminUser"));
            if (u?.role === "carecoordinator")
                return { id: String(u.id || u._id || ""), role: "carecoordinator" };
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
    return null;
}

const VoiceCallBridgeContext = createContext(null);

export function VoiceCallBridgeProvider({ children }) {
    const [session, setSession] = useState(getSession);
    const [peerContext, setPeerContext] = useState(null);
    /** Ref : évite setState(fn) interprété comme updater React. */
    const onAfterCallLoggedRef = useRef(null);
    const voiceCallRef = useRef(null);

    useEffect(() => {
        const onStorage = () => setSession(getSession());
        window.addEventListener("storage", onStorage);
        const id = setInterval(() => {
            const s = getSession();
            setSession((prev) =>
                prev?.id === s?.id && prev?.role === s?.role ? prev : s,
            );
        }, 2000);
        return () => {
            window.removeEventListener("storage", onStorage);
            clearInterval(id);
        };
    }, []);

    const value = useMemo(
        () => ({
            peerContext,
            setPeerContext,
            setOnAfterCallLogged: (fn) => {
                onAfterCallLoggedRef.current = fn;
            },
            voiceCallRef,
        }),
        [peerContext],
    );

    /* Toujours monter VoiceCallLayer : le démontage pendant un Modal (portail body)
     * provoque souvent NotFoundError removeChild avec react-bootstrap. */
    return (
        <VoiceCallBridgeContext.Provider value={value}>
            {children}
            <VoiceCallLayer
                ref={voiceCallRef}
                session={session}
                peerContext={peerContext}
                onAfterCallLogged={() => onAfterCallLoggedRef.current?.()}
            />
        </VoiceCallBridgeContext.Provider>
    );
}

export function useVoiceCallBridge() {
    const ctx = useContext(VoiceCallBridgeContext);
    if (!ctx) {
        throw new Error("useVoiceCallBridge must be used within VoiceCallBridgeProvider");
    }
    return ctx;
}

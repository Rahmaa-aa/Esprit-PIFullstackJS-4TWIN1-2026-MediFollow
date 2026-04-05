import React, { useState, useRef, useCallback, useEffect } from "react";
import { Container, Row, Col, Form, Modal } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authApi } from "../../services/api";
import { useHandGesture } from "../../context/HandGestureContext";
import { captureFaceDescriptor } from "../../services/face-auth";
import { generatePath } from "../landing/landingPaths";
import AuthCarouselMedifollow from "../../components/auth/AuthCarouselMedifollow";
import { LARGE_TEXT_STORAGE_KEY } from "../../constants/accessibility";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechSynthesis = window.speechSynthesis;
const isSpeechSupported = !!SpeechRecognition;
const isTtsSupported = !!SpeechSynthesis;

const KEYWORD_STOP = ["stop", "terminer", "arrêt", "arrêter", "finish", "fin", "توقف", "إيقاف"];

/** Supprime les autres rôles pour ne pas garder plusieurs JWT (sinon api.js pouvait envoyer le mauvais token). */
function clearMedifollowSessionExcept(role) {
  const r = role === "auditor" || role === "carecoordinator" ? "admin" : role;
  const sessions = [
    ["patient", "patientToken", "patientUser"],
    ["doctor", "doctorToken", "doctorUser"],
    ["nurse", "nurseToken", "nurseUser"],
    ["admin", "adminToken", "adminUser"],
  ];
  for (const [name, tok, usr] of sessions) {
    if (name === r) continue;
    localStorage.removeItem(tok);
    localStorage.removeItem(usr);
  }
}

const isKeywordMatch = (text, keywords) => {
  const t = text.trim().toLowerCase();
  return keywords.some((kw) => t === kw || t.endsWith(" " + kw) || t.startsWith(kw + " "));
};

const SignIn = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isActive: handActive, startHandGesture, stopHandGesture, error: handError, setError: setHandError } = useHandGesture();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [largeTextEnabled, setLargeTextEnabled] = useState(() => localStorage.getItem(LARGE_TEXT_STORAGE_KEY) === "1");
  const [listeningField, setListeningField] = useState(null);
  const [speechError, setSpeechError] = useState("");
  const [isReadingPage, setIsReadingPage] = useState(false);
  const [faceLoading, setFaceLoading] = useState(false);
  const [faceCameraOn, setFaceCameraOn] = useState(false);
  const [faceCameraReady, setFaceCameraReady] = useState(false);
  const [faceCameraBooting, setFaceCameraBooting] = useState(false);
  const [faceCameraError, setFaceCameraError] = useState("");
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);
  const faceVideoRef = useRef(null);
  const faceStreamRef = useRef(null);
  const faceAutoLoginBusyRef = useRef(false);
  const faceAutoLoginDoneRef = useRef(false);
  const faceAutoLoginTimerRef = useRef(null);
  const faceNotEnrolledPopupShownRef = useRef(false);
  const [showFaceNotEnrolledPopup, setShowFaceNotEnrolledPopup] = useState(false);

  const isFaceNotEnrolledError = useCallback((message) => {
    const text = (message || "").toLowerCase();
    return (
      text.includes("aucun visage enregistre") ||
      text.includes("no face") ||
      text.includes("not enrolled") ||
      text.includes("visage non enregistr")
    );
  }, []);

  const startVoiceInput = useCallback((field) => {
    if (!isSpeechSupported) {
      setSpeechError(t("signIn.speechNotSupported"));
      return;
    }
    setSpeechError("");
    setListeningField(field);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = i18n.language?.startsWith("fr")
      ? "fr-FR"
      : i18n.language?.startsWith("ar")
        ? "ar-SA"
        : "en-US";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }
      const text = transcript.trim();
      if (!text) return;

      if (isKeywordMatch(text, KEYWORD_STOP)) {
        recognition.stop();
        return;
      }

      if (field === "email") {
        const normalized = text.toLowerCase()
          .replace(/\s*(à|at|arobas|arobase)\s*/gi, "@")
          .replace(/\s*(point|dot)\s*/gi, ".")
          .replace(/\s+/g, "");
        setEmail((prev) => (prev + normalized).toLowerCase());
      } else {
        setPassword((prev) => prev + text.replace(/\s+/g, ""));
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== "aborted") {
        setSpeechError(
          event.error === "not-allowed" ? t("signIn.speechMicDenied") : t("signIn.speechErrorGeneric", { error: event.error }),
        );
      }
      setListeningField(null);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setListeningField(null);
      recognitionRef.current = null;
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [t, i18n.language]);

  const stopVoiceInput = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListeningField(null);
  }, []);

  const stopPageReading = useCallback(() => {
    if (SpeechSynthesis) {
      SpeechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setIsReadingPage(false);
  }, []);

  const readPageContent = useCallback(() => {
    if (!isTtsSupported) return;

    // Evite le conflit entre dictee et lecture.
    stopVoiceInput();
    stopPageReading();

    const parts = [
      t("signIn.readPagePart1"),
      t("signIn.readPagePart2"),
      t("signIn.readPagePart3"),
      t("signIn.readPagePart4"),
      t("signIn.readPagePart5"),
      t("signIn.readPagePart6"),
      t("signIn.readPagePart7"),
    ];

    const utterance = new SpeechSynthesisUtterance(parts.join(" "));
    utterance.lang = i18n.language?.startsWith("fr")
      ? "fr-FR"
      : i18n.language?.startsWith("ar")
        ? "ar-SA"
        : "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => {
      utteranceRef.current = null;
      setIsReadingPage(false);
    };
    utterance.onerror = () => {
      utteranceRef.current = null;
      setIsReadingPage(false);
      setSpeechError(t("signIn.ttsReadError"));
    };

    utteranceRef.current = utterance;
    setIsReadingPage(true);
    SpeechSynthesis.speak(utterance);
  }, [isTtsSupported, stopPageReading, stopVoiceInput, t, i18n.language]);

  useEffect(() => {
    localStorage.setItem(LARGE_TEXT_STORAGE_KEY, largeTextEnabled ? "1" : "0");
  }, [largeTextEnabled]);

  useEffect(() => {
    return () => {
      stopPageReading();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      if (faceStreamRef.current) {
        faceStreamRef.current.getTracks().forEach((track) => track.stop());
        faceStreamRef.current = null;
      }
      if (faceAutoLoginTimerRef.current) {
        clearInterval(faceAutoLoginTimerRef.current);
        faceAutoLoginTimerRef.current = null;
      }
      setListeningField(null);
    };
  }, [stopPageReading]);

  useEffect(() => {
    const bindStreamToVideo = async () => {
      if (!faceCameraOn || !faceStreamRef.current || !faceVideoRef.current) return;
      try {
        faceVideoRef.current.srcObject = faceStreamRef.current;
        await faceVideoRef.current.play().catch(() => {});
        if (faceVideoRef.current.videoWidth > 0) {
          setFaceCameraReady(true);
        }
      } catch {
        setFaceCameraError(t("signIn.faceStreamError"));
      }
    };
    bindStreamToVideo();
  }, [faceCameraOn, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      try {
        const data = await authApi.doctorLogin(email, password);
        clearMedifollowSessionExcept("doctor");
        localStorage.setItem("doctorToken", data.access_token);
        localStorage.setItem("doctorUser", JSON.stringify(data.user));
        navigate("/dashboard");
        window.location.reload();
        return;
      } catch {
        try {
          const data = await authApi.patientLogin(email, password);
          clearMedifollowSessionExcept("patient");
          localStorage.setItem("patientToken", data.access_token);
          localStorage.setItem("patientUser", JSON.stringify(data.user));
          navigate("/dashboard-pages/patient-dashboard");
          window.location.reload();
          return;
        } catch {
          try {
            const data = await authApi.nurseLogin(email, password);
            clearMedifollowSessionExcept("nurse");
            localStorage.setItem("nurseToken", data.access_token);
            localStorage.setItem("nurseUser", JSON.stringify(data.user));
            navigate("/dashboard-pages/nurse-dashboard");
            window.location.reload();
            return;
          } catch {
            const data = await authApi.staffLogin(email, password);
            clearMedifollowSessionExcept("admin");
            localStorage.setItem("adminToken", data.access_token);
            localStorage.setItem("adminUser", JSON.stringify(data.user));
            const role = data.user?.role;
            const path = role === "auditor" ? "/auditor/dashboard" : "/dashboard-pages/care-coordinator-dashboard";
            window.location.href = path;
          }
        }
      }
    } catch (err) {
      setError(err.message || t("signIn.loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  const finalizeRoleLogin = useCallback((data) => {
    const role = data?.user?.role;
    if (role === "doctor") {
      clearMedifollowSessionExcept("doctor");
      localStorage.setItem("doctorToken", data.access_token);
      localStorage.setItem("doctorUser", JSON.stringify(data.user));
      navigate("/dashboard");
      window.location.reload();
      return;
    }
    if (role === "patient") {
      clearMedifollowSessionExcept("patient");
      localStorage.setItem("patientToken", data.access_token);
      localStorage.setItem("patientUser", JSON.stringify(data.user));
      navigate("/dashboard-pages/patient-dashboard");
      window.location.reload();
      return;
    }
    if (role === "nurse") {
      clearMedifollowSessionExcept("nurse");
      localStorage.setItem("nurseToken", data.access_token);
      localStorage.setItem("nurseUser", JSON.stringify(data.user));
      navigate("/dashboard-pages/nurse-dashboard");
      window.location.reload();
      return;
    }
    if (role === "auditor" || role === "carecoordinator") {
      clearMedifollowSessionExcept("admin");
      localStorage.setItem("adminToken", data.access_token);
      localStorage.setItem("adminUser", JSON.stringify(data.user));
      const path = role === "auditor" ? "/auditor/dashboard" : "/dashboard-pages/care-coordinator-dashboard";
      window.location.href = path;
      return;
    }
    setError(t("signIn.roleNotSupported"));
  }, [navigate, t]);

  const stopFaceCamera = useCallback(() => {
    if (faceAutoLoginTimerRef.current) {
      clearInterval(faceAutoLoginTimerRef.current);
      faceAutoLoginTimerRef.current = null;
    }
    if (faceStreamRef.current) {
      faceStreamRef.current.getTracks().forEach((track) => track.stop());
      faceStreamRef.current = null;
    }
    if (faceVideoRef.current) {
      faceVideoRef.current.srcObject = null;
    }
    setFaceCameraReady(false);
    setFaceCameraBooting(false);
    setFaceCameraOn(false);
    setShowFaceNotEnrolledPopup(false);
    faceAutoLoginBusyRef.current = false;
    faceAutoLoginDoneRef.current = false;
    faceNotEnrolledPopupShownRef.current = false;
  }, []);

  const startFaceCamera = useCallback(async () => {
    setFaceCameraError("");
    setFaceCameraBooting(true);
    setFaceCameraReady(false);
    setShowFaceNotEnrolledPopup(false);
    faceAutoLoginBusyRef.current = false;
    faceAutoLoginDoneRef.current = false;
    faceNotEnrolledPopupShownRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      faceStreamRef.current = stream;
      setFaceCameraOn(true);
    } catch (err) {
      setFaceCameraError(err?.message || t("signIn.faceCameraDenied"));
      setFaceCameraOn(false);
      setFaceCameraReady(false);
    } finally {
      setFaceCameraBooting(false);
    }
  }, [t]);

  const handleFaceCameraSignIn = useCallback(async (options = { auto: false }) => {
    if (faceAutoLoginBusyRef.current || faceLoading) {
      return;
    }
    if (!faceVideoRef.current) {
      if (!options.auto) {
        setError(t("signIn.faceOpenCameraFirst"));
      }
      return;
    }
    faceAutoLoginBusyRef.current = true;
    setFaceLoading(true);
    setFaceCameraError("");
    setError("");
    try {
      const descriptor = await captureFaceDescriptor(faceVideoRef.current);
      const data = await authApi.faceLogin(descriptor, email || undefined);
      if (data?.requiresEnrollment) {
        if (!faceNotEnrolledPopupShownRef.current) {
          faceNotEnrolledPopupShownRef.current = true;
          setShowFaceNotEnrolledPopup(true);
        }
        faceAutoLoginDoneRef.current = true;
        return;
      }
      faceAutoLoginDoneRef.current = true;
      finalizeRoleLogin(data);
    } catch (err) {
      const message = err?.message || t("signIn.faceLoginFailed");
      if (isFaceNotEnrolledError(message) && !faceNotEnrolledPopupShownRef.current) {
        faceNotEnrolledPopupShownRef.current = true;
        faceAutoLoginDoneRef.current = true;
        setShowFaceNotEnrolledPopup(true);
      }
      if (!options.auto) {
        setError(message);
      } else if (!/visage non reconnu|face not recognized/i.test(message) && !isFaceNotEnrolledError(message)) {
        setFaceCameraError(message);
      }
    } finally {
      setFaceLoading(false);
      faceAutoLoginBusyRef.current = false;
    }
  }, [email, finalizeRoleLogin, faceLoading, isFaceNotEnrolledError, t]);

  useEffect(() => {
    if (!faceCameraOn || !faceCameraReady) return;
    if (faceAutoLoginTimerRef.current) {
      clearInterval(faceAutoLoginTimerRef.current);
      faceAutoLoginTimerRef.current = null;
    }
    faceAutoLoginTimerRef.current = setInterval(() => {
      if (!faceCameraOn || !faceCameraReady) return;
      if (faceAutoLoginDoneRef.current || faceAutoLoginBusyRef.current || faceLoading) return;
      handleFaceCameraSignIn({ auto: true });
    }, 1800);

    return () => {
      if (faceAutoLoginTimerRef.current) {
        clearInterval(faceAutoLoginTimerRef.current);
        faceAutoLoginTimerRef.current = null;
      }
    };
  }, [faceCameraOn, faceCameraReady, faceLoading, handleFaceCameraSignIn]);

  return (
    <>
      <section className={`sign-in-page d-md-flex align-items-center custom-auth-height ${largeTextEnabled ? "a11y-large-text" : ""}`}>
        <Container className="sign-in-page-bg mt-5 mb-md-5 mb-0 p-0">
          <Row>
            <Col md={6} className="text-center z-2">
              <div className="sign-in-detail text-white">
                <Link to="/" className="sign-in-logo mb-2">
                  <img src={generatePath("assets/images/logosite.png")} className="img-fluid" alt={t("signIn.logoAlt")} style={{ maxWidth: "320px", maxHeight: "100px", objectFit: "contain" }} />
                </Link>
                <AuthCarouselMedifollow
                  interval={4000}
                  captionKeys={{ titleKey: "signIn.carouselTitle", descKey: "signIn.carouselDesc" }}
                />
              </div>
            </Col>
            <Col md={6} className="position-relative z-2">
              <div className="sign-in-from d-flex flex-column justify-content-center">
                <h1 className="mb-0">{t("signIn.pageTitle")}</h1>
                <Form className="mt-4" onSubmit={handleSubmit}>
                  <p>{t("signIn.intro")}</p>
                  {error && (
                    <div className="alert alert-danger py-2" role="alert">
                      {error}
                    </div>
                  )}
                  {speechError && (
                    <div className="alert alert-warning py-2 small" role="alert">
                      {speechError}
                    </div>
                  )}
                  <div className="a11y-toolbar mb-3">
                    <div className="a11y-toolbar-title">{t("signIn.a11yToolbarTitle")}</div>
                    <div className="a11y-toolbar-actions d-flex gap-2 flex-wrap">
                      <button
                        type="button"
                        className={`btn btn-sm a11y-btn ${largeTextEnabled ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => setLargeTextEnabled((v) => !v)}
                        data-eye-clickable
                      >
                        <i className="ri-font-size me-1"></i>
                        {largeTextEnabled ? t("signIn.largeTextDisable") : t("signIn.largeTextEnable")}
                      </button>
                      {isTtsSupported && (
                        <button
                          type="button"
                          className={`btn btn-sm a11y-btn ${isReadingPage ? "btn-danger" : "btn-outline-secondary"}`}
                          onClick={isReadingPage ? stopPageReading : readPageContent}
                          data-eye-clickable
                        >
                          <i className={`me-1 ${isReadingPage ? "ri-volume-mute-line" : "ri-volume-up-line"}`}></i>
                          {isReadingPage ? t("signIn.stopReading") : t("signIn.readPage")}
                        </button>
                      )}
                    </div>
                    <span className="visually-hidden" aria-live="polite">
                      {isReadingPage ? t("signIn.voiceAssistantReading") : t("signIn.voiceAssistantReady")}
                    </span>
                  </div>
                  {isSpeechSupported && (
                    <p className="text-muted small mb-2">{t("signIn.speechHint")}</p>
                  )}
                  {isSpeechSupported && listeningField && (
                    <div className="alert alert-info py-2 small d-flex align-items-center justify-content-between" role="alert">
                      <span>
                        {t("signIn.micActive", {
                          field:
                            listeningField === "email" ? t("signIn.fieldEmail") : t("signIn.fieldPassword"),
                        })}
                      </span>
                      <button type="button" className="btn btn-sm btn-outline-danger ms-2" onClick={stopVoiceInput} data-eye-clickable>
                        {t("signIn.stopMic")}
                      </button>
                    </div>
                  )}
                  {handError && (
                    <div className="alert alert-warning py-2 small" role="alert">
                      {handError}
                      <button type="button" className="btn-close btn-sm float-end" onClick={() => setHandError("")} aria-label={t("signIn.closeAria")} />
                    </div>
                  )}
                  <div className="assist-actions d-flex gap-2 flex-wrap align-items-center mb-2">
                    {!handActive ? (
                      <button type="button" className="btn btn-sm assist-btn assist-btn-hand" onClick={startHandGesture}>
                        <i className="ri-camera-line me-1"></i>
                        {t("signIn.startHandNav")}
                      </button>
                    ) : (
                      <button type="button" className="btn btn-sm assist-btn assist-btn-hand is-active" onClick={stopHandGesture}>
                        <i className="ri-camera-off-line me-1"></i>
                        {t("signIn.stopHandNav")}
                      </button>
                    )}
                    <button
                      type="button"
                      className={`btn btn-sm assist-btn assist-btn-face ${faceCameraOn ? "is-active" : ""}`}
                      onClick={faceCameraOn ? stopFaceCamera : startFaceCamera}
                      disabled={faceLoading || faceCameraBooting}
                      data-eye-clickable
                    >
                      <i className={`me-1 ${faceCameraOn ? "ri-camera-off-line" : "ri-camera-line"}`}></i>
                      {faceCameraOn
                        ? t("signIn.closeFaceCamera")
                        : faceCameraBooting
                          ? t("signIn.opening")
                          : t("signIn.openFaceCamera")}
                    </button>
                    {faceCameraOn && (
                      <span className="badge text-bg-light border align-self-center">
                        {faceLoading ? t("signIn.faceAnalyzing") : t("signIn.faceAutoLoginActive")}
                      </span>
                    )}
                  </div>
                  {faceCameraError && (
                    <div className="alert alert-warning py-2 small" role="alert">
                      {faceCameraError}
                    </div>
                  )}
                  {faceCameraOn && (
                    <div className="mb-2">
                      <div
                        style={{
                          width: "100%",
                          minHeight: 220,
                          borderRadius: 10,
                          border: "1px solid rgba(0,0,0,0.15)",
                          background: "#111",
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        <video
                          ref={faceVideoRef}
                          autoPlay
                          muted
                          playsInline
                          onLoadedData={() => setFaceCameraReady(true)}
                          style={{ width: "100%", minHeight: 220, objectFit: "cover", display: "block" }}
                        />
                        {!faceCameraReady ? (
                          <div
                            className="text-white d-flex align-items-center justify-content-center"
                            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }}
                          >
                            {t("signIn.initCamera")}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                  <p className="text-muted small mb-2" style={{ fontSize: "0.75rem" }}>
                    {t("signIn.handNavHelp")}
                  </p>
                  <div className="form-group mb-3">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <label htmlFor="exampleInputEmail1" className="mb-0">{t("signIn.email")}</label>
                    </div>
                    <div className="position-relative">
                      <Form.Control
                        type="email"
                        className="form-control pe-5"
                        id="exampleInputEmail1"
                        placeholder={t("signIn.emailPlaceholder")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        data-eye-clickable
                      />
                      {isSpeechSupported && (
                        <button
                          type="button"
                          className={`btn btn-sm ${listeningField === "email" ? "btn-danger" : "btn-outline-primary"}`}
                          onClick={() => listeningField === "email" ? stopVoiceInput() : startVoiceInput("email")}
                          data-eye-clickable
                          aria-label={t("signIn.micEmailAria")}
                          style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", zIndex: 2 }}
                        >
                          <i className={listeningField === "email" ? "ri-mic-off-line" : "ri-mic-line"}></i>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="form-group mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <label htmlFor="exampleInputPassword1">{t("signIn.password")}</label>
                      <Link to="/auth/recover-password" className="float-end">{t("signIn.forgotPassword")}</Link>
                    </div>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        id="exampleInputPassword1"
                        className="form-control"
                        style={{ paddingRight: isSpeechSupported ? "72px" : "40px" }}
                        placeholder={t("signIn.passwordPlaceholder")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        data-eye-clickable
                      />
                      <div style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", zIndex: 2, display: "flex", gap: "4px" }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? t("signIn.hidePasswordAria") : t("signIn.showPasswordAria")}
                          data-eye-clickable
                          title={showPassword ? t("signIn.hidePassword") : t("signIn.showPassword")}
                        >
                          <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
                        </button>
                        {isSpeechSupported && (
                          <button
                            type="button"
                            className={`btn btn-sm ${listeningField === "password" ? "btn-danger" : "btn-outline-primary"}`}
                            onClick={() => listeningField === "password" ? stopVoiceInput() : startVoiceInput("password")}
                            data-eye-clickable
                            aria-label={t("signIn.micPasswordAria")}
                          >
                            <i className={listeningField === "password" ? "ri-mic-off-line" : "ri-mic-line"}></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="d-flex w-100 justify-content-between align-items-center mt-3">
                    <label className="d-inline-block form-group mb-0 d-flex">
                      <input
                        type="checkbox"
                        id="customCheck1"
                        className="custom-control-input me-1"
                      />
                      <label className="custom-control-label" htmlFor="customCheck1">{t("signIn.rememberMe")}</label>
                    </label>
                    <button type="submit" className="btn btn-primary-subtle float-end" disabled={loading} data-eye-clickable>
                      {loading ? t("signIn.signingIn") : t("signIn.signInButton")}
                    </button>
                  </div>
                  <div className="sign-info d-flex justify-content-between flex-column flex-lg-row align-items-center mt-3">
                    <span className="dark-color d-inline-block line-height-2">
                      <Link to="/auth/lock-screen">{t("signIn.adminLogin")}</Link>
                      <span className="mx-2">|</span>
                      {t("signIn.noAccount")}{" "}
                      <Link to="/auth/sign-up">{t("signIn.signUp")}</Link>
                    </span>
                    <ul className="auth-social-media">
                      <li><a href="#"><i className="ri-facebook-box-line"></i></a></li>
                      <li><a href="#"><i className="ri-twitter-line"></i></a></li>
                      <li><a href="#"><i className="ri-instagram-line"></i></a></li>
                    </ul>
                  </div>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      <Modal show={showFaceNotEnrolledPopup} onHide={() => setShowFaceNotEnrolledPopup(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t("signIn.faceNotEnrolledTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{t("signIn.faceNotEnrolledBody")}</Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-primary" onClick={() => setShowFaceNotEnrolledPopup(false)}>
            {t("signIn.understood")}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default SignIn
import React, { useState, useRef, useCallback, useEffect } from "react";
import { Carousel, Container, Row, Col, Form, Modal } from 'react-bootstrap';
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../services/api";
import { useHandGesture } from "../../context/HandGestureContext";
import { captureFaceDescriptor } from "../../services/face-auth";

const generatePath = (path) => {
  return window.origin + import.meta.env.BASE_URL + path;
};

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechSynthesis = window.speechSynthesis;
const isSpeechSupported = !!SpeechRecognition;
const isTtsSupported = !!SpeechSynthesis;
const LARGE_TEXT_KEY = "medifollow_large_text_signin";

const KEYWORD_STOP = ["stop", "terminer", "arrêt", "arrêter", "finish", "fin"];

const isKeywordMatch = (text, keywords) => {
  const t = text.trim().toLowerCase();
  return keywords.some((kw) => t === kw || t.endsWith(" " + kw) || t.startsWith(kw + " "));
};

const SignIn = () => {
  const navigate = useNavigate();
  const { isActive: handActive, startHandGesture, stopHandGesture, error: handError, setError: setHandError } = useHandGesture();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [largeTextEnabled, setLargeTextEnabled] = useState(() => localStorage.getItem(LARGE_TEXT_KEY) === "1");
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
    return text.includes("aucun visage enregistre");
  }, []);

  const startVoiceInput = useCallback((field) => {
    if (!isSpeechSupported) {
      setSpeechError("La reconnaissance vocale n'est pas supportée par votre navigateur. Utilisez Chrome ou Edge.");
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
    recognition.lang = "fr-FR";

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
        setSpeechError(event.error === "not-allowed" ? "Microphone non autorisé. Autorisez l'accès au micro." : `Erreur: ${event.error}`);
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
  }, []);

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
      "Assistant vocal d'accessibilite active.",
      "Bienvenue sur la page de connexion MediFollow.",
      "Etape 1 : saisissez votre email puis votre mot de passe.",
      "Etape 2 : vous pouvez utiliser la lecture vocale, la navigation par doigts et la connexion avec le visage.",
      "Astuce : utilisez l'icone micro dans les champs pour la dictee manuelle.",
      "Commande vocale disponible : dites stop pour arreter la dictee en cours.",
      "Etape finale : cliquez sur le bouton Sign In pour ouvrir votre session.",
    ];

    const utterance = new SpeechSynthesisUtterance(parts.join(" "));
    utterance.lang = "fr-FR";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => {
      utteranceRef.current = null;
      setIsReadingPage(false);
    };
    utterance.onerror = () => {
      utteranceRef.current = null;
      setIsReadingPage(false);
      setSpeechError("Lecture vocale indisponible sur ce navigateur.");
    };

    utteranceRef.current = utterance;
    setIsReadingPage(true);
    SpeechSynthesis.speak(utterance);
  }, [isTtsSupported, stopPageReading, stopVoiceInput]);

  useEffect(() => {
    localStorage.setItem(LARGE_TEXT_KEY, largeTextEnabled ? "1" : "0");
  }, [largeTextEnabled, LARGE_TEXT_KEY]);

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
        setFaceCameraError("Impossible d'afficher le flux camera.");
      }
    };
    bindStreamToVideo();
  }, [faceCameraOn]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      try {
        const data = await authApi.doctorLogin(email, password);
        localStorage.setItem("doctorToken", data.access_token);
        localStorage.setItem("doctorUser", JSON.stringify(data.user));
        navigate("/dashboard");
        window.location.reload();
        return;
      } catch (doctorErr) {
        try {
          const data = await authApi.patientLogin(email, password);
          localStorage.setItem("patientToken", data.access_token);
          localStorage.setItem("patientUser", JSON.stringify(data.user));
          navigate("/dashboard-pages/patient-dashboard");
          window.location.reload();
          return;
        } catch (patientErr) {
          const data = await authApi.nurseLogin(email, password);
          localStorage.setItem("nurseToken", data.access_token);
          localStorage.setItem("nurseUser", JSON.stringify(data.user));
          navigate("/dashboard-pages/nurse-dashboard");
          window.location.reload();
        }
      }
    } catch (err) {
      setError(err.message || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  const finalizeRoleLogin = useCallback((data) => {
    const role = data?.user?.role;
    if (role === "doctor") {
      localStorage.setItem("doctorToken", data.access_token);
      localStorage.setItem("doctorUser", JSON.stringify(data.user));
      navigate("/dashboard");
      window.location.reload();
      return;
    }
    if (role === "patient") {
      localStorage.setItem("patientToken", data.access_token);
      localStorage.setItem("patientUser", JSON.stringify(data.user));
      navigate("/dashboard-pages/patient-dashboard");
      window.location.reload();
      return;
    }
    if (role === "nurse") {
      localStorage.setItem("nurseToken", data.access_token);
      localStorage.setItem("nurseUser", JSON.stringify(data.user));
      navigate("/dashboard-pages/nurse-dashboard");
      window.location.reload();
      return;
    }
    setError("Role non supporte");
  }, [navigate]);

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
      setFaceCameraError(err?.message || "Impossible d'acceder a la camera.");
      setFaceCameraOn(false);
      setFaceCameraReady(false);
    } finally {
      setFaceCameraBooting(false);
    }
  }, []);

  const handleFaceCameraSignIn = useCallback(async (options = { auto: false }) => {
    if (faceAutoLoginBusyRef.current || faceLoading) {
      return;
    }
    if (!faceVideoRef.current) {
      if (!options.auto) {
        setError("Ouvrez la camera puis reessayez.");
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
      const message = err?.message || "Connexion visage echouee.";
      if (isFaceNotEnrolledError(message) && !faceNotEnrolledPopupShownRef.current) {
        faceNotEnrolledPopupShownRef.current = true;
        faceAutoLoginDoneRef.current = true;
        setShowFaceNotEnrolledPopup(true);
      }
      if (!options.auto) {
        setError(message);
      } else if (message.toLowerCase() !== "visage non reconnu" && !isFaceNotEnrolledError(message)) {
        setFaceCameraError(message);
      }
    } finally {
      setFaceLoading(false);
      faceAutoLoginBusyRef.current = false;
    }
  }, [email, finalizeRoleLogin, faceLoading, isFaceNotEnrolledError]);

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
                  <img src={generatePath("/assets/images/logosite.png")} className="img-fluid" alt="Logo" style={{ maxWidth: "320px", maxHeight: "100px", objectFit: "contain" }} />
                </Link>
                <Carousel id="carouselExampleCaptions" interval={4000} controls={false}>
                  <Carousel.Item>
                    <img src={generatePath("/assets/images/login/image_signin_signup.png")} className="d-block w-100" alt="Slide 1" />
                    <div className="carousel-caption-container">
                      <h4 className="mb-1 mt-3 text-white">Manage your orders</h4>
                      <p className="pb-5">It is a long established fact that a reader will be distracted by the readable content.</p>
                    </div>
                  </Carousel.Item>
                  <Carousel.Item>
                    <img src={generatePath("/assets/images/login/signin1.png")} className="d-block w-100" alt="Slide 2" />
                    <div className="carousel-caption-container">
                      <h4 className="mb-1 mt-3 text-white">Manage your orders</h4>
                      <p className="pb-5">It is a long established fact that a reader will be distracted by the readable content.</p>
                    </div>
                  </Carousel.Item>
                  <Carousel.Item>
                    <img src={generatePath("/assets/images/login/signin2.png")} className="d-block w-100" alt="Slide 3" />
                    <div className="carousel-caption-container">
                      <h4 className="mb-1 mt-3 text-white">Manage your orders</h4>
                      <p className="pb-5">It is a long established fact that a reader will be distracted by the readable content.</p>
                    </div>
                  </Carousel.Item>
                </Carousel>
              </div>
            </Col>
            <Col md={6} className="position-relative z-2">
              <div className="sign-in-from d-flex flex-column justify-content-center">
                <h1 className="mb-0">Sign In</h1>
                <Form className="mt-4" onSubmit={handleSubmit}>
                  <p>Entrez votre email et mot de passe pour accéder à votre espace MediFollow (médecin, patient ou infirmier).</p>
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
                    <div className="a11y-toolbar-title">Accessibilite rapide</div>
                    <div className="a11y-toolbar-actions d-flex gap-2 flex-wrap">
                      <button
                        type="button"
                        className={`btn btn-sm a11y-btn ${largeTextEnabled ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => setLargeTextEnabled((v) => !v)}
                        data-eye-clickable
                      >
                        <i className="ri-font-size me-1"></i>
                        {largeTextEnabled ? "Texte normal" : "Grand texte"}
                      </button>
                      {isTtsSupported && (
                        <button
                          type="button"
                          className={`btn btn-sm a11y-btn ${isReadingPage ? "btn-danger" : "btn-outline-secondary"}`}
                          onClick={isReadingPage ? stopPageReading : readPageContent}
                          data-eye-clickable
                        >
                          <i className={`me-1 ${isReadingPage ? "ri-volume-mute-line" : "ri-volume-up-line"}`}></i>
                          {isReadingPage ? "Arreter la lecture" : "Lire la page"}
                        </button>
                      )}
                    </div>
                    <span className="visually-hidden" aria-live="polite">
                      {isReadingPage ? "Assistant vocal en cours de lecture." : "Assistant vocal prêt."}
                    </span>
                  </div>
                  {isSpeechSupported && (
                    <p className="text-muted small mb-2">
                      Accessibilité : utilisez les boutons micro pour l'enregistrement manuel. Dites <strong>« stop »</strong> pour arrêter.
                    </p>
                  )}
                  {isSpeechSupported && listeningField && (
                    <div className="alert alert-info py-2 small d-flex align-items-center justify-content-between" role="alert">
                      <span>Micro actif ({listeningField === "email" ? "Email" : "Mot de passe"})</span>
                      <button type="button" className="btn btn-sm btn-outline-danger ms-2" onClick={stopVoiceInput} data-eye-clickable>
                        Arrêter micro
                      </button>
                    </div>
                  )}
                  {handError && (
                    <div className="alert alert-warning py-2 small" role="alert">
                      {handError}
                      <button type="button" className="btn-close btn-sm float-end" onClick={() => setHandError("")} aria-label="Fermer" />
                    </div>
                  )}
                  <div className="assist-actions d-flex gap-2 flex-wrap align-items-center mb-2">
                    {!handActive ? (
                      <button type="button" className="btn btn-sm assist-btn assist-btn-hand" onClick={startHandGesture}>
                        <i className="ri-camera-line me-1"></i>Navigation doigts
                      </button>
                    ) : (
                      <button type="button" className="btn btn-sm assist-btn assist-btn-hand is-active" onClick={stopHandGesture}>
                        <i className="ri-camera-off-line me-1"></i>Arreter navigation doigts
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
                      {faceCameraOn ? "Fermer camera visage" : (faceCameraBooting ? "Ouverture..." : "Ouvrir camera visage")}
                    </button>
                    {faceCameraOn && (
                      <span className="badge text-bg-light border align-self-center">
                        {faceLoading ? "Analyse visage..." : "Connexion visage automatique active"}
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
                            Initialisation camera...
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                  <p className="text-muted small mb-2" style={{ fontSize: "0.75rem" }}>
                    <strong>Navigation par doigts :</strong> Pointez avec l&apos;index devant la caméra. Le curseur suit votre doigt. Maintenez 0,8 s sur un élément pour cliquer.
                  </p>
                  <div className="form-group mb-3">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <label htmlFor="exampleInputEmail1" className="mb-0">Email</label>
                    </div>
                    <div className="position-relative">
                      <Form.Control
                        type="email"
                        className="form-control pe-5"
                        id="exampleInputEmail1"
                        placeholder="exemple@email.com"
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
                          aria-label="Micro email"
                          style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", zIndex: 2 }}
                        >
                          <i className={listeningField === "email" ? "ri-mic-off-line" : "ri-mic-line"}></i>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="form-group mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <label htmlFor="exampleInputPassword1">Mot de passe</label>
                      <Link to="/auth/recover-password" className="float-end">Mot de passe oublié ?</Link>
                    </div>
                    <div className="position-relative">
                      <Form.Control
                        type="password"
                        id="exampleInputPassword1"
                        className="form-control pe-5"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        data-eye-clickable
                      />
                      {isSpeechSupported && (
                        <button
                          type="button"
                          className={`btn btn-sm ${listeningField === "password" ? "btn-danger" : "btn-outline-primary"}`}
                          onClick={() => listeningField === "password" ? stopVoiceInput() : startVoiceInput("password")}
                          data-eye-clickable
                          aria-label="Micro mot de passe"
                          style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", zIndex: 2 }}
                        >
                          <i className={listeningField === "password" ? "ri-mic-off-line" : "ri-mic-line"}></i>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="d-flex w-100 justify-content-between align-items-center mt-3">
                    <label className="d-inline-block form-group mb-0 d-flex">
                      <input
                        type="checkbox"
                        id="customCheck1"
                        className="custom-control-input me-1"
                      />
                      <label className="custom-control-label" htmlFor="customCheck1">Remember
                        Me</label>
                    </label>
                    <button type="submit" className="btn btn-primary-subtle float-end" disabled={loading} data-eye-clickable>
                      {loading ? "Signing in..." : "Sign In"}
                    </button>
                  </div>
                  <div className="sign-info d-flex justify-content-between flex-column flex-lg-row align-items-center mt-3">
                    <span className="dark-color d-inline-block line-height-2">
                      <Link to="/auth/lock-screen">Admin Login</Link>
                      <span className="mx-2">|</span>
                      Don&apos;t have an account? <Link to="/auth/sign-up">Sign Up</Link>
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
          <Modal.Title>Visage non enregistré</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Aucun visage n&apos;est enregistré pour ce compte.
          Enregistrez d&apos;abord votre visage dans votre profil pour utiliser la connexion visage.
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-primary" onClick={() => setShowFaceNotEnrolledPopup(false)}>
            Compris
          </button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default SignIn
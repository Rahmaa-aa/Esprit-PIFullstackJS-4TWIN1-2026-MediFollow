import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { doctorApi, patientApi, nurseApi } from '../../../services/api'

// Import From React Bootstrap
import { Col, Container, Dropdown, Nav, Navbar, Row } from 'react-bootstrap'

// Import selectors & action from setting store
import * as SettingSelector from '../../../store/setting/selectors'

// Redux Selector / Action
import { useSelector } from 'react-redux';


// Import Image
import user01 from "/assets/images/user/01.jpg"
import user02 from "/assets/images/user/02.jpg"
import user03 from "/assets/images/user/03.jpg"
import user04 from "/assets/images/user/04.jpg"

import user001 from "/assets/images/user/001.png"

import StaffNotificationsBell from "../../StaffNotificationsBell"
import PatientMedicationNotificationsBell from "../../PatientMedicationNotificationsBell"
import LanguageSwitcher from "../../LanguageSwitcher"
import { SvgFlagTn, SvgFlagDz } from "../../language-flag-svgs"
import { useTranslation } from "react-i18next"
import { LARGE_TEXT_STORAGE_KEY } from "../../../constants/accessibility"
import { getA11yReadablePageText } from "../../../utils/a11yReadPage"
import { useHandGesture } from "../../../context/HandGestureContext"

const generatePath = (path) => {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "") || "";
  const p = (path || "").replace(/^\/+/, "");
  const url = `${window.origin}${base}/${p}`;
  return url.replace(/([^:])\/\/+/g, "$1/");
};
const DEFAULT_ADMIN_PHOTO = generatePath("assets/images/login/Admin_photo.jpeg");

const getAdminPhoto = (adminUser) => {
  if (!adminUser) return null;
  const img = adminUser.profileImage;
  if (img?.startsWith("data:")) return img;
  if (img?.startsWith("http")) return img;
  const path = img?.startsWith("/") ? img.slice(1) : img;
  return path ? generatePath(path) : DEFAULT_ADMIN_PHOTO;
};

const getDoctorPhoto = (doctorUser) => {
  if (!doctorUser) return null;
  const img = doctorUser.profileImage;
  if (img?.startsWith("data:")) return img;
  if (img?.startsWith("http")) return img;
  const path = img?.startsWith("/") ? img.slice(1) : img;
  return path ? generatePath(path) : user001;
};

const getPatientPhoto = (patientUser) => {
  if (!patientUser) return null;
  const img = patientUser.profileImage;
  if (img?.startsWith("data:")) return img;
  if (img?.startsWith("http")) return img;
  const path = img?.startsWith("/") ? img.slice(1) : img;
  return path ? generatePath(path) : user001;
};

const getNursePhoto = (nurseUser) => {
  if (!nurseUser) return null;
  const img = nurseUser.profileImage;
  if (img?.startsWith("data:")) return img;
  if (img?.startsWith("http")) return img;
  const path = img?.startsWith("/") ? img.slice(1) : img;
  return path ? generatePath(path) : user001;
};

const Header = () => {
   const { t, i18n } = useTranslation();
   const navigate = useNavigate();
   const location = useLocation();
   const pageLayout = useSelector(SettingSelector.page_layout)
   const [adminUser, setAdminUser] = useState(() => {
      try {
         const stored = localStorage.getItem("adminUser");
         return stored ? JSON.parse(stored) : null;
      } catch { return null; }
   })
   const [doctorUser, setDoctorUser] = useState(() => {
      try {
         const stored = localStorage.getItem("doctorUser");
         return stored ? JSON.parse(stored) : null;
      } catch { return null; }
   })
   const [patientUser, setPatientUser] = useState(() => {
      try {
         const stored = localStorage.getItem("patientUser");
         return stored ? JSON.parse(stored) : null;
      } catch { return null; }
   })
   const [nurseUser, setNurseUser] = useState(() => {
      try {
         const stored = localStorage.getItem("nurseUser");
         return stored ? JSON.parse(stored) : null;
      } catch { return null; }
   })
   const isDoctor = !!doctorUser;
   const isPatient = !!patientUser;
   const isNurse = !!nurseUser;
   const isAdmin = !!adminUser;
   const currentUser = doctorUser || adminUser || patientUser || nurseUser;

   useEffect(() => {
      const onAdminUpdated = () => {
         try {
            const stored = localStorage.getItem("adminUser");
            setAdminUser(stored ? JSON.parse(stored) : null);
         } catch { setAdminUser(null); }
      };
      const onDoctorUpdated = () => {
         try {
            const stored = localStorage.getItem("doctorUser");
            setDoctorUser(stored ? JSON.parse(stored) : null);
         } catch { setDoctorUser(null); }
      };
      const onPatientUpdated = () => {
         try {
            const stored = localStorage.getItem("patientUser");
            setPatientUser(stored ? JSON.parse(stored) : null);
         } catch { setPatientUser(null); }
      };
      const onNurseUpdated = () => {
         try {
            const stored = localStorage.getItem("nurseUser");
            setNurseUser(stored ? JSON.parse(stored) : null);
         } catch { setNurseUser(null); }
      };
      window.addEventListener("admin-updated", onAdminUpdated);
      window.addEventListener("doctor-updated", onDoctorUpdated);
      window.addEventListener("patient-updated", onPatientUpdated);
      window.addEventListener("patientUserUpdated", onPatientUpdated); // from edit-patient
      window.addEventListener("nurse-updated", onNurseUpdated);
      return () => {
         window.removeEventListener("admin-updated", onAdminUpdated);
         window.removeEventListener("doctor-updated", onDoctorUpdated);
         window.removeEventListener("patient-updated", onPatientUpdated);
         window.removeEventListener("patientUserUpdated", onPatientUpdated);
         window.removeEventListener("nurse-updated", onNurseUpdated);
      };
   }, [])

   useEffect(() => {
      const id = doctorUser?.id;
      if (id) {
         doctorApi.getById(id)
            .then((doctor) => setDoctorUser((prev) => prev ? { ...prev, ...doctor, id: doctor._id || doctor.id } : prev))
            .catch(() => {});
      }
   }, [doctorUser?.id])

   useEffect(() => {
      const id = patientUser?.id;
      if (id) {
         patientApi.getById(id)
            .then((patient) => setPatientUser((prev) => prev ? { ...prev, ...patient, id: patient._id || patient.id } : prev))
            .catch(() => {});
      }
   }, [patientUser?.id])

   useEffect(() => {
      const id = nurseUser?.id;
      if (id) {
         nurseApi.getById(id)
            .then((nurse) => setNurseUser((prev) => prev ? { ...prev, ...nurse, id: nurse._id || nurse.id } : prev))
            .catch(() => {});
      }
   }, [nurseUser?.id])

   const handleSignOut = () => {
      const wasDoctor = !!doctorUser;
      const wasPatient = !!patientUser;
      const wasNurse = !!nurseUser;
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      localStorage.removeItem("doctorToken");
      localStorage.removeItem("doctorUser");
      localStorage.removeItem("patientToken");
      localStorage.removeItem("patientUser");
      localStorage.removeItem("nurseToken");
      localStorage.removeItem("nurseUser");
      setAdminUser(null);
      setDoctorUser(null);
      setPatientUser(null);
      setNurseUser(null);
      window.dispatchEvent(new CustomEvent("user-signed-out"));
      navigate(wasDoctor || wasPatient || wasNurse ? "/auth/sign-in" : "/auth/lock-screen");
   };

   const [open, setOpen] = useState(false)
   const [isScrolled, setIsScrolled] = useState(false);
   const [sessionLargeText, setSessionLargeText] = useState(() => {
      try {
         if (typeof localStorage === "undefined") return false;
         return localStorage.getItem(LARGE_TEXT_STORAGE_KEY) === "1";
      } catch {
         return false;
      }
   });

   const isA11ySession = isPatient || isDoctor || isNurse || isAdmin;

   useEffect(() => {
      if (!isA11ySession) {
         document.body.classList.remove(
            "patient-a11y-large-text",
            "doctor-a11y-large-text",
            "nurse-a11y-large-text",
            "admin-a11y-large-text",
         );
         return;
      }
      try {
         setSessionLargeText(localStorage.getItem(LARGE_TEXT_STORAGE_KEY) === "1");
      } catch {
         setSessionLargeText(false);
      }
   }, [isA11ySession]);

   useEffect(() => {
      if (!isA11ySession) {
         document.body.classList.remove(
            "patient-a11y-large-text",
            "doctor-a11y-large-text",
            "nurse-a11y-large-text",
            "admin-a11y-large-text",
         );
         return;
      }
      document.body.classList.remove(
         "patient-a11y-large-text",
         "doctor-a11y-large-text",
         "nurse-a11y-large-text",
         "admin-a11y-large-text",
      );
      if (sessionLargeText) {
         if (isPatient) document.body.classList.add("patient-a11y-large-text");
         if (isDoctor) document.body.classList.add("doctor-a11y-large-text");
         if (isNurse) document.body.classList.add("nurse-a11y-large-text");
         if (isAdmin) document.body.classList.add("admin-a11y-large-text");
      }
      try {
         localStorage.setItem(LARGE_TEXT_STORAGE_KEY, sessionLargeText ? "1" : "0");
      } catch { /* ignore */ }
   }, [isPatient, isDoctor, isNurse, isAdmin, isA11ySession, sessionLargeText]);

   useEffect(() => {
      if (!isA11ySession) return;
      const onStorage = (e) => {
         if (e.key === LARGE_TEXT_STORAGE_KEY && e.newValue != null) {
            setSessionLargeText(e.newValue === "1");
         }
      };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
   }, [isA11ySession]);

   const ttsSupported = typeof window !== "undefined" && !!window.speechSynthesis;
   const ttsUtteranceRef = useRef(null);
   const [isReadingPage, setIsReadingPage] = useState(false);
   const {
      isActive: handActive,
      startHandGesture,
      stopHandGesture,
      error: handError,
      setError: setHandError,
   } = useHandGesture();

   const stopPageReading = useCallback(() => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
         window.speechSynthesis.cancel();
      }
      ttsUtteranceRef.current = null;
      setIsReadingPage(false);
   }, []);

   const readPageContent = useCallback(() => {
      if (!ttsSupported) return;
      stopPageReading();
      const raw = getA11yReadablePageText().trim();
      const text = raw || t("nav.a11yReadPageEmpty");
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = i18n.language?.startsWith("fr")
         ? "fr-FR"
         : i18n.language?.startsWith("ar")
            ? "ar-SA"
            : "en-US";
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.onend = () => {
         ttsUtteranceRef.current = null;
         setIsReadingPage(false);
      };
      utterance.onerror = () => {
         ttsUtteranceRef.current = null;
         setIsReadingPage(false);
      };
      ttsUtteranceRef.current = utterance;
      setIsReadingPage(true);
      window.speechSynthesis.speak(utterance);
   }, [ttsSupported, stopPageReading, t, i18n.language]);

   useEffect(() => {
      stopPageReading();
   }, [location.pathname, stopPageReading]);

   useEffect(() => {
      return () => stopPageReading();
   }, [stopPageReading]);

   useEffect(() => {
      const handleScrolld = () => {
         if (window.scrollY >= 75) {
            setIsScrolled(true);
         } else {
            setIsScrolled(false);
         }
      };

      window.addEventListener('scroll', handleScrolld);

      // Cleanup event listener on component unmount
      return () => {
         window.removeEventListener('scroll', handleScrolld);
      };
   }, [])


   // Fullscreen Functionality
   const [isFullScreen, setIsFullScreen] = useState(false);

   const toggleFullScreen = () => {
      if (!document.fullscreenElement &&
         !document.mozFullScreenElement &&
         !document.webkitFullscreenElement &&
         !document.msFullscreenElement) {
         // Request fullscreen
         if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
         } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
         } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
         } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
         }
         setIsFullScreen(true);
      } else {
         // Exit fullscreen
         if (document.exitFullscreen) {
            document.exitFullscreen();
         } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
         } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
         } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
         }
         setIsFullScreen(false);
      }
   };


   const handleSidebar = () => {
      let aside = document.getElementsByTagName("ASIDE")[0];
      if (aside) {
         if (!aside.classList.contains('sidebar-mini')) {
            aside.classList.toggle("sidebar-mini");
            aside.classList.toggle("sidebar-hover");
         } else {
            aside.classList.remove("sidebar-mini")
            aside.classList.remove("sidebar-hover");
         }

         if (window.innerWidth < 990) {
            if (!aside.classList.contains('sidebar-mini')) {
               aside.classList.remove("sidebar-mini")
               aside.classList.toggle("sidebar-hover");
            }
         }
      }
   }

   return (
      <>
         {/* <Navbar> */}
         <Navbar className={`nav navbar-expand-xl navbar-light iq-navbar pt-2 pb-2 px-2 iq-header ${isScrolled ? "fixed-header" : ""} ${pageLayout === 'container-fluid' ? "" : "container-box"}`} id="boxid">
            <Container fluid className="navbar-inner">
               {isA11ySession && (
                  <span id="header-hand-nav-help" className="visually-hidden">
                     {t("nav.handNavHelp")}
                  </span>
               )}
               <Row className="flex-grow-1">
                  <Col lg={4} md={6} className="align-items-center d-flex">
                     <Nav.Item as="li" className="nav-item dropdown search-width pt-2 pt-lg-0">
                        <div className="form-group input-group mb-0 search-input">
                           <input type="text" className="form-control"
                              placeholder={t("nav.searchPlaceholder")} />{" "}
                           <span className="input-group-text">
                              <svg className="icon-20 text-primary" width="20" height="20"
                                 viewBox="0 0 24 24" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                 <circle cx="11.7669" cy="11.7666" r="8.98856"
                                    stroke="currentColor" strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"></circle>
                                 <path d="M18.0186 18.4851L21.5426 22"
                                    stroke="currentColor" strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"></path>
                              </svg>
                           </span>
                        </div>
                     </Nav.Item>
                  </Col>
                  <Col lg={8} md={6}
                     className="d-flex justify-content-end align-items-center">
                     <span
                        className="d-inline-flex align-items-center gap-1 me-2 flex-shrink-0"
                        title={t("nav.regionFlagsTitle")}
                        role="img"
                        aria-label={t("nav.regionFlagsTitle")}
                     >
                        <SvgFlagTn width={26} />
                        <SvgFlagDz width={26} />
                     </span>
                     <LanguageSwitcher toggleClassName="nav-link d-none d-xl-block" />
                     {isA11ySession && (
                        <Nav.Item as="li" className="nav-item d-none d-xl-flex align-items-center gap-1 ms-1 flex-wrap">
                           <button
                              type="button"
                              className={`btn btn-sm a11y-btn ${sessionLargeText ? "btn-primary" : "btn-outline-primary"}`}
                              data-eye-clickable
                              aria-pressed={sessionLargeText}
                              onClick={() => setSessionLargeText((v) => !v)}
                           >
                              <i className="ri-font-size me-1"></i>
                              {sessionLargeText ? t("signIn.largeTextDisable") : t("signIn.largeTextEnable")}
                           </button>
                           {ttsSupported && (
                              <button
                                 type="button"
                                 className={`btn btn-sm a11y-btn ${isReadingPage ? "btn-danger" : "btn-outline-secondary"}`}
                                 data-eye-clickable
                                 aria-pressed={isReadingPage}
                                 onClick={isReadingPage ? stopPageReading : readPageContent}
                              >
                                 <i className={`me-1 ${isReadingPage ? "ri-volume-mute-line" : "ri-volume-up-line"}`}></i>
                                 {isReadingPage ? t("signIn.stopReading") : t("signIn.readPage")}
                              </button>
                           )}
                           <span className="d-inline-flex align-items-center" role="group" aria-label={t("nav.assistHandGroupLabel")}>
                              {!handActive ? (
                                 <button
                                    type="button"
                                    className="btn btn-sm assist-btn assist-btn-hand"
                                    onClick={startHandGesture}
                                    aria-describedby="header-hand-nav-help"
                                    data-eye-clickable
                                 >
                                    <i className="ri-camera-line me-1" aria-hidden="true"></i>
                                    {t("signIn.startHandNav")}
                                 </button>
                              ) : (
                                 <button
                                    type="button"
                                    className="btn btn-sm assist-btn assist-btn-hand is-active"
                                    onClick={stopHandGesture}
                                    aria-pressed="true"
                                    aria-describedby="header-hand-nav-help"
                                    data-eye-clickable
                                 >
                                    <i className="ri-camera-off-line me-1" aria-hidden="true"></i>
                                    {t("signIn.stopHandNav")}
                                 </button>
                              )}
                           </span>
                        </Nav.Item>
                     )}
                     <Nav.Item as="li" className="nav-item iq-full-screen d-none d-xl-block"
                        id="fullscreen-item">
                        <a href="#" className="nav-link" id="btnFullscreen" onClick={toggleFullScreen}>
                           <i className={`ri-fullscreen-line normal-screen ${isFullScreen ? 'd-none' : ""}`}></i>
                           <i className={`ri-fullscreen-exit-line full-normal-screen ${isFullScreen ? '' : " d-none"}`}></i>
                        </a>
                     </Nav.Item>
                     {(isDoctor || isNurse) ? (
                        <StaffNotificationsBell role={isDoctor ? "doctor" : "nurse"} />
                     ) : isPatient ? (
                        <PatientMedicationNotificationsBell />
                     ) : isAdmin ? (
                        <StaffNotificationsBell role="admin" />
                     ) : (
                     <Dropdown as="li" className="nav-item">
                        <Dropdown.Toggle bsPrefix=' ' as="a" to="#" className="nav-link d-none d-xl-block"
                           id="notification-drop" data-bs-toggle="dropdown">
                           <i className="ri-notification-4-line"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu drop={'start'} as="div" className="p-0 sub-drop dropdown-menu-end"
                           aria-labelledby="notification-drop">
                           <div className="m-0 -none card">
                              <div
                                 className="py-3 card-header d-flex justify-content-between bg-primary mb-0 rounded-top-3">
                                 <div className="header-title w-100">
                                    <h5
                                       className="mb-0 text-white d-flex justify-content-between">All
                                       Notifications <small
                                          className="badge text-bg-light  pt-1">4</small></h5>
                                 </div>
                              </div>
                              <div className="p-0 card-body">
                                 <a href="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img className="p-1 avatar-40 "
                                          src={user01} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">Emma Watson Bni</h6>
                                          <div className="d-flex justify-content-between">
                                             <p className="mb-0">95 MB</p>
                                             <small className="float-end font-size-12">Just
                                                Now</small>
                                          </div>
                                       </div>

                                    </div>
                                 </a>
                                 <a href="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img className="p-1 avatar-40 "
                                          src={user02} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">New customer is join</h6>
                                          <div className="d-flex justify-content-between">
                                             <p className="mb-0">Jond Bini</p>
                                             <small className="float-end font-size-12">Just
                                                Now</small>
                                          </div>
                                       </div>

                                    </div>
                                 </a>
                                 <a href="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img className="p-1 avatar-40 "
                                          src={user03} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">Two customer is left</h6>
                                          <div className="d-flex justify-content-between">
                                             <p className="mb-0">Jond Bini</p>
                                             <small className="float-end font-size-12">Just
                                                Now</small>
                                          </div>
                                       </div>

                                    </div>
                                 </a>
                                 <a href="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img className="p-1 avatar-40 "
                                          src={user04} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">New Mail from Fenny</h6>
                                          <div className="d-flex justify-content-between">
                                             <p className="mb-0">Jond Bini</p>
                                             <small className="float-end font-size-12">Just
                                                Now</small>
                                          </div>
                                       </div>

                                    </div>
                                 </a>
                              </div>
                           </div>
                        </Dropdown.Menu>
                     </Dropdown>
                     )}
                     <Dropdown as="li" className="nav-item">
                        <Dropdown.Toggle as="a" bsPrefix=' ' to="#" className="nav-link d-none d-xl-block"
                           id="notification-drop" data-bs-toggle="dropdown">
                           <i className="ri-mail-open-line"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu as="div" className="p-0 sub-drop dropdown-menu dropdown-menu-end"
                           aria-labelledby="notification-drop">
                           <div className="m-0 -none card">
                              <div
                                 className="py-3 card-header d-flex justify-content-between bg-primary mb-0 rounded-top-3">
                                 <div className="header-title w-100">
                                    <h5
                                       className="mb-0 text-white d-flex justify-content-between">All
                                       Messages <small
                                          className="badge text-bg-light  pt-1">4</small></h5>
                                 </div>
                              </div>
                              <div className="p-0 card-body">
                                 <a href="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img className="p-1 avatar-40 "
                                          src={user01} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">Emma Watson Bni</h6>
                                          <div className="d-flex justify-content-between">
                                             <p className="mb-0">Jond Bini</p>
                                             <small className="float-end font-size-12">Just
                                                Now</small>
                                          </div>
                                       </div>
                                    </div>
                                 </a>
                                 <a href="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img className="p-1 avatar-40 "
                                          src={user02} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">New customer is join</h6>
                                          <div className="d-flex justify-content-between">
                                             <p className="mb-0">Jond Bini</p>
                                             <small className="float-end font-size-12">5 days
                                                ago</small>
                                          </div>
                                       </div>
                                    </div>
                                 </a>
                                 <a href="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img className="p-1 avatar-40 "
                                          src={user03} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">Two customer is left</h6>
                                          <div className="d-flex justify-content-between">
                                             <p className="mb-0">Jond Bini</p>
                                             <small className="float-end font-size-12">2 days
                                                ago</small>
                                          </div>
                                       </div>
                                    </div>
                                 </a>
                                 <a href="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img className="p-1 avatar-40 "
                                          src={user04} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">New Mail from Fenny</h6>
                                          <div className="d-flex justify-content-between">
                                             <p className="mb-0">Jond Bini</p>
                                             <small className="float-end font-size-12">3 days
                                                ago</small>
                                          </div>
                                       </div>
                                    </div>
                                 </a>
                              </div>
                           </div>
                        </Dropdown.Menu>
                     </Dropdown>
                     <Nav.Item as="li" className="nav-item d-block d-xl-none" onClick={handleSidebar}>
                        <a className="wrapper-menu" data-toggle="sidebar" data-active="true">
                           <div className="main-circle "><i className="ri-more-fill"></i></div>
                        </a>
                     </Nav.Item>
                     {/* -- dropdown -- */}

                     <Navbar.Toggle className="px-0 ms-3 d-flex align-items-center d-block d-xl-none"
                        aria-controls="navbarSupportedContent" aria-expanded={open} >
                        <span className="navbar-toggler-btn" onClick={() => {
                           setOpen(!open)
                        }}>
                           <span className="navbar-toggler-icon"></span>
                        </span>
                     </Navbar.Toggle>


                     {/* -- dropdown -- */}
                     <Dropdown as="li" className="nav-item">
                        <Dropdown.Toggle as="a" bsPrefix=' ' to="#" className="nav-link d-flex align-items-center"
                           id="notification-drop">
                           <img src={currentUser ? (isDoctor ? (getDoctorPhoto(doctorUser) || user001) : isPatient ? (getPatientPhoto(patientUser) || user001) : isNurse ? (getNursePhoto(nurseUser) || user001) : (getAdminPhoto(adminUser) || DEFAULT_ADMIN_PHOTO)) : user001}
                              style={{ width: "50px", height: "50px", objectFit: "cover", objectPosition: "50% 15%" }}
                              className="img-fluid rounded" alt={t("nav.userAvatarAlt")} />
                           <div className="caption d-none d-lg-block ms-3">
                              <h6 className="mb-0 line-height">
                                 {isDoctor ? `Dr. ${doctorUser?.firstName || ''} ${doctorUser?.lastName || ''}`.trim() || doctorUser?.email : isPatient ? `${patientUser?.firstName || ''} ${patientUser?.lastName || ''}`.trim() || patientUser?.email : isNurse ? `${nurseUser?.firstName || ''} ${nurseUser?.lastName || ''}`.trim() || nurseUser?.email : (adminUser?.name || adminUser?.email || "Admin")}
                              </h6>
                              <span className="font-size-12">{t("nav.connected")}</span>
                           </div>{" "}
                        </Dropdown.Toggle>{" "}
                        <Dropdown.Menu as="div" className="p-0 sub-drop dropdown-menu dropdown-menu-end"
                           aria-labelledby="notification-drop">
                           <div className="m-0 -none card">
                              <div
                                 className="py-3 card-header d-flex justify-content-between bg-primary mb-0 rounded-top-3">
                                 <div className="header-title">
                                    <h5 className="mb-0 text-white">{t("nav.allNotifications")}</h5>
                                    <span className="text-white ">{t("nav.available")}</span>
                                 </div>
                              </div>
                              <div className="p-0 card-body">
                                 {isDoctor ? (
                                 <>
                                 <Link to={`/doctor/doctor-profile/${doctorUser?.id}`} className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <div className="bg-primary-subtle px-3 py-2 rounded-1">
                                          <i className="ri-file-user-line "></i>
                                       </div>
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">{t("nav.myProfile")}</h6>
                                          <p className="mb-0">{t("nav.viewDoctorProfile")}</p>
                                       </div>
                                    </div>
                                 </Link>
                                 <Link to={`/doctor/edit-doctor/${doctorUser?.id}`} className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <div className="bg-primary-subtle px-3 py-2 rounded-1">
                                          <i className="ri-profile-line "></i>
                                       </div>
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">{t("nav.editProfile")}</h6>
                                          <p className="mb-0">{t("nav.modifyPersonalDetails")}</p>
                                       </div>
                                    </div>
                                 </Link>
                                 <Link to="/extra-pages/account-setting" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <div className="bg-primary-subtle px-3 py-2 rounded-1">
                                          <i className="ri-account-box-line "></i>
                                       </div>
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">{t("nav.accountSettings")}</h6>
                                          <p className="mb-0">{t("nav.manageAccountSettings")}</p>
                                       </div>
                                    </div>
                                 </Link>
                                 <Link to="/extra-pages/privacy-setting" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <div className="bg-primary-subtle px-3 py-2 rounded-1">
                                          <i className="ri-lock-line"></i>
                                       </div>
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">{t("nav.privacySettings")}</h6>
                                          <p className="mb-0">{t("nav.controlPrivacy")}</p>
                                       </div>
                                    </div>
                                 </Link>
                                 </>
                                 ) : isNurse ? (
                                 <>
                                 <Link to={`/nurse/nurse-profile/${nurseUser?.id}`} className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <div className="bg-primary-subtle px-3 py-2 rounded-1">
                                          <i className="ri-file-user-line "></i>
                                       </div>
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">{t("nav.myProfile")}</h6>
                                          <p className="mb-0">{t("nav.viewNurseProfile")}</p>
                                       </div>
                                    </div>
                                 </Link>
                                 <Link to="/extra-pages/account-setting" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <div className="bg-primary-subtle px-3 py-2 rounded-1">
                                          <i className="ri-account-box-line "></i>
                                       </div>
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">{t("nav.accountSettings")}</h6>
                                          <p className="mb-0">{t("nav.manageAccountSettings")}</p>
                                       </div>
                                    </div>
                                 </Link>
                                 </>
                                 ) : isPatient ? (
                                 <>
                                 <Link to={`/patient/patient-profile/${patientUser?.id}`} className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <div className="bg-primary-subtle px-3 py-2 rounded-1">
                                          <i className="ri-file-user-line "></i>
                                       </div>
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">{t("nav.myProfile")}</h6>
                                          <p className="mb-0">{t("nav.viewPatientProfile")}</p>
                                       </div>
                                    </div>
                                 </Link>
                                 <Link to="/extra-pages/account-setting" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <div className="bg-primary-subtle px-3 py-2 rounded-1">
                                          <i className="ri-account-box-line "></i>
                                       </div>
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">{t("nav.accountSettings")}</h6>
                                          <p className="mb-0">{t("nav.manageAccountSettings")}</p>
                                       </div>
                                    </div>
                                 </Link>
                                 </>
                                 ) : (
                                 <>
                                 <Link to="/admin/profile" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <div
                                          className="bg-primary-subtle px-3 py-2 rounded-1">
                                          <i className="ri-file-user-line "></i>
                                       </div>
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">{t("nav.myProfile")}</h6>
                                          <p className="mb-0">{t("nav.adminProfileDetails")}</p>
                                       </div>

                                    </div>
                                 </Link>
                                 <Link to="/admin/edit-profile" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <div
                                          className="bg-primary-subtle px-3 py-2 rounded-1">
                                          <i className="ri-profile-line "></i>
                                       </div>
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">{t("nav.editProfile")}</h6>
                                          <p className="mb-0">{t("nav.modifyPersonalDetails")}</p>
                                       </div>

                                    </div>
                                 </Link>
                                 <Link to="/extra-pages/account-setting" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <div
                                          className="bg-primary-subtle px-3 py-2 rounded-1">
                                          <i className="ri-account-box-line "></i>
                                       </div>
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">{t("nav.accountSettings")}</h6>
                                          <p className="mb-0">{t("nav.manageAccountSettings")}</p>
                                       </div>

                                    </div>
                                 </Link>
                                 <Link to="/extra-pages/privacy-setting" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <div
                                          className="bg-primary-subtle px-3 py-2 rounded-1">
                                          <i className="ri-lock-line"></i>
                                       </div>
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">{t("nav.privacySettings")}</h6>
                                          <p className="mb-0">{t("nav.controlPrivacy")}</p>
                                       </div>

                                    </div>
                                 </Link>
                                 </>
                                 )}
                                 <div className="iq-sub-card d-flex justify-content-center p-3">
                                    <button
                                       type="button"
                                       className="btn btn-primary-subtle w-100"
                                       onClick={handleSignOut}
                                    >
                                       {t("nav.signOut")}
                                       <i className="ri-login-box-line ms-2"></i>
                                    </button>
                                 </div>
                              </div>
                           </div>
                        </Dropdown.Menu>
                     </Dropdown>
                  </Col>
               </Row>
               {isA11ySession && handError && (
                  <Row className="w-100">
                     <Col xs={12}>
                        <div className="alert alert-warning py-1 px-2 small mb-0 mt-1" role="alert">
                           {handError}
                           <button
                              type="button"
                              className="btn-close btn-sm float-end"
                              onClick={() => setHandError("")}
                              aria-label={t("signIn.closeAria")}
                           />
                        </div>
                     </Col>
                  </Row>
               )}

            </Container>

            {/* -- collapse -- */}
            <Navbar.Collapse id="navbarSupportedContent">
               <Row className="flex-grow-1 pt-4 pb-4 px-2">

                  <Col md={12} className="d-flex justify-content-end align-items-center flex-wrap gap-2">
                     <LanguageSwitcher toggleClassName="nav-link d-block d-xl-none" />{" "}
                     {isA11ySession && (
                        <Nav.Item as="li" className="nav-item d-flex d-xl-none align-items-center flex-wrap gap-1 justify-content-end">
                           <button
                              type="button"
                              className={`btn btn-sm a11y-btn ${sessionLargeText ? "btn-primary" : "btn-outline-primary"}`}
                              data-eye-clickable
                              aria-pressed={sessionLargeText}
                              onClick={() => setSessionLargeText((v) => !v)}
                           >
                              <i className="ri-font-size me-1"></i>
                              {sessionLargeText ? t("signIn.largeTextDisable") : t("signIn.largeTextEnable")}
                           </button>
                           {ttsSupported && (
                              <button
                                 type="button"
                                 className={`btn btn-sm a11y-btn ${isReadingPage ? "btn-danger" : "btn-outline-secondary"}`}
                                 data-eye-clickable
                                 aria-pressed={isReadingPage}
                                 onClick={isReadingPage ? stopPageReading : readPageContent}
                              >
                                 <i className={`me-1 ${isReadingPage ? "ri-volume-mute-line" : "ri-volume-up-line"}`}></i>
                                 {isReadingPage ? t("signIn.stopReading") : t("signIn.readPage")}
                              </button>
                           )}
                           <span className="d-inline-flex align-items-center" role="group" aria-label={t("nav.assistHandGroupLabel")}>
                              {!handActive ? (
                                 <button
                                    type="button"
                                    className="btn btn-sm assist-btn assist-btn-hand"
                                    onClick={startHandGesture}
                                    aria-describedby="header-hand-nav-help"
                                    data-eye-clickable
                                 >
                                    <i className="ri-camera-line me-1" aria-hidden="true"></i>
                                    {t("signIn.startHandNav")}
                                 </button>
                              ) : (
                                 <button
                                    type="button"
                                    className="btn btn-sm assist-btn assist-btn-hand is-active"
                                    onClick={stopHandGesture}
                                    aria-pressed="true"
                                    aria-describedby="header-hand-nav-help"
                                    data-eye-clickable
                                 >
                                    <i className="ri-camera-off-line me-1" aria-hidden="true"></i>
                                    {t("signIn.stopHandNav")}
                                 </button>
                              )}
                           </span>
                        </Nav.Item>
                     )}
                     <li className="nav-item dropdown">
                     </li>
                     <Nav.Item className="iq-full-screen iq-full-screen2 d-block d-xl-none"
                        id="fullscreen-item">
                        <a href="#" className="nav-link" id="btnFullscreen" onClick={toggleFullScreen}>
                           <i className={`ri-fullscreen-line normal-screen ${isFullScreen ? 'd-none' : ""}`}></i>
                           <i className={`ri-fullscreen-exit-line full-normal-screen ${isFullScreen ? '' : " d-none"}`}></i>
                        </a>
                     </Nav.Item>{" "}
                     {(isDoctor || isNurse) ? (
                        <StaffNotificationsBell
                           role={isDoctor ? "doctor" : "nurse"}
                           toggleClassName="nav-link d-block d-xl-none position-relative"
                        />
                     ) : isPatient ? (
                        <PatientMedicationNotificationsBell toggleClassName="nav-link d-block d-xl-none position-relative" />
                     ) : isAdmin ? (
                        <StaffNotificationsBell role="admin" toggleClassName="nav-link d-block d-xl-none position-relative" />
                     ) : (
                     <Dropdown as="li" className="nav-item">
                        <Dropdown.Toggle as="a" bsPrefix=' ' to="#" className="nav-link d-block d-xl-none "
                           id="notification-drop">
                           <i className="ri-notification-4-line"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="p-0 sub-drop dropdown-menu-end"
                           aria-labelledby="notification-drop">
                           <div className="m-0 -none card">
                              <div
                                 className="py-3 card-header d-flex justify-content-between bg-primary mb-0">
                                 <div className="header-title">
                                    <h5 className="mb-0 text-white">{t("nav.allNotifications")}</h5>
                                 </div>
                              </div>
                              <div className="p-0 card-body">
                                 <Link as="a" to="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img
                                          className="p-1 avatar-40 rounded-pill bg-primary-subtle"
                                          src={user01} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">Emma Watson Bni</h6>
                                          <p className="mb-0">95 MB</p>
                                       </div>
                                       <small className="float-end font-size-12">Just
                                          Now</small>
                                    </div>
                                 </Link>
                                 <Link as="a" to="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img
                                          className="p-1 avatar-40 rounded-pill bg-primary-subtle"
                                          src={user02} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">New customer is join</h6>
                                          <p className="mb-0">Cyst Bni</p>
                                       </div>
                                       <small className="float-end font-size-12">5 days
                                          ago</small>
                                    </div>
                                 </Link>
                                 <Link as="a" to="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img
                                          className="p-1 avatar-40 rounded-pill bg-primary-subtle"
                                          src={user03} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">Two customer is left</h6>
                                          <p className="mb-0">Cyst Bni</p>
                                       </div>
                                       <small className="float-end font-size-12">2 days
                                          ago</small>
                                    </div>
                                 </Link>
                                 <Link as="a" to="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img
                                          className="p-1 avatar-40 rounded-pill bg-primary-subtle"
                                          src={user04} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">New Mail from Fenny</h6>
                                          <p className="mb-0">Cyst Bni</p>
                                       </div>
                                       <small className="float-end font-size-12">3 days
                                          ago</small>
                                    </div>
                                 </Link>
                              </div>
                           </div>
                        </Dropdown.Menu>
                     </Dropdown>
                     )}{" "}
                     <Dropdown as="li" className="nav-item">
                        <Dropdown.Toggle as="a" bsPrefix=' ' to="#" className="nav-link d-block d-xl-none"
                           id="notification-drop">
                           <i className="ri-mail-open-line"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu as="div" className="p-0 sub-drop dropdown-menu-end"
                           aria-labelledby="notification-drop">
                           <div className="m-0 -none card">
                              <div
                                 className="py-3 card-header d-flex justify-content-between bg-primary mb-0">
                                 <div className="header-title">
                                    <h5 className="mb-0 text-white">{t("nav.allNotifications")}</h5>
                                 </div>
                              </div>
                              <div className="p-0 card-body">
                                 <Link to="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img
                                          className="p-1 avatar-40 rounded-pill bg-primary-subtle"
                                          src={user01} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">Emma Watson Bni</h6>
                                          <p className="mb-0">95 MB</p>
                                       </div>
                                       <small className="float-end font-size-12">Just
                                          Now</small>
                                    </div>
                                 </Link>
                                 <Link to="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img
                                          className="p-1 avatar-40 rounded-pill bg-primary-subtle"
                                          src={user02} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">New customer is join</h6>
                                          <p className="mb-0">Cyst Bni</p>
                                       </div>
                                       <small className="float-end font-size-12">5 days
                                          ago</small>
                                    </div>
                                 </Link>
                                 <Link to="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img
                                          className="p-1 avatar-40 rounded-pill bg-primary-subtle"
                                          src={user03} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">Two customer is left</h6>
                                          <p className="mb-0">Cyst Bni</p>
                                       </div>
                                       <small className="float-end font-size-12">2 days
                                          ago</small>
                                    </div>
                                 </Link>
                                 <Link to="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img
                                          className="p-1 avatar-40 rounded-pill bg-primary-subtle"
                                          src={user04} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">New Mail from Fenny</h6>
                                          <p className="mb-0">Cyst Bni</p>
                                       </div>
                                       <small className="float-end font-size-12">3 days
                                          ago</small>
                                    </div>
                                 </Link>
                              </div>
                           </div>
                        </Dropdown.Menu>
                     </Dropdown>

                  </Col>
               </Row>
               {/* -- dropdown -- */}
            </Navbar.Collapse>
         </Navbar>
         {/* </Navbar> */}
      </>
   )
}

export default Header
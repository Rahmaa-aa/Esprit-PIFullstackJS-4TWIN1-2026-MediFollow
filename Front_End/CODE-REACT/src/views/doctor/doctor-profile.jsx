import React, { useState, useEffect, useMemo } from "react";
import { Col, Row } from "react-bootstrap";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Card from "../../components/Card";
import FaceEnrollmentCard from "../../components/FaceEnrollmentCard";
import { appointmentApi, doctorApi, notificationApi } from "../../services/api";
import { formatDoctorFormalName } from "../../utils/doctorDisplayName";

import img11 from "/assets/images/user/11.png";

const generatePath = (path) => window.origin + import.meta.env.BASE_URL + path;

const EM_DASH = "—";

function isDoctorViewingOwnProfile(profileId) {
    if (!profileId) return false;
    try {
        if (localStorage.getItem("adminUser") || localStorage.getItem("patientUser") || localStorage.getItem("nurseUser")) {
            return false;
        }
        const raw = localStorage.getItem("doctorUser");
        if (!raw) return false;
        const u = JSON.parse(raw);
        const did = u?.id ?? u?._id;
        return did != null && String(did) === String(profileId);
    } catch {
        return false;
    }
}

function canEditDoctorProfile(profileId) {
    if (!profileId) return false;
    try {
        if (localStorage.getItem("adminUser")) return true;
        const raw = localStorage.getItem("doctorUser");
        if (!raw) return false;
        const u = JSON.parse(raw);
        const did = u?.id ?? u?._id;
        return did != null && String(did) === String(profileId);
    } catch {
        return false;
    }
}

/** Agenda détaillé : titulaire du profil ou admin / superadmin. */
function canViewProfileDoctorSchedule(profileId) {
    if (!profileId) return false;
    try {
        const rawAd = localStorage.getItem("adminUser");
        if (rawAd) {
            const u = JSON.parse(rawAd);
            if (u?.role === "admin" || u?.role === "superadmin") return true;
        }
        const raw = localStorage.getItem("doctorUser");
        if (!raw) return false;
        const u = JSON.parse(raw);
        const did = u?.id ?? u?._id;
        return did != null && String(did) === String(profileId);
    } catch {
        return false;
    }
}

function formatLocation(d) {
    if (!d || typeof d !== "object") return null;
    const parts = [d.address, d.city, d.country, d.pinCode].filter(Boolean);
    return parts.length ? parts.join(", ") : null;
}

function todayYmd() {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}

function ymdAddDays(ymd, days) {
    const [y, m, d] = ymd.split("-").map((x) => parseInt(x, 10));
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + days);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function apptDayLabel(dateStr, t) {
    const d = String(dateStr || "").split("T")[0];
    if (!d) return EM_DASH;
    const t0 = todayYmd();
    if (d === t0) return t("doctorProfile.today");
    if (d === ymdAddDays(t0, 1)) return t("doctorProfile.tomorrow");
    try {
        return new Date(d + "T12:00:00").toLocaleDateString(undefined, {
            weekday: "short",
            day: "numeric",
            month: "short",
        });
    } catch {
        return d;
    }
}

function appointmentPatientName(apt) {
    const p = apt?.patientId;
    if (p && typeof p === "object") {
        const n = `${p.firstName || ""} ${p.lastName || ""}`.trim();
        return n || EM_DASH;
    }
    return apt?.doctorName || EM_DASH;
}

const SCHEDULE_BADGES = ["primary", "danger", "warning", "info", "success"];

const DoctorProfile = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [appointments, setAppointments] = useState([]);
    const [apptLoading, setApptLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const showFaceEnrollment = useMemo(() => isDoctorViewingOwnProfile(id), [id]);
    const showEditButton = useMemo(() => canEditDoctorProfile(id), [id]);
    const showSchedule = useMemo(() => canViewProfileDoctorSchedule(id), [id]);

    useEffect(() => {
        if (id) return;
        setLoading(true);
        try {
            const raw = localStorage.getItem("doctorUser");
            if (raw) {
                const u = JSON.parse(raw);
                const did = u?.id ?? u?._id;
                if (did) {
                    navigate(`/doctor/doctor-profile/${did}`, { replace: true });
                    return;
                }
            }
        } catch {
            /* ignore */
        }
        setLoading(false);
    }, [id, navigate]);

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        setLoading(true);
        setError("");
        const run = async () => {
            try {
                const data = await doctorApi.getById(id, { stats: true });
                if (!cancelled) setDoctor(data);
            } catch (err) {
                if (!cancelled) setError(err.message || t("doctorProfile.loadError"));
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, [id, t]);

    useEffect(() => {
        if (!id || !showSchedule) {
            setAppointments([]);
            return;
        }
        let cancelled = false;
        setApptLoading(true);
        appointmentApi
            .getUpcomingForDoctorProfile(id)
            .then((rows) => {
                if (!cancelled) setAppointments(Array.isArray(rows) ? rows.slice(0, 12) : []);
            })
            .catch(() => {
                if (!cancelled) setAppointments([]);
            })
            .finally(() => {
                if (!cancelled) setApptLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [id, showSchedule]);

    useEffect(() => {
        if (!isDoctorViewingOwnProfile(id)) {
            setNotifications([]);
            return;
        }
        let cancelled = false;
        notificationApi
            .getMine()
            .then((data) => {
                const items = data?.items;
                if (!cancelled) setNotifications(Array.isArray(items) ? items.slice(0, 8) : []);
            })
            .catch(() => {
                if (!cancelled) setNotifications([]);
            });
        return () => {
            cancelled = true;
        };
    }, [id]);

    const displayDoctor = doctor || {};
    const profileImg = doctor?.profileImage
        ? doctor.profileImage.startsWith("data:")
            ? doctor.profileImage
            : doctor.profileImage.startsWith("http")
              ? doctor.profileImage
              : generatePath(doctor.profileImage)
        : img11;

    const lastDoctorSession = displayDoctor.updatedAt
        ? new Date(displayDoctor.updatedAt).toLocaleString()
        : null;

    const stats = displayDoctor.stats || {};
    const assignedCount = typeof stats.assignedPatientsCount === "number" ? stats.assignedPatientsCount : 0;
    const upcomingCount = typeof stats.upcomingAppointmentsCount === "number" ? stats.upcomingAppointmentsCount : 0;

    const displayName = displayDoctor.firstName ? formatDoctorFormalName(displayDoctor, t) : EM_DASH;
    const specialtyLine = displayDoctor.specialty?.trim() || EM_DASH;
    const departmentLine = displayDoctor.department?.trim() || EM_DASH;
    const locationLine = formatLocation(displayDoctor) || EM_DASH;
    const emailVal = displayDoctor.email?.trim();
    const phoneVal = displayDoctor.phone?.trim();

    const showNotificationsCard = isDoctorViewingOwnProfile(id);
    const showScheduleCard = showSchedule;
    const professionalColMd = !showNotificationsCard && !showScheduleCard ? 12 : 6;

    if (!id) {
        if (loading) {
            return (
                <Row>
                    <Col sm={12}>
                        <Card>
                            <Card.Body className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">{t("doctorProfile.loading")}</span>
                                </div>
                                <p className="mt-3 mb-0">{t("doctorProfile.loading")}</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            );
        }
        return (
            <Row>
                <Col sm={12}>
                    <Card>
                        <Card.Body className="text-center py-5">
                            <p className="mb-3">{t("doctorProfile.needDoctorSession")}</p>
                            <Link to="/doctor/doctor-list" className="btn btn-primary-subtle">
                                {t("doctorProfile.backToList")}
                            </Link>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        );
    }

    if (loading) {
        return (
            <Row>
                <Col sm={12}>
                    <Card>
                        <Card.Body className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">{t("doctorProfile.loading")}</span>
                            </div>
                            <p className="mt-3 mb-0">{t("doctorProfile.loading")}</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        );
    }

    if (id && error) {
        return (
            <Row>
                <Col sm={12}>
                    <Card>
                        <Card.Body className="text-center py-5">
                            <p className="text-danger mb-3">{error}</p>
                            <Link to="/doctor/doctor-list" className="btn btn-primary-subtle">
                                {t("doctorProfile.backToList")}
                            </Link>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        );
    }

    const social = [
        { key: "facebook", url: displayDoctor.facebookUrl, icon: "ri-facebook-fill" },
        { key: "twitter", url: displayDoctor.twitterUrl, icon: "ri-twitter-x-fill" },
        { key: "instagram", url: displayDoctor.instagramUrl, icon: "ri-instagram-line" },
        { key: "linkedin", url: displayDoctor.linkedinUrl, icon: "ri-linkedin-fill" },
    ].filter((s) => s.url && String(s.url).trim());

    return (
        <>
            {showFaceEnrollment ? (
                <Row>
                    <Col sm={12}>
                        <FaceEnrollmentCard />
                    </Col>
                </Row>
            ) : null}
            <Row>
                <Col lg={4}>
                    <Card>
                        <Card.Body className="ps-0 pe-0 pt-0">
                            <div className="docter-details-block">
                                <div className="doc-profile-bg bg-primary rounded-top-2" style={{ height: "150px" }} />
                                <div className="docter-profile text-center">
                                    <img src={profileImg} alt="" className="avatar-130 img-fluid" style={{ objectFit: "cover" }} />
                                </div>
                                <div className="text-center mt-3 ps-3 pe-3">
                                    <h4>
                                        <b>{displayName}</b>
                                    </h4>
                                    <p className="mb-1">{specialtyLine}</p>
                                    <p className="text-muted small mb-0">{departmentLine}</p>
                                </div>
                                <hr />
                                <ul className="doctoe-sedual d-flex align-items-center justify-content-between p-0 m-0 list-unstyled">
                                    <li className="text-center flex-fill px-1">
                                        <h3 className="counter mb-0">{assignedCount}</h3>
                                        <span className="small">{t("doctorProfile.statPatients")}</span>
                                    </li>
                                    <li className="text-center flex-fill px-1">
                                        <h3 className="counter mb-0">{upcomingCount}</h3>
                                        <span className="small">{t("doctorProfile.statUpcomingAppts")}</span>
                                    </li>
                                </ul>
                            </div>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <Card.Header.Title className="mb-0">
                                <h4 className="card-title mb-0">{t("doctorProfile.personalInfo")}</h4>
                            </Card.Header.Title>
                            {showEditButton ? (
                                <Link to={`/doctor/edit-doctor/${id}`} className="btn btn-primary-subtle btn-sm">
                                    {t("doctorProfile.edit")}
                                </Link>
                            ) : null}
                        </Card.Header>
                        <Card.Body>
                            <div className="about-info m-0 p-0">
                                <Row>
                                    <Col xs={4} className="text-muted">
                                        {t("doctorProfile.labelFirstName")}
                                    </Col>
                                    <Col xs={8}>{displayDoctor.firstName?.trim() || EM_DASH}</Col>
                                    <Col xs={4} className="text-muted">
                                        {t("doctorProfile.labelLastName")}
                                    </Col>
                                    <Col xs={8}>{displayDoctor.lastName?.trim() || EM_DASH}</Col>
                                    <Col xs={4} className="text-muted">
                                        {t("doctorProfile.labelSpecialty")}
                                    </Col>
                                    <Col xs={8}>{specialtyLine}</Col>
                                    <Col xs={4} className="text-muted">
                                        {t("doctorProfile.labelDepartment")}
                                    </Col>
                                    <Col xs={8}>{departmentLine}</Col>
                                    <Col xs={4} className="text-muted">
                                        {t("doctorProfile.labelEmail")}
                                    </Col>
                                    <Col xs={8}>
                                        {emailVal ? <a href={`mailto:${emailVal}`}>{emailVal}</a> : EM_DASH}
                                    </Col>
                                    <Col xs={4} className="text-muted">
                                        {t("doctorProfile.labelPhone")}
                                    </Col>
                                    <Col xs={8}>
                                        {phoneVal ? <a href={`tel:${phoneVal}`}>{phoneVal}</a> : EM_DASH}
                                    </Col>
                                    <Col xs={4} className="text-muted">
                                        {t("doctorProfile.labelLocation")}
                                    </Col>
                                    <Col xs={8}>{locationLine}</Col>
                                    <Col xs={4} className="text-muted">
                                        {t("doctorProfile.labelAccount")}
                                    </Col>
                                    <Col xs={8}>
                                        {displayDoctor.isActive === false ? (
                                            <span className="badge bg-secondary-subtle text-secondary">
                                                {t("doctorProfile.accountInactive")}
                                            </span>
                                        ) : (
                                            <span className="badge bg-success-subtle text-success">
                                                {t("doctorProfile.accountActive")}
                                            </span>
                                        )}
                                    </Col>
                                    <Col xs={4} className="text-muted">
                                        {t("doctorProfile.labelLastUpdate")}
                                    </Col>
                                    <Col xs={8}>{lastDoctorSession || EM_DASH}</Col>
                                </Row>
                            </div>
                        </Card.Body>
                    </Card>
                    {showFaceEnrollment ? (
                        <Card>
                            <Card.Body className="d-grid gap-2">
                                <Link to="/doctor/my-patients" className="btn btn-outline-primary">
                                    {t("doctorProfile.linkMyPatients")}
                                </Link>
                                <Link to="/doctor/availability-calendar" className="btn btn-outline-secondary">
                                    {t("doctorProfile.linkCalendar")}
                                </Link>
                            </Card.Body>
                        </Card>
                    ) : null}
                </Col>
                <Col lg={8}>
                    <Row>
                        <Col md={professionalColMd}>
                            <Card>
                                <Card.Header className="d-flex justify-content-between">
                                    <Card.Header.Title>
                                        <h4 className="card-title mb-0">{t("doctorProfile.cardProfessional")}</h4>
                                    </Card.Header.Title>
                                </Card.Header>
                                <Card.Body>
                                    <ul className="speciality-list m-0 p-0 list-unstyled">
                                        <li className="d-flex mb-3 align-items-start">
                                            <div className="user-img img-fluid">
                                                <span className="d-inline-flex align-items-center justify-content-center rounded bg-primary-subtle text-primary p-2">
                                                    <i className="ri-stethoscope-line" />
                                                </span>
                                            </div>
                                            <div className="media-support-info ms-3">
                                                <h6 className="mb-1">{t("doctorProfile.proSpecialty")}</h6>
                                                <p className="mb-0 text-muted">{specialtyLine}</p>
                                            </div>
                                        </li>
                                        <li className="d-flex mb-3 align-items-start">
                                            <div className="user-img img-fluid">
                                                <span className="d-inline-flex align-items-center justify-content-center rounded bg-info-subtle text-info p-2">
                                                    <i className="ri-building-2-line" />
                                                </span>
                                            </div>
                                            <div className="media-support-info ms-3">
                                                <h6 className="mb-1">{t("doctorProfile.proDepartment")}</h6>
                                                <p className="mb-0 text-muted">{departmentLine}</p>
                                            </div>
                                        </li>
                                        <li className="d-flex mb-3 align-items-start">
                                            <div className="user-img img-fluid">
                                                <span className="d-inline-flex align-items-center justify-content-center rounded bg-warning-subtle text-warning p-2">
                                                    <i className="ri-map-pin-line" />
                                                </span>
                                            </div>
                                            <div className="media-support-info ms-3">
                                                <h6 className="mb-1">{t("doctorProfile.proLocation")}</h6>
                                                <p className="mb-0 text-muted">{locationLine}</p>
                                            </div>
                                        </li>
                                    </ul>
                                    {social.length ? (
                                        <div className="d-flex flex-wrap gap-2 pt-2 border-top">
                                            {social.map((s) => (
                                                <a
                                                    key={s.key}
                                                    href={s.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm btn-outline-secondary"
                                                    aria-label={s.key}
                                                >
                                                    <i className={s.icon} />
                                                </a>
                                            ))}
                                        </div>
                                    ) : null}
                                </Card.Body>
                            </Card>
                        </Col>
                        {showNotificationsCard ? (
                            <Col md={6}>
                                <Card>
                                    <Card.Header className="d-flex justify-content-between">
                                        <Card.Header.Title>
                                            <h4 className="card-title mb-0">{t("doctorProfile.cardNotifications")}</h4>
                                        </Card.Header.Title>
                                    </Card.Header>
                                    <Card.Body>
                                        {notifications.length === 0 ? (
                                            <p className="text-muted mb-0 small">{t("doctorProfile.notificationsEmpty")}</p>
                                        ) : (
                                            <ul className="timeline m-0 p-0">
                                                {notifications.map((n, idx) => {
                                                    const dot =
                                                        idx % 3 === 0 ? "border-success" : idx % 3 === 1 ? "border-danger" : "border-primary";
                                                    const title = n.title || n.body || "";
                                                    const when = n.sortAt || n.createdAt;
                                                    return (
                                                        <li key={n._id || n.id || idx}>
                                                            <div className={`timeline-dots ${dot}`} />
                                                            <h6 className="mb-1">{title}</h6>
                                                            {when ? (
                                                                <small className="text-muted">
                                                                    {new Date(when).toLocaleString()}
                                                                </small>
                                                            ) : null}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        ) : null}
                        {showScheduleCard ? (
                            <Col md={6}>
                                <Card>
                                    <Card.Header className="d-flex justify-content-between">
                                        <Card.Header.Title>
                                            <h4 className="card-title mb-0">{t("doctorProfile.cardSchedule")}</h4>
                                        </Card.Header.Title>
                                    </Card.Header>
                                    <Card.Body>
                                        {apptLoading ? (
                                            <div className="text-center py-3">
                                                <div className="spinner-border spinner-border-sm text-primary" role="status" />
                                            </div>
                                        ) : appointments.length === 0 ? (
                                            <p className="text-muted small mb-0">{t("doctorProfile.scheduleEmpty")}</p>
                                        ) : (
                                            <ul className="list-inline m-0 p-0">
                                                {appointments.map((apt, idx) => {
                                                    const badge = SCHEDULE_BADGES[idx % SCHEDULE_BADGES.length];
                                                    const patientName = appointmentPatientName(apt);
                                                    const title = apt.title || t("doctorProfile.apptDefaultTitle");
                                                    return (
                                                        <li key={apt._id || idx} className="mb-3">
                                                            <h6 className="float-start mb-1">
                                                                {patientName}
                                                                <span className="text-muted fw-normal"> — {title}</span>
                                                            </h6>
                                                            <small className="float-end mt-1 text-muted">
                                                                {apptDayLabel(apt.date, t)}
                                                            </small>
                                                            <div className="d-inline-block w-100">
                                                                <span className={`badge text-bg-${badge}`}>
                                                                    {apt.time || EM_DASH}
                                                                </span>
                                                            </div>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        ) : null}
                    </Row>
                </Col>
            </Row>
        </>
    );
};

export default DoctorProfile;

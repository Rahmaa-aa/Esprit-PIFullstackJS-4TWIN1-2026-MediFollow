import React, { useEffect, useLayoutEffect, useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import ApexCharts from 'apexcharts';
import Card from "../../components/Card";
import DailyCheckIn from "../../components/DailyCheckIn";
import MedicationsCard from "../../components/MedicationsCard";
import AppointmentsCard from "../../components/AppointmentsCard";
import CareTeamCard from "../../components/CareTeamCard";
import SecureMessagingHubCard from "../../components/SecureMessagingHubCard";
import DischargeSummaryCard from "../../components/DischargeSummaryCard";
import { healthLogApi, medicationApi, appointmentApi, patientApi, doctorApi, nurseApi } from "../../services/api";
import { isMedicationCurrentTreatment } from "../../utils/medicationReminders";

// Local date string — avoids UTC timezone bug
const localDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Affichage du graphique vitals : fuseau GMT+1 (ex. Tunis / CET hiver) */
const VITALS_CHART_TIMEZONE = "Africa/Tunis";

/** Onglet du graphique « 30-Day Vitals History » : HR par défaut */
const DEFAULT_VITAL_TAB = "heartRate";
const VITAL_CHART_KEYS = ["heartRate", "bloodPressureSystolic", "oxygenSaturation", "temperature"];

function formatVitalChartAxisLabel(ms) {
    return new Intl.DateTimeFormat("fr-FR", {
        timeZone: VITALS_CHART_TIMEZONE,
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(ms));
}

function formatVitalChartTooltip(ms) {
    return new Intl.DateTimeFormat("fr-FR", {
        timeZone: VITALS_CHART_TIMEZONE,
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
    }).format(new Date(ms));
}

const generatePath = (path) => {
    return window.origin + import.meta.env.BASE_URL + path;
};

// Helper: mood — libellés + icônes métier (aligné sur DailyCheckIn, pas de visages)
const moodDisplay = (mood) => {
    if (mood === "good") return { icon: "ri-shield-check-line", label: "Satisfactory", color: "#28a745" };
    if (mood === "fair") return { icon: "ri-scales-3-line", label: "Moderate", color: "#fd7e14" };
    if (mood === "poor") return { icon: "ri-first-aid-kit-line", label: "Poor", color: "#dc3545" };
    return { icon: null, label: "—", color: "#6c757d" };
};

const PatientDashboard = () => {
    const [patientUser, setPatientUser] = useState(() => {
        try {
            const stored = localStorage.getItem("patientUser");
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });

    // Re-read profile when updated from edit-patient page
    useEffect(() => {
        const refresh = () => {
            try {
                const stored = localStorage.getItem("patientUser");
                if (stored) setPatientUser(JSON.parse(stored));
            } catch { /* ignore */ }
        };
        window.addEventListener("patientUserUpdated", refresh);
        return () => window.removeEventListener("patientUserUpdated", refresh);
    }, []);

    const [todayLog, setTodayLog] = useState(null);
    const [history, setHistory] = useState([]);
    const [activeVital, setActiveVital] = useState(DEFAULT_VITAL_TAB);
    const [medications, setMedications] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [careDoctor, setCareDoctor] = useState(null);
    const [careNurse, setCareNurse] = useState(null);
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    const rawId = patientUser?.id ?? patientUser?._id;
    const pid =
        rawId != null && typeof rawId === "object" && rawId !== null && "$oid" in rawId
            ? String(rawId.$oid)
            : rawId != null
              ? String(rawId)
              : undefined;

    const loadTodayLog = async () => {
        if (!pid) return;
        try {
            const log = await healthLogApi.getLatest(pid);
            setTodayLog(log);
        } catch (e) {
            console.error('[Dashboard] Failed to load today log:', e);
            setTodayLog(null);
        }
    };

    const loadHistory = async () => {
        if (!pid) return;
        try {
            const logs = await healthLogApi.getHistory(pid);
            setHistory(Array.isArray(logs) ? logs : []);
        } catch (e) {
            console.error('[Dashboard] Failed to load history:', e);
            setHistory([]);
        }
    };

    const loadMedications = async () => {
        if (!pid) return;
        try {
            const meds = await medicationApi.getByPatient(pid);
            setMedications(Array.isArray(meds) ? meds : []);
        } catch (e) { console.error('[Dashboard] Failed to load medications:', e); }
    };

    const loadAppointments = async () => {
        if (!pid) return;
        try {
            const appts = await appointmentApi.getByPatient(pid);
            setAppointments(Array.isArray(appts) ? appts : []);
        } catch (e) { console.error('[Dashboard] Failed to load appointments:', e); }
    };

    const loadCareTeam = async () => {
        if (!pid) return;
        try {
            const info = await patientApi.getCareTeam(pid);
            if (info?.doctorId) {
                doctorApi.getById(info.doctorId).then(setCareDoctor).catch(() => {});
            }
            if (info?.nurseId) {
                nurseApi.getById(info.nurseId).then(setCareNurse).catch(() => {});
            }
        } catch (e) { console.error('[Dashboard] Failed to load care team:', e); }
    };

    useEffect(() => {
        loadTodayLog();
        loadHistory();
        loadMedications();
        loadAppointments();
        loadCareTeam();
    }, [pid]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const hash = window.location.hash;
        if (hash !== "#patient-medications" && hash !== "#patient-appointments") return;
        const id = hash === "#patient-appointments" ? "patient-appointments" : "patient-medications";
        const t = window.setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
        return () => window.clearTimeout(t);
    }, [pid]);

    useEffect(() => {
        setActiveVital(DEFAULT_VITAL_TAB);
    }, [pid]);

    const vitalOptions = {
        heartRate: { label: "Heart Rate (bpm)", key: "heartRate", color: "#dc3545", unit: "bpm" },
        bloodPressureSystolic: { label: "Blood Pressure Systolic (mmHg)", key: "bloodPressureSystolic", color: "#089bab", unit: "mmHg" },
        oxygenSaturation: { label: "O₂ Saturation (%)", key: "oxygenSaturation", color: "#6f42c1", unit: "%" },
        temperature: { label: "Temperature (°C)", key: "temperature", color: "#fd7e14", unit: "°C" },
    };

    const selectedVital = vitalOptions[activeVital] ?? vitalOptions[DEFAULT_VITAL_TAB];

    const chartSeriesPoints = useMemo(() => {
        const key = selectedVital.key;
        return history
            .map((l) => {
                const raw = l.vitals?.[key];
                if (raw === undefined || raw === null || raw === "") return null;
                const t = l.recordedAt || l.createdAt;
                const ms = t ? new Date(t).getTime() : null;
                if (ms == null || Number.isNaN(ms)) return null;
                return { x: ms, y: Number(raw) };
            })
            .filter((p) => p != null && p.y != null && !Number.isNaN(p.y));
    }, [history, activeVital, selectedVital.key]);

    const hasChartData = chartSeriesPoints.length > 0;

    /** Fenêtre fixe 30 jours pour l’axe X (évite le zoom sur quelques minutes si plusieurs points le même jour) */
    const vitalChartXAxisRange = useMemo(() => {
        const now = Date.now();
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
        if (chartSeriesPoints.length === 0) return null;
        return { min: thirtyDaysAgo, max: now };
    }, [chartSeriesPoints]);

    /** Ne pas créer le graphique avec une série vide : ApexCharts garde alors des axes / noData incorrects jusqu’à un changement d’onglet. */
    useLayoutEffect(() => {
        if (!chartRef.current) return;
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
            chartInstanceRef.current = null;
        }
        if (chartSeriesPoints.length === 0) {
            return;
        }
        const opts = {
            series: [{ name: selectedVital.label, data: chartSeriesPoints }],
            chart: { type: 'area', height: 260, toolbar: { show: false }, animations: { enabled: true }, zoom: { enabled: true } },
            colors: [selectedVital.color],
            stroke: { curve: 'smooth', width: 2 },
            fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05 } },
            dataLabels: { enabled: false },
            xaxis: {
                type: 'datetime',
                ...(vitalChartXAxisRange || {}),
                labels: {
                    style: { fontSize: '10px' },
                    datetimeUTC: false,
                    formatter: (val) => {
                        if (val == null || val === "") return "";
                        const ms = typeof val === "number" ? val : new Date(val).getTime();
                        if (Number.isNaN(ms)) return "";
                        return formatVitalChartAxisLabel(ms);
                    },
                },
            },
            yaxis: { title: { text: selectedVital.unit }, labels: { style: { fontSize: '11px' } } },
            markers: { size: 4, colors: [selectedVital.color], strokeWidth: 2 },
            tooltip: {
                x: {
                    formatter: (val) => formatVitalChartTooltip(val),
                },
                y: { formatter: (val) => (val != null ? `${val} ${selectedVital.unit}` : "No data") },
            },
            noData: { text: "No data yet — complete a check-in!", style: { color: "#6c757d" } },
            grid: { borderColor: '#f1f1f1' },
        };
        const chart = new ApexCharts(chartRef.current, opts);
        chart.render();
        chartInstanceRef.current = chart;
        return () => {
            chart.destroy();
            chartInstanceRef.current = null;
        };
    }, [chartSeriesPoints, activeVital, selectedVital.label, selectedVital.color, selectedVital.unit, vitalChartXAxisRange]);

    const computeAge = (dob) => {
        if (!dob) return null;
        const b = new Date(dob), t = new Date();
        let age = t.getFullYear() - b.getFullYear();
        if (t.getMonth() - b.getMonth() < 0 || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) age--;
        return age;
    };

    const todayYmd = localDateString();
    const todayLogIsToday = !!(todayLog && todayLog.date === todayYmd);

    const userData = {
        name: patientUser ? `${patientUser.firstName || ''} ${patientUser.lastName || ''}`.trim() || patientUser.email : "Patient",
        age: computeAge(patientUser?.dateOfBirth),
        gender: patientUser?.gender || null,
        bloodType: patientUser?.bloodType || null,
        location: [patientUser?.city, patientUser?.country].filter(Boolean).join(', ') || patientUser?.service || "—",
        weight: patientUser?.weight || (todayLogIsToday ? todayLog?.vitals?.weight : null) || "—",
        height: patientUser?.height || "—",
        profileImage: patientUser?.profileImage?.startsWith("data:") ? patientUser.profileImage
            : patientUser?.profileImage?.startsWith("http") ? patientUser.profileImage
            : patientUser?.profileImage ? generatePath(patientUser.profileImage.startsWith("/") ? patientUser.profileImage.slice(1) : patientUser.profileImage)
            : generatePath(`/assets/images/user/11.png`)
    };

    const mood = moodDisplay(todayLogIsToday ? todayLog?.mood : null);
    const painLevel = todayLogIsToday ? todayLog?.painLevel ?? null : null;

    const activeMedications = medications.filter((m) => isMedicationCurrentTreatment(m, todayYmd));

    return (
        <>
            {/* Risk alert banner */}
            {todayLogIsToday && todayLog?.flagged && (
                <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                    <i className="ri-alert-line me-2 fs-5"></i>
                    <span><b>Attention:</b> Your vitals require follow-up — your care team has been notified.</span>
                </div>
            )}

            <Row className="g-3 mb-3">
                <Col xs={12}>
                    <SecureMessagingHubCard variant="patient" />
                </Col>
            </Row>

            <Row className="g-3">
                {/* LEFT COLUMN */}
                <Col lg={4}>
                    {/* Profile Card */}
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center pt-4">
                            <img src={userData.profileImage} alt="profile" className="avatar-130 img-fluid rounded-circle mb-3" style={{ border: "3px solid #089bab" }} />
                            <h5 className="fw-bold mb-0">{userData.name}</h5>
                            <p className="text-muted small mb-1">
                                {userData.age ? `${userData.age} yrs` : ''}
                                {userData.age && userData.location !== '—' ? ' • ' : ''}
                                {userData.location}
                            </p>
                            {(userData.bloodType || userData.gender) && (
                                <p className="text-muted small mb-0">
                                    {userData.bloodType && <span className="me-2"><i className="ri-heart-pulse-line text-danger me-1"></i>{userData.bloodType}</span>}
                                    {userData.gender && <span><i className="ri-user-line text-primary me-1"></i>{userData.gender}</span>}
                                </p>
                            )}
                            <div className="d-flex justify-content-around mt-3 pt-3 border-top">
                                <div className="text-center">
                                    <h6 className="text-primary mb-0">{userData.weight}<small className="text-muted ms-1">kg</small></h6>
                                    <small className="text-muted">Weight</small>
                                </div>
                                <div className="text-center">
                                    <h6 className="text-primary mb-0">{userData.height}<small className="text-muted ms-1">cm</small></h6>
                                    <small className="text-muted">Height</small>
                                </div>
                                <div className="text-center">
                                    <h6 className="text-primary mb-0">{userData.bloodType || "—"}</h6>
                                    <small className="text-muted">Blood Type</small>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Daily Check-In Card */}
                    <div className="mt-3">
                        <DailyCheckIn
                            patientId={pid}
                            existingLog={todayLog?.date === localDateString() ? todayLog : null}
                            onSubmitted={() => { loadTodayLog(); loadHistory(); }}
                        />
                    </div>

                    {/* Today's Wellbeing */}
                    <Card className="mt-3 border-0 shadow-sm">
                        <Card.Body>
                            <h6 className="text-primary fw-bold mb-3"><i className="ri-mental-health-line me-2"></i>Today's Wellbeing</h6>
                            {todayLogIsToday && todayLog ? (
                                <>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="text-muted small">Mood</span>
                                        <span className="fw-bold d-inline-flex align-items-center gap-1" style={{ color: mood.color }}>
                                            {mood.icon ? <i className={mood.icon} aria-hidden /> : null}
                                            {mood.label}
                                        </span>
                                    </div>
                                    <div className="mb-2">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="text-muted small">Pain Level</span>
                                            <span className="fw-bold small">{painLevel}/10</span>
                                        </div>
                                        <div className="progress" style={{ height: 8, borderRadius: 8 }}>
                                            <div className="progress-bar"
                                                role="progressbar"
                                                style={{ width: `${(painLevel / 10) * 100}%`, borderRadius: 8, backgroundColor: painLevel >= 7 ? "#dc3545" : painLevel >= 4 ? "#fd7e14" : "#28a745" }}
                                            />
                                        </div>
                                    </div>
                                    {todayLog.symptoms?.length > 0 && (
                                        <div className="mt-2">
                                            <span className="text-muted small d-block mb-1">Symptoms</span>
                                            <div className="d-flex flex-wrap gap-1">
                                                {todayLog.symptoms.map(s => (
                                                    <span key={s} className="badge bg-warning text-dark" style={{ fontSize: "0.7rem" }}>{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-muted small mb-0">Complete today's check-in to see your wellbeing summary.</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* RIGHT COLUMN */}
                <Col lg={8}>
                    {/* Vitals History Chart */}
                    <Card className="border-0 shadow-sm mb-3">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="text-primary fw-bold mb-0">
                                    <i className="ri-line-chart-line me-2"></i>30-Day Vitals History
                                </h6>
                                <div className="d-flex gap-1 flex-wrap">
                                    {VITAL_CHART_KEYS.map((key) => (
                                        <button key={key}
                                            className={`btn btn-sm ${activeVital === key ? "btn-primary" : "btn-outline-secondary"}`}
                                            style={{ fontSize: "0.72rem", padding: "2px 10px", borderRadius: 20 }}
                                            onClick={() => setActiveVital(key)}
                                        >
                                            {key === "heartRate" ? "HR" : key === "bloodPressureSystolic" ? "BP" : key === "oxygenSaturation" ? "O₂" : "Temp"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {!hasChartData && (
                                <p className="text-muted small text-center mb-0" style={{ paddingBottom: 32 }}>
                                    No data yet — log your vitals (you can add several times per day) to see trends here.
                                </p>
                            )}
                            <div ref={chartRef}></div>
                            <div className="mt-2 pt-1">
                                <Link to="/dashboard-pages/patient-vitals-history" className="small text-decoration-none d-inline-flex align-items-center gap-1">
                                    <i className="ri-history-line"></i>
                                    Historique complet des relevés (constantes)
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Bottom row: Risk Score + Symptoms summary */}
                    <Row className="g-3">
                        <Col md={6}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body>
                                    <h6 className="text-primary fw-bold mb-3">
                                        <i className="ri-shield-check-line me-2"></i>Recovery Risk Score
                                    </h6>
                                    {todayLogIsToday && todayLog ? (
                                        <>
                                            <div className="d-flex align-items-end gap-2 mb-2">
                                                <h2 className="mb-0 fw-bold" style={{ color: todayLog.riskScore >= 50 ? "#dc3545" : todayLog.riskScore >= 25 ? "#fd7e14" : "#28a745" }}>
                                                    {todayLog.riskScore}
                                                </h2>
                                                <span className="text-muted small mb-1">/ 100</span>
                                            </div>
                                            <div className="progress mb-2" style={{ height: 10, borderRadius: 10 }}>
                                                <div className="progress-bar" role="progressbar"
                                                    style={{ width: `${todayLog.riskScore}%`, borderRadius: 10, backgroundColor: todayLog.riskScore >= 50 ? "#dc3545" : todayLog.riskScore >= 25 ? "#fd7e14" : "#28a745" }}
                                                />
                                            </div>
                                            <p className="text-muted small mb-0 d-flex align-items-start gap-2">
                                                {todayLog.riskScore < 25 ? (
                                                    <>
                                                        <i className="ri-shield-check-line text-success flex-shrink-0 mt-1" aria-hidden />
                                                        <span>Low risk — keep it up!</span>
                                                    </>
                                                ) : todayLog.riskScore < 50 ? (
                                                    <>
                                                        <i className="ri-alert-line text-warning flex-shrink-0 mt-1" aria-hidden />
                                                        <span>Moderate — monitor closely.</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="ri-error-warning-line text-danger flex-shrink-0 mt-1" aria-hidden />
                                                        <span>High risk — please contact your care team.</span>
                                                    </>
                                                )}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-muted small mb-0">Complete today's check-in to calculate your risk score.</p>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body>
                                    <h6 className="text-primary fw-bold mb-3">
                                        <i className="ri-history-line me-2"></i>Recent Check-ins
                                    </h6>
                                    {history.length > 0 ? (
                                        <div className="d-flex flex-column gap-2">
                                            {history.slice(-4).reverse().map((log) => (
                                                <div key={log._id} className="d-flex justify-content-between align-items-center py-1 border-bottom">
                                                    <span className="small text-muted">
                                                        {new Date(log.recordedAt || log.createdAt || log.date).toLocaleString("fr-FR", {
                                                            timeZone: VITALS_CHART_TIMEZONE,
                                                            day: "2-digit",
                                                            month: "short",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                    <span className="small d-inline-flex align-items-center gap-1">
                                                        {log.vitals?.heartRate ? (
                                                            <>
                                                                <i className="ri-heart-pulse-line text-danger" aria-hidden />
                                                                <span>{log.vitals.heartRate} bpm</span>
                                                            </>
                                                        ) : (
                                                            "—"
                                                        )}
                                                    </span>
                                                    <span className="badge" style={{ backgroundColor: log.riskScore >= 50 ? "#dc3545" : log.riskScore >= 25 ? "#fd7e14" : "#28a745", fontSize: "0.68rem" }}>
                                                        Risk: {log.riskScore}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted small mb-0">No history yet. Logs will appear here after your first check-in.</p>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>

            {/* ─── NEW BOTTOM ROW: Medications | Appointments | Care Team | Discharge ─── */}
            <Row className="g-3 mt-1">
                <Col lg={3} md={6}>
                    <MedicationsCard
                        patientId={pid}
                        medications={activeMedications}
                        onUpdate={loadMedications}
                        allowAdd={false}
                    />
                </Col>
                <Col lg={3} md={6}>
                    <AppointmentsCard appointments={appointments} />
                </Col>
                <Col lg={3} md={6}>
                    <CareTeamCard
                        doctor={careDoctor}
                        nurse={careNurse}
                    />
                </Col>
                <Col lg={3} md={6}>
                    <DischargeSummaryCard patient={patientUser} />
                </Col>
            </Row>
        </>
    );
};

export default PatientDashboard;
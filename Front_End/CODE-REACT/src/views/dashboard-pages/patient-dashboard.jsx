import React, { useEffect, useState, useRef } from "react";
import { Row, Col } from "react-bootstrap";
import ApexCharts from 'apexcharts';
import Card from "../../components/Card";
import DailyCheckIn from "../../components/DailyCheckIn";
import { healthLogApi } from "../../services/api";

// Local date string — avoids UTC timezone bug
const localDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const generatePath = (path) => {
    return window.origin + import.meta.env.BASE_URL + path;
};

// Helper: HR status label + color
const hrStatus = (hr) => {
    if (!hr) return { label: "No data", color: "#6c757d" };
    if (hr < 60) return { label: "Low — Bradycardia", color: "#dc3545" };
    if (hr <= 100) return { label: "Normal Range", color: "#28a745" };
    return { label: "Elevated — Tachycardia", color: "#fd7e14" };
};

// Helper: BP status
const bpStatus = (sys) => {
    if (!sys) return { label: "No data", color: "#6c757d" };
    if (sys < 90) return { label: "Low Blood Pressure", color: "#dc3545" };
    if (sys <= 120) return { label: "Normal", color: "#28a745" };
    if (sys <= 140) return { label: "Slightly Elevated", color: "#fd7e14" };
    return { label: "High — Monitor Closely", color: "#dc3545" };
};

// Helper: O2 status
const o2Status = (o2) => {
    if (!o2) return { label: "No data", color: "#6c757d" };
    if (o2 >= 95) return { label: "Normal", color: "#28a745" };
    if (o2 >= 90) return { label: "Low — Seek Advice", color: "#fd7e14" };
    return { label: "Critical — Seek Help", color: "#dc3545" };
};

// Helper: mood emoji
const moodDisplay = (mood) => {
    if (mood === "good") return { emoji: "😊", label: "Good", color: "#28a745" };
    if (mood === "fair") return { emoji: "😐", label: "Fair", color: "#fd7e14" };
    if (mood === "poor") return { emoji: "😔", label: "Poor", color: "#dc3545" };
    return { emoji: "—", label: "—", color: "#6c757d" };
};

const VitalCard = ({ icon, iconColor, title, value, unit, status, noDataMsg }) => (
    <Card className="h-100 border-0 shadow-sm">
        <Card.Body>
            <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="text-primary mb-0 fw-bold">{title}</h6>
                <i className={`${icon} fs-4`} style={{ color: iconColor }}></i>
            </div>
            {value ? (
                <>
                    <h3 className="mb-0 fw-bold">{value}<small className="fs-6 text-muted ms-1">{unit}</small></h3>
                    <span className="badge mt-1" style={{ backgroundColor: status.color, fontSize: "0.7rem" }}>
                        {status.label}
                    </span>
                </>
            ) : (
                <p className="text-muted small mt-2 mb-0">{noDataMsg || "Complete today's check-in to see this."}</p>
            )}
        </Card.Body>
    </Card>
);

const PatientDashboard = () => {
    const [patientUser] = useState(() => {
        try {
            const stored = localStorage.getItem("patientUser");
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });

    const [todayLog, setTodayLog] = useState(null);
    const [history, setHistory] = useState([]);
    const [activeVital, setActiveVital] = useState("heartRate");
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    const loadTodayLog = async () => {
        const pid = patientUser?.id || patientUser?._id;
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
        const pid = patientUser?.id || patientUser?._id;
        if (!pid) return;
        try {
            const logs = await healthLogApi.getHistory(pid);
            setHistory(Array.isArray(logs) ? logs.slice(0, 7).reverse() : []);
        } catch (e) {
            console.error('[Dashboard] Failed to load history:', e);
            setHistory([]);
        }
    };

    useEffect(() => {
        loadTodayLog();
        loadHistory();
    }, [patientUser?._id]);

    // Build chart series from history
    const chartDates = history.map(l => new Date(l.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
    const vitalOptions = {
        heartRate: { label: "Heart Rate (bpm)", key: "heartRate", color: "#dc3545", unit: "bpm" },
        bloodPressureSystolic: { label: "Blood Pressure Systolic (mmHg)", key: "bloodPressureSystolic", color: "#089bab", unit: "mmHg" },
        oxygenSaturation: { label: "O₂ Saturation (%)", key: "oxygenSaturation", color: "#6f42c1", unit: "%" },
        temperature: { label: "Temperature (°C)", key: "temperature", color: "#fd7e14", unit: "°C" },
    };

    const selectedVital = vitalOptions[activeVital];
    const chartData = history.map(l => l.vitals?.[selectedVital.key] ?? null);
    const hasChartData = chartData.some(v => v !== null);

    useEffect(() => {
        if (!chartRef.current) return;
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
            chartInstanceRef.current = null;
        }
        const opts = {
            series: [{ name: selectedVital.label, data: chartData }],
            chart: { type: 'area', height: 260, toolbar: { show: false }, animations: { enabled: true } },
            colors: [selectedVital.color],
            stroke: { curve: 'smooth', width: 3 },
            fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05 } },
            dataLabels: { enabled: false },
            xaxis: {
                categories: chartDates.length > 0 ? chartDates : ["—"],
                labels: { style: { fontSize: '11px' } }
            },
            yaxis: { title: { text: selectedVital.unit }, labels: { style: { fontSize: '11px' } } },
            markers: { size: 5, colors: [selectedVital.color], strokeWidth: 2 },
            tooltip: { y: { formatter: (val) => val ? `${val} ${selectedVital.unit}` : "No data" } },
            noData: { text: "No data yet — complete a check-in!", style: { color: "#6c757d" } },
            grid: { borderColor: '#f1f1f1' },
        };
        const chart = new ApexCharts(chartRef.current, opts);
        chart.render();
        chartInstanceRef.current = chart;
        return () => { chart.destroy(); chartInstanceRef.current = null; };
    }, [history, activeVital]);

    const computeAge = (dob) => {
        if (!dob) return null;
        const b = new Date(dob), t = new Date();
        let age = t.getFullYear() - b.getFullYear();
        if (t.getMonth() - b.getMonth() < 0 || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) age--;
        return age;
    };

    const userData = {
        name: patientUser ? `${patientUser.firstName || ''} ${patientUser.lastName || ''}`.trim() || patientUser.email : "Patient",
        age: computeAge(patientUser?.dateOfBirth),
        gender: patientUser?.gender || null,
        bloodType: patientUser?.bloodType || null,
        location: [patientUser?.city, patientUser?.country].filter(Boolean).join(', ') || patientUser?.service || "—",
        weight: patientUser?.weight || todayLog?.vitals?.weight || "—",
        height: patientUser?.height || "—",
        profileImage: patientUser?.profileImage?.startsWith("data:") ? patientUser.profileImage
            : patientUser?.profileImage?.startsWith("http") ? patientUser.profileImage
            : patientUser?.profileImage ? generatePath(patientUser.profileImage.startsWith("/") ? patientUser.profileImage.slice(1) : patientUser.profileImage)
            : generatePath(`/assets/images/user/11.png`)
    };

    // Today's vitals
    const v = todayLog?.vitals || {};
    const hr = hrStatus(v.heartRate);
    const bp = bpStatus(v.bloodPressureSystolic);
    const o2 = o2Status(v.oxygenSaturation);
    const mood = moodDisplay(todayLog?.mood);
    const painLevel = todayLog?.painLevel ?? null;

    return (
        <>
            {/* Risk alert banner */}
            {todayLog?.flagged && (
                <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                    <i className="ri-alert-line me-2 fs-5"></i>
                    <span><b>Attention:</b> Your vitals require follow-up — your care team has been notified.</span>
                </div>
            )}

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
                            patientId={patientUser?.id || patientUser?._id}
                            existingLog={todayLog?.date === localDateString() ? todayLog : null}
                            onSubmitted={() => { loadTodayLog(); loadHistory(); }}
                        />
                    </div>

                    {/* Today's Wellbeing */}
                    <Card className="mt-3 border-0 shadow-sm">
                        <Card.Body>
                            <h6 className="text-primary fw-bold mb-3"><i className="ri-mental-health-line me-2"></i>Today's Wellbeing</h6>
                            {todayLog ? (
                                <>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="text-muted small">Mood</span>
                                        <span className="fw-bold" style={{ color: mood.color }}>{mood.emoji} {mood.label}</span>
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
                    {/* Today's Vitals — 4 cards */}
                    <Row className="g-3 mb-3">
                        <Col md={3}>
                            <VitalCard
                                icon="ri-heart-line"
                                iconColor="#dc3545"
                                title="Heart Rate"
                                value={v.heartRate}
                                unit="bpm"
                                status={hr}
                                noDataMsg="Log your vitals to see heart rate."
                            />
                        </Col>
                        <Col md={3}>
                            <VitalCard
                                icon="ri-drop-line"
                                iconColor="#089bab"
                                title="Blood Pressure"
                                value={v.bloodPressureSystolic ? `${v.bloodPressureSystolic}/${v.bloodPressureDiastolic}` : null}
                                unit="mmHg"
                                status={bp}
                                noDataMsg="Log your vitals to see BP."
                            />
                        </Col>
                        <Col md={3}>
                            <VitalCard
                                icon="ri-lungs-line"
                                iconColor="#6f42c1"
                                title="O₂ Saturation"
                                value={v.oxygenSaturation}
                                unit="%"
                                status={o2}
                                noDataMsg="Log your vitals to see O₂."
                            />
                        </Col>
                        <Col md={3}>
                            <VitalCard
                                icon="ri-temp-hot-line"
                                iconColor="#fd7e14"
                                title="Temperature"
                                value={v.temperature}
                                unit="°C"
                                status={v.temperature ? { label: v.temperature < 36 ? "Low" : v.temperature > 38.5 ? "Fever" : "Normal", color: v.temperature < 36 || v.temperature > 38.5 ? "#dc3545" : "#28a745" } : { label: "—", color: "#6c757d" }}
                                noDataMsg="Log your vitals to see temperature."
                            />
                        </Col>
                    </Row>

                    {/* Vitals History Chart */}
                    <Card className="border-0 shadow-sm mb-3">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="text-primary fw-bold mb-0">
                                    <i className="ri-line-chart-line me-2"></i>7-Day Vitals History
                                </h6>
                                <div className="d-flex gap-1 flex-wrap">
                                    {Object.entries(vitalOptions).map(([key, opt]) => (
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
                                    No data yet — start logging your daily check-ins to see trends here.
                                </p>
                            )}
                            <div ref={chartRef}></div>
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
                                    {todayLog ? (
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
                                            <p className="text-muted small mb-0">
                                                {todayLog.riskScore < 25 ? "✅ Low risk — keep it up!" :
                                                    todayLog.riskScore < 50 ? "⚠️ Moderate — monitor closely." :
                                                        "🔴 High risk — please contact your care team."}
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
                                                        {new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                    </span>
                                                    <span className="small">
                                                        {log.vitals?.heartRate ? `❤️ ${log.vitals.heartRate} bpm` : "—"}
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
        </>
    );
};

export default PatientDashboard;
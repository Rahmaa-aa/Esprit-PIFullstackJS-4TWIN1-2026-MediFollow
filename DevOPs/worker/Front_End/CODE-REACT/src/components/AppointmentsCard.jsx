import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const TYPE_COLORS = { checkup: "#089bab", lab: "#6f42c1", specialist: "#fd7e14", imaging: "#dc3545", physiotherapy: "#28a745" };

const localTodayYmd = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const daysUntil = (dateStr) => {
  const d0 = new Date(`${(dateStr || "").split("T")[0]}T12:00:00`);
  const d1 = new Date(`${localTodayYmd()}T12:00:00`);
  return Math.ceil((d0 - d1) / (1000 * 60 * 60 * 24));
};

const AppointmentsCard = ({ appointments: initialAppts }) => {
  const { t, i18n } = useTranslation();
  const [appts, setAppts] = useState(initialAppts || []);
  const [showAll, setShowAll] = useState(false);

  const monthLocale = useMemo(() => {
    const l = (i18n.language || "en").split("-")[0];
    if (l === "ar") return "ar";
    if (l === "fr") return "fr";
    return "en";
  }, [i18n.language]);

  useEffect(() => {
    setAppts(initialAppts || []);
  }, [initialAppts]);

  const todayStr = localTodayYmd();
  const upcoming = appts
    .filter((a) => {
      if (a.status === "cancelled" || a.status === "pending") return false;
      const d = (a.date || "").split("T")[0];
      return d >= todayStr;
    })
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  const displayed = showAll ? upcoming : upcoming.slice(0, 3);

  return (
    <div id="patient-appointments" className="card border-0 shadow-sm" style={{ borderRadius: 14 }}>
      <div className="card-body">
        <h6 className="text-primary fw-bold mb-2">
          <i className="ri-calendar-event-line me-2"></i>{t("patientCards.appointments.title")}
        </h6>
        <div className="mb-3">
          <Link to="/dashboard-pages/patient-appointment-request" className="small text-decoration-none">
            <i className="ri-calendar-schedule-line me-1"></i>
            {t("patientCards.appointments.requestLink")}
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <p className="text-muted small text-center mb-0 py-2">{t("patientCards.appointments.empty")}</p>
        ) : (
          <>
            <div className="d-flex flex-column gap-2">
              {displayed.map((a) => {
                const days = daysUntil(a.date);
                const color = TYPE_COLORS[a.type] || "#089bab";
                return (
                  <div
                    key={a._id}
                    className="d-flex align-items-start gap-3 p-2 rounded-3"
                    style={{ backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" }}
                  >
                    <div className="text-center rounded-2 p-2 flex-shrink-0" style={{ backgroundColor: color, minWidth: 48 }}>
                      <div className="text-white fw-bold" style={{ fontSize: "1.1rem", lineHeight: 1 }}>
                        {new Date(a.date).getDate()}
                      </div>
                      <div className="text-white" style={{ fontSize: "0.65rem", opacity: 0.9 }}>
                        {new Date(a.date).toLocaleString(monthLocale, { month: "short" }).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-grow-1 min-width-0">
                      <div className="fw-bold small text-truncate">{a.title}</div>
                      <div className="text-muted" style={{ fontSize: "0.72rem" }}>
                        {a.time && (
                          <span className="me-2">
                            <i className="ri-time-line me-1"></i>
                            {a.time}
                          </span>
                        )}
                        {a.location && (
                          <span>
                            <i className="ri-map-pin-line me-1"></i>
                            {a.location}
                          </span>
                        )}
                      </div>
                      {a.doctorName && (
                        <div className="text-primary mb-1" style={{ fontSize: "0.72rem" }}>
                          Dr. {a.doctorName}
                        </div>
                      )}
                      {a.isVideoCall && (
                        <button
                          className="btn btn-sm btn-primary py-0 px-2 rounded-pill mt-1"
                          style={{ fontSize: "0.7rem", height: "22px" }}
                          onClick={() =>
                            window.medifollow?.startCall?.(String(a.doctorId), {
                              peerName: `Dr. ${a.doctorName || "Doctor"}`,
                              peerRole: "doctor",
                              video: true,
                            })
                          }
                        >
                          <i className="ri-vidicon-fill me-1"></i>
                          Join Video
                        </button>
                      )}
                    </div>
                    <div className="text-end flex-shrink-0">
                      <span className="badge" style={{ backgroundColor: color, fontSize: "0.65rem" }}>
                        {a.type}
                      </span>
                      <div className="text-muted mt-1" style={{ fontSize: "0.65rem" }}>
                        {days === 0 ? t("patientCards.appointments.today") : days === 1 ? t("patientCards.appointments.tomorrow") : t("patientCards.appointments.inDays", { count: days })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {upcoming.length > 3 && (
              <button type="button" className="btn btn-sm btn-link text-primary p-0 mt-2" onClick={() => setShowAll(!showAll)}>
                {showAll ? t("patientCards.appointments.showLess") : t("patientCards.appointments.showAll", { count: upcoming.length })}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentsCard;

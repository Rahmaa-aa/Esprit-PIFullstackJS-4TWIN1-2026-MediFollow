import React from "react";
import { useTranslation } from "react-i18next";

const generatePath = (path) => {
  if (!path) return null;
  if (path.startsWith("data:") || path.startsWith("http")) return path;
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  return `${window.origin}${base}/${p}`.replace(/([^:])\/\/+/g, "$1/");
};

const CareTeamCard = ({ doctor, nurse }) => {
  const { t } = useTranslation();

  const MemberCard = ({ person, role, icon, color }) => (
    <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" }}>
      <div className="position-relative">
        <img
          src={generatePath(person?.profileImage) || `https://ui-avatars.com/api/?name=${encodeURIComponent((person?.firstName || role).slice(0, 2))}&background=${color.replace('#', '')}&color=fff&size=64`}
          alt={person?.firstName}
          className="rounded-circle"
          style={{ width: 52, height: 52, objectFit: "cover", border: `2px solid ${color}` }}
        />
        <span className="position-absolute bottom-0 end-0 rounded-circle" style={{ width: 12, height: 12, backgroundColor: "#28a745", border: "2px solid white" }}></span>
      </div>
      <div className="flex-grow-1 min-width-0">
        <div className="fw-bold small text-truncate">
          {person ? `${person.firstName || ""} ${person.lastName || ""}`.trim() || person.email : t("patientCards.careTeam.notAssigned")}
        </div>
        <div className="text-muted" style={{ fontSize: "0.72rem" }}>
          <i className={`${icon} me-1`} style={{ color }}></i>{role}
          {person?.specialty && <span className="ms-2 text-muted">• {person.specialty}</span>}
        </div>
        {person?.phone && (
          <div style={{ fontSize: "0.7rem" }}>
            <a href={`tel:${person.phone}`} className="text-primary text-decoration-none"><i className="ri-phone-line me-1"></i>{person.phone}</a>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 14 }}>
      <div className="card-body">
        <h6 className="text-primary fw-bold mb-3"><i className="ri-team-line me-2"></i>{t("patientCards.careTeam.title")}</h6>
        <div className="d-flex flex-column gap-2">
          <MemberCard person={doctor} role={t("patientCards.careTeam.physician")} icon="ri-stethoscope-line" color="#089bab" />
          <MemberCard person={nurse} role={t("patientCards.careTeam.nurse")} icon="ri-nurse-line" color="#6f42c1" />
        </div>
        {!doctor && !nurse && (
          <p className="text-muted small text-center mt-2 mb-0">{t("patientCards.careTeam.empty")}</p>
        )}
      </div>
    </div>
  );
};

export default CareTeamCard;

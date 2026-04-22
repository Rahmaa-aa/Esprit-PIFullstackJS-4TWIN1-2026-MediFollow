import React, { useEffect, useState } from "react";
import { Alert, Button, Col, Container, Row, Spinner } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { patientApi } from "../../services/api";
import DoctorPatientDossierView from "./doctor-patient-dossier-view";
import "./doctor-patient-dossier.css";

function patientInitials(p) {
  const f = String(p.firstName || "")
    .trim()
    .charAt(0);
  const l = String(p.lastName || "")
    .trim()
    .charAt(0);
  return (f + l).toUpperCase() || "?";
}

const DoctorPatientDossierPage = () => {
  const { t } = useTranslation();
  const { patientId } = useParams();
  const [doctorUser] = useState(() => {
    try {
      const s = localStorage.getItem("doctorUser");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const doctorId = doctorUser?.id || doctorUser?._id;

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!doctorId || !patientId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const raw = await patientApi.getMyAssignedForDoctor();
        const list = Array.isArray(raw) ? raw : [];
        const p = list.find((x) => String(x._id || x.id) === String(patientId));
        if (!cancelled) {
          setPatient(p || null);
          if (!p) setError(t("doctorPatientDossier.notFoundOrUnassigned"));
        }
      } catch (e) {
        if (!cancelled) setError(e.message || t("doctorPatientDossier.loadPatientError"));
        if (!cancelled) setPatient(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [doctorId, patientId]);

  if (!doctorId) {
    return (
      <Container className="py-5">
        <p className="text-muted text-center">{t("doctorMyPatients.loginDoctor")}</p>
        <div className="text-center">
          <Link to="/auth/sign-in" className="btn btn-primary">
            {t("doctorMyPatients.signIn")}
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="pb-5 px-3 px-lg-4">
      <Row className="justify-content-center g-0">
        <Col className="dossier-page-wrap">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <nav className="d-flex flex-wrap align-items-center gap-2 small dossier-breadcrumb mb-0">
              <Link
                to="/doctor/my-patients"
                className="text-decoration-none text-muted d-inline-flex align-items-center"
              >
                <i className="ri-arrow-left-s-line me-1" />
                {t("doctorPatientDossier.breadcrumbMyPatients")}
              </Link>
              <span className="text-muted opacity-50">/</span>
              <span className="text-muted">{t("doctorPatientDossier.breadcrumbClinical")}</span>
            </nav>
            <Button variant="outline-secondary" size="sm" as={Link} to="/doctor/my-patients" className="rounded-pill">
              <i className="ri-arrow-go-back-line me-1" />
              {t("doctorPatientDossier.back")}
            </Button>
          </div>

          {loading && (
            <div className="dossier-hero rounded-4 p-5 text-center">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <p className="text-muted small mb-0">{t("doctorPatientDossier.loadingPatient")}</p>
            </div>
          )}

          {!loading && error && (
            <Alert variant="danger" className="rounded-4 border-0 shadow-sm">
              <i className="ri-error-warning-line me-2" />
              {error}
            </Alert>
          )}

          {!loading && !error && patient && (
            <>
              <header className="dossier-hero rounded-4 p-4 p-lg-4 mb-4">
                <div className="d-flex flex-column flex-sm-row align-items-start gap-4">
                  <div
                    className="dossier-hero-avatar rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-semibold"
                    aria-hidden
                  >
                    {patientInitials(patient)}
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <p className="text-uppercase text-muted small fw-semibold mb-1" style={{ letterSpacing: "0.08em" }}>
                      {t("doctorPatientDossier.heroEyebrow")}
                    </p>
                    <h1 className="h3 fw-bold mb-3 text-dark mb-sm-3">
                      {patient.firstName} {patient.lastName}
                    </h1>
                    <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
                      <span className="d-inline-flex align-items-center gap-2 rounded-pill bg-white border px-3 py-2 small shadow-sm">
                        <i className="ri-mail-line text-primary" />
                        <span className="text-break">{patient.email}</span>
                      </span>
                      {(patient.department || patient.service) && (
                        <span className="d-inline-flex align-items-center gap-2 rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 small">
                          <i className="ri-hospital-line" />
                          {patient.department || patient.service}
                        </span>
                      )}
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      <Button
                        variant="primary"
                        className="rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm"
                        onClick={() =>
                          window.medifollow?.startCall?.(String(patient._id || patient.id), {
                            peerName: `${patient.firstName} ${patient.lastName}`,
                            peerRole: "patient",
                            video: true,
                          })
                        }
                      >
                        <i className="ri-vidicon-fill" />
                        {t("chat.data.videoCall", "Video Call")}
                      </Button>
                      <Button
                        variant="outline-primary"
                        className="rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm bg-white"
                        onClick={() =>
                          window.medifollow?.startCall?.(String(patient._id || patient.id), {
                            peerName: `${patient.firstName} ${patient.lastName}`,
                            peerRole: "patient",
                            video: false,
                          })
                        }
                      >
                        <i className="ri-phone-fill" />
                        {t("chat.data.voiceCall", "Audio Call")}
                      </Button>
                    </div>
                  </div>
                </div>
              </header>

              <DoctorPatientDossierView patient={patient} />
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default DoctorPatientDossierPage;

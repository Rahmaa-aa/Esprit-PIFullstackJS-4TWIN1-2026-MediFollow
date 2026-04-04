import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LandingShell from "../components/landing/LandingShell";
import { landingImg } from "./landing/landingPaths";

const About = () => {
  const { t } = useTranslation();

  const missions = [
    { titleKey: "aboutPage.m1Title", textKey: "aboutPage.m1Text", icon: "bi-signpost-split" },
    { titleKey: "aboutPage.m2Title", textKey: "aboutPage.m2Text", icon: "bi-shield-check" },
    { titleKey: "aboutPage.m3Title", textKey: "aboutPage.m3Text", icon: "bi-people-fill" },
  ];

  const values = [
    { titleKey: "aboutPage.v1Title", textKey: "aboutPage.v1Text", icon: "bi-hospital" },
    { titleKey: "aboutPage.v2Title", textKey: "aboutPage.v2Text", icon: "bi-link-45deg" },
    { titleKey: "aboutPage.v3Title", textKey: "aboutPage.v3Text", icon: "bi-arrow-repeat" },
  ];

  const badges = [
    { key: "aboutPage.engage24", icon: "bi-clock-history" },
    { key: "aboutPage.engageSpec", icon: "bi-heart-pulse" },
    { key: "aboutPage.engageTeam", icon: "bi-person-badge" },
    { key: "aboutPage.engageDigital", icon: "bi-cpu" },
  ];

  return (
    <LandingShell navActive="about">
      <div
        className="container-fluid bg-primary py-5 mb-5 hero-header landing-hero about-page-hero"
        style={{
          backgroundImage: `url(${landingImg("chu-about.jpg")})`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <Container className="py-4 py-lg-5">
          <span className="visually-hidden">{t("landing.aboutImageAlt")}</span>
          <Row className="justify-content-center justify-content-lg-start">
            <Col lg={10} xl={9} className="text-center text-lg-start">
              <h5 className="hero-kicker d-inline-block text-uppercase border-bottom border-5 border-primary mb-3">{t("aboutPage.heroKicker")}</h5>
              <h1 className="display-3 text-white fw-bold mb-3">{t("aboutPage.heroTitle")}</h1>
              <p className="text-white lead mb-0 pe-lg-5">{t("aboutPage.heroLead")}</p>
            </Col>
          </Row>
        </Container>
      </div>

      <div className="container-fluid py-5">
        <Container>
          <Row className="gx-5 align-items-start">
            <Col lg={6} className="mb-5 mb-lg-0">
              <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5 mb-3">{t("landing.aboutKicker")}</h5>
              <h2 className="display-5 fw-bold text-dark mb-3">{t("aboutPage.chuTitle")}</h2>
              <p className="fw-semibold text-secondary mb-3">{t("aboutPage.chuLead")}</p>
              <p className="text-muted mb-3">{t("aboutPage.chuP1")}</p>
              <p className="text-muted mb-0">{t("aboutPage.chuP2")}</p>
            </Col>
            <Col lg={6}>
              <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5 mb-3">{t("landing.featuresKicker")}</h5>
              <h2 className="display-5 fw-bold text-dark mb-3">{t("aboutPage.mfTitle")}</h2>
              <p className="fw-semibold text-secondary mb-3">{t("aboutPage.mfLead")}</p>
              <p className="text-muted mb-0">{t("aboutPage.mfP1")}</p>
            </Col>
          </Row>
        </Container>
      </div>

      <div className="container-fluid py-5 bg-light">
        <Container>
          <div className="text-center mx-auto mb-5" style={{ maxWidth: "720px" }}>
            <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">{t("aboutPage.missionKicker")}</h5>
            <h2 className="display-4 text-dark mt-2">{t("aboutPage.missionTitle")}</h2>
          </div>
          <Row className="g-4 g-lg-5 justify-content-center">
            {missions.map((m, i) => (
              <Col key={i} lg={4} md={6}>
                <div className="service-item about-mission-item bg-white rounded d-flex flex-column align-items-center justify-content-start text-center shadow-sm pt-4">
                  <div className="service-icon mb-4">
                    <i className={`bi ${m.icon} text-white about-mission-icon`} aria-hidden />
                  </div>
                  <h3 className="h4 mb-3 px-2">{t(m.titleKey)}</h3>
                  <p className="text-muted small mb-0 px-3">{t(m.textKey)}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      <div className="container-fluid py-5 about-values-section">
        <Container>
          <div className="text-center mx-auto mb-5 pb-2" style={{ maxWidth: "720px" }}>
            <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">{t("aboutPage.valuesKicker")}</h5>
            <h2 className="display-4 text-dark mt-3 mb-0">{t("aboutPage.valuesTitle")}</h2>
          </div>
          <Row className="g-4 g-lg-5 justify-content-center">
            {values.map((v, i) => (
              <Col lg={4} md={6} key={i}>
                <div className="about-value-card text-center d-flex flex-column align-items-center">
                  <div className="service-icon mb-4">
                    <i className={`bi ${v.icon} text-white about-value-icon`} aria-hidden />
                  </div>
                  <h3 className="about-value-title">{t(v.titleKey)}</h3>
                  <p className="about-value-text">{t(v.textKey)}</p>
                </div>
              </Col>
            ))}
          </Row>

          <div className="about-engage-in-light mt-5 pt-5">
            <div className="text-center mx-auto mb-4 mb-lg-5 pb-2" style={{ maxWidth: "720px" }}>
              <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">{t("aboutPage.engageKicker")}</h5>
              <h2 className="display-5 text-dark fw-bold mt-3 mb-0">{t("aboutPage.engageTitle")}</h2>
            </div>
            <Row className="g-4 about-engage-grid justify-content-center">
              {badges.map((b, i) => (
                <Col sm={6} lg={3} key={i}>
                  <div className="about-engage-card about-engage-card--light h-100">
                    <div className="about-engage-card-icon about-engage-card-icon--light" aria-hidden>
                      <i className={`bi ${b.icon}`} />
                    </div>
                    <p className="about-engage-card-text about-engage-card-text--light">{t(b.key)}</p>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </Container>
      </div>

      <div className="container-fluid bg-primary my-5 py-5 about-cta-bar">
        <Container className="py-lg-1">
          <Row className="gx-5 gy-4 align-items-center">
            <Col lg={7} xl={8} className="text-center text-lg-start">
              <h5 className="d-inline-block text-white text-uppercase border-bottom border-5 border-white border-opacity-50 mb-3">{t("landing.cta2Kicker")}</h5>
              <h2 className="display-5 text-white fw-bold mb-3">{t("aboutPage.ctaTitle")}</h2>
              <p className="text-white mb-0 opacity-90 about-cta-lead mx-auto mx-lg-0">{t("aboutPage.ctaLead")}</p>
            </Col>
            <Col lg={5} xl={4} className="text-center text-lg-end">
              <div className="about-cta-actions ms-lg-auto">
                <Button as={Link} to="/" size="lg" className="rounded-pill about-cta-btn-home">
                  {t("aboutPage.btnHome")}
                </Button>
                <Button as={Link} to="/auth/sign-in" variant="outline-light" size="lg" className="rounded-pill about-cta-btn-signin">
                  {t("aboutPage.btnSignIn")}
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </LandingShell>
  );
};

export default About;

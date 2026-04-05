import React from "react";
import { Container, Row, Col, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LandingShell from "../components/landing/LandingShell";
import { landingImg } from "./landing/landingPaths";

const Contact = () => {
  const { t } = useTranslation();
  const phoneRaw = String(t("landing.contactPhone")).replace(/\s/g, "");
  const email = t("landing.contactEmail");

  const cards = [
    {
      titleKey: "contactPage.addressTitle",
      icon: "bi-geo-alt",
      body: t("landing.footerAddress"),
      href: null,
    },
    {
      titleKey: "contactPage.emailTitle",
      icon: "bi-envelope",
      body: email,
      href: `mailto:${email}`,
    },
    {
      titleKey: "contactPage.phoneTitle",
      icon: "bi-telephone",
      body: t("landing.contactPhone"),
      href: `tel:${phoneRaw}`,
    },
  ];

  return (
    <LandingShell navActive="contact">
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
          <Row className="justify-content-center justify-content-lg-start">
            <Col lg={10} xl={9} className="text-center text-lg-start">
              <h5 className="hero-kicker d-inline-block text-uppercase border-bottom border-5 border-primary mb-3">{t("contactPage.heroKicker")}</h5>
              <h1 className="display-3 text-white fw-bold mb-3">{t("contactPage.heroTitle")}</h1>
              <p className="text-white lead mb-0 pe-lg-5">{t("contactPage.heroLead")}</p>
            </Col>
          </Row>
        </Container>
      </div>

      <div className="container-fluid py-5">
        <Container>
          <div className="text-center mx-auto mb-5" style={{ maxWidth: "720px" }}>
            <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">{t("contactPage.introKicker")}</h5>
            <h2 className="display-5 text-dark fw-bold mt-3 mb-3">{t("contactPage.introTitle")}</h2>
            <p className="lead text-muted mb-0">{t("contactPage.introLead")}</p>
          </div>
          <Row className="g-4 g-lg-5 justify-content-center">
            {cards.map((c, i) => (
              <Col md={6} lg={4} key={i}>
                <div className="contact-info-card h-100 text-center d-flex flex-column align-items-center">
                  <div className="contact-info-icon" aria-hidden>
                    <i className={`bi ${c.icon}`} />
                  </div>
                  <h3 className="contact-info-card-title">{t(c.titleKey)}</h3>
                  {c.href ? (
                    <a href={c.href} className="contact-info-card-link">
                      {c.body}
                    </a>
                  ) : (
                    <p className="contact-info-card-body mb-0">{c.body}</p>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      <div className="container-fluid py-5 bg-light">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10} xl={8}>
              <div className="bg-white rounded shadow-sm border border-light p-4 p-lg-5">
                <h3 className="h5 fw-bold text-dark mb-3">{t("contactPage.hoursTitle")}</h3>
                <p className="text-muted mb-3">{t("contactPage.hoursText")}</p>
                <p className="text-muted small mb-0">{t("contactPage.accountHint")}</p>
              </div>
              <Alert variant="light" className="border border-secondary border-opacity-25 mt-4 mb-0 contact-emergency-alert">
                <i className="bi bi-exclamation-triangle-fill text-primary me-2" aria-hidden />
                {t("contactPage.emergencyNote")}
              </Alert>
            </Col>
          </Row>
        </Container>
      </div>

      <div className="container-fluid bg-primary my-5 py-5 about-cta-bar">
        <Container className="py-lg-1">
          <Row className="gx-5 gy-4 align-items-center">
            <Col lg={7} xl={8} className="text-center text-lg-start">
              <h5 className="d-inline-block text-white text-uppercase border-bottom border-5 border-white border-opacity-50 mb-3">{t("landing.cta2Kicker")}</h5>
              <h2 className="display-5 text-white fw-bold mb-3">{t("contactPage.ctaTitle")}</h2>
              <p className="text-white mb-0 opacity-90 about-cta-lead mx-auto mx-lg-0">{t("contactPage.ctaLead")}</p>
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

export default Contact;

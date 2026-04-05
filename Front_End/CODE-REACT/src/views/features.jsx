import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LandingShell from "../components/landing/LandingShell";
import { landingImg } from "./landing/landingPaths";
import { LANDING_FEATURE_CARDS } from "./landing/landingFeatureCards";

const Features = () => {
  const { t } = useTranslation();

  return (
    <LandingShell navActive="features">
      <div
        className="container-fluid bg-primary py-5 mb-5 hero-header landing-hero about-page-hero"
        style={{
          backgroundImage: `url(${landingImg("chu-hero.jpg")})`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <Container className="py-4 py-lg-5">
          <span className="visually-hidden">{t("landing.heroImageAlt")}</span>
          <Row className="justify-content-center justify-content-lg-start">
            <Col lg={10} xl={9} className="text-center text-lg-start">
              <h5 className="hero-kicker d-inline-block text-uppercase border-bottom border-5 border-primary mb-3">{t("featuresPage.heroKicker")}</h5>
              <h1 className="display-3 text-white fw-bold mb-3">{t("featuresPage.heroTitle")}</h1>
              <p className="text-white lead mb-0 pe-lg-5">{t("featuresPage.heroLead")}</p>
            </Col>
          </Row>
        </Container>
      </div>

      <div className="container-fluid py-5">
        <Container>
          <div className="text-center mx-auto mb-4" style={{ maxWidth: "720px" }}>
            <h2 className="display-6 fw-bold text-dark mb-3">{t("featuresPage.introTitle")}</h2>
            <p className="lead text-muted mb-0">{t("featuresPage.introLead")}</p>
          </div>
        </Container>
      </div>

      <div className="container-fluid py-5 bg-light">
        <Container>
          <div className="text-center mx-auto mb-5" style={{ maxWidth: "640px" }}>
            <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">{t("landing.featuresKicker")}</h5>
            <h2 className="display-4 text-dark mt-2 mb-0">{t("landing.featuresTitle")}</h2>
          </div>
          <Row className="g-4 g-lg-5">
            {LANDING_FEATURE_CARDS.map((s, i) => (
              <Col key={i} lg={4} md={6}>
                <div className="service-item bg-white rounded d-flex flex-column align-items-center justify-content-center text-center shadow-sm">
                  <div className="service-icon mb-4">
                    <i className={`bi ${s.icon} text-white landing-feature-icon`} aria-hidden />
                  </div>
                  <h3 className="h4 mb-3 px-2">{t(s.titleKey)}</h3>
                  <p className="m-0 px-3 pb-4 text-muted">{t(s.descKey)}</p>
                  <Link to="/auth/sign-in" className="btn btn-lg btn-primary rounded-pill mb-4" aria-label={t("landing.navSignIn")}>
                    <i className="bi bi-arrow-right" aria-hidden />
                  </Link>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      <div className="container-fluid bg-primary my-5 py-5 about-cta-bar">
        <Container className="py-lg-1">
          <Row className="gx-5 gy-4 align-items-center">
            <Col lg={7} xl={8} className="text-center text-lg-start">
              <h5 className="d-inline-block text-white text-uppercase border-bottom border-5 border-white border-opacity-50 mb-3">{t("landing.cta2Kicker")}</h5>
              <h2 className="display-5 text-white fw-bold mb-3">{t("featuresPage.ctaTitle")}</h2>
              <p className="text-white mb-0 opacity-90 about-cta-lead mx-auto mx-lg-0">{t("featuresPage.ctaLead")}</p>
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

export default Features;

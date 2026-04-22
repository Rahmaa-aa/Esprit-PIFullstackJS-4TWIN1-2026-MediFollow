import React from "react";
import { Container, Button, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LandingShell from "../components/landing/LandingShell";
import { landingImg } from "./landing/landingPaths";
import { LANDING_FEATURE_CARDS } from "./landing/landingFeatureCards";

const Home = () => {
  const { t } = useTranslation();

  return (
    <LandingShell navActive="home">
      <div
        className="container-fluid bg-primary py-5 mb-5 hero-header landing-hero"
        style={{
          backgroundImage: `url(${landingImg("chu-hero.jpg")})`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <Container className="py-5">
          <span className="visually-hidden">{t("landing.heroImageAlt")}</span>
          <Row className="justify-content-start">
            <Col lg={8} className="text-center text-lg-start">
              <h5 className="hero-kicker d-inline-block text-uppercase border-bottom border-5 border-primary mb-3">{t("landing.heroKicker")}</h5>
              <h1 className="display-1 text-white mb-md-4">{t("landing.heroTitle")}</h1>
              <p className="text-white lead mb-4 pe-lg-5">{t("landing.heroLead")}</p>
              <div className="pt-2">
                <Link to="/auth/sign-in" className="btn btn-light rounded-pill py-md-3 px-md-5 mx-2">
                  {t("landing.ctaExplore")}
                </Link>
                <Link to="/auth/sign-up" className="btn btn-outline-light rounded-pill py-md-3 px-md-5 mx-2">
                  {t("landing.ctaAccount")}
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <div id="about" className="container-fluid py-5">
        <Container>
          <Row className="gx-5 align-items-center">
            <Col lg={5} className="mb-4 mb-lg-0">
              <div className="rounded overflow-hidden shadow-sm" style={{ minHeight: "280px" }}>
                <img
                  className="w-100 h-100"
                  src={landingImg("chu-about.jpg")}
                  alt={t("landing.aboutImageAlt")}
                  style={{ objectFit: "cover", minHeight: "280px" }}
                />
              </div>
            </Col>
            <Col lg={7}>
              <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5 mb-3">{t("landing.aboutKicker")}</h5>
              <h2 className="display-5 fw-bold mb-3">{t("landing.aboutTeaserTitle")}</h2>
              <p className="lead text-muted mb-4">{t("landing.aboutTeaserLead")}</p>
              <Button as={Link} to="/about" variant="primary" size="lg" className="rounded-pill px-4">
                {t("landing.aboutReadMore")}
                <i className="bi bi-arrow-right ms-2" aria-hidden />
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      <div id="features" className="container-fluid py-5 bg-light">
        <Container>
          <div className="text-center mx-auto mb-5" style={{ maxWidth: "640px" }}>
            <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">{t("landing.featuresKicker")}</h5>
            <h1 className="display-4">{t("landing.featuresTitle")}</h1>
          </div>
          <Row className="g-5">
            {LANDING_FEATURE_CARDS.map((s, i) => (
              <Col key={i} lg={4} md={6}>
                <div className="service-item bg-white rounded d-flex flex-column align-items-center justify-content-center text-center shadow-sm">
                  <div className="service-icon mb-4">
                    <i className={`bi ${s.icon} text-white landing-feature-icon`} aria-hidden />
                  </div>
                  <h4 className="mb-3">{t(s.titleKey)}</h4>
                  <p className="m-0 px-3 pb-4">{t(s.descKey)}</p>
                  <Link to="/auth/sign-in" className="btn btn-lg btn-primary rounded-pill mb-4" aria-label={t("landing.navSignIn")}>
                    <i className="bi bi-arrow-right" aria-hidden />
                  </Link>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      <div className="container-fluid bg-primary my-5 py-5">
        <Container className="py-5">
          <Row className="gx-5 align-items-center">
            <Col lg={7} className="mb-5 mb-lg-0">
              <div className="mb-4">
                <h5 className="d-inline-block text-white text-uppercase border-bottom border-5">{t("landing.cta2Kicker")}</h5>
                <h1 className="display-5 text-white">{t("landing.cta2Title")}</h1>
              </div>
              <p className="text-white mb-4 mb-lg-0">{t("landing.cta2Text")}</p>
            </Col>
            <Col lg={5} className="text-lg-end text-center">
              <Link to="/auth/sign-in" className="btn btn-light rounded-pill py-3 px-5 me-lg-2 mb-2 mb-lg-0 d-inline-block">
                {t("landing.cta2Primary")}
              </Link>
              <Link to="/about" className="btn btn-outline-light rounded-pill py-3 px-5 d-inline-block">
                {t("landing.cta2Secondary")}
              </Link>
            </Col>
          </Row>
        </Container>
      </div>

      <div className="container-fluid py-5">
        <Container>
          <div className="text-center mx-auto mb-5" style={{ maxWidth: "640px" }}>
            <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">{t("landing.audienceKicker")}</h5>
            <h1 className="display-4">{t("landing.audienceTitle")}</h1>
          </div>
          <Row className="g-4">
            <Col md={4}>
              <CardLike title={t("landing.audPTitle")} text={t("landing.audPText")} icon="fa-user" />
            </Col>
            <Col md={4}>
              <CardLike title={t("landing.audSTitle")} text={t("landing.audSText")} icon="fa-user-md" />
            </Col>
            <Col md={4}>
              <CardLike title={t("landing.audATitle")} text={t("landing.audAText")} icon="fa-user-shield" />
            </Col>
          </Row>
        </Container>
      </div>
    </LandingShell>
  );
};

function CardLike({ title, text, icon }) {
  return (
    <div className="bg-light rounded p-4 h-100 border border-light shadow-sm">
      <div className="d-flex align-items-start gap-3">
        <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 48, height: 48 }}>
          <i className={`fas ${icon} text-white`} aria-hidden />
        </div>
        <div>
          <h4 className="h5 mb-2">{title}</h4>
          <p className="mb-0 text-muted">{text}</p>
        </div>
      </div>
    </div>
  );
}

export default Home;

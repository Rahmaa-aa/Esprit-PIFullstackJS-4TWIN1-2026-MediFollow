import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LandingShell from "../components/landing/LandingShell";
import { landingImg } from "./landing/landingPaths";
import GlobalNewspaper from "../components/landing/GlobalNewspaper";

const GlobalNews = () => {
  const { t } = useTranslation();

  return (
    <LandingShell navActive="news">
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
          <Row className="justify-content-center justify-content-lg-start">
            <Col lg={10} xl={9} className="text-center text-lg-start">
              <h5 className="hero-kicker d-inline-block text-uppercase border-bottom border-5 border-primary mb-3">World Dispatch</h5>
              <h1 className="display-3 text-white fw-bold mb-3">Global Health News</h1>
              <p className="text-white lead mb-0 pe-lg-5">Real-time global events and breakthroughs from around the world.</p>
            </Col>
          </Row>
        </Container>
      </div>

      <div className="container-fluid py-5">
        <Container>
          <div className="text-center mx-auto mb-4" style={{ maxWidth: "720px" }}>
            <h2 className="display-6 fw-bold text-dark mb-3">The Global Tribune</h2>
            <p className="lead text-muted mb-0">Stay informed with the latest updates from the World Health Organization, Google News, and leading medical journals.</p>
          </div>
        </Container>
      </div>

      <GlobalNewspaper />

      <div className="container-fluid bg-primary my-5 py-5 about-cta-bar">
        <Container className="py-lg-1">
          <Row className="gx-5 gy-4 align-items-center">
            <Col lg={7} xl={8} className="text-center text-lg-start">
              <h5 className="d-inline-block text-white text-uppercase border-bottom border-5 border-white border-opacity-50 mb-3">{t("landing.cta2Kicker")}</h5>
              <h2 className="display-5 text-white fw-bold mb-3">Join the MediFollow Network</h2>
              <p className="text-white mb-0 opacity-90 about-cta-lead mx-auto mx-lg-0">Stay updated and manage your health seamlessly with our patient and doctor network.</p>
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

export default GlobalNews;

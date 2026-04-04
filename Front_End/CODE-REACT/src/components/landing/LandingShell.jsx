import React, { useState, useEffect, useId } from "react";
import { Container, Navbar, Nav, Button, Row, Col, Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageFlag, SvgFlagTn, SvgFlagDz } from "../language-flag-svgs";
import {
  generatePath,
  LANDING_LANGS,
  LANDING_FLAG_WIDTH,
  LANDING_PARTNERSHIP_FLAG_WIDTH,
} from "../../views/landing/landingPaths";

/**
 * En-tête + pied de page communs aux pages publiques (accueil, à propos, fonctionnalités, contact).
 * @param {"home" | "about" | "features" | "contact"} navActive
 */
export default function LandingShell({ navActive = "home", children }) {
  const { t, i18n } = useTranslation();
  const langToggleId = `landing-lang-${useId().replace(/:/g, "")}`;
  const [expanded, setExpanded] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const currentLang = String(i18n.language || "en").split("-")[0];
  const activeLang = LANDING_LANGS.find((l) => l.code === currentLang) || LANDING_LANGS[0];

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = generatePath("hospital/css/style.css");
    link.id = "hospital-template-css";
    document.head.appendChild(link);
    return () => {
      const el = document.getElementById("hospital-template-css");
      if (el) el.remove();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="hospital-home">
      <div className="container-fluid py-2 border-bottom d-none d-lg-block">
        <Container>
          <Row className="align-items-center">
            <Col lg={7} className="text-center text-lg-start mb-2 mb-lg-0">
              <div className="d-inline-flex align-items-center flex-wrap justify-content-center justify-content-lg-start gap-2">
                <a className="text-decoration-none text-body pe-3" href={`tel:${String(t("landing.contactPhone")).replace(/\s/g, "")}`}>
                  <i className="bi bi-telephone me-2" aria-hidden />
                  {t("landing.contactPhone")}
                </a>
                <span className="text-body d-none d-sm-inline">|</span>
                <a className="text-decoration-none text-body px-3" href={`mailto:${t("landing.contactEmail")}`}>
                  <i className="bi bi-envelope me-2" aria-hidden />
                  {t("landing.contactEmail")}
                </a>
              </div>
            </Col>
            <Col lg={5} className="text-center text-lg-end mb-2 mb-lg-0">
              <div
                className="d-inline-flex align-items-center flex-wrap justify-content-center justify-content-lg-end gap-2"
                role="group"
                aria-label={t("nav.regionFlagsTitle")}
              >
                <span className="small text-muted">{t("nav.regionFlagsTitle")}</span>
                <span className="d-inline-flex align-items-center gap-1">
                  <SvgFlagTn width={LANDING_PARTNERSHIP_FLAG_WIDTH} />
                  <SvgFlagDz width={LANDING_PARTNERSHIP_FLAG_WIDTH} />
                </span>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <div className="container-fluid py-2 border-bottom d-lg-none">
        <Container>
          <div
            className="d-flex align-items-center justify-content-center gap-2 flex-wrap"
            role="group"
            aria-label={t("nav.regionFlagsTitle")}
          >
            <span className="small text-muted">{t("nav.regionFlagsTitle")}</span>
            <span className="d-inline-flex align-items-center gap-1">
              <SvgFlagTn width={LANDING_PARTNERSHIP_FLAG_WIDTH} />
              <SvgFlagDz width={LANDING_PARTNERSHIP_FLAG_WIDTH} />
            </span>
          </div>
        </Container>
      </div>

      <div className="container-fluid sticky-top bg-white shadow-sm">
        <Container>
          <Navbar expand="lg" bg="white" variant="light" className="py-3 py-lg-0" expanded={expanded} onToggle={setExpanded}>
            <Navbar.Brand as={Link} to="/">
              <img src={generatePath("assets/images/logosite.png")} alt="MediFollow" style={{ maxHeight: "45px" }} />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="navbarCollapse" />
            <Navbar.Collapse id="navbarCollapse" className="align-items-lg-center">
              <Nav className="ms-auto py-0 align-items-lg-center">
                <Nav.Link as={Link} to="/" className={navActive === "home" ? "active" : ""}>
                  {t("landing.navHome")}
                </Nav.Link>
                <Nav.Link as={Link} to="/about" className={navActive === "about" ? "active" : ""}>
                  {t("landing.navAbout")}
                </Nav.Link>
                <Nav.Link as={Link} to="/features" className={navActive === "features" ? "active" : ""}>
                  {t("landing.navFeatures")}
                </Nav.Link>
                <Nav.Link as={Link} to="/contact" className={navActive === "contact" ? "active" : ""}>
                  {t("landing.navContact")}
                </Nav.Link>
                <Dropdown as={Nav.Item} className="d-lg-flex align-items-lg-center" autoClose="inside">
                  <Dropdown.Toggle
                    as={Nav.Link}
                    className="nav-link dropdown-toggle d-inline-flex align-items-center gap-3"
                    id={langToggleId}
                    aria-label={t("nav.languageMenu")}
                  >
                    <LanguageFlag code={activeLang.code} width={LANDING_FLAG_WIDTH} />
                    <span>{t(activeLang.labelKey)}</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="end" className="shadow-sm py-2">
                    {LANDING_LANGS.map(({ code, labelKey }) => (
                      <Dropdown.Item
                        key={code}
                        as="button"
                        type="button"
                        active={code === activeLang.code}
                        className="d-flex align-items-center gap-3 py-2 ps-3 pe-3"
                        onClick={() => {
                          void i18n.changeLanguage(code);
                          setExpanded(false);
                        }}
                      >
                        <LanguageFlag code={code} width={LANDING_FLAG_WIDTH} />
                        {t(labelKey)}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
                <Nav.Link as={Link} to="/auth/sign-in" className="ms-2 d-flex align-items-center">
                  <Button variant="outline-primary" size="sm" className="rounded-pill">
                    {t("landing.navSignIn")}
                  </Button>
                </Nav.Link>
                <Nav.Link as={Link} to="/auth/sign-up" className="ms-1 d-flex align-items-center">
                  <Button variant="primary" size="sm" className="rounded-pill">
                    {t("landing.navSignUp")}
                  </Button>
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        </Container>
      </div>

      {children}

      <div id="contact" className="container-fluid bg-dark text-light mt-5 py-5">
        <Container className="py-5">
          <Row className="g-5">
            <Col lg={4} md={6}>
              <h4 className="d-inline-block text-primary text-uppercase border-bottom border-5 border-secondary mb-4">{t("landing.footerTouch")}</h4>
              <p className="mb-4">{t("landing.footerBlurb")}</p>
              <p className="mb-2">
                <i className="fas fa-map-marker-alt text-primary me-3" aria-hidden />
                {t("landing.footerAddress")}
              </p>
              <p className="mb-2">
                <i className="fas fa-envelope text-primary me-3" aria-hidden />
                <a className="text-light text-decoration-none" href={`mailto:${t("landing.contactEmail")}`}>
                  {t("landing.contactEmail")}
                </a>
              </p>
              <p className="mb-0">
                <i className="fas fa-phone-alt text-primary me-3" aria-hidden />
                <a className="text-light text-decoration-none" href={`tel:${String(t("landing.contactPhone")).replace(/\s/g, "")}`}>
                  {t("landing.contactPhone")}
                </a>
              </p>
            </Col>
            <Col lg={4} md={6}>
              <h4 className="d-inline-block text-primary text-uppercase border-bottom border-5 border-secondary mb-4">{t("landing.footerQuick")}</h4>
              <div className="d-flex flex-column">
                <Link to="/" className="text-light mb-2 text-decoration-none">
                  <i className="fas fa-angle-right me-2" aria-hidden />
                  {t("landing.navHome")}
                </Link>
                <Link to="/about" className="text-light mb-2 text-decoration-none">
                  <i className="fas fa-angle-right me-2" aria-hidden />
                  {t("landing.navAbout")}
                </Link>
                <Link to="/features" className="text-light mb-2 text-decoration-none">
                  <i className="fas fa-angle-right me-2" aria-hidden />
                  {t("landing.navFeatures")}
                </Link>
                <Link to="/contact" className="text-light mb-2 text-decoration-none">
                  <i className="fas fa-angle-right me-2" aria-hidden />
                  {t("landing.navContact")}
                </Link>
                <Link to="/auth/sign-in" className="text-light text-decoration-none">
                  <i className="fas fa-angle-right me-2" aria-hidden />
                  {t("landing.navSignIn")}
                </Link>
              </div>
            </Col>
            <Col lg={4} md={12}>
              <h4 className="d-inline-block text-primary text-uppercase border-bottom border-5 border-secondary mb-4">{t("landing.footerApp")}</h4>
              <p className="text-light mb-3">{t("landing.footerTagline")}</p>
              <div className="d-flex flex-column gap-2">
                <Button as={Link} to="/auth/sign-in" variant="primary" className="rounded-pill">
                  {t("landing.navSignIn")}
                </Button>
                <Button as={Link} to="/about" variant="outline-light" className="rounded-pill">
                  {t("landing.cta2Secondary")}
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      <div className="container-fluid bg-dark text-light border-top border-secondary py-4">
        <Container>
          <Row>
            <Col md={12} className="text-center text-md-start">
              <p className="mb-0">
                &copy;{" "}
                <Link to="/" className="text-primary text-decoration-none">
                  MediFollow
                </Link>
                . {t("landing.footerRights")}{" "}
                <span className="text-secondary">— {t("landing.footerTagline")}</span>
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      {showBackToTop && (
        <Button
          variant="primary"
          size="lg"
          className="btn-lg-square back-to-top rounded-0"
          onClick={scrollToTop}
          style={{ position: "fixed", right: "30px", bottom: 0, borderRadius: "50% 50% 0 0", zIndex: 99 }}
          aria-label="Back to top"
        >
          <i className="bi bi-arrow-up" aria-hidden />
        </Button>
      )}
    </div>
  );
}

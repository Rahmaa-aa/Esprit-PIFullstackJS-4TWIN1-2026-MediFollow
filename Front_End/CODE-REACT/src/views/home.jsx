import React, { useState, useEffect, useMemo, useId } from "react";
import { Container, Navbar, Nav, Button, Row, Col, Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageFlag, SvgFlagTn, SvgFlagDz } from "../components/language-flag-svgs";

const LANDING_LANGS = [
  { code: "en", labelKey: "lang.english" },
  { code: "fr", labelKey: "lang.french" },
  { code: "ar", labelKey: "lang.arabic" },
];

/** Drapeaux plus grands sur la landing (menu langue + barre du haut). */
const LANDING_FLAG_WIDTH = 36;
const LANDING_PARTNERSHIP_FLAG_WIDTH = 32;

const generatePath = (path) => {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "") || "";
  const p = (path || "").replace(/^\/+/, "");
  const url = `${window.origin}${base}/${p}`;
  return url.replace(/([^:])\/\/+/g, "$1/");
};

const img = (name) => generatePath(`assets/images/hospital/${name}`);

const Home = () => {
  const { t, i18n } = useTranslation();
  const langToggleId = `home-lang-${useId().replace(/:/g, "")}`;
  const [expanded, setExpanded] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const currentLang = String(i18n.language || "en").split("-")[0];
  const activeLang = LANDING_LANGS.find((l) => l.code === currentLang) || LANDING_LANGS[0];

  const features = useMemo(
    () => [
      { icon: "fa-user-circle", titleKey: "landing.f1Title", descKey: "landing.f1Desc" },
      { icon: "fa-calendar-check", titleKey: "landing.f2Title", descKey: "landing.f2Desc" },
      { icon: "fa-comments", titleKey: "landing.f3Title", descKey: "landing.f3Desc" },
      { icon: "fa-heartbeat", titleKey: "landing.f4Title", descKey: "landing.f4Desc" },
      { icon: "fa-clipboard-list", titleKey: "landing.f5Title", descKey: "landing.f5Desc" },
      { icon: "fa-hospital-user", titleKey: "landing.f6Title", descKey: "landing.f6Desc" },
    ],
    [],
  );

  const pillars = useMemo(
    () => [
      { icon: "fa-user-md", line1Key: "landing.pillar1a", line2Key: "landing.pillar1b" },
      { icon: "fa-lock", line1Key: "landing.pillar2a", line2Key: "landing.pillar2b" },
      { icon: "fa-calendar-alt", line1Key: "landing.pillar3a", line2Key: "landing.pillar3b" },
      { icon: "fa-pills", line1Key: "landing.pillar4a", line2Key: "landing.pillar4b" },
    ],
    [],
  );

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
                <Nav.Link as={Link} to="/" className="active">
                  {t("landing.navHome")}
                </Nav.Link>
                <Nav.Link href="#about">{t("landing.navAbout")}</Nav.Link>
                <Nav.Link href="#features">{t("landing.navFeatures")}</Nav.Link>
                <Dropdown as={Nav.Item}>
                  <Dropdown.Toggle as={Nav.Link} className="dropdown-toggle">
                    {t("landing.navMore")}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/dashboard">
                      {t("landing.navDashboard")}
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/doctor/doctor-list">
                      {t("landing.navDoctors")}
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/auth/sign-in">
                      {t("landing.navSignIn")}
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/auth/sign-up">
                      {t("landing.navSignUp")}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                <Nav.Link href="#contact">{t("landing.navContact")}</Nav.Link>
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

      <div
        className="container-fluid bg-primary py-5 mb-5 hero-header"
        style={{
          backgroundImage: `url(${img("hero.jpg")})`,
          backgroundPosition: "top right",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <Container className="py-5">
          <Row className="justify-content-start">
            <Col lg={8} className="text-center text-lg-start">
              <h5
                className="d-inline-block text-primary text-uppercase border-bottom border-5 mb-3"
                style={{ borderColor: "rgba(256, 256, 256, .3) !important" }}
              >
                {t("landing.heroKicker")}
              </h5>
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
          <Row className="gx-5">
            <Col lg={5} className="mb-5 mb-lg-0" style={{ minHeight: "500px" }}>
              <div className="position-relative h-100">
                <img className="position-absolute w-100 h-100 rounded" src={img("about.jpg")} alt="" style={{ objectFit: "cover" }} />
              </div>
            </Col>
            <Col lg={7}>
              <div className="mb-4">
                <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">{t("landing.aboutKicker")}</h5>
                <h1 className="display-4">{t("landing.aboutTitle")}</h1>
              </div>
              <p className="mb-4">{t("landing.aboutText")}</p>
              <Row className="g-3 pt-3">
                {pillars.map((p, i) => (
                  <Col key={i} sm={3} className="col-6">
                    <div className="bg-light text-center rounded-circle py-4">
                      <i className={`fa fa-3x ${p.icon} text-primary mb-3`} aria-hidden />
                      <h6 className="mb-0">
                        {t(p.line1Key)}
                        <small className="d-block text-primary">{t(p.line2Key)}</small>
                      </h6>
                    </div>
                  </Col>
                ))}
              </Row>
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
            {features.map((s, i) => (
              <Col key={i} lg={4} md={6}>
                <div className="service-item bg-white rounded d-flex flex-column align-items-center justify-content-center text-center shadow-sm">
                  <div className="service-icon mb-4">
                    <i className={`fa fa-2x ${s.icon} text-white`} aria-hidden />
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
              <Link to="/dashboard" className="btn btn-outline-light rounded-pill py-3 px-5 d-inline-block">
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
              <CardLike title={t("landing.audPTitle")} text={t("landing.audPText")} icon="fa-user-injured" />
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

      <div id="contact" className="container-fluid bg-dark text-light mt-5 py-5">
        <Container className="py-5">
          <Row className="g-5">
            <Col lg={4} md={6}>
              <h4 className="d-inline-block text-primary text-uppercase border-bottom border-5 border-secondary mb-4">{t("landing.footerTouch")}</h4>
              <p className="mb-4">{t("landing.footerBlurb")}</p>
              <p className="mb-2">
                <i className="fa fa-map-marker-alt text-primary me-3" aria-hidden />
                {t("landing.footerAddress")}
              </p>
              <p className="mb-2">
                <i className="fa fa-envelope text-primary me-3" aria-hidden />
                <a className="text-light text-decoration-none" href={`mailto:${t("landing.contactEmail")}`}>
                  {t("landing.contactEmail")}
                </a>
              </p>
              <p className="mb-0">
                <i className="fa fa-phone-alt text-primary me-3" aria-hidden />
                <a className="text-light text-decoration-none" href={`tel:${String(t("landing.contactPhone")).replace(/\s/g, "")}`}>
                  {t("landing.contactPhone")}
                </a>
              </p>
            </Col>
            <Col lg={4} md={6}>
              <h4 className="d-inline-block text-primary text-uppercase border-bottom border-5 border-secondary mb-4">{t("landing.footerQuick")}</h4>
              <div className="d-flex flex-column">
                <Link to="/" className="text-light mb-2 text-decoration-none">
                  <i className="fa fa-angle-right me-2" aria-hidden />
                  {t("landing.navHome")}
                </Link>
                <a href="#about" className="text-light mb-2 text-decoration-none">
                  <i className="fa fa-angle-right me-2" aria-hidden />
                  {t("landing.navAbout")}
                </a>
                <a href="#features" className="text-light mb-2 text-decoration-none">
                  <i className="fa fa-angle-right me-2" aria-hidden />
                  {t("landing.navFeatures")}
                </a>
                <Link to="/doctor/doctor-list" className="text-light mb-2 text-decoration-none">
                  <i className="fa fa-angle-right me-2" aria-hidden />
                  {t("landing.navDoctors")}
                </Link>
                <Link to="/auth/sign-in" className="text-light text-decoration-none">
                  <i className="fa fa-angle-right me-2" aria-hidden />
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
                <Button as={Link} to="/dashboard" variant="outline-light" className="rounded-pill">
                  {t("landing.navDashboard")}
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
};

function CardLike({ title, text, icon }) {
  return (
    <div className="bg-light rounded p-4 h-100 border border-light shadow-sm">
      <div className="d-flex align-items-start gap-3">
        <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 48, height: 48 }}>
          <i className={`fa ${icon} text-white`} aria-hidden />
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

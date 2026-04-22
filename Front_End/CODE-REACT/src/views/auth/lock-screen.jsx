import React, { useState } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authApi } from "../../services/api";
import { generatePath } from "../landing/landingPaths";
import AuthCarouselMedifollow from "../../components/auth/AuthCarouselMedifollow";

const LockScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authApi.login(email || "admin@medifollow.com", password);
      if (data.pending) {
        setPending(true);
      } else {
        localStorage.setItem("adminToken", data.access_token);
        localStorage.setItem("adminUser", JSON.stringify(data.user || { email, role: "admin" }));
        navigate("/admin/dashboard");
        window.location.reload();
      }
    } catch (err) {
      setError(err.message || t("lockScreen.loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="sign-in-page d-md-flex align-items-center custom-auth-height">
        <Container className="sign-in-page-bg mt-5 mb-md-5 mb-0 p-0">
          <Row>
            <Col md={6} className="text-center z-2">
              <div className="sign-in-detail text-white">
                <Link to="/" className="sign-in-logo mb-2">
                  <img src={generatePath("assets/images/logosite.png")} className="img-fluid" alt={t("lockScreen.logoAlt")} style={{ maxWidth: "320px", maxHeight: "100px", objectFit: "contain" }} />
                </Link>
                <AuthCarouselMedifollow
                  interval={4000}
                  captionKeys={[
                    { titleKey: "lockScreen.slide1Title", descKey: "lockScreen.slide1Desc" },
                    { titleKey: "lockScreen.slide2Title", descKey: "lockScreen.slide2Desc" },
                    { titleKey: "lockScreen.slide3Title", descKey: "lockScreen.slide3Desc" },
                  ]}
                />
              </div>
            </Col>
            <Col md={6} className="position-relative z-2">
              <div className="sign-in-from d-flex flex-column justify-content-center">
                <img
                  src={generatePath("assets/images/login/Admin_photo.jpeg")}
                  alt={t("lockScreen.profileImageAlt")}
                  className="rounded-circle"
                  style={{
                    width: "130px",
                    height: "130px",
                    objectFit: "cover",
                    objectPosition: "50% 22%",
                    boxShadow: "0 4px 15px rgba(8, 155, 171, 0.25)",
                    border: "3px solid rgba(255, 255, 255, 0.9)",
                  }}
                />
                <h4 className="mt-3 mb-0">{t("lockScreen.pageTitle")}</h4>
                <p>{t("lockScreen.intro")}</p>
                <Form className="mt-0" onSubmit={handleSubmit}>
                  {pending && (
                    <div className="alert alert-success py-2" role="alert">
                      <i className="ri-mail-line me-2"></i>
                      {t("lockScreen.pendingEmailCheck")}
                    </div>
                  )}
                  {error && (
                    <div className="alert alert-danger py-2" role="alert">
                      {error}
                    </div>
                  )}
                  {pending && (
                    <button type="button" className="btn btn-outline-secondary mt-2" onClick={() => { setPending(false); }}>
                      {t("lockScreen.retryOtherLogin")}
                    </button>
                  )}
                  {!pending && (
                  <>
                  <Form.Group className="form-group mb-3" controlId="email">
                    <Form.Label className="mb-2">{t("lockScreen.email")}</Form.Label>
                    <Form.Control
                      type="email"
                      className="mb-0 border"
                      placeholder={t("lockScreen.emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="form-group mb-3" controlId="password">
                    <Form.Label className="mb-2">{t("lockScreen.password")}</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        className="mb-0 border"
                        style={{ paddingRight: 40 }}
                        placeholder={t("lockScreen.passwordPlaceholder")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        data-eye-clickable
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? t("lockScreen.hidePasswordAria") : t("lockScreen.showPasswordAria")}
                        data-eye-clickable
                        title={showPassword ? t("lockScreen.hidePassword") : t("lockScreen.showPassword")}
                        style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", zIndex: 2 }}
                      >
                        <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
                      </button>
                    </div>
                  </Form.Group>
                  <div className="d-inline-block w-100">
                    <button type="submit" className="btn btn-primary-subtle float-end mt-3" disabled={loading}>
                      {loading ? t("lockScreen.signingIn") : t("lockScreen.signInButton")}
                    </button>
                  </div>
                  </>
                  )}
                  <div className="sign-info mt-3">
                    <span className="dark-color d-inline-block">
                      <Link to="/auth/sign-in">{t("lockScreen.userSignInLink")}</Link>
                    </span>
                  </div>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  )
}

export default LockScreen;

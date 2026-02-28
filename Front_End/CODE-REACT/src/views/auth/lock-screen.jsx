import React, { useState } from "react";
import { Carousel, Container, Row, Col, Form } from 'react-bootstrap';
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../services/api";

const generatePath = (path) => {
  return window.origin + import.meta.env.BASE_URL + path;
};

const LockScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authApi.login(email || "admin@medifollow.com", password);
      if (data.pending) {
        setPending(true);
        setSuccessMessage(data.message || "Vérifiez votre email pour confirmer la connexion.");
      } else {
        localStorage.setItem("adminToken", data.access_token);
        localStorage.setItem("adminUser", JSON.stringify(data.user || { email, role: "admin" }));
        navigate("/admin/dashboard");
        window.location.reload();
      }
    } catch (err) {
      setError(err.message || "Email ou mot de passe incorrect");
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
                  <img src={generatePath("/assets/images/logosite.png")} className="img-fluid" alt="Logo" style={{ maxWidth: "320px", maxHeight: "100px", objectFit: "contain" }} />
                </Link>
                <Carousel id="carouselExampleCaptions" interval={4000} controls={false}>
                  <Carousel.Item>
                    <img src={generatePath("/assets/images/login/image_signin_signup.png")} className="d-block w-100" alt="Slide 1" />
                    <div className="carousel-caption-container">
                      <h4 className="mb-1 mt-3 text-white">Connexion Administrateur</h4>
                      <p className="pb-5">Accédez au tableau de bord d'administration MediFollow.</p>
                    </div>
                  </Carousel.Item>
                  <Carousel.Item>
                    <img src={generatePath("/assets/images/login/signin1.png")} className="d-block w-100" alt="Slide 2" />
                    <div className="carousel-caption-container">
                      <h4 className="mb-1 mt-3 text-white">Gestion complète</h4>
                      <p className="pb-5">Gérez vos utilisateurs, rendez-vous et paramètres.</p>
                    </div>
                  </Carousel.Item>
                  <Carousel.Item>
                    <img src={generatePath("/assets/images/login/signin2.png")} className="d-block w-100" alt="Slide 3" />
                    <div className="carousel-caption-container">
                      <h4 className="mb-1 mt-3 text-white">Sécurisé</h4>
                      <p className="pb-5">Vos données sont protégées et sécurisées.</p>
                    </div>
                  </Carousel.Item>
                </Carousel>
              </div>
            </Col>
            <Col md={6} className="position-relative z-2">
              <div className="sign-in-from d-flex flex-column justify-content-center">
                <img
                  src={generatePath("/assets/images/login/Admin_photo.jpeg")}
                  alt="user-image"
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
                <h4 className="mt-3 mb-0">Connexion Administrateur</h4>
                <p>Entrez vos identifiants pour accéder au tableau de bord.</p>
                <Form className="mt-0" onSubmit={handleSubmit}>
                  {pending && (
                    <div className="alert alert-success py-2" role="alert">
                      <i className="ri-mail-line me-2"></i>
                      {successMessage}
                    </div>
                  )}
                  {error && (
                    <div className="alert alert-danger py-2" role="alert">
                      {error}
                    </div>
                  )}
                  {pending && (
                    <button type="button" className="btn btn-outline-secondary mt-2" onClick={() => { setPending(false); setSuccessMessage(""); }}>
                      Réessayer une autre connexion
                    </button>
                  )}
                  {!pending && (
                  <>
                  <Form.Group className="form-group mb-3" controlId="email">
                    <Form.Label className="mb-2">Email</Form.Label>
                    <Form.Control
                      type="email"
                      className="mb-0 border"
                      placeholder="admin@medifollow.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="form-group mb-3" controlId="password">
                    <Form.Label className="mb-2">Mot de passe</Form.Label>
                    <Form.Control
                      type="password"
                      className="mb-0 border"
                      placeholder="Mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <div className="d-inline-block w-100">
                    <button type="submit" className="btn btn-primary-subtle float-end mt-3" disabled={loading}>
                      {loading ? "Connexion..." : "Se connecter"}
                    </button>
                  </div>
                  </>
                  )}
                  <div className="sign-info mt-3">
                    <span className="dark-color d-inline-block">
                      <Link to="/auth/sign-in">Connexion utilisateur</Link>
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

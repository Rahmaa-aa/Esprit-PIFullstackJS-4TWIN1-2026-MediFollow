import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import { authApi } from "../../services/api";

const generatePath = (path) => {
  return window.origin + import.meta.env.BASE_URL + path;
};

const ConfirmLogin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Lien de confirmation invalide.");
      return;
    }

    const confirm = async () => {
      try {
        const data = await authApi.confirmLogin(token);
        localStorage.setItem("adminToken", data.access_token);
        localStorage.setItem("adminUser", JSON.stringify(data.user || {}));
        setStatus("success");
        const role = data.user?.role;
        const redirectPath = role === "superadmin" ? "/super-admin/dashboard" : "/admin/dashboard";
        setTimeout(() => {
          window.location.href = redirectPath;
        }, 1500);
      } catch (err) {
        setStatus("error");
        setMessage(err.message || "Ce lien a expiré ou a déjà été utilisé. Veuillez vous reconnecter.");
      }
    };

    confirm();
  }, [token, navigate]);

  return (
    <section className="sign-in-page d-md-flex align-items-center custom-auth-height">
      <Container className="sign-in-page-bg mt-5 mb-md-5 mb-0 p-0">
        <Row>
          <Col md={6} className="text-center z-2">
            <div className="sign-in-detail text-white">
              <a href={generatePath("/")} className="sign-in-logo mb-2">
                <img src={generatePath("/assets/images/logosite.png")} className="img-fluid" alt="Logo" style={{ maxWidth: "320px", maxHeight: "100px", objectFit: "contain" }} />
              </a>
            </div>
          </Col>
          <Col md={6} className="position-relative z-2">
            <div className="sign-in-from d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "400px" }}>
              {status === "loading" && (
                <>
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3 mb-0">Confirmation de votre connexion...</p>
                </>
              )}
              {status === "success" && (
                <>
                  <div className="text-success mb-2">
                    <i className="ri-checkbox-circle-fill" style={{ fontSize: "4rem" }}></i>
                  </div>
                  <p className="mb-0">Connexion confirmée ! Redirection vers le tableau de bord...</p>
                </>
              )}
              {status === "error" && (
                <>
                  <div className="text-danger mb-2">
                    <i className="ri-error-warning-fill" style={{ fontSize: "4rem" }}></i>
                  </div>
                  <Alert variant="danger" className="text-center">
                    {message}
                  </Alert>
                  <a href={generatePath("/auth/lock-screen")} className="btn btn-primary-subtle mt-2">
                    Retour à la connexion
                  </a>
                </>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ConfirmLogin;

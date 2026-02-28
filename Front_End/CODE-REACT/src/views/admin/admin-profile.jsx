import React, { useState, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import Card from "../../components/Card";
import { Link } from "react-router-dom";
import { authApi } from "../../services/api";

const generatePath = (path) => window.origin + import.meta.env.BASE_URL + path;
const DEFAULT_PHOTO = generatePath("/assets/images/login/Admin_photo.jpeg");

const getProfileImg = (user) => {
  const img = user?.profileImage;
  if (img?.startsWith("data:")) return img;
  if (img?.startsWith("http")) return img;
  return img ? generatePath(img) : DEFAULT_PHOTO;
};

const AdminProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authApi.me();
        setUser(data.user);
      } catch (err) {
        if (err.status === 401) {
          window.location.href = "/auth/lock-screen";
          return;
        }
        setError(err.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Body className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-3 mb-0">Chargement...</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  if (error || !user) {
    return (
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Body className="text-center py-5">
              <p className="text-danger mb-3">{error || "Profil non trouvé"}</p>
              <Link to="/admin/dashboard" className="btn btn-primary">Retour</Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <Row>
      <Col lg={4}>
        <Card>
          <Card.Body className="text-center">
            <img
              src={getProfileImg(user)}
              alt="Admin"
              className="rounded-circle mb-3"
              style={{ width: "150px", height: "150px", objectFit: "cover", objectPosition: "50% 15%" }}
            />
            <h4 className="mb-1">{user.name || "Admin"}</h4>
            <p className="text-muted mb-0">{user.email}</p>
            <p className="mt-2 mb-0">
              <span className="badge bg-primary">{user.role}</span>
            </p>
            <Link to="/admin/edit-profile" className="btn btn-primary-subtle mt-3">
              Modifier le profil
            </Link>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={8}>
        <Card>
          <Card.Header>
            <Card.Header.Title>
              <h4 className="card-title">Informations du profil</h4>
            </Card.Header.Title>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col xs={4} className="text-muted">Nom :</Col>
              <Col xs={8}>{user.name || "—"}</Col>
              <Col xs={4} className="text-muted">Email :</Col>
              <Col xs={8}>{user.email}</Col>
              <Col xs={4} className="text-muted">Rôle :</Col>
              <Col xs={8}>{user.role}</Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default AdminProfile;

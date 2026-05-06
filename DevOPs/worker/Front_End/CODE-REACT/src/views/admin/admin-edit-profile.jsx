import React, { useState, useEffect } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Card from "../../components/Card";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../services/api";

const generatePath = (path) => window.origin + import.meta.env.BASE_URL + path;
const DEFAULT_PHOTO = generatePath("/assets/images/login/Admin_photo.jpeg");

const AdminEditProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [profilePreview, setProfilePreview] = useState(DEFAULT_PHOTO);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authApi.me();
        setUser(data.user);
        const img = data.user?.profileImage;
        setProfilePreview(img?.startsWith("data:") ? img : (img?.startsWith("http") ? img : (img ? generatePath(img) : DEFAULT_PHOTO)));
      } catch (err) {
        if (err.status === 401) {
          window.location.href = "/auth/lock-screen";
          return;
        }
        setError(err.message || t("adminEditProfile.loadError"));
      } finally {
        setLoadingData(false);
      }
    };
    fetchUser();
  }, [t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaveMessage("");
    setLoading(true);

    const form = e.target;
    const name = form.name?.value;
    const email = form.email?.value;
    const password = form.pass?.value;
    const rpass = form.rpass?.value;

    if (password || rpass) {
      if (!password || !rpass) {
        setError(t("adminEditProfile.passwordBothRequired"));
        setLoading(false);
        return;
      }
      if (password !== rpass) {
        setError(t("adminEditProfile.passwordMismatch"));
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError(t("adminEditProfile.passwordMinLength"));
        setLoading(false);
        return;
      }
    }

    const payload = { name: name || user?.name, email: email || user?.email };
    if (password) payload.password = password;
    if (profilePreview.startsWith("data:")) payload.profileImage = profilePreview;

    try {
      const updated = await authApi.updateMe(payload);
      const stored = JSON.parse(localStorage.getItem("adminUser") || "{}");
      localStorage.setItem("adminUser", JSON.stringify({ ...stored, ...updated }));
      window.dispatchEvent(new CustomEvent("admin-updated"));
      setSaveMessage(t("adminEditProfile.updateSuccess"));
      navigate("/admin/profile");
    } catch (err) {
      if (err.status === 401) {
        navigate("/auth/lock-screen");
        return;
      }
      setError(err.message || t("adminEditProfile.updateError"));
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Body className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">{t("adminEditProfile.loading")}</span>
              </div>
              <p className="mt-3 mb-0">{t("adminEditProfile.loading")}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  if (error && !user) {
    return (
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Body className="text-center py-5">
              <p className="text-danger mb-3">{error}</p>
              <Link to="/admin/dashboard" className="btn btn-primary">{t("adminEditProfile.backToDashboard")}</Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfilePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Row>
      <Col lg={4}>
        <Card>
          <Card.Body className="text-center">
            <img
              src={profilePreview}
              alt={t("adminEditProfile.avatarAlt")}
              className="rounded-circle mb-3"
              style={{ width: "150px", height: "150px", objectFit: "cover", objectPosition: "50% 15%" }}
            />
            <div className="mb-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => document.getElementById("admin-photo-upload").click()}
              >
                {t("adminEditProfile.changePhoto")}
              </Button>
              <input
                id="admin-photo-upload"
                type="file"
                accept="image/*"
                className="d-none"
                onChange={handleFileChange}
              />
            </div>
            <p className="text-muted small mb-0">{t("adminEditProfile.formatsHint")}</p>
            <h4 className="mb-0 mt-2">{user?.name || t("adminEditProfile.defaultDisplayName")}</h4>
            <p className="text-muted">{user?.email}</p>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={8}>
        <Card>
          <Card.Header>
            <Card.Header.Title>
              <h4 className="card-title">{t("adminEditProfile.pageTitle")}</h4>
            </Card.Header.Title>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              {error && <div className="alert alert-danger">{error}</div>}
              {saveMessage && <div className="alert alert-success">{saveMessage}</div>}
              <Form.Group className="mb-3">
                <Form.Label>{t("adminEditProfile.labelName")}</Form.Label>
                <Form.Control type="text" name="name" defaultValue={user?.name} placeholder={t("adminEditProfile.placeholderName")} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>{t("adminEditProfile.labelEmail")}</Form.Label>
                <Form.Control type="email" name="email" defaultValue={user?.email} placeholder={t("adminEditProfile.placeholderEmail")} required />
              </Form.Group>
              <hr />
              <h5 className="mb-3">{t("adminEditProfile.passwordSection")}</h5>
              <Form.Group className="mb-3">
                <Form.Label>{t("adminEditProfile.labelNewPassword")}</Form.Label>
                <Form.Control type="password" name="pass" placeholder={t("adminEditProfile.placeholderPasswordKeep")} minLength={6} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>{t("adminEditProfile.labelConfirm")}</Form.Label>
                <Form.Control type="password" name="rpass" placeholder={t("adminEditProfile.placeholderConfirm")} minLength={6} />
              </Form.Group>
              <div className="d-flex gap-2">
                <Button type="button" variant="outline-danger" onClick={() => navigate("/admin/profile")}>
                  {t("adminEditProfile.cancel")}
                </Button>
                <Button type="submit" className="btn btn-primary-subtle" disabled={loading}>
                  {loading ? t("adminEditProfile.saving") : t("adminEditProfile.save")}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default AdminEditProfile;

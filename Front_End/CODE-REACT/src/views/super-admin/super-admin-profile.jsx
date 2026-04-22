import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, Card, Button, Form, Alert, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authApi } from "../../services/api";

const generatePath = (path) => window.origin + import.meta.env.BASE_URL + path;
const DEFAULT_PHOTO = generatePath("/assets/images/login/Admin_photo.jpeg");

const getProfileImg = (user) => {
  const img = user?.profileImage;
  if (img?.startsWith("data:")) return img;
  if (img?.startsWith("http")) return img;
  return img ? generatePath(img) : DEFAULT_PHOTO;
};

const SuperAdminProfile = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [profilePreview, setProfilePreview] = useState(DEFAULT_PHOTO);
  const [form, setForm] = useState({ name: "", email: "", password: "", rpass: "" });

  const loadUser = useCallback(async () => {
    try {
      const data = await authApi.me();
      const u = data.user || data;
      setUser(u);
      setForm({ name: u.name || "", email: u.email || "", password: "", rpass: "" });
      setProfilePreview(getProfileImg(u));
    } catch (err) {
      setError(err.message || t("superAdminProfile.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfilePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password || form.rpass) {
      if (form.password !== form.rpass) {
        setError(t("superAdminProfile.passwordMismatch"));
        return;
      }
      if (form.password.length < 6) {
        setError(t("superAdminProfile.passwordMin"));
        return;
      }
    }

    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      if (profilePreview.startsWith("data:")) payload.profileImage = profilePreview;

      const updated = await authApi.updateMe(payload);
      const stored = JSON.parse(localStorage.getItem("adminUser") || "{}");
      localStorage.setItem("adminUser", JSON.stringify({ ...stored, ...updated }));
      window.dispatchEvent(new CustomEvent("admin-updated"));
      setSuccess(t("superAdminProfile.updateSuccess"));
      setEditMode(false);
      loadUser();
    } catch (err) {
      setError(err.message || t("superAdminProfile.updateError"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" style={{ color: "#009688" }} role="status" />
        <span className="visually-hidden">{t("superAdminProfile.loading")}</span>
        <p className="mt-3 text-muted mb-0">{t("superAdminProfile.loading")}</p>
      </div>
    );
  }

  return (
    <Row>
      <Col md={12}>
        <h4 className="fw-bold mb-1" style={{ color: "#009688" }}>
          <i className="ri-shield-star-fill me-2"></i>{t("superAdminProfile.pageTitle")}
        </h4>
        <p className="text-muted mb-4">{t("superAdminProfile.subtitle")}</p>
      </Col>

      <Col lg={4}>
        <Card className="shadow-sm border-0 text-center">
          <Card.Body className="p-4">
            <div className="position-relative d-inline-block mb-3">
              <img
                src={profilePreview}
                alt={t("superAdminProfile.avatarAlt")}
                className="rounded-circle border"
                style={{ width: 120, height: 120, objectFit: "cover", objectPosition: "50% 15%" }}
              />
              {editMode && (
                <button
                  type="button"
                  className="btn btn-sm btn-primary rounded-circle position-absolute bottom-0 end-0"
                  style={{ width: 32, height: 32, padding: 0 }}
                  onClick={() => document.getElementById("sa-photo-upload").click()}
                  title={t("superAdminProfile.changePhotoTitle")}
                >
                  <i className="ri-camera-line"></i>
                </button>
              )}
              <input
                id="sa-photo-upload"
                type="file"
                accept="image/*"
                className="d-none"
                onChange={handleFileChange}
              />
            </div>
            <h5 className="mb-0">{user?.name || t("superAdminProfile.defaultDisplayName")}</h5>
            <p className="text-muted small mb-2">{user?.email}</p>
            <span
              className="badge"
              style={{ background: "#009688", color: "#fff", fontSize: 12 }}
            >
              {t("superAdminProfile.roleBadge")}
            </span>

            <div className="mt-4 d-grid gap-2">
              {!editMode ? (
                <Button
                  style={{ background: "#009688", border: "none" }}
                  onClick={() => setEditMode(true)}
                >
                  <i className="ri-edit-line me-1"></i>{t("superAdminProfile.editProfile")}
                </Button>
              ) : (
                <Button
                  variant="outline-secondary"
                  onClick={() => { setEditMode(false); setError(""); loadUser(); }}
                >
                  {t("superAdminProfile.cancel")}
                </Button>
              )}
              <Link to="/super-admin/dashboard" className="btn btn-outline-secondary">
                <i className="ri-dashboard-line me-1"></i>{t("superAdminProfile.dashboard")}
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col lg={8}>
        <Card className="shadow-sm border-0">
          <Card.Header style={{ background: "#f8f9fa", borderBottom: "1px solid #dee2e6" }}>
            <h5 className="mb-0">{editMode ? t("superAdminProfile.sectionEditInfo") : t("superAdminProfile.sectionViewInfo")}</h5>
          </Card.Header>
          <Card.Body className="p-4">
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            {!editMode ? (
              <div className="row g-3">
                {[
                  { labelKey: "labelFullName", value: user?.name, icon: "ri-user-line" },
                  { labelKey: "labelEmail", value: user?.email, icon: "ri-mail-line" },
                  { labelKey: "labelRole", value: t("superAdminProfile.roleBadge"), icon: "ri-shield-star-line" },
                ].map(({ labelKey, value, icon }) => (
                  <Col md={6} key={labelKey}>
                    <div className="d-flex align-items-start gap-2 p-3 rounded" style={{ background: "#f8f9fa" }}>
                      <i className={icon} style={{ color: "#009688", fontSize: 18, marginTop: 2 }}></i>
                      <div>
                        <div className="text-muted small">{t(`superAdminProfile.${labelKey}`)}</div>
                        <div className="fw-medium">{value || t("superAdminProfile.dash")}</div>
                      </div>
                    </div>
                  </Col>
                ))}
              </div>
            ) : (
              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("superAdminProfile.labelFullName")}</Form.Label>
                      <Form.Control
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("superAdminProfile.labelEmail")}</Form.Label>
                      <Form.Control
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <hr className="my-3" />
                <h6 className="text-muted mb-3">{t("superAdminProfile.passwordSectionOptional")}</h6>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("superAdminProfile.labelNewPassword")}</Form.Label>
                      <Form.Control
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                        placeholder={t("superAdminProfile.placeholderPasswordKeep")}
                        minLength={6}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("superAdminProfile.labelConfirmPassword")}</Form.Label>
                      <Form.Control
                        type="password"
                        value={form.rpass}
                        onChange={(e) => setForm((f) => ({ ...f, rpass: e.target.value }))}
                        placeholder={t("superAdminProfile.placeholderConfirmPassword")}
                        minLength={6}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-2 mt-4">
                  <Button
                    type="submit"
                    style={{ background: "#009688", border: "none" }}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Spinner size="sm" animation="border" className="me-2" role="status" />
                        {t("superAdminProfile.saving")}
                      </>
                    ) : (
                      <>
                        <i className="ri-save-line me-1"></i>{t("superAdminProfile.saveChanges")}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => { setEditMode(false); setError(""); loadUser(); }}
                  >
                    {t("superAdminProfile.cancel")}
                  </Button>
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default SuperAdminProfile;

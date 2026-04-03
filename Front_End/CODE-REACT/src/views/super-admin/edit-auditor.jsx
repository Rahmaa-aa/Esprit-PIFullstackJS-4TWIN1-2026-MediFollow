import React, { useState, useEffect } from "react";
import { Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { superAdminApi } from "../../services/api";

const EditAuditor = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    department: "", specialty: "", address: "", city: "", country: "",
    password: "", confirmPassword: "",
  });

  useEffect(() => {
    const fetchAuditor = async () => {
      try {
        const data = await superAdminApi.getAuditorById(id);
        const u = data?.data || data;
        setForm({
          firstName: u.firstName || u.name?.split(" ")[0] || "",
          lastName: u.lastName || u.name?.split(" ").slice(1).join(" ") || "",
          email: u.email || "",
          phone: u.phone || "",
          department: u.department || "",
          specialty: u.specialty || "",
          address: u.address || "",
          city: u.city || "",
          country: u.country || "",
          password: "",
          confirmPassword: "",
        });
      } catch {
        setError(t("editAuditor.loadError"));
      } finally {
        setLoading(false);
      }
    };
    fetchAuditor();
  }, [id, t]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password || form.confirmPassword) {
      if (form.password !== form.confirmPassword) {
        setError(t("editAuditor.passwordMismatch"));
        return;
      }
      if (form.password.length < 6) {
        setError(t("editAuditor.passwordMin"));
        return;
      }
    }

    setSaving(true);
    try {
      const payload = { ...form };
      delete payload.confirmPassword;
      if (!payload.password) delete payload.password;
      await superAdminApi.updateAuditor(id, payload);
      setSuccess(t("editAuditor.updateSuccess"));
      setTimeout(() => navigate("/super-admin/auditors"), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || t("editAuditor.updateError"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" style={{ color: "#009688" }} role="status" />
        <span className="visually-hidden">{t("editAuditor.loading")}</span>
        <p className="mt-3 text-muted mb-0">{t("editAuditor.loading")}</p>
      </div>
    );
  }

  return (
    <Row className="justify-content-center">
      <Col md={8}>
        <Card className="shadow-sm border-0">
          <Card.Header style={{ background: "#009688", color: "#fff" }}>
            <h5 className="mb-0">
              <i className="ri-edit-line me-2"></i>{t("editAuditor.pageTitle")}
            </h5>
          </Card.Header>
          <Card.Body className="p-4">
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t("editAuditor.labelFirstName")}</Form.Label>
                    <Form.Control name="firstName" value={form.firstName} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t("editAuditor.labelLastName")}</Form.Label>
                    <Form.Control name="lastName" value={form.lastName} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t("editAuditor.labelEmail")}</Form.Label>
                    <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t("editAuditor.labelPhone")}</Form.Label>
                    <Form.Control name="phone" value={form.phone} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t("editAuditor.labelDepartment")}</Form.Label>
                    <Form.Control name="department" value={form.department} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t("editAuditor.labelSpecialty")}</Form.Label>
                    <Form.Control name="specialty" value={form.specialty} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>{t("editAuditor.labelAddress")}</Form.Label>
                    <Form.Control name="address" value={form.address} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t("editAuditor.labelCity")}</Form.Label>
                    <Form.Control name="city" value={form.city} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t("editAuditor.labelCountry")}</Form.Label>
                    <Form.Control name="country" value={form.country} onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>

              <hr className="my-4" />
              <h6 className="text-muted mb-3">
                <i className="ri-lock-line me-1"></i>{t("editAuditor.passwordSection")}{" "}
                <span className="fw-normal">{t("editAuditor.passwordSectionHint")}</span>
              </h6>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t("editAuditor.labelNewPassword")}</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder={t("editAuditor.placeholderPassword")}
                      minLength={6}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t("editAuditor.labelConfirmPassword")}</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder={t("editAuditor.placeholderConfirmPassword")}
                      minLength={6}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex gap-2 mt-4">
                <Button type="submit" style={{ background: "#009688", border: "none" }} disabled={saving}>
                  {saving ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-2" role="status" />
                      {t("editAuditor.saving")}
                    </>
                  ) : (
                    <>
                      <i className="ri-save-line me-1"></i>{t("editAuditor.saveChanges")}
                    </>
                  )}
                </Button>
                <Button variant="outline-secondary" onClick={() => navigate("/super-admin/auditors")}>
                  {t("editAuditor.cancel")}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default EditAuditor;

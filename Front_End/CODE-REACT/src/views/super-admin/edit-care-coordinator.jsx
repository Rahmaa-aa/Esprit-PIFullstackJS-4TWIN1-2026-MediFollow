import React, { useState, useEffect } from "react";
import { Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { superAdminApi } from "../../services/api";
import { HOSPITAL_DEPARTMENTS, hospitalDepartmentLabel } from "../../constants/hospitalDepartments";

const EditCareCoordinator = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    department: "", address: "", city: "", country: "",
    password: "", confirmPassword: "",
  });

  useEffect(() => {
    const fetchCoord = async () => {
      try {
        const data = await superAdminApi.getCareCoordinatorById(id);
        const u = data?.data || data;
        setForm({
          firstName: u.firstName || u.name?.split(" ")[0] || "",
          lastName: u.lastName || u.name?.split(" ").slice(1).join(" ") || "",
          email: u.email || "",
          phone: u.phone || "",
          department: u.department || u.specialty || "",
          address: u.address || "",
          city: u.city || "",
          country: u.country || "",
          password: "",
          confirmPassword: "",
        });
      } catch {
        setError(t("editCareCoordinator.loadError"));
      } finally {
        setLoading(false);
      }
    };
    fetchCoord();
  }, [id, t]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password || form.confirmPassword) {
      if (form.password !== form.confirmPassword) {
        setError(t("editCareCoordinator.passwordMismatch"));
        return;
      }
      if (form.password.length < 6) {
        setError(t("editCareCoordinator.passwordMin"));
        return;
      }
    }

    setSaving(true);
    try {
      const payload = { ...form };
      delete payload.confirmPassword;
      if (!payload.password) delete payload.password;
      payload.specialty = form.department || "";
      await superAdminApi.updateCareCoordinator(id, payload);
      setSuccess(t("editCareCoordinator.updateSuccess"));
      setTimeout(() => navigate("/super-admin/care-coordinators"), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || t("editCareCoordinator.updateError"));
    } finally {
      setSaving(false);
    }
  };

  const legacyDepartment = form.department && !HOSPITAL_DEPARTMENTS.includes(form.department);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" style={{ color: "#009688" }} role="status" />
        <span className="visually-hidden">{t("editCareCoordinator.loading")}</span>
        <p className="mt-3 text-muted mb-0">{t("editCareCoordinator.loading")}</p>
      </div>
    );
  }

  return (
    <Row className="justify-content-center">
      <Col md={8}>
        <Card className="shadow-sm border-0">
          <Card.Header style={{ background: "#009688", color: "#fff" }}>
            <h5 className="mb-0">
              <i className="ri-edit-line me-2"></i>{t("editCareCoordinator.pageTitle")}
            </h5>
          </Card.Header>
          <Card.Body className="p-4">
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t("editCareCoordinator.labelFirstName")}</Form.Label>
                    <Form.Control name="firstName" value={form.firstName} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t("editCareCoordinator.labelLastName")}</Form.Label>
                    <Form.Control name="lastName" value={form.lastName} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t("editCareCoordinator.labelEmail")}</Form.Label>
                    <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t("editCareCoordinator.labelPhone")}</Form.Label>
                    <Form.Control name="phone" value={form.phone} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t("editCareCoordinator.labelDepartment")}</Form.Label>
                    <Form.Select name="department" value={form.department} onChange={handleChange}>
                      <option value="">{t("addPatient.selectDepartment")}</option>
                      {legacyDepartment && (
                        <option value={form.department}>{hospitalDepartmentLabel(form.department, t)}</option>
                      )}
                      {HOSPITAL_DEPARTMENTS.map((s) => (
                        <option key={s} value={s}>
                          {hospitalDepartmentLabel(s, t)}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>{t("editCareCoordinator.labelAddress")}</Form.Label>
                    <Form.Control name="address" value={form.address} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t("editCareCoordinator.labelCity")}</Form.Label>
                    <Form.Control name="city" value={form.city} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t("editCareCoordinator.labelCountry")}</Form.Label>
                    <Form.Control name="country" value={form.country} onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>

              <hr className="my-4" />
              <h6 className="text-muted mb-3">
                <i className="ri-lock-line me-1"></i>{t("editCareCoordinator.passwordSection")}{" "}
                <span className="fw-normal">{t("editCareCoordinator.passwordSectionHint")}</span>
              </h6>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t("editCareCoordinator.labelNewPassword")}</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder={t("editCareCoordinator.placeholderPassword")}
                      minLength={6}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t("editCareCoordinator.labelConfirmPassword")}</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder={t("editCareCoordinator.placeholderConfirmPassword")}
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
                      {t("editCareCoordinator.saving")}
                    </>
                  ) : (
                    <>
                      <i className="ri-save-line me-1"></i>{t("editCareCoordinator.saveChanges")}
                    </>
                  )}
                </Button>
                <Button variant="outline-secondary" onClick={() => navigate("/super-admin/care-coordinators")}>
                  {t("editCareCoordinator.cancel")}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default EditCareCoordinator;

import React, { useState } from "react";
import Card from "../../components/Card";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { superAdminApi } from "../../services/api";
import { HOSPITAL_DEPARTMENTS, hospitalDepartmentLabel } from "../../constants/hospitalDepartments";

const generatePath = (path) => window.origin + import.meta.env.BASE_URL + path;

const AddCareCoordinator = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profilePreview, setProfilePreview] = useState(generatePath("/assets/images/user/11.png"));

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
    setLoading(true);
    const form = e.target;
    const password = form.pass?.value;
    const rpass = form.rpass?.value;
    if (password !== rpass) {
      setError(t("addCareCoordinator.passwordMismatch"));
      setLoading(false);
      return;
    }
    if (password?.length < 6) {
      setError(t("addCareCoordinator.passwordMin"));
      setLoading(false);
      return;
    }
    const profileImage = profilePreview.startsWith("data:") ? profilePreview : null;
    try {
      const dept = form.department?.value?.trim() || "";
      await superAdminApi.createCareCoordinator({
        firstName: form.fname?.value, lastName: form.lname?.value,
        email: form.email?.value, password,
        department: dept,
        specialty: dept,
        phone: form.phone?.value, address: form.address?.value,
        city: form.city?.value, country: form.country?.value,
        profileImage,
      });
      navigate("/super-admin/care-coordinators");
    } catch (err) {
      setError(err.message || t("addCareCoordinator.createError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div className="header-title">
                <h4 className="card-title">{t("addCareCoordinator.pageTitle")}</h4>
              </div>
            </Card.Header>
            <Card.Body>
              {error && <div className="alert alert-danger">{error}</div>}
              <Form onSubmit={handleSubmit}>
                <Row className="mb-4">
                  <Col lg={12}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="position-relative">
                        <img src={profilePreview} alt={t("addCareCoordinator.profileImageAlt")} className="rounded-circle border"
                          style={{ width: 100, height: 100, objectFit: "cover" }} />
                        <label htmlFor="profilePic" className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: 28, height: 28, cursor: "pointer" }}>
                          <i className="ri-camera-line" style={{ fontSize: 14 }}></i>
                          <input type="file" id="profilePic" accept="image/*" className="d-none" onChange={handleFileChange} />
                        </label>
                      </div>
                      <div>
                        <h6 className="mb-1">{t("addCareCoordinator.profilePhoto")}</h6>
                        <small className="text-muted">{t("addCareCoordinator.photoHint")}</small>
                      </div>
                    </div>
                  </Col>
                </Row>

                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("addCareCoordinator.labelFirstName")} <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="text" name="fname" placeholder={t("addCareCoordinator.placeholderFirstName")} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("addCareCoordinator.labelLastName")} <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="text" name="lname" placeholder={t("addCareCoordinator.placeholderLastName")} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("addCareCoordinator.labelEmail")} <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="email" name="email" placeholder={t("addCareCoordinator.placeholderEmail")} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("addCareCoordinator.labelPhone")}</Form.Label>
                      <Form.Control type="text" name="phone" placeholder={t("addCareCoordinator.placeholderPhone")} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("addCareCoordinator.labelDepartment")}</Form.Label>
                      <Form.Select name="department">
                        <option value="">{t("addPatient.selectDepartment")}</option>
                        {HOSPITAL_DEPARTMENTS.map((s) => (
                          <option key={s} value={s}>
                            {hospitalDepartmentLabel(s, t)}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("addCareCoordinator.labelCity")}</Form.Label>
                      <Form.Control type="text" name="city" placeholder={t("addCareCoordinator.placeholderCity")} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("addCareCoordinator.labelCountry")}</Form.Label>
                      <Form.Control type="text" name="country" placeholder={t("addCareCoordinator.placeholderCountry")} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("addCareCoordinator.labelPassword")} <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="password" name="pass" placeholder={t("addCareCoordinator.placeholderPassword")} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("addCareCoordinator.labelConfirmPassword")} <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="password" name="rpass" placeholder={t("addCareCoordinator.placeholderConfirm")} required />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-2 mt-4">
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        {t("addCareCoordinator.submitting")}
                      </>
                    ) : (
                      t("addCareCoordinator.submit")
                    )}
                  </Button>
                  <Button variant="outline-secondary" onClick={() => navigate("/super-admin/care-coordinators")}>{t("addCareCoordinator.cancel")}</Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddCareCoordinator;

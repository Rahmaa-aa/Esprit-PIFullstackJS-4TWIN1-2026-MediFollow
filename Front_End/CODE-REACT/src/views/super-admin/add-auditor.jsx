import React, { useState, useEffect } from "react";
import Card from "../../components/Card";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { superAdminApi } from "../../services/api";
import { fetchCatalogDepartmentNamesOnly } from "../../utils/mergedDepartmentNames";
import { hospitalDepartmentLabel } from "../../constants/hospitalDepartments";

const generatePath = (path) => window.origin + import.meta.env.BASE_URL + path;

const AddAuditor = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profilePreview, setProfilePreview] = useState(generatePath("/assets/images/user/11.png"));
  const [deptOptions, setDeptOptions] = useState([]);
  const [deptLoading, setDeptLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const names = await fetchCatalogDepartmentNamesOnly();
        if (!cancelled) setDeptOptions(names);
      } finally {
        if (!cancelled) setDeptLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
      setError(t("addAuditor.passwordMismatch"));
      setLoading(false);
      return;
    }
    if (password?.length < 6) {
      setError(t("addAuditor.passwordMin"));
      setLoading(false);
      return;
    }
    const profileImage = profilePreview.startsWith("data:") ? profilePreview : null;
    try {
      await superAdminApi.createAuditor({
        firstName: form.fname?.value, lastName: form.lname?.value,
        email: form.email?.value, password,
        department: form.department?.value, phone: form.phone?.value,
        address: form.address?.value, city: form.city?.value, country: form.country?.value,
        profileImage,
      });
      navigate("/super-admin/auditors");
    } catch (err) {
      setError(err.message || t("addAuditor.createError"));
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
                <h4 className="card-title">{t("addAuditor.pageTitle")}</h4>
              </div>
            </Card.Header>
            <Card.Body>
              {error && <div className="alert alert-danger">{error}</div>}
              <Form onSubmit={handleSubmit}>
                <Row className="align-items-center">
                  <Col lg={12} className="mb-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="position-relative">
                        <img src={profilePreview} alt={t("addAuditor.profileImageAlt")} className="rounded-circle border"
                          style={{ width: 100, height: 100, objectFit: "cover" }} />
                        <label htmlFor="profilePic" className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: 28, height: 28, cursor: "pointer" }}>
                          <i className="ri-camera-line" style={{ fontSize: 14 }}></i>
                          <input type="file" id="profilePic" accept="image/*" className="d-none" onChange={handleFileChange} />
                        </label>
                      </div>
                      <div>
                        <h6 className="mb-1">{t("addAuditor.profilePhoto")}</h6>
                        <small className="text-muted">{t("addAuditor.photoHint")}</small>
                      </div>
                    </div>
                  </Col>
                </Row>

                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("addAuditor.labelFirstName")} <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="text" name="fname" placeholder={t("addAuditor.placeholderFirstName")} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("addAuditor.labelLastName")} <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="text" name="lname" placeholder={t("addAuditor.placeholderLastName")} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("addAuditor.labelEmail")} <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="email" name="email" placeholder={t("addAuditor.placeholderEmail")} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("addAuditor.labelPhone")}</Form.Label>
                      <Form.Control type="text" name="phone" placeholder={t("addAuditor.placeholderPhone")} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("addAuditor.labelDepartment")}</Form.Label>
                      <Form.Select name="department" disabled={deptLoading} autoComplete="off">
                        <option value="">
                          {deptLoading ? t("addAuditor.deptLoading") : t("addAuditor.selectDepartment")}
                        </option>
                        {deptOptions.map((d) => (
                          <option key={d} value={d}>
                            {hospitalDepartmentLabel(d, t)}
                          </option>
                        ))}
                      </Form.Select>
                      {!deptLoading && deptOptions.length === 0 && (
                        <Form.Text className="text-muted">{t("addAuditor.catalogOnlyEmptyHint")}</Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("addAuditor.labelCity")}</Form.Label>
                      <Form.Control type="text" name="city" placeholder={t("addAuditor.placeholderCity")} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("addAuditor.labelCountry")}</Form.Label>
                      <Form.Control type="text" name="country" placeholder={t("addAuditor.placeholderCountry")} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("addAuditor.labelAddress")}</Form.Label>
                      <Form.Control type="text" name="address" placeholder={t("addAuditor.placeholderAddress")} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("addAuditor.labelPassword")} <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="password" name="pass" placeholder={t("addAuditor.placeholderPassword")} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("addAuditor.labelConfirmPassword")} <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="password" name="rpass" placeholder={t("addAuditor.placeholderConfirm")} required />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-2 mt-4">
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        {t("addAuditor.submitting")}
                      </>
                    ) : (
                      t("addAuditor.submit")
                    )}
                  </Button>
                  <Button variant="outline-secondary" onClick={() => navigate("/super-admin/auditors")}>{t("addAuditor.cancel")}</Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddAuditor;

import React, { useState, useEffect } from "react";
import Card from "../../components/Card";
import { Alert, Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { departmentApi, superAdminApi } from "../../services/api";
import { hospitalDepartmentLabel } from "../../constants/hospitalDepartments";

const generatePath = (path) => window.origin + import.meta.env.BASE_URL + path;

const FLAG_CDN = "https://flagcdn.com/w40";
const COUNTRIES = [
  { name: "France", labelKey: "countryFrance", code: "FR", dialCode: "+33", flagUrl: `${FLAG_CDN}/fr.png` },
  { name: "Canada", labelKey: "countryCanada", code: "CA", dialCode: "+1", flagUrl: `${FLAG_CDN}/ca.png` },
  { name: "USA", labelKey: "countryUSA", code: "US", dialCode: "+1", flagUrl: `${FLAG_CDN}/us.png` },
  { name: "Maroc", labelKey: "countryMorocco", code: "MA", dialCode: "+212", flagUrl: `${FLAG_CDN}/ma.png` },
  { name: "Algérie", labelKey: "countryAlgeria", code: "DZ", dialCode: "+213", flagUrl: `${FLAG_CDN}/dz.png` },
  { name: "Tunisie", labelKey: "countryTunisia", code: "TN", dialCode: "+216", flagUrl: `${FLAG_CDN}/tn.png` },
];

const AddPlatformAdmin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [emailSent, setEmailSent] = useState(null);
  const [profilePreview, setProfilePreview] = useState(generatePath("/assets/images/user/11.png"));
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [deptOptions, setDeptOptions] = useState([]);
  const [deptLoading, setDeptLoading] = useState(true);
  const [deptLoadError, setDeptLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setDeptLoading(true);
    setDeptLoadError(false);
    departmentApi
      .catalogEligibleForAdmin()
      .then((res) => {
        if (!cancelled) setDeptOptions(Array.isArray(res?.names) ? res.names : []);
      })
      .catch(() => {
        if (!cancelled) {
          setDeptOptions([]);
          setDeptLoadError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setDeptLoading(false);
      });
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
    setSuccess("");
    setEmailSent(null);
    setLoading(true);

    const form = e.target;
    const password = form.pass?.value;
    const rpass = form.rpass?.value;

    if (password !== rpass) {
      setError(t("addPlatformAdmin.passwordMismatch"));
      setLoading(false);
      return;
    }
    if (password?.length < 6) {
      setError(t("addPlatformAdmin.passwordMin"));
      setLoading(false);
      return;
    }

    const department = form.department?.value?.trim() || "";
    if (!department) {
      setError(t("addPlatformAdmin.departmentRequired"));
      setLoading(false);
      return;
    }

    const country = COUNTRIES.find((c) => c.name === form.selectcountry?.value);
    const prefix = country?.dialCode ? `${country.dialCode} ` : "";
    const mob = form.mobno?.value?.trim() || "";
    const phone = mob.startsWith("+") ? mob : prefix + mob;

    try {
      const res = await superAdminApi.createAdmin({
        firstName: form.fname?.value?.trim(),
        lastName: form.lname?.value?.trim(),
        email: form.email?.value?.trim(),
        password,
        department,
        phone: phone || undefined,
        name: `${form.fname?.value || ""} ${form.lname?.value || ""}`.trim(),
      });
      setEmailSent(res.credentialsEmailSent === true);
      setSuccess(t("addPlatformAdmin.createSuccess"));
      setTimeout(() => navigate("/super-admin/admins"), 2200);
    } catch (err) {
      setError(err.message || t("addPlatformAdmin.createError"));
    } finally {
      setLoading(false);
    }
  };

  const phonePlaceholder = !selectedCountry
    ? t("addNurse.phonePlaceholderPickCountry")
    : selectedCountry.dialCode === "+216"
      ? t("addNurse.phonePlaceholderTN")
      : t("addNurse.phonePlaceholderDefault");

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col lg={3}>
            <Card>
              <Card.Header className="d-flex justify-content-between">
                <Card.Header.Title>
                  <h4 className="card-title">{t("addPlatformAdmin.pageTitleAdd")}</h4>
                </Card.Header.Title>
              </Card.Header>
              <Card.Body>
                <Form.Group className="form-group">
                  <Container className="d-flex flex-column align-items-center py-4">
                    <div className="text-center">
                      <img
                        className="profile-pic img-fluid rounded-circle mb-3"
                        src={profilePreview}
                        alt=""
                        style={{ width: "150px", height: "150px", objectFit: "cover" }}
                      />
                      <div>
                        <Button type="button" className="btn btn-primary rounded-1" onClick={() => document.getElementById("file-upload-admin")?.click()}>
                          {t("addNurse.profilePhoto")}
                        </Button>
                        <input id="file-upload-admin" className="d-none" type="file" accept="image/*" onChange={handleFileChange} />
                      </div>
                    </div>
                    <p className="text-muted small text-center mt-3 mb-0">{t("addPlatformAdmin.sideHint")}</p>
                  </Container>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={9}>
            <Card>
              <Card.Header className="d-flex justify-content-between">
                <Card.Header.Title>
                  <h4 className="card-title">{t("addPlatformAdmin.pageTitleInfo")}</h4>
                </Card.Header.Title>
              </Card.Header>
              <Card.Body>
                <div className="new-user-info">
                  {error && <Alert variant="danger">{error}</Alert>}
                  {success && (
                    <Alert variant="success">
                      {success}
                      {emailSent === true && <div className="small mt-2">{t("addPlatformAdmin.emailSent")}</div>}
                      {emailSent === false && <div className="small mt-2">{t("addPlatformAdmin.emailNotSent")}</div>}
                    </Alert>
                  )}
                  <Row className="cust-form-input">
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("addNurse.firstName")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="fname" required />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("addNurse.lastName")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="lname" required />
                    </Col>
                    <Col sm={12} className="form-group">
                      <Form.Label className="mb-0">{t("addNurse.department")}</Form.Label>
                      <Form.Control
                        as="select"
                        className="my-2"
                        name="department"
                        required
                        disabled={deptLoading || deptOptions.length === 0}
                      >
                        <option value="">
                          {deptLoading
                            ? t("addPlatformAdmin.departmentLoading")
                            : deptOptions.length === 0
                              ? t("addPlatformAdmin.departmentEmptyOption")
                              : t("addNurse.selectDepartment")}
                        </option>
                        {deptOptions.map((d) => (
                          <option key={d} value={d}>
                            {hospitalDepartmentLabel(d, t)}
                          </option>
                        ))}
                      </Form.Control>
                      <Form.Text className="text-muted">
                        {deptLoadError
                          ? t("addPlatformAdmin.departmentLoadError")
                          : t("addPlatformAdmin.departmentHelp")}
                      </Form.Text>
                    </Col>
                    <Col sm={12} className="form-group">
                      <Form.Label className="mb-0">{t("addNurse.country")}</Form.Label>
                      <Form.Control
                        as="select"
                        className="my-2"
                        name="selectcountry"
                        value={selectedCountry?.name || ""}
                        onChange={(e) => {
                          const c = COUNTRIES.find((x) => x.name === e.target.value);
                          setSelectedCountry(c || null);
                        }}
                      >
                        <option value="">{t("addNurse.selectPlaceholder")}</option>
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.name}>
                            {t(`addNurse.${c.labelKey}`)}
                          </option>
                        ))}
                      </Form.Control>
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("addNurse.phone")}</Form.Label>
                      <InputGroup className="my-2">
                        <InputGroup.Text className="bg-white d-flex align-items-center gap-1">
                          {selectedCountry ? (
                            <>
                              <img src={selectedCountry.flagUrl} alt="" style={{ width: 20, height: 15, objectFit: "cover" }} />
                              <span>{selectedCountry.dialCode}</span>
                            </>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </InputGroup.Text>
                        <Form.Control type="tel" name="mobno" placeholder={phonePlaceholder} />
                      </InputGroup>
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("addNurse.email")}</Form.Label>
                      <Form.Control type="email" className="my-2" name="email" required />
                    </Col>
                  </Row>
                  <hr />
                  <h5 className="mb-3">{t("addNurse.securitySection")}</h5>
                  <Row className="cust-form-input">
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("addNurse.password")}</Form.Label>
                      <Form.Control type="password" className="my-2" name="pass" required minLength={6} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("addNurse.confirmPassword")}</Form.Label>
                      <Form.Control type="password" className="my-2" name="rpass" required />
                    </Col>
                  </Row>
                  <div className="d-flex gap-2 mt-3">
                    <Button type="button" variant="outline-danger" onClick={() => navigate("/super-admin/admins")}>
                      {t("addNurse.cancel")}
                    </Button>
                    <Button type="submit" className="btn btn-primary-subtle" disabled={loading}>
                      {loading ? t("addNurse.saving") : t("addNurse.save")}
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default AddPlatformAdmin;

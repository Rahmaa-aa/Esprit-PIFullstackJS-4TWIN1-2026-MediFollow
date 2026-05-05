import React, { useState, useEffect } from "react";
import Card from "../../components/Card";
import { Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { patientApi } from "../../services/api";
import { HOSPITAL_DEPARTMENTS, hospitalDepartmentLabel } from "../../constants/hospitalDepartments";
import { fetchMergedDepartmentNames } from "../../utils/mergedDepartmentNames";

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

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDER_VALUES = ["Homme", "Femme", "Autre"];
const GENDER_I18N = {
  Homme: "patientDashboard.genderMale",
  Femme: "patientDashboard.genderFemale",
  Autre: "patientDashboard.genderOther",
};

const AddPatient = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profilePreview, setProfilePreview] = useState(generatePath("/assets/images/user/11.png"));
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [patientDepartment, setPatientDepartment] = useState("");
  const [deptOptions, setDeptOptions] = useState(HOSPITAL_DEPARTMENTS);
  const [antecedents, setAntecedents] = useState({
    diabetes: false,
    hypertension: false,
    heartDisease: false,
    asthmaCopd: false,
    cancer: false,
  });

  useEffect(() => {
    fetchMergedDepartmentNames().then(setDeptOptions);
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
      setError(t("addPatient.passwordMismatch"));
      setLoading(false);
      return;
    }

    if (password?.length < 6) {
      setError(t("addPatient.passwordMin"));
      setLoading(false);
      return;
    }

    const profileImage = profilePreview.startsWith("data:") ? profilePreview : generatePath("/assets/images/user/11.png");

    try {
      await patientApi.create({
        firstName: form.fname?.value,
        lastName: form.lname?.value,
        email: form.email?.value,
        phone: (() => {
          const country = COUNTRIES.find((c) => c.name === form.selectcountry?.value);
          const prefix = country?.dialCode ? `${country.dialCode} ` : "";
          const val = form.mobno?.value?.trim() || "";
          return val.startsWith("+") ? val : prefix + val;
        })(),
        dateOfBirth: form.dob?.value,
        gender: form.gender?.value,
        bloodType: form.bloodType?.value,
        address: form.add1?.value,
        city: form.city?.value,
        country: form.selectcountry?.value,
        pinCode: form.pno?.value,
        alternateContact: form.altconno?.value,
        department: form.department?.value,
        service: form.department?.value || form.service?.value,
        password,
        profileImage,
        antecedentDiabetes: antecedents.diabetes,
        antecedentHypertension: antecedents.hypertension,
        antecedentHeartDisease: antecedents.heartDisease,
        antecedentAsthmaCopd: antecedents.asthmaCopd,
        antecedentCancer: antecedents.cancer,
      });
      navigate("/patient/patient-list");
    } catch (err) {
      if (err.status === 401) {
        navigate("/auth/lock-screen");
        return;
      }
      setError(err.message || t("addPatient.createError"));
    } finally {
      setLoading(false);
    }
  };

  const phonePlaceholder = !selectedCountry
    ? t("addPatient.phonePlaceholderPickCountry")
    : selectedCountry.dialCode === "+216"
      ? t("addPatient.phonePlaceholderTN")
      : t("addPatient.phonePlaceholderDefault");

  return (
    <>
      <Form onSubmit={handleSubmit}>
      <Row>
        <Col lg={3}>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">{t("addPatient.pageTitleAdd")}</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
                <Form.Group className="form-group">
                  <Container className="d-flex flex-column align-items-center py-5">
                    <div className="text-center">
                      <img className="profile-pic img-fluid rounded-circle mb-3" src={profilePreview} alt={t("addPatient.profileImageAlt")} style={{ width: "150px", height: "150px", objectFit: "cover" }} />
                      <div>
                        <Button type="button" className="btn btn-primary rounded-1" onClick={() => document.getElementById("file-upload").click()}>{t("addPatient.profilePhoto")}</Button>
                        <input id="file-upload" className="d-none" type="file" accept="image/*" onChange={handleFileChange} />
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <span>{t("addPatient.acceptedFormats")} </span>
                      <span className="text-primary">{t("addPatient.formatsList")}</span>
                    </div>
                  </Container>
                </Form.Group>
                <Form.Group className="form-group cust-form-input">
                  <Form.Label className="mb-0">{t("addPatient.bloodType")}</Form.Label>
                  <Form.Control as="select" className="my-2" name="bloodType">
                    <option value="">{t("addPatient.selectPlaceholder")}</option>
                    {BLOOD_TYPES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Form.Group className="form-group cust-form-input">
                  <Form.Label className="mb-0">{t("addPatient.gender")}</Form.Label>
                  <Form.Control as="select" className="my-2" name="gender">
                    <option value="">{t("addPatient.selectPlaceholder")}</option>
                    {GENDER_VALUES.map((g) => (
                      <option key={g} value={g}>
                        {t(GENDER_I18N[g])}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Form.Group className="form-group cust-form-input">
                  <Form.Label className="mb-0">{t("addPatient.department")}</Form.Label>
                  <Form.Control
                    as="select"
                    className="my-2"
                    name="department"
                    required
                    value={patientDepartment}
                    onChange={(e) => setPatientDepartment(e.target.value)}
                  >
                    <option value="">{t("addPatient.selectDepartment")}</option>
                    {deptOptions.map((s) => (
                      <option key={s} value={s}>
                        {hospitalDepartmentLabel(s, t)}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={9}>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">{t("addPatient.pageTitleInfo")}</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <div className="new-user-info">
                  {error && <div className="alert alert-danger">{error}</div>}
                  <Row className="cust-form-input">
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("addPatient.firstName")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="fname" placeholder={t("addPatient.placeholderFirstName")} required />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("addPatient.lastName")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="lname" placeholder={t("addPatient.placeholderLastName")} required />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("addPatient.email")}</Form.Label>
                      <Form.Control type="email" className="my-2" name="email" placeholder={t("addPatient.placeholderEmail")} required />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("addPatient.dateOfBirth")}</Form.Label>
                      <Form.Control type="date" className="my-2" name="dob" />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("addPatient.address")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="add1" placeholder={t("addPatient.placeholderAddress")} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("addPatient.city")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="city" placeholder={t("addPatient.placeholderCity")} />
                    </Col>
                    <Col sm={12} className="form-group">
                      <Form.Label className="mb-0">{t("addPatient.country")}</Form.Label>
                      <Form.Control
                        as="select"
                        className="my-2"
                        name="selectcountry"
                        value={selectedCountry?.name || ""}
                        onChange={(e) => {
                          const country = COUNTRIES.find((c) => c.name === e.target.value);
                          setSelectedCountry(country || null);
                        }}
                      >
                        <option value="">{t("addPatient.selectPlaceholder")}</option>
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.name}>
                            {t(`addPatient.${c.labelKey}`)}
                          </option>
                        ))}
                      </Form.Control>
                      {selectedCountry && (
                        <div className="d-flex align-items-center gap-2 mt-1">
                          <img src={selectedCountry.flagUrl} alt="" style={{ width: 24, height: 18, objectFit: "cover" }} />
                          <span>{t(`addPatient.${selectedCountry.labelKey}`)}</span>
                        </div>
                      )}
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("addPatient.phone")}</Form.Label>
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
                        <Form.Control
                          type="tel"
                          name="mobno"
                          placeholder={phonePlaceholder}
                        />
                      </InputGroup>
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("addPatient.altContact")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="altconno" placeholder={t("addPatient.placeholderAltContact")} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("addPatient.postalCode")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="pno" placeholder={t("addPatient.placeholderPostal")} />
                    </Col>
                  </Row>
                  <hr />
                  <h5 className="mb-2">{t("addPatient.antecedentsSection")}</h5>
                  <p className="text-muted small mb-3">{t("addPatient.antecedentsLead")}</p>
                  <Row className="cust-form-input">
                    <Col md={6} className="form-group">
                      <Form.Check
                        type="switch"
                        id="add-antecedent-diabetes"
                        checked={antecedents.diabetes}
                        onChange={(e) => setAntecedents((a) => ({ ...a, diabetes: e.target.checked }))}
                        label={t("addPatient.antecedentDiabetes")}
                      />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Check
                        type="switch"
                        id="add-antecedent-hypertension"
                        checked={antecedents.hypertension}
                        onChange={(e) => setAntecedents((a) => ({ ...a, hypertension: e.target.checked }))}
                        label={t("addPatient.antecedentHypertension")}
                      />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Check
                        type="switch"
                        id="add-antecedent-heart"
                        checked={antecedents.heartDisease}
                        onChange={(e) => setAntecedents((a) => ({ ...a, heartDisease: e.target.checked }))}
                        label={t("addPatient.antecedentHeartDisease")}
                      />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Check
                        type="switch"
                        id="add-antecedent-asthma"
                        checked={antecedents.asthmaCopd}
                        onChange={(e) => setAntecedents((a) => ({ ...a, asthmaCopd: e.target.checked }))}
                        label={t("addPatient.antecedentAsthmaCopd")}
                      />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Check
                        type="switch"
                        id="add-antecedent-cancer"
                        checked={antecedents.cancer}
                        onChange={(e) => setAntecedents((a) => ({ ...a, cancer: e.target.checked }))}
                        label={t("addPatient.antecedentCancer")}
                      />
                    </Col>
                  </Row>
                  <hr />
                  <h5 className="mb-3">{t("addPatient.loginSection")}</h5>
                  <Row className="cust-form-input">
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("addPatient.password")}</Form.Label>
                      <Form.Control type="password" className="my-2" name="pass" placeholder={t("addPatient.placeholderPassword")} required minLength={6} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("addPatient.confirmPassword")}</Form.Label>
                      <Form.Control type="password" className="my-2" name="rpass" placeholder={t("addPatient.placeholderConfirm")} required />
                    </Col>
                  </Row>
                  <div className="d-flex gap-2 mt-3">
                    <Button type="button" variant="outline-danger" onClick={() => navigate("/patient/patient-list")}>{t("addPatient.cancel")}</Button>
                    <Button type="submit" className="btn btn-primary-subtle" disabled={loading}>
                      {loading ? t("addPatient.saving") : t("addPatient.save")}
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

export default AddPatient;

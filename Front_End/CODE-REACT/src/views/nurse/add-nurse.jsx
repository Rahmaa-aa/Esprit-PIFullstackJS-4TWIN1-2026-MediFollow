import React, { useState, useEffect } from "react";
import Card from "../../components/Card";
import { Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { nurseApi } from "../../services/api";
import { HOSPITAL_DEPARTMENTS, hospitalDepartmentLabel } from "../../constants/hospitalDepartments";
import { fetchMergedDepartmentNames } from "../../utils/mergedDepartmentNames";

const generatePath = (path) => window.origin + import.meta.env.BASE_URL + path;

const SPECIALTIES = [
  "Infirmier(ère) général(e)",
  "Soins intensifs",
  "Pédiatrie",
  "Chirurgie",
  "Urgences",
  "Médecine interne",
  "Gériatrie",
  "Bloc opératoire",
  "Dialyse",
  "Oncologie",
  "Psychiatrie",
  "Sage-femme",
  "General",
];

const SPECIALTY_I18N = {
  "Infirmier(ère) général(e)": "specialtyGeneralNurse",
  "Soins intensifs": "specialtyIntensiveCare",
  Pédiatrie: "specialtyPediatrics",
  Chirurgie: "specialtySurgeryNurse",
  Urgences: "specialtyEmergency",
  "Médecine interne": "specialtyInternalMedicine",
  Gériatrie: "specialtyGeriatrics",
  "Bloc opératoire": "specialtyOperatingRoom",
  Dialyse: "specialtyDialysis",
  Oncologie: "specialtyOncologyNurse",
  Psychiatrie: "specialtyPsychiatryNurse",
  "Sage-femme": "specialtyMidwifery",
  General: "specialtyGeneral",
};

const FLAG_CDN = "https://flagcdn.com/w40";
const COUNTRIES = [
  { name: "France", labelKey: "countryFrance", code: "FR", dialCode: "+33", flagUrl: `${FLAG_CDN}/fr.png` },
  { name: "Canada", labelKey: "countryCanada", code: "CA", dialCode: "+1", flagUrl: `${FLAG_CDN}/ca.png` },
  { name: "USA", labelKey: "countryUSA", code: "US", dialCode: "+1", flagUrl: `${FLAG_CDN}/us.png` },
  { name: "Maroc", labelKey: "countryMorocco", code: "MA", dialCode: "+212", flagUrl: `${FLAG_CDN}/ma.png` },
  { name: "Algérie", labelKey: "countryAlgeria", code: "DZ", dialCode: "+213", flagUrl: `${FLAG_CDN}/dz.png` },
  { name: "Tunisie", labelKey: "countryTunisia", code: "TN", dialCode: "+216", flagUrl: `${FLAG_CDN}/tn.png` },
];

const AddNurse = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profilePreview, setProfilePreview] = useState(generatePath("/assets/images/user/11.png"));
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [deptOptions, setDeptOptions] = useState(HOSPITAL_DEPARTMENTS);

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
      setError(t("addNurse.passwordMismatch"));
      setLoading(false);
      return;
    }

    if (password?.length < 6) {
      setError(t("addNurse.passwordMin"));
      setLoading(false);
      return;
    }

    const profileImage = profilePreview.startsWith("data:") ? profilePreview : generatePath("/assets/images/user/11.png");

    try {
      const created = await nurseApi.create({
        firstName: form.fname?.value,
        lastName: form.lname?.value,
        email: form.email?.value,
        password,
        specialty: form.selectuserrole?.value,
        department: form.cname?.value,
        phone: (() => {
          const country = COUNTRIES.find((c) => c.name === form.selectcountry?.value);
          const prefix = country?.dialCode ? `${country.dialCode} ` : "";
          const val = form.mobno?.value?.trim() || "";
          return val.startsWith("+") ? val : prefix + val;
        })(),
        address: form.add1?.value,
        city: form.city?.value,
        country: form.selectcountry?.value,
        pinCode: form.pno?.value,
        facebookUrl: form.furl?.value,
        twitterUrl: form.turl?.value,
        instagramUrl: form.instaurl?.value,
        linkedinUrl: form.lurl?.value,
        profileImage,
      });
      const nurseId = created?._id || created?.id;
      navigate(nurseId ? `/nurse/nurse-profile/${nurseId}` : "/nurse/nurse-list");
    } catch (err) {
      if (err.status === 401) {
        navigate("/auth/lock-screen");
        return;
      }
      setError(err.message || t("addNurse.createError"));
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
                <h4 className="card-title">{t("addNurse.pageTitleAdd")}</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
                <Form.Group className="form-group">
                  <Container className="d-flex flex-column align-items-center py-5">
                    <div className="text-center">
                      <img className="profile-pic img-fluid rounded-circle mb-3" src={profilePreview} alt={t("addNurse.profileImageAlt")} style={{ width: "150px", height: "150px", objectFit: "cover" }} />
                      <div>
                        <Button type="button" className="btn btn-primary rounded-1" onClick={() => document.getElementById("file-upload").click()}>{t("addNurse.profilePhoto")}</Button>
                        <input id="file-upload" className="d-none" type="file" accept="image/*" onChange={handleFileChange} />
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <span>{t("addNurse.acceptedFormats")} </span>
                      <span className="text-primary">{t("addNurse.formatsList")}</span>
                    </div>
                  </Container>
                </Form.Group>
                <Form.Group className="form-group cust-form-input">
                  <Form.Label className="mb-0">{t("addNurse.specialtyLabel")}</Form.Label>
                  <Form.Control as="select" className="my-2" name="selectuserrole">
                    <option value="">{t("addNurse.selectPlaceholder")}</option>
                    {SPECIALTIES.map((s) => (
                      <option key={s} value={s}>
                        {t(`addNurse.${SPECIALTY_I18N[s]}`)}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Form.Group className="form-group cust-form-input">
                  <Form.Label className="mb-0">{t("addNurse.facebook")}</Form.Label>
                  <Form.Control type="text" className="my-2" name="furl" placeholder={t("addNurse.placeholderUrlFacebook")} />
                </Form.Group>
                <Form.Group className="form-group cust-form-input">
                  <Form.Label className="mb-0">{t("addNurse.twitter")}</Form.Label>
                  <Form.Control type="text" className="my-2" name="turl" placeholder={t("addNurse.placeholderUrlTwitter")} />
                </Form.Group>
                <Form.Group className="form-group cust-form-input">
                  <Form.Label className="mb-0">{t("addNurse.instagram")}</Form.Label>
                  <Form.Control type="text" className="my-2" name="instaurl" placeholder={t("addNurse.placeholderUrlInstagram")} />
                </Form.Group>
                <Form.Group className="form-group cust-form-input">
                  <Form.Label className="mb-0">{t("addNurse.linkedin")}</Form.Label>
                  <Form.Control type="text" className="my-2" name="lurl" placeholder={t("addNurse.placeholderUrlLinkedIn")} />
                </Form.Group>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={9}>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">{t("addNurse.pageTitleInfo")}</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <div className="new-user-info">
                  {error && <div className="alert alert-danger">{error}</div>}
                  <Row className="cust-form-input">
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("addNurse.firstName")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="fname" placeholder={t("addNurse.placeholderFirstName")} required />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("addNurse.lastName")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="lname" placeholder={t("addNurse.placeholderLastName")} required />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("addNurse.address1")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="add1" placeholder={t("addNurse.placeholderAddress")} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("addNurse.address2")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="add2" placeholder={t("addNurse.placeholderAddress2")} />
                    </Col>
                    <Col sm={12} className="form-group">
                      <Form.Label className="mb-0">{t("addNurse.department")}</Form.Label>
                      <Form.Control as="select" className="my-2" name="cname" required>
                        <option value="">{t("addNurse.selectDepartment")}</option>
                        {deptOptions.map((d) => (
                          <option key={d} value={d}>
                            {hospitalDepartmentLabel(d, t)}
                          </option>
                        ))}
                      </Form.Control>
                    </Col>
                    <Col sm={12} className="form-group">
                      <Form.Label className="mb-0">{t("addNurse.country")}</Form.Label>
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
                        <option value="">{t("addNurse.selectPlaceholder")}</option>
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.name}>
                            {t(`addNurse.${c.labelKey}`)}
                          </option>
                        ))}
                      </Form.Control>
                      {selectedCountry && (
                        <div className="d-flex align-items-center gap-2 mt-1">
                          <img src={selectedCountry.flagUrl} alt="" style={{ width: 24, height: 18, objectFit: "cover" }} />
                          <span>{t(`addNurse.${selectedCountry.labelKey}`)}</span>
                        </div>
                      )}
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
                        <Form.Control
                          type="tel"
                          name="mobno"
                          placeholder={phonePlaceholder}
                        />
                      </InputGroup>
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("addNurse.altContact")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="altconno" placeholder={t("addNurse.placeholderAltContact")} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("addNurse.email")}</Form.Label>
                      <Form.Control type="email" className="my-2" name="email" placeholder={t("addNurse.placeholderEmail")} required />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("addNurse.postalCode")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="pno" placeholder={t("addNurse.placeholderPostal")} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("addNurse.city")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="city" placeholder={t("addNurse.placeholderCity")} />
                    </Col>
                  </Row>
                  <hr />
                  <h5 className="mb-3">{t("addNurse.securitySection")}</h5>
                  <Row className="cust-form-input">
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("addNurse.password")}</Form.Label>
                      <Form.Control type="password" className="my-2" name="pass" placeholder={t("addNurse.placeholderPassword")} required minLength={6} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("addNurse.confirmPassword")}</Form.Label>
                      <Form.Control type="password" className="my-2" name="rpass" placeholder={t("addNurse.placeholderConfirm")} required />
                    </Col>
                  </Row>
                  <div className="d-flex gap-2 mt-3">
                    <Button type="button" variant="outline-danger" onClick={() => navigate("/nurse/nurse-list")}>{t("addNurse.cancel")}</Button>
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

export default AddNurse;

import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Card from "../../components/Card";
import { Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { patientApi } from "../../services/api";
import { HOSPITAL_DEPARTMENTS } from "../../constants/hospitalDepartments";

const generatePath = (path) => window.origin + import.meta.env.BASE_URL + path;

const FLAG_CDN = "https://flagcdn.com/w40";
const COUNTRIES = [
  { name: "France", code: "FR", dialCode: "+33", flagUrl: `${FLAG_CDN}/fr.png` },
  { name: "Canada", code: "CA", dialCode: "+1", flagUrl: `${FLAG_CDN}/ca.png` },
  { name: "USA", code: "US", dialCode: "+1", flagUrl: `${FLAG_CDN}/us.png` },
  { name: "Maroc", code: "MA", dialCode: "+212", flagUrl: `${FLAG_CDN}/ma.png` },
  { name: "Algérie", code: "DZ", dialCode: "+213", flagUrl: `${FLAG_CDN}/dz.png` },
  { name: "Tunisie", code: "TN", dialCode: "+216", flagUrl: `${FLAG_CDN}/tn.png` },
];

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDER_VALUES = ["Homme", "Femme", "Autre"];

/** Stable slug for i18n keys (matches editPatient.departments.*) */
function departmentSlug(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/-/g, "_")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function normalizeGenderForForm(g) {
  if (g == null || String(g).trim() === "") return "";
  const s = String(g).trim().toLowerCase();
  if (["homme", "male", "m", "man"].includes(s)) return "Homme";
  if (["femme", "female", "f", "woman"].includes(s)) return "Femme";
  if (["other", "autre", "o"].includes(s)) return "Autre";
  return String(g).trim();
}

const EditPatient = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [profilePreview, setProfilePreview] = useState(generatePath("/assets/images/user/11.png"));
  const [originalProfileImage, setOriginalProfileImage] = useState("");
  const [formData, setFormData] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(null);

  const genderOptions = useMemo(
    () =>
      GENDER_VALUES.map((value) => ({
        value,
        label:
          value === "Homme"
            ? t("patientDashboard.genderMale")
            : value === "Femme"
              ? t("patientDashboard.genderFemale")
              : t("patientDashboard.genderOther"),
      })),
    [t],
  );

  useEffect(() => {
    const fetchPatient = async () => {
      setError("");
      try {
        const data = await patientApi.getById(id);
        const imgSrc = data.profileImage?.startsWith("data:") ? data.profileImage : (data.profileImage?.startsWith("http") ? data.profileImage : generatePath(data.profileImage || "/assets/images/user/11.png"));
        setProfilePreview(imgSrc);
        setOriginalProfileImage(data.profileImage || "");
        setFormData({
          fname: data.firstName || "",
          lname: data.lastName || "",
          email: data.email || "",
          dob: data.dateOfBirth || "",
          gender: normalizeGenderForForm(data.gender),
          bloodType: data.bloodType || "",
          mobno: data.phone || "",
          add1: data.address || "",
          city: data.city || "",
          selectcountry: data.country || "",
          pno: data.pinCode || "",
          altconno: data.alternateContact || "",
          service: data.service || "",
          department: data.department || data.service || "",
          admissionDate: data.admissionDate || "",
          dischargeDate: data.dischargeDate || "",
          diagnosis: data.diagnosis || "",
          dischargeNotes: data.dischargeNotes || "",
          weight: data.weight || "",
          height: data.height || "",
        });
        const country = COUNTRIES.find((c) => c.name === data.country);
        setSelectedCountry(country || null);
      } catch (err) {
        setError(err.message || t("editPatient.notFound"));
      } finally {
        setLoadingData(false);
      }
    };
    if (id) fetchPatient();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch only when id changes
  }, [id]);

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

    if (password || rpass) {
      if (password !== rpass) {
        setError(t("editPatient.passwordMismatch"));
        setLoading(false);
        return;
      }
      if (password?.length < 6) {
        setError(t("editPatient.passwordMinLength"));
        setLoading(false);
        return;
      }
    }

    const profileImage = profilePreview.startsWith("data:") ? profilePreview : (originalProfileImage || generatePath("/assets/images/user/11.png"));

    const payload = {
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
      profileImage,
      admissionDate: form.admissionDate?.value || "",
      dischargeDate: form.dischargeDate?.value || "",
      diagnosis: form.diagnosis?.value || "",
      dischargeNotes: form.dischargeNotes?.value || "",
      weight: form.weight?.value ? Number(form.weight.value) : undefined,
      height: form.height?.value ? Number(form.height.value) : undefined,
    };
    if (password) payload.password = password;

    try {
      await patientApi.update(id, payload);

      const stored = localStorage.getItem("patientUser");
      if (stored) {
        const currentUser = JSON.parse(stored);
        const currentId = (currentUser.id || currentUser._id)?.toString();
        if (currentId === id) {
          const refreshed = {
            ...currentUser,
            firstName: payload.firstName,
            lastName: payload.lastName,
            email: payload.email,
            phone: payload.phone,
            dateOfBirth: payload.dateOfBirth,
            gender: payload.gender,
            bloodType: payload.bloodType,
            address: payload.address,
            city: payload.city,
            country: payload.country,
            pinCode: payload.pinCode,
            service: payload.service,
            department: payload.department,
            profileImage: payload.profileImage,
          };
          localStorage.setItem("patientUser", JSON.stringify(refreshed));
          window.dispatchEvent(new Event("patientUserUpdated"));
        }
      }

      navigate("/patient/patient-list");
    } catch (err) {
      if (err.status === 401) {
        navigate("/auth/lock-screen");
        return;
      }
      setError(err.message || t("editPatient.updateError"));
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
                <span className="visually-hidden">{t("editPatient.loadingHidden")}</span>
              </div>
              <p className="mt-3 mb-0">{t("editPatient.loading")}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  if (!id || (error && !formData.fname)) {
    return (
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Body className="text-center py-5">
              <p className="text-danger mb-3">{error || t("editPatient.missingId")}</p>
              <Button variant="primary" onClick={() => navigate("/patient/patient-list")}>{t("editPatient.backToList")}</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col lg={3}>
            <Card>
              <Card.Header>
                <Card.Header.Title><h4 className="card-title">{t("editPatient.titleEdit")}</h4></Card.Header.Title>
              </Card.Header>
              <Card.Body>
                <Form.Group>
                  <Container className="d-flex flex-column align-items-center py-5">
                    <div className="text-center">
                      <img className="profile-pic img-fluid rounded-circle mb-3" src={profilePreview} alt={t("editPatient.profileAlt")} style={{ width: "150px", height: "150px", objectFit: "cover" }} />
                      <div>
                        <Button type="button" className="btn btn-primary rounded-1" onClick={() => document.getElementById("file-upload").click()}>{t("editPatient.profilePhotoBtn")}</Button>
                        <input id="file-upload" className="d-none" type="file" accept="image/*" onChange={handleFileChange} />
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <span>{t("editPatient.acceptedFormats")} </span>
                      <span className="text-primary">{t("editPatient.formatsList")}</span>
                    </div>
                  </Container>
                </Form.Group>
                <Form.Group className="cust-form-input">
                  <Form.Label className="mb-0">{t("editPatient.bloodType")}</Form.Label>
                  <Form.Control as="select" className="my-2" name="bloodType" defaultValue={formData.bloodType}>
                    <option value="">{t("editPatient.select")}</option>
                    {BLOOD_TYPES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Form.Group className="cust-form-input">
                  <Form.Label className="mb-0">{t("editPatient.gender")}</Form.Label>
                  <Form.Control as="select" className="my-2" name="gender" defaultValue={formData.gender}>
                    <option value="">{t("editPatient.select")}</option>
                    {genderOptions.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Form.Group className="cust-form-input">
                  <Form.Label className="mb-0">{t("editPatient.hospitalDepartment")}</Form.Label>
                  <Form.Control as="select" className="my-2" name="department" defaultValue={formData.department}>
                    <option value="">{t("editPatient.selectDepartment")}</option>
                    {HOSPITAL_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{t(`editPatient.departments.${departmentSlug(d)}`)}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={9}>
            <Card>
              <Card.Header>
                <Card.Header.Title><h4 className="card-title">{t("editPatient.titleInfo")}</h4></Card.Header.Title>
              </Card.Header>
              <Card.Body>
                <div className="new-user-info">
                  {error && <div className="alert alert-danger">{error}</div>}
                  <Row className="cust-form-input">
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("editPatient.firstName")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="fname" placeholder={t("editPatient.placeholderFirstName")} required defaultValue={formData.fname} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("editPatient.lastName")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="lname" placeholder={t("editPatient.placeholderLastName")} required defaultValue={formData.lname} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("editPatient.email")}</Form.Label>
                      <Form.Control type="email" className="my-2" name="email" placeholder={t("editPatient.placeholderEmail")} required defaultValue={formData.email} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("editPatient.dateOfBirth")}</Form.Label>
                      <Form.Control type="date" className="my-2" name="dob" defaultValue={formData.dob} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("editPatient.address")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="add1" placeholder={t("editPatient.placeholderAddress")} defaultValue={formData.add1} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("editPatient.city")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="city" placeholder={t("editPatient.placeholderCity")} defaultValue={formData.city} />
                    </Col>
                    <Col sm={12} className="form-group">
                      <Form.Label className="mb-0">{t("editPatient.country")}</Form.Label>
                      <Form.Control
                        as="select"
                        className="my-2"
                        name="selectcountry"
                        value={selectedCountry?.name || formData.selectcountry || ""}
                        onChange={(e) => {
                          const country = COUNTRIES.find((c) => c.name === e.target.value);
                          setSelectedCountry(country || null);
                        }}
                      >
                        <option value="">{t("editPatient.select")}</option>
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.name}>
                            {t(`editPatient.countries.${c.name}`)}
                          </option>
                        ))}
                      </Form.Control>
                      {selectedCountry && (
                        <div className="d-flex align-items-center gap-2 mt-1">
                          <img src={selectedCountry.flagUrl} alt="" style={{ width: 24, height: 18, objectFit: "cover" }} />
                          <span>{t(`editPatient.countries.${selectedCountry.name}`)}</span>
                        </div>
                      )}
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("editPatient.phone")}</Form.Label>
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
                          placeholder={t("editPatient.placeholderPhone")}
                          defaultValue={formData.mobno}
                        />
                      </InputGroup>
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("editPatient.alternateContact")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="altconno" placeholder={t("editPatient.placeholderAlternate")} defaultValue={formData.altconno} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("editPatient.postalCode")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="pno" placeholder={t("editPatient.placeholderPostal")} defaultValue={formData.pno} />
                    </Col>
                  </Row>
                  <hr />
                  <h5 className="mb-3">{t("editPatient.sectionHospitalization")}</h5>
                  <Row className="cust-form-input">
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("editPatient.admissionDate")}</Form.Label>
                      <Form.Control type="date" className="my-2" name="admissionDate" defaultValue={formData.admissionDate} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("editPatient.dischargeDate")}</Form.Label>
                      <Form.Control type="date" className="my-2" name="dischargeDate" defaultValue={formData.dischargeDate} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("editPatient.weightKg")}</Form.Label>
                      <Form.Control type="number" className="my-2" name="weight" placeholder={t("editPatient.placeholderWeight")} defaultValue={formData.weight} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("editPatient.heightCm")}</Form.Label>
                      <Form.Control type="number" className="my-2" name="height" placeholder={t("editPatient.placeholderHeight")} defaultValue={formData.height} />
                    </Col>
                    <Col sm={12} className="form-group">
                      <Form.Label className="mb-0">{t("editPatient.diagnosis")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="diagnosis" placeholder={t("editPatient.placeholderDiagnosis")} defaultValue={formData.diagnosis} />
                    </Col>
                    <Col sm={12} className="form-group">
                      <Form.Label className="mb-0">{t("editPatient.dischargeInstructions")}</Form.Label>
                      <Form.Control as="textarea" rows={3} className="my-2" name="dischargeNotes" placeholder={t("editPatient.placeholderDischargeNotes")} defaultValue={formData.dischargeNotes} />
                    </Col>
                  </Row>
                  <hr />
                  <h5 className="mb-3">{t("editPatient.sectionPassword")}</h5>
                  <Row className="cust-form-input">
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("editPatient.newPassword")}</Form.Label>
                      <Form.Control type="password" className="my-2" name="pass" placeholder={t("editPatient.placeholderKeepPassword")} minLength={6} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("editPatient.confirmPassword")}</Form.Label>
                      <Form.Control type="password" className="my-2" name="rpass" placeholder={t("editPatient.placeholderConfirm")} minLength={6} />
                    </Col>
                  </Row>
                  <div className="d-flex gap-2 mt-3">
                    <Button type="button" variant="outline-danger" onClick={() => navigate("/patient/patient-list")}>{t("editPatient.cancel")}</Button>
                    <Button type="submit" className="btn btn-primary-subtle" disabled={loading}>
                      {loading ? t("editPatient.saving") : t("editPatient.save")}
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

export default EditPatient;

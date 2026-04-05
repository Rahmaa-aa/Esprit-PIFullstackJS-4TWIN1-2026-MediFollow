import React, { useState, useEffect } from "react";
import Card from "../../components/Card";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { nurseApi } from "../../services/api";
import { HOSPITAL_DEPARTMENTS } from "../../constants/hospitalDepartments";

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
const COUNTRIES = ["France", "Canada", "USA", "Maroc", "Algérie", "Tunisie"];

const EditNurse = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [profilePreview, setProfilePreview] = useState(generatePath("/assets/images/user/11.png"));
  const [originalProfileImage, setOriginalProfileImage] = useState("");
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchNurse = async () => {
      setError("");
      try {
        const data = await nurseApi.getById(id);
        const imgSrc = data.profileImage?.startsWith("data:") ? data.profileImage : (data.profileImage?.startsWith("http") ? data.profileImage : generatePath(data.profileImage || "/assets/images/user/11.png"));
        setProfilePreview(imgSrc);
        setOriginalProfileImage(data.profileImage || "");
        setFormData({
          fname: data.firstName || "",
          lname: data.lastName || "",
          email: data.email || "",
          selectuserrole: data.specialty || "",
          cname: data.department || "",
          mobno: data.phone || "",
          add1: data.address || "",
          city: data.city || "",
          selectcountry: data.country || "",
          pno: data.pinCode || "",
          furl: data.facebookUrl || "",
          turl: data.twitterUrl || "",
          instaurl: data.instagramUrl || "",
          lurl: data.linkedinUrl || "",
        });
      } catch (err) {
        setError(err.message || t("editNurse.loadError"));
      } finally {
        setLoadingData(false);
      }
    };
    if (id) fetchNurse();
  }, [id, t]);

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
        setError(t("editNurse.passwordMismatch"));
        setLoading(false);
        return;
      }
      if (password?.length < 6) {
        setError(t("editNurse.passwordMinLength"));
        setLoading(false);
        return;
      }
    }

    const profileImage = profilePreview.startsWith("data:") ? profilePreview : (originalProfileImage || generatePath("/assets/images/user/11.png"));

    const payload = {
      firstName: form.fname?.value,
      lastName: form.lname?.value,
      email: form.email?.value,
      specialty: form.selectuserrole?.value,
      department: form.cname?.value,
      phone: form.mobno?.value,
      address: form.add1?.value,
      city: form.city?.value,
      country: form.selectcountry?.value,
      pinCode: form.pno?.value,
      facebookUrl: form.furl?.value,
      twitterUrl: form.turl?.value,
      instagramUrl: form.instaurl?.value,
      linkedinUrl: form.lurl?.value,
      profileImage,
    };
    if (password) payload.password = password;

    try {
      await nurseApi.update(id, payload);
      navigate(`/nurse/nurse-profile/${id}`);
    } catch (err) {
      if (err.status === 401) {
        navigate("/auth/lock-screen");
        return;
      }
      setError(err.message || t("editNurse.updateError"));
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
                <span className="visually-hidden">{t("editNurse.loading")}</span>
              </div>
              <p className="mt-3 mb-0">{t("editNurse.loading")}</p>
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
              <p className="text-danger mb-3">{error || t("editNurse.missingId")}</p>
              <Button variant="primary" onClick={() => navigate("/nurse/nurse-list")}>{t("editNurse.backToList")}</Button>
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
                <Card.Header.Title><h4 className="card-title">{t("editNurse.pageTitle")}</h4></Card.Header.Title>
              </Card.Header>
              <Card.Body>
                <Form.Group>
                  <Container className="d-flex flex-column align-items-center py-5">
                    <div className="text-center">
                      <img className="profile-pic img-fluid rounded-circle mb-3" src={profilePreview} alt={t("editNurse.profilePhotoAlt")} style={{ width: "150px", height: "150px", objectFit: "cover" }} />
                      <div>
                        <Button type="button" className="btn btn-primary rounded-1" onClick={() => document.getElementById("file-upload").click()}>{t("editNurse.profilePhoto")}</Button>
                        <input id="file-upload" className="d-none" type="file" accept="image/*" onChange={handleFileChange} />
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <span>{t("editNurse.acceptedFormats")} </span>
                      <span className="text-primary">.jpg .png .jpeg</span>
                    </div>
                  </Container>
                </Form.Group>
                <Form.Group className="cust-form-input">
                  <Form.Label className="mb-0">{t("editNurse.labelSpecialty")}</Form.Label>
                  <Form.Control as="select" className="my-2" name="selectuserrole" defaultValue={formData.selectuserrole}>
                    <option value="">{t("editNurse.selectPlaceholder")}</option>
                    {SPECIALTIES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Form.Group className="cust-form-input">
                  <Form.Label className="mb-0">{t("editNurse.labelFacebook")}</Form.Label>
                  <Form.Control type="text" className="my-2" name="furl" placeholder={t("editNurse.placeholderFacebook")} defaultValue={formData.furl} />
                </Form.Group>
                <Form.Group className="cust-form-input">
                  <Form.Label className="mb-0">{t("editNurse.labelTwitter")}</Form.Label>
                  <Form.Control type="text" className="my-2" name="turl" placeholder={t("editNurse.placeholderTwitter")} defaultValue={formData.turl} />
                </Form.Group>
                <Form.Group className="cust-form-input">
                  <Form.Label className="mb-0">{t("editNurse.labelInstagram")}</Form.Label>
                  <Form.Control type="text" className="my-2" name="instaurl" placeholder={t("editNurse.placeholderInstagram")} defaultValue={formData.instaurl} />
                </Form.Group>
                <Form.Group className="cust-form-input">
                  <Form.Label className="mb-0">{t("editNurse.labelLinkedIn")}</Form.Label>
                  <Form.Control type="text" className="my-2" name="lurl" placeholder={t("editNurse.placeholderLinkedIn")} defaultValue={formData.lurl} />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={9}>
            <Card>
              <Card.Header>
                <Card.Header.Title><h4 className="card-title">{t("editNurse.nurseInfoTitle")}</h4></Card.Header.Title>
              </Card.Header>
              <Card.Body>
                <div className="new-user-info">
                  {error && <div className="alert alert-danger">{error}</div>}
                  <Row className="cust-form-input">
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("editNurse.labelFirstName")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="fname" placeholder={t("editNurse.placeholderFirstName")} required defaultValue={formData.fname} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("editNurse.labelLastName")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="lname" placeholder={t("editNurse.placeholderLastName")} required defaultValue={formData.lname} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("editNurse.labelAddress1")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="add1" placeholder={t("editNurse.placeholderAddress")} defaultValue={formData.add1} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("editNurse.labelAddress2")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="add2" placeholder={t("editNurse.placeholderAddress2")} />
                    </Col>
                    <Col sm={12} className="form-group">
                      <Form.Label className="mb-0">{t("editNurse.labelDepartment")}</Form.Label>
                      <Form.Control as="select" className="my-2" name="cname" defaultValue={formData.cname}>
                        <option value="">{t("editNurse.selectDepartment")}</option>
                        {HOSPITAL_DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </Form.Control>
                    </Col>
                    <Col sm={12} className="form-group">
                      <Form.Label className="mb-0">{t("editNurse.labelCountry")}</Form.Label>
                      <Form.Control as="select" className="my-2" name="selectcountry" defaultValue={formData.selectcountry}>
                        <option value="">{t("editNurse.selectPlaceholder")}</option>
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </Form.Control>
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("editNurse.labelPhone")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="mobno" placeholder={t("editNurse.placeholderPhone")} defaultValue={formData.mobno} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("editNurse.labelAltContact")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="altconno" placeholder={t("editNurse.placeholderAltContact")} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("editNurse.labelEmail")}</Form.Label>
                      <Form.Control type="email" className="my-2" name="email" placeholder={t("editNurse.placeholderEmail")} required defaultValue={formData.email} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("editNurse.labelPostalCode")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="pno" placeholder={t("editNurse.placeholderPostalCode")} defaultValue={formData.pno} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("editNurse.labelCity")}</Form.Label>
                      <Form.Control type="text" className="my-2" name="city" placeholder={t("editNurse.placeholderCity")} defaultValue={formData.city} />
                    </Col>
                  </Row>
                  <hr />
                  <h5 className="mb-3">{t("editNurse.passwordSection")}</h5>
                  <Row className="cust-form-input">
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("editNurse.labelNewPassword")}</Form.Label>
                      <Form.Control type="password" className="my-2" name="pass" placeholder={t("editNurse.placeholderPasswordKeep")} minLength={6} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">{t("editNurse.labelConfirmPassword")}</Form.Label>
                      <Form.Control type="password" className="my-2" name="rpass" placeholder={t("editNurse.placeholderConfirm")} minLength={6} />
                    </Col>
                  </Row>
                  <div className="d-flex gap-2 mt-3">
                    <Button type="button" variant="outline-danger" onClick={() => navigate("/nurse/nurse-list")}>{t("editNurse.cancel")}</Button>
                    <Button type="submit" className="btn btn-primary-subtle" disabled={loading}>
                      {loading ? t("editNurse.saving") : t("editNurse.save")}
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

export default EditNurse;

import React, { useState } from "react";
import Card from "../../components/Card";
import { Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { patientApi } from "../../services/api";

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
const GENDERS = ["Homme", "Femme", "Autre"];

const SERVICES = [
  "Cardiologie",
  "Chirurgie",
  "Chirurgie orthopédique",
  "Dermatologie",
  "Endocrinologie",
  "Gastro-entérologie",
  "Gynécologie",
  "Médecine interne",
  "Neurologie",
  "Ophtalmologie",
  "ORL",
  "Pédiatrie",
  "Pneumologie",
  "Psychiatrie",
  "Radiologie",
  "Réanimation",
  "Rhumatologie",
  "Urologie",
  "Urgences",
];

const AddPatient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profilePreview, setProfilePreview] = useState(generatePath("/assets/images/user/11.png"));
  const [selectedCountry, setSelectedCountry] = useState(null);

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
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    if (password?.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
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
        service: form.service?.value,
        password,
        profileImage,
      });
      navigate("/patient/patient-list");
    } catch (err) {
      if (err.status === 401) {
        navigate("/auth/lock-screen");
        return;
      }
      setError(err.message || "Erreur lors de la création du patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
      <Row>
        <Col lg={3}>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">Ajouter un patient</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
                <Form.Group className="form-group">
                  <Container className="d-flex flex-column align-items-center py-5">
                    <div className="text-center">
                      <img className="profile-pic img-fluid rounded-circle mb-3" src={profilePreview} alt="profile-pic" style={{ width: "150px", height: "150px", objectFit: "cover" }} />
                      <div>
                        <Button type="button" className="btn btn-primary rounded-1" onClick={() => document.getElementById("file-upload").click()}>Photo de profil</Button>
                        <input id="file-upload" className="d-none" type="file" accept="image/*" onChange={handleFileChange} />
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <span>Formats acceptés : </span>
                      <span className="text-primary">.jpg .png .jpeg</span>
                    </div>
                  </Container>
                </Form.Group>
                <Form.Group className="form-group cust-form-input">
                  <Form.Label className="mb-0">Groupe sanguin :</Form.Label>
                  <Form.Control as="select" className="my-2" name="bloodType">
                    <option value="">Sélectionner</option>
                    {BLOOD_TYPES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Form.Group className="form-group cust-form-input">
                  <Form.Label className="mb-0">Genre :</Form.Label>
                  <Form.Control as="select" className="my-2" name="gender">
                    <option value="">Sélectionner</option>
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Form.Group className="form-group cust-form-input">
                  <Form.Label className="mb-0">Service / Consultation :</Form.Label>
                  <Form.Control as="select" className="my-2" name="service">
                    <option value="">Sélectionner le service</option>
                    {SERVICES.map((s) => (
                      <option key={s} value={s}>{s}</option>
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
                <h4 className="card-title">Informations du patient</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <div className="new-user-info">
                  {error && <div className="alert alert-danger">{error}</div>}
                  <Row className="cust-form-input">
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">Prénom :</Form.Label>
                      <Form.Control type="text" className="my-2" name="fname" placeholder="Prénom" required />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">Nom :</Form.Label>
                      <Form.Control type="text" className="my-2" name="lname" placeholder="Nom" required />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">Email :</Form.Label>
                      <Form.Control type="email" className="my-2" name="email" placeholder="Email" required />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">Date de naissance :</Form.Label>
                      <Form.Control type="date" className="my-2" name="dob" placeholder="Date de naissance" />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">Adresse :</Form.Label>
                      <Form.Control type="text" className="my-2" name="add1" placeholder="Adresse" />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">Ville :</Form.Label>
                      <Form.Control type="text" className="my-2" name="city" placeholder="Ville" />
                    </Col>
                    <Col sm={12} className="form-group">
                      <Form.Label className="mb-0">Pays :</Form.Label>
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
                        <option value="">Sélectionner</option>
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </Form.Control>
                      {selectedCountry && (
                        <div className="d-flex align-items-center gap-2 mt-1">
                          <img src={selectedCountry.flagUrl} alt="" style={{ width: 24, height: 18, objectFit: "cover" }} />
                          <span>{selectedCountry.name}</span>
                        </div>
                      )}
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">Téléphone :</Form.Label>
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
                          placeholder={selectedCountry ? (selectedCountry.dialCode === "+216" ? "ex: 12 345 678" : "ex: 6 12 34 56 78") : "Sélectionnez un pays d'abord"}
                        />
                      </InputGroup>
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">Contact alternatif :</Form.Label>
                      <Form.Control type="text" className="my-2" name="altconno" placeholder="Contact alternatif" />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">Code postal :</Form.Label>
                      <Form.Control type="text" className="my-2" name="pno" placeholder="Code postal" />
                    </Col>
                  </Row>
                  <hr />
                  <h5 className="mb-3">Compte de connexion</h5>
                  <Row className="cust-form-input">
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">Mot de passe :</Form.Label>
                      <Form.Control type="password" className="my-2" name="pass" placeholder="Mot de passe (min. 6 caractères)" required minLength={6} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">Confirmer le mot de passe :</Form.Label>
                      <Form.Control type="password" className="my-2" name="rpass" placeholder="Confirmer" required />
                    </Col>
                  </Row>
                  <div className="d-flex gap-2 mt-3">
                    <Button type="button" variant="outline-danger" onClick={() => navigate("/patient/patient-list")}>Annuler</Button>
                    <Button type="submit" className="btn btn-primary-subtle" disabled={loading}>
                      {loading ? "Création..." : "Enregistrer"}
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

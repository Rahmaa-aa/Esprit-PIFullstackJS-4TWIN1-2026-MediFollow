import React, { useState, useEffect } from "react";
import Card from "../../components/Card";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { doctorApi } from "../../services/api";

const generatePath = (path) => window.origin + import.meta.env.BASE_URL + path;

const SPECIALTIES = ["Surgery", "Gastroenterologist", "Endocrinologist", "Orthopaedic surgeon", "Cardiologist", "Family Physicians", "Gynaecology", "Eye Special", "Therapy Special", "Orthopedics Special", "Anesthesiologists", "General", "MD"];
const COUNTRIES = ["France", "Canada", "USA", "Maroc", "Algérie", "Tunisie"];

const EditDoctor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [profilePreview, setProfilePreview] = useState(generatePath("/assets/images/user/11.png"));
  const [originalProfileImage, setOriginalProfileImage] = useState("");

  useEffect(() => {
    const fetchDoctor = async () => {
      setError("");
      try {
        const data = await doctorApi.getById(id);
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
        setError(err.message || "Médecin non trouvé");
      } finally {
        setLoadingData(false);
      }
    };
    if (id) fetchDoctor();
  }, [id]);

  const [formData, setFormData] = useState({});

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
        setError("Les mots de passe ne correspondent pas");
        setLoading(false);
        return;
      }
      if (password?.length < 6) {
        setError("Le mot de passe doit contenir au moins 6 caractères");
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
      await doctorApi.update(id, payload);
      navigate("/doctor/doctor-list");
    } catch (err) {
      if (err.status === 401) {
        navigate("/auth/lock-screen");
        return;
      }
      setError(err.message || "Erreur lors de la mise à jour");
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
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-3 mb-0">Chargement...</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  if (!id || error && !formData.fname) {
    return (
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Body className="text-center py-5">
              <p className="text-danger mb-3">{error || "ID manquant"}</p>
              <Button variant="primary" onClick={() => navigate("/doctor/doctor-list")}>Retour à la liste</Button>
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
                <Card.Header.Title><h4 className="card-title">Modifier le médecin</h4></Card.Header.Title>
              </Card.Header>
              <Card.Body>
                <Form.Group>
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
                <Form.Group className="cust-form-input">
                  <Form.Label className="mb-0">Spécialité :</Form.Label>
                  <Form.Control as="select" className="my-2" name="selectuserrole" defaultValue={formData.selectuserrole}>
                    <option value="">Sélectionner</option>
                    {SPECIALTIES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Form.Group className="cust-form-input">
                  <Form.Label className="mb-0">Facebook :</Form.Label>
                  <Form.Control type="text" className="my-2" name="furl" placeholder="URL Facebook" defaultValue={formData.furl} />
                </Form.Group>
                <Form.Group className="cust-form-input">
                  <Form.Label className="mb-0">Twitter :</Form.Label>
                  <Form.Control type="text" className="my-2" name="turl" placeholder="URL Twitter" defaultValue={formData.turl} />
                </Form.Group>
                <Form.Group className="cust-form-input">
                  <Form.Label className="mb-0">Instagram :</Form.Label>
                  <Form.Control type="text" className="my-2" name="instaurl" placeholder="URL Instagram" defaultValue={formData.instaurl} />
                </Form.Group>
                <Form.Group className="cust-form-input">
                  <Form.Label className="mb-0">LinkedIn :</Form.Label>
                  <Form.Control type="text" className="my-2" name="lurl" placeholder="URL LinkedIn" defaultValue={formData.lurl} />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={9}>
            <Card>
              <Card.Header>
                <Card.Header.Title><h4 className="card-title">Informations du médecin</h4></Card.Header.Title>
              </Card.Header>
              <Card.Body>
                <div className="new-user-info">
                  {error && <div className="alert alert-danger">{error}</div>}
                  <Row className="cust-form-input">
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">Prénom :</Form.Label>
                      <Form.Control type="text" className="my-2" name="fname" placeholder="Prénom" required defaultValue={formData.fname} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">Nom :</Form.Label>
                      <Form.Control type="text" className="my-2" name="lname" placeholder="Nom" required defaultValue={formData.lname} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">Adresse 1 :</Form.Label>
                      <Form.Control type="text" className="my-2" name="add1" placeholder="Adresse" defaultValue={formData.add1} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">Adresse 2 :</Form.Label>
                      <Form.Control type="text" className="my-2" name="add2" placeholder="Complément" />
                    </Col>
                    <Col sm={12} className="form-group">
                      <Form.Label className="mb-0">Département :</Form.Label>
                      <Form.Control type="text" className="my-2" name="cname" placeholder="Département" defaultValue={formData.cname} />
                    </Col>
                    <Col sm={12} className="form-group">
                      <Form.Label className="mb-0">Pays :</Form.Label>
                      <Form.Control as="select" className="my-2" name="selectcountry" defaultValue={formData.selectcountry}>
                        <option value="">Sélectionner</option>
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </Form.Control>
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">Téléphone :</Form.Label>
                      <Form.Control type="text" className="my-2" name="mobno" placeholder="Téléphone" defaultValue={formData.mobno} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">Contact alternatif :</Form.Label>
                      <Form.Control type="text" className="my-2" name="altconno" placeholder="Contact alternatif" />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">Email :</Form.Label>
                      <Form.Control type="email" className="my-2" name="email" placeholder="Email" required defaultValue={formData.email} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">Code postal :</Form.Label>
                      <Form.Control type="text" className="my-2" name="pno" placeholder="Code postal" defaultValue={formData.pno} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">Ville :</Form.Label>
                      <Form.Control type="text" className="my-2" name="city" placeholder="Ville" defaultValue={formData.city} />
                    </Col>
                  </Row>
                  <hr />
                  <h5 className="mb-3">Changer le mot de passe (optionnel)</h5>
                  <Row className="cust-form-input">
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">Nouveau mot de passe :</Form.Label>
                      <Form.Control type="password" className="my-2" name="pass" placeholder="Laisser vide pour conserver" minLength={6} />
                    </Col>
                    <Col md={6} className="form-group">
                      <Form.Label className="mb-0">Confirmer :</Form.Label>
                      <Form.Control type="password" className="my-2" name="rpass" placeholder="Confirmer" minLength={6} />
                    </Col>
                  </Row>
                  <div className="d-flex gap-2 mt-3">
                    <Button type="button" variant="outline-danger" onClick={() => navigate("/doctor/doctor-list")}>Annuler</Button>
                    <Button type="submit" className="btn btn-primary-subtle" disabled={loading}>
                      {loading ? "Enregistrement..." : "Enregistrer"}
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

export default EditDoctor;

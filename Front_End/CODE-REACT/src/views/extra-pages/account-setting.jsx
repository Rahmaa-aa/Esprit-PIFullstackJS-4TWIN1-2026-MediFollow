import React, { useState, useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";
import Card from "../../components/Card";
import { authApi } from "../../services/api";

const generatePath = (path) => window.origin + import.meta.env.BASE_URL + path;

const LANGUAGES = [
  { id: "english", label: "English" },
  { id: "french", label: "French" },
  { id: "hindi", label: "Hindi" },
  { id: "spanish", label: "Spanish" },
  { id: "arabic", label: "Arabic" },
  { id: "italian", label: "Italian" },
];

const AccountSetting = () => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [accountSuccess, setAccountSuccess] = useState("");
  const [socialSuccess, setSocialSuccess] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authApi.me();
        setUser(data.user);
      } catch (err) {
        if (err.status === 401) {
          window.location.href = generatePath("/auth/lock-screen");
          return;
        }
        setError(err.message || "Erreur de chargement");
      } finally {
        setLoadingData(false);
      }
    };
    fetchUser();
  }, []);

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setAccountSuccess("");
    setSocialSuccess("");
    setLoading(true);

    const form = e.target;
    const name = form.uname?.value?.trim();
    const email = form.email?.value?.trim();
    const alternateEmail = form.altemail?.value?.trim();

    const languages = [];
    LANGUAGES.forEach(({ id }) => {
      if (form[id]?.checked) languages.push(id);
    });

    try {
      const updated = await authApi.updateMe({ name, email, alternateEmail, languages });
      const stored = JSON.parse(localStorage.getItem("adminUser") || "{}");
      localStorage.setItem("adminUser", JSON.stringify({ ...stored, ...updated }));
      setUser((prev) => ({ ...prev, ...updated }));
      window.dispatchEvent(new CustomEvent("admin-updated"));
      setAccountSuccess("Paramètres du compte enregistrés.");
    } catch (err) {
      if (err.status === 401) {
        window.location.href = generatePath("/auth/lock-screen");
        return;
      }
      setError(err.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setAccountSuccess("");
    setSocialSuccess("");
    setLoading(true);

    const form = e.target;
    const socialMedia = {
      facebook: form.facebook?.value?.trim() || "",
      twitter: form.twitter?.value?.trim() || "",
      google: form.google?.value?.trim() || "",
      instagram: form.instagram?.value?.trim() || "",
      youtube: form.youtube?.value?.trim() || "",
    };

    try {
      const updated = await authApi.updateMe({ socialMedia });
      const stored = JSON.parse(localStorage.getItem("adminUser") || "{}");
      localStorage.setItem("adminUser", JSON.stringify({ ...stored, ...updated }));
      setUser((prev) => ({ ...prev, ...updated }));
      setSocialSuccess("Réseaux sociaux enregistrés.");
    } catch (err) {
      if (err.status === 401) {
        window.location.href = generatePath("/auth/lock-screen");
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

  if (error && !user) {
    return (
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Body className="text-center py-5">
              <p className="text-danger mb-3">{error}</p>
              <a href={generatePath("/admin/dashboard")} className="btn btn-primary">
                Retour au tableau de bord
              </a>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <>
      <h1>Account Setting Page</h1>
      <Row>
        <Col lg={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">Account Setting</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <div className="acc-edit">
                <Form onSubmit={handleAccountSubmit}>
                  {error && <div className="alert alert-danger py-2">{error}</div>}
                  {accountSuccess && <div className="alert alert-success py-2">{accountSuccess}</div>}
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="uname">User Name:</Form.Label>
                    <Form.Control type="text" id="uname" name="uname" defaultValue={user?.name || ""} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="email">Email Id:</Form.Label>
                    <Form.Control type="email" id="email" name="email" defaultValue={user?.email || ""} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="altemail">Alternate Email:</Form.Label>
                    <Form.Control type="email" id="altemail" name="altemail" defaultValue={user?.alternateEmail || ""} />
                  </Form.Group>
                  <Form.Group className="form-group mb-3">
                    <Form.Label className="d-block">Language Known:</Form.Label>
                    {LANGUAGES.map(({ id, label }) => (
                      <Form.Check key={id} inline type="checkbox" id={id} name={id} defaultChecked={user?.languages?.includes(id)} label={label} />
                    ))}
                  </Form.Group>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Enregistrement..." : "Submit"}
                  </button>{" "}
                  <button type="reset" className="btn btn-danger-subtle">
                    Cancel
                  </button>
                </Form>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">Social Media</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <div className="acc-edit">
                <Form onSubmit={handleSocialSubmit}>
                  {error && <div className="alert alert-danger py-2">{error}</div>}
                  {socialSuccess && <div className="alert alert-success py-2">{socialSuccess}</div>}
                  <Form.Group className="form-group mb-3">
                    <Form.Label htmlFor="facebook">Facebook:</Form.Label>
                    <Form.Control
                      type="text"
                      id="facebook"
                      name="facebook"
                      defaultValue={user?.socialMedia?.facebook || ""}
                      placeholder="www.facebook.com"
                    />
                  </Form.Group>
                  <Form.Group className="form-group mb-3">
                    <Form.Label htmlFor="twitter">Twitter:</Form.Label>
                    <Form.Control
                      type="text"
                      id="twitter"
                      name="twitter"
                      defaultValue={user?.socialMedia?.twitter || ""}
                      placeholder="www.twitter.com"
                    />
                  </Form.Group>
                  <Form.Group className="form-group mb-3">
                    <Form.Label htmlFor="google">Google +:</Form.Label>
                    <Form.Control
                      type="text"
                      id="google"
                      name="google"
                      defaultValue={user?.socialMedia?.google || ""}
                      placeholder="www.google.com"
                    />
                  </Form.Group>
                  <Form.Group className="form-group mb-3">
                    <Form.Label htmlFor="instagram">Instagram:</Form.Label>
                    <Form.Control
                      type="text"
                      id="instagram"
                      name="instagram"
                      defaultValue={user?.socialMedia?.instagram || ""}
                      placeholder="www.instagram.com"
                    />
                  </Form.Group>
                  <Form.Group className="form-group mb-3">
                    <Form.Label htmlFor="youtube">You Tube:</Form.Label>
                    <Form.Control
                      type="text"
                      id="youtube"
                      name="youtube"
                      defaultValue={user?.socialMedia?.youtube || ""}
                      placeholder="www.youtube.com"
                    />
                  </Form.Group>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Enregistrement..." : "Submit"}
                  </button>{" "}
                  <button type="reset" className="btn btn-danger-subtle">
                    Cancel
                  </button>
                </Form>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AccountSetting;

import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Col, Form, Row } from "react-bootstrap";
import Card from "../../components/Card";
import { authApi } from "../../services/api";

const generatePath = (path) => window.origin + import.meta.env.BASE_URL + path;

const LANGUAGE_IDS = ["english", "french", "hindi", "spanish", "arabic", "italian"];

const AccountSetting = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [accountSuccess, setAccountSuccess] = useState("");
  const [socialSuccess, setSocialSuccess] = useState("");
  const [user, setUser] = useState(null);

  const languages = useMemo(
    () => LANGUAGE_IDS.map((id) => ({ id, label: t(`accountSettings.lang.${id}`) })),
    [t],
  );

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
        setError(err.message || t("accountSettings.loadError"));
      } finally {
        setLoadingData(false);
      }
    };
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
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

    const langs = [];
    LANGUAGE_IDS.forEach((id) => {
      if (form[id]?.checked) langs.push(id);
    });

    try {
      const updated = await authApi.updateMe({ name, email, alternateEmail, languages: langs });
      const stored = JSON.parse(localStorage.getItem("adminUser") || "{}");
      localStorage.setItem("adminUser", JSON.stringify({ ...stored, ...updated }));
      setUser((prev) => ({ ...prev, ...updated }));
      window.dispatchEvent(new CustomEvent("admin-updated"));
      setAccountSuccess(t("accountSettings.accountSaved"));
    } catch (err) {
      if (err.status === 401) {
        window.location.href = generatePath("/auth/lock-screen");
        return;
      }
      setError(err.message || t("accountSettings.updateError"));
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
      setSocialSuccess(t("accountSettings.socialSaved"));
    } catch (err) {
      if (err.status === 401) {
        window.location.href = generatePath("/auth/lock-screen");
        return;
      }
      setError(err.message || t("accountSettings.updateError"));
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
                <span className="visually-hidden">{t("accountSettings.loadingHidden")}</span>
              </div>
              <p className="mt-3 mb-0">{t("accountSettings.loading")}</p>
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
                {t("accountSettings.backToDashboard")}
              </a>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <>
      <h1>{t("accountSettings.pageHeading")}</h1>
      <Row>
        <Col lg={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">{t("accountSettings.cardAccount")}</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <div className="acc-edit">
                <Form onSubmit={handleAccountSubmit}>
                  {error && <div className="alert alert-danger py-2">{error}</div>}
                  {accountSuccess && <div className="alert alert-success py-2">{accountSuccess}</div>}
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="uname">{t("accountSettings.userName")}</Form.Label>
                    <Form.Control type="text" id="uname" name="uname" defaultValue={user?.name || ""} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="email">{t("accountSettings.email")}</Form.Label>
                    <Form.Control type="email" id="email" name="email" defaultValue={user?.email || ""} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="altemail">{t("accountSettings.alternateEmail")}</Form.Label>
                    <Form.Control type="email" id="altemail" name="altemail" defaultValue={user?.alternateEmail || ""} />
                  </Form.Group>
                  <Form.Group className="form-group mb-3">
                    <Form.Label className="d-block">{t("accountSettings.languageKnown")}</Form.Label>
                    {languages.map(({ id, label }) => (
                      <Form.Check key={id} inline type="checkbox" id={id} name={id} defaultChecked={user?.languages?.includes(id)} label={label} />
                    ))}
                  </Form.Group>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? t("accountSettings.saving") : t("accountSettings.submit")}
                  </button>{" "}
                  <button type="reset" className="btn btn-danger-subtle">
                    {t("accountSettings.cancel")}
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
                <h4 className="card-title">{t("accountSettings.cardSocial")}</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <div className="acc-edit">
                <Form onSubmit={handleSocialSubmit}>
                  {error && <div className="alert alert-danger py-2">{error}</div>}
                  {socialSuccess && <div className="alert alert-success py-2">{socialSuccess}</div>}
                  <Form.Group className="form-group mb-3">
                    <Form.Label htmlFor="facebook">{t("accountSettings.facebook")}</Form.Label>
                    <Form.Control
                      type="text"
                      id="facebook"
                      name="facebook"
                      defaultValue={user?.socialMedia?.facebook || ""}
                      placeholder={t("accountSettings.placeholderFacebook")}
                    />
                  </Form.Group>
                  <Form.Group className="form-group mb-3">
                    <Form.Label htmlFor="twitter">{t("accountSettings.twitter")}</Form.Label>
                    <Form.Control
                      type="text"
                      id="twitter"
                      name="twitter"
                      defaultValue={user?.socialMedia?.twitter || ""}
                      placeholder={t("accountSettings.placeholderTwitter")}
                    />
                  </Form.Group>
                  <Form.Group className="form-group mb-3">
                    <Form.Label htmlFor="google">{t("accountSettings.googlePlus")}</Form.Label>
                    <Form.Control
                      type="text"
                      id="google"
                      name="google"
                      defaultValue={user?.socialMedia?.google || ""}
                      placeholder={t("accountSettings.placeholderGoogle")}
                    />
                  </Form.Group>
                  <Form.Group className="form-group mb-3">
                    <Form.Label htmlFor="instagram">{t("accountSettings.instagram")}</Form.Label>
                    <Form.Control
                      type="text"
                      id="instagram"
                      name="instagram"
                      defaultValue={user?.socialMedia?.instagram || ""}
                      placeholder={t("accountSettings.placeholderInstagram")}
                    />
                  </Form.Group>
                  <Form.Group className="form-group mb-3">
                    <Form.Label htmlFor="youtube">{t("accountSettings.youtube")}</Form.Label>
                    <Form.Control
                      type="text"
                      id="youtube"
                      name="youtube"
                      defaultValue={user?.socialMedia?.youtube || ""}
                      placeholder={t("accountSettings.placeholderYoutube")}
                    />
                  </Form.Group>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? t("accountSettings.saving") : t("accountSettings.submit")}
                  </button>{" "}
                  <button type="reset" className="btn btn-danger-subtle">
                    {t("accountSettings.cancel")}
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

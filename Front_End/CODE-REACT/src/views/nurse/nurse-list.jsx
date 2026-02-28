import React, { useState, useEffect, useMemo } from "react";
import { Col, Row, Form, InputGroup } from "react-bootstrap";
import Card from "../../components/Card";
import { Link } from "react-router-dom";
import { nurseApi } from "../../services/api";

const generatePath = (path) => window.origin + import.meta.env.BASE_URL + path;

const DEFAULT_AVATAR = generatePath("/assets/images/user/11.png");

const NurseList = () => {
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [filterName, setFilterName] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");

  const filteredNurses = useMemo(() => {
    const nameLower = filterName.trim().toLowerCase();
    const specialtyLower = filterSpecialty.trim().toLowerCase();
    return nurses.filter((n) => {
      const matchName = !nameLower || `${(n.firstName || "").toLowerCase()} ${(n.lastName || "").toLowerCase()}`.includes(nameLower);
      const matchSpecialty = !specialtyLower || (n.specialty || "").toLowerCase().includes(specialtyLower);
      return matchName && matchSpecialty;
    });
  }, [nurses, filterName, filterSpecialty]);

  const fetchNurses = async () => {
    try {
      const data = await nurseApi.getAll();
      setNurses(data);
      setError("");
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des infirmières");
      setNurses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNurses();
  }, []);

  const handleDelete = async (nurse) => {
    if (!window.confirm(`Supprimer ${nurse.firstName} ${nurse.lastName} ?`)) return;
    setDeletingId(nurse._id);
    try {
      await nurseApi.delete(nurse._id);
      setNurses((prev) => prev.filter((n) => n._id !== nurse._id));
    } catch (err) {
      if (err.status === 401) window.location.href = "/auth/lock-screen";
      else alert(err.message || "Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  };

  const getImageSrc = (nurse) => {
    if (nurse.profileImage?.startsWith("data:")) return nurse.profileImage;
    if (nurse.profileImage?.startsWith("http") || nurse.profileImage?.startsWith("/")) {
      return nurse.profileImage.startsWith("http") ? nurse.profileImage : generatePath(nurse.profileImage);
    }
    return DEFAULT_AVATAR;
  };

  if (loading) {
    return (
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Body className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="mt-3 mb-0">Chargement des infirmières...</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <>
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Header className="card-header-custom d-flex justify-content-between align-items-center p-4 mb-0 border-bottom-0">
              <Card.Header.Title>
                <h4 className="card-title">Liste des infirmières</h4>
              </Card.Header.Title>
              <Link to="/nurse/add-nurse" className="btn btn-primary-subtle">
                <i className="ri-user-add-fill me-1"></i>Ajouter une infirmière
              </Link>
            </Card.Header>
            <Card.Body className="pt-0">
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group className="mb-0">
                    <Form.Label className="small">Filtrer par nom</Form.Label>
                    <InputGroup>
                      <InputGroup.Text><i className="ri-user-search-line"></i></InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Nom..."
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-0">
                    <Form.Label className="small">Filtrer par spécialité</Form.Label>
                    <InputGroup>
                      <InputGroup.Text><i className="ri-stethoscope-line"></i></InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Spécialité..."
                        value={filterSpecialty}
                        onChange={(e) => setFilterSpecialty(e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                  {(filterName || filterSpecialty) && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => { setFilterName(""); setFilterSpecialty(""); }}
                    >
                      <i className="ri-filter-off-line me-1"></i>Réinitialiser
                    </button>
                  )}
                </Col>
              </Row>
              {(filterName || filterSpecialty) && (
                <p className="text-muted small mb-0 mt-2">
                  {filteredNurses.length} infirmière{filteredNurses.length !== 1 ? "s" : ""} trouvée{filteredNurses.length !== 1 ? "s" : ""}
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {error && (
          <Col sm={12}>
            <div className="alert alert-warning mt-3">{error}</div>
          </Col>
        )}

        {nurses.length === 0 && !error ? (
          <Col sm={12}>
            <Card>
              <Card.Body className="text-center py-5">
                <p className="text-muted mb-3">Aucune infirmière enregistrée.</p>
                <Link to="/nurse/add-nurse" className="btn btn-primary-subtle">Ajouter la première infirmière</Link>
              </Card.Body>
            </Card>
          </Col>
        ) : nurses.length > 0 && filteredNurses.length === 0 ? (
          <Col sm={12}>
            <Card>
              <Card.Body className="text-center py-5">
                <p className="text-muted mb-3">Aucune infirmière ne correspond aux filtres.</p>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => { setFilterName(""); setFilterSpecialty(""); }}
                >
                  Réinitialiser les filtres
                </button>
              </Card.Body>
            </Card>
          </Col>
        ) : null}

        {filteredNurses.map((nurse) => (
          <Col key={nurse._id} sm={6} md={3}>
            <Card>
              <Card.Body className="text-center">
                <Link to={`/nurse/nurse-profile/${nurse._id}`} className="text-decoration-none text-body d-block">
                  <div className="doc-profile">
                    <img
                      className="rounded-circle img-fluid avatar-80"
                      src={getImageSrc(nurse)}
                      alt={nurse.firstName}
                      style={{ width: "80px", height: "80px", objectFit: "cover" }}
                    />
                  </div>
                  <div className="doc-info mt-3">
                    <h5 className="mb-1">{nurse.firstName} {nurse.lastName}</h5>
                    <p className="text-muted mb-0">{nurse.specialty || "Infirmier(ère)"}{nurse.department ? ` • ${nurse.department}` : ""}</p>
                    <small className="text-muted">{nurse.email}</small>
                  </div>
                </Link>
                <div className="d-flex gap-2 justify-content-center flex-wrap mt-3">
                  <Link to={`/nurse/nurse-profile/${nurse._id}`} className="btn btn-primary-subtle btn-sm">Profil</Link>
                  <Link to={`/nurse/edit-nurse/${nurse._id}`} className="btn btn-warning-subtle btn-sm">Modifier</Link>
                  <button
                    type="button"
                    className="btn btn-danger-subtle btn-sm"
                    onClick={() => handleDelete(nurse)}
                    disabled={deletingId === nurse._id}
                  >
                    {deletingId === nurse._id ? "..." : "Supprimer"}
                  </button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default NurseList;

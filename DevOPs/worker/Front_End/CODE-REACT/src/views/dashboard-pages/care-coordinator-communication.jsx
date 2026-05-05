import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Row, Col, Card as BsCard, Badge, Button, Spinner, Form, InputGroup } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Card from "../../components/Card";
import PaginationBar from "../../components/PaginationBar";
import { usePagination } from "../../hooks/usePagination";
import { chatApi } from "../../services/api";

const TEMPLATE_IDS = ["vitals", "appointment", "missedAppointment", "lab", "general"];

function chatHref(peerRole, peerId) {
    const q = new URLSearchParams({ peerRole, peerId: String(peerId) });
    return `/chat?${q.toString()}`;
}

function chatHrefPatient(patientId) {
    const q = new URLSearchParams({ patientId: String(patientId) });
    return `/chat?${q.toString()}`;
}

const CareCoordinatorCommunication = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [contacts, setContacts] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [searchContact, setSearchContact] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        let u = null;
        try {
            const raw = localStorage.getItem("adminUser");
            u = raw ? JSON.parse(raw) : null;
        } catch {
            u = null;
        }
        if (!token || u?.role !== "carecoordinator") {
            navigate("/auth/sign-in", { replace: true });
            return;
        }
        setUser(u);
    }, [navigate]);

    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        setLoadError(null);
        (async () => {
            try {
                const dc = await chatApi.getDepartmentContacts();
                if (!cancelled) setContacts(dc);
            } catch (e) {
                if (!cancelled) {
                    setLoadError(e?.message || "error");
                    setContacts(null);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [user]);

    const contactRows = useMemo(() => {
        if (!contacts) return [];
        const out = [];
        for (const p of contacts.assignedPatients || []) {
            out.push({
                key: `patient:${p.id}`,
                thread: "patient",
                patientId: p.id,
                name: p.displayName || `${p.firstName || ""} ${p.lastName || ""}`.trim() || String(p.id),
                roleLabel: t("careCoordinatorCommunication.rolePatient"),
            });
        }
        for (const d of contacts.doctors || []) {
            out.push({
                key: `doctor:${d.id}`,
                thread: "peer",
                peerRole: "doctor",
                peerId: d.id,
                name: d.displayName || `${d.firstName || ""} ${d.lastName || ""}`.trim() || String(d.id),
                roleLabel: t("careCoordinatorCommunication.roleDoctor"),
            });
        }
        for (const n of contacts.nurses || []) {
            out.push({
                key: `nurse:${n.id}`,
                thread: "peer",
                peerRole: "nurse",
                peerId: n.id,
                name: n.displayName || `${n.firstName || ""} ${n.lastName || ""}`.trim() || String(n.id),
                roleLabel: t("careCoordinatorCommunication.roleNurse"),
            });
        }
    return out;
  }, [contacts, t]);

  const filteredContacts = useMemo(() => {
    if (!searchContact.trim()) return contactRows;
    const q = searchContact.toLowerCase();
    return contactRows.filter((r) => r.name.toLowerCase().includes(q));
  }, [contactRows, searchContact]);

  const { page, setPage, totalPages, paginated: paginatedContacts, totalItems } = usePagination(filteredContacts, 5);

    const copyTemplate = useCallback(
        async (id) => {
            const body = t(`careCoordinatorCommunication.template_${id}.body`);
            try {
                await navigator.clipboard.writeText(body);
                setCopiedId(id);
                window.setTimeout(() => setCopiedId(null), 2000);
            } catch {
                /* ignore */
            }
        },
        [t],
    );

    if (!user) {
        return null;
    }

    return (
        <>
            <Row>
                <Col sm={12}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <Card.Header.Title>
                                <h4 className="card-title mb-0">{t("careCoordinatorCommunication.pageTitle")}</h4>
                            </Card.Header.Title>
                            <Badge bg="secondary">{t("careCoordinatorDashboard.roleBadge")}</Badge>
                        </Card.Header>
                        <Card.Body>
                            <p className="text-muted mb-4">{t("careCoordinatorCommunication.intro")}</p>

                            <h5 className="mb-2">{t("careCoordinatorCommunication.templatesTitle")}</h5>
                            <p className="small text-muted mb-3">{t("careCoordinatorCommunication.templatesHint")}</p>
                            <Row className="g-3 mb-4">
                                {TEMPLATE_IDS.map((id) => (
                                    <Col md={6} lg={4} key={id}>
                                        <BsCard className="border shadow-sm h-100">
                                            <BsCard.Body className="d-flex flex-column">
                                                <BsCard.Title as="h6" className="small text-uppercase text-muted mb-2">
                                                    {t(`careCoordinatorCommunication.template_${id}.title`)}
                                                </BsCard.Title>
                                                <p className="small flex-grow-1 mb-3" style={{ whiteSpace: "pre-wrap" }}>
                                                    {t(`careCoordinatorCommunication.template_${id}.body`)}
                                                </p>
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    onClick={() => copyTemplate(id)}
                                                    className="align-self-start"
                                                >
                                                    {copiedId === id
                                                        ? t("careCoordinatorCommunication.copied")
                                                        : t("careCoordinatorCommunication.copy")}
                                                </Button>
                                            </BsCard.Body>
                                        </BsCard>
                                    </Col>
                                ))}
                            </Row>

                            <h5 className="mb-2">{t("careCoordinatorCommunication.contactsTitle")}</h5>
                            <p className="small text-muted mb-3">{t("careCoordinatorCommunication.contactsHint")}</p>

                            {loadError && (
                                <p className="text-danger small mb-3">{t("careCoordinatorCommunication.contactsError")}</p>
                            )}
                            {!contacts && !loadError && (
                                <div className="d-flex align-items-center gap-2 text-muted mb-3">
                                    <Spinner animation="border" size="sm" />
                                    <span>{t("careCoordinatorCommunication.loadingContacts")}</span>
                                </div>
                            )}
                            {contacts && !contactRows.length && !loadError && (
                                <p className="text-muted small">{t("careCoordinatorCommunication.emptyContacts")}</p>
                            )}
                            {contactRows.length > 0 && (
                                <>
                                    {/* Recherche contacts */}
                                    <Row className="g-2 mb-3">
                                        <Col md={5}>
                                            <InputGroup size="sm">
                                                <InputGroup.Text><i className="ri-search-line" /></InputGroup.Text>
                                                <Form.Control
                                                    placeholder="Search by name..."
                                                    value={searchContact}
                                                    onChange={(e) => setSearchContact(e.target.value)}
                                                />
                                                {searchContact && (
                                                    <Button variant="outline-secondary" size="sm" onClick={() => setSearchContact("")}>
                                                        <i className="ri-close-line" />
                                                    </Button>
                                                )}
                                            </InputGroup>
                                        </Col>
                                        <Col md={2} className="d-flex align-items-center">
                                            <small className="text-muted">{filteredContacts.length} / {contactRows.length} contacts</small>
                                        </Col>
                                    </Row>
                                    <div className="table-responsive">
                                        <table className="table table-sm align-middle mb-0">
                                            <thead>
                                                <tr>
                                                    <th>{t("careCoordinatorCommunication.thName")}</th>
                                                    <th>{t("careCoordinatorCommunication.thRole")}</th>
                                                    <th className="text-end">{t("careCoordinatorCommunication.thAction")}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedContacts.map((row) => (
                                                    <tr key={row.key}>
                                                        <td>{row.name}</td>
                                                        <td>
                                                            <Badge bg="light" text="dark" className="fw-normal">
                                                                {row.roleLabel}
                                                            </Badge>
                                                        </td>
                                                        <td className="text-end">
                                                            <Button
                                                                as={Link}
                                                                size="sm"
                                                                variant="primary"
                                                                to={
                                                                    row.thread === "patient"
                                                                        ? chatHrefPatient(row.patientId)
                                                                        : chatHref(row.peerRole, row.peerId)
                                                                }
                                                            >
                                                                {t("careCoordinatorCommunication.openChat")}
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <PaginationBar
                                        page={page}
                                        totalPages={totalPages}
                                        totalItems={totalItems}
                                        pageSize={5}
                                        onPageChange={setPage}
                                    />
                                </>
                            )}

                            <div className="mt-4">
                                <Link to="/dashboard-pages/care-coordinator-dashboard" className="btn btn-link p-0">
                                    ← {t("careCoordinatorAppointments.backDashboard")}
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default CareCoordinatorCommunication;

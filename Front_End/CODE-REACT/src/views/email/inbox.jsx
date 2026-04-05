import React, { useCallback, useEffect, useState } from "react";
import EmailDetails from "../../components/email-details";
import { Col, Form, Nav, OverlayTrigger, Row, Tab, Tooltip } from "react-bootstrap";
import Card from "../../components/Card";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import InboxEmailIcon from "../../components/inbox-email-icon";
import { useTranslation } from "react-i18next";
import { mailApi } from "../../services/api";

function formatBytes(n) {
  if (n == null || Number.isNaN(n)) return "—";
  const gb = n / (1024 * 1024 * 1024);
  return `${gb.toFixed(2)} GB`;
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return String(iso);
  }
}

const Inbox = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const stateIdFromUrl = searchParams.get("stateId");
  const [showDetails, setShowDetails] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [folder, setFolder] = useState("inbox");
  const [starredOnly, setStarredOnly] = useState(false);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [counts, setCounts] = useState({
    inboxUnread: 0,
    drafts: 0,
    trash: 0,
    spam: 0,
    important: 0,
  });
  const [storage, setStorage] = useState(null);
  const [labels, setLabels] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [list, c, st, lab] = await Promise.all([
        mailApi.listMessages({
          folder: starredOnly ? undefined : folder,
          starred: starredOnly,
          limit: 50,
          page: 1,
        }),
        mailApi.counts(),
        mailApi.storage(),
        mailApi.listLabels(),
      ]);
      setItems(list.items || []);
      setTotal(list.total ?? 0);
      setCounts(c);
      setStorage(st);
      setLabels(lab || []);
    } catch (e) {
      setError(e?.message || t("emailPage.loadError"));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [folder, starredOnly, t, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  /** Ouverture depuis une notification (?stateId=…) */
  useEffect(() => {
    if (!stateIdFromUrl) return;
    let cancelled = false;
    (async () => {
      try {
        const full = await mailApi.getMessage(stateIdFromUrl);
        if (cancelled) return;
        setFolder("inbox");
        setStarredOnly(false);
        setSelectedEmail(full);
        setShowDetails(true);
        if (!full.readAt) {
          try {
            await mailApi.markRead(stateIdFromUrl, true);
          } catch {
            /* ignore */
          }
        }
        const [listRes, c] = await Promise.all([
          mailApi.listMessages({ folder: "inbox", starred: false, limit: 50, page: 1 }),
          mailApi.counts(),
        ]);
        if (cancelled) return;
        setItems(listRes.items || []);
        setTotal(listRes.total ?? 0);
        setCounts(c);
        setSearchParams(
          (prev) => {
            const p = new URLSearchParams(prev);
            p.delete("stateId");
            return p;
          },
          { replace: true },
        );
      } catch {
        setSearchParams(
          (prev) => {
            const p = new URLSearchParams(prev);
            p.delete("stateId");
            return p;
          },
          { replace: true },
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [stateIdFromUrl, setSearchParams]);

  const handleEmailClick = async (row) => {
    if (folder === "drafts" && row.isDraft && row.messageId) {
      navigate(`/email/email-compose/${row.messageId}`);
      return;
    }
    setShowDetails(true);
    try {
      const full = await mailApi.getMessage(row.stateId);
      setSelectedEmail(full);
    } catch {
      setSelectedEmail(row);
    }
    if (row?.stateId && !row.readAt) {
      try {
        await mailApi.markRead(row.stateId, true);
        setItems((prev) =>
          prev.map((x) =>
            x.stateId === row.stateId ? { ...x, readAt: new Date().toISOString() } : x,
          ),
        );
        const c = await mailApi.counts();
        setCounts(c);
      } catch {
        /* ignore */
      }
    }
  };

  const closeEmailDetails = () => {
    setShowDetails(false);
  };

  const setFolderNav = (f, starred = false) => {
    setStarredOnly(starred);
    if (!starred) setFolder(f);
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm(t("emailPage.emptyTrashConfirm"))) return;
    setError("");
    try {
      await mailApi.emptyTrash();
      await load();
    } catch (e) {
      setError(e?.message || t("emailPage.loadError"));
    }
  };

  const storageLine = storage
    ? t("emailPage.storageLine", {
        used: formatBytes(storage.usedBytes),
        pct: String(storage.percent ?? 0),
        quota: formatBytes(storage.quotaBytes),
      })
    : "";

  return (
    <>
      <Row>
        <Tab.Container activeKey={starredOnly ? "mail-starred" : `mail-${folder}`}>
          <Col lg={3}>
            <Card>
              <Card.Body>
                <div className="iq-email-list">
                  <Link
                    to="/email/email-compose"
                    className="btn btn-primary-subtle btn-lg btn-block mb-3 font-size-16 p-3 w-100 d-inline-block text-center"
                  >
                    <i className="ri-send-plane-line me-2"></i>
                    {t("emailPage.newMessage")}
                  </Link>
                  <Nav variant="pills" className="iq-email-ui flex-column" role="tablist">
                    <Nav.Link
                      as="button"
                      type="button"
                      className={`text-start border-0 bg-transparent w-100 ${!starredOnly && folder === "inbox" ? "active" : ""}`}
                      onClick={() => setFolderNav("inbox", false)}
                    >
                      <i className="ri-mail-line"></i> {t("emailPage.inbox")}
                      {counts.inboxUnread > 0 && (
                        <span className="badge bg-primary ms-2">{counts.inboxUnread}</span>
                      )}
                    </Nav.Link>
                    <Nav.Link
                      as="button"
                      type="button"
                      className={`text-start border-0 bg-transparent w-100 ${starredOnly ? "active" : ""}`}
                      onClick={() => setFolderNav("inbox", true)}
                    >
                      <i className="ri-star-line"></i> {t("emailPage.starred")}
                    </Nav.Link>
                    <Nav.Link
                      as="button"
                      type="button"
                      className={`text-start border-0 bg-transparent w-100 ${!starredOnly && folder === "snoozed" ? "active" : ""}`}
                      onClick={() => setFolderNav("snoozed", false)}
                    >
                      <i className="ri-time-line"></i> {t("emailPage.snoozed")}
                    </Nav.Link>
                    <Nav.Link
                      as="button"
                      type="button"
                      className={`text-start border-0 bg-transparent w-100 ${!starredOnly && folder === "drafts" ? "active" : ""}`}
                      onClick={() => setFolderNav("drafts", false)}
                    >
                      <i className="ri-file-list-2-line"></i> {t("emailPage.drafts")}
                      {counts.drafts > 0 && (
                        <span className="badge bg-secondary ms-2">{counts.drafts}</span>
                      )}
                    </Nav.Link>
                    <Nav.Link
                      as="button"
                      type="button"
                      className={`text-start border-0 bg-transparent w-100 ${!starredOnly && folder === "sent" ? "active" : ""}`}
                      onClick={() => setFolderNav("sent", false)}
                    >
                      <i className="ri-mail-send-line"></i> {t("emailPage.sent")}
                    </Nav.Link>
                    <Nav.Link
                      as="button"
                      type="button"
                      className={`text-start border-0 bg-transparent w-100 ${!starredOnly && folder === "trash" ? "active" : ""}`}
                      onClick={() => setFolderNav("trash", false)}
                    >
                      <i className="ri-delete-bin-line"></i> {t("emailPage.trash")}
                      {counts.trash > 0 && (
                        <span className="badge bg-secondary ms-2">{counts.trash}</span>
                      )}
                    </Nav.Link>
                    <Nav.Link
                      as="button"
                      type="button"
                      className={`text-start border-0 bg-transparent w-100 ${!starredOnly && folder === "important" ? "active" : ""}`}
                      onClick={() => setFolderNav("important", false)}
                    >
                      <i className="ri-bookmark-line"></i> {t("emailPage.important")}
                    </Nav.Link>
                    <Nav.Link
                      as="button"
                      type="button"
                      className={`text-start border-0 bg-transparent w-100 ${!starredOnly && folder === "spam" ? "active" : ""}`}
                      onClick={() => setFolderNav("spam", false)}
                    >
                      <i className="ri-spam-line"></i> {t("emailPage.spam")}
                    </Nav.Link>
                  </Nav>
                  <h6 className="mt-4 mb-3">{t("emailPage.labels")}</h6>
                  <ul className="iq-email-ui iq-email-label list-unstyled">
                    {(labels || []).map((lb) => (
                      <li key={lb._id}>
                        <span className="me-1" style={{ color: lb.color || "#6c757d" }}>
                          ●
                        </span>
                        {lb.name}
                      </li>
                    ))}
                    <li>
                      <span className="text-muted small">{t("emailPage.addLabel")} — API</span>
                    </li>
                  </ul>
                  <div className="iq-progress-bar-linear d-inline-block w-100">
                    <h6 className="mt-4 mb-3">{t("emailPage.storage")}</h6>
                    {storage && (
                      <>
                        <div className="progress" style={{ height: "6px" }}>
                          <div
                            className="progress-bar bg-danger"
                            style={{ width: `${Math.min(100, storage.percent || 0)}%` }}
                          />
                        </div>
                        <span className="mt-1 d-inline-block w-100 small">{storageLine}</span>
                      </>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={9} className="mail-box-detail">
            <Card>
              <Card.Body className="p-0">
                <div className="iq-email-to-list p-3">
                  <div className="iq-email-to-list-detail d-flex justify-content-between gap-3">
                    <ul className="list-inline d-flex align-items-center m-0 p-0 flex-shrink-0">
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id="reload-mail">{t("emailPage.reload")}</Tooltip>}
                      >
                        <li className="me-2">
                          <button
                            type="button"
                            className="btn btn-link p-0 border-0 text-body"
                            onClick={() => load()}
                            aria-label={t("emailPage.reload")}
                          >
                            <i className="ri-refresh-line"></i>
                          </button>
                        </li>
                      </OverlayTrigger>
                      {!starredOnly && folder === "trash" && counts.trash > 0 && (
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id="empty-trash">{t("emailPage.emptyTrash")}</Tooltip>}
                        >
                          <li className="me-2">
                            <button
                              type="button"
                              className="btn btn-link p-0 border-0 text-danger"
                              onClick={handleEmptyTrash}
                              aria-label={t("emailPage.emptyTrash")}
                            >
                              <i className="ri-delete-bin-2-line"></i>
                            </button>
                          </li>
                        </OverlayTrigger>
                      )}
                    </ul>
                    <span className="small text-muted">
                      {total} {total === 1 ? "message" : "messages"}
                    </span>
                  </div>
                </div>
                <div className="iq-email-listbox">
                  <Tab.Content>
                    <Tab.Pane active className="show" eventKey="mail-inbox">
                      {error && <div className="p-3 text-danger">{error}</div>}
                      {loading && !items.length && (
                        <div className="p-4 text-center text-muted">{t("emailPage.loading")}</div>
                      )}
                      {!loading && !error && !items.length && (
                        <div className="p-4 text-center text-muted">{t("emailPage.noMessages")}</div>
                      )}
                      <ul className="iq-email-sender-list iq-height">
                        {items.map((row) => (
                          <li
                            key={row.stateId}
                            className={!row.readAt && !row.isOutgoing ? "iq-unread" : ""}
                          >
                            <div
                              className="d-flex align-self-center iq-unread-inner"
                              onClick={() => handleEmailClick(row)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleEmailClick(row);
                              }}
                            >
                              <div className="iq-email-sender-info">
                                <span
                                  className={`ri-star-line iq-star-toggle ${row.starred ? "text-warning" : ""}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    mailApi.star(row.stateId, !row.starred).then(() => load());
                                  }}
                                  role="button"
                                  aria-label="star"
                                />
                                <span className="iq-email-title ms-2">{row.listTitle || row.senderDisplay}</span>
                              </div>
                              <div className="iq-email-content">
                                <span className="iq-email-subject">
                                  {row.subject || "(no subject)"}{" "}
                                  <span className="text-muted">{row.preview}</span>
                                </span>
                                <div className="iq-email-date">{formatDate(row.createdAt)}</div>
                              </div>
                              <InboxEmailIcon handleEmailClick={() => handleEmailClick(row)} />
                            </div>
                          </li>
                        ))}
                      </ul>
                      {selectedEmail && (
                        <EmailDetails
                          closeEmailDetails={closeEmailDetails}
                          showDetails={showDetails}
                          actives
                          subject={selectedEmail.subject}
                          body={selectedEmail.body}
                          fromLabel={selectedEmail.listTitle || selectedEmail.senderDisplay}
                          dateLabel={formatDate(selectedEmail.createdAt)}
                          stateId={selectedEmail.stateId}
                          messageId={selectedEmail.messageId}
                          folder={selectedEmail.folder}
                          isOutgoing={!!selectedEmail.isOutgoing}
                          isDraft={!!selectedEmail.isDraft}
                          onAfterAction={() => {
                            load();
                            setShowDetails(false);
                            setSelectedEmail(null);
                          }}
                        />
                      )}
                    </Tab.Pane>
                  </Tab.Content>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Tab.Container>
      </Row>
    </>
  );
};

export default Inbox;

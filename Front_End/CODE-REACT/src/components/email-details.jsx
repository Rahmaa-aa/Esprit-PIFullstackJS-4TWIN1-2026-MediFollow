import React, { useCallback, useState } from "react";
import Card from "./Card";
import { Alert, Dropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { mailApi } from "../services/api";

import user05 from "/assets/images/user/05.jpg";

const EmailDetails = (props) => {
  const { t } = useTranslation();
  const {
    showDetails,
    closeEmailDetails,
    actives,
    subject,
    body,
    fromLabel,
    dateLabel,
    stateId,
    folder,
    isOutgoing,
    isDraft,
    messageId,
    onAfterAction,
  } = props;

  const [actionError, setActionError] = useState("");

  const run = useCallback(
    async (fn) => {
      if (!stateId) return;
      setActionError("");
      try {
        await fn();
        onAfterAction?.();
      } catch (e) {
        setActionError(e?.message || t("emailPage.actionError"));
      }
    },
    [stateId, onAfterAction, t],
  );

  const restoreAfterImportant = isOutgoing ? "sent" : "inbox";
  const restoreAfterSpam = isOutgoing ? "sent" : "inbox";

  const closeEmail = (e) => {
    e?.preventDefault?.();
    closeEmailDetails();
  };

  return (
    <>
      <div className={`email-app-details ${showDetails && actives && "show"}`}>
        <Card>
          <Card.Body className="p-0">
            <div>
              <div className="iq-email-to-list p-3">
                <div className="d-flex justify-content-between flex-wrap gap-2">
                  <ul className="list-inline d-flex align-items-center justify-content-between m-0 p-0 flex-wrap">
                    <li className="me-3">
                      <Link to="#" className="email-remove" onClick={closeEmail}>
                        <h4 className="m-0">
                          <i className="ri-arrow-left-line"></i>
                        </h4>
                      </Link>
                    </li>
                    {isDraft && messageId && (
                      <li className="me-2">
                        <Link
                          to={`/email/email-compose/${messageId}`}
                          className="text-primary small text-decoration-none"
                        >
                          <i className="ri-edit-2-line me-1"></i>
                          {t("emailPage.editDraft")}
                        </Link>
                      </li>
                    )}
                    {stateId && (
                      <>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id="mail-del">{t("emailPage.delete")}</Tooltip>}
                        >
                          <li className="me-2">
                            <Link
                              to="#"
                              onClick={(e) => {
                                e.preventDefault();
                                run(() => mailApi.deleteMessage(stateId));
                              }}
                            >
                              <i className="ri-delete-bin-line"></i>
                            </Link>
                          </li>
                        </OverlayTrigger>
                        {!isDraft && (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="mail-unread">{t("emailPage.markUnread")}</Tooltip>
                            }
                          >
                            <li className="me-2">
                              <Link
                                to="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  run(() => mailApi.markRead(stateId, false));
                                }}
                              >
                                <i className="ri-mail-unread-line"></i>
                              </Link>
                            </li>
                          </OverlayTrigger>
                        )}
                        {!isDraft && folder === "spam" && (
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="not-spam">{t("emailPage.notSpam")}</Tooltip>}
                          >
                            <li className="me-2">
                              <Link
                                to="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  run(() =>
                                    mailApi.move(stateId, restoreAfterSpam),
                                  );
                                }}
                              >
                                <i className="ri-inbox-line"></i>
                              </Link>
                            </li>
                          </OverlayTrigger>
                        )}
                        {!isDraft && folder !== "spam" && (
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="spam">{t("emailPage.reportSpam")}</Tooltip>}
                          >
                            <li className="me-2">
                              <Link
                                to="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  run(() => mailApi.move(stateId, "spam"));
                                }}
                              >
                                <i className="ri-spam-line"></i>
                              </Link>
                            </li>
                          </OverlayTrigger>
                        )}
                        {!isDraft &&
                          folder !== "trash" &&
                          folder === "important" && (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="unimp">{t("emailPage.removeImportant")}</Tooltip>
                            }
                          >
                            <li className="me-2">
                              <Link
                                to="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  run(() =>
                                    mailApi.move(stateId, restoreAfterImportant),
                                  );
                                }}
                              >
                                <i className="ri-bookmark-3-line"></i>
                              </Link>
                            </li>
                          </OverlayTrigger>
                        )}
                        {!isDraft &&
                          folder !== "trash" &&
                          folder !== "spam" &&
                          folder !== "important" && (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="imp">{t("emailPage.moveToImportant")}</Tooltip>
                            }
                          >
                            <li className="me-2">
                              <Link
                                to="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  run(() => mailApi.move(stateId, "important"));
                                }}
                              >
                                <i className="ri-bookmark-line"></i>
                              </Link>
                            </li>
                          </OverlayTrigger>
                        )}
                      </>
                    )}
                  </ul>
                </div>
                {actionError && (
                  <Alert variant="danger" className="mt-2 mb-0 py-2 small">
                    {actionError}
                  </Alert>
                )}
              </div>
              <hr className="mt-0" />
              <div className="iq-inbox-subject p-3">
                <h5 className="mb-2">{subject || "—"}</h5>
                <div className="iq-inbox-subject-info">
                  <div className="iq-subject-info">
                    <img
                      src={user05}
                      className="img-fluid rounded-circle avatar-80"
                      alt=""
                      loading="lazy"
                    />
                    <div className="iq-subject-status align-self-center">
                      <h6 className="mb-0">{fromLabel || "—"}</h6>
                      <Dropdown>
                        <Dropdown.Toggle
                          as="a"
                          className="dropdown-toggle"
                          href="#"
                          id="dropdownMenuButton"
                        >
                          {t("emailPage.details")}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <table className="iq-inbox-details">
                            <tbody>
                              <tr>
                                <td>{t("emailPage.from")}:</td>
                                <td>{fromLabel || "—"}</td>
                              </tr>
                              <tr>
                                <td>{t("emailPage.date")}:</td>
                                <td>{dateLabel || "—"}</td>
                              </tr>
                              <tr>
                                <td>{t("emailPage.folderLabel")}:</td>
                                <td>{folder || "—"}</td>
                              </tr>
                            </tbody>
                          </table>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                    <span className="align-self-center">{dateLabel || "—"}</span>
                  </div>
                  <div className="iq-inbox-body mt-5">
                    {body ? (
                      <div className="text-break" style={{ whiteSpace: "pre-wrap" }}>
                        {body}
                      </div>
                    ) : (
                      <p className="text-muted">{t("emailPage.noBody")}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

export default EmailDetails;

import React, { useCallback, useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { notificationApi } from "../services/api";
import {
  formatNotifTime,
  staffNotifMeta,
  staffDefaultTitle,
  isVirtualId,
} from "../utils/notificationMeta";
import { translateNotificationDisplay } from "../utils/translateNotification";

/**
 * Liste déroulante « All Notifications » (style template) pour médecin / infirmier — alertes risque patient.
 */
export default function StaffNotificationsBell({
  role,
  className = "",
  toggleClassName = "nav-link d-none d-xl-block position-relative",
}) {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState({ items: [], unread: 0 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await notificationApi.getMine();
      setData({
        items: Array.isArray(res.items) ? res.items : [],
        unread: typeof res.unread === "number" ? res.unread : 0,
      });
    } catch (e) {
      setErr(e.message || t("notifications.errorGeneric"));
      setData({ items: [], unread: 0 });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
    const t = setInterval(load, 25_000);
    const onFocus = () => load();
    const onNotif = () => load();
    window.addEventListener("focus", onFocus);
    window.addEventListener("medifollow-notifications-refresh", onNotif);
    return () => {
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("medifollow-notifications-refresh", onNotif);
    };
  }, [load]);

  const onMarkRead = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (isVirtualId(id)) return;
    try {
      await notificationApi.markRead(id);
      await load();
    } catch {
      /* ignore */
    }
  };

  const onMarkAll = async (e) => {
    e.preventDefault();
    try {
      await notificationApi.markAllRead();
      await load();
    } catch {
      /* ignore */
    }
  };

  const items = data.items;
  const unread = data.unread;

  return (
    <Dropdown
      as="li"
      className={`nav-item ${className}`}
      onToggle={(open) => {
        if (open) load();
      }}
    >
      <Dropdown.Toggle as="a" bsPrefix=" " to="#" className={`${toggleClassName} position-relative`}>
        <i className="ri-notification-4-line" />
        {unread > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{ fontSize: "0.65rem", padding: "0.2em 0.45em" }}
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </Dropdown.Toggle>
      <Dropdown.Menu
        drop="start"
        as="div"
        className="p-0 sub-drop dropdown-menu-end notif-dropdown-panel"
        style={{ minWidth: 300, maxWidth: "min(100vw - 1.5rem, 360px)", width: "min(100vw - 1.5rem, 360px)", overflow: "hidden" }}
      >
        <div className="m-0 card border-0 shadow-sm" style={{ overflow: "hidden", maxWidth: "100%" }}>
          <div className="py-3 px-3 d-flex justify-content-between align-items-center gap-2 bg-primary mb-0 rounded-top-3 flex-wrap">
            <h5 className="mb-0 text-white fw-bold d-flex align-items-center gap-2 flex-wrap flex-grow-1 min-w-0">
              {t("notifications.allNotifications")}
              <span className="badge bg-light text-dark rounded-2 px-2 py-1 small">{unread}</span>
            </h5>
            {unread > 0 && (
              <button type="button" className="btn btn-sm btn-link text-white text-decoration-none p-0 small flex-shrink-0" onClick={onMarkAll}>
                {t("notifications.markAllReadShort")}
              </button>
            )}
          </div>
          <div className="p-0 card-body notif-dropdown-body">
            {loading && items.length === 0 && (
              <div className="text-center text-muted small py-4">{t("notifications.loading")}</div>
            )}
            {err && !loading && (
              <div className="text-danger small px-3 py-2">{err}</div>
            )}
            {!loading && items.length === 0 && !err && (
              <div className="text-muted small text-center py-4 px-3">
                {t("notifications.emptyDropdownStaff")}
              </div>
            )}
            {items.map((n) => {
              const disp = translateNotificationDisplay(n, t, i18n);
              const id = n._id || n.id;
              const { href, icon, iconWrapClass } = staffNotifMeta(n, role);
              const isRead = n.read === true;
              const virt = isVirtualId(id);
              const time = formatNotifTime(n.createdAt, t, i18n.language);
              return (
                <Link
                  key={String(id)}
                  to={href}
                  className={`iq-sub-card d-block w-100 text-decoration-none border-bottom ${!isRead ? "bg-primary-subtle bg-opacity-10" : ""}`}
                  style={{ maxWidth: "100%", boxSizing: "border-box" }}
                  onClick={() => {
                    if (!isRead && id && !virt) notificationApi.markRead(id).then(load).catch(() => {});
                  }}
                >
                  <div className="d-flex align-items-start gap-2 px-3 py-3">
                    <div
                      className={`flex-shrink-0 d-flex align-items-center justify-content-center ${iconWrapClass}`}
                      style={{ width: 48, height: 48 }}
                    >
                      <i className={`${icon} fs-5`} aria-hidden />
                    </div>
                    <div className="flex-grow-1 text-start min-w-0" style={{ minWidth: 0 }}>
                      <div className="d-flex align-items-start justify-content-between gap-2">
                        <h6 className="mb-0 text-dark fw-semibold text-break flex-grow-1">{disp.title || staffDefaultTitle(n, t)}</h6>
                        {time ? (
                          <small className="flex-shrink-0 text-muted text-nowrap" style={{ fontSize: "0.7rem" }}>
                            {time}
                          </small>
                        ) : null}
                      </div>
                      <p
                        className="mb-0 small text-muted text-break mt-1"
                        style={{ lineHeight: 1.35, wordBreak: "break-word", overflowWrap: "anywhere" }}
                      >
                        {disp.body}
                      </p>
                      {!isRead && !virt && (
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0 mt-1 small text-primary text-start"
                          onClick={(e) => onMarkRead(e, id)}
                        >
                          {t("notifications.markReadLink")}
                        </button>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="border-top py-2 px-3 text-center bg-light rounded-bottom-3">
            <Link to="/notifications" className="btn btn-sm btn-primary text-white w-100">
              {t("notifications.seeAll")}
            </Link>
          </div>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
}

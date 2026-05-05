import React from "react";
import { Alert } from "react-bootstrap";
import { useTranslation } from "react-i18next";

export default function EditPlatformStaffValidationAlert({ keys }) {
  const { t } = useTranslation();
  if (!keys?.length) return null;
  return (
    <Alert
      variant="warning"
      className="mb-3 border-0 shadow-sm"
      style={{ borderLeft: "4px solid #f0ad4e", background: "#fffbf0" }}
    >
      <div className="d-flex align-items-start gap-2">
        <i className="ri-error-warning-line fs-5 text-warning flex-shrink-0" aria-hidden />
        <div className="flex-grow-1 min-w-0">
          <strong className="d-block mb-2 text-dark">{t("editPlatformStaffValidation.title")}</strong>
          <ul className="mb-0 ps-3 small text-dark">
            {keys.map((k) => (
              <li key={k}>{t(`editPlatformStaffValidation.${k}`)}</li>
            ))}
          </ul>
        </div>
      </div>
    </Alert>
  );
}

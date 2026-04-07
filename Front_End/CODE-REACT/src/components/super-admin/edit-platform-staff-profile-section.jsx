import React from "react";
import { Row, Col, Button } from "react-bootstrap";

export default function EditPlatformStaffProfileSection({
  inputId,
  profilePreview,
  onFileChange,
  title,
  hint,
  changeLabel,
}) {
  return (
    <Row className="g-3 mb-2">
      <Col xs={12}>
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <div className="position-relative">
            <img
              src={profilePreview}
              alt=""
              className="rounded-circle border"
              style={{ width: 100, height: 100, objectFit: "cover" }}
            />
            <label
              htmlFor={inputId}
              className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: 32, height: 32, cursor: "pointer" }}
            >
              <i className="ri-camera-line" style={{ fontSize: 16 }} />
              <input
                id={inputId}
                type="file"
                accept="image/*"
                className="d-none"
                onChange={onFileChange}
              />
            </label>
          </div>
          <div>
            <h6 className="mb-1">{title}</h6>
            <small className="text-muted d-block">{hint}</small>
            <Button
              type="button"
              variant="outline-secondary"
              size="sm"
              className="mt-2"
              onClick={() => document.getElementById(inputId)?.click()}
            >
              <i className="ri-image-edit-line me-1" />
              {changeLabel}
            </Button>
          </div>
        </div>
      </Col>
    </Row>
  );
}

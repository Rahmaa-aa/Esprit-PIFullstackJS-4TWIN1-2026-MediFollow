import React from "react";
import { Modal } from "react-bootstrap";

const ConfirmActionModal = ({
  show,
  title = "Confirmer l'action",
  message = "Voulez-vous continuer ?",
  onCancel,
  onConfirm,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  confirmVariant = "danger",
  loading = false,
  iconClass = "ri-alert-line",
}) => {
  return (
    <Modal show={show} onHide={onCancel} centered contentClassName="mf-confirm-modal">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          <span className="mf-confirm-icon-wrap">
            <i className={iconClass}></i>
          </span>
          <span>{title}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-0">{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </button>
        <button type="button" className={`btn btn-${confirmVariant}`} onClick={onConfirm} disabled={loading}>
          {loading ? "Suppression..." : confirmLabel}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmActionModal;

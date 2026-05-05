import React from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Card from "./Card";

/**
 * Carte d’accès à la messagerie clinique `/chat`.
 * @param {{ variant?: 'patient' | 'nurse' | 'doctor' }} props
 */
const SecureMessagingHubCard = ({ variant = "patient" }) => {
    const { t } = useTranslation();
    const v = variant === "nurse" || variant === "doctor" ? variant : "patient";
    const prefix = `secureMessaging.${v}`;
    const title = t(`${prefix}.title`);
    const lead = t(`${prefix}.lead`);
    const bullets = [t(`${prefix}.bullet1`), t(`${prefix}.bullet2`)];
    return (
        <Card className="border-0 shadow-sm border-start border-primary border-4">
            <Card.Body className="py-3">
                <div className="d-flex flex-column flex-md-row align-items-start justify-content-between gap-3">
                    <div>
                        <h6 className="text-primary fw-bold mb-2">
                            <i className="ri-chat-3-line me-2" aria-hidden />
                            {title}
                        </h6>
                        <p className="text-muted small mb-2 mb-md-3">{lead}</p>
                        <ul className="small text-muted mb-0 ps-3">
                            {bullets.map((line, i) => (
                                <li key={i}>{line}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex-shrink-0 align-self-stretch d-flex align-items-center">
                        <Button as={Link} to="/chat" variant="primary" className="text-nowrap">
                            <i className="ri-message-3-line me-2" aria-hidden />
                            {t("secureMessaging.openChat")}
                        </Button>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default SecureMessagingHubCard;

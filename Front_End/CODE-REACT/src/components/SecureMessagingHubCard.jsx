import React from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import Card from "./Card";

const COPY = {
    patient: {
        title: "Messagerie sécurisée — CHU Abdelhamid Ben Badis",
        lead: "Échangez avec votre équipe soignante (infirmier, médecin). En cas d’alerte sur vos constantes, l’équipe peut vous contacter ici pour vérification.",
        bullets: [
            "Les messages complètent le suivi clinique ; en urgence vitale, contactez les secours (15).",
            "Traçabilité des échanges pour votre dossier hospitalier.",
        ],
    },
    nurse: {
        title: "Messagerie — Premier intervenant",
        lead: "Canal prévu pour la vérification rapide après signalement (historique, contact patient, triage). Cohérent avec le flux « alerte numérique → action » au CHU.",
        bullets: [
            "Vérifier tendance vs pic isolé, contacter le patient, noter la synthèse pour le médecin.",
            "Escalade vers le médecin si le risque est confirmé.",
        ],
    },
    doctor: {
        title: "Messagerie clinique — Décision & clôture",
        lead: "Instructions thérapeutiques, orientation consultation ou urgence, coordination avec l’infirmier. L’alerte ne se résout qu’après action humaine documentée (reconnaissance / note de clôture dans le parcours soins).",
        bullets: [
            "Instruction, demande de consultation ou orientation urgence selon le profil clinique.",
            "Traçabilité pour l’audit hospitalier (réponse dans les délais de sécurité).",
        ],
    },
};

/**
 * Carte d’accès à la messagerie clinique `/chat`.
 * @param {{ variant?: 'patient' | 'nurse' | 'doctor' }} props
 */
const SecureMessagingHubCard = ({ variant = "patient" }) => {
    const c = COPY[variant] || COPY.patient;
    return (
        <Card className="border-0 shadow-sm border-start border-primary border-4">
            <Card.Body className="py-3">
                <div className="d-flex flex-column flex-md-row align-items-start justify-content-between gap-3">
                    <div>
                        <h6 className="text-primary fw-bold mb-2">
                            <i className="ri-chat-3-line me-2" aria-hidden />
                            {c.title}
                        </h6>
                        <p className="text-muted small mb-2 mb-md-3">{c.lead}</p>
                        <ul className="small text-muted mb-0 ps-3">
                            {c.bullets.map((line, i) => (
                                <li key={i}>{line}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex-shrink-0 align-self-stretch d-flex align-items-center">
                        <Button as={Link} to="/chat" variant="primary" className="text-nowrap">
                            <i className="ri-message-3-line me-2" aria-hidden />
                            Ouvrir la messagerie
                        </Button>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default SecureMessagingHubCard;

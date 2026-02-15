import React from "react";
import { Col, Row } from "react-bootstrap";
import Card from "../../components/Card";
import "../../assets/vendor/ionicons/css/ionicons.css"

const Unicons = () => {
    const icons = [
        { name: "Archive", className: "ion-archive" },
        { name: "Reply", className: "ion-reply" },
        { name: "Reply All", className: "ion-reply-all" },
        { name: "Forward", className: "ion-forward" },
        { name: "Play", className: "ion-play" },
        { name: "Volume High", className: "ion-volume-high" },
        { name: "Pricetags", className: "ion-pricetags" },
        { name: "Pause", className: "ion-pause" },
        { name: "Briefcase", className: "ion-briefcase" },
        { name: "Medkit", className: "ion-medkit" },
        { name: "At", className: "ion-at" },
        { name: "Pound", className: "ion-pound" },
        { name: "Asterisk", className: "ion-asterisk" },
        { name: "Alert", className: "ion-alert" },
        { name: "Alert Circled", className: "ion-alert-circled" },
        { name: "Refresh", className: "ion-refresh" },
        { name: "Loop", className: "ion-loop" },
        { name: "Shuffle", className: "ion-shuffle" },
        { name: "Home", className: "ion-home" },
        { name: "Search", className: "ion-search" },
        { name: "Flag", className: "ion-flag" },
        { name: "Heart", className: "ion-heart" },
        { name: "Broken", className: "ion-heart-broken" },
        { name: "Gear", className: "ion-gear-a" },
        { name: "Gear bold", className: "ion-gear-b" },
        { name: "Toggle", className: "ion-toggle-filled" },
        { name: "Trash Fill", className: "ion-trash-b" },
        { name: "Hammer", className: "ion-hammer" },
        { name: "Wrench", className: "ion-wrench" },
        { name: "Information", className: "ion-information-circled" },
        { name: "Help", className: "ion-help-circled" },
        { name: "Plus", className: "ion-plus-circled" },
        { name: "Close", className: "ion-close-circled" },
        { name: "Email", className: "ion-email-unread" },
        { name: "Upload", className: "ion-upload" },
        { name: "Database", className: "ion-soup-can" },
        { name: "Thumbsup", className: "ion-thumbsup" },
        { name: "Thumbsdown", className: "ion-thumbsdown" },
        { name: "Pricetag", className: "ion-pricetag" },
        { name: "Bowtie", className: "ion-bowtie" },
    ];

    return (
        <>

            <Row>
                <Col sm={12}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <h4 className="card-title">Unicons Icon</h4>
                        </Card.Header>
                        <Card.Body>
                            <p className="d-flex gap-1 align-items-center mb-0">
                                Use Class
                                <code>&lt;i class=&quot;ion-archive&quot;&gt;&lt;/i&gt;</code>
                            </p>
                            <Row className="m-1">
                                {icons.map((icon, index) => (
                                    <Col sm={6} md={4} lg={2} key={index}>
                                        <a
                                            className="iq-icons-list d-flex my-4 align-items-center"
                                            href="#"
                                        >
                                            <i className={`${icon.className} me-4`}></i>
                                            {icon.name}
                                        </a>
                                    </Col>
                                ))}
                                <div className="text-center mt-3">
                                    <a
                                        href="https://www.unicon.net/"
                                        target="_blank"
                                        className="btn btn-primary-subtle"
                                    >
                                        View All Icon
                                    </a>
                                </div>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

        </>
    )
}

export default Unicons
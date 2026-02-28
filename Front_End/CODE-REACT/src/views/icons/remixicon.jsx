import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import "../../assets/vendor/remixicon/fonts/remixicon.glyph.json"
import Card from "../../components/Card";

const Remixicon = () => {
    const icons = [
        { className: "ri-4k-fill", label: "4k Fill" },
        { className: "ri-4k-line", label: "4k line" },
        { className: "ri-account-box-fill", label: "Account Fill" },
        { className: "ri-account-pin-box-line", label: "account-pin-box" },
        { className: "ri-award-line", label: "award-line" },
        { className: "ri-award-fill", label: "award-fill" },
        { className: "ri-bookmark-line", label: "bookmark-line" },
        { className: "ri-bookmark-fill", label: "bookmark-fill" },
        { className: "ri-calculator-line", label: "calculator-line" },
        { className: "ri-calculator-fill", label: "calculator-fill" },
        { className: "ri-calendar-line", label: "calendar-line" },
        { className: "ri-calendar-fill", label: "calendar-fill" },
        { className: "ri-reply-line", label: "reply-line" },
        { className: "ri-reply-fill", label: "reply-fill" },
        { className: "ri-send-plane-line", label: "send-plane-line" },
        { className: "ri-send-plane-fill", label: "send-plane-fill" },
        { className: "ri-computer-line", label: "computer-line" },
        { className: "ri-computer-fill", label: "computer-fill" },
        { className: "ri-cellphone-line", label: "cellphone-line" },
        { className: "ri-cellphone-fill", label: "cellphone-fill" },
        { className: "ri-phone-line", label: "phone-line" },
        { className: "ri-phone-fill", label: "phone-fill" },
        { className: "ri-tablet-line", label: "tablet-line" },
        { className: "ri-tablet-fill", label: "tablet-fill" },
        { className: "ri-device-line", label: "device-line" },
        { className: "ri-device-fill", label: "device-fill" },
        { className: "ri-battery-line", label: "battery-line" },
        { className: "ri-battery-fill", label: "battery-fill" },
        { className: "ri-battery-low-line", label: "battery-low-line" },
        { className: "ri-battery-low-fill", label: "battery-low-fill" },
        { className: "ri-file-line", label: "file-line" },
        { className: "ri-file-fill", label: "file-fill" },
        { className: "ri-book-open-line", label: "book-open-line" },
        { className: "ri-book-open-fill", label: "book-open-fill" },
        { className: "ri-lightbulb-line", label: "lightbulb-line" },
        { className: "ri-lightbulb-fill", label: "lightbulb-fill" },
        { className: "ri-map-pin-line", label: "map-pin-line" },
        { className: "ri-map-pin-fill", label: "map-pin-fill" },
        { className: "ri-drop-line", label: "drop-line" },
        { className: "ri-drop-fill", label: "drop-fill" },
    ];
    return (
        <>
            <Row>
                <div className="col-sm-12">
                    <Card>
                        <Card.Header className="d-flex justify-content-between  mb-0">
                            <Card.Header.Title className="header-title">
                                <h4 className="card-title">Remixicon Icon</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p className="d-flex gap-1 align-items-center mb-0">
                                Use Class <code>&lt;i class=&quot;ri-4k-fill&quot;&gt;&lt;/i&gt;</code>
                            </p>
                            <Row className="m-1">
                                {icons.map((icon, index) => (
                                    <Col sm={6} md={4} lg={2} key={index}>
                                        <a className="iq-icons-list d-flex my-4 align-items-center" href="#">
                                            <i className={icon.className + " me-4"}></i>
                                            {icon.label}
                                        </a>
                                    </Col>
                                ))}
                                <Col sm={12} className="text-center mt-3">
                                    <a href="https://remixicon.com/" target="_blank" rel="noopener noreferrer" className="btn btn-primary-subtle">
                                        View All Icon
                                    </a>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </div>
            </Row>
        </>
    )
}

export default Remixicon
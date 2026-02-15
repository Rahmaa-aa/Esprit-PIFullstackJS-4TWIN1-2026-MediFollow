import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import "../../assets/vendor/font-awesome/css/font-awesome.min.css"
import Card from "../../components/Card";

const FontawesomeFive = () => {
    const icons = [
        { className: "fa fa-address-book", name: "address-book" },
        { className: "fa fa-envelope-open", name: "envelope-open" },
        { className: "fa fa-id-card", name: "id-card" },
        { className: "fa fa-telegram", name: "telegram" },
        { className: "fa fa-user-circle", name: "user-circle" },
        { className: "fa fa-area-chart", name: "area-chart" },
        { className: "fa fa-asterisk", name: "asterisk" },
        { className: "fa fa-car", name: "car" },
        { className: "fa fa-bars", name: "bars" },
        { className: "fa fa-battery-full", name: "battery-full" },
        { className: "fa fa-bluetooth", name: "bluetooth" },
        { className: "fa fa-book", name: "book" },
        { className: "fa fa-bug", name: "bug" },
        { className: "fa fa-building", name: "building" },
        { className: "fa fa-calculator", name: "calculator" },
        { className: "fa fa-calendar", name: "calendar" },
        { className: "fa fa-camera", name: "camera" },
        { className: "fa fa-commenting", name: "commenting" },
        { className: "fa fa-crop", name: "crop" },
        { className: "fa fa-download", name: "download" },
        { className: "fa fa-folder", name: "folder" },
        { className: "fa fa-gift", name: "gift" },
        { className: "fa fa-users", name: "users" },
        { className: "fa fa-hashtag", name: "hashtag" },
        { className: "fa fa-home", name: "home" },
        { className: "fa fa-lock", name: "lock" },
        { className: "fa fa-graduation-cap", name: "graduation-cap" },
        { className: "fa fa-paper-plane", name: "paper-plane" },
        { className: "fa fa-star", name: "star" },
        { className: "fa fa-tag", name: "tag" },
        { className: "fa fa-trash", name: "trash" },
        { className: "fa fa-upload", name: "upload" },
        { className: "fa fa-university", name: "university" },
        { className: "fa fa-wifi", name: "wifi" },
        { className: "fa fa-thumbs-up", name: "thumbs-up" },
        { className: "fa fa-train", name: "train" },
        { className: "fa fa-file", name: "file" },
        { className: "fa fa-snapchat", name: "snapchat" },
        { className: "fa fa-twitter", name: "twitter" },
        { className: "fa fa-wordpress", name: "wordpress" },
    ];
    return (
        <>
            <Row>
                <div className="col-sm-12">
                    <Card>
                        <Card.Header className="d-flex justify-content-between  mb-0">
                            <Card.Header.Title>
                                <h4 className="card-title">Fontawesome Icon</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p className="d-flex gap-1 align-items-center mb-0">
                                Use Class
                                <code>&lt;i class=&quot;fa fa-address-book&quot;&gt;&lt;/i&gt;</code>
                            </p>

                            <Row className="m-1">
                                {icons.map((icon, index) => (
                                    <Col key={index} sm={6} md={4} lg={2}>
                                        <a className="iq-icons-list d-flex my-4 align-items-center" href="#">
                                            <i className={`${icon.className} me-4`} aria-hidden="true"></i>
                                            {icon.name}
                                        </a>
                                    </Col>
                                ))}
                                <div className="col-sm-12 text-center mt-3">
                                    <a className="btn btn-primary-subtle" href="https://fontawesome.com/v4.7.0/" target="_blank">
                                        View All Icon
                                    </a>
                                </div>
                            </Row>
                        </Card.Body>
                    </Card>
                </div>
            </Row>
        </>
    )
}

export default FontawesomeFive
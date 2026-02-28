import React from "react";
import { Col, Row } from "react-bootstrap";
import "../../assets/vendor/line-awesome/css/line-awesome.min.css"
import Card from "../../components/Card";

const Lineawesome = () => {
    const icons = [
        { className: "las la-bell", label: "bell" },
        { className: "las la-phone-volume", label: "phone" },
        { className: "las la-radiation", label: "radiation" },
        { className: "las la-dog", label: "dog" },
        { className: "las la-fish", label: "fish" },
        { className: "las la-spider", label: "la-spider" },
        { className: "las la-angle-down", label: "angle-down" },
        { className: "las la-angle-left", label: "angle-left" },
        { className: "las la-angle-right", label: "angle-right" },
        { className: "las la-angle-up", label: "angle-up" },
        { className: "las la-caret-left", label: "caret-left" },
        { className: "las la-caret-right", label: "caret-right" },
        { className: "las la-download", label: "download" },
        { className: "las la-location-arrow", label: "location-arrow" },
        { className: "las la-share", label: "share" },
        { className: "las la-backward", label: "backward" },
        { className: "las la-play", label: "play" },
        { className: "las la-pause", label: "pause" },
        { className: "las la-sync", label: "sync" },
        { className: "las la-volume-down", label: "volume-down" },
        { className: "las la-volume-mute", label: "volume-mute" },
        { className: "las la-volume-off", label: "volume-off" },
        { className: "las la-volume-up", label: "volume-up" },
        { className: "lab la-youtube", label: "youtube" },
        { className: "las la-car", label: "car" },
        { className: "las la-truck", label: "truck" },
        { className: "las la-tree", label: "tree" },
        { className: "lab la-pinterest-p", label: "pinterest" },
        { className: "lab la-java", label: "java" },
        { className: "las la-city", label: "city" },
        { className: "las la-edit", label: "edit" },
        { className: "las la-copy", label: "copy" },
        { className: "las la-cut", label: "cut" },
        { className: "las la-pen", label: "pen" },
        { className: "las la-tag", label: "tag" },
        { className: "las la-save", label: "save" },
        { className: "las la-tasks", label: "tasks" },
        { className: "las la-comment", label: "comment" },
        { className: "las la-video", label: "video" },
        { className: "las la-smile", label: "smile" },
    ];
    return (
        <>
            <Row>
                <div className="col-sm-12">
                    <Card>
                        <Card.Header className="d-flex justify-content-between  mb-0">
                            <div className="iq-header-title">
                                <h4 className="card-title">Line Awesome Icon</h4>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <p className="d-flex gap-1 align-items-center mb-0">
                                Use Class
                                <code>&lt;i class=&quot;las la-bell&quot;&gt;&lt;/i&gt;</code>
                            </p>
                            <Row className="m-1">
                                {icons.map((icon, index) => (
                                    <Col key={index} sm={6} md={4} lg={2}>
                                        <a className="iq-icons-list d-flex my-4 align-items-center" href="#">
                                            <i className={`${icon.className} me-4`}></i>
                                            {icon.label}
                                        </a>
                                    </Col>
                                ))}
                                <div className="col-sm-12 text-center mt-3">
                                    <a className="btn btn-primary-subtle" href="https://icons8.com/line-awesome" target="_blank">
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

export default Lineawesome
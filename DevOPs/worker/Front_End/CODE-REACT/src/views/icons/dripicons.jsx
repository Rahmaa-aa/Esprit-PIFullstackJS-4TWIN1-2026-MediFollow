import React from "react";
import { Col, Row } from "react-bootstrap";
import Card from "../../components/Card";
import "../../assets/vendor/dripicons/webfont/webfont.css"

const Dripicons = () => {
    const icons = [
        { icon: 'a', label: '4k Fill' },
        { icon: 'o', label: 'Up Arrow' },
        { icon: 'h', label: 'Down Arrow' },
        { icon: 'j', label: 'Left Arrow' },
        { icon: 'i', label: 'Right Arrow' },
        { icon: 'l', label: 'Left' },
        { icon: 'k', label: 'Down' },
        { icon: 'n', label: 'Up' },
        { icon: 'm', label: 'Right' },
        { icon: 'f', label: 'Anchor' },
        { icon: 'g', label: 'File' },
        { icon: 'p', label: 'Note' },
        { icon: 's', label: 'Dribbble' },
        { icon: 'K', label: 'Download' },
        { icon: 'G', label: 'Sun' },
        { icon: 'H', label: 'Half Light' },
        { icon: 'F', label: 'Light' },
        { icon: 'I', label: 'Voice' },
        { icon: 'x', label: 'Notification' },
        { icon: 'J', label: 'Page' },
        { icon: 't', label: 'Battery Empty' },
        { icon: 'u', label: 'Battery Full' },
        { icon: 'v', label: 'Battery One' },
        { icon: 'w', label: 'Battery Two' },
        { icon: 'Q', label: 'Cart' },
        { icon: 'P', label: 'Card' },
        { icon: 'O', label: 'Camera' },
        { icon: 'N', label: 'Video' },
        { icon: 'S', label: 'Check' },
        { icon: 'T', label: 'Angle Down' },
        { icon: 'U', label: 'Angle Left' },
        { icon: 'V', label: 'Angle Right' },
        { icon: 'W', label: 'Angle Up' },
        { icon: 'X', label: 'Up Arrow' },
        { icon: 'Y', label: 'Clock' },
        { icon: 'Z', label: 'Reload' },
        { icon: '0', label: 'Cloud' },
        { icon: '1', label: 'Cloud Download' },
        { icon: '2', label: 'Cloud Upload' },
        { icon: '5', label: 'Arrow' },
    ];

    return (
        <>
            <Row>
                <div className="col-sm-12">
                    <Card>
                        <Card.Header className="d-flex justify-content-between  mb-0">
                            <div className="header-title">
                                <h4 className="card-title">Dripicons Icon</h4>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <p className="d-flex gap-1 align-items-center mb-0">
                                Use Class
                                <code>&lt;div data-icon=&quot;a&quot; className=&quot;icon&quot;&gt;&lt;/div&gt;</code>
                            </p>
                            <Row className="m-1">
                                {icons.map((iconData, index) => (
                                    <Col key={index} sm={6} md={4} lg={3} xl={2}>
                                        <a className="iq-icons-list d-flex my-4" href="#">
                                            <div data-icon={iconData.icon} className="icon"></div>
                                            <span className="ms-4">{iconData.label}</span>
                                        </a>
                                    </Col>
                                ))}
                                <div className="col-sm-12 text-center mt-3">
                                    <a className="btn btn-primary-subtle" href="http://demo.amitjakhu.com/dripicons/" target="_blank">
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

export default Dripicons
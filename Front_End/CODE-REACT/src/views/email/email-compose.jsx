import React from "react";
import { Col, Row } from "react-bootstrap";
import Card from "../../components/Card";
import { Link } from "react-router-dom";

const EmailCompose = () => {
    return (
        <>
            <Row className="row-eq-height">
                <Col md={12}>
                    <Row>
                        <Col md={12}>
                            <Card>
                                <Card.Body>
                                    <Row>
                                        <Col md={12} className="mb-3">
                                            <h5 className="text-primary card-title"><i className="ri-pencil-fill"></i> Compose Message
                                            </h5>
                                        </Col>
                                    </Row>
                                    <form className="email-form">
                                        <Row className="form-group">
                                            <Col sm={2}>
                                                <label htmlFor="inputEmail3" className="col-form-label">To:</label>
                                            </Col>
                                            <Col sm={10} className="mb-3">
                                                <select id="inputEmail3" className="form-control">
                                                    <option value="Petey Cruiser">Petey Cruiser</option>
                                                    <option value="Bob Frapples">Bob Frapples</option>
                                                    <option value="Barb Ackue">Barb Ackue</option>
                                                    <option value="Greta Life">Greta Life</option>
                                                </select>
                                            </Col>
                                        </Row>
                                        <Row className="form-group">
                                            <Col sm={2}>
                                                <label htmlFor="cc" className="col-form-label">Cc:</label>
                                            </Col>
                                            <Col sm={10} className="mb-3">
                                                <select id="cc" className="form-control">
                                                    <option value="Brock Lee">Brock Lee</option>
                                                    <option value="Rick O'Shea">Rick O&apos;Shea</option>
                                                    <option value="Cliff Hanger">Cliff Hanger</option>
                                                    <option value="Barb Dwyer">Barb Dwyer</option>
                                                </select>
                                            </Col>
                                        </Row>
                                        <Row className="form-group">
                                            <Col sm={2}>
                                                <label htmlFor="subject" className="col-form-label">Subject:</label>
                                            </Col>
                                            <Col sm={10} className="mb-3">
                                                <input type="text" id="subject" className="form-control" />
                                            </Col>
                                        </Row>
                                        <Row className="form-group">
                                            <Col sm={2}>
                                                <label htmlFor="subject" className="col-form-label">Your Message:</label>
                                            </Col>
                                            <Col sm={10} className="mb-3">
                                                <div className="form-floating">
                                                    <textarea className="form-control" placeholder="Leave a comment here"
                                                        id="floatingTextarea2" style={{ height: "100px" }}></textarea>
                                                    <label className="iq-active" htmlFor="floatingTextarea2">Comments</label>
                                                </div>
                                            </Col>
                                        </Row>
                                        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                                            <div className="d-flex flex-grow-1 align-items-center gap-2">
                                                <div className="send-btn">
                                                    <button type="submit" className="btn btn-primary-subtle">Send</button>
                                                </div>
                                                <div className="send-panel d-flex align-items-center flex-wrap gap-2">
                                                    <label className="mb-0 bg-primary-subtle " htmlFor="file"> <input
                                                        type="file" id="file" style={{ display: "none" }} /> <a><i
                                                            className="ri-attachment-line"></i> </a> </label>
                                                    <label className="mb-0 bg-primary-subtle "> <Link
                                                        to="#">
                                                        <i className="ri-map-pin-user-line text-primary"></i></Link> </label>
                                                    <label className="mb-0 bg-primary-subtle "> <Link
                                                        to="#">
                                                        <i className="ri-drive-line text-primary"></i></Link> </label>
                                                    <label className="mb-0 bg-primary-subtle "> <Link
                                                        to="#">
                                                        <i className="ri-camera-line text-primary"></i></Link> </label>
                                                    <label className="mb-0 bg-primary-subtle "> <Link
                                                        to="#">
                                                        <i className="ri-user-smile-line text-primary"></i></Link> </label>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <div className="send-panel float-end">
                                                    <label className="mb-0 bg-primary-subtle "><Link
                                                        to="#"><i
                                                            className="ri-settings-2-line text-primary"></i></Link></label>{" "}
                                                    <label className="ms-2 mb-0 bg-primary-subtle "><Link
                                                        to="#"> <i
                                                            className="ri-delete-bin-line text-primary"></i></Link> </label>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </>
    )
}

export default EmailCompose
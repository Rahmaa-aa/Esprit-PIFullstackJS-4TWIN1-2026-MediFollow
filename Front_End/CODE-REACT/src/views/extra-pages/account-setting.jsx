import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import Card from "../../components/Card";


const AccountSetting = () => {
    return (
        <>
            <h1>Account Setting Page</h1>
            <Row>
                <Col lg={6} >
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <Card.Header.Title>
                                <h4 className="card-title">Account Setting</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <div className="acc-edit">
                                <Form>
                                    <Form.Group>
                                        <Form.Label htmlFor="uname">User Name:</Form.Label>
                                        <Form.Control type="text" id="uname" value="Barry@01" />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label htmlFor="email">Email Id:</Form.Label>
                                        <Form.Control type="email" id="email" value="Barryjohn@gmail.com" />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label htmlFor="altemail">Alternate Email:</Form.Label>
                                        <Form.Control type="email" className="form-control" id="altemail" value="designtheme@gmail.com" />
                                    </Form.Group>
                                    <Form.Group className="form-group">
                                        <Form.Label className="d-block">Language Known:</Form.Label>
                                        <div className="custom-control custom-checkbox custom-control-inline">
                                            <input type="checkbox" className="custom-control-input" id="english" defaultChecked />{" "}
                                            <Form.Check.Label className="custom-control-label" htmlFor="english">English</Form.Check.Label>
                                        </div>
                                        <div className="custom-control custom-checkbox custom-control-inline">
                                            <input type="checkbox" className="custom-control-input" id="french" defaultChecked />{" "}
                                            <Form.Check.Label className="custom-control-label" htmlFor="french">French</Form.Check.Label>
                                        </div>
                                        <div className="custom-control custom-checkbox custom-control-inline">
                                            <input type="checkbox" className="custom-control-input" id="hindi" />{" "}
                                            <Form.Check.Label className="custom-control-label" htmlFor="hindi">Hindi</Form.Check.Label>
                                        </div>
                                        <div className="custom-control custom-checkbox custom-control-inline">
                                            <input type="checkbox" className="custom-control-input" id="spanish" defaultChecked />{" "}
                                            <Form.Check.Label className="custom-control-label" htmlFor="spanish">Spanish</Form.Check.Label>
                                        </div>
                                        <div className="custom-control custom-checkbox custom-control-inline">
                                            <input type="checkbox" className="custom-control-input" id="arabic" />{" "}
                                            <Form.Check.Label className="custom-control-label" htmlFor="arabic">Arabic</Form.Check.Label>
                                        </div>
                                        <div className="custom-control custom-checkbox custom-control-inline">
                                            <input type="checkbox" className="custom-control-input" id="italian" />{" "}
                                            <Form.Check.Label className="custom-control-label" htmlFor="italian">Italian</Form.Check.Label>
                                        </div>
                                    </Form.Group>
                                    <button type="submit" className="btn btn-primary">Submit</button>{" "}
                                    <button type="reset" className="btn btn-danger-subtle">Cancel</button>
                                </Form>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={6}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <Card.Header.Title>
                                <h4 className="card-title">Social Media</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <div className="acc-edit">
                                <Form>
                                    <Form.Group className="form-group">
                                        <Form.Label htmlFor="facebook">Facebook:</Form.Label>
                                        <Form.Control type="text" id="facebook" value="www.facebook.com" />
                                    </Form.Group>
                                    <Form.Group className="form-group">
                                        <Form.Label htmlFor="twitter">Twitter:</Form.Label>
                                        <Form.Control type="text" id="twitter" value="www.twitter.com" />
                                    </Form.Group>
                                    <Form.Group className="form-group">
                                        <Form.Label htmlFor="google">Google +:</Form.Label>
                                        <Form.Control type="text" id="google" value="www.google.com" />
                                    </Form.Group>
                                    <Form.Group className="form-group">
                                        <Form.Label htmlFor="instagram">Instagram:</Form.Label>
                                        <Form.Control type="text" id="instagram" value="www.instagram.com" />
                                    </Form.Group>
                                    <Form.Group className="form-group">
                                        <Form.Label htmlFor="youtube">You Tube:</Form.Label>
                                        <Form.Control type="text" id="youtube" value="www.youtube.com" />
                                    </Form.Group>
                                    <button type="submit" className="btn btn-primary">Submit</button>{" "}
                                    <button type="reset" className="btn btn-danger-subtle">Cancel</button>
                                </Form>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default AccountSetting
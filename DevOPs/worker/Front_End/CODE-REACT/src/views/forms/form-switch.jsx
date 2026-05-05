import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import Card from "../../components/Card";


const FormSwitch = () => {
    return (
        <>
            <Row>
                <Col>
                    <Card>
                        <Card.Header className=" d-flex justify-content-between">
                            <Card.Header.Title>
                                <h4 className="card-title">State</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body className="pt-2">
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                Morbi vulputate, ex ac venenatis mollis,
                                diam nibh
                                finibus leo</p>
                            <div className="d-flex flex-wrap gap-4">
                                <Form.Group className="form-check form-group form-switch">
                                    <Form.Check.Input type="checkbox" role="switch" id="flexSwitchCheckDefault" />
                                    <Form.Check.Label className="form-check-label" htmlFor="flexSwitchCheckDefault">false /
                                        Inactive</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="form-check form-switch form-group">
                                    <Form.Check.Input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckChecked"
                                        defaultChecked />
                                    <Form.Check.Label className="form-check-label" htmlFor="flexSwitchCheckChecked">true / active</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="form-check form-switch form-group">
                                    <Form.Check.Input className="form-check-input bg-info" type="checkbox" role="switch"
                                        id="flexSwitchCheckCheckedDisabled" defaultChecked disabled />
                                    <Form.Check.Label className="form-check-label" htmlFor="flexSwitchCheckCheckedDisabled">disable /
                                        active</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="form-check form-switch form-group">
                                    <Form.Check.Input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDisabled"
                                        disabled />
                                    <Form.Check.Label className="form-check-label" htmlFor="flexSwitchCheckDisabled">disable /
                                        Inactive</Form.Check.Label>
                                </Form.Group>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card>
                        <Card.Header className=" d-flex justify-content-between">
                            <Card.Header.Title>
                                <h4 className="card-title">Text</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body className="pt-2">
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                Morbi vulputate, ex ac venenatis mollis,
                                diam nibh
                                finibus leo</p>
                            <div className="d-flex flex-wrap gap-4">
                                <div className="d-flex flex-column align-items-center gap-1 form-group mb-0">
                                    <label className="m-0">Primary</label>
                                    <div>
                                        <input type="checkbox" id="switch" className="checkboxs " defaultChecked />
                                        <label htmlFor="switch" className="toggles text-white bg-primary border-primary">
                                            <p className="texts ps-1">
                                                On &nbsp;&nbsp;Off
                                            </p>
                                        </label>
                                    </div>
                                </div>
                                <div className="d-flex flex-column align-items-center gap-1 form-group mb-0">
                                    <label className="m-0">Secondary</label>
                                    <div>
                                        <input type="checkbox" id="tr_fal_switch" className="checkboxs " defaultChecked />
                                        <label htmlFor="tr_fal_switch" className="toggles text-white bg-success border-success">
                                            <p className="texts ps-1">
                                                Tr &nbsp;&nbsp;&nbsp;&nbsp;fal
                                            </p>
                                        </label>
                                    </div>
                                </div>
                                <div className="d-flex flex-column align-items-center gap-1 form-group mb-0">
                                    <label className="m-0">Danger</label>
                                    <div>
                                        <input type="checkbox" id="y_n_switch" className="checkboxs" defaultChecked />
                                        <label htmlFor="y_n_switch" className="toggles text-white bg-danger border-danger">
                                            <p className="texts ps-1">
                                                Yes&nbsp;&nbsp;No
                                            </p>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>


                    <Card >
                        <Card.Header className=" d-flex justify-content-between">
                            <Card.Header.Title >
                                <h4 className="card-title">Color</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body className="pt-2">
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                Morbi vulputate, ex ac venenatis mollis,
                                diam nibh
                                finibus leo</p>
                            <div className="d-flex flex-wrap gap-4">
                                <Form.Group className="form-check form-group form-switch">
                                    <Form.Check.Input className="form-check-input bg-primary border-0 text-primary" type="checkbox" role="switch"
                                        id="flexSwitchCheckChecked" defaultChecked />
                                    <Form.Check.Label className="form-check-label" htmlFor="flexSwitchCheckChecked">Primary</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="form-check form-group form-switch">
                                    <Form.Check.Input className="form-check-input bg-success border-0 text-success" type="checkbox" role="switch"
                                        id="flexSwitchCheckChecked" defaultChecked />
                                    <Form.Check.Label className="form-check-label" htmlFor="flexSwitchCheckChecked">Success</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="form-check form-group form-switch">
                                    <Form.Check.Input className="form-check-input bg-danger border-0 text-danger" type="checkbox" role="switch"
                                        id="flexSwitchCheckChecked" defaultChecked />
                                    <Form.Check.Label className="form-check-label" htmlFor="flexSwitchCheckChecked">Danger</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="form-check form-group form-switch">
                                    <Form.Check.Input className="form-check-input bg-warning border-0 text-warning" type="checkbox" role="switch"
                                        id="flexSwitchCheckChecked" defaultChecked />
                                    <Form.Check.Label className="form-check-label" htmlFor="flexSwitchCheckChecked">Warning</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="form-check form-group form-switch">
                                    <Form.Check.Input className="form-check-input bg-gray border-0 text-gray" type="checkbox" role="switch"
                                        id="flexSwitchCheckChecked" defaultChecked />
                                    <Form.Check.Label className="form-check-label" htmlFor="flexSwitchCheckChecked">Dark</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="form-check form-group form-switch">
                                    <Form.Check.Input className="form-check-input text-info" type="checkbox" role="switch" id="flexSwitchCheckChecked"
                                        defaultChecked />
                                    <Form.Check.Label className="form-check-label" htmlFor="flexSwitchCheckChecked">Info</Form.Check.Label>
                                </Form.Group>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card >
                        <Card.Header className="d-flex justify-content-between">
                            <h4 className="card-title">Icon</h4>
                        </Card.Header>
                        <Card.Body className="pt-2">
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                Morbi vulputate, ex ac venenatis mollis,
                                diam nibh
                                finibus leo</p>
                            <div className="d-flex flex-wrap gap-4">
                                <div className="d-flex flex-column align-items-center gap-1 form-group mb-0">
                                    <label className="m-0">Primary</label>
                                    <div>
                                        <input type="checkbox" id="switchs" className="checkboxs " defaultChecked />
                                        <label htmlFor="switchs" className="toggles text-white bg-primary border-primary">
                                            <p className="texts ps-1">
                                                <i className="fa fa-check custom-switch-size"></i> &nbsp;&nbsp;&nbsp;&nbsp;<i
                                                    className="fa fa-check custom-switch-size"></i>
                                            </p>
                                        </label>
                                    </div>
                                </div>
                                <div className="d-flex flex-column align-items-center gap-1 form-group mb-0">
                                    <label className="m-0">Success</label>
                                    <div>
                                        <input type="checkbox" id="succ-switch" className="checkboxs " defaultChecked />
                                        <label htmlFor="succ-switch" className="toggles text-white bg-success border-success">
                                            <p className="texts ps-1">
                                                <i className="fa fa-check custom-switch-size"></i> &nbsp;&nbsp;&nbsp;&nbsp;<i
                                                    className="fa fa-check custom-switch-size"></i>
                                            </p>
                                        </label>
                                    </div>
                                </div>
                                <div className="d-flex flex-column align-items-center gap-1 form-group mb-0">
                                    <label className="m-0">Danger</label>
                                    <div>
                                        <input type="checkbox" id="dan-switch" className="checkboxs " defaultChecked />
                                        <label htmlFor="dan-switch" className="toggles text-white bg-danger border-danger">
                                            <p className="texts ps-1">
                                                <i className="fa fa-times custom-switch-size"></i> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i
                                                    className="fa fa-times custom-switch-size"></i>
                                            </p>
                                        </label>
                                    </div>
                                </div>
                                <div className="d-flex flex-column align-items-center gap-1 form-group mb-0">
                                    <label className="m-0">Warning</label>
                                    <div>
                                        <input type="checkbox" id="war-switch" className="checkboxs " defaultChecked />
                                        <label htmlFor="war-switch" className="toggles text-white bg-warning border-warning">
                                            <p className="texts ps-1">
                                                <i className="fa fa-exclamation-triangle custom-switch-size"></i> &nbsp;&nbsp;&nbsp;&nbsp;<i
                                                    className="fa fa-exclamation-triangle custom-switch-size"></i>
                                            </p>
                                        </label>
                                    </div>
                                </div>
                                <div className="d-flex flex-column align-items-center gap-1 form-group mb-0">
                                    <label className="m-0">Dark</label>
                                    <div>
                                        <input type="checkbox" id="dark-switch" className="checkboxs " defaultChecked />
                                        <label htmlFor="dark-switch" className="toggles text-white bg-dark border-dark">
                                            <p className="texts ps-2">
                                                <i className="fa fa-thumb-tack custom-switch-size"></i> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i
                                                    className="fa fa-thumb-tack custom-switch-size"></i>
                                            </p>
                                        </label>
                                    </div>
                                </div>
                                <div className="d-flex flex-column align-items-center gap-1 form-group mb-0">
                                    <label className="m-0">info</label>
                                    <div>
                                        <input type="checkbox" id="info-switch" className="checkboxs " defaultChecked />
                                        <label htmlFor="info-switch" className="toggles text-white bg-info border-info">
                                            <p className="texts ps-2">
                                                <i className="fa fa-info custom-switch-size"></i> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i
                                                    className="fa fa-info custom-switch-size"></i>
                                            </p>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default FormSwitch
import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import Card from "../../components/Card";


const FormCheckbox = () => {
    return (
        <>
            <Row>
                <Col sm={12} lg={6}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between ">
                            <Card.Header.Title className="header-title">
                                <h4 className="card-title">Basic Checkbox</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p >Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vulputate, ex ac venenatis mollis,
                                diam nibh finibus leo</p>
                            <Form.Group className="checkbox d-inline-block me-2 form-group">
                                <input type="checkbox" className="checkbox-input" id="checkbox1" />{" "}
                                <Form.Check.Label htmlFor="checkbox1">Primary / Inactive</Form.Check.Label>
                            </Form.Group>{" "}
                            <Form.Group className="checkbox d-inline-block me-2 form-group">
                                <input type="checkbox" className="checkbox-input" id="checkbox2" defaultChecked />{" "}
                                <Form.Check.Label htmlFor="checkbox2">Primary / Active</Form.Check.Label>
                            </Form.Group>{" "}
                            <Form.Group className="checkbox d-inline-block me-2 form-group">
                                <input type="checkbox" className="checkbox-input" id="checkbox3" disabled />{" "}
                                <Form.Check.Label htmlFor="checkbox3">Disable / Inactive</Form.Check.Label>
                            </Form.Group>{" "}
                            <Form.Group className="checkbox d-inline-block me-2 form-group">
                                <input type="checkbox" className="checkbox-input" id="checkbox4" defaultChecked disabled />{" "}
                                <Form.Check.Label htmlFor="checkbox4">Active / Disable</Form.Check.Label>
                            </Form.Group>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header className="d-flex justify-content-between ">
                            <Card.Header.Title>
                                <h4 className="card-title">Custom Color</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body className="card-body ">
                            <p >Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vulputate, ex ac venenatis mollis,
                                diam nibh finibus leo</p>
                            <div className="d-flex gap-3 flex-wrap">
                                <Form.Group className="custom-control custom-checkbox custom-checkbox-color custom-control-inline p-0 form-group">
                                    <Form.Check.Input type="checkbox" className="bg-primary border-0" id="customCheck-11" />{" "}
                                    <Form.Check.Label htmlFor="customCheck-11">Primary </Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-checkbox custom-checkbox-color custom-control-inline form-group">
                                    <Form.Check.Input type="checkbox" className="bg-success border-0" id="customCheck-22" />{" "}
                                    <Form.Check.Label htmlFor="customCheck-22">Success</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-checkbox custom-checkbox-color custom-control-inline form-group">
                                    <Form.Check.Input type="checkbox" className="bg-danger border-0" id="customCheck-33" />{" "}
                                    <Form.Check.Label htmlFor="customCheck-33">Danger</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-checkbox custom-checkbox-color custom-control-inline form-group">
                                    <Form.Check.Input type="checkbox" className="bg-warning border-0" id="customCheck-44" />{" "}
                                    <Form.Check.Label htmlFor="customCheck-44">Warning</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-checkbox custom-checkbox-color custom-control-inline form-group">
                                    <Form.Check.Input type="checkbox" className="bg-dark border-0" id="customCheck-55" />{" "}
                                    <Form.Check.Label htmlFor="customCheck-55">Dark</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-checkbox custom-checkbox-color custom-control-inline form-group">
                                    <Form.Check.Input type="checkbox" className="bg-info border-0" id="customCheck-66" />{" "}
                                    <Form.Check.Label htmlFor="customCheck-66"> Info</Form.Check.Label>
                                </Form.Group>
                            </div>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header className="d-flex justify-content-between ">
                            <Card.Header.Title>
                                <h4 className="card-title">Boolean Checkbox</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p >Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vulputate, ex ac venenatis mollis,
                                diam nibh finibus leo</p>
                            <div className="d-flex gap-4">
                                <Form.Group className="custom-control custom-checkbox custom-control-inline p-0 form-group">
                                    <Form.Check.Input type="checkbox" className="me-1" id="customCheck-t" defaultChecked />{" "}
                                    <Form.Check.Label htmlFor="customCheck-t">True</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-checkbox custom-control-inline form-group">
                                    <Form.Check.Input type="checkbox" className="me-1" id="customCheck-f" />{" "}
                                    <Form.Check.Label htmlFor="customCheck-f">False</Form.Check.Label>
                                </Form.Group>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col sm={12} lg={6}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between ">
                            <Card.Header.Title>
                                <h4 className="card-title">Custom Checkbox</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p >Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vulputate, ex ac venenatis mollis,
                                diam nibh finibus leo</p>
                            <div className="d-flex gap-3 flex-wrap">
                                <Form.Group className="custom-control custom-checkbox custom-control-inline form-group">
                                    <Form.Check.Input type="checkbox" id="customCheck5" />{" "}
                                    <Form.Check.Label htmlFor="customCheck5">Primary / Inactive</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-checkbox custom-control-inline form-group">
                                    <Form.Check.Input type="checkbox" id="customCheck6" defaultChecked />{" "}
                                    <Form.Check.Label htmlFor="customCheck6">Primary - active</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-checkbox custom-control-inline form-group">
                                    <Form.Check.Input type="checkbox" id="customCheck7" disabled />{" "}
                                    <Form.Check.Label htmlFor="customCheck7">Primary - inactive - disabled</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-checkbox custom-control-inline form-group">
                                    <Form.Check.Input type="checkbox" id="customCheck8" defaultChecked disabled />{" "}
                                    <Form.Check.Label htmlFor="customCheck8">Primary - active - disabled</Form.Check.Label>
                                </Form.Group>
                            </div>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header className="d-flex justify-content-between ">
                            <Card.Header.Title>
                                <h4 className="card-title">Color</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p >Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vulputate, ex ac venenatis mollis,
                                diam nibh finibus leo</p>
                            <div className="d-flex gap-3 flex-wrap ">
                                <Form.Group className="custom-control custom-checkbox custom-checkbox-color-check custom-control-inline p-0 form-group">
                                    <Form.Check.Input type="checkbox" className="bg-primary me-1 border-0" id="customCheck-1"
                                        defaultChecked />{" "}
                                    <Form.Check.Label htmlFor="customCheck-1"> Primary</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-checkbox custom-checkbox-color-check custom-control-inline form-group">
                                    <Form.Check.Input type="checkbox" className="bg-success me-1 border-0" id="customCheck-2"
                                        defaultChecked />{" "}
                                    <Form.Check.Label htmlFor="customCheck-2">Success</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-checkbox custom-checkbox-color-check custom-control-inline form-group">
                                    <Form.Check.Input type="checkbox" className="bg-danger me-1 border-0" id="customCheck-3"
                                        defaultChecked />{" "}                                    <Form.Check.Label htmlFor="customCheck-3">Danger</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-checkbox custom-checkbox-color-check custom-control-inline form-group">
                                    <Form.Check.Input type="checkbox" className="bg-warning me-1 border-0" id="customCheck-4"
                                        defaultChecked />{" "}
                                    <Form.Check.Label htmlFor="customCheck-4">Warning</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-checkbox custom-checkbox-color-check custom-control-inline form-group">
                                    <Form.Check.Input type="checkbox" className="bg-dark me-1 border-0" id="customCheck-5"
                                        defaultChecked />{" "}
                                    <Form.Check.Label htmlFor="customCheck-5">Dark</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-checkbox custom-checkbox-color-check custom-control-inline form-group">
                                    <Form.Check.Input type="checkbox" className="bg-info me-1 border-0" id="customCheck-6"
                                        defaultChecked />{" "}
                                    <Form.Check.Label htmlFor="customCheck-6">Info</Form.Check.Label>
                                </Form.Group>
                            </div>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header className="d-flex justify-content-between ">
                            <Card.Header.Title>
                                <h4 className="card-title">Change Icon</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p >Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vulputate, ex ac venenatis mollis,
                                diam nibh finibus leo</p>
                            <div className="d-flex gap-3 flex-wrap custom-checkboxs ">
                                <Form.Group className="custom-control custom-checkbox checkbox-icon custom-control-inline form-group ">
                                    <Form.Check.Input type="checkbox" id="customCheck-10" defaultChecked />
                                    <Form.Check.Label htmlFor="customCheck-10"><i className="fa fa-music"></i>Music</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-checkbox checkbox-icon custom-control-inline form-group">
                                    <Form.Check.Input type="checkbox" id="customCheck-20" defaultChecked />
                                    <Form.Check.Label htmlFor="customCheck-20"><i
                                        className="fa fa-commenting-o"></i>SMS</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-checkbox checkbox-icon custom-control-inline form-group">
                                    <Form.Check.Input type="checkbox" id="customCheck-30" defaultChecked />
                                    <Form.Check.Label htmlFor="customCheck-30"><i className="fa fa-times"></i>Cancel</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-checkbox checkbox-icon custom-control-inline form-group">
                                    <Form.Check.Input type="checkbox" id="customCheck-40" defaultChecked />
                                    <Form.Check.Label htmlFor="customCheck-40"><i className="fa fa-file"></i>File</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-checkbox checkbox-icon custom-control-inline form-group">
                                    <Form.Check.Input type="checkbox" id="customCheck-50" defaultChecked />
                                    <Form.Check.Label htmlFor="customCheck-50"><i className="fa fa-bold"></i>Bold</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-checkbox checkbox-icon custom-control-inline form-group">
                                    <Form.Check.Input type="checkbox" id="customCheck-60" defaultChecked />
                                    <Form.Check.Label htmlFor="customCheck-60"><i
                                        className="fa fa-map-marker"></i>Location</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-checkbox checkbox-icon custom-control-inline form-group">
                                    <Form.Check.Input type="checkbox" id="customCheck-70" defaultChecked />
                                    <Form.Check.Label htmlFor="customCheck-70"><i className="fa fa-camera"></i>Camera</Form.Check.Label>
                                </Form.Group>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

        </>
    )
}

export default FormCheckbox
import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import Card from "../../components/Card";


const FormRadio = () => {
    return (
        <>
            <Row>
                <Col sm={12} lg={6}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between ">
                            <Card.Header.Title>
                                <h4 className="card-title">Default Radio Buttons</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p >Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vulputate, ex ac venenatis mollis,
                                diam nibh finibus leo</p>

                            <Form.Group className="radio d-inline-block me-2 form-group">
                                <Form.Check.Input type="radio" name="bsradio" id="radio1" className="form-check-input" defaultChecked />{" "}
                                <Form.Check.Label className="opacity-100" htmlFor="radio1">Active</Form.Check.Label>
                            </Form.Group>{" "}
                            <Form.Group className="radio d-inline-block me-2 form-group">
                                <Form.Check.Input type="radio" name="bsradio" className="form-check-input" id="radio2" />{" "}
                                <Form.Check.Label className="opacity-100" htmlFor="radio2">Inactive</Form.Check.Label>
                            </Form.Group>{" "}
                            <Form.Group className="radio d-inline-block me-2 form-group">
                                <Form.Check.Input type="radio" name="bsradio1" className="form-check-input" id="radio3" disabled defaultChecked />{" "}
                                <Form.Check.Label className="opacity-100" htmlFor="radio3">Active - Disabled</Form.Check.Label>
                            </Form.Group>{" "}
                            <Form.Group className="radio d-inline-block me-2 form-group">
                                <Form.Check.Input type="radio" name="bsradio1" className="form-check-input" id="radio4" disabled />{" "}
                                <Form.Check.Label className="opacity-100" htmlFor="radio3">Inactive - Disabled</Form.Check.Label>
                            </Form.Group>



                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header className="d-flex justify-content-between  ">
                            <Card.Header.Title>
                                <h4 className="card-title">Custom Colored Radio Buttons</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p >Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vulputate, ex ac venenatis mollis,
                                diam nibh finibus leo</p>
                            <div className="d-flex gap-2 flex-wrap">
                                <Form.Group className="custom-control custom-radio custom-radio-color custom-control-inline form-group">
                                    <Form.Check.Input type="radio" id="customRadio01" name="customRadio-11"
                                        className="bg-primary me-1" />{" "}
                                    <Form.Check.Label htmlFor="customRadio01"> Primary </Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-radio custom-radio-color custom-control-inline form-group">
                                    <Form.Check.Input type="radio" id="customRadio02" name="customRadio-11"
                                        className="bg-success me-1" />{" "}
                                    <Form.Check.Label htmlFor="customRadio02"> Success </Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-radio custom-radio-color custom-control-inline form-group">
                                    <Form.Check.Input type="radio" id="customRadio03" name="customRadio-11"
                                        className="bg-danger me-1" />{" "}
                                    <Form.Check.Label htmlFor="customRadio03"> Danger </Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-radio custom-radio-color custom-control-inline form-group">
                                    <Form.Check.Input type="radio" id="customRadio04" name="customRadio-11"
                                        className="bg-warning me-1" />{" "}
                                    <Form.Check.Label htmlFor="customRadio04"> Warning </Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-radio custom-radio-color custom-control-inline form-group">
                                    <Form.Check.Input type="radio" id="customRadio05" name="customRadio-11"
                                        className="bg-dark me-1" />{" "}
                                    <Form.Check.Label htmlFor="customRadio05"> Dark </Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-radio custom-radio-color custom-control-inline form-group">
                                    <Form.Check.Input type="radio" id="customRadio06" name="customRadio-11"
                                        className="bg-info me-1" />{" "}
                                    <Form.Check.Label htmlFor="customRadio06"> Info </Form.Check.Label>
                                </Form.Group>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col sm={12} lg={6}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between  ">
                            <Card.Header.Title>
                                <h4 className="card-title">Custom Radio Buttons</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p >Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vulputate, ex ac venenatis mollis,
                                diam nibh finibus leo</p>
                            <div className="d-flex gap-2 flex-wrap">
                                <Form.Group className="custom-control custom-radio custom-control-inline form-group">
                                    <Form.Check.Input type="radio" id="customRadio6" name="customRadio-1" />{" "}
                                    <Form.Check.Label htmlFor="customRadio6"> One </Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-radio custom-control-inline form-group">
                                    <Form.Check.Input type="radio" id="customRadio7" name="customRadio-1" />{" "}
                                    <Form.Check.Label htmlFor="customRadio7"> Two </Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-radio custom-control-inline form-group">
                                    <Form.Check.Input type="radio" id="customRadio8" name="customRadio-1" defaultChecked />{" "}
                                    <Form.Check.Label htmlFor="customRadio8"> Three </Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-radio custom-control-inline form-group">
                                    <Form.Check.Input type="radio" id="customRadio-8" name="customRadio-2" defaultChecked />{" "}
                                    <Form.Check.Label htmlFor="customRadio-8"> Four Checked </Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-radio custom-control-inline form-group">
                                    <Form.Check.Input type="radio" id="customRadio9" name="customRadio-3" disabled />{" "}
                                    <Form.Check.Label htmlFor="customRadio9"> Five disabled</Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="custom-control custom-radio custom-control-inline form-group">
                                    <Form.Check.Input type="radio" id="customRadio10" name="customRadio-4" disabled
                                        defaultChecked />{" "}
                                    <Form.Check.Label htmlFor="customRadio10"> Six Selected and disabled</Form.Check.Label>
                                </Form.Group>
                            </div>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header className="d-flex justify-content-between  ">
                            <Card.Header.Title>
                                <h4 className="card-title">Colored Radio Buttons</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <p >Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vulputate, ex ac venenatis mollis,
                                diam nibh finibus leo</p>
                            <div className="d-flex gap-2 flex-wrap">
                                <Form.Group className="form-check form-check-inline form-group">
                                    <Form.Check.Input type="radio" id="customRadio-1" name="customRadio-10"
                                        className="text-primary me-2" />{" "}
                                    <Form.Check.Label htmlFor="customRadio-1"> Primary </Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="form-check form-check-inline form-group">
                                    <Form.Check.Input type="radio" id="customRadio-2" name="customRadio-10"
                                        className="text-success me-2" />{" "}
                                    <Form.Check.Label htmlFor="customRadio-2"> Success </Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="form-check form-check-inline form-group">
                                    <Form.Check.Input type="radio" id="customRadio-3" name="customRadio-10"
                                        className="text-danger me-2" />{" "}
                                    <Form.Check.Label htmlFor="customRadio-3"> Danger </Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="form-check form-check-inline form-group">
                                    <Form.Check.Input type="radio" id="customRadio-4" name="customRadio-10"
                                        className="text-warning me-2" />{" "}
                                    <Form.Check.Label htmlFor="customRadio-4"> Warning </Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="form-check form-check-inline form-group">
                                    <Form.Check.Input type="radio" id="customRadio-5" name="customRadio-10"
                                        className="text-dark me-2" />{" "}
                                    <Form.Check.Label htmlFor="customRadio-5"> Dark </Form.Check.Label>
                                </Form.Group>
                                <Form.Group className="form-check form-check-inline form-group">
                                    <Form.Check.Input type="radio" id="customRadio-6" name="customRadio-10"
                                        className="text-info me-2" />{" "}
                                    <Form.Check.Label htmlFor="customRadio-6"> Info </Form.Check.Label>
                                </Form.Group>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

        </>
    )
}

export default FormRadio
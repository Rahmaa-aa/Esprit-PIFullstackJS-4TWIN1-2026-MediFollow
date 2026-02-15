import React, { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import Card from "../../components/Card";


const FormValidatioins = () => {

    const [validated, setValidated] = useState(false);
    const handleSubmit = (event) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }
        setValidated(true);
    };
    const [validated1, setValidated1] = useState(false);
    const handleSubmit1 = (event) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }
        setValidated1(true);
    };

    return (
        <>
            <Row className="iq-form-validation">
                <Col sm="12" lg="6">
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <div className="header-title">
                                <h4 className="card-title"> Default Validation</h4>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vulputate, ex ac venenatis mollis, diam nibh finibus leo</p>
                            <Form className="cust-form-elements">
                                <Row>
                                    <Col md="6" className='form-group'>
                                        <Form.Label md="6" className="mb-0" htmlFor="validationDefault01">First name</Form.Label>
                                        <Form.Control type="text" id="validationDefault01" required />
                                    </Col>
                                    <Col md="6" className="form-group">
                                        <Form.Label className="mb-0" htmlFor="validationDefault02">Last name</Form.Label>
                                        <Form.Control type="text" id="validationDefault02" required />
                                    </Col>
                                    <Col md="6" className="form-group">
                                        <Form.Label className="mb-0" htmlFor="validationCustomUsername">Username</Form.Label>
                                        <Form.Group className="form-group input-group mb-0">
                                            <span className="input-group-text" id="basic-addon1">@</span>
                                            <Form.Control type="text" id="validationCustomUsername" aria-label="Username" aria-describedby="basic-addon1" required />
                                        </Form.Group>
                                    </Col>
                                    <Col md="6" className="form-group">
                                        <Form.Label className="mb-0" htmlFor="validationDefault03">City</Form.Label>
                                        <Form.Control type="text" id="validationDefault03" required />
                                    </Col>
                                    <Col md="6" className='form-group'>
                                        <Form.Label className="mb-0" htmlFor="validationDefault04">State</Form.Label>
                                        <select className="form-control" id="validationDefault04" required>
                                            <option defaultValue>Choose...</option>
                                            <option>...</option>
                                        </select>
                                    </Col>
                                    <Col md="6" className="form-group">
                                        <Form.Label className="mb-0" htmlFor="validationDefault05">Zip</Form.Label>
                                        <Form.Control type="text" id="validationDefault05" required />
                                    </Col>
                                </Row>
                                <Form.Group className='form-group'>
                                    <Form.Check >
                                        <Form.Check.Input type="checkbox" defaultValue id="invalidCheck2" className="p-0" required />
                                        <Form.Check.Label htmlFor="invalidCheck2">
                                            Agree to terms and conditions
                                        </Form.Check.Label>
                                    </Form.Check>
                                </Form.Group>
                                <Form.Group className='form-group'>
                                    <Button type="button" variant="btn btn-danger-subtle me-1">
                                        Cancel
                                    </Button>{" "}
                                    <Button type="submit" variant="btn btn-primary-subtle">
                                        Save
                                    </Button>

                                </Form.Group>
                            </Form>
                        </Card.Body>
                    </Card>
                    <Card className="iq-supported-elements">
                        <Card.Header className="d-flex justify-content-between">
                            <div className="header-title">
                                <h4 className="card-title"> Supported elements</h4>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vulputate, ex ac venenatis mollis, diam nibh finibus leo</p>
                            <Form className="was-validated cust-form-elements" validated>
                                <Form.Group className='form-group'>
                                    <Form.Label htmlFor="validationTextarea" className="form-label mb-0">Textarea</Form.Label>
                                    <Form.Control as="textarea" className="is-valid" id="validationTextarea" placeholder="Required example textarea" required />
                                </Form.Group>
                                <Form.Check className="form-group">
                                    <input type="checkbox" className="custom-control-input" id="customControlValidation1" required />{" "}
                                    <label className="custom-control-label" htmlFor="customControlValidation1">Check this custom
                                        checkbox</label>
                                    <div className="invalid-feedback">Example invalid feedback
                                        text</div>
                                </Form.Check>
                                <Form.Check className="form-group">
                                    <input type="radio" className="custom-control-input" id="customControlValidation2"
                                        name="radio-stacked" required />{" "}
                                    <label className="custom-control-label" htmlFor="customControlValidation2">Toggle this custom
                                        radio</label>
                                </Form.Check>
                                <Form.Check className="form-group">
                                    <input type="radio" className="custom-control-input" id="customControlValidation3"
                                        name="radio-stacked" required />{" "}
                                    <label className="custom-control-label" htmlFor="customControlValidation3">Or toggle this other
                                        custom radio</label>
                                    <div className="invalid-feedback">More example invalid
                                        feedback text</div>
                                </Form.Check>
                                <Form.Group className='mb-3'>
                                    <Form.Select required>
                                        <option value=''>Open this select menu</option>
                                        <option value='One'>One</option>
                                        <option value='Tne'>Two</option>
                                        <option value='Three'>Three</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">Example invalid custom select feedback</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group className="mb-0">
                                    <Form.Control type="file" aria-label="file example" required />
                                    <Form.Control.Feedback type="invalid">Example invalid custom file feedback</Form.Control.Feedback>
                                </Form.Group>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                <Col sm="12" lg="6">
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <div className="header-title">
                                <h4 className="card-title">Custom Validation</h4>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vulputate, ex ac venenatis mollis, diam nibh finibus leo</p>
                            <Form noValidate validated={validated} onClick={handleSubmit} className='needs-validation cust-form-elements'>
                                <Row className="needs-validation">
                                    <Col md="6" className="form-group">
                                        <Form.Label htmlFor="validationCustom01" className="mb-0">First name</Form.Label>
                                        <Form.Control type="text" defaultValue="" id="validationCustom01" required />
                                        <Form.Control.Feedback>
                                            Looks good!
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col md="6" className="form-group">
                                        <Form.Label htmlFor="validationCustom02" className="mb-0">Last name</Form.Label>
                                        <Form.Control type="text" defaultValue="" id="validationCustom02" required />
                                        <Form.Control.Feedback>
                                            Looks good!
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col md="6" className="form-group mt-0">
                                        <Form.Label htmlFor="validationCustomUsername01" className="mb-0">Username</Form.Label>
                                        <div className="input-group has-validation">
                                            <span className="input-group-text" id="inputGroupPrepend">@</span>
                                            <Form.Control type="text" defaultValue="" id="validationCustomUsername01" aria-describedby="inputGroupPrepend" required />
                                            <Form.Control.Feedback type="invalid">

                                            </Form.Control.Feedback>
                                        </div>
                                    </Col>
                                    <Col md="6" className="form-group mt-0">
                                        <Form.Label htmlFor="validationCustom03" className="mb-0">City</Form.Label>
                                        <Form.Control type="text" defaultValue="" id="validationCustom03" required />
                                        <Form.Control.Feedback type="invalid">
                                            Please provide a valid city.
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col md="6" className="form-group mt-0">
                                        <Form.Label htmlFor="validationCustom04" className="mb-0">State</Form.Label>
                                        <select className="form-control" defaultValue={["Choice1"]} id="validationCustom04" required>
                                            <option defaultValue="Choice1">Choose...</option>
                                            <option>...</option>
                                        </select>
                                        <Form.Control.Feedback type="invalid">
                                            Please select a valid state.
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col md="6" className="form-group mt-0">
                                        <Form.Label htmlFor="validationCustom05" className="mb-0">Zip</Form.Label>
                                        <Form.Control defaultValue="" type="text" id="validationCustom05" required />
                                        <Form.Control.Feedback type="invalid">
                                            Please provide a valid zip.
                                        </Form.Control.Feedback>
                                    </Col>
                                </Row>
                                <div className="form-group">
                                    <Form.Check>
                                        <Form.Check.Input type="checkbox" defaultValue id="invalidCheck" required />
                                        <Form.Check.Label htmlFor="invalidCheck">
                                            Agree to terms and conditions
                                        </Form.Check.Label>
                                        <Form.Control.Feedback type="invalid">
                                            You must agree before submitting.
                                        </Form.Control.Feedback>
                                    </Form.Check>
                                </div>
                                <div className="d-flex gap-2">
                                    <Button type="button" variant="btn btn-danger-subtle">
                                        Cancel
                                    </Button>{" "}
                                    <Button type="submit" variant="btn btn-primary-subtle">
                                        Save
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <div className="header-title">
                                <h4 className="card-title">Tooltips</h4>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vulputate, ex ac venenatis mollis, diam nibh finibus leo</p>
                            <Form validated={validated1} onClick={handleSubmit1} className="needs-validation cust-form-elements" noValidate>
                                <Row className="needs-validation">
                                    <Col md="6" className="position-relative form-group">
                                        <Form.Label htmlFor="validationTooltip01" className="mb-0">First name</Form.Label>
                                        <Form.Control type="text" id="validationTooltip01" defaultValue="Mark" required />
                                        <Form.Control.Feedback tooltip >
                                            Looks good!
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col md="6" className="position-relative form-group">
                                        <Form.Label htmlFor="validationTooltip02" className="mb-0">Last name</Form.Label>
                                        <Form.Control type="text" id="validationTooltip02" defaultValue="Jets" required />
                                        <Form.Control.Feedback tooltip >
                                            Looks good!
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col md="6" className="position-relative form-group">
                                        <Form.Label htmlFor="validationTooltipUsername" className="mb-0">Username</Form.Label>
                                        <div className="input-group has-validation">
                                            <span className="input-group-text" id="validationTooltipUsernamePrepend">@</span>
                                            <Form.Control defaultValue="" type="text" id="validationTooltipUsername" aria-describedby="validationTooltipUsernamePrepend" required />
                                            <Form.Control.Feedback tooltip type="invalid">
                                                Please choose a unique and valid username.
                                            </Form.Control.Feedback>
                                        </div>
                                    </Col>
                                    <Col md="6" className="position-relative form-group">
                                        <Form.Label htmlFor="validationTooltip03" className="mb-0">City</Form.Label>
                                        <Form.Control type="text" id="validationTooltip03" required />
                                        <Form.Control.Feedback tooltip type="invalid">
                                            Please provide a valid city.
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col md="6" className="position-relative form-group">
                                        <Form.Label htmlFor="validationCustom04" className="mb-0">State</Form.Label>
                                        <select className="form-control" defaultValue={["Choice"]} id="validationCustom04" required>
                                            <option defaultValue="Choice">Choose...</option>
                                            <option>...</option>
                                        </select>
                                        <Form.Control.Feedback tooltip type="invalid">
                                            Please select a valid state.
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col md="6" className="position-relative form-group">
                                        <Form.Label htmlFor="validationTooltip05" className="mb-0">Zip</Form.Label>
                                        <Form.Control defaultValue="" type="text" id="validationTooltip05" required />
                                        <Form.Control.Feedback tooltip type="invalid">
                                            Please provide a valid zip.
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col xs={12} className="mt-5">
                                        <Button type="button" variant="btn btn-danger-subtle me-1">
                                            Cancel
                                        </Button>{" "}
                                        <Button type="submit" variant="btn btn-primary-subtle">
                                            Save
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default FormValidatioins
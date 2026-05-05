import React, { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import Card from "../../components/Card";


const VerticalWizard = () => {

    const [currentTab, setCurrentTab] = useState(0);
    const tabs = [
        { id: 'personal' },
        { id: 'contact' },
        { id: 'official' },
        { id: 'payment' }
    ];

    const changeTab = (direction) => {
        if (currentTab + direction >= 0 && currentTab + direction < tabs.length) {
            setCurrentTab(currentTab + direction);
        }
    };

    const isActive = (index) => currentTab === index;
    const isDone = (index) => currentTab > index || currentTab === 3;

    return (
        <>
            <Row>
                <Col sm="12" className="iq-vertical-wizard">
                    <Card>
                        <Card.Header className="card-header d-flex justify-content-between">
                            <Card.Header.Title>
                                <h4 className="card-title">Vertical Wizard</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <Row >
                                <Col md="3">
                                    <ul id="top-tabbar-vertical" className="p-0">
                                        <li className={`active step1 list-group-item ${isActive(0) ? 'active' : ''} ${isDone(0) ? 'active' : ''}`} id="personal">
                                            <a href="#!">
                                                <i className="ri-lock-unlock-line text-primary"></i><span>Personal</span>
                                            </a>
                                        </li>
                                        <li className={`step2 list-group-item ${isActive(1) ? 'active' : ''} ${isDone(1) ? 'active' : ''}`} id="contact">
                                            <a href="#!">
                                                <i className="ri-user-fill text-danger "></i><span>Contact</span>
                                            </a>
                                        </li>
                                        <li className={`step3 list-group-item ${isActive(2) ? 'active' : ''} ${isDone(2) ? 'active' : ''}`} id="official">
                                            <a href="#!">
                                                <i className="ri-camera-fill text-success"></i>{" "}<span>Official</span>
                                            </a>
                                        </li>
                                        <li className={`step4 list-group-item ${isActive(3) ? 'active' : ''} ${isDone(3) ? 'active' : ''}`} id="payment">
                                            <a href="#!">
                                                <i className="ri-check-fill text-warning"></i><span>Payment</span>
                                            </a>
                                        </li>
                                    </ul>
                                </Col>
                                <Col md="9">
                                    <Form id="form-wizard3" className="text-start">
                                        {/* fieldsets */}
                                        {currentTab === 0 && (
                                            <fieldset>
                                                <div className="form-card text-left">
                                                    <Row>
                                                        <Col cols="12">
                                                            <h3 className="mb-4 mt-md-2 mt-0">User Information:</h3>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col md="12">
                                                            <Form.Group className="form-group">
                                                                <Form.Label htmlFor="fname">First Name: *</Form.Label>
                                                                <Form.Control type="text" id="fname" name="fname" placeholder="First Name" />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md="12">
                                                            <Form.Group className="form-group">
                                                                <Form.Label htmlFor="lname">Last Name: *</Form.Label>
                                                                <Form.Control type="text" id="lname" name="lname" placeholder="Last Name" />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md={12}>
                                                            <Form.Group className="form-group">
                                                                <Form.Label>Gender: *</Form.Label>
                                                                <Form.Check className="p-0">
                                                                    <Form.Check className="form-check-inline">
                                                                        <Form.Check.Input type="radio"
                                                                            name="customRadio" id="customRadio1">
                                                                        </Form.Check.Input>
                                                                        <Form.Check.Label htmlFor="customRadio1">
                                                                            Male</Form.Check.Label>
                                                                    </Form.Check>{" "}
                                                                    <Form.Check className="form-check-inline">
                                                                        <Form.Check className="form-check-inline">
                                                                            <Form.Check.Input type="radio"
                                                                                name="customRadio" id="customRadio2">
                                                                            </Form.Check.Input>{" "}
                                                                            <Form.Check.Label htmlFor="customRadio2">
                                                                                Female</Form.Check.Label>
                                                                        </Form.Check>
                                                                    </Form.Check>
                                                                </Form.Check>
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md="12">
                                                            <Form.Group className="form-group">
                                                                <Form.Label htmlFor="dob">Date Of Birth: *</Form.Label>
                                                                <Form.Control type="date" id="dob" name="dob" className="rtl-date" />
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                </div>
                                                <Button type="button" className="btn btn-primary-subtle border-primary-subtle next action-button float-end" onClick={() => changeTab(1)} disabled={currentTab === tabs.length - 1}>
                                                    Next
                                                </Button>
                                            </fieldset>
                                        )}
                                        {currentTab === 1 && (
                                            <fieldset>
                                                <div className="form-card text-left">
                                                    <Row>
                                                        <Col cols="12">
                                                            <h3 className="mb-4 mt-md-2 mt-0">Contact Information:</h3>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col md="12">
                                                            <Form.Group className="form-group">
                                                                <Form.Label htmlFor="email">Email Id: *</Form.Label>
                                                                <Form.Control type="email" id="email" name="email" placeholder="Email Id" />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md="12">
                                                            <Form.Group className="form-group">
                                                                <Form.Label htmlFor="ccno">Contact Number: *</Form.Label>
                                                                <Form.Control type="text" id="ccno" name="ccno" placeholder="Contact Number" />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md="12">
                                                            <Form.Group className="form-group">
                                                                <Form.Label htmlFor="city">City: *</Form.Label>
                                                                <Form.Control type="text" id="city" name="city" placeholder="City." />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md="12">
                                                            <Form.Group className="form-group">
                                                                <Form.Label htmlFor="state">State: *</Form.Label>
                                                                <Form.Control type="text" id="state" name="state" placeholder="State." />
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    <Button type="button" className="btn btn-primary-subtle border-primary-subtle next action-button float-end" onClick={() => changeTab(1)} disabled={currentTab === tabs.length - 1}>
                                                        Next
                                                    </Button>
                                                    <Button type="button" className="btn btn-dark previous action-button-previous float-end me-3" onClick={() => changeTab(-1)} disabled={currentTab === 0}>
                                                        Previous
                                                    </Button>
                                                </div>
                                            </fieldset>
                                        )}
                                        {currentTab === 2 && (
                                            <fieldset>
                                                <div className="form-card text-left">
                                                    <Row>
                                                        <Col cols="12">
                                                            <h3 className="mb-4 mt-md-2 mt-0">Official Information:</h3>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col md="12">
                                                            <Form.Group className="form-group">
                                                                <Form.Label htmlFor="empid">Employee Id: *</Form.Label>
                                                                <Form.Control type="text" id="empid" name="empid" placeholder="Employee Id." />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md="12">
                                                            <Form.Group className="form-group">
                                                                <Form.Label htmlFor="desg">Designation: *</Form.Label>
                                                                <Form.Control type="text" id="desg" name="desg" placeholder="Designation." />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md="12">
                                                            <Form.Group className="form-group">
                                                                <Form.Label htmlFor="accname">Department Name: *</Form.Label>
                                                                <Form.Control type="text" id="accname" name="accname" placeholder="Department Name." />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md="12">
                                                            <Form.Group className="form-group">
                                                                <Form.Label htmlFor="workhour">Working Hour: *</Form.Label>
                                                                <Form.Control type="text" id="workhour" name="workhour" placeholder="Working Hour." />
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    <Button type="button" className="btn btn-primary-subtle border-primary-subtle next action-button float-end" onClick={() => changeTab(1)} disabled={currentTab === tabs.length - 1}>
                                                        Next
                                                    </Button>
                                                    <Button type="button" className="btn btn-dark previous action-button-previous float-end me-3" onClick={() => changeTab(-1)} disabled={currentTab === 0}>
                                                        Previous
                                                    </Button>
                                                </div>
                                            </fieldset>
                                        )}
                                        {currentTab === 3 && (
                                            <fieldset>
                                                <div className="form-card text-left">
                                                    <Row>
                                                        <Col cols="12">
                                                            <h3 className="mb-4 text-left mt-md-2 mt-0">Payment:</h3>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col md="12">
                                                            <Form.Group className="form-group">
                                                                <Form.Label htmlFor="panno">Pan No: *</Form.Label>
                                                                <Form.Control type="text" id="panno" name="panno" placeholder="Pan No." />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md="12">
                                                            <Form.Group className="form-group">
                                                                <Form.Label htmlFor="accno">Account No: *</Form.Label>
                                                                <Form.Control type="text" id="accno" name="accno" placeholder="Account No." />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md="12">
                                                            <Form.Group className="form-group">
                                                                <Form.Label htmlFor="holname">Account Holder Name: *</Form.Label>
                                                                <Form.Control type="text" id="holname" name="holname" placeholder="Account Holder Name." />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md="12">
                                                            <Form.Group className="form-group">
                                                                <Form.Label htmlFor="ifsc">IFSC Code: *</Form.Label>
                                                                <Form.Control type="text" id="ifsc" name="ifsc" placeholder="IFSC Code." />
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    <Button type="submit" className="btn btn-primary-subtle border-primary-subtle action-button float-end" onClick={() => window.location.reload()}>Submit</Button>
                                                    <Button type="button" className="btn btn-dark previous action-button-previous float-end me-3" onClick={() => changeTab(-1)} disabled={currentTab === 0}>
                                                        Previous
                                                    </Button>
                                                </div>
                                            </fieldset>
                                        )}
                                    </Form>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default VerticalWizard
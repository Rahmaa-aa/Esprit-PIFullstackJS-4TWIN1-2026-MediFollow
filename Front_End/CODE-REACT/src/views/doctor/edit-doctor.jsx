import React from "react";
import { Link } from "react-router-dom";
import { Button, Col, Form, Nav, Row, Tab } from "react-bootstrap";
import Card from "../../components/Card";

// Import Image
import user11 from "/assets/images/user/11.png"

const EditDoctor = () => {
    return (
        <>
            <Row>
                <Tab.Container defaultActiveKey={'personal-information'}>
                    <Col lg={12}>
                        <Card>
                            <Card.Body className="p-0">
                                <div className="edit-list">
                                    <Nav as="ul" className="edit-profile nav nav-pills list-inline mb-0 flex-md-row flex-column  "
                                        role="tablist">
                                        <Col md={3} as="li" className="p-0">
                                            <Nav.Link className="nav-link py-4 text-center" eventKey="personal-information" >
                                                Personal Information
                                            </Nav.Link>
                                        </Col>
                                        <Col md={3} as="li" className="p-0">
                                            <Nav.Link className="nav-link  py-4 text-center" eventKey="chang-pwd">
                                                Change Password
                                            </Nav.Link>
                                        </Col>
                                        <Col md={3} as="li" className="p-0">
                                            <Nav.Link className="nav-link  py-4 text-center" eventKey="emailandsms"
                                            >
                                                Email and SMS
                                            </Nav.Link>
                                        </Col>
                                        <Col md={3} as="li" className="p-0">
                                            <Nav.Link className="nav-link  py-4 text-center" eventKey="manage-contact"
                                            >
                                                Manage Contact
                                            </Nav.Link>
                                        </Col>
                                    </Nav>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={12}>
                        <div className="edit-list-data">
                            <Tab.Content>
                                <Tab.Pane className="fade show" eventKey="personal-information">
                                    <Card>
                                        <Card.Header className="d-flex justify-content-between">
                                            <Card.Header.Title>
                                                <h4 className="card-title">Personal Information</h4>
                                            </Card.Header.Title>
                                        </Card.Header>
                                        <Card.Body>
                                            <Form>
                                                <Row className="form-group align-items-center">
                                                    <Col md={12}>
                                                        <div className="profile-img-edit">
                                                            <img className="profile-pic" src={user11} alt="profile-pic" />
                                                            <div className="p-image">
                                                                <i className="ri-pencil-line upload-button"></i>
                                                                <input className="file-upload d-none" type="file" accept="image/*" />
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </Row>
                                                <Row className="cust-form-input">
                                                    <Col sm={6} className="form-group">
                                                        <Form.Label htmlFor="fname" className="mb-0">First Name:</Form.Label>
                                                        <Form.Control type="text" className="my-2" id="fname" defaultValue="Bini" />
                                                    </Col>
                                                    <Col sm={6} className="form-group">
                                                        <Form.Label htmlFor="lname" className="mb-0">Last Name:</Form.Label>
                                                        <Form.Control type="text" className="my-2" id="lname" defaultValue="Jets" />
                                                    </Col>
                                                    <Col sm={6} className="form-group">
                                                        <Form.Label htmlFor="uname" className="mb-0">User Name:</Form.Label>
                                                        <Form.Control type="text" className="my-2" id="uname" defaultValue="Bini@01" />
                                                    </Col>
                                                    <Col sm={6} className="form-group">
                                                        <Form.Label htmlFor="cname" className="mb-0">City:</Form.Label>
                                                        <Form.Control type="text" className="my-2" id="cname" defaultValue="Atlanta" />
                                                    </Col>
                                                    <Col sm={6} className="form-group">
                                                        <label className="d-block">Gender:</label>
                                                        <div className="custom-control custom-radio d-inline-flex me-3 p-0">
                                                            <input type="radio" id="customRadio6" name="customRadio1"
                                                                className="custom-control-input me-2" defaultChecked />
                                                            <label className="custom-control-label" htmlFor="customRadio6"> Male </label>
                                                        </div>{" "}
                                                        <div className="custom-control custom-radio d-inline-flex me-3 p-0">
                                                            <input type="radio" id="customRadio7" name="customRadio1"
                                                                className="custom-control-input me-2" />
                                                            <label className="custom-control-label" htmlFor="customRadio7"> Female </label>
                                                        </div>
                                                    </Col>
                                                    <Col sm={6} className="form-group">
                                                        <Form.Label htmlFor="dob" className="mb-0">Date Of Birth:</Form.Label>
                                                        <Form.Control className="my-2" defaultValue="1984-01-24" />
                                                    </Col>
                                                    <Col sm={6} className="form-group">
                                                        <Form.Label className="mb-0">Marital Status:</Form.Label>
                                                        {/* Changed to use Form.Control as select */}
                                                        <Form.Control as="select" defaultValue="single" className="form-control my-2">
                                                            <option defaultValue="single">Single</option>
                                                            <option defaultValue="Married">Married</option>
                                                            <option defaultValue="Widowed">Widowed</option>
                                                            <option defaultValue="Divorced">Divorced</option>
                                                            <option defaultValue="Separated">Separated</option>
                                                        </Form.Control>
                                                    </Col>
                                                    <Col sm={6} className="form-group">
                                                        <Form.Label className="mb-0">Age:</Form.Label>
                                                        {/* Changed to use Form.Control as select */}
                                                        <Form.Control as="select" defaultValue="33-45" className="form-control my-2" id="exampleFormControlSelect2">
                                                            <option defaultValue="12-18">12-18</option>
                                                            <option defaultValue="19-32">19-32</option>
                                                            <option defaultValue="33-45">33-45</option>
                                                            <option defaultValue="46-62">46-62</option>
                                                            <option defaultValue="63">63 &gt; </option>
                                                        </Form.Control>
                                                    </Col>
                                                    <Col sm={6} className="form-group">
                                                        <Form.Label className="mb-0">Country:</Form.Label>
                                                        {/* Changed to use Form.Control as select */}
                                                        <Form.Control as="select" defaultValue="USA" className="form-control my-2" id="exampleFormControlSelect3">
                                                            <option defaultValue="Canada">Canada</option>
                                                            <option defaultValue="Noida">Noida</option>
                                                            <option defaultValue="USA" >USA</option>
                                                            <option defaultValue="India">India</option>
                                                            <option defaultValue="Africa">Africa</option>
                                                        </Form.Control>
                                                    </Col>
                                                    <Col sm={6} className="form-group">
                                                        <Form.Label className="mb-0">State:</Form.Label>
                                                        {/* Changed to use Form.Control as select */}
                                                        <Form.Control as="select" defaultValue="Georgia" className="form-control my-2" id="exampleFormControlSelect4">
                                                            <option defaultValue="California">California</option>
                                                            <option defaultValue="Florida">Florida</option>
                                                            <option defaultValue="Georgia">Georgia</option>
                                                            <option defaultValue="Connecticut">Connecticut</option>
                                                            <option defaultValue="Louisiana">Louisiana</option>
                                                        </Form.Control>
                                                    </Col>
                                                    <Col sm={12} className="form-group">
                                                        <Form.Label className="mb-0">Address:</Form.Label>
                                                        <div className="form-floating overflow-hidden">
                                                            {/* Changed to use Form.Control as textarea */}
                                                            <Form.Control as="textarea" className="form-control" placeholder="Leave a comment here" id="floatingTextarea2" style={{ height: "100px" }} />
                                                            <Form.Label htmlFor="floatingTextarea2">37 Cardinal Lane Petersburg, VA 23803 United States of America Zip Code: 85001</Form.Label>
                                                        </div>
                                                    </Col>
                                                </Row>
                                                <Button type="button" className="btn btn-danger-subtle border-danger-subtle mt-3">Cancel</Button>{" "}
                                                <Button type="button" className="btn btn-primary-subtle border-primary-subtle me-2 mt-3">Submit</Button>
                                            </Form>
                                        </Card.Body>
                                    </Card>
                                </Tab.Pane>
                                {/* Other Tab.Panes go here */}
                                <Tab.Pane className="fade" eventKey="chang-pwd">
                                    <Card>
                                        <Card.Header className="d-flex justify-content-between">
                                            <Card.Header.Title>
                                                <h4 className="card-title">Change Password</h4>
                                            </Card.Header.Title>
                                        </Card.Header>
                                        <Card.Body className="cust-form-input">
                                            <Form>
                                                <Form.Group className="form-group">
                                                    <Form.Label htmlFor="cpass" className="mb-0">Current Password:</Form.Label>
                                                    <Link to="#" className="float-end">Forgot Password</Link>
                                                    <Form.Control type="password" className="form-control my-2" id="cpass" />
                                                </Form.Group>
                                                <Form.Group className="form-group">
                                                    <Form.Label htmlFor="npass" className="mb-0">New Password:</Form.Label>
                                                    <Form.Control type="password" className="form-control my-2" id="npass" />
                                                </Form.Group>
                                                <Form.Group className="form-group">
                                                    <Form.Label htmlFor="vpass" className="mb-0">Verify Password:</Form.Label>
                                                    <Form.Control type="password" className="form-control my-2" id="vpass" />
                                                </Form.Group>
                                                <Button type="reset" className="btn btn-danger-subtle  border-danger-subtle">Cancel</Button>{" "}
                                                <Button type="submit" className="btn btn-primary-subtle me-2  border-primary-subtle">Submit</Button>
                                            </Form>
                                        </Card.Body>
                                    </Card>
                                </Tab.Pane>
                                <Tab.Pane className="fade" eventKey="emailandsms">
                                    <Card>
                                        <Card.Header className="d-flex justify-content-between">
                                            <Card.Header.Title>
                                                <h4 className="card-title">Email and SMS</h4>
                                            </Card.Header.Title>
                                        </Card.Header>
                                        <Card.Body className="cust-form-input">
                                            <Form>
                                                <Form.Group className="form-group">
                                                    <Row className="align-items-center">
                                                        <Col md={3}>
                                                            <Form.Label htmlFor="emailnotification" className="mb-0">Email Notification:</Form.Label>
                                                        </Col>
                                                        <Col md={9}>
                                                            <Form.Check className="form-check form-switch">
                                                                <Form.Check.Input type="checkbox" className="form-check-input" id="flexSwitchCheckDefault" defaultChecked />
                                                                <Form.Check.Label className="form-check-label mb-0" htmlFor="emailnotification"></Form.Check.Label>
                                                            </Form.Check>
                                                        </Col>
                                                    </Row>
                                                </Form.Group>
                                                <Form.Group className="form-group">
                                                    <Row className="align-items-center">
                                                        <Col md={3}>
                                                            <Form.Label htmlFor="smsnotification" className="mb-0">SMS Notification:</Form.Label>
                                                        </Col>
                                                        <Col md={9}>
                                                            <Form.Check className="form-check form-switch">
                                                                <Form.Check.Input type="checkbox" className="form-check-input" id="flexSwitchCheckChecked" defaultChecked />
                                                                <Form.Check.Label className="form-check-label mb-0" htmlFor="flexSwitchCheckChecked"></Form.Check.Label>
                                                            </Form.Check>
                                                        </Col>
                                                    </Row>
                                                </Form.Group>
                                                <Form.Group className="form-group">
                                                    <Row className="align-items-center">
                                                        <Col md={3} className="col-md-3">
                                                            <label htmlFor="npass">When To Email</label>
                                                        </Col>
                                                        <Col md={9} className="col-md-9">
                                                            <div className="custom-control custom-checkbox">
                                                                <input type="checkbox" className="custom-control-input" id="email01" />{" "}
                                                                <Form.Check.Label className="custom-control-label" htmlFor="email01">You have new
                                                                    notifications.</Form.Check.Label>
                                                            </div>
                                                            <div className="custom-control custom-checkbox">
                                                                <input type="checkbox" className="custom-control-input" id="email02" />{" "}
                                                                <label className="custom-control-label" htmlFor="email02">You&apos;re sent a
                                                                    direct message</label>
                                                            </div>
                                                            <div className="custom-control custom-checkbox">
                                                                <input type="checkbox" className="custom-control-input" id="email03"
                                                                    defaultChecked />{" "}
                                                                <label className="custom-control-label" htmlFor="email03">Someone adds you
                                                                    as a connection</label>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Form.Group>
                                                <Form.Group className="form-group">
                                                    <Row className="align-items-center">
                                                        <Col md={3} className="col-md-3">
                                                            <label htmlFor="npass">When To Escalate Emails</label>
                                                        </Col>
                                                        <Col md={9} className="col-md-9">
                                                            <div className="custom-control custom-checkbox">
                                                                <input type="checkbox" className="custom-control-input" id="email04" />{" "}
                                                                <label className="custom-control-label" htmlFor="email04"> Upon new
                                                                    order.</label>
                                                            </div>
                                                            <div className="custom-control custom-checkbox">
                                                                <input type="checkbox" className="custom-control-input" id="email05" />{" "}
                                                                <label className="custom-control-label" htmlFor="email05"> New membership
                                                                    approval</label>
                                                            </div>
                                                            <div className="custom-control custom-checkbox">
                                                                <input type="checkbox" className="custom-control-input" id="email06"
                                                                    defaultChecked />{" "}
                                                                <label className="custom-control-label" htmlFor="email06"> Member
                                                                    registration</label>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Form.Group>
                                                <Button type="reset" className="btn btn-danger-subtle border-danger-subtle">Cancel</Button>{" "}
                                                <Button type="submit" className="btn btn-primary-subtle me-2 border-primary-subtle">Submit</Button>
                                            </Form>
                                        </Card.Body>
                                    </Card>
                                </Tab.Pane>
                                <Tab.Pane className="fade" eventKey="manage-contact">
                                    <Card>
                                        <Card.Header className="d-flex justify-content-between">
                                            <Card.Header.Title>
                                                <h4 className="card-title">Manage Contact</h4>
                                            </Card.Header.Title>
                                        </Card.Header>
                                        <div className="card-body cust-form-input">
                                            <Form>
                                                <Form.Group className="form-group">
                                                    <Form.Label htmlFor="cno" className="mb-0">Contact Number:</Form.Label>
                                                    <Form.Control type="text" className="form-control my-2" id="cno" defaultValue="001 2536 123 458" />
                                                </Form.Group>
                                                <Form.Group className="form-group">
                                                    <Form.Label htmlFor="email" className="mb-0">Email:</Form.Label>
                                                    <Form.Control type="text" className="form-control my-2" id="email" defaultValue="Binijone@demo.com" />
                                                </Form.Group>
                                                <Form.Group className="form-group">
                                                    <Form.Label htmlFor="url" className="mb-0">Url:</Form.Label>
                                                    <Form.Control type="text" className="form-control my-2" id="url"
                                                        defaultValue="https://getbootstrap.com" />
                                                </Form.Group>
                                                <Button type="reset" className="btn btn-danger-subtle border-danger-subtle">Cancel</Button>{" "}
                                                <Button type="submit" className="btn btn-primary-subtle me-2 border-primary-subtle">Submit</Button>
                                            </Form>
                                        </div>
                                    </Card>
                                </Tab.Pane>
                            </Tab.Content>
                        </div>
                    </Col>

                </Tab.Container>
            </Row>
        </>
    )
}

export default EditDoctor
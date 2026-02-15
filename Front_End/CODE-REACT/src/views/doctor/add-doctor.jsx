import React from "react";
import Card from "../../components/Card";
import { Button, Col, Container, Form, Row } from "react-bootstrap";

//Images
import img11 from "/assets/images/user/11.png"

const AddDoctor = () => {
    return (
        <>
            <Row>
                <Col lg={3}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <Card.Header.Title>
                                <h4 className="card-title">Add User</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Form.Group className="form-group">
                                    <Container className="d-flex flex-column align-items-center py-5">
                                        <div className="text-center">
                                            <img className="profile-pic img-fluid rounded-circle mb-3" src={img11} alt="profile-pic" style={{ width: "150px", height: "150px", objectFit: "cover" }} />
                                            <div>
                                                <Button type="button" className="btn btn-primary rounded-1" onClick={() => document.getElementById('file-upload').click()}>Profile Upload</Button>
                                                <input id="file-upload" className="d-none" type="file" accept="image/*" />
                                            </div>
                                        </div>
                                        <div className="mt-3 text-center">
                                            <span>Only</span>{" "}
                                            <a href="#" className="text-primary">.jpg</a>{" "}
                                            <a href="#" className="text-primary">.png</a>{" "}
                                            <a href="#" className="text-primary">.jpeg</a>{" "}
                                            <span>allowed</span>
                                        </div>
                                    </Container>
                                </Form.Group>
                                <Form.Group className="form-group cust-form-input">
                                    <Form.Label className="mb-0">User Role:</Form.Label>
                                    <select className="form-control my-2" id="selectuserrole">
                                        <option>Select</option>
                                        <option>Surgery</option>
                                        <option>Gastroenterologist</option>
                                        <option>Endocrinologist</option>
                                        <option>Orthopaedic surgeon</option>
                                        <option>Cardiologist </option>
                                    </select>
                                </Form.Group>
                                <Form.Group className="form-group cust-form-input">
                                    <Form.Label htmlFor="furl" className="mb-0">Facebook Url:</Form.Label>
                                    <Form.Control type="text" className="my-2" id="furl" placeholder="Facebook Url" />
                                </Form.Group>
                                <Form.Group className="form-group cust-form-input">
                                    <Form.Label htmlFor="turl" className="mb-0">Twitter Url:</Form.Label>
                                    <Form.Control type="text" className="form-control my-2" id="turl" placeholder="Twitter Url" />
                                </Form.Group>
                                <Form.Group className="form-group cust-form-input">
                                    <Form.Label htmlFor="instaurl" className="mb-0" >Instagram Url:</Form.Label>
                                    <Form.Control type="text" className="form-control my-2" id="instaurl" placeholder="Instagram Url" />
                                </Form.Group>
                                <Form.Group className="form-group cust-form-input">
                                    <Form.Label htmlFor="lurl" className="mb-0" >Linkedin Url:</Form.Label>
                                    <Form.Control type="text" className="form-control my-2" id="lurl" placeholder="Linkedin Url" />
                                </Form.Group>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={9}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <Card.Header.Title>
                                <h4 className="card-title">New User Information</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <div className="new-user-info">
                                <Form>
                                    <Row className="cust-form-input">
                                        <Col md={6} className="form-group">
                                            <Form.Label htmlFor="fname" className="mb-0">First Name:</Form.Label>
                                            <Form.Control type="text" className="my-2" id="fname" placeholder="First Name" />
                                        </Col>
                                        <Col md={6} className="form-group">
                                            <Form.Label htmlFor="lname" className="mb-0">Last Name:</Form.Label>
                                            <Form.Control type="text" className="my-2" id="lname" placeholder="Last Name" />
                                        </Col>
                                        <Col md={6} className="form-group">
                                            <Form.Label htmlFor="add1" className="mb-0">Street Address 1:</Form.Label>
                                            <Form.Control type="text" className="my-2" id="add1" placeholder="Street Address 1" />
                                        </Col>
                                        <Col md={6} className="form-group">
                                            <Form.Label htmlFor="add2" className="mb-0">Street Address 2:</Form.Label>
                                            <Form.Control type="text" className="my-2" id="add2" placeholder="Street Address 2" />
                                        </Col>
                                        <Col sm={12} className="form-group">
                                            <Form.Label htmlFor="cname" className="mb-0">Department Name:</Form.Label>
                                            <Form.Control type="text" className="my-2" id="cname" placeholder="Department Name" />
                                        </Col>
                                        <Col sm={12} className="form-group">
                                            <Form.Label className="mb-0">Country:</Form.Label>
                                            <select className="form-control my-2" id="selectcountry">
                                                <option>Select Country</option>
                                                <option>Caneda</option>
                                                <option>Noida</option>
                                                <option>USA</option>
                                                <option>India</option>
                                                <option>Africa</option>
                                            </select>
                                        </Col>
                                        <Col md={6} className="form-group">
                                            <Form.Label htmlFor="mobno" className="mb-0">Mobile Number:</Form.Label>
                                            <Form.Control type="text" className="my-2" id="mobno" placeholder="Mobile Number" />
                                        </Col>
                                        <Col md={6} className="form-group">
                                            <Form.Label htmlFor="altconno" className="mb-0">Alternate Contact:</Form.Label>
                                            <Form.Control type="text" className="my-2" id="altconno"
                                                placeholder="Alternate Contact" />
                                        </Col>
                                        <Col md={6} className="form-group">
                                            <Form.Label htmlFor="email" className="mb-0">Email:</Form.Label>
                                            <Form.Control type="email" className="my-2" id="email" placeholder="Email" />
                                        </Col>
                                        <Col md={6} className="form-group">
                                            <Form.Label htmlFor="pno" className="mb-0">Pin Code:</Form.Label>
                                            <Form.Control type="text" className="my-2" id="pno" placeholder="Pin Code" />
                                        </Col>
                                        <Col md={6} className="form-group">
                                            <Form.Label htmlFor="city" className="mb-0">Town/City:</Form.Label>
                                            <Form.Control type="text" className="my-2" id="city" placeholder="Town/City" />
                                        </Col>
                                    </Row>
                                    <hr />
                                    <h5 className="mb-3">Security</h5>
                                    <Row className="cust-form-input">
                                        <Col md={12} className="form-group">
                                            <Form.Label htmlFor="uname" className="mb-0">User Name:</Form.Label>
                                            <Form.Control type="text" className="form-control my-2" id="uname" placeholder="User Name" />
                                        </Col>
                                        <Col md={6} className="form-group">
                                            <Form.Label htmlFor="pass" className="mb-0">Password:</Form.Label>
                                            <Form.Control type="password" className="form-control my-2" id="pass" placeholder="Password" />
                                        </Col>
                                        <Col md={6} className="form-group">
                                            <Form.Label htmlFor="rpass" className="mb-0">Repeat Password:</Form.Label>
                                            <Form.Control type="password" className="form-control my-2" id="rpass"
                                                placeholder="Repeat Password " />
                                        </Col>
                                    </Row>
                                    <div className="custom-control custom-checkbox mb-4 p-0 d-flex justity-content-center gap-1">
                                        <input type="checkbox" className="custom-control-input me-1" id="customCheck1" />
                                        <label className="custom-control-label" htmlFor="customCheck1">Enable
                                            Two-Factor-Authentication</label>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button type="submit" className="btn btn-danger-subtle">Cancel</button>
                                        <button type="submit" className="btn btn-primary-subtle">Save</button>
                                    </div>
                                </Form>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default AddDoctor
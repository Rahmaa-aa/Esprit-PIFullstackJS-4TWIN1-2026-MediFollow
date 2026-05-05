import React, { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import Card from "../../components/Card";

import successImg from "/assets/images/page-img/img-success.png"


const SimpalWizard = () => {
    const [currentTab, setCurrentTab] = useState(0);
    const tabs = [
        {
            name: "Account", icon: (
                <svg className="icon-20 svg-icon" width="20" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path opacity="0.4"
                        d="M8.23918 8.70907V7.36726C8.24934 5.37044 9.92597 3.73939 11.9989 3.73939C13.5841 3.73939 15.0067 4.72339 15.5249 6.19541C15.6976 6.65262 16.2057 6.89017 16.663 6.73213C16.8865 6.66156 17.0694 6.50253 17.171 6.29381C17.2727 6.08508 17.293 5.84654 17.2117 5.62787C16.4394 3.46208 14.3462 2 11.9786 2C8.95048 2 6.48126 4.41626 6.46094 7.38714V8.91084L8.23918 8.70907Z"
                        fill="currentColor"></path>
                    <path fillRule="evenodd" clipRule="evenodd"
                        d="M7.7688 8.71118H16.2312C18.5886 8.71118 20.5 10.5808 20.5 12.8867V17.8246C20.5 20.1305 18.5886 22.0001 16.2312 22.0001H7.7688C5.41136 22.0001 3.5 20.1305 3.5 17.8246V12.8867C3.5 10.5808 5.41136 8.71118 7.7688 8.71118ZM11.9949 17.3286C12.4928 17.3286 12.8891 16.941 12.8891 16.454V14.2474C12.8891 13.7703 12.4928 13.3827 11.9949 13.3827C11.5072 13.3827 11.1109 13.7703 11.1109 14.2474V16.454C11.1109 16.941 11.5072 17.3286 11.9949 17.3286Z"
                        fill="currentColor"></path>
                </svg>
            )
        },
        {
            name: "Personal", icon: (
                <svg className="icon-20" width="20" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M11.997 15.1746C7.684 15.1746 4 15.8546 4 18.5746C4 21.2956 7.661 21.9996 11.997 21.9996C16.31 21.9996 19.994 21.3206 19.994 18.5996C19.994 15.8786 16.334 15.1746 11.997 15.1746Z"
                        fill="currentColor"></path>
                    <path opacity="0.4"
                        d="M11.9971 12.5838C14.9351 12.5838 17.2891 10.2288 17.2891 7.29176C17.2891 4.35476 14.9351 1.99976 11.9971 1.99976C9.06008 1.99976 6.70508 4.35476 6.70508 7.29176C6.70508 10.2288 9.06008 12.5838 11.9971 12.5838Z"
                        fill="currentColor"></path>
                </svg>
            )
        },
        {
            name: "Image", icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="icon-20" width="20"
                    viewBox="0 0 24 24" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd"
                        d="M16.71 10.0721C16.71 10.5716 17.11 10.9711 17.61 10.9711C18.11 10.9711 18.52 10.5716 18.52 10.0721C18.52 9.57269 18.11 9.16315 17.61 9.16315C17.11 9.16315 16.71 9.57269 16.71 10.0721ZM14.77 16.1054C14.06 16.8146 13.08 17.2542 12 17.2542C10.95 17.2542 9.97 16.8446 9.22 16.1054C8.48 15.3563 8.07 14.3774 8.07 13.3285C8.06 12.2897 8.47 11.3108 9.21 10.5616C9.96 9.81243 10.95 9.40288 12 9.40288C13.05 9.40288 14.04 9.81243 14.78 10.5516C15.52 11.3008 15.93 12.2897 15.93 13.3285C15.92 14.4173 15.48 15.3962 14.77 16.1054ZM12 10.9012C11.35 10.9012 10.74 11.1509 10.27 11.6204C9.81 12.0799 9.56 12.6892 9.57 13.3185V13.3285C9.57 13.9778 9.82 14.5871 10.28 15.0466C10.74 15.5061 11.35 15.7558 12 15.7558C13.34 15.7558 14.42 14.667 14.43 13.3285C14.43 12.6792 14.18 12.0699 13.72 11.6104C13.26 11.1509 12.65 10.9012 12 10.9012Z"
                        fill="currentColor" />
                    <path opacity="0.4"
                        d="M17.44 6.2364L17.34 6.01665C17.07 5.44728 16.76 4.78801 16.57 4.40844C16.11 3.50943 15.32 3.00999 14.35 3H9.64C8.67 3.00999 7.89 3.50943 7.43 4.40844C7.23 4.80799 6.89 5.52719 6.61 6.11654L6.55 6.2364C6.52 6.31632 6.44 6.35627 6.36 6.35627C3.95 6.35627 2 8.3141 2 10.7114V16.6448C2 19.0422 3.95 21 6.36 21H17.64C20.04 21 22 19.0422 22 16.6448V10.7114C22 8.3141 20.04 6.35627 17.64 6.35627C17.55 6.35627 17.48 6.30633 17.44 6.2364Z"
                        fill="currentColor" />
                </svg>
            )
        },
        {
            name: "Finish", icon: (
                <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M5 13l4 4L19 7" />
                </svg>
            )
        }
    ];



    const changeTab = (direction) => {
        if (currentTab + direction >= 0 && currentTab + direction < tabs.length) {
            setCurrentTab(currentTab + direction);
        }
    };

    const isActive = (index) => currentTab === index;
    const isDone = (index) => currentTab > index || currentTab === tabs.length - 1;

    return (
        <>
            <Row>
                <Col sm={12} lg={12}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <Card.Header.Title>
                                <h4 className="card-title">Simple Wizard</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <Form id="form-wizard1" className="mt-3 text-center iq-form-wizard">
                                <ul id="top-tab-list" className="p-0 row list-inline">
                                    {tabs.map((tab, index) => (
                                        <li key={index} className={`mb-2 col-lg-3 col-md-6 text-start ${isActive(index) ? 'active' : ''} ${isDone(index) ? 'active done' : ''}`}>
                                            <a href="#">
                                                <div className="iq-icon me-3">
                                                    {tab.icon}
                                                </div>{" "}
                                                <span className="dark-wizard">{tab.name}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>

                                {/* ----- Account Information ----- */}
                                {currentTab === 0 && (
                                    <fieldset>
                                        <div className="form-card text-start">
                                            <Row>
                                                <Col xs={7}>
                                                    <h3 className="mb-4">Account Information:</h3>
                                                </Col>
                                                <Col xs={5} className="text-end">
                                                    <h2 className="steps">Step 1 - 4</h2>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="form-group  cust-form-elements">
                                                        <Form.Label>Email: *</Form.Label>
                                                        <Form.Control type="email" name="email" placeholder="Email Id" />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="form-group  cust-form-elements">
                                                        <Form.Label>Username: *</Form.Label>
                                                        <Form.Control type="text" name="uname" placeholder="UserName" />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="form-group  cust-form-elements">
                                                        <Form.Label>Password: *</Form.Label>
                                                        <Form.Control type="password" name="pwd" placeholder="Password" />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="form-group  cust-form-elements">
                                                        <Form.Label>Confirm Password: *</Form.Label>
                                                        <Form.Control type="password" name="cpwd" placeholder="Confirm Password" />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Button name="next" className="btn btn-primary-subtle border-primary-subtle next action-button float-end"
                                                defaultValue="Next" onClick={() => changeTab(1)} disabled={currentTab === tabs.length - 1}>Next</Button>
                                        </div>
                                    </fieldset>
                                )}

                                {/* ----- Personal Informatio ----- */}
                                {currentTab === 1 && (
                                    <fieldset>
                                        <div className="form-card text-start">
                                            <Row>
                                                <Col xs={7}>
                                                    <h3 className="mb-4">Personal Information:</h3>
                                                </Col>
                                                <Col xs={5}>
                                                    <h2 className="steps text-end">Step 2 - 4</h2>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="form-group  cust-form-elements">
                                                        <Form.Label>First Name: *</Form.Label>
                                                        <Form.Control type="text" name="fname" placeholder="First Name" />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="form-group  cust-form-elements">
                                                        <Form.Label>Last Name: *</Form.Label>
                                                        <Form.Control type="text" name="lname" placeholder="Last Name" />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="form-group  cust-form-elements">
                                                        <Form.Label>Contact No.: *</Form.Label>
                                                        <Form.Control type="text" name="phno" placeholder="Contact No." />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="form-group  cust-form-elements">
                                                        <Form.Label>Alternate Contact No.: *</Form.Label>
                                                        <Form.Control type="text" name="phno_2" placeholder="Alternate Contact No." />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Button name="next" className="btn btn-primary-subtle border-primary-subtle next action-button float-end"
                                                defaultValue="Next" onClick={() => changeTab(1)} disabled={currentTab === tabs.length - 1}>Next</Button>
                                            <Button variant="dark" className="previous action-button-previous float-end me-1" onClick={() => changeTab(-1)} disabled={currentTab === 0}>Previous</Button>
                                        </div>
                                    </fieldset>
                                )}

                                {/* ----- Image Upload ----- */}
                                {currentTab === 2 && (
                                    <fieldset>
                                        <div className="form-card text-start">
                                            <Row>
                                                <Col xs={7}>
                                                    <h3 className="mb-4">Image Upload:</h3>
                                                </Col>
                                                <Col xs={5} className="text-end">
                                                    <h2 className="steps">Step 3 - 4</h2>
                                                </Col>
                                            </Row>
                                            <Form.Group className="form-group  cust-form-elements">
                                                <Form.Label>Upload Your Photo:</Form.Label>
                                                <Form.Control type="file" name="pic" accept="image/*" />
                                            </Form.Group>
                                            <Form.Group className="form-group  cust-form-elements">
                                                <Form.Label>Upload Signature Photo:</Form.Label>
                                                <Form.Control type="file" name="pic-2" accept="image/*" />
                                            </Form.Group>
                                            <Button type="button" name="next" className="btn btn-primary-subtle border-primary-subtle next action-button float-end"
                                                defaultValue="Next" onClick={() => changeTab(1)} disabled={currentTab === tabs.length - 1}>Submit</Button>
                                            <Button variant="dark" className="previous action-button-previous float-end me-1" onClick={() => changeTab(-1)} disabled={currentTab === 0}>Previous</Button>
                                        </div>
                                    </fieldset>
                                )}

                                {/* ----- Finish ----- */}
                                {currentTab === 3 && (
                                    <fieldset>
                                        <div className="form-card text-start">
                                            <Row>
                                                <Col xs={7}>
                                                    <h3 className="mb-4">Finish:</h3>
                                                </Col>
                                                <Col xs={5} className="text-end">
                                                    <h2 className="steps">Step 4 - 4</h2>
                                                </Col>
                                            </Row>
                                            <br /><br />
                                            <h2 className="text-center text-success"><strong>SUCCESS !</strong></h2>
                                            <br />
                                            <Row className="justify-content-center">
                                                <Col xs={3}><img src={successImg} className="img-fluid" alt="fit-image" loading="lazy" /></Col>
                                            </Row>
                                            <br /><br />
                                            <Row className="justify-content-center">
                                                <Col xs={7} md={7} className="text-center">
                                                    <h5 className="text-center purple-text">You Have Successfully Signed Up</h5>
                                                </Col>
                                            </Row>
                                        </div>
                                    </fieldset>
                                )}
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default SimpalWizard
import React, { useState } from "react";

// Import From React Bootstrap
import { Button, Col, Form, Nav, Row } from "react-bootstrap";

// Import Component
import Card from "../../components/Card";

// Import Image
import successImg from "/assets/images/page-img/img-success.png"

const ValidteWizard = () => {
    const [tabCurrentIndex, setTabCurrentIndex] = useState(1);
    const tabCount = 4;

    const tabTitles = [{ tabName: 'User Detail', id: "user-tab" }, { tabName: 'Document Detail', id: "document-tab" }, { tabName: 'Bank Detail', id: "bank-tab" }, { tabName: 'Confirm', id: "confirm-tab" }];
    const iconClasses = [
        'ri-lock-unlock-line text-white',
        'ri-user-fill text-danger bg-danger-subtle',
        'ri-camera-fill bg-success-subtle text-success',
        'ri-check-fill bg-warning-subtle text-warning'
    ];

    const next = () => {
        if (validateCurrentTab()) {
            setTabCurrentIndex((prev) => Math.min(tabCount, prev + 1));
        }
    };

    const previous = () => {
        setTabCurrentIndex((prev) => Math.max(1, prev - 1));
    };

    const validateCurrentTab = () => {
        const form = document.querySelector(`#nav-tabContent .tab-pane:nth-child(${tabCurrentIndex})`);
        if (form) {
            const inputs = form.querySelectorAll('input, textarea');
            const isValid = Array.from(inputs).every(input => input.checkValidity() && input.value !== "");

            if (isValid) {
                form.parentElement.parentElement.classList.remove('was-validated');
            } else {
                form.parentElement.parentElement.classList.add('was-validated');
            }

            return isValid;
        }
        return false;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateCurrentTab()) {
            // Handle form submission logic here
             
        }
    };
    return (
        <>
            <Row>
                <Col xs={12}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <Card.Header.Title>
                                <h4 className="card-title">Validate Wizard</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <Form className="form needs-validation iq-form-validate" noValidate onSubmit={handleSubmit}>
                                <nav>
                                    <Nav className="nav-pills nav-fill stepwizard-row mt-2" role="tablist">
                                        {tabTitles.map((title, index) => (
                                            <a key={index}
                                                id={`${title.id}`}
                                                className={`nav-link btn rounded-4 ${tabCurrentIndex === index + 1 ? 'active' : ''} ${index < tabCurrentIndex - 1 ? 'actives' : ''}`}>
                                                <i className={iconClasses[index]}></i>
                                                <span>{title.tabName}</span>
                                            </a>
                                        ))}
                                    </Nav>
                                </nav>
                                <div className="tab-content pt-4 pb-2" id="nav-tabContent">
                                    {/* ----- User Information Tab ----- */}
                                    <Row className={`tab-pane fade ${tabCurrentIndex === 1 ? 'show active' : ''}`} id="user-detail">
                                        <Col xs={12}>
                                            <h3 className="mb-4">User Information:</h3>
                                            <Row>
                                                <Form.Group as={Col} md={6} className="form-group">
                                                    <Form.Label>First Name</Form.Label>
                                                    <Form.Control required type="text" placeholder="Enter First Name" maxLength={100} className="bg-transparent" />
                                                </Form.Group>
                                                <Form.Group as={Col} md={6} className="form-group">
                                                    <Form.Label>Last Name</Form.Label>
                                                    <Form.Control required type="text" placeholder="Enter Last Name" maxLength={100} className="bg-transparent" />
                                                </Form.Group>
                                                <Form.Group as={Col} md={6} className="form-group">
                                                    <Form.Label>User Name: *</Form.Label>
                                                    <Form.Control required type="text" placeholder="Enter User Name" className="bg-transparent" />
                                                </Form.Group>
                                                <Form.Group as={Col} md={6} className="form-group">
                                                    <Form.Label>Email Id: *</Form.Label>
                                                    <Form.Control required type="email" placeholder="Email ID" className="bg-transparent" />
                                                </Form.Group>
                                                <Form.Group as={Col} md={6} className="form-group">
                                                    <Form.Label>Password: *</Form.Label>
                                                    <Form.Control required type="password" placeholder="Password" className="bg-transparent" />
                                                </Form.Group>
                                                <Form.Group as={Col} md={6} className="form-group">
                                                    <Form.Label>Confirm Password: *</Form.Label>
                                                    <Form.Control required type="password" placeholder="Confirm Password" className="bg-transparent" />
                                                </Form.Group>
                                                <Form.Group as={Col} md={6} className="form-group">
                                                    <Form.Label>Contact Number: *</Form.Label>
                                                    <Form.Control required type="text" placeholder="Contact Number" className="bg-transparent" />
                                                </Form.Group>
                                                <Form.Group as={Col} md={6} className="form-group">
                                                    <Form.Label>Alternate Contact Number: *</Form.Label>
                                                    <Form.Control required type="text" placeholder="Alternate Contact Number" className="bg-transparent" />
                                                </Form.Group>
                                                <Form.Group as={Col} md={12} className="form-group">
                                                    <Form.Label>Address: *</Form.Label>
                                                    <Form.Control required as="textarea" rows={5} className="bg-transparent" />
                                                </Form.Group>
                                            </Row>
                                        </Col>
                                    </Row>

                                    {/* ----- Document Details Tab ----- */}
                                    <Row className={`tab-pane fade ${tabCurrentIndex === 2 ? 'show active' : ''}`} id="document-detail">
                                        <Col xs={12}>
                                            <h3 className="mb-4">Document Details:</h3>
                                            <Row>
                                                <Form.Group as={Col} md={6} className="form-group">
                                                    <Form.Label>Company Name: *</Form.Label>
                                                    <Form.Control required type="text" placeholder="Company Name" className="bg-transparent" />
                                                </Form.Group>
                                                <Form.Group as={Col} md={6} className="form-group">
                                                    <Form.Label>Contact Number: *</Form.Label>
                                                    <Form.Control required type="text" placeholder="Contact Number" className="bg-transparent" />
                                                </Form.Group>
                                                <Form.Group as={Col} md={6} className="form-group">
                                                    <Form.Label>Company Url: *</Form.Label>
                                                    <Form.Control required type="text" placeholder="Company Url." className="bg-transparent" />
                                                </Form.Group>
                                                <Form.Group as={Col} md={6} className="form-group">
                                                    <Form.Label>Company Mail Id: *</Form.Label>
                                                    <Form.Control required type="email" placeholder="Company Mail Id." className="bg-transparent" />
                                                </Form.Group>
                                                <Form.Group as={Col} md={12} className="form-group">
                                                    <Form.Label>Company Address: *</Form.Label>
                                                    <Form.Control required as="textarea" rows={5} className="bg-transparent" />
                                                </Form.Group>
                                            </Row>
                                        </Col>
                                    </Row>

                                    {/* ----- Bank Detail Tab ----- */}
                                    <Row className={`tab-pane fade ${tabCurrentIndex === 3 ? 'show active' : ''}`} id="bank-detail">
                                        <Col xs={12}>
                                            <h3 className="mb-4">Bank Detail:</h3>
                                            <Row>
                                                <Form.Group as={Col} md={6} className="form-group">
                                                    <Form.Label>Pan No: *</Form.Label>
                                                    <Form.Control required type="text" placeholder="Pan No." className="bg-transparent" />
                                                </Form.Group>
                                                <Form.Group as={Col} md={6} className="form-group">
                                                    <Form.Label>Account No: *</Form.Label>
                                                    <Form.Control required type="text" placeholder="Account No." className="bg-transparent" />
                                                </Form.Group>
                                                <Form.Group as={Col} md={6} className="form-group">
                                                    <Form.Label>Account Holder Name: *</Form.Label>
                                                    <Form.Control required type="text" placeholder="Account Holder Name." className="bg-transparent" />
                                                </Form.Group>
                                                <Form.Group as={Col} md={6} className="form-group">
                                                    <Form.Label>IFSC Code: *</Form.Label>
                                                    <Form.Control required type="text" placeholder="IFSC Code." className="bg-transparent" />
                                                </Form.Group>
                                                <Form.Group as={Col} md={6} className="form-group">
                                                    <Form.Label>Bank Name: *</Form.Label>
                                                    <Form.Control required type="text" placeholder="Bank Name." className="bg-transparent" />
                                                </Form.Group>
                                                <Form.Group as={Col} md={6} className="form-group">
                                                    <Form.Label>Bank Branch Name: *</Form.Label>
                                                    <Form.Control required type="text" placeholder="Bank Branch Name." className="bg-transparent" />
                                                </Form.Group>
                                            </Row>
                                        </Col>
                                    </Row>

                                    {/* ----- Confirm Tab ----- */}
                                    <div className={`row tab-pane fade ${tabCurrentIndex === 4 ? 'show active' : ''}`} id="confirm-data">
                                        <Col xs={12}>
                                            <h3 className="mb-4 text-left">Finish:</h3>
                                            <Row className="justify-content-center">
                                                <Col xs={3}>
                                                    <img src={successImg} className="img-fluid" alt="img-success" loading="lazy" />
                                                </Col>
                                            </Row>
                                        </Col>
                                    </div>
                                </div>
                                <Row className="justify-content-between">
                                    <Col xs="auto">
                                        <Button type="button" className="btn btn-secondary-subtle border-secondary-subtle" onClick={previous} hidden={tabCurrentIndex === 1}>Previous</Button>
                                    </Col>
                                    <Col xs="auto">
                                        <Button type="button" className="btn btn-primary-subtle border-primary-subtle" onClick={next} hidden={tabCurrentIndex === tabCount}>Next</Button>
                                        <Button type="submit" className="btn btn-primary-subtle border-primary-subtle" hidden={tabCurrentIndex !== tabCount} onClick={() => window.location.reload()}>Finish</Button>
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

export default ValidteWizard
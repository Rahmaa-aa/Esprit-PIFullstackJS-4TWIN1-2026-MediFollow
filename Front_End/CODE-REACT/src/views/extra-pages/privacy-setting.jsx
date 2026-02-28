import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import Card from "../../components/Card";


const PrivacySetting = () => {
    return (
        <>
            <Row>
                <Col lg={12}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <Card.Header.Title>
                                <h4 className="card-title">Privacy Setting</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <div className="acc-privacy">
                                <div className="data-privacy">
                                    <h4 className="mb-2">Account Privacy</h4>
                                    <Form.Check>
                                        <Form.Check.Input type="checkbox" id="customCheck5" />{" "}
                                        <Form.Check.Label className="ps-2" for="customCheck5">Private Account</Form.Check.Label>
                                    </Form.Check>
                                    <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
                                        has been the industry's standard dummy text ever since the 1500s, when an unknown
                                        printer took a galley of type and scrambled it to make a type specimen book</p>
                                </div>
                                <hr />
                                <div className="data-privacy">
                                    <h4 className="mb-2">Activity Status</h4>
                                    <Form.Check>
                                        <Form.Check.Input type="checkbox" id="activety" />{" "}
                                        <Form.Check.Label className="ps-2" for="activety">Show Activity Status</Form.Check.Label>
                                    </Form.Check>
                                    <p>It is a long established fact that a reader will be distracted by the readable content of
                                        a page when looking at its layout. The point of using Lorem Ipsum is that it has a
                                        more-or-less normal distribution of letters, as opposed to using 'Content here, content
                                        here', making it look like readable English.</p>
                                </div>
                                <hr />
                                <div className="data-privacy">
                                    <h4 className="mb-2"> Story Sharing </h4>
                                    <Form.Check>
                                        <Form.Check.Input type="checkbox" id="story" />{" "}
                                        <Form.Check.Label className="ps-2" for="story">Allow Sharing</Form.Check.Label>
                                    </Form.Check>
                                    <p>It is a long established fact that a reader will be distracted by the readable content of
                                        a page when looking at its layout. The point of using Lorem Ipsum is that it has a
                                        more-or-less normal distribution of letters, as opposed to using 'Content here, content
                                        here', making it look like readable English.</p>
                                </div>
                                <hr />
                                <div className="data-privacy">
                                    <h4 className="mb-2"> Photo Of You </h4>
                                    <Form.Check>
                                        <Form.Check.Input type="radio" name="customRadio0" id="automatically" checked="" />{" "}
                                        <Form.Check.Label for="automatically" className="ps-2">Add Automatically</Form.Check.Label>
                                    </Form.Check>
                                    <Form.Check>
                                        <Form.Check.Input type="radio" name="customRadio0" id="manualy" />{" "}
                                        <Form.Check.Label for="manualy" className="ps-2">Add Manualy</Form.Check.Label>
                                    </Form.Check>
                                    <p>It is a long established fact that a reader will be distracted by the readable content of
                                        a page when looking at its layout. The point of using Lorem Ipsum is that it has a
                                        more-or-less normal distribution of letters, as opposed to using 'Content here, content
                                        here', making it look like readable English.</p>
                                </div>
                                <hr />
                                <div className="data-privacy">
                                    <h4 className="mb-2"> Your Profile </h4>
                                    <Form.Check>
                                        <Form.Check.Input type="radio" name="customRadio1" id="public" />{" "}
                                        <Form.Check.Label for="public" className="ps-2">Public</Form.Check.Label>
                                    </Form.Check>
                                    <Form.Check>
                                        <Form.Check.Input type="radio" name="customRadio1" id="friend" />{" "}
                                        <Form.Check.Label for="friend" className="ps-2">Friend</Form.Check.Label>
                                    </Form.Check>
                                    <Form.Check>
                                        <Form.Check.Input type="radio" name="customRadio1" id="spfriend" />{" "}
                                        <Form.Check.Label for="spfriend" className="ps-2">Specific Friend</Form.Check.Label>
                                    </Form.Check>
                                    <Form.Check>
                                        <Form.Check.Input type="radio" name="customRadio1" id="onlyme" />{" "}
                                        <Form.Check.Label for="onlyme" className="ps-2">Only Me</Form.Check.Label>
                                    </Form.Check>
                                    <p>It is a long established fact that a reader will be distracted by the readable content of
                                        a page when looking at its layout. The point of using Lorem Ipsum is that it has a
                                        more-or-less normal distribution of letters, as opposed to using 'Content here, content
                                        here', making it look like readable English.</p>
                                </div>
                                <hr />
                                <div className="data-privacy">
                                    <h4 className="mb-2"> Login Notification </h4>
                                    <Form.Check>
                                        <Form.Check.Input type="radio" name="customRadio2" id="enable" />{" "}
                                        <Form.Check.Label for="enable" className="ps-2">Enable</Form.Check.Label>
                                    </Form.Check>
                                    <Form.Check>
                                        <Form.Check.Input type="radio" name="customRadio2" id="disable" />{" "}
                                        <Form.Check.Label for="disable" className="ps-2">Disable</Form.Check.Label>
                                    </Form.Check>
                                    <p>It is a long established fact that a reader will be distracted by the readable content of
                                        a page when looking at its layout. The point of using Lorem Ipsum is that it has a
                                        more-or-less normal distribution of letters, as opposed to using 'Content here, content
                                        here', making it look like readable English.</p>
                                </div>
                                <hr />
                                <div className="data-privacy">
                                    <h4 className="mb-2">Privacy Help</h4>
                                    <a href="#"><i className="ri-customer-service-2-line me-2"></i>Support</a>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default PrivacySetting
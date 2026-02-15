import React from "react";
import { Card, Button, Row, Col } from 'react-bootstrap'; 
// Import Image
import img25 from "/assets/images/page-img/25.jpg"
import img26 from "/assets/images/page-img/26.jpg"
import img27 from "/assets/images/page-img/27.jpg"
import img28 from "/assets/images/page-img/28.jpg"

const PricingOne = () => {
    return (
        <>
            <Row>
                <Col lg={3} md={6}>
                    <Card className="text-center">
                        <Card.Body>
                            <span className="text-uppercase">Basic</span>
                            <h2 className="display-3 mb-4 fw-bolder">
                                $26<small className="text-muted fw-lighter fs-5">/ Month</small>
                            </h2>
                            <ul className="list-unstyled mb-0">
                                <li className="fs-5">Lorem ipsum dolor sit amet</li>
                                <li className="fs-5">Consectetur adipiscing elit</li>
                                <li className="fs-5">Integer molestie at massa</li>
                                <li className="fs-5">Facilisis in pretium nisl aliquet</li>
                                <li className="fs-5">Nulla volutpat aliquam velit</li>
                            </ul>
                            <Button variant="primary-subtle" className="mt-5">Start Starter</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="bg-primary text-white text-center">
                        <Card.Body>
                            <span className="text-uppercase">Basic</span>
                            <h2 className="display-3 mb-4 fw-bolder text-white">
                                $99<small className="fw-lighter fs-5">/ Month</small>
                            </h2>
                            <ul className="list-unstyled mb-0">
                                <li className="fs-5">Lorem ipsum dolor sit amet</li>
                                <li className="fs-5">Consectetur adipiscing elit</li>
                                <li className="fs-5">Integer molestie at massa</li>
                                <li className="fs-5">Facilisis in pretium nisl aliquet</li>
                                <li className="fs-5">Nulla volutpat aliquam velit</li>
                            </ul>
                            <Button variant="light" className="mt-5">Start Starter</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="text-center">
                        <Card.Body>
                            <span className="text-uppercase">Basic</span>
                            <h2 className="display-3 mb-4 fw-bolder">
                                $39<small className="text-muted fw-lighter fs-5">/ Month</small>
                            </h2>
                            <ul className="list-unstyled mb-0">
                                <li className="fs-5">Lorem ipsum dolor sit amet</li>
                                <li className="fs-5">Consectetur adipiscing elit</li>
                                <li className="fs-5">Integer molestie at massa</li>
                                <li className="fs-5">Facilisis in pretium nisl aliquet</li>
                                <li className="fs-5">Nulla volutpat aliquam velit</li>
                            </ul>
                            <Button variant="primary-subtle" className="mt-5">Start Starter</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="text-center">
                        <Card.Body>
                            <span className="text-uppercase">Basic</span>
                            <h2 className="display-3 mb-4 fw-bolder">
                                $25<small className="text-muted fw-lighter fs-5">/ Month</small>
                            </h2>
                            <ul className="list-unstyled mb-0">
                                <li className="fs-5">Lorem ipsum dolor sit amet</li>
                                <li className="fs-5">Consectetur adipiscing elit</li>
                                <li className="fs-5">Integer molestie at massa</li>
                                <li className="fs-5">Facilisis in pretium nisl aliquet</li>
                                <li className="fs-5">Nulla volutpat aliquam velit</li>
                            </ul>
                            <Button variant="primary-subtle" className="mt-5">Start Starter</Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col lg={3} md={6}>
                    <Card className="bg-dark text-white text-center rounded-3">
                        <Card.Img src={img25} alt="#" className="rounded-3" />
                        <Card.ImgOverlay>
                            <h2 className="mb-4 display-3 fw-bolder text-white">
                                19<small className="fs-5 text-white">$ / Month</small>
                            </h2>
                            <ul className="list-unstyled mb-0 ">
                                <li className="fs-5">Lorem ipsum dolor sit amet</li>
                                <li className="fs-5">Consectetur adipiscing elit</li>
                                <li className="fs-5">Integer molestie at massa</li>
                                <li className="fs-5">Facilisis in pretium nisl aliquet</li>
                                <li className="fs-5">Nulla volutpat aliquam velit</li>
                            </ul>
                            <button type="button" className="btn btn-primary-subtle mt-4">Get started</button>
                        </Card.ImgOverlay>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="bg-dark text-white text-center rounded-3">
                        <Card.Img src={img26} alt="#" className="rounded-3" />
                        <Card.ImgOverlay>
                            <h2 className="mb-4 display-3 fw-bolder text-white">
                                19<small className="fs-5 text-white">$ / Month</small>
                            </h2>
                            <ul className="list-unstyled mb-0 ">
                                <li className="fs-5">Lorem ipsum dolor sit amet</li>
                                <li className="fs-5">Consectetur adipiscing elit</li>
                                <li className="fs-5">Integer molestie at massa</li>
                                <li className="fs-5">Facilisis in pretium nisl aliquet</li>
                                <li className="fs-5">Nulla volutpat aliquam velit</li>
                            </ul>
                            <button type="button" className="btn btn-primary-subtle mt-4">Get started</button>
                        </Card.ImgOverlay>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="bg-dark text-white text-center rounded-3">
                        <Card.Img src={img27} alt="#" className="rounded-3" />
                        <Card.ImgOverlay>
                            <h2 className="mb-4 display-3 fw-bolder text-white">
                                19<small className="fs-5 text-white">$ / Month</small>
                            </h2>
                            <ul className="list-unstyled mb-0 ">
                                <li className="fs-5">Lorem ipsum dolor sit amet</li>
                                <li className="fs-5">Consectetur adipiscing elit</li>
                                <li className="fs-5">Integer molestie at massa</li>
                                <li className="fs-5">Facilisis in pretium nisl aliquet</li>
                                <li className="fs-5">Nulla volutpat aliquam velit</li>
                            </ul>
                            <button type="button" className="btn btn-primary-subtle mt-4">Get started</button>
                        </Card.ImgOverlay>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="bg-dark text-white text-center rounded-3">
                        <Card.Img src={img28} alt="#" className="rounded-3" />
                        <Card.ImgOverlay>
                            <h2 className="mb-4 display-3 fw-bolder text-white">
                                19<small className="fs-5 text-white">$ / Month</small>
                            </h2>
                            <ul className="list-unstyled mb-0 ">
                                <li className="fs-5">Lorem ipsum dolor sit amet</li>
                                <li className="fs-5">Consectetur adipiscing elit</li>
                                <li className="fs-5">Integer molestie at massa</li>
                                <li className="fs-5">Facilisis in pretium nisl aliquet</li>
                                <li className="fs-5">Nulla volutpat aliquam velit</li>
                            </ul>
                            <button type="button" className="btn btn-primary-subtle mt-4">Get started</button>
                        </Card.ImgOverlay>
                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default PricingOne
import React from "react";
import { generatePath, Link, useNavigate } from "react-router-dom";
import { Carousel, Container, Row, Col } from 'react-bootstrap';

// Import Image
import logowhite from "/assets/images/logo-white.png"
import maillogo from "/assets/images/login/mail.png"
import login1 from "/assets/images/login/1.png"
import login2 from "/assets/images/login/2.png"
import login3 from "/assets/images/login/3.png"

const ConformMail = () => {
    const navigate = useNavigate()
    return (
        <>
            <section className="sign-in-page d-md-flex align-items-center custom-auth-height">
                <Container className="sign-in-page-bg mt-5 mb-md-5 mb-0 p-0">
                    <Row>
                        <Col md={6} className="text-center z-2">
                            <div className="sign-in-detail text-white">
                                <Link to="/" className="sign-in-logo mb-2">
                                    <img src={logowhite} className="img-fluid" />
                                </Link>
                                <Carousel id="carouselExampleCaptions" interval={2000} controls={false}>
                                    <Carousel.Item>
                                        <img src={login1} className="d-block w-100" alt="Slide 1" />
                                        <div className="carousel-caption-container">
                                            <h4 className="mb-1 mt-1 text-white">Manage your orders</h4>
                                            <p className="pb-5">It is a long established fact that a reader will be distracted by the readable content.</p>
                                        </div>
                                    </Carousel.Item>
                                    <Carousel.Item>
                                        <img src={login2} className="d-block w-100" alt="Slide 2" />
                                        <div className="carousel-caption-container">
                                            <h4 className="mb-1 mt-1 text-white">Manage your orders</h4>
                                            <p className="pb-5">It is a long established fact that a reader will be distracted by the readable content.</p>
                                        </div>
                                    </Carousel.Item>
                                    <Carousel.Item>
                                        <img src={login3} className="d-block w-100" alt="Slide 3" />
                                        <div className="carousel-caption-container">
                                            <h4 className="mb-1 mt-1 text-white">Manage your orders</h4>
                                            <p className="pb-5">It is a long established fact that a reader will be distracted by the readable content.</p>
                                        </div>
                                    </Carousel.Item>
                                </Carousel>
                            </div>
                        </Col>
                        <Col md={6} className="position-relative z-2">
                            <div className="sign-in-from d-flex flex-column justify-content-center">
                                <img src={maillogo} width="80" />
                                <h1 className="mt-3 mb-0">Success !</h1>
                                <p>A email has been send to youremail@domain.com. Please check for an email from company and click on the
                                    included link to reset your password.</p>
                                <div className="d-inline-block w-100">
                                    <button className="btn btn-primary-subtle mt-3" onClick={() => navigate("/")}>Back to Home</button>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </>
    )
}

export default ConformMail
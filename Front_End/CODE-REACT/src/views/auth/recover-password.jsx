import React from "react";
import { Link } from "react-router-dom";
import { Carousel, Container, Row, Col, Form } from 'react-bootstrap';

// Import Image
import logowhite from "/assets/images/logo-white.png"
import login1 from "/assets/images/login/1.png"
import login2 from "/assets/images/login/2.png"
import login3 from "/assets/images/login/3.png"


const RecoverPassword = () => {
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
                                </Carousel>                        </div>
                        </Col>
                        <Col md={6} className="position-relative z-2">
                            <div className="sign-in-from d-flex flex-column justify-content-center">
                                <h1 className="mb-0">Reset Password</h1>
                                <p>Enter your email address and we&apos;ll send you an email with instructions to reset your password.</p>
                                <Form className="mt-4">
                                    <Form.Group className="form-group" controlId="exampleInputEmail1">
                                        <Form.Label className="mb-2">Email Address</Form.Label>
                                        <Form.Control type="email" placeholder="Enter email" />
                                    </Form.Group>

                                    <div className="d-flex gap-2 justify-content-end">
                                        <button type="submit" className="btn btn-primary-subtle  mt-3">Cancel</button>
                                        <button type="submit" className="btn btn-primary-subtle  mt-3">Reset Password</button>
                                    </div>
                                </Form>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </>
    )
}

export default RecoverPassword
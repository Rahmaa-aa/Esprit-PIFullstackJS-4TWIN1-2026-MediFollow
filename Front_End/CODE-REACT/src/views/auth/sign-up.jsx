import React from "react";
import { Carousel, Form, Container, Row, Col } from 'react-bootstrap';
import { Link } from "react-router-dom";

const generatePath = (path) => {
  return window.origin + import.meta.env.BASE_URL + path;
};

const SignUp = () => {
  return (
    <>
      <section className="sign-in-page d-md-flex align-items-center custom-auth-height">
        <Container className="sign-in-page-bg mt-5 mb-md-5 mb-0 p-0">
          <Row>
            <Col md={6} className="text-center z-2">
              <div className="sign-in-detail text-white">
                <Link to="/" className="sign-in-logo mb-2">
                  <img src={generatePath("/assets/images/logo-white.png")} className="img-fluid" alt="Logo" />
                </Link>
                <Carousel id="carouselExampleCaptions" interval={2000} controls={false}>
                  <Carousel.Item>
                    <img src={generatePath("/assets/images/login/1.png")} className="d-block w-100" alt="Slide 1" />
                    <div className="carousel-caption-container">
                      <h4 className="mb-1 mt-1 text-white">Manage your orders</h4>
                      <p className="pb-5">It is a long established fact that a reader will be distracted by the readable content.</p>
                    </div>
                  </Carousel.Item>
                  <Carousel.Item>
                    <img src={generatePath("/assets/images/login/2.png")} className="d-block w-100" alt="Slide 2" />
                    <div className="carousel-caption-container">
                      <h4 className="mb-1 mt-1 text-white">Manage your orders</h4>
                      <p className="pb-5">It is a long established fact that a reader will be distracted by the readable content.</p>
                    </div>
                  </Carousel.Item>
                  <Carousel.Item>
                    <img src={generatePath("/assets/images/login/3.png")} className="d-block w-100" alt="Slide 3" />
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
                <h1 className="mb-0">Sign Up</h1>
                <Form className="mt-4">
                  <Form.Group className="form-group" controlId="formFullName">
                    <label>Your Full Name</label>
                    <Form.Control type="text" placeholder="Your Full Name" />
                  </Form.Group>
                  <Form.Group className="form-group" controlId="formEmail">
                    <label>Email address</label>
                    <Form.Control type="email" placeholder="Enter email" />
                  </Form.Group>
                  <Form.Group className="form-group" controlId="formPassword">
                    <label>Password</label>
                    <Form.Control type="password" placeholder="Password" />
                  </Form.Group>
                  <div className="d-flex justify-content-between w-100 align-items-center">
                    <label className="d-inline-block form-group mb-0 d-flex">
                      <input
                        type="checkbox"
                        id="customCheck1"
                        className="custom-control-input"
                      />{" "}
                      <label className="custom-control-label me-1" htmlFor="customCheck1"></label> I accept <Link className="ms-1" to="/extra-pages/terms-of-use"> Terms and Conditions</Link>
                    </label>
                    <button type="submit" className="btn btn-primary-subtle float-end">Sign Up</button>
                  </div>
                  <div className="sign-info d-flex justify-content-between flex-column flex-lg-row align-items-center">
                    <span className="dark-color d-inline-block line-height-2">
                      Already Have Account ? <Link to="/auth/sign-in">Sign In</Link>
                    </span>
                    <ul className="auth-social-media d-flex list-unstyled">
                      <li><a href="#facebook"><i className="ri-facebook-box-line"></i></a></li>
                      <li><a href="#twitter"><i className="ri-twitter-line"></i></a></li>
                      <li><a href="#instagram"><i className="ri-instagram-line"></i></a></li>
                    </ul>
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

export default SignUp
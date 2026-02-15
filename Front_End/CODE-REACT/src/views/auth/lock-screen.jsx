import React from "react";
import { Carousel, Container, Row, Col, Form } from 'react-bootstrap';
import { Link } from "react-router-dom";

// Import Image
import logowhite from "/assets/images/logo-white.png"
import login1 from "/assets/images/login/1.png"
import login2 from "/assets/images/login/2.png"
import login3 from "/assets/images/login/3.png"
import user1 from "/assets/images/user/1.jpg"

const LockScreen = () => {
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
                        <Carousel id="carouselExampleCaptions" interval={2000}>
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
                        <img
                           src={user1}
                           alt="user-image"
                           width="25%"
                           className="rounded-circle"
                        />
                        <h4 className="mt-3 mb-0">Hi ! Michael Smith</h4>
                        <p>Enter your password to access the admin.</p>
                        <Form className="mt-0">
                           <Form.Group className="form-group mb-3" controlId="password">
                              <Form.Label className="mb-2">Password</Form.Label>
                              <Form.Control
                                 type="password"
                                 className="mb-0 border"
                                 placeholder="Password"
                              />
                           </Form.Group>
                           <div className="d-inline-block w-100">
                              <button type="submit" className="btn btn-primary-subtle float-end mt-3">Log In</button>
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

export default LockScreen
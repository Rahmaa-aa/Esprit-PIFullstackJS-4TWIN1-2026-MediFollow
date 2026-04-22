import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Form } from "react-bootstrap";
import { generatePath } from "../landing/landingPaths";
import AuthCarouselMedifollow from "../../components/auth/AuthCarouselMedifollow";

const RecoverPassword = () => {
  return (
    <>
      <section className="sign-in-page d-md-flex align-items-center custom-auth-height">
        <Container className="sign-in-page-bg mt-5 mb-md-5 mb-0 p-0">
          <Row>
            <Col md={6} className="text-center z-2">
              <div className="sign-in-detail text-white">
                <Link to="/" className="sign-in-logo mb-2">
                  <img src={generatePath("assets/images/logosite.png")} className="img-fluid" alt="MediFollow" style={{ maxWidth: "320px", maxHeight: "100px", objectFit: "contain" }} />
                </Link>
                <AuthCarouselMedifollow
                  interval={2000}
                  captionKeys={{ titleKey: "signIn.carouselTitle", descKey: "signIn.carouselDesc" }}
                />
              </div>
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
                    <button type="submit" className="btn btn-primary-subtle  mt-3">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary-subtle  mt-3">
                      Reset Password
                    </button>
                  </div>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default RecoverPassword;

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { generatePath } from "../landing/landingPaths";
import AuthCarouselMedifollow from "../../components/auth/AuthCarouselMedifollow";

import maillogo from "/assets/images/login/mail.png";

const ConformMail = () => {
  const navigate = useNavigate();
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
                <img src={maillogo} width="80" alt="" />
                <h1 className="mt-3 mb-0">Success !</h1>
                <p>
                  A email has been send to youremail@domain.com. Please check for an email from company and click on the included link to reset your
                  password.
                </p>
                <div className="d-inline-block w-100">
                  <button type="button" className="btn btn-primary-subtle mt-3" onClick={() => navigate("/")}>
                    Back to Home
                  </button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default ConformMail;

import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

const Error500 = () => {
  return (
    <>
      <Container fluid className="p-0" 
      style={{ overflow: "hidden", height: "100vh", margin: 0}}>
        <Row className=" vh-100 d-flex justify-content-center" >
          <Col className="text-center align-self-center">
            <div className="error position-relative">
              <h1 className="text-primary" style={{ fontSize: "185px", fontWeight: "bold" }}>
                500
              </h1>
              <h2 className="mb-0">Oops! This Page is Not Found.</h2>
              <p className="fs-5">The requested page does not exist.</p>
              <Link className="btn btn-primary-subtle mt-3" to="/">
                <div className="d-flex align-items-center"><i className="ri-home-4-line me-2"></i>
                  <p className="mb-0">Back to Home</p>
                </div>
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default Error500
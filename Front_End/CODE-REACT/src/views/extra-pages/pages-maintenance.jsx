import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import Card from "../../components/Card";

// Import Image
import img02 from "/assets/images/error/02.png"

const Maintenance = () => {
  return (
    <>
      <div className="pt-5">
        <Container className="p-0">
          <Row>
            <Col sm={12} className="text-center">
              <div className="maintenance">
                <img
                  src={img02} // Adjust the path accordingly
                  
                  className="img-fluid mb-2"
                />
                <h3 className="mt-4 mb-1">We are Currently Performing Maintenance</h3>
                <p className="fs-5">Please check back in sometime.</p>
              </div>
            </Col>
          </Row>
        </Container>
        <Container className="mt-3 pb-5">
          <Row>
            <Col lg={4} className="mb-3 mb-lg-0">
              <Card className="text-center mb-0">
                <Card.Body>
                  <i className="ri-window-line ri-4x line-height text-primary"></i>
                  <h5 className="card-title mt-1">Why is the Site Down?</h5>
                  <p className="mb-0">
                    It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} className="mb-3 mb-lg-0">
              <Card className="text-center mb-0">
                <Card.Body>
                  <i className="ri-time-line ri-4x line-height text-primary"></i>
                  <h5 className="card-title mt-1">What is the Downtime?</h5>
                  <p className="mb-0">
                    It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} className="mb-3 mb-lg-0">
              <Card className="text-center mb-0">
                <Card.Body>
                  <i className="ri-information-line ri-4x line-height text-primary"></i>
                  <h5 className="card-title mt-1">Do you need Support?</h5>
                  <p className="mb-0">
                    It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  )
}

export default Maintenance
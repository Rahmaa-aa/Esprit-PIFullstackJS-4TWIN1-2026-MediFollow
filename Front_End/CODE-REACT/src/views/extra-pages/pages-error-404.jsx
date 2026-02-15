import React from "react";
import { Container } from 'react-bootstrap';
import { Link } from "react-router-dom";


const Error404 = () => {
  return (
    <>
      <Container className="p-0">
        <div className="d-flex vh-100 justify-content-center">
          <div className="text-center align-self-center">
            <div className="error position-relative">
              <h1 className="text-primary" style={{ fontSize: '185px', fontWeight: 'bold' }}>404</h1>
              <h2 className="mb-0">Oops! This Page is Not Found.</h2>
              <p className="fs-5">The requested page does not exist.</p>
              <Link className="btn btn-primary-subtle mt-3" to="/">
                <div className="d-flex align-items-center"><i className="ri-home-4-line me-2"></i>
                  <p className="mb-0">Back to Home</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </>
  )
}

export default Error404
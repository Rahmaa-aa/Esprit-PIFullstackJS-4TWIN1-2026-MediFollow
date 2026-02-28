import React from 'react'
import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';


const FooterStyle = () => {
    const currentYear = new Date().getFullYear();
    return (
        <>
            <footer className="footer rounded-pill mb-4 mx-0 mx-md-4">
                <div className="footer-body  ">
                    <Row className="d-flex flex-grow-1">
                        <Col lg={6} md={12}>
                            <ul className="left-panel list-inline mb-0 p-0 d-flex justify-content-center justify-content-lg-start">
                                <li className="list-inline-item fw-500"><Link className="footer-link" to="/extra-pages/privacy-policy">Privacy Policy</Link></li>
                                <li className="list-inline-item fw-500"><Link className="footer-link footer-spacing" to="/extra-pages/terms-of-use">Terms of Use</Link></li>
                            </ul>
                        </Col>
                        <Col lg={6} md={12}>
                            <h6 className="right-panel mb-0 d-flex justify-content-center justify-content-lg-end">

                                Copyright{" "}{currentYear}{" "}<a href="#" className="px-1"> XRay </a> All Rights Reserved.
                            </h6>
                        </Col>
                    </Row>
                </div>
            </footer>
        </>
    )
}

export default FooterStyle
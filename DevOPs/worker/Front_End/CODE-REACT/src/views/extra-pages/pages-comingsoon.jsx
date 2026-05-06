import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form } from 'react-bootstrap';
import Card from "../../components/Card";

// Import Image
import logofull2 from "/assets/images/logo-full2.png"
import { Link } from "react-router-dom";

const CommingSoon = () => {
    const [timeRemaining, setTimeRemaining] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const deadline = new Date('Dec 31 2025 20:20:22');

        const getTimeRemaining = (endtime) => {
            const total = Date.parse(endtime) - Date.parse(new Date());
            const seconds = Math.floor((total / 1000) % 60);
            const minutes = Math.floor((total / 1000 / 60) % 60);
            const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
            const days = Math.floor(total / (1000 * 60 * 60 * 24));

            return {
                total,
                days,
                hours,
                minutes,
                seconds,
            };
        };

        const updateClock = () => {
            const t = getTimeRemaining(deadline);
            setTimeRemaining({
                days: t.days,
                hours: t.hours,
                minutes: t.minutes,
                seconds: t.seconds,
            });

            if (t.total <= 0) {
                clearInterval(timeInterval);
            }
        };

        updateClock();
        const timeInterval = setInterval(updateClock, 1000);

        return () => clearInterval(timeInterval);
    }, []);

    return (
        <>
            <Container className="pt-5 custom-auth-height d-md-flex align-items-center">
                <Container fluid>
                    <Row className="justify-content-center">
                        <Col md={8} sm={11} className="text-center">
                            <div className="iq-comingsoon-info">
                                <Link to="/">
                                    <img src={logofull2} className="img-fluid w-25" />
                                </Link>
                                <h2 className="mt-4 mb-1">Stay tuned, we&apos;re launching very soon</h2>
                                <p>We are working very hard to give you the best experience possible!</p>
                                <ul className="countdown d-flex align-items-center list-unstyled row">
                                    <li className="col-md-6 col-lg-3">
                                        <Card>
                                            <Card.Body>
                                                <span>{timeRemaining.days}</span>
                                                Days
                                            </Card.Body>
                                        </Card>
                                    </li>
                                    <li className="col-md-6 col-lg-3">
                                        <Card>
                                            <Card.Body>
                                                <span>{String(timeRemaining.hours).padStart(2, '0')}</span>
                                                Hours
                                            </Card.Body>
                                        </Card>
                                    </li>
                                    <li className="col-md-6 col-lg-3">
                                        <Card>
                                            <Card.Body>
                                                <span>{String(timeRemaining.minutes).padStart(2, '0')}</span>
                                                Minutes
                                            </Card.Body>
                                        </Card>
                                    </li>
                                    <li className="col-md-6 col-lg-3">
                                        <Card>
                                            <Card.Body>
                                                <span>{String(timeRemaining.seconds).padStart(2, '0')}</span>
                                                Seconds
                                            </Card.Body>
                                        </Card>
                                    </li>
                                </ul>
                            </div>
                        </Col>
                    </Row>
                    <Row className="justify-content-center">
                        <Col lg={4}>
                            <Form className="iq-comingsoon-form mt-5">
                                <Form.Group className="form-group">
                                    <Form.Control type="email" placeholder="Enter email address" />
                                    <button type="submit" className="btn btn-primary-subtle">Subscribe</button>
                                </Form.Group>
                            </Form>
                        </Col>
                    </Row>
                </Container>
            </Container>
        </>
    );
}

export default CommingSoon;

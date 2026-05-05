import React from "react";
import { Accordion, Col, Row } from 'react-bootstrap';

const TermsOfService = () => {
    return (
        <>
            <Row>
                <Col lg={12}>
                    <Accordion defaultActiveKey="0" className="custom-accordion iq-accordion-card">
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Lorem ipsum dolor sit</Accordion.Header>
                            <Accordion.Body>
                                <strong>Anim pariatur cliche reprehenderit,</strong> enim eiusmod high life accusamus terry
                                richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>consectetur adipiscing elit</Accordion.Header>
                            <Accordion.Body>
                                <strong>Anim pariatur cliche reprehenderit,</strong> enim eiusmod high life accusamus terry
                                richardson ad squid. 3 wolf moon officia aute, <code>non cupidatat skateboard dolor brunch.</code> Food truck
                                quinoa nesciunt laborum eiusmod.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="2">
                            <Accordion.Header>Etiam sit amet justo non</Accordion.Header>
                            <Accordion.Body>
                                <strong>Anim pariatur cliche reprehenderit,</strong> enim eiusmod high life accusamus terry
                                richardson ad squid. <code>3 wolf moon officia aute,</code> non cupidatat skateboard dolor brunch.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="3">
                            <Accordion.Header>velit accumsan laoreet</Accordion.Header>
                            <Accordion.Body>
                                <strong>Anim pariatur cliche reprehenderit,</strong> enim eiusmod high life accusamus terry
                                richardson ad squid. 3 wolf moon officia aute, <code>non cupidatat skateboard dolor brunch.</code> Food truck
                                quinoa nesciunt laborum eiusmod.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="4">
                            <Accordion.Header>Donec volutpat metus in erat</Accordion.Header>
                            <Accordion.Body>
                                <strong>Anim pariatur cliche reprehenderit,</strong> enim eiusmod high life accusamus terry
                                richardson ad squid. 3 wolf moon officia aute, <code>non cupidatat skateboard dolor brunch.</code> Food truck
                                quinoa nesciunt laborum eiusmod.
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Col>
            </Row>
        </>
    )
}

export default TermsOfService
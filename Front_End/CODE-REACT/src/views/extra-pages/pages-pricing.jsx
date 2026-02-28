import React from "react";
import { Table, Button, Row, Col } from 'react-bootstrap';
import "../../assets/vendor/remixicon/fonts/remixicon.glyph.json"
import Card from "../../components/Card";

const pricingPlans = [
    {
        name: 'Starter',
        price: 19,
        features: {
            emailSupport: true,
            uiKit: false,
            fullSupport: false,
            advancedForm: true,
            customShortcode: false,
            widgets: false,
        },
    },
    {
        name: 'Business',
        price: 39,
        features: {
            emailSupport: true,
            uiKit: true,
            fullSupport: true,
            advancedForm: true,
            customShortcode: false,
            widgets: false,
        },
    },
    {
        name: 'Enterprise',
        price: 119,
        features: {
            emailSupport: true,
            uiKit: true,
            fullSupport: true,
            advancedForm: true,
            customShortcode: false,
            widgets: true,
        },
    },
    {
        name: 'Unlimited',
        price: 219,
        features: {
            emailSupport: true,
            uiKit: true,
            fullSupport: true,
            advancedForm: true,
            customShortcode: true,
            widgets: true,
        },
    },
];

const Pricing = () => {

    return (
        <>
            <Row>
                <Col sm={12}>
                    <Card>
                        <Card.Body>
                            <div className="table-responsive">
                                <Table className="table">
                                    <thead>
                                        <tr>
                                            <th className="text-center"></th>
                                            {pricingPlans.map((plan, idx) => (
                                                <th key={idx} className="text-center">{plan.name}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <th className="text-center" scope="row">Email support</th>
                                            {pricingPlans.map((plan, idx) => (
                                                <td key={idx} className="text-center">
                                                    {plan.features.emailSupport ? (
                                                        <i className="ri-check-line ri-2x text-success"></i>
                                                    ) : null}
                                                </td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <th className="text-center" scope="row">UI Kit</th>
                                            {pricingPlans.map((plan, idx) => (
                                                <td key={idx} className="text-center">
                                                    {plan.features.uiKit ? (
                                                        <i className="ri-check-line ri-2x text-success"></i>
                                                    ) : null}
                                                </td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <th className="text-center" scope="row">100% support</th>
                                            {pricingPlans.map((plan, idx) => (
                                                <td key={idx} className="text-center">
                                                    {plan.features.fullSupport ? (
                                                        <i className="ri-check-line ri-2x text-success"></i>
                                                    ) : null}
                                                </td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <th className="text-center" scope="row">Advance form</th>
                                            {pricingPlans.map((plan, idx) => (
                                                <td key={idx} className="text-center">
                                                    {plan.features.advancedForm ? (
                                                        <i className="ri-check-line ri-2x text-success"></i>
                                                    ) : null}
                                                </td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <th className="text-center" scope="row">Custom shortcode</th>
                                            {pricingPlans.map((plan, idx) => (
                                                <td key={idx} className="text-center">
                                                    {plan.features.customShortcode ? (
                                                        <i className="ri-check-line ri-2x text-success"></i>
                                                    ) : null}
                                                </td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <th className="text-center" scope="row">Thousand of Widgets</th>
                                            {pricingPlans.map((plan, idx) => (
                                                <td key={idx} className="text-center">
                                                    {plan.features.widgets ? (
                                                        <i className="ri-check-line ri-2x text-success"></i>
                                                    ) : null}
                                                </td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td className="text-center"></td>
                                            {pricingPlans.map((plan, idx) => (
                                                <td key={idx} className="text-center">
                                                    <h2>${plan.price}<small> / Per month</small></h2>
                                                    <Button className="mt-3 rounded-3" variant="primary-subtle">Purchase</Button>
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default Pricing
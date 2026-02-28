import React from "react";
import { Col, Row } from "react-bootstrap";
import Card from "../../components/Card";

const PrivacyPolicy = () => {
    const cardData = [
        {
            title: "What is Lorem Ipsum?",
            content: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
            the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley
            of type and scrambled it to make a type specimen book. It has survived not only five centuries,
            but also the leap into electronic typesetting, remaining essentially unchanged. It was
            popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages,
            and more recently with desktop publishing software like Aldus PageMaker including versions of
            Lorem Ipsum.`
        },
        {
            title: "Why do we use it?",
            content: `It is a long established fact that a reader will be distracted by the readable content of a page
            when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal
            distribution of letters, as opposed to using 'Content here, content here', making it look like
            readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as
            their default model text, and a search for 'lorem ipsum' will uncover many web sites still in
            their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on
            purpose (injected humour and the like).`
        },
        {
            title: "Where does it come from?",
            content: `It is a long established fact that a reader will be distracted by the readable content of a page
            when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal
            distribution of letters, as opposed to using 'Content here, content here', making it look like
            readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as
            their default model text, and a search for 'lorem ipsum' will uncover many web sites still in
            their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on
            purpose (injected humour and the like).`
        },
        {
            title: "Where can I get some?",
            content: `It is a long established fact that a reader will be distracted by the readable content of a page
            when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal
            distribution of letters, as opposed to using 'Content here, content here', making it look like
            readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as
            their default model text, and a search for 'lorem ipsum' will uncover many web sites still in
            their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on
            purpose (injected humour and the like).`
        },
        {
            title: "Why do we use it?",
            content: `It is a long established fact that a reader will be distracted by the readable content of a page
            when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal
            distribution of letters, as opposed to using 'Content here, content here', making it look like
            readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as
            their default model text, and a search for 'lorem ipsum' will uncover many web sites still in
            their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on
            purpose (injected humour and the like).`
        },
        {
            title: "Why do we use it?",
            content: `It is a long established fact that a reader will be distracted by the readable content of a page
            when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal
            distribution of letters, as opposed to using 'Content here, content here', making it look like
            readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as
            their default model text, and a search for 'lorem ipsum' will uncover many web sites still in
            their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on
            purpose (injected humour and the like).`
        },
        {
            title: "Why do we use it?",
            content: `It is a long established fact that a reader will be distracted by the readable content of a page
            when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal
            distribution of letters, as opposed to using 'Content here, content here', making it look like
            readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as
            their default model text, and a search for 'lorem ipsum' will uncover many web sites still in
            their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on
            purpose (injected humour and the like).`
        },
        {
            title: "Why do we use it?",
            content: `It is a long established fact that a reader will be distracted by the readable content of a page
            when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal
            distribution of letters, as opposed to using 'Content here, content here', making it look like
            readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as
            their default model text, and a search for 'lorem ipsum' will uncover many web sites still in
            their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on
            purpose (injected humour and the like).`
        },
        {
            title: "Why do we use it?",
            content: `It is a long established fact that a reader will be distracted by the readable content of a page
            when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal
            distribution of letters, as opposed to using 'Content here, content here', making it look like
            readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as
            their default model text, and a search for 'lorem ipsum' will uncover many web sites still in
            their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on
            purpose (injected humour and the like).`
        },
    ];
    return (
        <>
            <Row>
                <Col lg={12}>
                    {cardData.map((card, index) => (
                        <Card key={index} className="mb-5">
                            <Card.Header className="d-flex justify-content-between">
                                <h4 className="card-title">{card.title}</h4>
                            </Card.Header>
                            <Card.Body>
                                <p>{card.content}</p>
                            </Card.Body>
                        </Card>
                    ))}
                </Col>
            </Row>
        </>
    )
}

export default PrivacyPolicy
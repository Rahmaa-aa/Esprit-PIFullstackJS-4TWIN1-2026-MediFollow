import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner, Alert, Button } from "react-bootstrap";
import Card from "../../components/Card";
import { useTranslation } from "react-i18next";

const ModernNewsGrid = () => {
    const { t } = useTranslation();
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Fetch Global Healthcare News via Free NewsAPI mirror (returns actual images)
                const apiUrl = "https://saurav.tech/NewsAPI/top-headlines/category/health/us.json";
                const response = await fetch(apiUrl);
                
                if (!response.ok) {
                    throw new Error("Unable to fetch global news data.");
                }

                const data = await response.json();
                
                if (data.status === "ok") {
                    setNewsData(data.articles.slice(0, 9)); // Cap at 9 articles
                } else {
                    throw new Error(data.message || "Failed to load feed");
                }
            } catch (err) {
                console.error("News Feed Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    const stripHtml = (html) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        return doc.body.textContent || "";
    };

    return (
        <div style={{ backgroundColor: "#f4f5fa", padding: "60px 0" }}>
            <Container>
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted">Curating global insights...</p>
                    </div>
                ) : error ? (
                    <Alert variant="danger" className="text-center">
                        <Alert.Heading>Sync Interrupted</Alert.Heading>
                        <p>{error}</p>
                    </Alert>
                ) : (
                    <Row className="g-4">
                        {newsData.map((item, index) => {
                            let snippet = item.description || "";
                            if (snippet.length > 180) snippet = snippet.slice(0, 180) + "...";
                            
                            // A fallback realistic generic medical thumbnail if image is missing
                            const fallbackImg = "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=1000&auto=format&fit=crop";
                            const thumbnail = item.urlToImage || fallbackImg;
                            
                            const date = new Date(item.publishedAt).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            });

                            return (
                                <Col lg={4} md={6} key={index}>
                                    <Card className="h-100 shadow-sm border-0 news-grid-card" style={{ transition: "all 0.3s ease-in-out", overflow: "hidden", borderRadius: "15px" }}
                                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)'; }}
                                    >
                                        <div style={{ height: "220px", overflow: "hidden", position: "relative" }}>
                                            <img 
                                                src={thumbnail} 
                                                alt="News Thumbnail" 
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                                                onError={(e) => { e.target.src = fallbackImg }} 
                                            />
                                            <div className="position-absolute" style={{ top: "15px", left: "15px", backgroundColor: "rgba(8, 155, 171, 0.9)", color: "white", padding: "5px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "bold" }}>
                                                {item.source?.name || "Global Health"}
                                            </div>
                                        </div>
                                        <Card.Body className="d-flex flex-column p-4">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <span className="text-secondary small"><i className="ri-calendar-line me-1"></i>{date}</span>
                                                <span className="text-secondary small"><i className="ri-global-line me-1"></i>Reuters/Google Source</span>
                                            </div>
                                            <Card.Header.Title className="mb-3">
                                                <h4 className="fw-bold" style={{ fontSize: "1.15rem", lineHeight: "1.4", color: "#222" }}>
                                                    {item.title}
                                                </h4>
                                            </Card.Header.Title>
                                            <p className="text-muted flex-grow-1" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
                                                {snippet}
                                            </p>
                                            <div className="mt-4 pt-3 border-top border-light">
                                                <Button 
                                                    href={item.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    variant="outline-primary" 
                                                    className="w-100 rounded-pill d-flex justify-content-center align-items-center"
                                                >
                                                    Read Full Article <i className="ri-arrow-right-up-line ms-2"></i>
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                )}
            </Container>
        </div>
    );
};

export default ModernNewsGrid;

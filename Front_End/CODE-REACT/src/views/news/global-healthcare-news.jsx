import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "./global-healthcare-news.css";

const GlobalHealthcareNews = () => {
    const { t } = useTranslation();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Fetching real-world medical news from NYT Health RSS using an RSS-to-JSON proxy
                const response = await fetch("https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Frss.nytimes.com%2Fservices%2Fxml%2Frss%2Fnyt%2FHealth.xml");
                if (!response.ok) {
                    throw new Error("Failed to fetch news data");
                }
                const data = await response.json();
                
                // Map the RSS items to our expected format
                if (data.status === "ok" && data.items) {
                    const formattedArticles = data.items.map((item, index) => ({
                        id: item.guid || index,
                        title: item.title,
                        description: item.description || item.content,
                        url: item.link,
                        cover_image: item.enclosure?.link || item.thumbnail || null,
                        published_at: item.pubDate,
                        user: { name: item.author || "Medical Editor" },
                        tag_list: item.categories || [],
                        reading_time_minutes: Math.ceil((item.description || item.content || "").length / 800) || 3
                    }));
                    
                    // Filter out articles without cover images to keep the feed highly aesthetic
                    const richArticles = formattedArticles.filter(article => article.cover_image);
                    setArticles(richArticles.length > 0 ? richArticles.slice(0, 12) : formattedArticles.slice(0, 12));
                }
                setLoading(false);
            } catch (err) {
                console.error("Error fetching news:", err);
                setError(t("newsPage.loadError"));
                setLoading(false);
            }
        };

        fetchNews();
    }, [t]);

    const renderSkeletons = () => {
        return Array.from({ length: 6 }).map((_, i) => (
            <Col xl="4" lg="4" md="6" sm="12" key={i} className="mb-4">
                <div className="news-card-skeleton">
                    <div className="skeleton-img"></div>
                    <div className="skeleton-body">
                        <div className="skeleton-title"></div>
                        <div className="skeleton-title short"></div>
                        <div className="skeleton-footer"></div>
                    </div>
                </div>
            </Col>
        ));
    };

    return (
        <div className="global-news-page">
            <Container fluid>
                <div className="news-header">
                    <h1 className="news-title">
                        <i className="ri-newspaper-line me-2 text-primary"></i>
                        {t("newsPage.title")}
                    </h1>
                    <p className="news-subtitle">
                        {t("newsPage.subtitle")}
                    </p>
                </div>

                {error && (
                    <Alert variant="danger" className="news-alert">
                        <i className="ri-error-warning-line me-2"></i>
                        {error}
                    </Alert>
                )}

                <Row className="news-grid">
                    {loading ? (
                        renderSkeletons()
                    ) : (
                        articles.map((article) => (
                            <Col xl="4" lg="4" md="6" sm="12" key={article.id} className="mb-4">
                                <a href={article.url} target="_blank" rel="noopener noreferrer" className="news-card-link">
                                    <div className="news-card">
                                        <div className="news-card-image-wrapper">
                                            {article.cover_image ? (
                                                <img src={article.cover_image} alt={article.title} className="news-card-image" />
                                            ) : (
                                                <div className="news-card-image-placeholder">
                                                    <i className="ri-newspaper-fill"></i>
                                                </div>
                                            )}
                                            <div className="news-card-overlay">
                                                <span className="read-more-badge">{t("newsPage.readFullArticle")}</span>
                                            </div>
                                        </div>
                                        <div className="news-card-body">
                                            <div className="news-meta">
                                                <span className="news-author">
                                                    <i className="ri-quill-pen-line me-1"></i> {article.user.name}
                                                </span>
                                                <span className="news-date">
                                                    {new Date(article.published_at.replace(' ', 'T')).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <h3 className="news-card-title">{article.title}</h3>
                                            <p className="news-card-description">
                                                {article.description}
                                            </p>
                                            <div className="news-footer">
                                                <span className="news-reading-time">
                                                    <i className="ri-time-line"></i> {t("newsPage.minRead", { count: article.reading_time_minutes })}
                                                </span>
                                                <div className="news-tags">
                                                    {article.tag_list.slice(0, 2).map(tag => (
                                                        <span key={tag} className="news-tag">#{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </Col>
                        ))
                    )}
                </Row>
            </Container>
        </div>
    );
};

export default GlobalHealthcareNews;

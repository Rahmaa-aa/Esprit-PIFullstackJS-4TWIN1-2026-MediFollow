import React, { useState, useEffect } from "react";
import { Container, Spinner, Alert } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const GlobalNewspaper = () => {
    const { t } = useTranslation();
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Fetch Global Healthcare News via Google News RSS and rss2json proxy
                const rssUrl = "https://news.google.com/rss/search?q=Global+Healthcare&hl=en-US&gl=US&ceid=US:en";
                const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
                
                if (!response.ok) {
                    throw new Error("Unable to fetch global news data.");
                }

                const data = await response.json();
                
                if (data.status === "ok") {
                    setNewsData(data.items.slice(0, 9)); // Cap at 9 articles
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
        <div id="newspaper" style={{ backgroundColor: "#f9f9f5", color: "#111", padding: "60px 0", borderTop: "4px solid #111" }}>
            <Container>
                {/* Newspaper Header */}
                <div className="text-center mb-5 border-bottom border-dark border-3 pb-3">
                    <h5 className="text-uppercase tracking-widest mb-2" style={{ fontFamily: "Arial, sans-serif", letterSpacing: "2px", fontSize: "0.85rem", color: "#555" }}>
                        True Events of the World
                    </h5>
                    <h1 style={{ fontFamily: "'Playfair Display', 'Times New Roman', Times, serif", fontSize: "4.5rem", fontWeight: "900", marginBottom: "0", letterSpacing: "-1px" }}>
                        THE GLOBAL TRIBUNE
                    </h1>
                    <div className="d-flex justify-content-between text-uppercase mt-3" style={{ fontSize: "0.9rem", borderTop: "1px solid #111", borderBottom: "1px solid #111", padding: "5px 0", fontFamily: "Arial, sans-serif" }}>
                        <span>World Edition</span>
                        <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</span>
                        <span>Vol. XCIII, No. 1</span>
                    </div>
                </div>

                {/* Newspaper Content Body */}
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" style={{ color: "#111" }} />
                        <p className="mt-3" style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>Press is printing...</p>
                    </div>
                ) : error ? (
                    <Alert variant="danger" className="rounded-0 text-center" style={{ fontFamily: "Georgia, serif" }}>
                        <h4 className="border-bottom border-danger pb-2">STOP THE PRESSES</h4>
                        <p>{error}</p>
                    </Alert>
                ) : (
                    <div style={{
                        columnCount: "3",
                        columnGap: "40px",
                        columnRule: "1px solid #ccc",
                        fontFamily: "'Merriweather', 'Times New Roman', Times, serif"
                    }}>
                        {newsData.map((item, index) => {
                            // Extract base snippet
                            let snippet = stripHtml(item.description);
                            // Avoid huge blocks of text
                            if (snippet.length > 250) snippet = snippet.slice(0, 250) + "...";
                            
                            // For the first article, make it prominent (Lead Story)
                            const isLeadStory = index === 0;

                            return (
                                <div key={index} className="mb-5 d-inline-block w-100" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
                                    <h4 className="fw-bold mb-3" style={{ 
                                        fontFamily: "'Playfair Display', 'Times New Roman', Times, serif", 
                                        fontSize: isLeadStory ? "2.2rem" : "1.4rem", 
                                        lineHeight: "1.2",
                                        textAlign: "left"
                                    }}>
                                        {item.title}
                                    </h4>
                                    <div className="text-uppercase mb-3" style={{ fontSize: "0.75rem", fontWeight: "bold", fontFamily: "Arial, sans-serif", borderBottom: "1px solid #eee", paddingBottom: "5px" }}>
                                        By Reuters / Global Reports
                                    </div>
                                    <p style={{ 
                                        fontSize: "1.05rem", 
                                        lineHeight: "1.6", 
                                        textAlign: "justify",
                                        color: "#222"
                                    }}>
                                        {isLeadStory && <span style={{ float: "left", fontSize: "4.5rem", lineHeight: "0.8", paddingTop: "0.2rem", paddingRight: "0.5rem" }}>{snippet.charAt(0)}</span>}
                                        {isLeadStory ? snippet.slice(1) : snippet}
                                    </p>
                                    <a href={item.link} target="_blank" rel="noopener noreferrer" 
                                       style={{ display: "block", color: "#111", fontWeight: "bold", textDecoration: "underline", fontStyle: "italic", marginTop: "15px" }}>
                                        Read the Full Dispatch »
                                    </a>
                                    {!isLeadStory && index !== newsData.length - 1 && <hr style={{ marginTop: "30px", borderTop: "1px solid #aaa" }} />}
                                </div>
                            );
                        })}
                    </div>
                )}
            </Container>
        </div>
    );
};

export default GlobalNewspaper;

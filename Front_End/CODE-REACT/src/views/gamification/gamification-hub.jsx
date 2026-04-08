import React, { useEffect, useState } from 'react';
import { Row, Col, Card, ProgressBar, Badge, ListGroup } from 'react-bootstrap';
import { gamificationApi } from '../../services/api';
import './gamification-hub.css';
import { useTranslation } from 'react-i18next';

const GamificationHub = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await gamificationApi.getMyStats();
                setStats(res);
            } catch (error) {
                console.error("Error fetching gamification stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="text-center p-5">Loading rewards...</div>;
    if (!stats) return <div className="text-center p-5">No gamification data available.</div>;

    const pointsToNextLevel = 500 - (stats.points % 500);
    const progress = ((stats.points % 500) / 500) * 100;

    return (
        <div className="gamification-container p-4">
            <div className="header-reward mb-4 text-center glass-card p-4">
                <h1 className="reward-title">✨ {t('rewards_and_achievements', 'Rewards & Achievements')} ✨</h1>
                <p className="subtitle">{t('rewards_subtitle', 'Stay active, keep healthy, and earn exclusive badges!')}</p>
            </div>

            <Row>
                <Col lg={4}>
                    <Card className="glass-card profile-reward-card mb-4">
                        <Card.Body className="text-center">
                            <div className="level-badge mb-3">
                                <span className="level-number">{stats.level}</span>
                            </div>
                            <h3>{t('level', 'Level')} {stats.level}</h3>
                            <p className="text-muted">{stats.role.toUpperCase()}</p>
                            
                            <div className="streak-widget mt-4">
                                <i className="ri-fire-fill streak-icon"></i>
                                <span className="streak-count">{stats.streak}</span>
                                <p>{t('day_streak', 'Day Streak')}</p>
                            </div>

                            <div className="mt-4">
                                <div className="d-flex justify-content-between mb-1">
                                    <span>{progress.toFixed(0)}% to Level {stats.level + 1}</span>
                                    <span>{stats.points} pts</span>
                                </div>
                                <ProgressBar now={progress} variant="info" className="custom-progress" />
                                <small className="text-muted mt-2 d-block">{pointsToNextLevel} {t('points_remaining', 'points remaining')}</small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={8}>
                    <Card className="glass-card mb-4">
                        <Card.Header className="bg-transparent border-0 pt-4 px-4">
                            <h4>🏆 {t('my_badges', 'My Badges')}</h4>
                        </Card.Header>
                        <Card.Body>
                            <Row className="badge-grid">
                                {(stats.badges || []).length > 0 ? (
                                    (stats.badges || []).map((badge, idx) => (
                                        <Col key={idx} xs={6} md={4} lg={3} className="text-center mb-4">
                                            <div className="badge-item earned">
                                                <div className="badge-icon-wrapper">
                                                    <i className={badge.icon}></i>
                                                </div>
                                                <p className="badge-name mt-2">{t(badge.name, badge.name)}</p>
                                                <small className="badge-date">{new Date(badge.dateEarned).toLocaleDateString()}</small>
                                            </div>
                                        </Col>
                                    ))
                                ) : (
                                    <Col className="text-center p-5">
                                        <p className="text-muted">{t('no_badges_yet', "Keep using the app to earn your first badge!")}</p>
                                    </Col>
                                )}
                                
                                {/* Placeholder for locked badges */}
                                {(stats.badges || []).length < 4 && (
                                    <Col xs={6} md={4} lg={3} className="text-center mb-4">
                                        <div className="badge-item locked">
                                            <div className="badge-icon-wrapper">
                                                <i className="ri-lock-line"></i>
                                            </div>
                                            <p className="badge-name mt-2">{t('locked', 'Locked')}</p>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="glass-card">
                        <Card.Header className="bg-transparent border-0 pt-4 px-4">
                            <h4>🕒 {t('recent_activity', 'Recent Activity')}</h4>
                        </Card.Header>
                        <Card.Body>
                            <ListGroup variant="flush" className="history-list">
                                {(stats.history || []).slice().reverse().map((h, i) => (
                                    <ListGroup.Item key={i} className="bg-transparent border-0 d-flex justify-content-between align-items-center py-3">
                                        <div className="d-flex align-items-center">
                                            <div className={`action-icon-circle ${h.action}`}>
                                                <i className={h.action === 'login' ? 'ri-login-box-line' : h.action === 'health_log' ? 'ri-pulse-line' : 'ri-award-line'}></i>
                                            </div>
                                            <div className="ms-3">
                                                <p className="mb-0 fw-bold">{t(`action_${h.action}`, h.action.replace('_', ' '))}</p>
                                                <small className="text-muted">{new Date(h.date).toLocaleString()}</small>
                                            </div>
                                        </div>
                                        <span className="points-plus">+{h.points} pts</span>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default GamificationHub;

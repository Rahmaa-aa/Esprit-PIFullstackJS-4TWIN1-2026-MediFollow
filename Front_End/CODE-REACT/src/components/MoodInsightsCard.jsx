import React, { useEffect, useState, useMemo } from 'react';
import { Card, Spinner, Alert, Badge, OverlayTrigger, Tooltip as BootstrapTooltip } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { patientApi } from '../services/api';

const circularChartCSS = `
  .circular-chart {
    display: block;
    margin: 10px auto;
    max-width: 80%;
    max-height: 250px;
  }
  .circle-bg {
    fill: none;
    stroke: #eee;
    stroke-width: 3.8;
  }
  .circle {
    fill: none;
    stroke-width: 3.8;
    stroke-linecap: round;
    transition: stroke-dasharray 1s ease-out;
  }
  @keyframes progress {
    0% { stroke-dasharray: 0, 100; }
  }
`;

const MoodInsightsCard = ({ patientId, compact = false }) => {
  const { t } = useTranslation();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchInsights = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!patientId) return;
        const data = await patientApi.getMoodInsights(patientId);
        if (mounted) {
          setInsights(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load insights');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchInsights();
    return () => {
      mounted = false;
    };
  }, [patientId]);

  const latestInsight = insights[insights.length - 1];

  const chartData = useMemo(() => {
    return insights.slice(-7).map(item => ({
      date: new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      score: item.overallMoodScore,
      emotion: item.emotionLabel
    }));
  }, [insights]);

  if (loading) {
    return (
      <Card className="border-0 shadow-sm h-100">
        <Card.Body className="d-flex justify-content-center align-items-center">
          <Spinner animation="border" variant="primary" />
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-sm h-100">
        <Card.Body>
          <Alert variant="danger">{error}</Alert>
        </Card.Body>
      </Card>
    );
  }

  if (!latestInsight) {
    return (
      <Card className="border-0 shadow-sm h-100 bg-light">
        <Card.Body className="d-flex flex-column justify-content-center align-items-center text-muted">
          <i className="ri-bar-chart-grouped-line fs-1 mb-2"></i>
          <p className="mb-0">Aucune donnée d'insight multimodal disponible.</p>
        </Card.Body>
      </Card>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-danger';
  };

  const getScoreBadgeBg = (score) => {
    if (score >= 80) return 'bg-success';
    if (score >= 50) return 'bg-warning text-dark';
    return 'bg-danger';
  };

  return (
    <Card className="border-0 shadow-sm h-100">
      <style>{circularChartCSS}</style>
      <Card.Body className="p-4 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0 text-primary fw-bold" aria-label="Analyse multimodale des humeurs et compliances">
            <i className="ri-brain-line me-2"></i>Vue Multimodale
          </h5>
          <Badge bg={latestInsight.alertTriggered ? 'danger' : 'secondary'}>
            {latestInsight.alertTriggered ? 'Alerte Active' : 'Normal'}
          </Badge>
        </div>

        <div className="row flex-grow-1">
          <div className={`col-12 ${compact ? '' : 'col-md-5'} d-flex flex-column align-items-center justify-content-center mb-4 mb-md-0`}>
            {/* Gauge Simulation SVG (Accessible) */}
            <div className="position-relative d-flex justify-content-center align-items-center" style={{ width: 140, height: 140 }} aria-label={`Score Global: ${latestInsight.overallMoodScore} sur 100`}>
                <svg viewBox="0 0 36 36" className="circular-chart" style={{ width: '100%', height: '100%' }}>
                  <path
                    className="circle-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#eee"
                    strokeWidth="3.8"
                  />
                  <path
                    className="circle"
                    strokeDasharray={`${latestInsight.overallMoodScore}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={latestInsight.overallMoodScore >= 80 ? '#28a745' : latestInsight.overallMoodScore >= 50 ? '#ffc107' : '#dc3545'}
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    style={{ animation: 'progress 1s ease-out forwards' }}
                  />
                </svg>
                <div className={`position-absolute text-center ${getScoreColor(latestInsight.overallMoodScore)}`}>
                  <span className="fs-2 fw-bold d-block lh-1">{latestInsight.overallMoodScore}</span>
                  <span className="small text-muted d-block mt-1">/100</span>
                </div>
            </div>
            
            <div className="text-center mt-3 w-100">
              <h6 className="fw-bold mb-1">Score Global</h6>
              <p className="small text-muted mb-0 lh-sm">Agrégation santé, émotions et observance</p>
            </div>
          </div>

          {!compact && (
            <div className="col-12 col-md-7 d-flex flex-column justify-content-center">
              <div className="bg-light rounded p-3 mb-3 border-start border-4 border-primary">
                <i className="ri-information-line text-primary me-2 fw-bold"></i>
                <span className="fw-medium small" aria-label="Résumé de l'insight">
                  {latestInsight.insightSummary}
                </span>
              </div>
              
              <div className="bg-white border rounded p-3" aria-label="Recommandation clinique">
                <p className="mb-0 small text-dark opacity-75">
                  <strong>Recommandation : </strong>{latestInsight.recommendation}
                </p>
              </div>

              <div className="d-flex gap-2 mt-3 flex-wrap">
                <OverlayTrigger overlay={<BootstrapTooltip>Score Émotion (FER)</BootstrapTooltip>}>
                  <Badge bg="light" text="dark" className="border px-2 py-1"><i className="ri-emotion-line me-1 text-primary"></i>{(latestInsight.emotionScore * 100).toFixed(0)}%</Badge>
                </OverlayTrigger>
                <OverlayTrigger overlay={<BootstrapTooltip>Tendance Constantes</BootstrapTooltip>}>
                  <Badge bg="light" text="dark" className="border px-2 py-1"><i className="ri-heart-pulse-line me-1 text-success"></i>{(latestInsight.vitalTrendScore * 100).toFixed(0)}%</Badge>
                </OverlayTrigger>
                <OverlayTrigger overlay={<BootstrapTooltip>Progression Symptômes</BootstrapTooltip>}>
                  <Badge bg="light" text="dark" className="border px-2 py-1"><i className="ri-stethoscope-line me-1 text-warning"></i>{(latestInsight.symptomSeverityScore * 100).toFixed(0)}%</Badge>
                </OverlayTrigger>
                <OverlayTrigger overlay={<BootstrapTooltip>Assiduité Questionnaires</BootstrapTooltip>}>
                  <Badge bg="light" text="dark" className="border px-2 py-1"><i className="ri-calendar-check-line me-1 text-info"></i>{latestInsight.questionnaireCompliance}%</Badge>
                </OverlayTrigger>
              </div>
            </div>
          )}
        </div>

        {/* 7 Day Trend Chart */}
        {!compact && insights.length > 1 && (
          <div className="mt-4 pt-3 border-top" style={{ height: "160px" }}>
            <p className="small text-muted mb-2 fw-bold"><i className="ri-line-chart-line me-1"></i>Tendance sur 7 Jours</p>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0d6efd" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="date" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#333' }}
                />
                <Area type="monotone" dataKey="score" stroke="#0d6efd" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default MoodInsightsCard;

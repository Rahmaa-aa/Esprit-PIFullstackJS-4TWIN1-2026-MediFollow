import React, { useEffect, useRef } from "react";
// import ReactECharts from 'echarts-for-react';
import { Col, Row } from "react-bootstrap";
import Card from "../../components/Card";
// import { min } from "lodash";
import { Chart as ChartJS, DoughnutController, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, BubbleController, ScatterController, PieController, RadarController, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';
ChartJS.register(CategoryScale, LinearScale, PointElement, DoughnutController, LineElement, BarElement, ArcElement, RadialLinearScale, Tooltip, Legend, ChartDataLabels, BubbleController, ScatterController, PieController, RadarController);


const ChartPage = () => {

    // Basic Line Chart
    const LinechartOption = {
        labels: [
            "August",
            "September",
            "October",
            "November",
            "December",
            "January",
            "February",
        ],
        datasets: [
            {
                label: "Line Chart",
                data: [65, 59, 80, 81, 56, 55, 40],
                fill: false,
                borderColor: "rgba(8, 155, 171, 1)",
                tension: 0.1,
            },
        ],
        options: {
            legend: {
                display: false,
            },
            plugins: {
                tooltip: {
                    enabled: false,
                },
                datalabels: {
                    display: false,
                },
            },
        },
    };

    //  Bar Chart
    const barchart_data = {
        labels: ['August', 'September', 'October', 'November', 'December', 'January', 'February'],
        datasets: [{
            label: 'Bar Chart',
            data: [65, 59, 80, 91, 56, 55, 40],
            backgroundColor: 'rgba(8, 155, 171, 1)',
            borderColor: 'rgba(8, 155, 171, 1)',
            borderWidth: 1,
        }],
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    enabled: false,
                },
                datalabels: {
                    display: false,
                },
            },
            scales: {
                y: {
                    suggestedMin: 45,
                    stepSize: 5, // Specify your desired step size for y-axis here
                },
            },
        }
    };

    // Area Option 
    const area_option = {
        labels: ['January', 'February', 'March', 'April', 'May'],
        datasets: [
            {
                label: 'Area Chart',
                data: [10, 20, 15, 30, 25],
                borderColor: 'rgba(8, 155, 171, 1)',
                backgroundColor: 'rgba(8, 155, 171, 0.2)',
            }
        ],
        options: {
            scales: {
                y: {
                    min: 0, beginAtZero: true,
                    ticks: {
                        stepSize: 5,
                    }
                }
            },
            plugins: {
                tooltip: {
                    enabled: false,
                },
                datalabels: {
                    display: false,
                },
            }
        }
    };

    // Donut Chart
    useEffect(() => {
        const doughnutChart = document.getElementById('echart-doughnut');

        if (doughnutChart) {
            doughnutChart.width = 300;
            doughnutChart.height = 275;

            new ChartJS(doughnutChart, {
                type: 'doughnut',
                data: {
                    labels: ['January', 'February', 'March', 'April', 'May'],
                    datasets: [
                        {
                            label: 'Donut Chart',
                            data: [10, 20, 15, 30, 25],
                            backgroundColor: [
                                'rgba(8, 155, 171, 1)',
                                'rgba(252, 159, 91, 1)',
                                'rgba(242, 99, 97, 1)',
                                'rgba(87, 222, 83, 1)',
                                'rgba(97, 226, 252, 1)',
                            ],
                            hoverOffset: 4,
                        },
                    ],
                },
                options: {
                    maintainAspectRatio: false,
                    plugins: {
                        tooltip: {
                            enabled: false,
                        },
                        datalabels: {
                            display: false,
                        },
                    },
                },
            });
        }

        return () => {
        };
    }, []);

    // Bubble Chart
    useEffect(() => {
        const bubbleChart = document.getElementById('echart-bubble');
        if (bubbleChart) {
            new ChartJS(bubbleChart, {
                type: 'bubble',
                data: {
                    datasets: [
                        {
                            label: 'Product One',
                            data: [
                                { x: 20, y: 29, r: 10 },
                                { x: 21, y: 25, r: 10 },
                                { x: 22, y: 24, r: 10 },
                                { x: 24, y: 28, r: 10 },
                                { x: 25, y: 21, r: 10 },
                                { x: 26, y: 26, r: 10 },
                                { x: 27, y: 25, r: 10 },
                                { x: 28, y: 22, r: 10 },
                                { x: 29, y: 23, r: 10 },
                                { x: 30, y: 20, r: 10 },
                            ],
                            backgroundColor: 'rgba(242, 99, 97, 1)',
                        },
                        {
                            label: 'Product Two',
                            data: [
                                { x: 20, y: 22, r: 10 },
                                { x: 22, y: 26, r: 10 },
                                { x: 23, y: 24, r: 10 },
                                { x: 24, y: 22, r: 10 },
                                { x: 25, y: 23, r: 10 },
                                { x: 26, y: 24, r: 10 },
                                { x: 27, y: 28, r: 10 },
                                { x: 28, y: 20, r: 10 },
                                { x: 29, y: 27, r: 10 },
                                { x: 30, y: 29, r: 10 },
                            ],
                            backgroundColor: 'rgba(8, 155, 171, 1)',
                        },
                        {
                            label: 'Product Three',
                            data: [
                                { x: 20, y: 26, r: 10 },
                                { x: 22, y: 28, r: 10 },
                                { x: 23, y: 22, r: 10 },
                                { x: 24, y: 25, r: 10 },
                                { x: 25, y: 25, r: 10 },
                                { x: 26, y: 20, r: 10 },
                                { x: 27, y: 30, r: 10 },
                                { x: 28, y: 28, r: 10 },
                                { x: 29, y: 25, r: 10 },
                                { x: 30, y: 22, r: 10 },
                            ],
                            backgroundColor: 'rgba(97, 226, 252, 1)',
                        },
                    ],
                },
                options: {
                    plugins: {
                        tooltip: {
                            enabled: false,
                        },
                        datalabels: {
                            display: false,
                        },
                    },
                }
            });
        }
    }, []);

    // Scatter Chart
    const chartRef = useRef(null);
    const scatterChartInstance = useRef(null);

    useEffect(() => {

        const ctx = chartRef.current.getContext('2d');
        if (scatterChartInstance.current) {
            scatterChartInstance.current.destroy();
        }
        scatterChartInstance.current = new ChartJS(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Product 1',
                        data: [
                            { x: 10, y: 0.0 },
                            { x: 12, y: 0.1 },
                            { x: 13, y: 0.2 },
                            { x: 14, y: 0.2 },
                            { x: 15, y: 0.5 },
                            { x: 16, y: 0.4 },
                            { x: 17, y: 0.5 },
                            { x: 18, y: 0.3 },
                            { x: 19, y: 0.1 },
                            { x: 20, y: 0.5 },
                            { x: 21, y: 0.4 },
                            { x: 22, y: 0.2 },
                        ],
                        backgroundColor: 'rgba(242, 99, 97, 1)',
                    },
                    {
                        label: 'Product 2',
                        data: [
                            { x: 10, y: 0.5 },
                            { x: 12, y: 0.4 },
                            { x: 13, y: 0.3 },
                            { x: 14, y: 0.2 },
                            { x: 15, y: 0.1 },
                            { x: 16, y: 0.2 },
                            { x: 17, y: 0.1 },
                            { x: 18, y: 0.2 },
                            { x: 19, y: 0.3 },
                            { x: 20, y: 0.4 },
                            { x: 21, y: 0.5 },
                            { x: 22, y: 0.0 },
                        ],
                        backgroundColor: 'rgba(8, 155, 171, 1)',
                    },
                    {
                        label: 'Product 3',
                        data: [
                            { x: 10, y: 0.25 },
                            { x: 12, y: 0.3 },
                            { x: 13, y: 0.3 },
                            { x: 14, y: 0.4 },
                            { x: 15, y: 0.3 },
                            { x: 16, y: 0.1 },
                            { x: 17, y: 0.5 },
                            { x: 18, y: 0.2 },
                            { x: 19, y: 0.3 },
                            { x: 20, y: 0.4 },
                            { x: 21, y: 0.5 },
                            { x: 22, y: 0.0 },
                        ],
                        backgroundColor: 'rgba(97, 226, 252, 1)',
                    },
                ],
            },
            options: {
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                    },
                },
                plugins: {
                    tooltip: {
                        enabled: false,
                    },

                    datalabels: {
                        display: false,
                    },
                },
            },
        });
    }, []);

    // Pie Chart
    useEffect(() => {

        const pieChart = document.getElementById('echart-pie-1');

        if (pieChart) {
            pieChart.width = 300;
            pieChart.height = 275;

            new ChartJS(pieChart, {
                type: 'pie',
                data: {
                    labels: ['January', 'February', 'March', 'April', 'May'],
                    datasets: [
                        {
                            label: 'Donut Chart',
                            data: [10, 20, 15, 30, 25],
                            backgroundColor: [
                                'rgba(8, 155, 171, 1)',
                                'rgba(252, 159, 91, 1)',
                                'rgba(242, 99, 97, 1)',
                                'rgba(87, 222, 83, 1)',
                                'rgba(97, 226, 252, 1)',
                            ],
                            hoverOffset: 4,
                        },
                    ],
                },
                options: {
                    maintainAspectRatio: false,
                    plugins: {
                        tooltip: {
                            enabled: false,
                        },

                        datalabels: {
                            display: false,
                        },
                    },
                },
            });
        }

    }, []);

    // Radar Chart
    useEffect(() => {
        const radarChart = document.getElementById('echart-radar');

        if (radarChart) {
            radarChart.width = 300;
            radarChart.height = 275;

            new ChartJS(radarChart, {
                type: 'radar',
                data: {
                    labels: [
                        'Eating',
                        'Drinking',
                        'Sleeping',
                        'Designing',
                        'Coding',
                        'Cycling',
                        'Running',
                    ],
                    datasets: [
                        {
                            label: 'Day 1',
                            data: [65, 59, 90, 81, 56, 55, 40],
                            fill: true,
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderColor: 'rgb(255, 99, 132)',
                            pointBackgroundColor: 'rgb(255, 99, 132)',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgb(255, 99, 132)',
                        },
                        {
                            label: 'Day 2',
                            data: [28, 48, 40, 19, 96, 27, 100],
                            fill: true,
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgb(54, 162, 235)',
                            pointBackgroundColor: 'rgb(54, 162, 235)',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgb(54, 162, 235)',
                        },
                    ],
                },
                options: {
                    maintainAspectRatio: false,
                    elements: {
                        line: {
                            borderWidth: 3,
                        },
                    },
                    plugins: {
                        tooltip: {
                            enabled: false,
                        },

                        datalabels: {
                            display: false,
                        },
                    },
                },
            });
        }

    }, []);


    return (
        <>
            {/* <h1>Chart Page </h1> */}
            <Row>
                <Col xs={12} lg={6}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between ">
                            <Card.Header.Title>
                                <h4 className="card-title">Basic Line Chart</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body className="d-flex align-items-center justify-content-center pt-0">
                            <Line data={LinechartOption} options={LinechartOption.options} />

                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} lg={6}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between ">
                            <Card.Header.Title>
                                <h4 className="card-title">Bar Chart</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body className="d-flex align-items-center justify-content-center pt-0">
                            <Bar data={barchart_data} options={barchart_data.options} />
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} lg={6}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between ">
                            <Card.Header.Title>
                                <h4 className="card-title">Area Chart</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body className="d-flex align-items-center justify-content-center pt-0">
                            <Line data={area_option} options={area_option.options} />
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} lg={6}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between ">
                            <Card.Header.Title>
                                <h4 className="card-title">Donut Chart</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body className="d-flex align-items-center justify-content-center pt-0">
                            <div style={{ width: '400%', height: '348px' }}>
                                <canvas id="echart-doughnut"></canvas>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} lg={6}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between ">
                            <Card.Header.Title>
                                <h4 className="card-title">Bubble Chart</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body className="d-flex align-items-center justify-content-center pt-0">
                            <div style={{ width: '400%', height: '300px' }}>
                                <canvas id="echart-bubble"></canvas>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} lg={6}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between ">
                            <Card.Header.Title>
                                <h4 className="card-title">Scatter Chart</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body className="d-flex align-items-center justify-content-center pt-0">
                            <div style={{ width: '400%', height: '300px' }}>
                                <canvas ref={chartRef} ></canvas>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} lg={6}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between ">
                            <Card.Header.Title>
                                <h4 className="card-title">Pie Chart</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body className="d-flex align-items-center justify-content-center pt-0">
                            <div style={{ width: '400%', height: '300px' }}>
                                <canvas id="echart-pie-1"></canvas>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} lg={6}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between ">
                            <Card.Header.Title>
                                <h4 className="card-title">Radar Chart</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body className="d-flex align-items-center justify-content-center pt-0">
                            <div style={{ width: '400%', height: '300px' }}>
                                <canvas id="echart-radar"></canvas>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

            </Row>
        </>
    )
}

export default ChartPage
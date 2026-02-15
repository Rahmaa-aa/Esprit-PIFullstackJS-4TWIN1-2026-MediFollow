import React, { useEffect, useRef } from "react";
import { Col, Container, Row } from "react-bootstrap";
import Card from "../../components/Card";
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';


const EChart = () => {
    const basicline_option = {
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            data: [150, 230, 224, 218, 135, 147, 260],
            type: 'line',
            itemStyle: {
                color: 'rgba(8, 155, 171, 1)'
            }
        }]
    };

    const Echartbar_option = {
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
            type: 'value',
        },
        series: [{
            data: [120, 200, 150, 80, 70, 110, 130],
            type: 'bar',
            itemStyle: {
                color: 'rgba(8, 155, 171, 1)',
            }
        }]
    };


    const Echartpie_option = {
        tooltip: {
            trigger: 'item'
        },
        legend: {
            orient: 'vertical',
            left: 'left'
        },
        series: [
            {
                name: 'Access From',
                type: 'pie',
                radius: '50%',
                data: [
                    { value: 1048, name: 'January' },
                    { value: 735, name: 'February' },
                    { value: 580, name: 'March' },
                    { value: 484, name: 'April' },
                    { value: 300, name: 'May' }
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };

    useEffect(() => {
        const initializeChart = () => {
            const isDarkTheme = document.documentElement.getAttribute('data-bs-theme') === 'dark';
            const backgroundColor = isDarkTheme ? 'transparent' : '';

            // Update chart options if necessary (if you're changing anything)
            // Note: ReactECharts will automatically handle the rendering.
        };

        initializeChart();

        const observer = new MutationObserver(initializeChart);
        observer.observe(document.documentElement, { attributes: true });

        return () => {
            observer.disconnect();
        };
    }, []);




    const echartBubbleData = [
        [
            [5, 30, 27662440, 'Product 1'],
            [10, 50, 27662441, 'Product 1'],
            [20, 60, 27662442, 'Product 1'],
            [30, 50, 27662443, 'Product 1'],
            [40, 77.4, 27662444, 'Product 1'],
        ],
        [
            [10, 60, 276624470, 'Product 2'],
            [20, 45, 276624471, 'Product 2'],
            [30, 60, 276624472, 'Product 2'],
            [40, 40, 276624473, 'Product 2'],
            [50, 50, 276624474, 'Product 2'],
        ],
        [
            [5, 40, 276624450, 'Product 3'],
            [20, 70, 276624451, 'Product 3'],
            [30, 40, 276624452, 'Product 3'],
            [40, 55, 276624453, 'Product 3'],
            [50, 65, 276624454, 'Product 3'],
        ]
    ];
    const Bubblechart_option = {
        legend: {
            left: '25%',
            bottom: '3%',
            data: ['Product 1', 'Product 2', 'Product 3']
        },
        grid: {
            left: '8%',
            top: '10%'
        },
        xAxis: {
            splitLine: {
                lineStyle: {
                    type: 'dashed'
                }
            }
        },
        yAxis: {
            splitLine: {
                lineStyle: {
                    type: 'dashed'
                }
            },
            scale: true
        },

        series: echartBubbleData.map((bubbleData, idx) => ({
            name: 'Bubble ' + idx,
            data: bubbleData,
            type: 'scatter',
            symbolSize: data => Math.sqrt(data[2]) / 5e2,
            emphasis: {
                focus: 'series'
            }
        }))
    };


    const echartAreaRef = useRef(null);

    const Areachart_option = {
        color: "#089bab",
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            data: [320, 332, 301, 334, 390, 330, 320],
            type: 'line',
            areaStyle: {}
        }]
    };

    useEffect(() => {
        const echartArea = echartAreaRef.current.getEchartsInstance();

        // Resize chart on window resize
        const handleResize = () => {
            echartArea.resize();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const echartDoughnutRef = useRef(null);

    const getLegendPosition = () => {
        return window.innerWidth <= 768 ? { top: '0%', left: 'center' } : { top: '5%', left: 'center' };
    };

    const DoughnutChart_option = {
        tooltip: {
            trigger: 'item'
        },
        legend: getLegendPosition(),
        series: [
            {
                name: 'Access From',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 40,
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: [
                    { value: 1048, name: 'January' },
                    { value: 735, name: 'February' },
                    { value: 580, name: 'March' },
                    { value: 484, name: 'April' },
                    { value: 300, name: 'May' }
                ]
            }
        ]
    };

    const initializeChart = () => {
        const isDarkTheme = document.documentElement.getAttribute('data-bs-theme') === 'dark';
        const myChart = echartDoughnutRef.current.getEchartsInstance();

        myChart.setOption({
            ...DoughnutChart_option,
            legend: getLegendPosition(),
            backgroundColor: isDarkTheme ? 'transparent' : ''
        });

        const handleResize = () => {
            myChart.resize();
            myChart.setOption({
                legend: getLegendPosition() // Update legend position on resize
            });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    };

    useEffect(() => {
        initializeChart();

        const observer = new MutationObserver(() => {
            initializeChart();
        });

        observer.observe(document.documentElement, {
            attributes: true
        });

        return () => {
            observer.disconnect();
        };
    }, []);


    const echartRadarRef = useRef(null);

    const Radarchart_option = {
        tooltip: {},
        radar: {
            indicator: [
                { name: 'Sales', max: 6500 },
                { name: 'Administration', max: 16000 },
                { name: 'Information Technology', max: 30000 },
                { name: 'Customer Support', max: 38000 },
                { name: 'Development', max: 52000 },
                { name: 'Marketing', max: 25000 }
            ]
        },
        series: [{
            name: 'Budget vs spending',
            type: 'radar',
            data: [
                {
                    value: [4300, 10000, 28000, 35000, 50000, 19000],
                    name: 'Allocated Budget'
                },
                {
                    value: [5000, 14000, 28000, 31000, 42000, 21000],
                    name: 'Actual Spending'
                }
            ]
        }],
    };

    const initializeradarChart = () => {
        const myChart = echartRadarRef.current.getEchartsInstance();

        myChart.setOption(Radarchart_option);

        const handleResize = () => {
            myChart.resize();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    };

    useEffect(() => {
        initializeradarChart();
    }, []);

    const echartScatterRef = useRef(null);

    const Scatterchart_option = {
        xAxis: {},
        yAxis: {},
        series: [{
            symbolSize: 20,
            data: [
                [10.0, 8.04],
                [8.0, 6.95],
                [13.0, 7.58],
                [9.0, 8.81],
                [11.0, 8.33],
                [14.0, 9.96],
                [6.0, 7.24],
                [4.0, 4.26],
                [12.0, 10.84],
                [7.0, 4.82],
                [5.0, 5.68]
            ],
            type: 'scatter'
        }]
    };

    const initializeScatterChart = () => {
        const myChart = echartScatterRef.current.getEchartsInstance();

        myChart.setOption(Scatterchart_option);

        const handleResize = () => {
            myChart.resize();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    };

    useEffect(() => {
        initializeScatterChart();
    }, []);


    return (
        <>
            <Row>
                <Col xs={12} lg={6}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <Card.Header.Title>
                                <h4 className="card-title">Basic Line Chart</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body className="pt-0">
                            <div id="echart-basic-line"></div>
                            <ReactECharts
                                option={basicline_option}
                                style={{ width: '100%', height: '400px' }}
                                notMerge={true}
                                lazyUpdate={true}
                                className="custom-chart"
                            />
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} lg={6}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <Card.Header.Title>
                                <h4 className="card-title">Bar Chart</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body className="pt-0">
                            <div id="echart-bar"  ></div>
                            <ReactECharts
                                option={Echartbar_option}
                                style={{ height: '100%', width: '100%' }}
                                notMerge={true}
                                lazyUpdate={true}
                                className="custom-chart"
                            />
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} lg={6}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <Card.Header.Title>
                                <h4 className="card-title">Pie Chart</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body className="pt-0">
                            <div id="echart-pie" ></div>
                            <ReactECharts
                                option={Echartpie_option}
                                style={{ height: '400px', width: '100%' }}
                                className="custom-chart"
                            />
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} lg={6}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <Card.Header.Title>
                                <h4 className="card-title">Bubble Chart</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body className="pt-0">
                            <div id="echart-bubble" ></div>
                            <ReactECharts
                                option={Bubblechart_option}
                                style={{ height: '400px', width: '100%' }}
                                onChartReady={chart => {
                                    window.addEventListener('resize', () => {
                                        chart.resize();
                                    });
                                }}
                                className="custom-chart"
                            />
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} lg={6}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <Card.Header.Title>
                                <h4 className="card-title">Area Chart</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body className="pt-0">
                            <div id="echart-area"  ></div>
                            <ReactECharts
                                ref={echartAreaRef}
                                option={Areachart_option}
                                style={{ height: '400px', width: '100%' }}
                                className="custom-chart"
                            />
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} lg={6}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <Card.Header.Title>
                                <h4 className="card-title">Doughnut Chart</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body className="pt-0">
                            <div id="echart-doughnut1"  ></div>
                            <ReactECharts
                                ref={echartDoughnutRef}
                                option={DoughnutChart_option}
                                style={{ height: '400px', width: '100%' }}
                                className="custom-chart"
                            />
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} lg={6}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <Card.Header.Title>
                                <h4 className="card-title">Radar Chart</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body className="pt-0">
                            <div id="echart-radar" ></div>
                            <ReactECharts
                                ref={echartRadarRef}
                                option={Radarchart_option}
                                style={{ height: '400px', width: '100%' }}
                                className="custom-chart"
                            />
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} lg={6}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <Card.Header.Title>
                                <h4 className="card-title">Scatter Chart</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body className="pt-0">
                            <div id="echart-scatter"></div>
                            <ReactECharts
                                ref={echartScatterRef}
                                option={Scatterchart_option}
                                style={{ height: '400px', width: '100%' }} // Adjust as needed
                                className="custom-chart"
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default EChart
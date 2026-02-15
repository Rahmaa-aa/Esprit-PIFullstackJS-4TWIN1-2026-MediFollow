import React, { useState, useEffect } from "react";
import { Row, Col, ProgressBar, Button, Badge, Table, Dropdown, ListGroup } from "react-bootstrap";
import Card from "../components/Card";
import ReactApexChart from 'react-apexcharts';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Scrollbar from "smooth-scrollbar";
import { Link } from "react-router-dom";
import Chart from 'react-apexcharts';

const generatePath = (path) => {
    return window.origin + import.meta.env.BASE_URL + path;
};

const Index = () => {
    const backgroundImage = generatePath("/assets/images/page-img/38.png");
    const userImage = generatePath("/assets/images/user/11.png");


    const [wavechart7, setWavechart7] = useState({
        chart: {
            height: 80,
            type: 'area',
            animations: {
                enabled: true,
                easing: 'linear',
                dynamicAnimation: {
                    speed: 2000,
                },
            },
            toolbar: {
                show: false,
            },
            sparkline: {
                enabled: true,
            },
            group: 'sparklines',
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: 'smooth',
            width: 3,
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.5,
                opacityTo: 0,
            },
        },
        series: [
            {
                name: 'Appointments',
                data: generateSampleData1(),
            },
        ],
        colors: ['#089bab'],
        markers: {
            size: 0,
        },
        xaxis: {
            type: 'datetime',
            labels: {
                show: false,
            },
        },
        yaxis: {
            max: 130,
            labels: {
                show: false,
            },
        },
        legend: {
            show: false,
        },
        grid: {
            show: false,
        },
    });

    useEffect(() => {
        const interval = setInterval(() => {
            updateChart1();
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    function generateSampleData1() {
        const data = [];
        const initialData = [30, 60, 65, 40, 20, 50, 80, 10, 100];
        let time = new Date().getTime() - 777600000;

        initialData.forEach((value) => {
            data.push({
                x: time,
                y: value,
            });
            time += 86400000;
        });

        return data;
    }

    const updateChart1 = () => {
        setWavechart7((prevChart) => {
            const newSeries = [...prevChart.series[0].data];
            const lastDataPoint = newSeries[newSeries.length - 1];

            newSeries.shift();
            newSeries.push({
                x: lastDataPoint.x + 86400000,
                y: Math.floor(Math.random() * 130),
            });

            return {
                ...prevChart,
                series: [
                    {
                        ...prevChart.series[0],
                        data: newSeries,
                    },
                ],
            };
        });
    };

    const [wavechart8, setWavechart8] = useState({
        chart: {
            height: 80,
            type: 'area',
            animations: {
                enabled: true,
                easing: 'linear',
                dynamicAnimation: {
                    speed: 2000,
                },
            },
            toolbar: {
                show: false,
            },
            sparkline: {
                enabled: true,
            },
            group: 'sparklines',
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: 'smooth',
            width: 3,
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.5,
                opacityTo: 0,
            },
        },
        series: [
            {
                name: 'New Patients',
                data: generateSampleData(),
            },
        ],
        colors: ['#fc9f5b'],
        markers: {
            size: 0,
        },
        xaxis: {
            type: 'datetime',
            labels: {
                show: false,
            },
        },
        yaxis: {
            max: 130,
            labels: {
                show: false,
            },
        },
        legend: {
            show: false,
        },
        grid: {
            show: false,
        },
    });

    useEffect(() => {
        const interval = setInterval(() => {
            updateChart();
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    function generateSampleData() {
        const data = [];
        const initialData = [30, 60, 65, 40, 20, 50, 80, 10, 100];
        let time = new Date().getTime() - 777600000;

        initialData.forEach((value) => {
            data.push({
                x: time,
                y: value,
            });
            time += 86400000;
        });

        return data;
    }

    const updateChart = () => {
        setWavechart8((prevChart) => {
            const newSeries = [...prevChart.series[0].data];
            const lastDataPoint = newSeries[newSeries.length - 1];

            newSeries.shift();
            newSeries.push({
                x: lastDataPoint.x + 86400000,
                y: Math.floor(Math.random() * 130),
            });

            return {
                ...prevChart,
                series: [
                    {
                        ...prevChart.series[0],
                        data: newSeries,
                    },
                ],
            };
        });
    };


    // HealthCare Chart
    const [chartOptions] = useState({
        series: [
            {
                name: 'Series1',
                data: [31, 40, 28, 51, 42, 109, 100],
            },
        ],
        chart: {
            height: 340,
            type: 'area',
            rtl: true, // Enabling RTL for the chart
        },
        colors: ['#089bab'],
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: 'smooth',
        },
        xaxis: {
            type: 'datetime',
            categories: [
                '2018-09-19T00:00:00.000Z',
                '2018-09-19T01:30:00.000Z',
                '2018-09-19T02:30:00.000Z',
                '2018-09-19T03:30:00.000Z',
                '2018-09-19T04:30:00.000Z',
                '2018-09-19T05:30:00.000Z',
                '2018-09-19T06:30:00.000Z',
            ],
        },
        tooltip: {
            x: {
                format: 'dd/MM/yy HH:mm',
            },
        },
    });

    // Patient Overview chart
    useEffect(() => {
        am4core.useTheme(am4themes_animated);

        // Create chart instance
        const chart = am4core.create('home-chart-03', am4charts.PieChart);
        chart.hiddenState.properties.opacity = 0;

        // Chart data
        chart.data = [
            { country: 'USA', value: 401 },
            { country: 'India', value: 300 },
            { country: 'Australia', value: 200 },
            { country: 'Brazil', value: 100 }
        ];

        // Chart properties
        chart.rtl = true;
        chart.radius = am4core.percent(70);
        chart.innerRadius = am4core.percent(40);
        chart.startAngle = 180;
        chart.endAngle = 360;

        // Create series
        const series = chart.series.push(new am4charts.PieSeries());
        series.dataFields.value = 'value';
        series.dataFields.category = 'country';
        series.colors.list = [
            am4core.color('#089bab'),
            am4core.color('#2ca5b2'),
            am4core.color('#faa264'),
            am4core.color('#fcb07a')
        ];

        // Configure slices
        series.slices.template.cornerRadius = 0;
        series.slices.template.innerCornerRadius = 0;
        series.slices.template.draggable = true;
        series.slices.template.inert = true;
        series.alignLabels = false;

        series.hiddenState.properties.startAngle = 90;
        series.hiddenState.properties.endAngle = 90;

        // Add legend
        chart.legend = new am4charts.Legend();
        // chart.logo.disabled = true;

        return () => {
            chart.dispose();
        };
    }, []);


    const patientProgress = [
        { name: 'Bud Jet', progress: 30, badgeColor: 'badge-primary', mb: 3 },
        { name: 'Barney Cull', progress: 70, badgeColor: 'badge-success', mb: 3 },
        { name: 'Eric Shun', progress: 15, badgeColor: 'badge-danger', mb: 3 },
        { name: 'Rick Shaw', progress: 55, badgeColor: 'badge-warning', mb: 3 },
        { name: 'Ben Effit', progress: 45, badgeColor: 'badge-info', mb: 3 },
        { name: 'Rick Shaw', progress: 55, badgeColor: 'badge-warning', mb: 3 },
        { name: 'Marge Arita', progress: 65, badgeColor: 'badge-primary', mb: 3 },
        { name: 'Barry Cudat', progress: 15, badgeColor: 'badge-danger', mb: 0 },
    ];

    const countryVisits = [
        { country: 'United States', progress: 95, progressColor: 'primary', mt: 0 },
        { country: 'India', progress: 75, progressColor: 'warning', mt: 4 },
        { country: 'Australia', progress: 55, progressColor: 'success', mt: 4 },
        { country: 'Brazil', progress: 25, progressColor: 'danger', mt: 4 },
    ];

    const appointmentsData = [
        { patient: 'Petey Cruiser', doctor: 'Dr. Monty Carlo', date: '20/02/2020', time: '8:00 AM', contact: '+1-202-555-0146' },
        { patient: 'Anna Sthesia', doctor: 'Dr. Pete Sariya', date: '25/02/2020', time: '8:30 AM', contact: '+1-202-555-0164' },
        { patient: 'Paul Molive', doctor: 'Dr. Brock Lee', date: '25/02/2020', time: '9:45 AM', contact: '+1-202-555-0153' },
        { patient: 'Anna Mull', doctor: 'Dr. Barb Ackue', date: '27/02/2020', time: '11:30 AM', contact: '+1-202-555-0154' },
        { patient: 'Paige Turner', doctor: 'Dr. Walter Melon', date: '28/02/2020', time: '3:30 PM', contact: '+1-202-555-0101' },
        { patient: 'Don Stairs', doctor: 'Dr. Arty Ficial', date: '28/02/2020', time: '4:30 PM', contact: '+1-202-555-0176' },
        { patient: 'Pat Agonia', doctor: 'Dr. Barb Ackue', date: '29/02/2020', time: '5:00 PM', contact: '+1-202-555-0194' },
    ];

    const doctorsData = [
        { name: 'Dr. Paul Molive', qualifications: 'MBBS, MD', imgSrc: '/assets/images/user/01.jpg' },
        { name: 'Dr. Barb Dwyer', qualifications: 'MD', imgSrc: '/assets/images/user/02.jpg' },
        { name: 'Dr. Terry Aki', qualifications: 'MBBS', imgSrc: '/assets/images/user/03.jpg' },
        { name: 'Dr. Robin Banks', qualifications: 'MBBS, MD', imgSrc: '/assets/images/user/04.jpg' },
        { name: 'Dr. Barry Wine', qualifications: 'BAMS', imgSrc: '/assets/images/user/05.jpg' },
        { name: 'Dr. Zack Lee', qualifications: 'MS, MD', imgSrc: '/assets/images/user/06.jpg' },
        { name: 'Dr. Otto Matic', qualifications: 'MBBS, MD', imgSrc: '/assets/images/user/07.jpg' },
        { name: 'Dr. Tilly Loo', qualifications: 'MD', imgSrc: '/assets/images/user/08.jpg' },
    ];

    // Wave Chart


    useEffect(() => {
        const scrollbarElement = document.querySelector('.my-scrollbar');

        if (scrollbarElement) {
            Scrollbar.init(scrollbarElement);
        }

        return () => {
            // Cleanup the scrollbar instance
            if (scrollbarElement) {
                Scrollbar.destroy(scrollbarElement);
            }
        };
    }, [])
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prevProgress) => {
                if (prevProgress < 70) {
                    return prevProgress + 5;
                } else {
                    clearInterval(interval);
                    return 70;
                }
            });
        }, 5);

        return () => clearInterval(interval);
    }, []);

    // Set height to be proportional to progress with a max height of 70px
    const dynamicHeight = (progress / 70) * 70; // Max height of 70px


    return (
        <>
            <Row>
                <Col sm={12}>
                    <Row>
                        {/* Card 1 */}
                        <Col md={6} lg={3}>
                            <Card>
                                <Card.Body>
                                    <div className="progress-bar-vertical bg-primary-subtle">
                                        <ProgressBar
                                            variant="primary"
                                            now={70}
                                            className="custom-progress-bar bg-primary"
                                            style={{ height: `${dynamicHeight}%`, transition: 'height 0.5s ease-in-out', }}
                                            aria-valuemin={0}
                                            aria-valuenow={70}
                                            role="progressbar"
                                            max={70}

                                        />
                                    </div>
                                    <span className="d-block line-height-4">10 Feb, 2020</span>
                                    <h4 className="mb-2 mt-2">Hypertensive Crisis</h4>
                                    <p className="mb-0 line-height">Ongoing treatment</p>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Card 2 */}
                        <Col md={6} lg={3}>
                            <Card>
                                <Card.Body>
                                    <div className="progress-bar-vertical bg-danger-subtle">
                                        <ProgressBar
                                            variant="danger"
                                            now={70}
                                            className="custom-progress-bar bg-danger"
                                            style={{ height: `${dynamicHeight}%`, transition: 'height 0.5s ease-in-out', }}
                                            aria-valuemin={0}
                                            aria-valuenow={70}
                                            role="progressbar"
                                        />
                                    </div>
                                    <span className="d-block line-height-4">12 Jan, 2020</span>
                                    <h4 className="mb-2 mt-2">Osteoporosis</h4>
                                    <p className="mb-0 line-height">Incurable</p>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Card 3 */}
                        <Col md={6} lg={3}>
                            <Card>
                                <Card.Body>
                                    <div className="progress-bar-vertical bg-warning-subtle">
                                        <ProgressBar
                                            variant="warning"
                                            now={70}
                                            className="custom-progress-bar bg-warning"
                                            style={{ height: `${dynamicHeight}%`, transition: 'height 0.5s ease-in-out', }}
                                            aria-valuemin={0}
                                            aria-valuenow={70}
                                            role="progressbar"
                                        />
                                    </div>
                                    <span className="d-block line-height-4">15 Feb, 2020</span>
                                    <h4 className="mb-2 mt-2">Hypertensive Crisis</h4>
                                    <p className="mb-0 line-height">Examination</p>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Card 4 */}
                        <Col md={6} lg={3}>
                            <Card>
                                <Card.Body
                                    className="p-0 rounded"
                                    style={{
                                        background: `url(${backgroundImage}) no-repeat center center`,
                                        backgroundSize: "contain",
                                        minHeight: "152px",
                                    }}

                                />
                            </Card>
                        </Col>
                    </Row>
                </Col>

                {/* User Profile Card */}
                <Col lg={4}>
                    <Card className="user-profile-block">
                        <Card.Body>
                            <div className="user-details-block">
                                <div className="user-profile text-center">
                                    <img
                                        src={userImage}
                                        alt="profile-img"
                                        className="rounded-circle img-fluid"
                                        style={{ width: "130px" }}
                                    />
                                </div>
                                <div className="text-center mt-3 pb-3">
                                    <h4><b>Bini Jets</b></h4>
                                    <p>Doctor</p>
                                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In in arcu turpis. Nunc</p>
                                    <Button variant="primary-subtle">Assign</Button>
                                </div>
                                <hr />
                                <ul className="doctoe-sedual d-flex align-items-center justify-content-between p-0 m-0">
                                    <li className="text-center">
                                        <h3 className="counter">4500</h3>
                                        <span>Operations</span>
                                    </li>
                                    <li className="text-center">
                                        <h3 className="counter">3.9</h3>
                                        <span>Medical Rating</span>
                                    </li>
                                </ul>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Health Curve Card */}
                <Col lg={8}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <div className="header-title">
                                <h4 className="card-title" >Health Curve</h4>
                            </div>
                        </Card.Header>
                        <Card.Body style={{ position: "relative" }}>
                            <div id="wave-chart-8" className="h-100" style={{ height: '340px', minHeight: '355px' }}>
                                <ReactApexChart
                                    options={chartOptions}
                                    series={chartOptions.series}
                                    type="area"
                                    height={340}
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row>
                {/* First Column */}
                <Col lg={4} className="iq-calendar">
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <h4 className="card-title">Nearest Treatment</h4>
                        </Card.Header>
                        <Card.Body className="course-picker">
                            <Flatpickr
                                options={{
                                    allowInput: true,
                                    inline: true,
                                }}
                                className="inline_flatpickr"
                            />
                            <input type="hidden" name="inline" className="d-none inline_flatpickr" value="" />
                        </Card.Body>
                    </Card>
                </Col>

                {/* Second Column */}
                <Col lg={4}>
                    <Card className="no-body">
                        <Card.Body>
                            <h6>APPOINTMENTS</h6>
                            <h3><b>5075</b></h3>
                        </Card.Body>
                        <div className="wave-chart-container" style={{ height: '80px' }}>
                            <Chart options={wavechart7} series={wavechart7.series} type="area" height={80} />
                        </div>
                    </Card>
                    <Card className="no-body">
                        <Card.Body>
                            <h6>NEW PATIENTS</h6>
                            <h3><b>1200</b></h3>
                        </Card.Body>
                        <div className="wave-chart-container" style={{ height: '80px' }}>
                            <Chart options={wavechart8} series={wavechart8.series} type="area" height={80} />
                        </div>
                    </Card>
                </Col>

                {/* Third Column */}
                <Col lg={4}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <h4 className="card-title">Hospital Management</h4>
                        </Card.Header>
                        <Card.Body>
                            <ProgressBar className="mb-4" style={{ height: '30px' }}>
                                <ProgressBar variant="primary" now={20} label="OPD" />
                                <ProgressBar variant="warning" now={80} label="80%" />
                            </ProgressBar>
                            <ProgressBar className="mb-4" style={{ height: '30px' }}>
                                <ProgressBar variant="primary" now={30} label="Treatment" />
                                <ProgressBar variant="warning" now={70} label="70%" />
                            </ProgressBar>
                            <ProgressBar className="mb-4" style={{ height: '30px' }}>
                                <ProgressBar variant="primary" now={60} label="Laboratory Test" />
                                <ProgressBar variant="warning" now={40} label="40%" />
                            </ProgressBar>
                            <ProgressBar className="mb-4" style={{ height: '30px' }}>
                                <ProgressBar variant="primary" now={40} label="New Patient" />
                                <ProgressBar variant="warning" now={60} label="70%" />
                            </ProgressBar>
                            <ProgressBar className="mb-4" style={{ height: '30px' }}>
                                <ProgressBar variant="primary" now={35} label="Doctors" />
                                <ProgressBar variant="warning" now={65} label="95%" />
                            </ProgressBar>
                            <ProgressBar style={{ height: '30px' }}>
                                <ProgressBar variant="primary" now={28} label="Discharge" />
                                <ProgressBar variant="warning" now={72} label="72%" />
                            </ProgressBar>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row>
                {/* Patient Progress Section */}
                <Col lg={3}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <div className="header-title">
                                <h4 className="card-title">Patient Progress</h4>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <ul className="list-unstyled mb-0">
                                {patientProgress.map((patient, index) => (
                                    <li
                                        key={index}
                                        className={`d-flex align-items-center justify-content-between mb-${patient.mb}`}
                                    >
                                        <div className="media-support-info">
                                            <h6>{patient.name}</h6>{patient.subname}
                                        </div>
                                        <Badge className={`badge ${patient.badgeColor}`}>{patient.progress}%</Badge>
                                    </li>
                                ))}
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Patient Overview Chart */}
                <Col lg={6}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <h4>Patient Overview</h4>
                        </Card.Header>
                        <Card.Body>
                            <div id="home-chart-03" className="chart" style={{ height: '280px' }}></div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Visits From Countries Section */}
                <Col lg={3}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <div className="header-title">
                                <h4 className="card-title">Visits From Countries</h4>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {countryVisits.map((visit, index) => (
                                <div key={index} className={`details mt-${visit.mt}`}>
                                    <span className="title text-dark">{visit.country}</span>
                                    <div className={`percentage float-end text-${visit.progressColor}`}>
                                        {visit.progress}{" "}
                                        <span>%</span>
                                    </div>
                                    <div className="progress-bar-linear d-inline-block w-100">
                                        <ProgressBar
                                            now={visit.progress}
                                            variant={visit.progressColor}
                                            style={{ height: '6px' }}
                                            className={`shadow-none progress bg-${visit.progressColor}-subtle`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col lg={8}>
                    <Card>
                        <div className="card-header d-flex justify-content-between iq-new-appoinments">
                            <h4 className="card-title">New Appointments</h4>
                            <Dropdown className="appointments-dropdown rtl-appointments-dropdown">
                                <Dropdown.Toggle variant="link" className="custom-toggle">
                                    <span className="ri-more-fill text-gray"></span>
                                </Dropdown.Toggle>

                                <Dropdown.Menu align="end">
                                    <Dropdown.Item href="#" className="d-flex"><i className="ri-eye-fill me-2"></i>View</Dropdown.Item>
                                    <Dropdown.Item href="#" className="d-flex"><i className="ri-delete-bin-6-fill me-2"></i>Delete</Dropdown.Item>
                                    <Dropdown.Item href="#" className="d-flex"><i className="ri-pencil-fill me-2"></i>Edit</Dropdown.Item>
                                    <Dropdown.Item href="#" className="d-flex"><i className="ri-printer-fill me-2"></i>Print</Dropdown.Item>
                                    <Dropdown.Item href="#" className="d-flex"><i className="ri-file-download-fill me-2"></i>Download</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                        <Card.Body>
                            <div className="table-responsive">
                                <Table className="mb-0 table-borderless">
                                    <thead>
                                        <tr>
                                            <th scope="col">Patient</th>
                                            <th scope="col">Doctor</th>
                                            <th scope="col">Date</th>
                                            <th scope="col">Timing</th>
                                            <th scope="col">Contact</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointmentsData.map((appointment, index) => (
                                            <tr key={index}>
                                                <td>{appointment.patient}</td>
                                                <td>{appointment.doctor}</td>
                                                <td>{appointment.date}</td>
                                                <td>{appointment.time}</td>
                                                <td>{appointment.contact}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card>
                        <Card.Header>
                            <h4 className="card-title">Doctors Lists</h4>
                        </Card.Header>
                        <Card.Body >
                            <ListGroup variant="flush" className="my-scrollbar" style={{ height: '277px', outline: 'none' }}>
                                {doctorsData.map((doctor, index) => (
                                    <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center p-0 mb-4 border-0">
                                        <div className="d-flex align-items-center">
                                            <img src={generatePath(doctor.imgSrc)} alt="doctor" className="rounded-circle avatar-40" />
                                            <div className="ms-3">
                                                <h6>{doctor.name}</h6>
                                                <p className="mb-0 font-size-12">{doctor.qualifications}</p>
                                            </div>
                                        </div>
                                        <Dropdown className="appointments-dropdown rtl-appointments-dropdown pe-3 ">
                                            <Dropdown.Toggle variant="link" id={`dropdown-doctor-${index}`} className="custom-toggle">
                                                <i className="ri-more-2-line text-gray"></i>
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu>
                                                <Dropdown.Item href="#" className="d-flex"><i className="ri-eye-line me-2"></i>View</Dropdown.Item>
                                                <Dropdown.Item href="#" className="d-flex"><i className="ri-bookmark-line me-2"></i>Appointment</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                            <Link to="#" className="btn btn-primary-subtle d-block mt-3"><i
                                className="ri-add-line"></i> View
                                All Doctors </Link>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default Index;

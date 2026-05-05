import React, { useEffect, useState } from "react";
import { Row, Col, CardTitle, CardBody, Table, Dropdown } from 'react-bootstrap';
import CountUp from 'react-countup';
import Chart from 'react-apexcharts';

// Swiper Imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from "swiper";
import 'swiper/swiper-bundle.css';
import Card from "../../components/Card";
import ReactApexChart from "react-apexcharts";

const generatePath = (path) => {
    return window.origin + import.meta.env.BASE_URL + path;
};

const HospitalDashboardOne = () => {

    // Hospital Survey Chart
    const options = {
        series: [{
            name: 'Cash Flow',
            data: [1.45, 5.42, 5.9, -0.42, -12.6, -18.1, -18.2, -14.16, -11.1, -6.09, 0.34, 3.88, 13.07,
                5.8, 2, 7.37, 8.1, 13.57, 15.75, 17.1, 19.8, -27.03, -54.4, -47.2, -43.3, -18.6, -48.6,
                -41.1, -39.6, -37.6, -29.4, -21.4, -2.4
            ]
        }],
        chart: {
            type: 'bar',
            height: 350,
            toolbar: {
                show: true
            }
        },
        plotOptions: {
            bar: {
                colors: {
                    ranges: [{
                        from: -100,
                        to: -46,
                        color: '#e64141'
                    }, {
                        from: -45,
                        to: 0,
                        color: '#089bab'
                    }, {
                        from: 0,
                        to: 20,
                        color: '#FC9F5B'
                    }]
                },
                columnWidth: '80%',
            }
        },
        dataLabels: {
            enabled: false,
        },
        yaxis: {
            title: {
                text: 'Growth',
            },
            labels: {
                formatter: function (y) {
                    return y.toFixed(0) + "%";
                }
            }
        },
        xaxis: {
            type: 'datetime',
            categories: [
                '2011-01-01', '2011-02-01', '2011-03-01', '2011-04-01', '2011-05-01', '2011-06-01',
                '2011-07-01', '2011-08-01', '2011-09-01', '2011-10-01', '2011-11-01', '2011-12-01',
                '2012-01-01', '2012-02-01', '2012-03-01', '2012-04-01', '2012-05-01', '2012-06-01',
                '2012-07-01', '2012-08-01', '2012-09-01', '2012-10-01', '2012-11-01', '2012-12-01',
                '2013-01-01', '2013-02-01', '2013-03-01', '2013-04-01', '2013-05-01', '2013-06-01',
                '2013-07-01', '2013-08-01', '2013-09-01'
            ],
            labels: {
                rotate: -90
            }
        }
    };

    //Hospital Staff Swiper
    const staffMembers = [
        {
            name: 'Dr. Paul Molive',
            role: 'Doctor',
            image: '/assets/images/user/05.jpg',
            hospital: 'California Hospital Medical Center',
        },
        {
            name: 'Dr. Jane Smith',
            role: 'Nurse',
            image: '/assets/images/user/06.jpg',
            hospital: 'California Hospital Medical Center',
        },
        {
            name: 'Dr. Mark Johnson',
            role: 'Surgeon',
            image: '/assets/images/user/07.jpg',
            hospital: 'California Hospital Medical Center',
        },
        {
            name: 'Dr. Emily Davis',
            role: 'Doctor',
            image: '/assets/images/user/08.jpg',
            hospital: 'California Hospital Medical Center',
        },
        {
            name: 'Dr. Sarah Brown',
            role: 'Surgeon',
            image: '/assets/images/user/09.jpg',
            hospital: 'California Hospital Medical Center',
        },
        {
            name: 'Dr. Mike Wilson',
            role: 'OT Assistant',
            image: '/assets/images/user/10.jpg',
            hospital: 'California Hospital Medical Center',
        },
    ];

    // Operation section Table
    const patients = [
        {
            image: '/assets/images/user/01.jpg',
            name: 'Petey Cruiser',
            doctors: ['/assets/images/user/05.jpg', '/assets/images/user/06.jpg', '/assets/images/user/07.jpg'],
            date: '12-02-2020',
            report: 'pdf',
            disease: 'Fracture',
        },
        {
            image: '/assets/images/user/02.jpg',
            name: 'Anna Sthesia',
            doctors: ['/assets/images/user/05.jpg', '/assets/images/user/06.jpg', '/assets/images/user/07.jpg'],
            date: '14-02-2020',
            report: 'pdf',
            disease: 'Cataract surgery',
        },
        {
            image: '/assets/images/user/03.jpg',
            name: 'Paul Molive',
            doctors: ['/assets/images/user/05.jpg', '/assets/images/user/06.jpg', '/assets/images/user/07.jpg'],
            date: '14-02-2020',
            report: 'pdf',
            disease: 'Cancer',
        },
        {
            image: '/assets/images/user/04.jpg',
            name: 'Anna Mull',
            doctors: ['/assets/images/user/05.jpg', '/assets/images/user/06.jpg', '/assets/images/user/07.jpg'],
            date: '16-02-2020',
            report: 'pdf',
            disease: 'Hysterectomy',
        },
        {
            image: '/assets/images/user/05.jpg',
            name: 'Ruby Saul',
            doctors: ['/assets/images/user/05.jpg', '/assets/images/user/06.jpg', '/assets/images/user/07.jpg'],
            date: '18-02-2020',
            report: 'pdf',
            disease: 'Cancer',
        },
    ];

    const activities = [
        { time: '5 min ago', status: 'Active', color: 'fill', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque scelerisque' },
        { time: '6 min ago', status: 'Away', color: 'bg-success', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque scelerisque' },
        { time: '10 min ago', status: 'Active', color: 'bg-info', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque scelerisque' },
        { time: '15 min ago', status: 'Offline', color: 'bg-warning', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque scelerisque' },
        { time: '18 min ago', status: 'Away', color: 'bg-danger', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque scelerisque' },
    ];

    const appointments = [
        { count: 120, text: 'Total Appointments', img: '/assets/images/page-img/30.png' },
        { count: 5000, text: 'Completed Appointments', img: '/assets/images/page-img/31.png' },
        { count: 1500, text: 'Cancelled Appointments', img: '/assets/images/page-img/32.png' },
        { count: 500, text: 'Followup Appointments', img: '/assets/images/page-img/33.png' },
    ]

    // Radial bar chart options and series
    const [radialBarOptions] = useState({
        chart: {
            height: 290,
            type: 'radialBar',
        },
        plotOptions: {
            radialBar: {
                dataLabels: {
                    name: {
                        fontSize: '22px',
                    },
                    value: {
                        fontSize: '16px',
                    },
                    total: {
                        show: true,
                        label: 'Total',
                        formatter: function () {
                            return 249;
                        },
                    },
                },
            },
        },
        series: [44, 55, 67, 83],
        labels: ['Apples', 'Oranges', 'Bananas', 'Berries'],
        colors: ['#089bab', '#FC9F5B', '#75DDDD', '#ffb57e'],
    });

    const chartOptions = {
        chart: {
            height: 150,
            type: 'area',
            animations: {
                enabled: true,
                easing: 'linear',
                dynamicAnimation: {
                    speed: 1000
                }
            },
            toolbar: {
                show: false
            },
            sparkline: {
                enabled: true
            },
            group: 'sparklines'
        },
        colors: ['#099fb0'],
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'straight',
            width: 3
        },
        series: [
            {
                data: [50, 70, 45, 90, 80, 83, 43, 50, 43, 83]
            }
        ],
        markers: {
            size: 4
        },
        yaxis: {
            max: 100,
            show: false
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                inverseColors: false,
                opacityFrom: 0.5,
                opacityTo: 0,
                stops: [0, 90, 100]
            }
        },
        legend: {
            show: false
        }
    };


    const chart8Options = {
        chart: {
            height: 150,
            type: 'area',
            animations: {
                enabled: true,
                easing: 'linear',
                dynamicAnimation: {
                    speed: 1000
                }
            },
            toolbar: {
                show: false
            },
            sparkline: {
                enabled: true
            },
            group: 'sparklines'
        },
        colors: ['#fc9f5b'],
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'straight',
            width: 3
        },
        series: [
            {
                data: [50, 70, 45, 90, 80, 83, 43, 50, 43, 83]
            }
        ],
        markers: {
            size: 4
        },
        yaxis: {
            max: 100,
            show: false
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                inverseColors: false,
                opacityFrom: 0.5,
                opacityTo: 0,
                stops: [0, 90, 100]
            }
        },
        legend: {
            show: false
        }
    };

    return (
        <>
            <Row>
                <Col lg={12}>
                    <Row>
                        <Col md={6} lg={3}>
                            <Card className="bg-primary-subtle">
                                <Card.Body>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="rounded-circle card-icon bg-primary">
                                            <i className="ri-user-fill text-white">
                                            </i>
                                        </div>
                                        <div className="text-end">
                                            <h2 className="mb-0 text-primary counter"> <CountUp start={0} end={5600} duration={3} separator="" /></h2>
                                            <h5 className="text-primary">Doctors</h5>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6} lg={3}>
                            <Card className="bg-warning-subtle">
                                <Card.Body>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="rounded-circle card-icon bg-warning">
                                            <i className="ri-women-fill text-white">
                                            </i>
                                        </div>
                                        <div className="text-end">
                                            <h2 className="mb-0 text-warning"><CountUp start={0} end={3450} duration={3} separator="" /></h2>
                                            <h5 className="text-warning">Nurses</h5>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6} lg={3}>
                            <Card className="bg-danger-subtle">
                                <Card.Body>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="rounded-circle card-icon bg-danger">
                                            <i className="ri-group-fill text-white">
                                            </i>
                                        </div>
                                        <div className="text-end">
                                            <h2 className="mb-0 text-danger"><CountUp start={0} end={3500} duration={3} separator="" /></h2>
                                            <h5 className="text-danger">Patients</h5>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6} lg={3}>
                            <Card className="bg-info-subtle">
                                <Card.Body>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="rounded-circle card-icon bg-info">
                                            <i className="ri-hospital-line text-white">
                                            </i>
                                        </div>
                                        <div className="text-end">
                                            <h2 className="mb-0 text-info"><CountUp start={0} end={4500} duration={3} separator="" /></h2>
                                            <h5 className="text-info">Pharmacists</h5>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>
                <Col sm={12}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <div className="header-title">
                                <h4 className="card-title">Hospital Survey</h4>
                            </div>
                        </Card.Header>
                        <Card.Body className="pb-0 mt-3 pt-0">
                            <Row className="text-center">
                                <Col sm={3} xs={6}>
                                    <h4 className="margin-0">$ 305</h4>
                                    <p className="text-muted">Today&apos;s Income</p>
                                </Col>
                                <Col sm={3} xs={6}>
                                    <h4 className="margin-0">$ 999</h4>
                                    <p className="text-muted">This Week&apos;s Income</p>
                                </Col>
                                <Col sm={3} xs={6}>
                                    <h4 className="margin-0">$ 4999</h4>
                                    <p className="text-muted">This Month&apos;s Income</p>
                                </Col>
                                <Col sm={3} xs={6}>
                                    <h4 className="margin-0">$ 90,000</h4>
                                    <p className="text-muted">This Year&apos;s Income</p>
                                </Col>
                            </Row>
                        </Card.Body>
                        <Chart options={options} series={options.series} type="bar" height={350} />
                    </Card>
                </Col>
                <Col sm={12}>
                    <Card>
                        <div className="card-header d-flex justify-content-between position-relative pb-3">
                            <div className="header-title">
                                <CardTitle as="h4">Hospital Staff</CardTitle>
                            </div>
                            <div className="iqonic-navigation-custom d-flex align-items-end">
                                <div className="iqonic-navigation" id="navDemo">
                                    <div className="swiper-buttons swiper-button-prev static-position" tabIndex="0" role="button" aria-label="Previous slide">
                                        <i className="ri-arrow-left-s-line text-primary"></i>
                                    </div>
                                    <div className="swiper-buttons swiper-button-next static-position" tabIndex="-1" role="button" aria-label="Next slide">
                                        <i className="ri-arrow-right-s-line"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Card.Body>
                            <Swiper
                                spaceBetween={20}
                                slidesPerView={5}
                                loop={true}
                                navigation={{
                                    prevEl: ".swiper-button-prev",
                                    nextEl: ".swiper-button-next",
                                }}
                                modules={[Navigation, Pagination]}
                                breakpoints={{
                                    1024: {
                                        slidesPerView: 5,
                                    },
                                    768: {
                                        slidesPerView: 3,
                                    },
                                    640: {
                                        slidesPerView: 2,
                                    },
                                    320: {
                                        slidesPerView: 1,
                                    },
                                }}
                            >
                                {staffMembers.map((member, index) => (
                                    <SwiperSlide key={index}>
                                        <div className="docter-list-item-inner rounded text-center">
                                            <div className="donter-profile">
                                                <img src={generatePath(member.image)} className="img-fluid rounded-circle" alt="user-img" />
                                            </div>
                                            <div className="doctor-detail mt-3">
                                                <h5>{member.name}</h5>
                                                <h6>{member.role}</h6>
                                            </div>
                                            <hr />
                                            <div className="doctor-description">
                                                <p className="mb-0 text-center ps-2 pe-2">{member.hospital}</p>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={12} lg={8}>
                    <Row>
                        <Col sm={12}>
                            <Card>
                                <Card.Header className="d-flex justify-content-between align-items-center iq-new-appoinments">
                                    <Card.Header.Title>
                                        <CardTitle as="h4">Operations</CardTitle>
                                    </Card.Header.Title>
                                    <div className="card-header-toolbar d-flex align-items-center">
                                        <Dropdown className="appointments-dropdown rtl-appointments-dropdown">
                                            <Dropdown.Toggle variant="link" id="dropdownMenuButton5" className="p-0 border-0" >
                                                <span className="ri-more-fill" />
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
                                </Card.Header>
                                <Card.Body className="pt-0">
                                    <div className="table-responsive">
                                        <Table className="mb-0 table-borderless">
                                            <thead>
                                                <tr>
                                                    <th className="text-center">Patient</th>
                                                    <th className="text-center">Patient Name</th>
                                                    <th className="text-center">Doctors Team</th>
                                                    <th className="text-center">Date Of Operation</th>
                                                    <th className="text-center">Report</th>
                                                    <th className="text-center">Diseases</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {patients.map((patient, index) => (
                                                    <tr key={index}>
                                                        <td className="text-center">
                                                            <img
                                                                className="rounded-circle img-fluid avatar-40"
                                                                src={generatePath(patient.image)}
                                                                alt="profile"
                                                            />
                                                        </td>
                                                        <td className="text-center">{patient.name}</td>
                                                        <td>
                                                            <div className="media-group text-center">
                                                                {patient.doctors.map((doctor, idx) => (
                                                                    <a href="#" className="media" key={idx}>
                                                                        <img
                                                                            className="img-fluid avatar-40 rounded-circle"
                                                                            src={generatePath(doctor)}
                                                                            alt="doctor"
                                                                        />{" "}
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="text-center">{patient.date}</td>
                                                        <td className="text-center">
                                                            <i className="ri-file-pdf-line font-size-16 text-danger" />
                                                        </td>
                                                        <td className="text-center">{patient.disease}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={12} lg={6}>
                            <Row>
                                {appointments.map((info, index) => (
                                    <Col md={6} lg={12} key={index}>
                                        <Card>
                                            <Card.Body>
                                                <div className="info-box d-flex align-items-center p-3">
                                                    <div className="info-image me-3">
                                                        <img src={generatePath(info.img)} className="img-fluid" alt="info-box" />
                                                    </div>
                                                    <div className="info-text">
                                                        <h3>{info.count}</h3>
                                                        <span>{info.text}</span>
                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </Col>
                        <Col md={12} lg={6}>
                            <Card className="iq-new-appoinments">
                                <Card.Header className="d-flex justify-content-between align-items-center recent-activity">
                                    <Card.Header.Title>
                                        <h4 className="card-title">Recent Activity</h4>
                                    </Card.Header.Title>
                                    <Dropdown className="appointments-dropdown rtl-appointments-dropdown">
                                        <Dropdown.Toggle bsPrefix=" " as="span" variant="link" className="p-0 text-primary">
                                            View All
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu align="end">
                                            <Dropdown.Item href="#" className="d-flex"><i className="ri-eye-fill me-2"></i>View</Dropdown.Item>
                                            <Dropdown.Item href="#" className="d-flex"><i className="ri-delete-bin-6-fill me-2"></i>Delete</Dropdown.Item>
                                            <Dropdown.Item href="#" className="d-flex"><i className="ri-pencil-fill me-2"></i>Edit</Dropdown.Item>
                                            <Dropdown.Item href="#" className="d-flex"><i className="ri-printer-fill me-2"></i>Print</Dropdown.Item>
                                            <Dropdown.Item href="#" className="d-flex"><i className="ri-file-download-fill me-2"></i>Download</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                    {/* </div> */}
                                </Card.Header>
                                <Card.Body>
                                    <ul className="timeline recent-activity">
                                        {activities.map((activity, index) => (
                                            <li key={index}>
                                                <div className={`timeline-dots-fill ${activity.color}`}></div>
                                                <h6 className="float-start mb-2">
                                                    <i className="ri-user-fill me-1">
                                                    </i>
                                                    {activity.time}
                                                </h6>
                                                <small className="float-end mt-1">{activity.status}</small>
                                                <div className="d-inline-block w-100">
                                                    <p>{activity.description}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>
                <Col md={12} lg={4}>
                    {/* Total Accident Report Card */}
                    <Card>
                        <Card.Header>
                            <Card.Header.Title >
                                <h4 className="card-title">Total Accident Report</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col sm={6}>
                                    <h3>$40K</h3>
                                </Col>
                            </Row>
                            {/* <div id="chart-7"></div> */}
                            <Chart options={chartOptions} series={chartOptions.series} type="area" height={150} />
                            <Row className="text-center mt-3">
                                <Col sm={6}>
                                    <h6 className="text-truncate d-block">Last Month</h6>
                                    <p className="m-0">358</p>
                                </Col>
                                <Col sm={6}>
                                    <h6 className="text-truncate d-block">Current Month</h6>
                                    <p className="m-0">194</p>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Total Death Report Card */}
                    <Card>
                        <Card.Header>
                            <Card.Header.Title>
                                <h4 className="card-title">Total Death Report</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col sm={6}>
                                    <h3>$20K</h3>
                                </Col>
                            </Row>
                            {/* <div id="chart-8">
                            </div> */}
                            <Chart options={chart8Options} series={chart8Options.series} type="area" height={150} />
                            <Row className="text-center mt-3">
                                <Col sm={6}>
                                    <h6 className="text-truncate d-block">Last Month</h6>
                                    <p className="m-0">220</p>
                                </Col>
                                <Col sm={6}>
                                    <h6 className="text-truncate d-block">Current Month</h6>
                                    <p className="m-0">120</p>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Overall Progress Card */}
                    <Card>
                        <Card.Header>
                            <div className="header-title">
                                <h4 className="card-title">Overall Progress</h4>
                            </div>
                        </Card.Header>
                        <Card.Body className="pt-0">
                            {/* Radial Bar Chart */}
                            <div id="apex-radialbar-chart">
                                <Chart options={radialBarOptions} series={radialBarOptions.series} type="radialBar" height={290} />
                            </div>
                        </Card.Body>

                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default HospitalDashboardOne
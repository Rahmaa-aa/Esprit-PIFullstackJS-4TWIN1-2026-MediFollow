import React, { useEffect } from "react";
import { Row, ProgressBar, Col, Table, Dropdown } from "react-bootstrap";
import ApexCharts from 'apexcharts';
import Card from "../../components/Card";

// Import Image
import img37 from "/assets/images/page-img/37.png"

const generatePath = (path) => {
    return window.origin + import.meta.env.BASE_URL + path;
};

const trainings = [
    { title: "Power Training", imgSrc: '34.png', kcal: '395 kcal / h' },
    { title: "Yoga Training", imgSrc: '35.png', kcal: '395 kcal / h' },
    { title: "Stretching", imgSrc: '36.png', kcal: '395 kcal / h' }
];


const PatientDashboard = () => {
    const userData = {
        name: "Bess Willis",
        age: 27,
        location: "California",
        weight: { current: 60, goal: 55 },
        height: 170,
        steps: { walked: 4532, goal: 6500 },
        burned: { kcal: 325, goal: 800 },
        macros: {
            carbs: 85,
            protein: 65,
            fat: 70,
        },
        profileImage: generatePath(`/assets/images/user/11.png`)
    };

    const chartOptions = {
        series: [{
            name: 'Servings',
            data: [44, 55, 41, 67, 22, 43, 21, 33, 45, 31]
        }],
        annotations: {
            points: [{
                x: 'Bananas',
                seriesIndex: 0,
                label: {
                    borderColor: '#775DD0',
                    offsetY: 0,
                    style: {
                        color: '#fff',
                        background: '#775DD0',
                    },
                    text: 'Bananas are good',
                }
            }]
        },
        chart: {
            height: 280,
            type: 'bar',
            rtl: true
        },
        colors: ['#089bab'],
        plotOptions: {
            bar: {
                columnWidth: '50%',
                borderRadius: 14,
                borderRadiusApplication: 'end'
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            width: 2
        },
        grid: {
            row: {
                colors: ['#fff', '#f2f2f2']
            }
        },
        xaxis: {
            labels: {
                rotate: -45
            },
            categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
            tickPlacement: 'on'
        },
        yaxis: {
            title: {
                text: 'Servings',
            },
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'light',
                type: "horizontal",
                shadeIntensity: 0.25,
                gradientToColors: undefined,
                inverseColors: true,
                opacityFrom: 0.85,
                opacityTo: 0.85,
                stops: [50, 0, 100]
            },
        }
    };

    useEffect(() => {
        const chart = new ApexCharts(document.querySelector("#patient-chart-1"), chartOptions);
        chart.render();
        return () => {
            chart.destroy();
        };
    }, []);

    const myTraining = [
        { training: "TRX Cardio", burned: "350 kcal", spend: "1hr 45m" },
        { training: "Stretching", burned: "180 kcal", spend: "30m" }
    ];

    return (
        <>
            <Row>
                <div className="col-lg-4">
                    <Card className="user-profile-block">
                        <Card.Body className="mt-2">
                            <div className="user-details-block text-center">
                                <img src={userData.profileImage} alt="profile-img" className="avatar-130 img-fluid" />
                                <div className="mt-3">
                                    <h4><b>{userData.name}</b></h4>
                                    <p>{userData.age} years, {userData.location}</p>
                                </div>
                                <ul className="doctoe-sedual d-flex align-items-center justify-content-between p-0 mt-4 mb-0">
                                    <li className="text-center">
                                        <h6 className="text-primary">Weight</h6>
                                        <h3>{userData.weight.current}<span>kg</span></h3>
                                    </li>
                                    <li className="text-center">
                                        <h6 className="text-primary">Height</h6>
                                        <h3>{userData.height}<span>cm</span></h3>
                                    </li>
                                    <li className="text-center">
                                        <h6 className="text-primary">Goal</h6>
                                        <h3>{userData.weight.goal}<span>kg</span></h3>
                                    </li>
                                </ul>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="mt-3">
                        <Card.Body>
                            <div className="patient-steps">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="col-md-6">
                                        <div className="data-block">
                                            <p className="mb-0">Walked</p>
                                            <h5>{userData.steps.walked} steps</h5>
                                        </div>
                                        <div className="data-block mt-3">
                                            <p className="mb-0">My Goal</p>
                                            <h5>{userData.steps.goal} steps</h5>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="progress-round patient-progress mx-auto" data-value="80">
                                            <span className="progress-left">
                                                <span
                                                    className="progress-bar border-secondary"
                                                    style={{ transform: 'rotate(108deg)' }}
                                                ></span>
                                            </span>
                                            <span className="progress-right">
                                                <span
                                                    className="progress-bar border-secondary"
                                                    style={{ transform: 'rotate(180deg)' }}
                                                ></span>
                                            </span>
                                            <div className="progress-value w-100 h-100 rounded-circle d-flex align-items-center justify-content-center text-center">
                                                <div className="h4 mb-0">
                                                    4532<br />
                                                    <span className="font-size-14">left</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                                <ul className="patient-role list-inline d-flex align-items-center justify-content-between p-0 mt-4 mb-0 border-bottom pb-5">
                                    {Object.entries(userData.macros).map(([key, value]) => (
                                        <li key={key} className="text-start">
                                            <h6 className="text-primary">{key.charAt(0).toUpperCase() + key.slice(1)}</h6>
                                            <ProgressBar now={value} variant="primary" className="bg-primary-subtle" style={{ height: '6px' }} />
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <hr />

                            <div className="patient-steps2">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="col-md-6">
                                        <div className="data-block">
                                            <p className="mb-0">Burned</p>
                                            <h5>{userData.burned.kcal} kcal</h5>
                                        </div>
                                        <div className="data-block mt-3">
                                            <p className="mb-0">My Goal</p>
                                            <h5>{userData.burned.goal} kcal</h5>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="progress-round patient-progress mx-auto" data-value="80">
                                            <span className="progress-left">
                                                <span
                                                    className="progress-bar border-secondary"
                                                    style={{ transform: 'rotate(108deg)' }}
                                                ></span>
                                            </span>
                                            <span className="progress-right">
                                                <span
                                                    className="progress-bar border-secondary"
                                                    style={{ transform: 'rotate(180deg)' }}
                                                ></span>
                                            </span>
                                            <div className="progress-value w-100 h-100 rounded-circle d-flex align-items-center justify-content-center text-center">
                                                <div className="h4 mb-0 text-warning">
                                                    325<br />
                                                    <span className="font-size-14">left</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <ul className="patient-role list-inline d-flex align-items-center justify-content-between p-0 mt-4 mb-0">
                                    {Object.entries(userData.macros).map(([key, value]) => (
                                        <li key={key} className="text-start">
                                            <h6 className="text-primary">{key.charAt(0).toUpperCase() + key.slice(1)}</h6>
                                            <ProgressBar now={value} variant="primary" className="bg-primary-subtle" style={{ height: '6px' }} />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-lg-8">
                    <Card>
                        <Card.Body className="pb-0">
                            <Row>
                                <Col sm={12}>
                                    <Card>
                                        <Card.Body className="bg-primary rounded-4 pt-2 pb-2 pe-2">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <p className="mb-0 text-white custom-marigin-right">
                                                    Advice! Connect your Apple Watch for better results.
                                                </p>
                                                <div className="rounded-4 card-icon bg-white">
                                                    <img src={img37} className="img-fluid" alt="icon" />
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                    <Card>
                                        <div className="header-title">
                                            <h4 className="card-title text-primary">Popular Training</h4>
                                        </div>
                                        <Card.Body className="ps-0 pe-0 pb-0">
                                            <Row>
                                                {trainings.map((training, index) => (
                                                    <Col md={4} key={index}>
                                                        <div className="training-block d-flex align-items-center mb-md-0 mb-4">
                                                            <div className="rounded-circle card-icon bg-primary-subtle">
                                                                <img src={generatePath(`/assets/images/page-img/${training.imgSrc}`)} className="img-fluid filter-img-dark" alt="icon" />
                                                            </div>
                                                            <div className="ms-3">
                                                                <h5>{training.title}</h5>
                                                                <p className="mb-0">{training.kcal}</p>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col lg={8}>
                                    <Card>
                                        <Card.Header className="d-flex justify-content-between p-0">
                                            <div className="header-title">
                                                <h4 className="card-title text-primary mb-3">Activity Statistic</h4>
                                            </div>
                                        </Card.Header>
                                        <Card.Body className="p-0 text-center">
                                            <div id="patient-chart-1"></div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col lg={4}>
                                    <Card className="mb-0">
                                        <div className="border-bottom d-flex justify-content-between align-items-center ">
                                            <div className="header-title mb-3">
                                                <h4 className="card-title text-primary">My Training</h4>
                                            </div>
                                            <div className="card-header-toolbar d-flex align-items-center mb-3 patient-dash">
                                                <Dropdown>
                                                    <Dropdown.Toggle variant="link" id="dropdownMenuButton4" className="bg-primary-subtle btn" style={{ fontSize: '22px' }}>
                                                        <span className="ri-add-line"></span>
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu align="end">
                                                        <Dropdown.Item href="#"><i className="ri-eye-fill me-2"></i>View</Dropdown.Item>
                                                        <Dropdown.Item href="#"><i className="ri-delete-bin-6-fill me-2"></i>Delete</Dropdown.Item>
                                                        <Dropdown.Item href="#"><i className="ri-pencil-fill me-2"></i>Edit</Dropdown.Item>
                                                        <Dropdown.Item href="#"><i className="ri-printer-fill me-2"></i>Print</Dropdown.Item>
                                                        <Dropdown.Item href="#"><i className="ri-file-download-fill me-2"></i>Download</Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </div>
                                        </div>
                                        <Card.Body className="p-0 custom-overflow-hidden-none">
                                            {myTraining.map((item, index) => (
                                                <Table key={index} className={`mb-0 table-borderless table-box-shadow ${index === 1 ? 'mt-4' : ''}`}>
                                                    <thead>
                                                        <tr>
                                                            <th scope="col">Training</th>
                                                            <th scope="col">{item.training}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>Burned</td>
                                                            <td>{item.burned}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Spend</td>
                                                            <td>{item.spend}</td>
                                                        </tr>
                                                    </tbody>
                                                </Table>
                                            ))}
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <Card>
                                        <Card.Header className="d-flex justify-content-between p-0 min-height-auto mb-2 pb-3">
                                            <div className="header-title">
                                                <h4 className="card-title text-primary">Heart Rate</h4>
                                            </div>
                                        </Card.Header>
                                        <Card.Body className="p-0">
                                            <div className="d-flex align-items-center">
                                                <div className="me-3">
                                                    <h4>75 bpm</h4>
                                                    <p className="mb-0 text-primary">Health Zone</p>
                                                </div>
                                                <div className="rounded-circle card-icon bg-primary-subtle">
                                                    <i className="ri-windy-fill"></i>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <Card>
                                        <Card.Header className="d-flex justify-content-between p-0 min-height-auto mb-2 pb-3">
                                            <div className="header-title">
                                                <h4 className="card-title text-primary">Water Balance</h4>
                                            </div>
                                        </Card.Header>
                                        <Card.Body className="p-0">
                                            <div className="d-flex align-items-center">
                                                <div className="me-3 text-start">
                                                    <p className="mb-0 text-primary">Drunk</p>
                                                    <h4>1250 ml/ 2000 ml</h4>
                                                </div>
                                                <div className="rounded-circle card-icon bg-primary-subtle">
                                                    <i className="ri-add-fill"></i>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </div>
            </Row>
        </>
    )
}

export default PatientDashboard
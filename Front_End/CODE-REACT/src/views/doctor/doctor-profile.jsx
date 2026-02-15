import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";
import Card from "../../components/Card";

// Import FsLightBox
import ReactFsLightbox from "fslightbox-react";

// Import Image

import imgg1 from "/assets/images/page-img/g1.jpg"
import imgg2 from "/assets/images/page-img/g2.jpg"
import imgg3 from "/assets/images/page-img/g3.jpg"
import imgg4 from "/assets/images/page-img/g4.jpg"
import imgg5 from "/assets/images/page-img/g5.jpg"
import imgg6 from "/assets/images/page-img/g6.jpg"
import imgg7 from "/assets/images/page-img/g7.jpg"
import imgg8 from "/assets/images/page-img/g8.jpg"
import imgg9 from "/assets/images/page-img/g9.jpg"
import img11 from "/assets/images/user/11.png"
import CountUp from "react-countup";

const DoctorProfile = (props) => {

    const { show, handleClose } = props
    const FsLightbox = ReactFsLightbox.default
        ? ReactFsLightbox.default
        : ReactFsLightbox;

    const [imageController, setImageController] = useState({
        toggler: false,
        slide: 1,
    });

    function imageOnSlide(number) {
        setImageController({
            toggler: !imageController.toggler,
            slide: number,
        });
    }

    return (
        <>
            <FsLightbox
                toggler={imageController.toggler}
                sources={[
                    imgg1, imgg2, imgg3, imgg4, imgg5, imgg6, imgg7, imgg8, imgg9
                ]}
                slide={imageController.slide}
            />
            <Row>
                <Col lg={4}>
                    <Card>
                        <Card.Body className="ps-0 pe-0 pt-0">
                            <div className="docter-details-block">
                                <div className="doc-profile-bg bg-primary rounded-top-2" style={{ height: "150px" }}>
                                </div>
                                <div className="docter-profile text-center">
                                    <img src={img11} alt="profile-img" className="avatar-130 img-fluid" />
                                </div>
                                <div className="text-center mt-3 ps-3 pe-3">
                                    <h4><b>Bini Jets</b></h4>
                                    <p>Doctor</p>
                                    <p className="mb-0">Lorem ipsum dolor sit amet,
                                        consectetur adipisicing elit. Delectus
                                        repudiandae eveniet harum.</p>
                                </div>
                                <hr />
                                <ul className="doctoe-sedual d-flex align-items-center justify-content-between p-0 m-0">
                                    <li className="text-center">
                                        <h3 className="counter"><CountUp end={4500} separator="" /></h3>
                                        <span>Operations</span>
                                    </li>
                                    <li className="text-center">
                                        <h3 className="counter"><CountUp end={100} separator="" /></h3>
                                        <span>Hospital</span>
                                    </li>
                                    <li className="text-center">
                                        <h3 className="counter"><CountUp end={10000} separator="" /></h3>
                                        <span>Patients</span>
                                    </li>
                                </ul>
                            </div>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <Card.Header.Title>
                                <h4 className="card-title">Personal Information</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <div className="about-info m-0 p-0">
                                <Row>
                                    <Col xs={4}>First Name:</Col>
                                    <Col xs={8}>Bini</Col>
                                    <Col xs={4}>Last Name:</Col>
                                    <Col xs={8}>Jets</Col>
                                    <Col xs={4}>Age:</Col>
                                    <Col xs={8}>27</Col>
                                    <Col xs={4}>Position:</Col>
                                    <Col xs={8}>Senior Doctor</Col>
                                    <Col xs={4}>Email:</Col>
                                    <Col xs={8}>
                                        <a href="mailto:biniJets24@demo.com">biniJets24@demo.com</a>
                                    </Col>
                                    <Col xs={4}>Phone:</Col>
                                    <Col xs={8}>
                                        <a href="tel:001-2351-25612">001 2351 256 12</a>
                                    </Col>
                                    <Col xs={4}>Location:</Col>
                                    <Col xs={8}>USA</Col>
                                </Row>

                            </div>
                        </Card.Body>
                    </Card>
                    <Card >
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <div className="header-title">
                                <h4 className="card-title">Photos</h4>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="d-grid gap-card grid-cols-3">
                                <a className="text-center">
                                    <img src={imgg1} className="img-fluid w-100" alt="profile-image"
                                        loading="lazy" onClick={() => imageOnSlide(1)} />
                                </a>
                                <a className="text-center">
                                    <img src={imgg2} className="img-fluid w-100" alt="profile-image"
                                        loading="lazy" onClick={() => imageOnSlide(2)} />
                                </a>
                                <a className="text-center">
                                    <img src={imgg3} className="img-fluid w-100" alt="profile-image"
                                        loading="lazy" onClick={() => imageOnSlide(3)} />
                                </a>
                                <a className="text-center">
                                    <img src={imgg4} className="img-fluid w-100" alt="profile-image"
                                        loading="lazy" onClick={() => imageOnSlide(4)} />
                                </a>
                                <a className="text-center">
                                    <img src={imgg5} className="img-fluid w-100" alt="profile-image"
                                        loading="lazy" onClick={() => imageOnSlide(5)} />
                                </a>
                                <a className="text-center">
                                    <img src={imgg6} className="img-fluid w-100" alt="profile-image"
                                        loading="lazy" onClick={() => imageOnSlide(6)} />
                                </a>
                                <a className="text-center">
                                    <img src={imgg7} className="img-fluid w-100" alt="profile-image"
                                        loading="lazy" onClick={() => imageOnSlide(7)} />
                                </a>
                                <a className="text-center">
                                    <img src={imgg8} className="img-fluid w-100" alt="profile-image"
                                        loading="lazy" onClick={() => imageOnSlide(8)} />
                                </a>
                                <a className="text-center">
                                    <img src={imgg9} className="img-fluid w-100" alt="profile-image"
                                        loading="lazy" onClick={() => imageOnSlide(9)} />
                                </a>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col lg={8}>
                    <Row>
                        <Col md={6}>
                            <Card>
                                <Card.Header className="d-flex justify-content-between">
                                    <Card.Header.Title>
                                        <h4 className="card-title">Speciality</h4>
                                    </Card.Header.Title>
                                </Card.Header>
                                <Card.Body>
                                    <ul className="speciality-list m-0 p-0">
                                        <li className="d-flex mb-4 align-items-center">
                                            <div className="user-img img-fluid"><a href="#" className="bg-primary-subtle"><i
                                                className="ri-award-fill"></i></a></div>
                                            <div className="media-support-info ms-3">
                                                <h6>Professional</h6>
                                                <p className="mb-0">Certified Skin
                                                    Treatment</p>
                                            </div>
                                        </li>
                                        <li className="d-flex mb-4 align-items-center">
                                            <div className="user-img img-fluid"><a href="#" className="bg-warning-subtle"><i
                                                className="ri-award-fill"></i></a></div>
                                            <div className="media-support-info ms-3">
                                                <h6>Certified</h6>
                                                <p className="mb-0">Cold Laser Operation</p>
                                            </div>
                                        </li>
                                        <li className="d-flex mb-4 align-items-center">
                                            <div className="user-img img-fluid"><a href="#" className="bg-info-subtle"><i
                                                className="ri-award-fill"></i></a></div>
                                            <div className="media-support-info ms-3">
                                                <h6>Medication Laser</h6>
                                                <p className="mb-0">Hair Lose Product</p>
                                            </div>
                                        </li>
                                    </ul>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card>
                                <Card.Header className="d-flex justify-content-between">
                                    <Card.Header.Title>
                                        <h4 className="card-title">Notifications</h4>
                                    </Card.Header.Title>
                                </Card.Header>
                                <Card.Body>
                                    <ul className="timeline">
                                        <li>
                                            <div className="timeline-dots border-success"></div>
                                            <h6 class>Dr. Joy Send you Photo</h6>
                                            <small className="mt-1">23 November 2019</small>
                                        </li>
                                        <li>
                                            <div className="timeline-dots border-danger"></div>
                                            <h6 class>Reminder : Opertion Time!</h6>
                                            <small className="mt-1">20 November 2019</small>
                                        </li>
                                        <li>
                                            <div className="timeline-dots border-primary"></div>
                                            <h6 className="mb-1">Patient Call</h6>
                                            <small className="mt-1">19 November 2019</small>
                                        </li>
                                    </ul>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card>
                                <Card.Header className="d-flex justify-content-between">
                                    <Card.Header.Title>
                                        <h4 className="card-title">Schedule</h4>
                                    </Card.Header.Title>
                                </Card.Header>
                                <Card.Body>
                                    <ul className="list-inline m-0 p-0">
                                        <li>
                                            <h6 className="float-start mb-1">Ruby Saul
                                                (Blood Check)</h6>
                                            <small className="float-end mt-1">Today</small>
                                            <div className="d-inline-block w-100">
                                                <p className="badge text-bg-primary">09:00
                                                    AM </p>
                                            </div>
                                        </li>
                                        <li>
                                            <h6 className="float-start mb-1"> Anna Mull
                                                (Fever)</h6>
                                            <small className="float-end mt-1">Today</small>
                                            <div className="d-inline-block w-100">
                                                <p className="badge text-bg-danger">09:15 AM
                                                </p>
                                            </div>
                                        </li>
                                        <li>
                                            <h6 className="float-start mb-1">Petey Cruiser
                                                (X-ray)</h6>
                                            <small className="float-end mt-1">Today</small>
                                            <div className="d-inline-block w-100">
                                                <p className="badge text-bg-warning">10:00
                                                    AM </p>
                                            </div>
                                        </li>
                                        <li>
                                            <h6 className="float-start mb-1">Anna Sthesia
                                                (Full body Check up)</h6>
                                            <small className="float-end mt-1">Today</small>
                                            <div className="d-inline-block w-100">
                                                <p className="badge text-bg-info">01:00 PM
                                                </p>
                                            </div>
                                        </li>
                                        <li>
                                            <h6 className="float-start mb-1">Paul Molive
                                                (Operation)</h6>
                                            <small className="float-end mt-1">Tomorrow</small>
                                            <div className="d-inline-block w-100">
                                                <p className="badge text-bg-success">09:00
                                                    AM </p>
                                            </div>
                                        </li>

                                    </ul>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card>
                                <Card.Header className="d-flex justify-content-between">
                                    <Card.Header.Title >
                                        <h4 className="card-title">Patients Notes</h4>
                                    </Card.Header.Title>
                                </Card.Header>
                                <Card.Body>
                                    <ul className="list-inline m-0 p-0">
                                        <li className="d-flex align-items-center justify-content-between mb-3">
                                            <div>
                                                <h6>Treatment was good!</h6>
                                                <p className="mb-0">Eye Test </p>
                                            </div>
                                            <div><a href="#" className="btn btn-primary-subtle">Open</a></div>
                                        </li>
                                        <li className="d-flex align-items-center justify-content-between mb-3">
                                            <div>
                                                <h6>My Health is better Now</h6>
                                                <p className="mb-0">Fever Test</p>
                                            </div>
                                            <div><a href="#" className="btn btn-primary-subtle">Open</a></div>
                                        </li>
                                        <li className="d-flex align-items-center justify-content-between mb-3">
                                            <div>
                                                <h6>No Effected</h6>
                                                <p className="mb-0">Thyroid Test</p>
                                            </div>
                                            <div><a href="#" className="btn btn-danger-subtle">Close</a></div>
                                        </li>
                                        <li className="d-flex align-items-center justify-content-between mb-3">
                                            <div>
                                                <h6>Operation Successfull</h6>
                                                <p className="mb-0">Orthopaedic</p>
                                            </div>
                                            <div><a href="#" className="btn btn-primary-subtle">Open</a></div>
                                        </li>
                                        <li className="d-flex align-items-center justify-content-between mb-3">
                                            <div>
                                                <h6>Medical Care is just a click
                                                    away</h6>
                                                <p className="mb-0">Join Pain </p>
                                            </div>
                                            <div><a href="#" className="btn btn-danger-subtle">Close</a></div>
                                        </li>
                                        <li className="d-flex align-items-center justify-content-between">
                                            <div>
                                                <h6>Treatment is good</h6>
                                                <p className="mb-0">Skin Treatment </p>
                                            </div>
                                            <div><a href="#" className="btn btn-primary-subtle">Open</a></div>
                                        </li>
                                    </ul>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={12}>
                            <Card>
                                <Card.Header className="d-flex justify-content-between">
                                    <Card.Header.Title>
                                        <h4 className="card-title">Education</h4>
                                    </Card.Header.Title>
                                </Card.Header>
                                <Card.Body>
                                    <div className="table-responsive">
                                        <table className="table mb-0 table-borderless">
                                            <thead>
                                                <tr>
                                                    <th scope="col">Year</th>
                                                    <th scope="col">Degree</th>
                                                    <th scope="col">Institute</th>
                                                    <th scope="col">Result</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>2010</td>
                                                    <td>MBBS, M.D</td>
                                                    <td>University of Wyoming</td>
                                                    <td><span className="badge text-bg-success">Distinction</span></td>
                                                </tr>
                                                <tr>
                                                    <td>2014</td>
                                                    <td>M.D. of Medicine</td>
                                                    <td>Netherland Medical College</td>
                                                    <td><span className="badge text-bg-success">Distinction</span></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={12}>
                            <Card>
                                <Card.Header className="d-flex justify-content-between">
                                    <Card.Header.Title>
                                        <h4 className="card-title">Experience</h4>
                                    </Card.Header.Title>
                                </Card.Header>
                                <Card.Body>
                                    <div className="table-responsive">
                                        <table className="table mb-0 table-borderless">
                                            <thead>
                                                <tr>
                                                    <th scope="col">Year</th>
                                                    <th scope="col">Department</th>
                                                    <th scope="col">Position</th>
                                                    <th scope="col">Hospital</th>
                                                    <th scope="col">Feedback</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>2014 - 2018</td>
                                                    <td>MBBS, M.D</td>
                                                    <td>Senior Docter</td>
                                                    <td>Midtown Medical Clinic</td>
                                                    <td><span className="badge text-bg-primary">Good</span></td>
                                                </tr>
                                                <tr>
                                                    <td>2018 - 2020</td>
                                                    <td>M.D. of Medicine</td>
                                                    <td>Associate Prof.</td>
                                                    <td>Netherland Medical College</td>
                                                    <td><span className="badge text-bg-success">excellence</span></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </>
    )
}

export default DoctorProfile
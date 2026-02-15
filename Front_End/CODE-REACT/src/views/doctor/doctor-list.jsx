import React, { Fragment } from "react";
import { Col, Row } from "react-bootstrap";
import Card from "../../components/Card";
import { Link } from "react-router-dom";

// Images
import img12 from "/assets/images/user/12.jpg"
import img13 from "/assets/images/user/13.jpg"
import img14 from "/assets/images/user/14.jpg"
import img15 from "/assets/images/user/15.jpg"
import img16 from "/assets/images/user/16.jpg"
import img17 from "/assets/images/user/17.jpg"
import img18 from "/assets/images/user/18.jpg"

const DoctorList = () => {

    const doctors = [
        {
            doctorname: "Dr. Anna Mull",
            Specialists: "Cardiologists",
            img: img12
        },
        {
            doctorname: "Dr. Paul Molive",
            Specialists: "Heart Surgeons",
            img: img13
        },
        {
            doctorname: "Dr. Terry Aki",
            Specialists: "Medicine Specialists",
            img: img14
        },
        {
            doctorname: "Dr. Poppa Cherry",
            Specialists: "Family Physicians",
            img: img15
        },
        {
            doctorname: "Dr. Saul T. Balls",
            Specialists: "Gynaecology",
            img: img16
        },
        {
            doctorname: "Dr. Hal Appeno",
            Specialists: "MD",
            img: img17
        },
        {
            doctorname: "Dr. Polly Tech",
            Specialists: "Eye Special",
            img: img18
        },
        {
            doctorname: "Dr. Pat Agonia",
            Specialists: "Therapy Special",
            img: img12
        },
        {
            doctorname: "Dr. Barry Cade",
            Specialists: "Heart Surgeons",
            img: img13
        },
        {
            doctorname: "Dr. Jimmy Changa",
            Specialists: "Cardiologists",
            img: img14
        },
        {
            doctorname: "Dr. Sue Vaneer",
            Specialists: "Orthopedics Special",
            img: img15
        },
        {
            doctorname: "Dr. Monty Carlo",
            Specialists: "Anesthesiologists",
            img: img16
        },
        {
            doctorname: "Dr. Rick O'Shea",
            Specialists: "General",
            img: img17
        },
        {
            doctorname: "Dr. Bunny Joy",
            Specialists: "Gynaecology",
            img: img18
        },
        {
            doctorname: "Dr. Shonda Leer",
            Specialists: "Orthopedics Special",
            img: img12
        },
        {
            doctorname: "Dr. Ira Membrit",
            Specialists: "MD",
            img: img13
        }
    ];


    return (
        <>
            <Row>
                <Col sm={12}>
                    <Card>
                        <Card.Header className="card-header-custom d-flex justify-content-between p-4 mb-0 border-bottom-0">
                            <Card.Header.Title>
                                <h4 className="card-title">Doctors List</h4>
                            </Card.Header.Title>
                        </Card.Header>
                    </Card>
                </Col>

                {doctors.map((doctor, index) => {
                    return (<Fragment key={index}>
                        <Col sm={6} md={3}>
                            <Card>
                                <Card.Body className="text-center">
                                    <div className="doc-profile">
                                        <img className="rounded-circle img-fluid avatar-80" src={doctor.img}
                                            alt="profile" />
                                    </div>
                                    <div className="doc-info mt-3">
                                        <h4> {doctor.doctorname}</h4>
                                        <p className="mb-0">{doctor.Specialists}</p>
                                        <Link to="#">www.demo.com</Link>
                                    </div>
                                    <div className="iq-doc-description mt-2">
                                        <p className="mb-0">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam auctor non erat non
                                            gravida. In id ipsum consequat</p>
                                    </div>
                                    <div className="doc-social-info mt-3 mb-3">
                                        <ul className="m-0 p-0 list-group list-group-horizontal justify-content-center">
                                            <li className="list-group-item border-0 p-0"><Link to="#"><i className="ri-facebook-fill"></i></Link></li>
                                            <li className="list-group-item border-0 p-0"><Link to="#"><i className="ri-twitter-fill"></i></Link> </li>
                                            <li className="list-group-item border-0 p-0"><Link to="#"><i className="ri-google-fill"></i></Link></li>
                                        </ul>
                                    </div>
                                    <Link to="/doctor/doctor-profile" className="btn btn-primary-subtle">View Profile</Link>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Fragment>)
                })}
            </Row>
        </>
    )
}

export default DoctorList
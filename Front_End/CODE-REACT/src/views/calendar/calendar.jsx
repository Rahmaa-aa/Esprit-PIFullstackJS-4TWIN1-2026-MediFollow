import React, { useState } from "react";
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import bootstrapPlugin from '@fullcalendar/bootstrap';
import moment from "moment";
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { Button, Col, Form, Modal, Nav, Row, Tab, TabContainer } from "react-bootstrap";
import Card from "../../components/Card";
import { Link } from "react-router-dom";

const Calendar = () => {
    const [date, setDate] = useState(null);
    const [show, setShow] = useState(false);

    const events = [
        {
            title: "Click for Google 1",
            start: moment(new Date(), 'YYYY-MM-DD').add(-20, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
            end: moment(new Date(), 'YYYY-MM-DD').add(-20, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
            borderColor: 'rgba(58,87,232,1)',
            textColor: "rgba(58,87,232,1)",
            backgroundColor: 'rgba(58, 87, 232, 0.2)',
            description: "test",
        },
        {
            title: "All Day Event",
            start: moment(new Date(), 'YYYY-MM-DD').add(-18, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
            end: moment(new Date(), 'YYYY-MM-DD').add(-18, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
            backgroundColor: 'rgba(108,117,125,0.2)',
            textColor: 'rgba(108,117,125,1)',
            borderColor: 'rgba(108,117,125,1)'
        },
        {
            title: 'Long Event',
            start: moment(new Date(), 'YYYY-MM-DD').add(-16, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
            end: moment(new Date(), 'YYYY-MM-DD').add(-13, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
            backgroundColor: 'rgba(8,130,12,0.2)',
            textColor: 'rgba(8,130,12,1)',
            borderColor: 'rgba(8,130,12,1)',
        },
        {
            groupId: '999',
            title: 'Repeating Event',
            start: moment(new Date(), 'YYYY-MM-DD').add(-14, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
            color: '#047685',
            backgroundColor: 'rgba(4,118,133,0.2)',
            textColor: 'rgba(4,118,133,1)',
            borderColor: 'rgba(4,118,133,1)'
        },
        {
            groupId: '999',
            title: 'Repeating Event',
            start: moment(new Date(), 'YYYY-MM-DD').add(-12, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
            backgroundColor: 'rgba(235,153,27,0.2)',
            textColor: 'rgba(235,153,27,1)',
            borderColor: 'rgba(235,153,27,1)'
        },
        {
            groupId: '999',
            title: 'Repeating Event',
            start: moment(new Date(), 'YYYY-MM-DD').add(-10, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
            backgroundColor: 'rgba(206,32,20,0.2)',
            textColor: 'rgba(206,32,20,1)',
            borderColor: 'rgba(206,32,20,1)'
        },
        {
            title: 'Birthday Party',
            start: moment(new Date(), 'YYYY-MM-DD').add(-8, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
            backgroundColor: 'rgba(58,87,232,0.2)',
            textColor: 'rgba(58,87,232,1)',
            borderColor: 'rgba(58,87,232,1)'
        },
        {
            title: 'Meeting',
            start: moment(new Date(), 'YYYY-MM-DD').add(-6, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
            backgroundColor: 'rgba(58,87,232,0.2)',
            textColor: 'rgba(58,87,232,1)',
            borderColor: 'rgba(58,87,232,1)'
        },
        {
            title: 'Birthday Party',
            start: moment(new Date(), 'YYYY-MM-DD').add(-5, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
            backgroundColor: 'rgba(235,153,27,0.2)',
            textColor: 'rgba(235,153,27,1)',
            borderColor: 'rgba(235,153,27,1)'
        },
        {
            title: 'Birthday Party',
            start: moment(new Date(), 'YYYY-MM-DD').add(-2, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
            backgroundColor: 'rgba(235,153,27,0.2)',
            textColor: 'rgba(235,153,27,1)',
            borderColor: 'rgba(235,153,27,1)',
        },

        {
            title: 'Meeting',
            start: moment(new Date(), 'YYYY-MM-DD').add(0, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
            backgroundColor: 'rgba(58,87,232,0.2)',
            textColor: 'rgba(58,87,232,1)',
            borderColor: 'rgba(58,87,232,1)'
        },
        {
            title: 'Click for Google',
            url: 'http://google.com/',
            start: moment(new Date(), 'YYYY-MM-DD').add(0, 'days').format('YYYY-MM-DD') + 'T06:30:00.000Z',
            backgroundColor: 'rgba(58,87,232,0.2)',
            textColor: 'rgba(58,87,232,1)',
            borderColor: 'rgba(58,87,232,1)'
        },
        {
            groupId: '999',
            title: 'Repeating Event',
            start: moment(new Date(), 'YYYY-MM-DD').add(0, 'days').format('YYYY-MM-DD') + 'T07:30:00.000Z',
            backgroundColor: 'rgba(58,87,232,0.2)',
            textColor: 'rgba(58,87,232,1)',
            borderColor: 'rgba(58,87,232,1)'
        },
        {
            title: 'Birthday Party',
            start: moment(new Date(), 'YYYY-MM-DD').add(0, 'days').format('YYYY-MM-DD') + 'T08:30:00.000Z',
            backgroundColor: 'rgba(235,153,27,0.2)',
            textColor: 'rgba(235,153,27,1)',
            borderColor: 'rgba(235,153,27,1)'
        },
        {
            title: 'Doctor Meeting',
            start: moment(new Date(), 'YYYY-MM-DD').add(0, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
            backgroundColor: 'rgba(235,153,27,0.2)',
            textColor: 'rgba(235,153,27,1)',
            borderColor: 'rgba(235,153,27,1)'
        },
        {
            title: 'All Day Event',
            start: moment(new Date(), 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
            backgroundColor: 'rgba(58,87,232,0.2)',
            textColor: 'rgba(58,87,232,1)',
            borderColor: 'rgba(58,87,232,1)'
        },
        {
            groupId: '999',
            title: 'Repeating Event',
            start: moment(new Date(), 'YYYY-MM-DD').add(8, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
            backgroundColor: 'rgba(58,87,232,0.2)',
            textColor: 'rgba(58,87,232,1)',
            borderColor: 'rgba(58,87,232,1)'
        },
        {
            groupId: '999',
            title: 'Repeating Event',
            start: moment(new Date(), 'YYYY-MM-DD').add(10, 'days').format('YYYY-MM-DD') + 'T05:30:00.000Z',
            backgroundColor: 'rgba(58,87,232,0.2)',
            textColor: 'rgba(58,87,232,1)',
            borderColor: 'rgba(58,87,232,1)'
        }
    ]

    const modelClose = () => {
        setShow(!show)
    }

    return (
        <>
            <Row className="iq-calendar">
                <Col lg={3}>
                    <Card>
                        <Card.Body className="course-picker">
                            <Flatpickr
                                value={date}
                                onChange={([selectedDate]) => setDate(selectedDate)}
                                options={{
                                    allowInput: true, inline: true,
                                }}
                                className="inline_flatpickr"
                            />
                            <input type="hidden" name="inline" className="d-none inline_flatpickr" value={date ? date.toISOString() : ''} />
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <Card.Header.Title>
                                <h4 className="card-title ">Classification</h4>
                            </Card.Header.Title>
                            <div className="card-header-toolbar d-flex align-items-center">
                                <Link to="#"><i className="fa fa-plus  me-0" aria-hidden="true"></i></Link>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <ul className="list-unstyled m-0 p-0 job-classification">
                                <li className="iq-check"><i className="ri-check-line bg-danger me-2  text-white"></i>Meeting</li>
                                <li className="iq-check"><i className="ri-check-line bg-success me-2  text-white"></i>Business travel</li>
                                <li className="iq-check"><i className="ri-check-line bg-warning me-2  text-white"></i>Personal Work</li>
                                <li className="iq-check"><i className="ri-check-line bg-info me-2  text-white"></i>Team Project</li>
                            </ul>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <Card.Header.Title>
                                <h4 className="card-title">Today&apos;s Schedule</h4>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Body>
                            <ul className="m-0 p-0 today-schedule">
                                <li className="d-flex">
                                    <div className="schedule-icon"><i className="ri-checkbox-blank-circle-fill text-primary me-2"></i></div>
                                    <div className="schedule-text"> <span>Web Design</span>{" "}
                                        <span>09:00 to 12:00</span>
                                    </div>
                                </li>
                                <li className="d-flex">
                                    <div className="schedule-icon"><i className="ri-checkbox-blank-circle-fill text-success me-2"></i></div>
                                    <div className="schedule-text"> <span>Participate in Design</span>{" "}
                                        <span>09:00 to 12:00</span>
                                    </div>
                                </li>
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={9}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <div className="card-title">
                                <h4 className="card-title">Book Appointment</h4>
                            </div>
                            <div className="card-action mt-2 mt-sm-0">
                                <Button type="button" className="btn btn-primary-subtle ms-2 border-primary-subtle" data-bs-toggle="modal"
                                    data-bs-target="#new-event" onClick={() => setShow(!show)}>
                                    <svg className="icon-20" width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4">
                                        </path>
                                    </svg>{" "}
                                    <span>Book Appointment</span>
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body className="fc-unthemed">
                            <FullCalendar
                                viewDidMount={() => {
                                    const element = document.querySelector('.fc-list-table');
                                    if (element) {
                                        const contentHeight = element.scrollHeight + 5;
                                        const grandparentElement = element.parentElement.parentElement.parentElement;
                                        grandparentElement.style.setProperty('--custom-height', `${contentHeight}px`);
                                        grandparentElement.classList.add('custom-grandparent-height'); 
                                    } else {
                                        const grandparentElement = document.querySelector('.fc-view-harness'); 
                                        if (grandparentElement) {
                                            grandparentElement.style.removeProperty('--custom-height'); 
                                            if (grandparentElement.classList.contains('custom-grandparent-height')) {
                                                grandparentElement.classList.remove('custom-grandparent-height')
                                            }
                                        }
                                    }

                                }}
                                plugins={[
                                    timeGridPlugin,
                                    dayGridPlugin,
                                    interactionPlugin,
                                    listPlugin,
                                    bootstrapPlugin,
                                ]}
                                initialView="dayGridMonth"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
                                }}
                                dayMaxEvents={true}
                                timeZone="UTC"
                                events={events.map(event => ({
                                    title: event.title,
                                    start: event.start,
                                    end: event.end,
                                    display: 'block', 
                                    backgroundColor: event.backgroundColor,
                                    borderColor: event.borderColor,
                                    textColor: event.textColor
                                }))}
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Modal className="fade" show={show} onHide={modelClose} id="new-event" >
                <Modal.Dialog className="m-0 iq-calender-model">
                    {/* <Modal.Content > */}
                    <Modal.Header>
                        <Modal.Title as="h5" id="new-event-label">Add a events</Modal.Title>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => { modelClose() }}></button>
                    </Modal.Header>
                    <Modal.Body >
                        <Form>
                            <div className="d-flex flex-column align-items-start">
                                <input type="hidden" name="id" />
                                <input type="hidden" name="appointment_type" />
                                <TabContainer defaultActiveKey={"v-pills-home"}>
                                    <Nav as="div" className="nav me-3 form-group btn-group" id="v-pills-tab" role="tablist"
                                        aria-orientation="vertical">
                                        <Nav.Item><Nav.Link as="button" className="btn btn-primary"
                                            eventKey="v-pills-home" type="button"
                                        >Event</Nav.Link></Nav.Item>
                                        <Nav.Item><Nav.Link as="button" className="btn btn-primary"
                                            eventKey="v-pills-profile" type="button" >Task</Nav.Link></Nav.Item>
                                        <Nav.Item><Nav.Link as="button" className="btn btn-primary"
                                            eventKey="v-pills-messages" type="button">Reminder</Nav.Link></Nav.Item>
                                    </Nav>
                                    <Tab.Content className="w-100" id="v-pills-tabContent">
                                        <Tab.Pane className="fade show" eventKey="v-pills-home" role="tabpanel"
                                            aria-labelledby="v-pills-home-tab">
                                            <Row className="g-3 align-items-center form-group">
                                                <Col xs={2}>
                                                    <label className="col-form-label">Title</label>
                                                </Col>
                                                <Col xs={10}>
                                                    <input type="text" className="form-control" />
                                                </Col>
                                            </Row>
                                            <Row className="g-3 align-items-center form-group">
                                                <Col xs={2}>
                                                    <label className="col-form-label">
                                                        <svg className="icon-24" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                                            xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M3.09277 9.40421H20.9167" stroke="currentColor"
                                                                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                            </path>
                                                            <path d="M16.442 13.3097H16.4512" stroke="currentColor"
                                                                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                            </path>
                                                            <path d="M12.0045 13.3097H12.0137" stroke="currentColor"
                                                                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                            </path>
                                                            <path d="M7.55818 13.3097H7.56744" stroke="currentColor"
                                                                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                            </path>
                                                            <path d="M16.442 17.1962H16.4512" stroke="currentColor"
                                                                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                            </path>
                                                            <path d="M12.0045 17.1962H12.0137" stroke="currentColor"
                                                                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                            </path>
                                                            <path d="M7.55818 17.1962H7.56744" stroke="currentColor"
                                                                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                            </path>
                                                            <path d="M16.0433 2V5.29078" stroke="currentColor" strokeWidth="1.5"
                                                                strokeLinecap="round" strokeLinejoin="round"></path>
                                                            <path d="M7.96515 2V5.29078" stroke="currentColor" strokeWidth="1.5"
                                                                strokeLinecap="round" strokeLinejoin="round"></path>
                                                            <path fillRule="evenodd" clipRule="evenodd"
                                                                d="M16.2383 3.5791H7.77096C4.83427 3.5791 3 5.21504 3 8.22213V17.2718C3 20.3261 4.83427 21.9999 7.77096 21.9999H16.229C19.175 21.9999 21 20.3545 21 17.3474V8.22213C21.0092 5.21504 19.1842 3.5791 16.2383 3.5791Z"
                                                                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                                                strokeLinejoin="round"></path>
                                                        </svg>
                                                    </label>
                                                </Col>
                                                <Col xs={10}>
                                                    <Flatpickr options={{ minDate: "today" }} className="form-control" />
                                                </Col>
                                            </Row>
                                            <Row className="g-3 align-items-center form-group">
                                                <Col xs={2}>
                                                    <label className="col-form-label">
                                                        <svg className="icon-24" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                                            xmlns="http://www.w3.org/2000/svg">
                                                            <path fillRule="evenodd" clipRule="evenodd"
                                                                d="M21.2498 12.0005C21.2498 17.1095 17.1088 21.2505 11.9998 21.2505C6.8908 21.2505 2.7498 17.1095 2.7498 12.0005C2.7498 6.89149 6.8908 2.75049 11.9998 2.75049C17.1088 2.75049 21.2498 6.89149 21.2498 12.0005Z"
                                                                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                                                strokeLinejoin="round" />
                                                            <path d="M15.4314 14.9429L11.6614 12.6939V7.84689" stroke="currentColor"
                                                                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </label>
                                                </Col>
                                                <Col xs={10} className="d-flex align-items-center justify-content-center">
                                                    <Flatpickr options={{
                                                        enableTime: true,
                                                        noCalendar: true, 
                                                        dateFormat: "H:i",  
                                                    }}
                                                        className="form-control "
                                                    />

                                                    <span className="mx-2">To</span> 
                                                    <Flatpickr options={{
                                                        enableTime: true,
                                                        noCalendar: true, 
                                                        dateFormat: "H:i",  
                                                    }}
                                                        className="form-control "
                                                    />
                                                </Col>
                                            </Row>
                                            <Row className="g-3 align-items-center form-group">
                                                <Col xs={2}>
                                                    <label className="col-form-label">
                                                        <svg className="icon-24" width="24" viewBox="0 0 24 24" fill="none"
                                                            xmlns="http://www.w3.org/2000/svg">
                                                            <path fillRule="evenodd" clipRule="evenodd"
                                                                d="M9.59151 15.2068C13.2805 15.2068 16.4335 15.7658 16.4335 17.9988C16.4335 20.2318 13.3015 20.8068 9.59151 20.8068C5.90151 20.8068 2.74951 20.2528 2.74951 18.0188C2.74951 15.7848 5.88051 15.2068 9.59151 15.2068Z"
                                                                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                                                strokeLinejoin="round"></path>
                                                            <path fillRule="evenodd" clipRule="evenodd"
                                                                d="M9.59157 12.0198C7.16957 12.0198 5.20557 10.0568 5.20557 7.63476C5.20557 5.21276 7.16957 3.24976 9.59157 3.24976C12.0126 3.24976 13.9766 5.21276 13.9766 7.63476C13.9856 10.0478 12.0356 12.0108 9.62257 12.0198H9.59157Z"
                                                                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                                                strokeLinejoin="round"></path>
                                                            <path
                                                                d="M16.4829 10.8815C18.0839 10.6565 19.3169 9.28253 19.3199 7.61953C19.3199 5.98053 18.1249 4.62053 16.5579 4.36353"
                                                                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                                                strokeLinejoin="round"></path>
                                                            <path
                                                                d="M18.5952 14.7322C20.1462 14.9632 21.2292 15.5072 21.2292 16.6272C21.2292 17.3982 20.7192 17.8982 19.8952 18.2112"
                                                                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                                                strokeLinejoin="round"></path>
                                                        </svg>
                                                    </label>
                                                </Col>
                                                <Col xs={10}>
                                                    <select name="guest" className="form-select" id="guest">
                                                        <option value="">Select Guest</option>
                                                        <option value="">Anni</option>
                                                        <option value="">Bini</option>
                                                        <option value="">Chimpi</option>
                                                    </select>
                                                </Col>
                                            </Row>
                                            <Row className=" g-3 align-items-center form-group">
                                                <Col xs={2} >
                                                    <label className="col-form-label">
                                                        <svg className="icon-32" width="32" viewBox="0 0 24 24" fill="none"
                                                            xmlns="http://www.w3.org/2000/svg">
                                                            <path
                                                                d="M11.4925 2.78906H7.75349C4.67849 2.78906 2.75049 4.96606 2.75049 8.04806V16.3621C2.75049 19.4441 4.66949 21.6211 7.75349 21.6211H16.5775C19.6625 21.6211 21.5815 19.4441 21.5815 16.3621V12.3341"
                                                                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                                                strokeLinejoin="round"></path>
                                                            <path fillRule="evenodd" clipRule="evenodd"
                                                                d="M8.82812 10.921L16.3011 3.44799C17.2321 2.51799 18.7411 2.51799 19.6721 3.44799L20.8891 4.66499C21.8201 5.59599 21.8201 7.10599 20.8891 8.03599L13.3801 15.545C12.9731 15.952 12.4211 16.181 11.8451 16.181H8.09912L8.19312 12.401C8.20712 11.845 8.43412 11.315 8.82812 10.921Z"
                                                                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                                                strokeLinejoin="round"></path>
                                                            <path d="M15.1655 4.60254L19.7315 9.16854" stroke="currentColor"
                                                                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                            </path>
                                                        </svg>
                                                    </label>
                                                </Col>
                                                <Col xs={10}>
                                                    <textarea name="description" id="description"
                                                        className="form-control custom-textarea" rows="2"
                                                        placeholder="Description"></textarea>
                                                </Col>
                                            </Row>
                                        </Tab.Pane>
                                        <Tab.Pane className="fade " eventKey="v-pills-profile" role="tabpanel"
                                            aria-labelledby="v-pills-profile-tab">
                                            <Row>
                                                <Col md={12}>
                                                    <Row className="g-3 align-items-center form-group">
                                                        <Col xs={2}>
                                                            <label className="col-form-label">Title</label>
                                                        </Col>
                                                        <Col xs={10}>
                                                            <input type="text" className="form-control" />
                                                        </Col>
                                                    </Row>
                                                    <Row className="g-3 align-items-center form-group">
                                                        <Col xs={2}>
                                                            <label className="col-form-label">
                                                                <svg className="icon-24" width="24" height="24" viewBox="0 0 24 24"
                                                                    fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M3.09277 9.40421H20.9167" stroke="currentColor"
                                                                        strokeWidth="1.5" strokeLinecap="round"
                                                                        strokeLinejoin="round"></path>
                                                                    <path d="M16.442 13.3097H16.4512" stroke="currentColor"
                                                                        strokeWidth="1.5" strokeLinecap="round"
                                                                        strokeLinejoin="round"></path>
                                                                    <path d="M12.0045 13.3097H12.0137" stroke="currentColor"
                                                                        strokeWidth="1.5" strokeLinecap="round"
                                                                        strokeLinejoin="round"></path>
                                                                    <path d="M7.55818 13.3097H7.56744" stroke="currentColor"
                                                                        strokeWidth="1.5" strokeLinecap="round"
                                                                        strokeLinejoin="round"></path>
                                                                    <path d="M16.442 17.1962H16.4512" stroke="currentColor"
                                                                        strokeWidth="1.5" strokeLinecap="round"
                                                                        strokeLinejoin="round"></path>
                                                                    <path d="M12.0045 17.1962H12.0137" stroke="currentColor"
                                                                        strokeWidth="1.5" strokeLinecap="round"
                                                                        strokeLinejoin="round"></path>
                                                                    <path d="M7.55818 17.1962H7.56744" stroke="currentColor"
                                                                        strokeWidth="1.5" strokeLinecap="round"
                                                                        strokeLinejoin="round"></path>
                                                                    <path d="M16.0433 2V5.29078" stroke="currentColor"
                                                                        strokeWidth="1.5" strokeLinecap="round"
                                                                        strokeLinejoin="round"></path>
                                                                    <path d="M7.96515 2V5.29078" stroke="currentColor"
                                                                        strokeWidth="1.5" strokeLinecap="round"
                                                                        strokeLinejoin="round"></path>
                                                                    <path fillRule="evenodd" clipRule="evenodd"
                                                                        d="M16.2383 3.5791H7.77096C4.83427 3.5791 3 5.21504 3 8.22213V17.2718C3 20.3261 4.83427 21.9999 7.77096 21.9999H16.229C19.175 21.9999 21 20.3545 21 17.3474V8.22213C21.0092 5.21504 19.1842 3.5791 16.2383 3.5791Z"
                                                                        stroke="currentColor" strokeWidth="1.5"
                                                                        strokeLinecap="round" strokeLinejoin="round"></path>
                                                                </svg>
                                                            </label>
                                                        </Col>
                                                        <Col xs={10}>
                                                            <Flatpickr options={{ minDate: "today" }} className="form-control" />
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </Tab.Pane>
                                        <Tab.Pane className="fade" eventKey="v-pills-messages" role="tabpanel"
                                            aria-labelledby="v-pills-messages-tab">
                                            <Row>
                                                <Col md={12}>
                                                    <Row className="g-3 align-items-center form-group">
                                                        <Col xs={2}>
                                                            <label className="col-form-label">Title</label>
                                                        </Col>
                                                        <Col xs={10}>
                                                            <input type="text" className="form-control" />
                                                        </Col>
                                                    </Row>
                                                    <Col md={12}>
                                                        <Row>
                                                            <Col md={6}>
                                                                <Row className="g-3 align-items-center form-group">
                                                                    <Col xs={2}>
                                                                        <label className="col-form-label">
                                                                            <svg className="icon-24" width="24" height="24"
                                                                                viewBox="0 0 24 24" fill="none"
                                                                                xmlns="http://www.w3.org/2000/svg">
                                                                                <path d="M3.09277 9.40421H20.9167"
                                                                                    stroke="currentColor" strokeWidth="1.5"
                                                                                    strokeLinecap="round" strokeLinejoin="round">
                                                                                </path>
                                                                                <path d="M16.442 13.3097H16.4512"
                                                                                    stroke="currentColor" strokeWidth="1.5"
                                                                                    strokeLinecap="round" strokeLinejoin="round">
                                                                                </path>
                                                                                <path d="M12.0045 13.3097H12.0137"
                                                                                    stroke="currentColor" strokeWidth="1.5"
                                                                                    strokeLinecap="round" strokeLinejoin="round">
                                                                                </path>
                                                                                <path d="M7.55818 13.3097H7.56744"
                                                                                    stroke="currentColor" strokeWidth="1.5"
                                                                                    strokeLinecap="round" strokeLinejoin="round">
                                                                                </path>
                                                                                <path d="M16.442 17.1962H16.4512"
                                                                                    stroke="currentColor" strokeWidth="1.5"
                                                                                    strokeLinecap="round" strokeLinejoin="round">
                                                                                </path>
                                                                                <path d="M12.0045 17.1962H12.0137"
                                                                                    stroke="currentColor" strokeWidth="1.5"
                                                                                    strokeLinecap="round" strokeLinejoin="round">
                                                                                </path>
                                                                                <path d="M7.55818 17.1962H7.56744"
                                                                                    stroke="currentColor" strokeWidth="1.5"
                                                                                    strokeLinecap="round" strokeLinejoin="round">
                                                                                </path>
                                                                                <path d="M16.0433 2V5.29078" stroke="currentColor"
                                                                                    strokeWidth="1.5" strokeLinecap="round"
                                                                                    strokeLinejoin="round"></path>
                                                                                <path d="M7.96515 2V5.29078" stroke="currentColor"
                                                                                    strokeWidth="1.5" strokeLinecap="round"
                                                                                    strokeLinejoin="round"></path>
                                                                                <path fillRule="evenodd" clipRule="evenodd"
                                                                                    d="M16.2383 3.5791H7.77096C4.83427 3.5791 3 5.21504 3 8.22213V17.2718C3 20.3261 4.83427 21.9999 7.77096 21.9999H16.229C19.175 21.9999 21 20.3545 21 17.3474V8.22213C21.0092 5.21504 19.1842 3.5791 16.2383 3.5791Z"
                                                                                    stroke="currentColor" strokeWidth="1.5"
                                                                                    strokeLinecap="round" strokeLinejoin="round">
                                                                                </path>
                                                                            </svg>
                                                                        </label>
                                                                    </Col>
                                                                    <Col xs={10}>
                                                                        <Flatpickr options={{ minDate: "today" }} className="form-control" />
                                                                    </Col>
                                                                </Row>
                                                            </Col>
                                                            <Col md={6}>
                                                                <Row className="g-3 align-items-center form-group">
                                                                    <Col xs={2}>
                                                                        <svg className="icon-32" width="32" viewBox="0 0 24 24"
                                                                            fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path fillRule="evenodd" clipRule="evenodd"
                                                                                d="M12 17.8476C17.6392 17.8476 20.2481 17.1242 20.5 14.2205C20.5 11.3188 18.6812 11.5054 18.6812 7.94511C18.6812 5.16414 16.0452 2 12 2C7.95477 2 5.31885 5.16414 5.31885 7.94511C5.31885 11.5054 3.5 11.3188 3.5 14.2205C3.75295 17.1352 6.36177 17.8476 12 17.8476Z"
                                                                                stroke="currentColor" strokeWidth="1.5"
                                                                                strokeLinecap="round" strokeLinejoin="round">
                                                                            </path>
                                                                            <path
                                                                                d="M14.3889 20.8572C13.0247 22.3719 10.8967 22.3899 9.51953 20.8572"
                                                                                stroke="currentColor" strokeWidth="1.5"
                                                                                strokeLinecap="round" strokeLinejoin="round">
                                                                            </path>
                                                                        </svg>
                                                                    </Col>
                                                                    <Col xs={10}>
                                                                        <select className="form-select">
                                                                            <option>Repeat</option>
                                                                            <option>Every 4 Day</option>
                                                                            <option>Every 7 Day</option>
                                                                            <option>Every 10 Day</option>
                                                                        </select>
                                                                    </Col>
                                                                </Row>
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                </Col>
                                            </Row>
                                        </Tab.Pane>
                                    </Tab.Content>
                                </TabContainer>
                            </div>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer className="border-0">
                        <Button type="button" className="btn btn-danger-subtle border-danger-subtle" onClick={() => modelClose()} >Discard Changes</Button>
                        <Button type="button" className="btn btn-primary-subtle border-primary-subtle">Save</Button>
                    </Modal.Footer>
                    {/* </Modal.Content> */}
                </Modal.Dialog>
            </Modal>

        </>
    )
}

export default Calendar
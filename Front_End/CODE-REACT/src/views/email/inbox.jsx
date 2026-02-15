import React, { useState } from "react";
import EmailDetails from "../../components/email-details";
import { Col, Dropdown, Form, Nav, OverlayTrigger, Row, Tab, Tooltip } from "react-bootstrap";
import Card from "../../components/Card";
import { Link } from "react-router-dom";
import InboxEmailIcon from "../../components/inbox-email-icon";


const Inbox = () => {

    const [show, setShow] = useState(false)

    const [showDetails, setShowDetails] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState(null);

    const handleEmailClick = (email) => {
        setSelectedEmail(email);
        setShowDetails(true);
    };

    const closeEmailDetails = () => {
        setShowDetails(false);
        // setSelectedEmail(null);
    };

    const handleDropdownToggle = (event) => {
        event.preventDefault();
    };

    return (
        <>
            <Row>
                <Tab.Container defaultActiveKey={"mail-inbox"}>
                    <Col lg={3}>
                        <Card>
                            <Card.Body>
                                <div >
                                    <div className="iq-email-list">
                                        <button className="btn btn-primary-subtle btn-lg btn-block mb-3 font-size-16 p-3 w-100"
                                            data-target="#compose-email-popup" data-bs-toggle="modal"><i
                                                className="ri-send-plane-line me-2"></i>New Message</button>
                                        <Nav variant="pills" className="iq-email-ui flex-column " role="tablist">
                                            <Nav.Link as="li" role="tab" data-bs-toggle="pill" eventKey="mail-inbox"
                                                aria-selected="true"><Link to="/email/inbox"><i
                                                    className="ri-mail-line"></i>Inbox<span
                                                        className="badge bg-primary ms-2">4</span></Link></Nav.Link>
                                            <Nav.Link as="li" role="tab" data-bs-toggle="pill" eventKey="mail-starred"
                                                aria-selected="false" tabIndex="-1"><Link to=""><i
                                                    className="ri-star-line"></i>Starred</Link></Nav.Link>
                                            <Nav.Link as="li" role="tab" data-bs-toggle="pill" eventKey="mail-snoozed"
                                                aria-selected="false" tabIndex="-1"><Link to=""><i
                                                    className="ri-time-line"></i>Snoozed</Link></Nav.Link>
                                            <Nav.Link as="li" role="tab" data-bs-toggle="pill" eventKey="mail-draft"
                                                aria-selected="false" tabIndex="-1"><Link to=""><i
                                                    className="ri-file-list-2-line"></i>Draft</Link></Nav.Link>
                                            <Nav.Link as="li" role="tab" data-bs-toggle="pill" eventKey="mail-sent"
                                                aria-selected="false" tabIndex="-1"><Link to=""><i
                                                    className="ri-mail-send-line"></i>Sent Mail</Link></Nav.Link>
                                            <Nav.Link as="li" role="tab" data-bs-toggle="pill" eventKey="mail-trash"
                                                aria-selected="false" tabIndex="-1"><Link to=""><i
                                                    className="ri-delete-bin-line"></i>Trash</Link></Nav.Link>
                                            <Nav.Link as="li" role="tab" data-bs-toggle="pill" eventKey="mail-important"
                                                aria-selected="false" tabIndex="-1"><Link to=""><i
                                                    className="ri-bookmark-line"></i>Important</Link></Nav.Link>
                                            <Nav.Link as="li" role="tab" data-bs-toggle="pill" eventKey="mail-spam"
                                                aria-selected="false" tabIndex="-1"><Link to=""><i className="ri-spam-line"></i>Spam</Link>
                                            </Nav.Link>
                                        </Nav>
                                        <h6 className="mt-4 mb-3">Labels</h6>
                                        <ul className="iq-email-ui iq-email-label list-unstyled">
                                            <li><Link to=""><i className="ri-focus-fill text-primary"></i>Personal</Link></li>
                                            <li><Link to=""><i className="ri-focus-fill text-danger"></i>Company</Link></li>
                                            <li><Link to=""><i className="ri-focus-fill text-success"></i>Important</Link></li>
                                            <li><Link to=""><i className="ri-focus-fill text-info"></i>Private</Link></li>
                                            <li><Link to=""><i className="ri-focus-fill text-warning"></i>Private</Link></li>
                                            <li><Link to=""><i className="ri-add-circle-line"></i>Add New Labels</Link></li>
                                        </ul>
                                        <div className="iq-progress-bar-linear d-inline-block w-100">
                                            <h6 className="mt-4 mb-3">Storage</h6>
                                            <div className="progress" role="progressbar" aria-label="Danger example" aria-valuenow="100"
                                                aria-valuemin="90" aria-valuemax="100"
                                                style={{ transition: "width 2s ease 0s", width: "90%", height: "6px" }}>
                                                <div className="progress-bar bg-danger" style={{ width: "90%" }}></div>
                                            </div>
                                            <span className="mt-1 d-inline-block w-100">7.02 GB (46%) of 15 GB used</span>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={9} className="mail-box-detail">
                        <Card>
                            <Card.Body className="p-0">
                                <div>
                                    <div className="iq-email-to-list p-3">
                                        <div className="iq-email-to-list-detail d-flex justify-content-between gap-3">
                                            <ul
                                                className="list-inline d-flex align-items-center justify-content-between m-0 p-0 flex-shrink-0">
                                                <li className="me-1">
                                                    <Dropdown as="a" id="navbarDropdown">
                                                        <Dropdown.Toggle bsPrefix=" " as="div" className="custom-control custom-checkbox" id="customCheck1" >
                                                            <input type="checkbox" className="custom-control-input" onClick={(e) => e.preventDefault()} />{" "}
                                                            <label className="custom-control-label" htmlFor="customCheck1"><i
                                                                className="ri-arrow-down-s-line"></i></label>
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu aria-labelledby="navbarDropdown">
                                                            <Dropdown.Item className="dropdown-item" href="#">Action</Dropdown.Item>
                                                            <Dropdown.Item className="dropdown-item" href="#">Another action</Dropdown.Item>
                                                            <Dropdown.Item className="dropdown-item" href="#">Something else here</Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </li>

                                                <OverlayTrigger
                                                    key={"Reload"}
                                                    placement={"top"}
                                                    overlay={
                                                        <Tooltip id="Reload">
                                                            Reload
                                                        </Tooltip>
                                                    }
                                                >
                                                    <li className="me-1">
                                                        <Link to=""><i
                                                            className="ri-restart-line"></i></Link></li>
                                                </OverlayTrigger>

                                                <OverlayTrigger
                                                    key={"Archive"}
                                                    placement={"top"}
                                                    overlay={
                                                        <Tooltip id="Archive">
                                                            Archive
                                                        </Tooltip>
                                                    }
                                                >
                                                    <li className="me-1"><Link to=""><i
                                                        className="ri-mail-open-line"></i></Link></li>
                                                </OverlayTrigger>
                                                <OverlayTrigger
                                                    key={"Spam"}
                                                    placement={"top"}
                                                    overlay={
                                                        <Tooltip id="Spam">
                                                            Spam
                                                        </Tooltip>
                                                    }
                                                >
                                                    <li className="me-1" data-bs-toggle="tooltip" data-bs-placement="top" aria-label="Spam"
                                                        data-bs-original-title="Spam"><Link to=""><i
                                                            className="ri-information-line"></i></Link></li>
                                                </OverlayTrigger>

                                                <OverlayTrigger
                                                    key={"Delete"}
                                                    placement={"top"}
                                                    overlay={
                                                        <Tooltip id="Delete">
                                                            Delete
                                                        </Tooltip>
                                                    }
                                                >
                                                    <li className="me-1"><Link to=""><i
                                                        className="ri-delete-bin-line"></i></Link></li>
                                                </OverlayTrigger>

                                                <OverlayTrigger
                                                    key={"Inbox"}
                                                    placement={"top"}
                                                    overlay={
                                                        <Tooltip id="Inbox">
                                                            Inbox
                                                        </Tooltip>
                                                    }
                                                >
                                                    <li className="me-1"><Link to=""><i
                                                        className="ri-mail-unread-line"></i></Link></li>
                                                </OverlayTrigger>
                                                <OverlayTrigger
                                                    key={"Zoom"}
                                                    placement={"top"}
                                                    overlay={
                                                        <Tooltip id="Zoom">
                                                            Zoom
                                                        </Tooltip>
                                                    }
                                                >
                                                    <li className="me-1"><Link to=""><i
                                                        className="ri-drag-move-2-line"></i></Link></li>
                                                </OverlayTrigger>
                                            </ul>
                                            <div className="iq-email-search d-flex flex-shrink-0">
                                                <Form className="me-3 position-relative">
                                                    <Form.Group className="form-group mb-0">
                                                        <Form.Control type="email" id="exampleInputEmail1"
                                                            aria-describedby="emailHelp" placeholder="Search" />
                                                        <a className="search-link" href="#"><i className="ri-search-line"></i></a>
                                                    </Form.Group>
                                                </Form>
                                                <ul className="list-inline d-flex align-items-center justify-content-between m-0 p-0">
                                                    <li className="me-3">
                                                        <Dropdown as="a" className="font-size-14 d-flex gap-1" href="#" id="navbarDropdown"
                                                            data-bs-toggle="dropdown">
                                                            <span>1</span><span>-</span><span>50</span><span>of</span><span>505</span>
                                                        </Dropdown>
                                                        <Dropdown.Menu as="div" className="dropdown-menu" aria-labelledby="navbarDropdown">
                                                            <a className="dropdown-item" href="#">20 per page</a>
                                                            <a className="dropdown-item" href="#">50 per page</a>
                                                            <a className="dropdown-item" href="#">100 per page</a>
                                                        </Dropdown.Menu>
                                                    </li>
                                                    <OverlayTrigger
                                                        key={"Previous"}
                                                        placement={"top"}
                                                        overlay={
                                                            <Tooltip id="Previous">
                                                                Previous
                                                            </Tooltip>
                                                        }
                                                    >
                                                        <li className="me-2"><Link to=""><i
                                                            className="ri-arrow-left-s-line transform-arrow"></i></Link></li>
                                                    </OverlayTrigger>
                                                    <OverlayTrigger
                                                        key={"Next"}
                                                        placement={"top"}
                                                        overlay={
                                                            <Tooltip id="Next">
                                                                Next
                                                            </Tooltip>
                                                        }
                                                    >
                                                        <li className="me-2"><Link to=""><i
                                                            className="ri-arrow-right-s-line transform-arrow"></i></Link></li>
                                                    </OverlayTrigger>
                                                    <OverlayTrigger
                                                        key={"Setting"}
                                                        placement={"top"}
                                                        overlay={
                                                            <Tooltip id="Setting">
                                                                Setting
                                                            </Tooltip>
                                                        }
                                                    >
                                                        <li className="me-0" ><Link to=""><i
                                                            className="ri-list-settings-line"></i></Link></li>
                                                    </OverlayTrigger>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="iq-email-listbox">
                                        <Tab.Content>
                                            <Tab.Pane className="fade" eventKey="mail-inbox" id="mail-inbox" role="tabpanel">
                                                <ul className="iq-email-sender-list iq-height">
                                                    <li className="iq-unread">
                                                        <div className="d-flex align-self-center iq-unread-inner" onClick={() => {
                                                            handleEmailClick()
                                                        }}>
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox" className="form-check-input" id="mailk" />
                                                                        <Form.Check.Label htmlFor="mailk"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle text-warning"></span>
                                                                <Link to="" className="iq-email-title">Jopour Xiong (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Mackenzie Bnio (@MackenzieBnio)
                                                                    has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@MackenzieBnio - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">08:00 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                        <EmailDetails closeEmailDetails={closeEmailDetails} showDetails={showDetails} actives={true} />
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner" onClick={() => {
                                                            handleEmailClick()
                                                        }}>
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox" id="mailk1" />
                                                                        <Form.Check.Label htmlFor="mailk1"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Deray Billings (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Megan Allen (@meganallen) has
                                                                    sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">08:15 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                        <EmailDetails closeEmailDetails={closeEmailDetails} showDetails={showDetails} actives={true} />
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner" onClick={() => {
                                                            handleEmailClick()
                                                        }}>
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox" id="mailk2" />
                                                                        <Form.Check.Label htmlFor="mailk2"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Lauren Drury (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Dixa Horton (@dixahorton) has
                                                                    sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                        <EmailDetails closeEmailDetails={closeEmailDetails} showDetails={showDetails} actives={true} />
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner" onClick={() => {
                                                            handleEmailClick()
                                                        }}>
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox" id="mailk3" />
                                                                        <Form.Check.Label htmlFor="mailk3"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Fabian Ros (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Jecno Mac (@jecnomac) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                        <EmailDetails closeEmailDetails={closeEmailDetails} showDetails={showDetails} actives={true} />
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner" onClick={() => {
                                                            handleEmailClick()
                                                        }}>
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox" id="mailk4" />
                                                                        <Form.Check.Label htmlFor="mailk4"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Dixa Horton (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Let Hunre (@lethunre) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                        <EmailDetails closeEmailDetails={closeEmailDetails} showDetails={showDetails} actives={true} />
                                                    </li>
                                                    <li className="iq-unread">
                                                        <div className="d-flex align-self-center iq-unread-inner" onClick={() => {
                                                            handleEmailClick()
                                                        }}>
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk017" />
                                                                        <Form.Check.Label htmlFor="mailk017"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle text-warning"></span>
                                                                <Link to="" className="iq-email-title">Megan Allen (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Eb Begg (@ebbegg) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                        <EmailDetails closeEmailDetails={closeEmailDetails} showDetails={showDetails} actives={true} />
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner" onClick={() => {
                                                            handleEmailClick()
                                                        }}>
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox" id="mailk6" />
                                                                        <Form.Check.Label htmlFor="mailk6"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Jopour Xiong (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Mackenzie Bnio (@mackenzieBnio)
                                                                    has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                        <EmailDetails closeEmailDetails={closeEmailDetails} showDetails={showDetails} actives={true} />
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner" onClick={() => {
                                                            handleEmailClick()
                                                        }}>
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox" id="mailk7" />
                                                                        <Form.Check.Label htmlFor="mailk7"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Deray Billings (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Jecno Mac (@jecnomac) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                        <EmailDetails closeEmailDetails={closeEmailDetails} showDetails={showDetails} actives={true} />
                                                    </li>
                                                    <li className="iq-unread">
                                                        <div className="d-flex align-self-center iq-unread-inner" onClick={() => {
                                                            handleEmailClick()
                                                        }}>
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox" id="mailk8" />
                                                                        <Form.Check.Label htmlFor="mailk8"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle text-warning"></span>
                                                                <Link to="" className="iq-email-title">Lauren Drury (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Let Hunre (@lethunre) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                        <EmailDetails closeEmailDetails={closeEmailDetails} showDetails={showDetails} actives={true} />
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner" onClick={() => {
                                                            handleEmailClick()
                                                        }}>
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox" id="mailk9" />
                                                                        <Form.Check.Label htmlFor="mailk9"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Fabian Ros (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Eb Begg (@ebbegg) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                        <EmailDetails closeEmailDetails={closeEmailDetails} showDetails={showDetails} actives={true} />
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner" onClick={() => {
                                                            handleEmailClick()
                                                        }}>
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk011" />
                                                                        <Form.Check.Label htmlFor="mailk011"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Dixa Horton (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Mackenzie Bnio (@mackenzieBnio)
                                                                    has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                        <EmailDetails closeEmailDetails={closeEmailDetails} showDetails={showDetails} actives={true} />
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner" onClick={() => {
                                                            handleEmailClick()
                                                        }}>
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk11" />
                                                                        <Form.Check.Label htmlFor="mailk11"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Megan Allen (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Jecno Mac (@jecnomac) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                        <EmailDetails closeEmailDetails={closeEmailDetails} showDetails={showDetails} actives={true} />
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner" onClick={() => {
                                                            handleEmailClick()
                                                        }}>
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk12" />
                                                                        <Form.Check.Label htmlFor="mailk12"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Jopour Xiong (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Mackenzie Bnio (@mackenzieBnio)
                                                                    has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                        <EmailDetails closeEmailDetails={closeEmailDetails} showDetails={showDetails} actives={true} />
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner" onClick={() => {
                                                            handleEmailClick()
                                                        }}>
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk13" />
                                                                        <Form.Check.Label htmlFor="mailk13"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Deray Billings (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Eb Begg(@ebbegg) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                        <EmailDetails closeEmailDetails={closeEmailDetails} showDetails={showDetails} actives={true} />
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner" onClick={() => {
                                                            handleEmailClick()
                                                        }}>
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk14" />
                                                                        <Form.Check.Label htmlFor="mailk14"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Lauren Drury (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Jecno Mac (@jecnomac) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                        <EmailDetails closeEmailDetails={closeEmailDetails} showDetails={showDetails} actives={true} />
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner" onClick={() => {
                                                            handleEmailClick()
                                                        }}>
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk15" />
                                                                        <Form.Check.Label htmlFor="mailk15"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Fabian Ros (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Let Hunre(@lethunre) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                        <EmailDetails closeEmailDetails={closeEmailDetails} showDetails={showDetails} actives={true} />
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner" onClick={() => {
                                                            handleEmailClick()
                                                        }}>
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk16" />
                                                                        <Form.Check.Label htmlFor="mailk16"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Dixa Horton (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Eb Begg (@ebbegg) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                        <EmailDetails closeEmailDetails={closeEmailDetails} showDetails={showDetails} actives={true} />
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner" onClick={() => {
                                                            handleEmailClick()
                                                        }}>
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk17" />
                                                                        <Form.Check.Label htmlFor="mailk17"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Megan Allen (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Jecno Mac (@jecnomac) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                        <EmailDetails closeEmailDetails={closeEmailDetails} showDetails={showDetails} actives={true} />
                                                    </li>
                                                </ul>
                                            </Tab.Pane>
                                            <Tab.Pane className="fade" eventKey="mail-starred" id="mail-starred" role="tabpanel">
                                                <ul className="iq-email-sender-list">
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner" onClick={() => {
                                                            handleEmailClick()
                                                        }}>
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk02" />
                                                                        <Form.Check.Label htmlFor="mailk02"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Lauren Drury (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Dixa Horton (@dixahorton) has
                                                                    sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                        <EmailDetails closeEmailDetails={closeEmailDetails} showDetails={showDetails} actives={true} />
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner" onClick={() => {
                                                            handleEmailClick()
                                                        }}>
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk03" />
                                                                        <Form.Check.Label htmlFor="mailk03"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Fabian Ros (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Jecno Mac (@jecnomac) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                        <EmailDetails closeEmailDetails={closeEmailDetails} showDetails={showDetails} actives={true} />
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner" onClick={() => {
                                                            handleEmailClick()
                                                        }}>
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk04" />
                                                                        <Form.Check.Label htmlFor="mailk04"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Dixa Horton (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Let Hunre (@lethunre) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                        <EmailDetails closeEmailDetails={closeEmailDetails} showDetails={showDetails} actives={true} />
                                                    </li>
                                                    <li className="iq-unread">
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox" id="mailk5" />
                                                                        <Form.Check.Label htmlFor="mailk5"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle text-warning"></span>
                                                                <Link to="" className="iq-email-title">Megan Allen (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Eb Begg (@ebbegg) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk018" />
                                                                        <Form.Check.Label htmlFor="mailk018"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Jopour Xiong (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Mackenzie Bnio (@mackenzieBnio)
                                                                    has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                </ul>
                                            </Tab.Pane>
                                            <Tab.Pane className="fade" eventKey="mail-snoozed" id="mail-snoozed" role="tabpanel">
                                                <ul className="iq-email-sender-list">
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk004" />
                                                                        <Form.Check.Label htmlFor="mailk004"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Dixa Horton (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Let Hunre (@lethunre) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                    <li className="iq-unread">
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk012" />
                                                                        <Form.Check.Label htmlFor="mailk012"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle text-warning"></span>
                                                                <Link to="" className="iq-email-title">Megan Allen (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Eb Begg (@ebbegg) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk024" />
                                                                        <Form.Check.Label htmlFor="mailk024"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Jopour Xiong (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Mackenzie Bnio (@mackenzieBnio)
                                                                    has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                </ul>
                                            </Tab.Pane>
                                            <Tab.Pane className="fade" eventKey="mail-draft" id="mail-draft" role="tabpanel">
                                                <ul className="iq-email-sender-list">
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk09" />
                                                                        <Form.Check.Label htmlFor="mailk09"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Fabian Ros (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Eb Begg (@ebbegg) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk013" />
                                                                        <Form.Check.Label htmlFor="mailk013"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Dixa Horton (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Mackenzie Bnio (@mackenzieBnio)
                                                                    has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk014" />
                                                                        <Form.Check.Label htmlFor="mailk014"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Megan Allen (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Jecno Mac (@jecnomac) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk019" />
                                                                        <Form.Check.Label htmlFor="mailk019"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Jopour Xiong (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Mackenzie Bnio (@mackenzieBnio)
                                                                    has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk025" />
                                                                        <Form.Check.Label htmlFor="mailk025"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Deray Billings (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Eb Begg(@ebbegg) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                </ul>
                                            </Tab.Pane>
                                            <Tab.Pane className="fade" eventKey="mail-sent" id="mail-sent" role="tabpanel">
                                                <ul className="iq-email-sender-list">
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk015" />
                                                                        <Form.Check.Label htmlFor="mailk015"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Megan Allen (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Jecno Mac (@jecnomac) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk020" />
                                                                        <Form.Check.Label htmlFor="mailk020"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Jopour Xiong (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Mackenzie Bnio (@mackenzieBnio)
                                                                    has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk026" />
                                                                        <Form.Check.Label htmlFor="mailk026"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Deray Billings (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Eb Begg(@ebbegg) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk027" />
                                                                        <Form.Check.Label htmlFor="mailk027"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Lauren Drury (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Jecno Mac (@jecnomac) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk032" />
                                                                        <Form.Check.Label htmlFor="mailk032"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Fabian Ros (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Let Hunre(@lethunre) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk037" />
                                                                        <Form.Check.Label htmlFor="mailk037"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Dixa Horton (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Eb Begg (@ebbegg) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                </ul>
                                            </Tab.Pane>
                                            <Tab.Pane className="fade" eventKey="mail-trash" id="mail-trash" role="tabpanel">
                                                <ul className="iq-email-sender-list">
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk028" />
                                                                        <Form.Check.Label htmlFor="mailk028"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Lauren Drury (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Jecno Mac (@jecnomac) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk033" />
                                                                        <Form.Check.Label htmlFor="mailk033"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Fabian Ros (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Let Hunre(@lethunre) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk038" />
                                                                        <Form.Check.Label htmlFor="mailk038"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Dixa Horton (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Eb Begg (@ebbegg) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                </ul>
                                            </Tab.Pane>
                                            <Tab.Pane className="fade" eventKey="mail-important" id="mail-important" role="tabpanel">
                                                <ul className="iq-email-sender-list">
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk029" />
                                                                        <Form.Check.Label htmlFor="mailk029"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Jopour Xiong (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Mackenzie Bnio (@mackenzieBnio)
                                                                    has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk034" />
                                                                        <Form.Check.Label htmlFor="mailk034"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Deray Billings (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Jecno Mac (@jecnomac) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                    <li className="iq-unread">
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk035" />
                                                                        <Form.Check.Label htmlFor="mailk035"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle text-warning"></span>
                                                                <Link to="" className="iq-email-title">Lauren Drury (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Let Hunre (@lethunre) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk009" />
                                                                        <Form.Check.Label htmlFor="mailk009"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Fabian Ros (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Eb Begg (@ebbegg) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk010" />
                                                                        <Form.Check.Label htmlFor="mailk010"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Dixa Horton (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Mackenzie Bnio (@mackenzieBnio)
                                                                    has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk016" />
                                                                        <Form.Check.Label htmlFor="mailk016"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Megan Allen (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Jecno Mac (@jecnomac) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                </ul>
                                            </Tab.Pane>
                                            <Tab.Pane className="fade" eventKey="mail-spam" id="mail-spam" role="tabpanel">
                                                <ul className="iq-email-sender-list">
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk021" />
                                                                        <Form.Check.Label htmlFor="mailk021"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Jopour Xiong (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Mackenzie Bnio (@mackenzieBnio)
                                                                    has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk023" />
                                                                        <Form.Check.Label htmlFor="mailk023"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Deray Billings (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Eb Begg(@ebbegg) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk030" />
                                                                        <Form.Check.Label htmlFor="mailk030"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Lauren Drury (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Jecno Mac (@jecnomac) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk031" />
                                                                        <Form.Check.Label htmlFor="mailk031"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Fabian Ros (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Let Hunre(@lethunre) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk036" />
                                                                        <Form.Check.Label htmlFor="mailk036"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Dixa Horton (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Eb Begg (@ebbegg) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex align-self-center iq-unread-inner">
                                                            <div className="iq-email-sender-info">
                                                                <div className="iq-checkbox-mail">
                                                                    <Form.Check>
                                                                        <Form.Check.Input type="checkbox"
                                                                            id="mailk040" />
                                                                        <Form.Check.Label htmlFor="mailk040"></Form.Check.Label>
                                                                    </Form.Check>
                                                                </div>
                                                                <span className="ri-star-line iq-star-toggle"></span>
                                                                <Link to="" className="iq-email-title">Megan Allen (Me)</Link>
                                                            </div>
                                                            <div className="iq-email-content">
                                                                <Link to="" className="iq-email-subject">Jecno Mac (@jecnomac) has sent
                                                                    you a direct message on Twitter! &nbsp;–&nbsp;
                                                                    <span>{" "}@LucasKriebel - Very cool :) Nicklas, You have a new
                                                                        direct message.</span>
                                                                </Link>
                                                                <div className="iq-email-date">11:49 am</div>
                                                            </div>
                                                            <InboxEmailIcon handleEmailClick={handleEmailClick} />
                                                        </div>
                                                    </li>
                                                </ul>
                                            </Tab.Pane>
                                        </Tab.Content>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Tab.Container>
            </Row>
        </>
    )
}

export default Inbox
import React from "react";
import Card from "./Card";
import { Button, Dropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router-dom";


import user05 from "/assets/images/user/05.jpg"

const EmailDetails = (props) => {

    const { showDetails, closeEmailDetails, actives } = props

    const closeEmail = (e) => {
        closeEmailDetails()
    };

    // Usage example: closeEmail can be called on a specific event, like a button click or document click.

    return (
        <>
            <div className={`email-app-details ${showDetails && actives && 'show'}`}>
                <Card>
                    <Card.Body className="p-0">
                        <div>
                            <div className="iq-email-to-list p-3">
                                <div className="d-flex justify-content-between">
                                    <ul className="list-inline d-flex align-items-center justify-content-between m-0 p-0">
                                        <li className="me-3">
                                            <Link to="#" className="email-remove" onClick={closeEmail}>
                                                <h4 className="m-0"><i className="ri-arrow-left-line"></i></h4>
                                            </Link>
                                        </li>
                                        <OverlayTrigger
                                            key={"Mail"}
                                            placement={"top"}
                                            overlay={
                                                <Tooltip id="Mail">
                                                    Mail
                                                </Tooltip>
                                            }
                                        >
                                            <li className="me-2 show">
                                                <Link to="#"><i className="ri-mail-open-line"></i></Link>
                                            </li>
                                        </OverlayTrigger>
                                        <OverlayTrigger
                                            key={"Info"}
                                            placement={"top"}
                                            overlay={
                                                <Tooltip id="Info">
                                                    Info
                                                </Tooltip>
                                            }
                                        >
                                            <li className="me-2" data-bs-toggle="tooltip" data-bs-placement="top" aria-label="Info"
                                                data-bs-original-title="Info">
                                                <Link to="#"><i className="ri-information-line"></i></Link>
                                            </li>
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
                                            <li className="me-2">
                                                <Link to="#"><i className="ri-delete-bin-line"></i></Link>
                                            </li>
                                        </OverlayTrigger>
                                        <OverlayTrigger
                                            key={"Unread"}
                                            placement={"top"}
                                            overlay={
                                                <Tooltip id="Unread">
                                                    Unread
                                                </Tooltip>
                                            }
                                        >
                                            <li className="me-2">
                                                <Link to="#"><i className="ri-mail-unread-line"></i></Link>
                                            </li>
                                        </OverlayTrigger>
                                        <OverlayTrigger
                                            key={"Transfer"}
                                            placement={"top"}
                                            overlay={
                                                <Tooltip id="Transfer">
                                                    Transfer
                                                </Tooltip>
                                            }
                                        >
                                            <li className="me-2">
                                                <Link to="#"><i className="ri-folder-transfer-line"></i></Link>
                                            </li>
                                        </OverlayTrigger>
                                        <OverlayTrigger
                                            key={"Bookmark"}
                                            placement={"top"}
                                            overlay={
                                                <Tooltip id="Bookmark">
                                                    Bookmark
                                                </Tooltip>
                                            }
                                        >
                                            <li className="me-2">
                                                <Link to="#"><i className="ri-bookmark-line"></i></Link>
                                            </li>
                                        </OverlayTrigger>
                                    </ul>
                                    <div className="iq-email-search d-flex">
                                        <ul className="list-inline d-flex align-items-center justify-content-between m-0 p-0">
                                            <li className="me-3">
                                                <a className="font-size-14" href="#">1 of 505</a>
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
                                                <li className="me-2">
                                                    <a href="#"><i className="ri-arrow-left-s-line transform-arrow"></i></a>
                                                </li>
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
                                                <li className="me-2" >
                                                    <a href="#"><i className="ri-arrow-right-s-line transform-arrow"></i></a>
                                                </li>
                                            </OverlayTrigger>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <hr className="mt-0" />
                            <div className="iq-inbox-subject p-3">
                                <h5 className="mb-2">Your elite author Graphic Optimization reward is ready!</h5>
                                <div className="iq-inbox-subject-info">
                                    <div className="iq-subject-info">
                                        <img src={user05} className="img-fluid rounded-circle avatar-80" alt="#" loading="lazy" />
                                        <div className="iq-subject-status align-self-center">
                                            <h6 className="mb-0">XRay team
                                                {/* <a href="dummy@XRay.com">
                                                    <span>dummy@xray.com</span>
                                                </a> */}
                                            </h6>
                                            <Dropdown>
                                                <Dropdown.Toggle as="a" className="dropdown-toggle" href="#" id="dropdownMenuButton" data-bs-toggle="dropdown"
                                                    aria-haspopup="true" aria-expanded="false">
                                                    to Me
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu aria-labelledby="dropdownMenuButton">
                                                    <table className="iq-inbox-details">
                                                        <tbody>
                                                            <tr>
                                                                <td>from:</td>
                                                                <td>Medium Daily Digest</td>
                                                            </tr>
                                                            <tr>
                                                                <td>reply-to:</td>
                                                                <td>noreply@gmail.com</td>
                                                            </tr>
                                                            <tr>
                                                                <td>to:</td>
                                                                <td>iqonicdesigns@gmail.com</td>
                                                            </tr>
                                                            <tr>
                                                                <td>date:</td>
                                                                <td>13 Dec 2019, 08:30</td>
                                                            </tr>
                                                            <tr>
                                                                <td>subject:</td>
                                                                <td>The Golden Rule</td>
                                                            </tr>
                                                            <tr>
                                                                <td>security:</td>
                                                                <td>Standard encryption</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>
                                        <span className="align-self-center">Jan 15, 2029, 10:20AM</span>
                                    </div>
                                    <div className="iq-inbox-body mt-5">
                                        <p>Hi Jopour Xiong,</p>
                                        <p>It is a long established fact that a reader will be distracted
                                            by the readable content of a page when looking at its layout.
                                            The point of using Lorem Ipsum is that it has a more-or-less
                                            normal distribution of letters, as opposed to using 'Content
                                            here, content here', making it look like readable English. Many
                                            desktop publishing packages and web page editors now use Lorem
                                            Ipsum as their default model text, and a search for 'lorem
                                            ipsum' will uncover many web sites still in their infancy.
                                        </p>
                                        <p>Various versions have evolved over the years, sometimes by
                                            accident, sometimes on purpose (injected humour and the like).
                                        </p>
                                        <p className="mt-5 mb-0">Regards,<span className="d-inline-block w-100">John Deo</span></p>
                                    </div>
                                    <hr />
                                    <div className="attegement">
                                        <h6 className="mb-2">ATTACHED FILES:</h6>
                                        <ul>
                                            <li className="icon icon-attegment d-flex align-items-center">
                                                <i className="fa fa-file-text-o" aria-hidden="true"></i>
                                                <span className="ms-1">mydoc.doc</span>
                                            </li>
                                            <li className="icon icon-attegment d-flex align-items-center">
                                                <i className="fa fa-file-text-o" aria-hidden="true"></i>
                                                <span className="ms-1">mydoc.pdf</span>
                                            </li>
                                        </ul>
                                        <div className="d-flex gap-2 mt-3">
                                            <Button variant="primary">
                                                <i className="ri-reply-line"></i> Reply
                                            </Button>
                                            <Button variant="primary">
                                                <i className="ri-send-plane-fill"></i> Forward
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </>
    )
}

export default EmailDetails
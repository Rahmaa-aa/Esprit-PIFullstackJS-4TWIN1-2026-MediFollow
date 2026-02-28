import React, { useState } from "react";
import { Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Form, Row } from "react-bootstrap";
import EmojiPicker from "emoji-picker-react";
import { Link } from "react-router-dom";


import user01 from "/assets/images/user/1.jpg"


const ChatData = (props) => {

    const { SidebarToggle } = props
    const { title, userimg, userdetailname, useraddress, usersortname, usertelnumber, userdob, usergender, userlanguage } = props.data

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [show, setShow] = useState(false)

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const handleEmojiClick = ( ) => {
        // Handle the emoji selection 
        setShowEmojiPicker(false); // Optionally close the picker after selecting
    };

    return (
        <>
            <div className="chat-head">
                <header className="d-flex justify-content-between align-items-center pt-3 pe-3 pb-3 ps-3">
                    <div className="d-flex align-items-center">
                        <div className="sidebar-toggle bg-primary-subtle" onClick={() => SidebarToggle()}>
                            <i className="ri-menu-3-line"></i>
                        </div>
                        <div className="avatar chat-user-profile m-0 me-3" role="button" onClick={() => setShow(!show)}>
                            <img src={userimg} alt="avatar" className="avatar-50 rounded" />
                            <span className="avatar-status"><i className="ri-checkbox-blank-circle-fill text-success"></i></span>
                        </div>
                        <h5 className="mb-0">{title}</h5>
                    </div>
                    <div className={`chat-user-detail-popup scroller overflow-auto ${show && "show"}`} style={{}}>
                        <div className="user-profile text-center">
                            <button type="submit" className="close-popup p-3"><i className="ri-close-fill" onClick={() => {
                                setShow(!show)
                            }}></i></button>
                            <div className="user mb-4">
                                <a className="avatar m-0">
                                    <img src={userimg} alt="avatar" />
                                </a>
                                <div className="user-name mt-4">
                                    <h4>{userdetailname}</h4>
                                </div>
                                <div className="user-desc">
                                    <p>{useraddress}</p>
                                </div>
                            </div>
                            <hr />
                            <div className="chatuser-detail text-start mt-4">
                                <Row>
                                    <Col xs={6} md={6} className="title">Name:</Col>
                                    <Col xs={6} md={6} className="text-end">{usersortname}</Col>
                                </Row>
                                <hr />
                                <Row>
                                    <Col xs={6} md={6} className="title">Tel:</Col>
                                    <Col xs={6} md={6} className="text-end">{usertelnumber}</Col>
                                </Row>
                                <hr />
                                <Row>
                                    <Col xs={6} md={6} className="title">Date Of Birth:</Col>
                                    <Col xs={6} md={6} className="text-end">{userdob}</Col>
                                </Row>
                                <hr />
                                <Row>
                                    <Col xs={6} md={6} className="title">Gender:</Col>
                                    <Col xs={6} md={6} className="text-end">{usergender}</Col>
                                </Row>
                                <hr />
                                <Row>
                                    <Col xs={6} md={6} className="title">Language:</Col>
                                    <Col xs={6} md={6} className="text-end">{userlanguage}</Col>
                                </Row>
                                <hr />
                            </div>
                        </div>
                    </div>
                    <div className="chat-header-icons d-flex">
                        <Link to="#" className="chat-icon-phone bg-primary-subtle ms-3">
                            <i className="ri-phone-line"></i>
                        </Link>
                        <Link to="#" className="chat-icon-video bg-primary-subtle">
                            <i className="ri-vidicon-line"></i>
                        </Link>
                        <Link to="#" className="chat-icon-delete bg-primary-subtle">
                            <i className="ri-delete-bin-line"></i>
                        </Link>
                        <span className="bg-primary-subtle d-flex align-items-center justify-content-center">
                            <Dropdown>
                                <DropdownToggle as="i" className="ri-more-2-line cursor-pointer dropdown-toggle nav-hide-arrow cursor-pointer pe-0"
                                    id="dropdownMenuButton02" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
                                    role="menu"></DropdownToggle>
                                <DropdownMenu className="dropdown-menu-right" aria-labelledby="dropdownMenuButton02">
                                    <DropdownItem as="a" href="#"><i className="fa fa-thumb-tack"
                                        aria-hidden="true"></i>{" "}
                                        Pin to top</DropdownItem>
                                    <DropdownItem as="a" href="#"><i className="fa fa-trash-o" aria-hidden="true"></i>{" "}
                                        Delete chat</DropdownItem>
                                    <DropdownItem as="a" href="#"><i className="fa fa-ban" aria-hidden="true"></i>{" "}
                                        Block</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </span>
                    </div>
                </header>
            </div>
            <div className="chat-content scroller">
                <div className="chat">
                    <div className="chat-user">
                        <a className="avatar m-0">
                            <img src={user01} alt="avatar" className="avatar-50 rounded" />
                        </a>
                        <span className="chat-time mt-1">6:45</span>
                    </div>
                    <div className="chat-detail">
                        <div className="chat-message">
                            <p>How can we help? We're here for you! 😄</p>
                        </div>
                    </div>
                </div>
                <div className="chat chat-left">
                    <div className="chat-user">
                        <a className="avatar m-0">
                            <img src={userimg} alt="avatar" className="avatar-50 rounded" />
                        </a>
                        <span className="chat-time mt-1">6:48</span>
                    </div>
                    <div className="chat-detail">
                        <div className="chat-message">
                            <p>Hey John, I am looking for the best admin template.</p>
                            <p>Could you please help me to find it out? 🤔</p>
                        </div>
                    </div>
                </div>
                <div className="chat">
                    <div className="chat-user">
                        <a className="avatar m-0">
                            <img src={user01} alt="avatar" className="avatar-50 rounded" />
                        </a>
                        <span className="chat-time mt-1">6:49</span>
                    </div>
                    <div className="chat-detail">
                        <div className="chat-message">
                            <p>Absolutely!</p>
                            <p>XRay Dashboard is the responsive bootstrap 5 admin
                                template.</p>
                        </div>
                    </div>
                </div>
                <div className="chat chat-left">
                    <div className="chat-user">
                        <a className="avatar m-0">
                            <img src={userimg} alt="avatar" className="avatar-50 rounded" />
                        </a>
                        <span className="chat-time mt-1">6:52</span>
                    </div>
                    <div className="chat-detail">
                        <div className="chat-message">
                            <p>Looks clean and fresh UI.</p>
                        </div>
                    </div>
                </div>
                <div className="chat">
                    <div className="chat-user">
                        <a className="avatar m-0">
                            <img src={user01} alt="avatar" className="avatar-50 rounded" />
                        </a>
                        <span className="chat-time mt-1">6:53</span>
                    </div>
                    <div className="chat-detail">
                        <div className="chat-message">
                            <p>Thanks, from ThemeForest.</p>
                        </div>
                    </div>
                </div>
                <div className="chat chat-left">
                    <div className="chat-user">
                        <a className="avatar m-0">
                            <img src={userimg} alt="avatar" className="avatar-50 rounded" />
                        </a>
                        <span className="chat-time mt-1">6:54</span>
                    </div>
                    <div className="chat-detail">
                        <div className="chat-message">
                            <p>I will purchase it for sure. 👍</p>
                        </div>
                    </div>
                </div>
                <div className="chat">
                    <div className="chat-user">
                        <a className="avatar m-0">
                            <img src={user01} alt="avatar" className="avatar-50 rounded" />
                        </a>
                        <span className="chat-time mt-1">6:56</span>
                    </div>
                    <div className="chat-detail">
                        <div className="chat-message">
                            <p>Okay Thanks..</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="chat-footer p-3">
                <Form className="d-flex align-items-center" >
                    <div className="chat-attagement d-flex">
                        <Link to="#" className="dropdown"><i className="fa fa-smile-o pe-3" data-bs-toggle="dropdown"
                            aria-haspopup="true" aria-expanded="false" onClick={toggleEmojiPicker}></i>
                            {showEmojiPicker && (
                                <div className="dropdown-menu p-0 border-0">
                                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                                </div>
                            )}
                        </Link>
                        <Link to="#"><i className="fa fa-paperclip pe-3" aria-hidden="true"></i></Link>
                    </div>
                    <input type="text" className="form-control me-3" id="chat-input-1" placeholder="Type your message"
                        aria-label="Recipient's username" aria-describedby="basic-addon2-1" />
                    <button type="submit" className="btn btn-primary-subtle d-flex align-items-center p-2"><i className="fa fa-paper-plane-o"
                        aria-hidden="true"></i><span className="d-none d-lg-block ms-1">Send</span></button>
                </Form>
            </div>
        </>
    )
}

export default ChatData
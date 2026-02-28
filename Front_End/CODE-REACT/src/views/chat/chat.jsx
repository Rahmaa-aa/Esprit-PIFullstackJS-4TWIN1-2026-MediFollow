import React, { useState } from "react";
import { Col, Nav, Row, Tab } from "react-bootstrap";

// Import Image 
import user05 from "/assets/images/user/05.jpg"
import user06 from "/assets/images/user/06.jpg"
import user07 from "/assets/images/user/07.jpg"
import user08 from "/assets/images/user/08.jpg"
import user09 from "/assets/images/user/09.jpg"
import user10 from "/assets/images/user/10.jpg" 
import ChatData from "../../components/chat-data"; 

const Chat = () => {
 
  const userData = [
    {
      title: 'Team Discussions',
      userimg: user05,
      userdetailname: "Bini Jordan",
      useraddress: "Cape Town, RSA",
      usersortname: "Bini",
      usertelnumber: "072 143 9920",
      userdob: "July 12, 1989",
      usergender: "Male",
      userlanguage: "English",
    },
    {
      title: 'Announcement',
      userimg: user06,
      useraddress: "Atlanta, USA",
      usersortname: "Mark",
      usertelnumber: "072 143 9920",
      userdob: "July 12, 1989",
      usergender: "Female",
      userlanguage: "English",
    },
    {
      title: 'Doctors',
      userimg: user07,
      useraddress: "Cape Town, RSA",
      usersortname: "pai",
      usertelnumber: "072 143 9920",
      userdob: "July 12, 1989",
      usergender: "Male",
      userlanguage: "English",
    },
    {
      title: "Nurses",
      userimg: user08,
      userdetailname: "Barb Ackue",
      useraddress: "Cape Town, RSA",
      usersortname: "Babe",
      usertelnumber: "072 143 9920",
      userdob: "July 12, 1989",
      usergender: "Female", // Fixed spelling
      userlanguage: "English" // Fixed spelling
    },
    {
      title: "Testing Team",
      userimg: user09,
      userdetailname: "Peta Saireya",
      useraddress: "Cape Town, RSA",
      usersortname: "Pet",
      usertelnumber: "072 143 9920",
      userdob: "July 12, 1989",
      usergender: "Female",
      userlanguage: "English" // Fixed spelling
    },
    {
      title: "Paul Molive",
      userimg: user10,
      userdetailname: "Paul Molive",
      useraddress: "Cape Town, RSA",
      usersortname: "Pau",
      usertelnumber: "072 143 9920",
      userdob: "July 12, 1989",
      usergender: "Male",
      userlanguage: "English" // Fixed spelling
    },
    {
      title: "Paige Turner",
      userimg: user05, // Assuming user05 is defined elsewhere
      useraddress: "Cape Town, RSA",
      usersortname: "Pai",
      usertelnumber: "072 143 9920",
      userdob: "July 12, 1989",
      usergender: "Female", // Corrected spelling
      userlanguage: "English" // Corrected spelling
    },
    {
      title: 'Barb Ackue',
      userimg: user06, // Assuming path is defined in the context
      useraddress: "Cape Town, RSA",
      usersortname: "Babe",
      usertelnumber: "072 143 9920",
      userdob: "July 12, 1989",
      usergender: "Female",
      userlanguage: "English" // Corrected spelling
    },
    {
      title: 'Maya Didas',
      userimg: user07, // Assuming path is defined in the context
      userAddress: "Cape Town, RSA",
      userSortName: "Babe",
      userTelNumber: "072 143 9920",
      userDOB: "July 12, 1989",
      userGender: "Male",
      userLanguage: "English" // Corrected spelling
    },
    {
      title: 'Monty Carlo',
      userimg: user08, // Assuming path is defined in the context
      userAddress: "Cape Town, RSA",
      userSortName: "Babe",
      userTelNumber: "072 143 9920",
      userDOB: "July 12, 1989",
      userGender: "Female",
      userLanguage: "English" // Corrected spelling
    },
    // Add more user objects as needed
  ];


  const [sidebar, setSidebar] = useState(false)

  const SidebarToggle = () => {
    if (window.innerWidth < 990) {
      setSidebar(!sidebar)
    }
  }



  return (

    <>
      <Row className="cust-chat">
        <Tab.Container defaultActiveKey={"chatbox1"}>
          <Col lg={3} className={`chat-data-left scroller ${sidebar && 'show'}`}>
            <div className="chat-sidebar-channel scroller ps-3 ">
              <div className="d-flex align-items-center justify-content-between pt-5 pt-lg-0 pb-3 pb-lg-0">
                <h5 className="ms-3 mb-0 mb-lg-2">Public Channels</h5>
                <div className="sidebar-toggle bg-primary-subtle" ><i className="ri-close-fill" style={{ fontSize: '1.6rem' }} onClick={() => {
                  SidebarToggle()
                }}></i></div>
              </div>
              <ul className="iq-chat-ui nav flex-column nav-pills" role="tablist">
                <Nav.Item as="li">
                  <Nav.Link as="a" className="d-none" data-bs-toggle="pill" eventKey="default-block" aria-selected="false" role="tab"
                    tabIndex="-1">
                    <div className="d-flex align-items-center" onClick={() => {
                      SidebarToggle()
                    }}>
                      <div className="avatar me-3">
                        <img src={user05} alt="chatuserimage" className="avatar-50 rounded" />
                        <span className="avatar-status"><i className="ri-checkbox-blank-circle-fill text-success"></i></span>
                      </div>
                      <div className="chat-sidebar-name">
                        <h6 className="mb-0">Team Discussions</h6>
                        <span>Lorem Ipsum is</span>
                      </div>
                      <div className="chat-meta float-end text-center mt-2">
                        <div className="chat-msg-counter bg-primary text-white">20</div>
                        <span className="text-nowrap">05 min</span>
                      </div>
                    </div>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item as="li">
                  <Nav.Link as="a" eventKey="chatbox1">
                    <div className="d-flex align-items-center cursor-pointer" onClick={() => {
                      SidebarToggle()
                    }}>
                      <div className="avatar me-3">
                        <img src={user05} alt="chatuserimage" className="avatar-50 rounded" />
                        <span className="avatar-status"><i className="ri-checkbox-blank-circle-fill text-success"></i></span>
                      </div>
                      <div className="chat-sidebar-name">
                        <h6 className="mb-0">Team Discussions</h6>
                        <span>Lorem Ipsum is</span>
                      </div>
                      <div className="chat-meta float-end text-center mt-2">
                        <div className="chat-msg-counter bg-primary text-white">20</div>
                        <span className="text-nowrap">05 min</span>
                      </div>
                    </div>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item as="li">
                  <Nav.Link as="a" eventKey="chatbox2">
                    <div className="d-flex align-items-center cursor-pointer" onClick={() => {
                      SidebarToggle()
                    }}>
                      <div className="avatar me-3">
                        <img src={user06} alt="chatuserimage" className="avatar-50 rounded" />
                        <span className="avatar-status"><i className="ri-checkbox-blank-circle-fill text-success"></i></span>
                      </div>
                      <div className="chat-sidebar-name">
                        <h6 className="mb-0">Announcement</h6>
                        <span>This Sunday we</span>
                      </div>
                      <div className="chat-meta float-end text-center mt-2">
                        <div className="chat-msg-counter bg-primary text-white">10</div>
                        <span className="text-nowrap">10 min</span>
                      </div>
                    </div>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item as="li">
                  <h5 className="mt-3 ms-3">Private Channels</h5>
                  <Nav.Link as="a" eventKey="chatbox3">
                    <div className="d-flex align-items-center cursor-pointer" onClick={() => {
                      SidebarToggle()
                    }}>
                      <div className="avatar me-3">
                        <img src={user07} alt="chatuserimage" className="avatar-50 rounded" />
                        <span className="avatar-status"><i className="ri-checkbox-blank-circle-fill text-warning"></i></span>
                      </div>
                      <div className="chat-sidebar-name">
                        <h6 className="mb-0">Doctors</h6>
                        <span>There are many </span>
                      </div>
                    </div>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item as="li">
                  <Nav.Link as="a" eventKey="chatbox4">
                    <div className="d-flex align-items-center cursor-pointer" onClick={() => {
                      SidebarToggle()
                    }}>
                      <div className="avatar me-3">
                        <img src={user08} alt="chatuserimage" className="avatar-50 rounded" />
                        <span className="avatar-status"><i className="ri-checkbox-blank-circle-fill text-success"></i></span>
                      </div>
                      <div className="chat-sidebar-name">
                        <h6 className="mb-0">Nurses</h6>
                        <span>passages of Lorem</span>
                      </div>
                    </div>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item as="li">
                  <Nav.Link as="a" eventKey="chatbox5">
                    <div className="d-flex align-items-center cursor-pointer" onClick={() => {
                      SidebarToggle()
                    }}>
                      <div className="avatar me-3">
                        <img src={user09} alt="chatuserimage" className="avatar-50 rounded" />
                        <span className="avatar-status"><i className="ri-checkbox-blank-circle-fill text-info"></i></span>
                      </div>
                      <div className="chat-sidebar-name">
                        <h6 className="mb-0">OT Special</h6>
                        <span>Lorem Ipsum used</span>
                      </div>
                    </div>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item as="li">
                  <h5 className="mt-3 ms-3">Direct Message</h5>
                  <Nav.Link as="a" eventKey="chatbox6" aria-selected="false" tabIndex="-1" role="tab">
                    <div className="d-flex align-items-center cursor-pointer" onClick={() => {
                      SidebarToggle()
                    }}>
                      <div className="avatar me-3">
                        <img src={user10} alt="chatuserimage" className="avatar-50 rounded" />
                        <span className="avatar-status"><i className="ri-checkbox-blank-circle-fill text-dark"></i></span>
                      </div>
                      <div className="chat-sidebar-name">
                        <h6 className="mb-0">Paul Molive</h6>
                        <span>translation by</span>
                      </div>
                    </div>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item as="li">
                  <Nav.Link as="a" eventKey="chatbox7" >
                    <div className="d-flex align-items-center cursor-pointer" onClick={() => {
                      SidebarToggle()
                    }}>
                      <div className="avatar me-3">
                        <img src={user05} alt="chatuserimage" className="avatar-50 rounded" />
                        <span className="avatar-status"><i className="ri-checkbox-blank-circle-fill text-success"></i></span>
                      </div>
                      <div className="chat-sidebar-name">
                        <h6 className="mb-0">Paige Turner</h6>
                        <span>Lorem Ipsum which</span>
                      </div>
                    </div>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item as="li">
                  <Nav.Link as="a" eventKey="chatbox8" >
                    <div className="d-flex align-items-center cursor-pointer" onClick={() => {
                      SidebarToggle()
                    }}>
                      <div className="avatar me-3">
                        <img src={user06} alt="chatuserimage" className="avatar-50 rounded" />
                        <span className="avatar-status"><i className="ri-checkbox-blank-circle-fill text-primary"></i></span>
                      </div>
                      <div className="chat-sidebar-name">
                        <h6 className="mb-0">Barb Ackue</h6>
                        <span>simply random text</span>
                      </div>
                    </div>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item as="li">
                  <Nav.Link as="a" data-bs-toggle="pill" eventKey="chatbox9" >
                    <div className="d-flex align-items-center cursor-pointer" onClick={() => {
                      SidebarToggle()
                    }}>
                      <div className="avatar me-3">
                        <img src={user07} alt="chatuserimage" className="avatar-50 rounded" />
                        <span className="avatar-status"><i className="ri-checkbox-blank-circle-fill text-danger"></i></span>
                      </div>
                      <div className="chat-sidebar-name">
                        <h6 className="mb-0">Maya Didas</h6>
                        <span> but also the leap</span>
                      </div>
                    </div>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item as="li">
                  <Nav.Link as="a" data-bs-toggle="pill" eventKey="chatbox10" >
                    <div className="d-flex align-items-center cursor-pointer" onClick={() => {
                      SidebarToggle()
                    }}>
                      <div className="avatar me-3">
                        <img src={user08} alt="chatuserimage" className="avatar-50 rounded" />
                        <span className="avatar-status"><i className="ri-checkbox-blank-circle-fill text-warning"></i></span>
                      </div>
                      <div className="chat-sidebar-name">
                        <h6 className="mb-0">Monty Carlo</h6>
                        <span>Contrary to popular</span>
                      </div>
                    </div>
                  </Nav.Link>
                </Nav.Item>
              </ul>
            </div>
          </Col>
          <div className="col-lg-9">
            <div className="chat-data chat-data-right">
              <Tab.Content>
                <Tab.Pane className="fade" eventKey="default-block">
                  <div className="chat-start">
                    <span className="iq-start-icon text-primary"><i className="ri-message-3-line"></i></span>
                    <button id="chat-start" className="btn bg-primary mt-3">Start
                      Conversation!</button>
                  </div>
                </Tab.Pane>
                {userData.map((user, index) => (
                  <Tab.Pane key={index} className="fade" eventKey={`chatbox${index + 1}`}>
                    <ChatData data={user} SidebarToggle={SidebarToggle}></ChatData>
                  </Tab.Pane>
                ))}
              </Tab.Content>
            </div>
          </div>
        </Tab.Container >
      </Row>
    </>
  )
}

export default Chat
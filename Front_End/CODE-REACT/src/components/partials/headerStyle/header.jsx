import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// Import From React Bootstrap
import { Col, Container, Dropdown, Nav, Navbar, Row } from 'react-bootstrap'

// Import selectors & action from setting store
import * as SettingSelector from '../../../store/setting/selectors'

// Redux Selector / Action
import { useSelector } from 'react-redux';


// Import Image
import flag01 from "/assets/images/small/flag-01.png"
import flag02 from "/assets/images/small/flag-02.png"
import flag03 from "/assets/images/small/flag-03.png"
import flag04 from "/assets/images/small/flag-04.png"
import flag05 from "/assets/images/small/flag-05.png"
import flag06 from "/assets/images/small/flag-06.png"

import user01 from "/assets/images/user/01.jpg"
import user02 from "/assets/images/user/02.jpg"
import user03 from "/assets/images/user/03.jpg"
import user04 from "/assets/images/user/04.jpg"

import user001 from "/assets/images/user/001.png"

const Header = () => {

   const pageLayout = useSelector(SettingSelector.page_layout)

   const [open, setOpen] = useState(false)
   const [isScrolled, setIsScrolled] = useState(false);

   useEffect(() => {
      const handleScrolld = () => {
         if (window.scrollY >= 75) {
            setIsScrolled(true);
         } else {
            setIsScrolled(false);
         }
      };

      window.addEventListener('scroll', handleScrolld);

      // Cleanup event listener on component unmount
      return () => {
         window.removeEventListener('scroll', handleScrolld);
      };
   }, [])


   // Fullscreen Functionality
   const [isFullScreen, setIsFullScreen] = useState(false);

   const toggleFullScreen = () => {
      if (!document.fullscreenElement &&
         !document.mozFullScreenElement &&
         !document.webkitFullscreenElement &&
         !document.msFullscreenElement) {
         // Request fullscreen
         if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
         } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
         } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
         } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
         }
         setIsFullScreen(true);
      } else {
         // Exit fullscreen
         if (document.exitFullscreen) {
            document.exitFullscreen();
         } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
         } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
         } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
         }
         setIsFullScreen(false);
      }
   };


   const handleSidebar = () => {
      let aside = document.getElementsByTagName("ASIDE")[0];
      if (aside) {
         if (!aside.classList.contains('sidebar-mini')) {
            aside.classList.toggle("sidebar-mini");
            aside.classList.toggle("sidebar-hover");
         } else {
            aside.classList.remove("sidebar-mini")
            aside.classList.remove("sidebar-hover");
         }

         if (window.innerWidth < 990) {
            if (!aside.classList.contains('sidebar-mini')) {
               aside.classList.remove("sidebar-mini")
               aside.classList.toggle("sidebar-hover");
            }
         }
      }
   }

   return (
      <>
         {/* <Navbar> */}
         <Navbar className={`nav navbar-expand-xl navbar-light iq-navbar pt-2 pb-2 px-2 iq-header ${isScrolled ? "fixed-header" : ""} ${pageLayout === 'container-fluid' ? "" : "container-box"}`} id="boxid">
            <Container fluid className="navbar-inner">
               <Row className="flex-grow-1">
                  <Col lg={4} md={6} className="align-items-center d-flex">
                     <Nav.Item as="li" className="nav-item dropdown search-width pt-2 pt-lg-0">
                        <div className="form-group input-group mb-0 search-input">
                           <input type="text" className="form-control"
                              placeholder="Type here to search..." />{" "}
                           <span className="input-group-text">
                              <svg className="icon-20 text-primary" width="20" height="20"
                                 viewBox="0 0 24 24" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                 <circle cx="11.7669" cy="11.7666" r="8.98856"
                                    stroke="currentColor" strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"></circle>
                                 <path d="M18.0186 18.4851L21.5426 22"
                                    stroke="currentColor" strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"></path>
                              </svg>
                           </span>
                        </div>
                     </Nav.Item>
                  </Col>
                  <Col lg={8} md={6}
                     className="d-flex justify-content-end align-items-center">
                     <Dropdown as="li" className="nav-item">
                        <Dropdown.Toggle
                           as="a" bsPrefix=' ' to="#" className="nav-link d-none d-xl-block"
                           id="notification-drop" data-bs-toggle="dropdown">
                           <img src={flag01}
                              alt="img-flaf" className="img-fluid me-1"
                              style={{ height: "16px", width: "16px" }} /> English <i
                                 className="ri-arrow-down-s-line"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu as="div" drop={'end'} className="p-0 sub-drop dropdown-menu dropdown-menu-end"
                           aria-labelledby="notification-drop">
                           <div className="m-0 -none card">

                              <div className="p-0 card-body">
                                 <a href="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img
                                          src={flag02}
                                          alt loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <p className="mb-0 ">French</p>
                                       </div>
                                    </div>
                                 </a>
                                 <a href="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img
                                          src={flag03}
                                          alt loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <p className="mb-0 ">Spanish</p>
                                       </div>
                                    </div>
                                 </a>
                                 <a href="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img
                                          src={flag04}
                                          alt loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <p className="mb-0 ">Italian</p>
                                       </div>
                                    </div>
                                 </a>
                                 <a href="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img
                                          src={flag05}
                                          alt loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <p className="mb-0 ">German</p>
                                       </div>
                                    </div>
                                 </a>
                                 <a href="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img
                                          src={flag06}
                                          alt loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <p className="mb-0 ">Japanese</p>
                                       </div>
                                    </div>
                                 </a>
                              </div>
                           </div>
                        </Dropdown.Menu>
                     </Dropdown>
                     <Nav.Item as="li" className="nav-item iq-full-screen d-none d-xl-block"
                        id="fullscreen-item">
                        <a href="#" className="nav-link" id="btnFullscreen" onClick={toggleFullScreen}>
                           <i className={`ri-fullscreen-line normal-screen ${isFullScreen ? 'd-none' : ""}`}></i>
                           <i className={`ri-fullscreen-exit-line full-normal-screen ${isFullScreen ? '' : " d-none"}`}></i>
                        </a>
                     </Nav.Item>
                     <Dropdown as="li" className="nav-item">
                        <Dropdown.Toggle bsPrefix=' ' as="a" to="#" className="nav-link d-none d-xl-block"
                           id="notification-drop" data-bs-toggle="dropdown">
                           <i className="ri-notification-4-line"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu drop={'start'} as="div" className="p-0 sub-drop dropdown-menu-end"
                           aria-labelledby="notification-drop">
                           <div className="m-0 -none card">
                              <div
                                 className="py-3 card-header d-flex justify-content-between bg-primary mb-0 rounded-top-3">
                                 <div className="header-title w-100">
                                    <h5
                                       className="mb-0 text-white d-flex justify-content-between">All
                                       Notifications <small
                                          className="badge text-bg-light  pt-1">4</small></h5>
                                 </div>
                              </div>
                              <div className="p-0 card-body">
                                 <a href="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img className="p-1 avatar-40 "
                                          src={user01} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">Emma Watson Bni</h6>
                                          <div className="d-flex justify-content-between">
                                             <p className="mb-0">95 MB</p>
                                             <small className="float-end font-size-12">Just
                                                Now</small>
                                          </div>
                                       </div>

                                    </div>
                                 </a>
                                 <a href="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img className="p-1 avatar-40 "
                                          src={user02} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">New customer is join</h6>
                                          <div className="d-flex justify-content-between">
                                             <p className="mb-0">Jond Bini</p>
                                             <small className="float-end font-size-12">Just
                                                Now</small>
                                          </div>
                                       </div>

                                    </div>
                                 </a>
                                 <a href="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img className="p-1 avatar-40 "
                                          src={user03} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">Two customer is left</h6>
                                          <div className="d-flex justify-content-between">
                                             <p className="mb-0">Jond Bini</p>
                                             <small className="float-end font-size-12">Just
                                                Now</small>
                                          </div>
                                       </div>

                                    </div>
                                 </a>
                                 <a href="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img className="p-1 avatar-40 "
                                          src={user04} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">New Mail from Fenny</h6>
                                          <div className="d-flex justify-content-between">
                                             <p className="mb-0">Jond Bini</p>
                                             <small className="float-end font-size-12">Just
                                                Now</small>
                                          </div>
                                       </div>

                                    </div>
                                 </a>
                              </div>
                           </div>
                        </Dropdown.Menu>
                     </Dropdown>
                     <Dropdown as="li" className="nav-item">
                        <Dropdown.Toggle as="a" bsPrefix=' ' to="#" className="nav-link d-none d-xl-block"
                           id="notification-drop" data-bs-toggle="dropdown">
                           <i className="ri-mail-open-line"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu as="div" className="p-0 sub-drop dropdown-menu dropdown-menu-end"
                           aria-labelledby="notification-drop">
                           <div className="m-0 -none card">
                              <div
                                 className="py-3 card-header d-flex justify-content-between bg-primary mb-0 rounded-top-3">
                                 <div className="header-title w-100">
                                    <h5
                                       className="mb-0 text-white d-flex justify-content-between">All
                                       Messages <small
                                          className="badge text-bg-light  pt-1">4</small></h5>
                                 </div>
                              </div>
                              <div className="p-0 card-body">
                                 <a href="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img className="p-1 avatar-40 "
                                          src={user01} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">Emma Watson Bni</h6>
                                          <div className="d-flex justify-content-between">
                                             <p className="mb-0">Jond Bini</p>
                                             <small className="float-end font-size-12">Just
                                                Now</small>
                                          </div>
                                       </div>
                                    </div>
                                 </a>
                                 <a href="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img className="p-1 avatar-40 "
                                          src={user02} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">New customer is join</h6>
                                          <div className="d-flex justify-content-between">
                                             <p className="mb-0">Jond Bini</p>
                                             <small className="float-end font-size-12">5 days
                                                ago</small>
                                          </div>
                                       </div>
                                    </div>
                                 </a>
                                 <a href="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img className="p-1 avatar-40 "
                                          src={user03} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">Two customer is left</h6>
                                          <div className="d-flex justify-content-between">
                                             <p className="mb-0">Jond Bini</p>
                                             <small className="float-end font-size-12">2 days
                                                ago</small>
                                          </div>
                                       </div>
                                    </div>
                                 </a>
                                 <a href="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img className="p-1 avatar-40 "
                                          src={user04} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">New Mail from Fenny</h6>
                                          <div className="d-flex justify-content-between">
                                             <p className="mb-0">Jond Bini</p>
                                             <small className="float-end font-size-12">3 days
                                                ago</small>
                                          </div>
                                       </div>
                                    </div>
                                 </a>
                              </div>
                           </div>
                        </Dropdown.Menu>
                     </Dropdown>
                     <Nav.Item as="li" className="nav-item d-block d-xl-none" onClick={handleSidebar}>
                        <a className="wrapper-menu" data-toggle="sidebar" data-active="true">
                           <div className="main-circle "><i className="ri-more-fill"></i></div>
                        </a>
                     </Nav.Item>
                     {/* -- dropdown -- */}

                     <Navbar.Toggle className="px-0 ms-3 d-flex align-items-center d-block d-xl-none"
                        aria-controls="navbarSupportedContent" aria-expanded={open} >
                        <span className="navbar-toggler-btn" onClick={() => {
                           setOpen(!open)
                        }}>
                           <span className="navbar-toggler-icon"></span>
                        </span>
                     </Navbar.Toggle>


                     {/* -- dropdown -- */}
                     <Dropdown as="li" className="nav-item">
                        <Dropdown.Toggle as="a" bsPrefix=' ' to="#" className="nav-link d-flex align-items-center"
                           id="notification-drop">
                           <img src={user001}
                              style={{ width: "50px", height: "50px" }}
                              className="img-fluid rounded" alt="user" />
                           <div className="caption d-none d-lg-block">
                              <h6 className="mb-0 line-height">Bini Jets</h6>
                              <span className="font-size-12">Available</span>
                           </div>{" "}
                        </Dropdown.Toggle>{" "}
                        <Dropdown.Menu as="div" className="p-0 sub-drop dropdown-menu dropdown-menu-end"
                           aria-labelledby="notification-drop">
                           <div className="m-0 -none card">
                              <div
                                 className="py-3 card-header d-flex justify-content-between bg-primary mb-0 rounded-top-3">
                                 <div className="header-title">
                                    <h5 className="mb-0 text-white">All Notifications</h5>
                                    <span className="text-white ">Available</span>
                                 </div>
                              </div>
                              <div className="p-0 card-body">
                                 <Link to="/doctor/doctor-profile" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <div
                                          className="bg-primary-subtle px-3 py-2 rounded-1">
                                          <i className="ri-file-user-line "></i>
                                       </div>
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">My Profile</h6>
                                          <p className="mb-0">View personal profile
                                             details.</p>
                                       </div>

                                    </div>
                                 </Link>
                                 <Link to="/doctor/edit-doctor" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <div
                                          className="bg-primary-subtle px-3 py-2 rounded-1">
                                          <i className="ri-profile-line "></i>
                                       </div>
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">Edit Profile</h6>
                                          <p className="mb-0">Modify your personal
                                             details.</p>
                                       </div>

                                    </div>
                                 </Link>
                                 <Link to="/extra-pages/account-setting" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <div
                                          className="bg-primary-subtle px-3 py-2 rounded-1">
                                          <i className="ri-account-box-line "></i>
                                       </div>
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">Account Settings</h6>
                                          <p className="mb-0">Manage your account
                                             parameters.</p>
                                       </div>

                                    </div>
                                 </Link>
                                 <Link to="/extra-pages/privacy-setting" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <div
                                          className="bg-primary-subtle px-3 py-2 rounded-1">
                                          <i className="ri-lock-line"></i>
                                       </div>
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">Privacy Settings</h6>
                                          <p className="mb-0">Control your privacy
                                             parameters.</p>
                                       </div>

                                    </div>
                                 </Link>
                                 <div className="iq-sub-card d-flex justify-content-center">
                                    <Link to="/auth/sign-in" className="btn btn-primary-subtle ">
                                       Sign out
                                       <i className="ri-login-box-line ms-2"></i>
                                    </Link>
                                 </div>
                              </div>
                           </div>
                        </Dropdown.Menu>
                     </Dropdown>
                  </Col>
               </Row>

            </Container>

            {/* -- collapse -- */}
            <Navbar.Collapse id="navbarSupportedContent">
               <Row className="flex-grow-1 pt-4 pb-4 px-2">

                  <Col md={12} className="d-flex justify-content-end align-items-center">
                     <Dropdown as="li" className="nav-item">
                        <Dropdown.Toggle as="a" bsPrefix=' ' to="#" className="nav-link d-block d-xl-none"
                           id="notification-drop">
                           <img src={flag01}
                              alt="img-flaf" className="img-fluid me-1"
                              style={{ height: "16px", width: "16px" }} /> English <i
                                 className="ri-arrow-down-s-line"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu as="div" className="p-0 sub-drop dropdown-menu-end"
                           aria-labelledby="notification-drop">
                           <div className="m-0 -none card">
                              <div className="p-0 card-body">
                                 <Link to="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img
                                          src={flag02}
                                          alt loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <p className="mb-0 ">French</p>
                                       </div>
                                    </div>
                                 </Link>
                                 <Link to="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img
                                          src={flag03}
                                          alt loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <p className="mb-0 ">Spanish</p>
                                       </div>
                                    </div>
                                 </Link>
                                 <Link to="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img
                                          src={flag04}
                                          alt loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <p className="mb-0 ">Italian</p>
                                       </div>
                                    </div>
                                 </Link>
                                 <Link to="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img
                                          src={flag05}
                                          alt loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <p className="mb-0 ">German</p>
                                       </div>
                                    </div>
                                 </Link>
                                 <Link to="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img
                                          src={flag06}
                                          alt loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <p className="mb-0 ">Japanese</p>
                                       </div>
                                    </div>
                                 </Link>
                              </div>
                           </div>
                        </Dropdown.Menu>
                     </Dropdown>{" "}
                     <li className="nav-item dropdown">
                     </li>
                     <Nav.Item className="iq-full-screen iq-full-screen2 d-block d-xl-none"
                        id="fullscreen-item">
                        <a href="#" className="nav-link" id="btnFullscreen" onClick={toggleFullScreen}>
                           <i className={`ri-fullscreen-line normal-screen ${isFullScreen ? 'd-none' : ""}`}></i>
                           <i className={`ri-fullscreen-exit-line full-normal-screen ${isFullScreen ? '' : " d-none"}`}></i>
                        </a>
                     </Nav.Item>{" "}
                     <Dropdown as="li" className="nav-item">
                        <Dropdown.Toggle as="a" bsPrefix=' ' to="#" className="nav-link d-block d-xl-none "
                           id="notification-drop">
                           <i className="ri-notification-4-line"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="p-0 sub-drop dropdown-menu-end"
                           aria-labelledby="notification-drop">
                           <div className="m-0 -none card">
                              <div
                                 className="py-3 card-header d-flex justify-content-between bg-primary mb-0">
                                 <div className="header-title">
                                    <h5 className="mb-0 text-white">All Notifications</h5>
                                 </div>
                              </div>
                              <div className="p-0 card-body">
                                 <Link as="a" to="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img
                                          className="p-1 avatar-40 rounded-pill bg-primary-subtle"
                                          src={user01} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">Emma Watson Bni</h6>
                                          <p className="mb-0">95 MB</p>
                                       </div>
                                       <small className="float-end font-size-12">Just
                                          Now</small>
                                    </div>
                                 </Link>
                                 <Link as="a" to="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img
                                          className="p-1 avatar-40 rounded-pill bg-primary-subtle"
                                          src={user02} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">New customer is join</h6>
                                          <p className="mb-0">Cyst Bni</p>
                                       </div>
                                       <small className="float-end font-size-12">5 days
                                          ago</small>
                                    </div>
                                 </Link>
                                 <Link as="a" to="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img
                                          className="p-1 avatar-40 rounded-pill bg-primary-subtle"
                                          src={user03} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">Two customer is left</h6>
                                          <p className="mb-0">Cyst Bni</p>
                                       </div>
                                       <small className="float-end font-size-12">2 days
                                          ago</small>
                                    </div>
                                 </Link>
                                 <Link as="a" to="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img
                                          className="p-1 avatar-40 rounded-pill bg-primary-subtle"
                                          src={user04} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">New Mail from Fenny</h6>
                                          <p className="mb-0">Cyst Bni</p>
                                       </div>
                                       <small className="float-end font-size-12">3 days
                                          ago</small>
                                    </div>
                                 </Link>
                              </div>
                           </div>
                        </Dropdown.Menu>
                     </Dropdown>{" "}
                     <Dropdown as="li" className="nav-item">
                        <Dropdown.Toggle as="a" bsPrefix=' ' to="#" className="nav-link d-block d-xl-none"
                           id="notification-drop">
                           <i className="ri-mail-open-line"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu as="div" className="p-0 sub-drop dropdown-menu-end"
                           aria-labelledby="notification-drop">
                           <div className="m-0 -none card">
                              <div
                                 className="py-3 card-header d-flex justify-content-between bg-primary mb-0">
                                 <div className="header-title">
                                    <h5 className="mb-0 text-white">All Notifications</h5>
                                 </div>
                              </div>
                              <div className="p-0 card-body">
                                 <Link to="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img
                                          className="p-1 avatar-40 rounded-pill bg-primary-subtle"
                                          src={user01} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">Emma Watson Bni</h6>
                                          <p className="mb-0">95 MB</p>
                                       </div>
                                       <small className="float-end font-size-12">Just
                                          Now</small>
                                    </div>
                                 </Link>
                                 <Link to="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img
                                          className="p-1 avatar-40 rounded-pill bg-primary-subtle"
                                          src={user02} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">New customer is join</h6>
                                          <p className="mb-0">Cyst Bni</p>
                                       </div>
                                       <small className="float-end font-size-12">5 days
                                          ago</small>
                                    </div>
                                 </Link>
                                 <Link to="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img
                                          className="p-1 avatar-40 rounded-pill bg-primary-subtle"
                                          src={user03} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">Two customer is left</h6>
                                          <p className="mb-0">Cyst Bni</p>
                                       </div>
                                       <small className="float-end font-size-12">2 days
                                          ago</small>
                                    </div>
                                 </Link>
                                 <Link to="#" className="iq-sub-card">
                                    <div className="d-flex align-items-center">
                                       <img
                                          className="p-1 avatar-40 rounded-pill bg-primary-subtle"
                                          src={user04} alt
                                          loading="lazy" />
                                       <div className="ms-3 flex-grow-1 text-start">
                                          <h6 className="mb-0 ">New Mail from Fenny</h6>
                                          <p className="mb-0">Cyst Bni</p>
                                       </div>
                                       <small className="float-end font-size-12">3 days
                                          ago</small>
                                    </div>
                                 </Link>
                              </div>
                           </div>
                        </Dropdown.Menu>
                     </Dropdown>

                  </Col>
               </Row>
               {/* -- dropdown -- */}
            </Navbar.Collapse>
         </Navbar>
         {/* </Navbar> */}
      </>
   )
}

export default Header
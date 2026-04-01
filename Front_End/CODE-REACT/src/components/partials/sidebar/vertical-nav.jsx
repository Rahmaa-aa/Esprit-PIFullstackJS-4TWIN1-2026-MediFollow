import React, { useContext, useState } from "react"
import { Accordion, AccordionContext, Collapse, Nav, OverlayTrigger, Tooltip, useAccordionButton } from "react-bootstrap"
import { Link, useLocation } from "react-router-dom"



const VerticalNav = () => {

    const location = useLocation()
    const [activeMenu, setActiveMenu] = useState(false)
    const [active, setActive] = useState('')
    const [patientUser] = useState(() => {
        try {
            const stored = localStorage.getItem("patientUser");
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    })
    const [nurseUser] = useState(() => {
        try {
            const stored = localStorage.getItem("nurseUser");
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    })
    const [adminUser] = useState(() => {
        try {
            const stored = localStorage.getItem("adminUser");
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    })
    const [doctorUser] = useState(() => {
        try {
            const stored = localStorage.getItem("doctorUser");
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    })
    const isPatient = !!patientUser
    const isNurse = !!nurseUser
    const isDoctor = !!doctorUser && !isPatient && !isNurse
    const isSuperAdmin = adminUser?.role === "superadmin"

    const emailItems = [
        { path: "/email/inbox", name: "Inbox", icon: "ri-inbox-fill" },
        { path: "/email/email-compose", name: "Email Compose", icon: "ri-edit-2-fill" },
    ];

    /** Menu accordéon « Doctor » (admin / démo) — pas les outils du médecin connecté (voir branche isDoctor). */
    const doctorItems = [
        { path: "/doctor/doctor-list", name: "All Doctor", icon: "ri-file-list-fill" },
        { path: "/doctor/add-doctor", name: "Add Doctor", icon: "ri-user-add-fill" },
        { path: "/doctor/doctor-profile", name: "Doctor Profile", icon: "ri-profile-fill" },
    ];

    const patientItems = [
        { path: "/patient/patient-list", name: "All Patient", icon: "ri-file-list-fill" },
        { path: "/patient/add-patient", name: "Add Patient", icon: "ri-user-add-fill" },
        { path: "/patient/patient-profile", name: "Patient Profile", icon: "ri-profile-fill" },
    ];

    const nurseItems = [
        { path: "/nurse/nurse-list", name: "All Nurse", icon: "ri-file-list-fill" },
        { path: "/nurse/add-nurse", name: "Add Nurse", icon: "ri-user-add-fill" },
        { path: "/nurse/nurse-profile", name: "Nurse Profile", icon: "ri-profile-fill" },
    ];

    const uiElementsItems = [
        { path: "/ui-elements/colors", name: "Colors", icon: "ri-font-color" },
        { path: "/ui-elements/typography", name: "Typography", icon: "ri-text" },
        { path: "/ui-elements/alerts", name: "Alerts", icon: "ri-alert-fill" },
        { path: "/ui-elements/badges", name: "Badges", icon: "ri-building-3-fill" },
        { path: "/ui-elements/breadcrumb", name: "Breadcrumb", icon: "ri-guide-fill" },
        { path: "/ui-elements/buttons", name: "Buttons", icon: "ri-checkbox-blank-fill" },
        { path: "/ui-elements/cards", name: "Cards", icon: "ri-bank-card-fill" },
        { path: "/ui-elements/carousel", name: "Carousel", icon: "ri-slideshow-4-fill" },
        { path: "/ui-elements/video", name: "Video", icon: "ri-movie-fill" },
        { path: "/ui-elements/grid", name: "Grid", icon: "ri-grid-fill" },
        { path: "/ui-elements/images", name: "Images", icon: "ri-image-fill" },
        { path: "/ui-elements/list-group", name: "List Group", icon: "ri-file-list-fill" },
        { path: "/ui-elements/modal", name: "Modal", icon: "ri-checkbox-blank-fill" },
        { path: "/ui-elements/notifications", name: "Notifications", icon: "ri-notification-3-fill" },
        { path: "/ui-elements/pagination", name: "Pagination", icon: "ri-more-fill" },
        { path: "/ui-elements/popovers", name: "Popovers", icon: "ri-folder-shield-fill" },
        { path: "/ui-elements/progressbars", name: "Progressbars", icon: "ri-battery-low-fill" },
        { path: "/ui-elements/tabs", name: "Tabs", icon: "ri-database-fill" },
        { path: "/ui-elements/tooltips", name: "Tooltips", icon: "ri-record-mail-fill" },
    ];

    const formItems = [
        { path: "/forms/form-elements", name: "Form Elements", icon: "ri-tablet-fill" },
        { path: "/forms/form-validations", name: "Form Validation", icon: "ri-device-fill" },
        { path: "/forms/form-switch", name: "Form Switch", icon: "ri-toggle-fill" },
        { path: "/forms/form-checkbox", name: "Form Checkbox", icon: "ri-chat-check-fill" },
        { path: "/forms/form-radio", name: "Form Radio", icon: "ri-radio-button-fill" },
    ];

    const formWizardItems = [
        { path: "/wizard/simple-wizard", name: "Simple Wizard", icon: "ri-anticlockwise-fill" },
        { path: "/wizard/validate-wizard", name: "Validate Wizard", icon: "ri-anticlockwise-2-fill" },
        { path: "/wizard/vertical-wizard", name: "Vertical Wizard", icon: "ri-clockwise-fill" },
    ];

    const tableItems = [
        { path: "/tables/basic-table", name: "Basic Tables", icon: "ri-table-fill" },
        { path: "/tables/data-table", name: "Data Tables", icon: "ri-table-2" },
        { path: "/tables/editable-table", name: "Editable Tables", icon: "ri-archive-drawer-fill" },
    ];


    const chartItems = [
        { path: "/charts/chart-page", name: "Chart Page", icon: "ri-file-chart-fill" },
        { path: "/charts/e-chart", name: "ECharts", icon: "ri-bar-chart-fill" },
        { path: "/charts/chart-am", name: "Am Charts", icon: "ri-bar-chart-box-fill" },
        { path: "/charts/apex-chart", name: "Apex Chart", icon: "ri-bar-chart-box-fill" },
    ];

    const iconItems = [
        { path: "/icons/dripicons", name: "Dripicons", icon: "ri-stack-fill" },
        { path: "/icons/fontawesome-5", name: "Font Awesome 5", icon: "ri-facebook-fill" },
        { path: "/icons/line-awesome", name: "Line Awesome", icon: "ri-keynote-fill" },
        { path: "/icons/remixicon", name: "Remixicon", icon: "ri-remixicon-fill" },
        { path: "/icons/unicons", name: "Unicons", icon: "ri-underline" },
    ];

    const authItems = [
        { path: "/auth/sign-in", name: "Login", icon: "ri-login-box-fill" },
        { path: "/auth/sign-up", name: "Register", icon: "ri-logout-box-fill" },
        { path: "/auth/recover-password", name: "Recover Password", icon: "ri-record-mail-fill" },
        { path: "/auth/confirm-mail", name: "Confirm Mail", icon: "ri-chat-check-fill" },
        { path: "/auth/lock-screen", name: "Admin Login", icon: "ri-file-lock-fill" },
    ];

    const extraPagesItems = [
        { path: "/extra-pages/account-setting", name: "Paramètres du compte", icon: "ri-user-settings-fill" },
        { path: "/extra-pages/pages-timeline", name: "Timeline", icon: "ri-map-pin-time-fill" },
        { path: "/extra-pages/pages-invoice", name: "Invoice", icon: "ri-question-answer-fill" },
        { path: "/extra-pages/blank-page", name: "Admin Dashboard", icon: "ri-dashboard-fill" },
        { path: "/extra-pages/pages-error-404", name: "Error 404", icon: "ri-error-warning-fill" },
        { path: "/extra-pages/pages-error-500", name: "Error 500", icon: "ri-error-warning-fill" },
        { path: "/extra-pages/pages-pricing", name: "Pricing", icon: "ri-price-tag-3-fill" },
        { path: "/extra-pages/pages-pricing-one", name: "Pricing 1", icon: "ri-price-tag-2-fill" },
        { path: "/extra-pages/pages-maintenance", name: "Maintenance", icon: "ri-git-repository-commits-fill" },
        { path: "/extra-pages/pages-comingsoon", name: "Coming Soon", icon: "ri-run-fill" },
        { path: "/extra-pages/pages-faq", name: "Faq", icon: "ri-compasses-2-fill" },
    ];

    function CustomToggle({ children, eventKey, onClick, activeClass }) {

        const { activeEventKey } = useContext(AccordionContext);

        const decoratedOnClick = useAccordionButton(eventKey, (active) => onClick({ state: !active, eventKey: eventKey }));

        const isCurrentEventKey = activeEventKey === eventKey;

        return (
            <Link to="#" aria-expanded={isCurrentEventKey ? 'true' : 'false'} className={`nav-link ${activeEventKey === active || eventKey === active && 'active'} ${activeClass === true ? 'active' : ""}`} role="button" onClick={(e) => {
                decoratedOnClick(isCurrentEventKey)
            }}>
                {children}
            </Link>
        );
    }


    if (isPatient) {
        return (
            <ul className="navbar-nav iq-main-menu" id="sidebar-menu">
                <Nav.Item as="li">
                    <Link to="/dashboard-pages/patient-dashboard" className={`nav-link ${location.pathname === "/dashboard-pages/patient-dashboard" ? "active" : ""}`}>
                        <i className="ri-hospital-fill"></i>
                        <span className="item-name">Mon tableau de bord</span>
                    </Link>
                </Nav.Item>
                <Nav.Item as="li">
                    <Link
                        to="/dashboard-pages/patient-medication-history"
                        className={`nav-link ${location.pathname === "/dashboard-pages/patient-medication-history" ? "active" : ""}`}
                    >
                        <i className="ri-history-line"></i>
                        <span className="item-name">Historique médicaments</span>
                    </Link>
                </Nav.Item>
                <Nav.Item as="li">
                    <Link
                        to="/dashboard-pages/patient-vitals-history"
                        className={`nav-link ${location.pathname === "/dashboard-pages/patient-vitals-history" ? "active" : ""}`}
                    >
                        <i className="ri-heart-pulse-line"></i>
                        <span className="item-name">Historique constantes</span>
                    </Link>
                </Nav.Item>
                <Nav.Item as="li">
                    <Link
                        to="/dashboard-pages/patient-appointment-request"
                        className={`nav-link ${location.pathname === "/dashboard-pages/patient-appointment-request" ? "active" : ""}`}
                    >
                        <i className="ri-calendar-schedule-line"></i>
                        <span className="item-name">Demande de rendez-vous</span>
                    </Link>
                </Nav.Item>
                <Nav.Item as="li">
                    <Link to={`/patient/patient-profile/${patientUser?.id}`} className={`nav-link ${location.pathname === `/patient/patient-profile/${patientUser?.id}` ? "active" : ""}`}>
                        <i className="ri-user-heart-fill"></i>
                        <span className="item-name">Mon profil</span>
                    </Link>
                </Nav.Item>
            </ul>
        )
    }

    if (isNurse) {
        return (
            <ul className="navbar-nav iq-main-menu" id="sidebar-menu">
                <Nav.Item as="li">
                    <Link to="/dashboard-pages/nurse-dashboard" className={`nav-link ${location.pathname === "/dashboard-pages/nurse-dashboard" ? "active" : ""}`}>
                        <i className="ri-hospital-fill"></i>
                        <span className="item-name">Mon tableau de bord</span>
                    </Link>
                </Nav.Item>
                <Nav.Item as="li">
                    <Link to={`/nurse/nurse-profile/${nurseUser?.id}`} className={`nav-link ${location.pathname === `/nurse/nurse-profile/${nurseUser?.id}` ? "active" : ""}`}>
                        <i className="ri-nurse-fill"></i>
                        <span className="item-name">Mon profil</span>
                    </Link>
                </Nav.Item>
            </ul>
        )
    }

    if (isDoctor) {
        const docId = doctorUser?.id || doctorUser?._id
        return (
            <ul className="navbar-nav iq-main-menu" id="sidebar-menu">
                <Nav.Item as="li" className="static-item ms-2">
                    <Link className="nav-link static-item disabled text-start" tabIndex="-1" to="#">
                        <span className="default-icon">Espace médecin</span>
                    </Link>
                </Nav.Item>
                <Nav.Item as="li">
                    <Link to="/dashboard" className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`}>
                        <i className="ri-dashboard-2-fill"></i>
                        <span className="item-name">Tableau de bord</span>
                    </Link>
                </Nav.Item>
                <Nav.Item as="li">
                    <Link
                        to="/doctor/my-patients"
                        className={`nav-link ${
                            location.pathname === "/doctor/my-patients" ||
                            location.pathname.startsWith("/doctor/my-patients/")
                              ? "active"
                              : ""
                        }`}
                    >
                        <i className="ri-user-heart-line"></i>
                        <span className="item-name">Mes patients</span>
                    </Link>
                </Nav.Item>
                <Nav.Item as="li">
                    <Link
                        to="/doctor/department-nurses"
                        className={`nav-link ${location.pathname === "/doctor/department-nurses" ? "active" : ""}`}
                    >
                        <i className="ri-nurse-line"></i>
                        <span className="item-name">Infirmiers du département</span>
                    </Link>
                </Nav.Item>
                <Nav.Item as="li">
                    <Link
                        to="/doctor/department-doctors"
                        className={`nav-link ${location.pathname === "/doctor/department-doctors" ? "active" : ""}`}
                    >
                        <i className="ri-stethoscope-line"></i>
                        <span className="item-name">Médecins du département</span>
                    </Link>
                </Nav.Item>
                <Nav.Item as="li">
                    <Link
                        to="/doctor/prescriptions"
                        className={`nav-link ${location.pathname === "/doctor/prescriptions" ? "active" : ""}`}
                    >
                        <i className="ri-capsule-line"></i>
                        <span className="item-name">Ordonnances</span>
                    </Link>
                </Nav.Item>
                <Nav.Item as="li">
                    <Link
                        to="/doctor/availability-calendar"
                        className={`nav-link ${location.pathname === "/doctor/availability-calendar" ? "active" : ""}`}
                    >
                        <i className="ri-calendar-2-line"></i>
                        <span className="item-name">Calendrier RDV</span>
                    </Link>
                </Nav.Item>
                <Nav.Item as="li">
                    <Link
                        to={`/doctor/doctor-profile/${docId}`}
                        className={`nav-link ${location.pathname === `/doctor/doctor-profile/${docId}` ? "active" : ""}`}
                    >
                        <i className="ri-profile-fill"></i>
                        <span className="item-name">Mon profil</span>
                    </Link>
                </Nav.Item>
            </ul>
        )
    }

    return (
        <>
            <ul className="navbar-nav iq-main-menu" id="sidebar-menu">
                <Nav.Item as="li" className="static-item ms-2">
                    <Link className="nav-link static-item disabled text-start" tabIndex="-1">
                        <span className="default-icon">Dashboard</span>
                        <OverlayTrigger
                            key={"Home"}
                            placement={"right"}
                            overlay={
                                <Tooltip id="Home">
                                    Home
                                </Tooltip>
                            }
                        >
                            <span className="mini-icon">-</span>
                        </OverlayTrigger>
                    </Link>
                </Nav.Item>
                <Nav.Item as="li">
                    <Link to="/dashboard" className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`}>
                        <OverlayTrigger
                            key={"DDashboard"}
                            placement={"right"}
                            overlay={
                                <Tooltip id="Dashboard">
                                    Dashboard
                                </Tooltip>
                            }
                        >
                            <i className="ri-hospital-fill">
                            </i>
                        </OverlayTrigger>
                        <span className="item-name">Doctor Dashboard</span>

                    </Link>
                </Nav.Item>
                {adminUser && (
                    <>
                        <Nav.Item as="li">
                            <Link to="/admin/dashboard" className={`nav-link ${location.pathname === "/admin/dashboard" ? "active" : ""}`}>
                                <i className="ri-dashboard-2-fill"></i>
                                <span className="item-name">Admin Dashboard</span>
                            </Link>
                        </Nav.Item>
                        <Nav.Item as="li">
                            <Link
                                to="/admin/departments"
                                className={`nav-link ${location.pathname.startsWith("/admin/departments") ? "active" : ""}`}
                            >
                                <i className="ri-building-2-fill"></i>
                                <span className="item-name">Départements</span>
                            </Link>
                        </Nav.Item>
                        <Nav.Item as="li">
                            <Link
                                to="/admin/appointment-requests"
                                className={`nav-link ${location.pathname === "/admin/appointment-requests" ? "active" : ""}`}
                            >
                                <i className="ri-calendar-check-line"></i>
                                <span className="item-name">Demandes RDV</span>
                            </Link>
                        </Nav.Item>
                    </>
                )}
                <Nav.Item as="li">
                    <Link
                        to="/dashboard-pages/dashboard-1" className={`nav-link ${location.pathname === "/dashboard-pages/dashboard-1" ? "active" : ""}`}>
                        <OverlayTrigger
                            key={"HDashboard"}
                            placement={"right"}
                            overlay={
                                <Tooltip id="Dashboard">
                                    Dashboard
                                </Tooltip>
                            }
                        >
                            <i className="ri-home-8-fill" data-bs-toggle="tooltip" title="Dashboard" data-bs-placement="right">
                            </i>
                        </OverlayTrigger>
                        <span className="item-name ">Hospital Dashboard 1 </span>

                    </Link>
                </Nav.Item>
                <Nav.Item as="li">
                    <Link
                        to="/dashboard-pages/dashboard-2" className={`nav-link ${location.pathname === "/dashboard-pages/dashboard-2" ? "active" : ""}`}>
                        <OverlayTrigger
                            key={"HDashboard2"}
                            placement={"right"}
                            overlay={
                                <Tooltip id="Dashboard">
                                    Dashboard
                                </Tooltip>
                            }
                        >
                            <i className="ri-briefcase-4-fill">
                            </i>
                        </OverlayTrigger>
                        <span className="item-name ">Hospital Dashboard 2</span>
                    </Link>
                </Nav.Item>
                <Nav.Item as="li">

                    <Link
                        to="/dashboard-pages/patient-dashboard" className={`nav-link ${location.pathname === "/dashboard-pages/patient-dashboard" ? "active" : ""}`}>
                        <OverlayTrigger
                            key={"PDashboard"}
                            placement={"right"}
                            overlay={
                                <Tooltip id="Dashboard">
                                    Dashboard
                                </Tooltip>
                            }
                        >
                            <i className="ri-briefcase-4-fill">
                            </i>
                        </OverlayTrigger>
                        <span className="item-name ">Patient Dashboard</span>
                    </Link>
                </Nav.Item>
                <Nav.Item as="li">
                    <Link
                        to="/dashboard-pages/dashboard-4" className={`nav-link  ${location.pathname === "/dashboard-pages/dashboard-4" ? "active" : ""}`}>
                        <OverlayTrigger
                            key={"CDashboard"}
                            placement={"right"}
                            overlay={
                                <Tooltip id="Dashboard">
                                    Dashboard
                                </Tooltip>
                            }
                        >
                            <i className="ri-hospital-fill">
                            </i>
                        </OverlayTrigger>
                        <span className="item-name ">Covid-19 Dashboard</span>
                    </Link>
                </Nav.Item>
                <li>
                    <hr className="hr-horizontal" />
                </li>
                <Accordion bsPrefix="bg-none" onSelect={(e) => setActiveMenu(e)}>
                    <Nav.Item as="li" className="static-item ms-2">
                        <Nav.Link className="static-item disabled text-start" tabIndex="-1">
                            <span className="default-icon">Apps</span>
                            <span className="mini-icon">-</span>
                        </Nav.Link>
                    </Nav.Item>
                    <Accordion.Item as="li" className={`nav-item ${active === "Email" && 'active'} ${location.pathname === "/email/inbox" || location.pathname === "/email /compose" ? "active" : ""}`} onClick={() => setActive("Email")}>
                        <div className="colors">
                            <CustomToggle
                                eventKey="Email"
                                activeClass={emailItems.some(item => location.pathname === item.path)}
                                onClick={(activeKey) => setActiveMenu(activeKey)}
                            >
                                <OverlayTrigger
                                    key={"Email"}
                                    placement={"right"}
                                    overlay={
                                        <Tooltip id="Email">
                                            Email
                                        </Tooltip>
                                    }
                                >
                                    <i className="ri-mail-open-fill"></i>
                                </OverlayTrigger>
                                <span className="item-name">Email</span>
                                <i className="right-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" className="icon-18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </i>
                            </CustomToggle>

                            <Accordion.Collapse eventKey="Email" as="ul" className="sub-nav" id="Email">
                                <>
                                    {emailItems.map(({ path, name, icon }) => (
                                        <li key={path}>
                                            <Link className={`nav-link ${location.pathname === path ? "active" : ""}`} to={path}>
                                                <i className={`icon ${icon}`}></i>
                                                <span className="item-name">{name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </>
                            </Accordion.Collapse>
                        </div>

                    </Accordion.Item>

                    <Accordion.Item as="li" className={`nav-item ${active === "Doctor" && 'active'}`} onClick={() => setActive("Doctor")}>
                        <div className="colors">
                            <CustomToggle
                                eventKey="Doctor"
                                activeClass={doctorItems.some(item => location.pathname === item.path) || location.pathname.startsWith("/doctor/doctor-profile/")}
                                onClick={(activeKey) => setActiveMenu(activeKey)}
                            >
                                <OverlayTrigger
                                    key={"Doctor"}
                                    placement={"right"}
                                    overlay={
                                        <Tooltip id="Doctor">
                                            Doctor
                                        </Tooltip>
                                    }
                                >
                                    <i className="icon">
                                        <svg className="icon-20" width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path opacity="0.4" d="M12.0865 22C11.9627 22 11.8388 21.9716 11.7271 21.9137L8.12599 20.0496C7.10415 19.5201 6.30481 18.9259 5.68063 18.2336C4.31449 16.7195 3.5544 14.776 3.54232 12.7599L3.50004 6.12426C3.495 5.35842 3.98931 4.67103 4.72826 4.41215L11.3405 2.10679C11.7331 1.96656 12.1711 1.9646 12.5707 2.09992L19.2081 4.32684C19.9511 4.57493 20.4535 5.25742 20.4575 6.02228L20.4998 12.6628C20.5129 14.676 19.779 16.6274 18.434 18.1581C17.8168 18.8602 17.0245 19.4632 16.0128 20.0025L12.4439 21.9088C12.3331 21.9686 12.2103 21.999 12.0865 22Z" fill="currentColor"></path>
                                            <path d="M11.3194 14.3209C11.1261 14.3219 10.9328 14.2523 10.7838 14.1091L8.86695 12.2656C8.57097 11.9793 8.56795 11.5145 8.86091 11.2262C9.15387 10.9369 9.63207 10.934 9.92906 11.2193L11.3083 12.5451L14.6758 9.22479C14.9698 8.93552 15.448 8.93258 15.744 9.21793C16.041 9.50426 16.044 9.97004 15.751 10.2574L11.8519 14.1022C11.7049 14.2474 11.5127 14.3199 11.3194 14.3209Z" fill="currentColor"></path>
                                        </svg>
                                    </i>
                                </OverlayTrigger>
                                <span className="item-name">Doctor</span>
                                <i className="right-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" className="icon-18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </i>
                            </CustomToggle>

                            <Accordion.Collapse as="ul" eventKey="Doctor" className="sub-nav" id="Doctor">
                                <>
                                    {doctorItems.map(({ path, name, icon }) => (
                                        <li key={path}>
                                            <Link className={`nav-link ${location.pathname === path ? "active" : ""}`} to={path}>
                                                <i className={icon}></i>
                                                <span className="item-name">{name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </>
                            </Accordion.Collapse>


                        </div>
                    </Accordion.Item>

                    <Accordion.Item as="li" className={`nav-item ${active === "Patient" && 'active'}`} onClick={() => setActive("Patient")}>
                        <div className="colors">
                            <CustomToggle
                                eventKey="Patient"
                                activeClass={patientItems.some(item => location.pathname === item.path || location.pathname.startsWith("/patient/patient-profile/"))}
                                onClick={(activeKey) => setActiveMenu(activeKey)}
                            >
                                <OverlayTrigger
                                    key={"Patient"}
                                    placement={"right"}
                                    overlay={
                                        <Tooltip id="Patient">
                                            Patient
                                        </Tooltip>
                                    }
                                >
                                    <i className="ri-user-heart-fill"></i>
                                </OverlayTrigger>
                                <span className="item-name">Patient</span>
                                <i className="right-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" className="icon-18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </i>
                            </CustomToggle>

                            <Accordion.Collapse as="ul" eventKey="Patient" className="sub-nav" id="Patient">
                                <>
                                    {patientItems.map(({ path, name, icon }) => (
                                        <li key={path}>
                                            <Link className={`nav-link ${location.pathname === path ? "active" : ""}`} to={path}>
                                                <i className={icon}></i>
                                                <span className="item-name">{name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </>
                            </Accordion.Collapse>


                        </div>
                    </Accordion.Item>

                    <Accordion.Item as="li" className={`nav-item ${active === "Nurse" && 'active'}`} onClick={() => setActive("Nurse")}>
                        <div className="colors">
                            <CustomToggle
                                eventKey="Nurse"
                                activeClass={nurseItems.some(item => location.pathname === item.path) || location.pathname.startsWith("/nurse/nurse-profile/")}
                                onClick={(activeKey) => setActiveMenu(activeKey)}
                            >
                                <OverlayTrigger
                                    key={"Nurse"}
                                    placement={"right"}
                                    overlay={
                                        <Tooltip id="Nurse">
                                            Nurse
                                        </Tooltip>
                                    }
                                >
                                    <i className="ri-nurse-fill"></i>
                                </OverlayTrigger>
                                <span className="item-name">Nurse</span>
                                <i className="right-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" className="icon-18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </i>
                            </CustomToggle>

                            <Accordion.Collapse as="ul" eventKey="Nurse" className="sub-nav" id="Nurse">
                                <>
                                    {nurseItems.map(({ path, name, icon }) => (
                                        <li key={path}>
                                            <Link className={`nav-link ${location.pathname === path ? "active" : ""}`} to={path}>
                                                <i className={icon}></i>
                                                <span className="item-name">{name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </>
                            </Accordion.Collapse>


                        </div>
                    </Accordion.Item>

                    <Nav.Item as="li">
                        <Link className={`nav-link ${location.pathname === "/calendar" ? "active" : ""}`} to="/calendar">
                            <OverlayTrigger
                                key={"Calendar"}
                                placement={"right"}
                                overlay={
                                    <Tooltip id="Calendar">
                                        Calendar
                                    </Tooltip>
                                }
                            >
                                <i className="ri-calendar-2-line">
                                </i>
                            </OverlayTrigger>
                            <span className="item-name ">Calendar</span>

                        </Link>
                    </Nav.Item>

                    <Nav.Item as="li">
                        <Link className={`nav-link ${location.pathname === "/chat" ? "active" : ""}`} to="/chat">
                            <OverlayTrigger
                                key={"Chat"}
                                placement={"right"}
                                overlay={
                                    <Tooltip id="Chat">
                                        Chat
                                    </Tooltip>
                                }
                            >
                                <i className="ri-message-fill">
                                </i>
                            </OverlayTrigger>
                            <span className="item-name ">Chat</span>

                        </Link>
                    </Nav.Item>

                    <Nav.Item as="li" className="static-item ms-2">
                        <Nav.Link className="static-item disabled text-start" tabIndex="-1">
                            <span className="default-icon">Components</span>
                            <span className="mini-icon">-</span>
                        </Nav.Link>
                    </Nav.Item>
                    <Accordion.Item as="li" bsPrefix={`nav-item ${active === "UIElements" && 'active'}`} onClick={() => setActive("UIElements")}>
                        <div className="colors">
                            <CustomToggle
                                eventKey="UIElements"
                                activeClass={uiElementsItems.some(item => location.pathname === item.path)}
                                onClick={(activeKey) => setActiveMenu(activeKey)}
                            >
                                <OverlayTrigger
                                    key={"UIElements"}
                                    placement={"right"}
                                    overlay={
                                        <Tooltip id="UIElements">
                                            UIElements
                                        </Tooltip>
                                    }
                                >
                                    <i className="ri-apps-fill"></i>
                                </OverlayTrigger>
                                <span className="item-name">UI Elements</span>
                                <i className="right-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" className="icon-18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </i>
                            </CustomToggle>

                            <Accordion.Collapse eventKey="UIElements" as="ul" className="sub-nav" id="UIElements">
                                <>
                                    {uiElementsItems.map(({ path, name, icon }) => (
                                        <li key={path}>
                                            <Link className={`nav-link ${location.pathname === path ? "active" : ""}`} to={path}>
                                                <i className={icon}></i>
                                                <span className="item-name">{name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </>
                            </Accordion.Collapse>

                        </div>
                    </Accordion.Item>
                    <Accordion.Item as="li" bsPrefix={`nav-item ${active === "Forms" && 'active'}`} onClick={() => setActive("Forms")}>
                        <div className="colors">
                            <CustomToggle
                                eventKey="Forms"
                                activeClass={formItems.some(item => location.pathname === item.path)} // Check if any item path matches
                                onClick={(activeKey) => setActiveMenu(activeKey)}
                            >
                                <OverlayTrigger
                                    key={"Forms"}
                                    placement={"right"}
                                    overlay={
                                        <Tooltip id="Forms">
                                            Forms
                                        </Tooltip>
                                    }
                                >
                                    <i className="ri-device-fill"></i>
                                </OverlayTrigger>
                                <span className="item-name">Forms</span>
                                <i className="right-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" className="icon-18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </i>
                            </CustomToggle>

                            <Accordion.Collapse as="ul" className="sub-nav" eventKey="Forms" id="Forms">
                                <>
                                    {formItems.map(({ path, name, icon }) => (
                                        <li key={path}>
                                            <Link className={`nav-link ${location.pathname === path ? "active" : ""}`} to={path}>
                                                <i className={icon}></i>
                                                <span className="item-name">{name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </>
                            </Accordion.Collapse>

                        </div>
                    </Accordion.Item>
                    <Accordion.Item as="li" className={`nav-item ${active === "Form-Wizard" && 'active'}`} onClick={() => setActive("Form-Wizard")}>
                        <div className="colors">
                            <CustomToggle
                                eventKey="Form-Wizard"
                                activeClass={formWizardItems.some(item => item.path === location.pathname)}
                                onClick={(activeKey) => setActiveMenu(activeKey)}
                            >
                                <OverlayTrigger
                                    key={"Forms-Wizard"}
                                    placement={"right"}
                                    overlay={
                                        <Tooltip id="Forms-Wizard">
                                            Forms Wizard
                                        </Tooltip>
                                    }
                                >
                                    <i className="ri-file-word-fill"></i>
                                </OverlayTrigger>
                                <span className="item-name">Form Wizard</span>
                                <i className="right-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" className="icon-18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </i>
                            </CustomToggle>

                            <Accordion.Collapse eventKey="Form-Wizard" as="ul" className="sub-nav" id="Form-Wizard">
                                <>
                                    {formWizardItems.map(({ path, name, icon }) => (
                                        <li key={path}>
                                            <Link className={`nav-link ${location.pathname === path ? "active" : ""}`} to={path}>
                                                <i className={icon}></i>
                                                <span className="item-name">{name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </>
                            </Accordion.Collapse>
                        </div>
                    </Accordion.Item>
                    <Accordion.Item as="li" className={`nav-item ${active === "table" && 'active'}`} onClick={() => setActive("table")}>
                        <div className="colors">
                            <CustomToggle
                                eventKey="table"
                                activeClass={tableItems.some(item => item.path === location.pathname)}
                                onClick={(activeKey) => setActiveMenu(activeKey)}
                            >
                                <OverlayTrigger
                                    key={"Table"}
                                    placement={"right"}
                                    overlay={
                                        <Tooltip id="Table">
                                            Table
                                        </Tooltip>
                                    }
                                >
                                    <i className="ri-table-fill"></i>
                                </OverlayTrigger>
                                <span className="item-name">Table</span>
                                <i className="right-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" className="icon-18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </i>
                            </CustomToggle>

                            <Accordion.Collapse eventKey="table" as="ul" className="sub-nav" id="table">
                                <>
                                    {tableItems.map(({ path, name, icon }) => (
                                        <li key={path}>
                                            <Link className={`nav-link ${location.pathname === path ? "active" : ""}`} to={path}>
                                                <i className={icon}></i>
                                                <span className="item-name">{name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </>
                            </Accordion.Collapse>
                        </div>
                    </Accordion.Item>

                    <Accordion.Item as="li" className={`nav-item ${active === "Chart" && 'active'}`} onClick={() => setActive("Chart")}>
                        <div className="colors">
                            <CustomToggle
                                eventKey="Chart"
                                activeClass={chartItems.some(item => item.path === location.pathname)}
                                onClick={(activeKey) => setActiveMenu(activeKey)}
                            >
                                <OverlayTrigger
                                    key={"Chart"}
                                    placement={"right"}
                                    overlay={
                                        <Tooltip id="Chart">
                                            Chart
                                        </Tooltip>
                                    }
                                >
                                    <i className="ri-bar-chart-2-fill"></i>
                                </OverlayTrigger>
                                <span className="item-name">Charts</span>
                                <i className="right-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" className="icon-18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </i>
                            </CustomToggle>

                            <Accordion.Collapse eventKey="Chart" as="ul" className="sub-nav" id="Chart">
                                <>
                                    {chartItems.map(({ path, name, icon }) => (
                                        <li key={path}>
                                            <Link className={`nav-link ${location.pathname === path ? "active" : ""}`} to={path}>
                                                <i className={icon}></i>
                                                <span className="item-name">{name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </>
                            </Accordion.Collapse>

                        </div>
                    </Accordion.Item>

                    <Accordion.Item as="li" className={`nav-item ${active === "Icons" && 'active'}`} onClick={() => setActive("Icons")}>
                        <div className="colors">
                            <CustomToggle
                                eventKey="Icons"
                                activeClass={iconItems.some(item => item.path === location.pathname)}
                                onClick={(activeKey) => setActiveMenu(activeKey)}
                            >
                                <OverlayTrigger
                                    key={"Icons"}
                                    placement={"right"}
                                    overlay={
                                        <Tooltip id="Icons">
                                            Icons
                                        </Tooltip>
                                    }
                                >
                                    <i className="ri-bar-chart-2-fill"></i>
                                </OverlayTrigger>
                                <span className="item-name">Icons</span>
                                <i className="right-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" className="icon-18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </i>
                            </CustomToggle>

                            <Accordion.Collapse eventKey="Icons" as="ul" className="sub-nav" id="Icons">
                                <>
                                    {iconItems.map(({ path, name, icon }) => (
                                        <li key={path}>
                                            <Link className={`nav-link ${location.pathname === path ? "active" : ""}`} to={path}>
                                                <i className={icon}></i>
                                                <span className="item-name">{name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </>
                            </Accordion.Collapse>
                        </div>
                    </Accordion.Item>

                    <Nav.Item as="li" className="static-item ms-2">
                        <Nav.Link className="static-item disabled text-start" tabIndex="-1">
                            <span className="default-icon ">Pages</span>
                            <span className="mini-icon">-</span>
                        </Nav.Link>
                    </Nav.Item>
                    <Accordion.Item as="li" eventKey="Authentication" className={`nav-item ${active === "Authentication" && "active"}`} onClick={() => setActive("Authentication")}>
                        <div className="colors">
                            <CustomToggle
                                eventKey="Authentication"
                                activeClass={authItems.some(item => item.path === location.pathname)}
                                onClick={(activeKey) => setActiveMenu(activeKey)}
                            >
                                <OverlayTrigger
                                    key={"Authentication"}
                                    placement={"right"}
                                    overlay={
                                        <Tooltip id="Authentication">
                                            Authentication
                                        </Tooltip>
                                    }
                                >
                                    <i className="ri-server-fill"></i>
                                </OverlayTrigger>
                                <span className="item-name">Authentication</span>
                                <i className="right-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" className="icon-18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </i>
                            </CustomToggle>

                            <Accordion.Collapse eventKey="Authentication" as="ul" className="sub-nav" id="Authentication">
                                <>
                                    {authItems.map(({ path, name, icon }) => (
                                        <li key={path}>
                                            <Link className={`nav-link ${location.pathname === path ? "active" : ""}`} to={path}>
                                                <i className={icon}></i>
                                                <span className="item-name">{name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </>
                            </Accordion.Collapse>

                        </div>
                    </Accordion.Item>

                    <Accordion.Item as="li" eventKey="Maps" id="Maps" className={`nav-item ${active === "Maps" && 'active'}`} onClick={() => setActive("Maps")}>
                        <div className="colors">
                            <CustomToggle eventKey="Maps" onClick={(activeKey) => setActiveMenu(activeKey)}>
                                <OverlayTrigger
                                    key={"Maps"}
                                    placement={"right"}
                                    overlay={
                                        <Tooltip id="Maps">
                                            Maps
                                        </Tooltip>
                                    }
                                >
                                    <i className="ri-map-pin-2-fill"></i>
                                </OverlayTrigger>
                                <span className="item-name">Maps</span>
                                <i className="right-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" className="icon-18" fill="none" viewBox="0 0 24 24"
                                        stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </i>
                            </CustomToggle>

                            <Accordion.Collapse as="ul" eventKey="Maps" className="sub-nav" id="Maps">
                                <li>
                                    <Link className={`nav-link ${location.pathname === "/maps/google-map" ? "active" : ""}`}
                                        to="/maps/google-map">
                                        <i className="ri-google-fill"></i>
                                        <span className="item-name">Google Map</span>
                                    </Link>
                                </li>
                            </Accordion.Collapse>

                        </div>

                    </Accordion.Item>
                    <Accordion.Item as="li" eventKey="0" id="Extrapages" className={`nav-item ${active === "Extrapages" && 'active'}`} onClick={() => setActive("Extrapages")}>
                        <div className="colors">
                            <CustomToggle
                                eventKey="Extrapages"
                                onClick={(activeKey) => setActiveMenu(activeKey)}
                            >
                                <OverlayTrigger
                                    key={"Extrapages"}
                                    placement={"right"}
                                    overlay={
                                        <Tooltip id="Extrapages">
                                            Extrapages
                                        </Tooltip>
                                    }
                                >
                                    <i className="ri-folders-fill"></i>
                                </OverlayTrigger>
                                <span className="item-name">Extra Pages</span>
                                <i className="right-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" className="icon-18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </i>
                            </CustomToggle>

                            <Accordion.Collapse eventKey="Extrapages" as="ul" className="sub-nav" id="Extrapages">
                                <>
                                    {extraPagesItems.map(({ path, name, icon }) => (
                                        <li key={path}>
                                            <Link className={`nav-link ${location.pathname === path ? "active" : ""}`} to={path}>
                                                <i className={icon}></i>
                                                <span className="item-name">{name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </>
                            </Accordion.Collapse>
                        </div>
                    </Accordion.Item>
                </Accordion>

                {isSuperAdmin && (
                    <>
                        <li><hr className="hr-horizontal" /></li>
                        <Nav.Item as="li" className="static-item ms-2">
                            <Link className="nav-link static-item disabled text-start" tabIndex="-1">
                                <span className="default-icon">SUPER ADMIN</span>
                            </Link>
                        </Nav.Item>
                        <Nav.Item as="li">
                            <Link to="/super-admin/dashboard" className={`nav-link ${location.pathname === "/super-admin/dashboard" ? "active" : ""}`}>
                                <i className="ri-shield-star-fill"></i>
                                <span className="item-name">Super Admin Dashboard</span>
                            </Link>
                        </Nav.Item>
                        <Nav.Item as="li">
                            <Link to="/super-admin/users" className={`nav-link ${location.pathname === "/super-admin/users" ? "active" : ""}`}>
                                <i className="ri-team-fill"></i>
                                <span className="item-name">All Users</span>
                            </Link>
                        </Nav.Item>
                        <Nav.Item as="li">
                            <Link to="/super-admin/auditors" className={`nav-link ${location.pathname.startsWith("/super-admin/auditors") ? "active" : ""}`}>
                                <i className="ri-shield-check-fill"></i>
                                <span className="item-name">Auditors</span>
                            </Link>
                        </Nav.Item>
                        <Nav.Item as="li">
                            <Link to="/super-admin/care-coordinators" className={`nav-link ${location.pathname.startsWith("/super-admin/care-coordinators") ? "active" : ""}`}>
                                <i className="ri-heart-pulse-fill"></i>
                                <span className="item-name">Care Coordinators</span>
                            </Link>
                        </Nav.Item>
                        <Nav.Item as="li">
                            <Link to="/super-admin/profile" className={`nav-link ${location.pathname === "/super-admin/profile" ? "active" : ""}`}>
                                <i className="ri-user-settings-fill"></i>
                                <span className="item-name">My Profile</span>
                            </Link>
                        </Nav.Item>
                    </>
                )}

                <li>
                    <hr className="hr-horizontal" />
                </li>
            </ul>

        </>
    )
}

export default VerticalNav
import React, { useEffect } from "react"
import { Link, useLocation } from "react-router-dom"

// Import Component
import Logo from "../../logo"
import VerticalNav from "./vertical-nav"
import Scrollbar from "smooth-scrollbar";

// Import selectors & action from setting store
import * as SettingSelector from "../../../store/setting/selectors";

// Redux Selector / Action
import { useSelector, useDispatch } from "react-redux";

const Sidebar = () => {
   const dispatch = useDispatch();
   const location = useLocation()

   const sidebarColor = useSelector(SettingSelector.sidebar_color);
   const sidebarType = useSelector(SettingSelector.sidebar_type);
   const newsidebarType = sidebarType.filter(Boolean).join(' ');

   const sidebarMenuStyle = useSelector(SettingSelector.sidebar_menu_style);

   useEffect(() => {
      Scrollbar.init(document.querySelector("#my-scrollbar"));

      let aside = document.getElementsByTagName("ASIDE")[0];
   }, [])

   const handleSidebar = (data) => {
      let aside = document.getElementsByTagName("ASIDE")[0];
      if (aside) {
         if (!aside.classList.contains('sidebar-mini')) {
            aside.classList.toggle("sidebar-mini");
            aside.classList.toggle("sidebar-hover");
         } else if (data === true) {
            aside.classList.remove("sidebar-mini")
            aside.classList.remove("sidebar-hover");
         }
      }
   }

   const removeSidbarClass = () => {
      let aside = document.getElementsByTagName("ASIDE")[0];
      if (aside) {
         if (aside.classList.contains('sidebar-mini')) {
            aside.classList.remove("sidebar-mini")
            aside.classList.remove("sidebar-hover");
         }
      }
   }

   useEffect(() => {
      if (location.pathname === "/") {
         handleSidebar()
      } else if (window.innerWidth < 999) {
         handleSidebar()
      }
      else {
         removeSidbarClass()
      }
   }, [location.pathname])

   window.addEventListener("resize", () => {
      if (window.innerWidth < 990) {
         handleSidebar()
      } else if (location.pathname === "/") {
         handleSidebar()
      }
      else {
         removeSidbarClass()
      }
   })
   return (
      <>
         <aside
            className={`sidebar sidebar-base sidebar-default ${sidebarColor} ${newsidebarType} ${sidebarMenuStyle}`}
            id="first-tour" data-toggle="main-sidebar" data-sidebar="responsive">
            <div className="sidebar-header d-flex align-items-center justify-content-start position-relative">
               <Link to="/" className="navbar-brand me-5 pt-3">
                  <Logo />
               </Link>{" "}
               <div className="ms-5 wrapper-menu d-flex d-none d-xl-block" onClick={() => { handleSidebar(true) }}>
                  <div className="main-circle" role="button"><i className="ri-more-fill"></i></div>
               </div>
               <li className="nav-item d-block d-xl-none" onClick={handleSidebar}>
                  <a className="wrapper-menu" data-toggle="sidebar" data-active="true">
                     <div className="main-circle "><i className="ri-more-fill"></i></div>
                  </a>
               </li>
            </div>
            <div id="my-scrollbar" className="sidebar-body pt-0 data-scrollbar">
               <div className="sidebar-list">
                  <VerticalNav handleSidebar={handleSidebar} />
               </div>
            </div>
            <div className="sidebar-footer"></div>
         </aside>
      </>
   )
}

export default Sidebar


import React from "react";

// react-router
import { Outlet } from "react-router-dom";


// Import selectors & action from setting store
import * as SettingSelector from '../store/setting/selectors'

// Redux Selector / Action
import { useSelector } from 'react-redux';

// Partials
import Header from "../components/partials/headerStyle/header";
import Footer from "../components/partials/footerStyle/footer";
import Sidebar from "../components/partials/sidebar/sidebar";
import FloatingChatbotWidget from "../components/FloatingChatbotWidget";

/*
 * CSS lourd r\u00e9serv\u00e9 au dashboard (composants riches, layout sidebar, plugins, customizer,
 * Swiper, Phosphor regular). Charg\u00e9 dans le chunk paresseux de DefaultLayout pour ne pas
 * p\u00e9naliser le CSS bloquant de la landing publique (BlankLayout).
 */
import "../assets/scss/xray-dashboard.scss";
import "../assets/scss/customizer.scss";
import "../assets/vendor/phosphor-icons/Fonts/regular/style.css";
import "../assets/vendor/phosphor-icons/Fonts/duotone/style.css";
import "../assets/vendor/phosphor-icons/Fonts/fill/style.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import "swiper/css/free-mode";
import "swiper/css/effect-fade";


const DefaultLayout = () => {
  const pageLayout = useSelector(SettingSelector.page_layout)

  return (
    <>
      <div className="wrapper">
        <Sidebar />
        <main className="main-content content-page ">
          <div className="position-relative">
            {/* --Nav Start-- */}
            <Header />
            {/* --Nav End-- */}
          </div>
          <div className={` ${pageLayout} content-inner pb-0`} id="page_layout">
            <Outlet />
          </div>
          <Footer />

        </main>
      </div>
      <FloatingChatbotWidget />

    </>
  );
};

export default DefaultLayout;

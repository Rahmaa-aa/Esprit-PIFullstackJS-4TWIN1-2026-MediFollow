// import { StrictMode } from 'react'
import { Fragment } from "react";
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import "swiper/css/free-mode";
import 'swiper/css/pagination'
import 'swiper/css/autoplay'
import 'swiper/css/effect-fade'
import './assets/scss/xray.scss'
import './assets/scss/custom.scss'
import './assets/scss/rtl.scss'
import './assets/scss/customizer.scss'
 
import './assets/custom/custom.scss'
import './assets/vendor/font-awesome/css/font-awesome.min.css'
import './assets/vendor/remixicon/fonts/remixicon.css'
import './assets/vendor/phosphor-icons/Fonts/regular/style.css'
import './assets/vendor/phosphor-icons/Fonts/duotone/style.css'
import './assets/vendor/phosphor-icons/Fonts/fill/style.css' 

//router
import { RouterProvider, createBrowserRouter } from "react-router-dom";

// page
import { LayoutsRoute } from "./router/layout-router";

// store
import { store } from "./store/index";
import { Provider } from "react-redux";

const router = createBrowserRouter([...LayoutsRoute], { basename: import.meta.env.BASE_URL });

createRoot(document.getElementById('root')).render(
  <Fragment>
    <Provider store={store}>
      <App>
        <RouterProvider router={router}></RouterProvider>
      </App>
    </Provider>
  </Fragment>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();


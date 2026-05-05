// import { StrictMode } from 'react'
import { Fragment, Suspense } from "react";
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import "./i18n/i18n.js";
/*
 * Sous-ensemble de xray pour landing/auth (Bootstrap + base xray uniquement).
 * Le reste (composants riches, layout sidebar, plugins, customizer, swiper, FA4, phosphor regular)
 * est charg\u00e9 paresseusement par `DefaultLayout` (cf. layouts/defaultLayout.jsx) afin de r\u00e9duire
 * le CSS bloquant sur la landing (PageSpeed / LCP).
 */
import './assets/scss/xray-landing.scss'
import './assets/scss/custom.scss'
import './assets/scss/rtl.scss'

import './assets/custom/custom.scss'
import './assets/scss/dyslexia-mode.scss'

//router
import { RouterProvider, createBrowserRouter } from "react-router-dom";

// page
import { LayoutsRoute } from "./router/layout-router";

// store
import { store } from "./store/index";
import { Provider } from "react-redux";

const router = createBrowserRouter([...LayoutsRoute], { basename: import.meta.env.BASE_URL });

const routeLazyFallback = (
  <div
    className="d-flex min-vh-100 align-items-center justify-content-center"
    style={{ background: "var(--bs-body-bg, #f8f9fa)" }}
  >
    <div className="spinner-border text-primary" role="status" aria-label="Loading" />
  </div>
);

/* Icônes Remix + Phosphor (duotone/fill) : chargées via liens non bloquants injectés dans index.html (vite.config.js) pour éviter la chaîne critique HTML → index.js → CSS. */

createRoot(document.getElementById('root')).render(
  <Fragment>
    <Provider store={store}>
      <App>
        <Suspense fallback={routeLazyFallback}>
          <RouterProvider router={router} />
        </Suspense>
      </App>
    </Provider>
  </Fragment>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();


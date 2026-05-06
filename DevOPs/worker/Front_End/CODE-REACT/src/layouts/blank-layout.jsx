import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAuthenticatedHomePath, isPublicMarketingPath } from "../utils/medifollowSession";

const BlankLayout = () => {
  const location = useLocation();
  const appHome = getAuthenticatedHomePath();

  if (appHome && isPublicMarketingPath(location.pathname)) {
    return <Navigate to={appHome} replace />;
  }

  return (
    <>
      <div className="content-bg">
        <Outlet />
      </div>
    </>
  );
};

export default BlankLayout;

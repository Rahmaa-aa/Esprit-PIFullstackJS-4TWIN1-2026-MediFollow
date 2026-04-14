import React from "react";

// react-router
import { Outlet } from "react-router-dom";

const BlankLayout = () => {
    return (
        <>
            <div className="content-bg">
                <Outlet />
            </div>
        </>
    );
};

export default BlankLayout

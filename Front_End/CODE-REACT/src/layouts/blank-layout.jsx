import React from "react";

// react-router
import { Outlet } from "react-router-dom";
import SettingOffCanvas from "../components/setting/SettingOffCanvas";

const BlankLayout = () => {
    return (
        <>
            <div className="content-bg">
                <Outlet />
                <SettingOffCanvas />
            </div>
        </>
    );
};

export default BlankLayout

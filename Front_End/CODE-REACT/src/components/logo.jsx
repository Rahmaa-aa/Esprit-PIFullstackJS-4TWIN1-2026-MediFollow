import React from "react"

// Import Image
import logo from "/assets/images/logosite.png"

const Logo = () => {
    return (
        <>
            <div className="logo-main" style={{ maxHeight: "80px", display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
                <img className="logo-normal img-fluid" src={logo} alt="logo" style={{ maxHeight: "80px", width: "auto", objectFit: "contain" }} />
            </div>
        </>
    )
}

export default Logo
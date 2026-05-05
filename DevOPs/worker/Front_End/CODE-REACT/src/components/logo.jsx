import React from "react"
import OptimizedSiteLogo from "./landing/OptimizedSiteLogo"

const Logo = () => {
    return (
        <>
            <div className="logo-main" style={{ maxHeight: "80px", display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
                <OptimizedSiteLogo
                  className="logo-normal img-fluid"
                  alt="logo"
                  style={{ maxHeight: "80px", width: "auto", objectFit: "contain" }}
                  sizes="200px"
                  width={320}
                  height={180}
                />
            </div>
        </>
    )
}

export default Logo
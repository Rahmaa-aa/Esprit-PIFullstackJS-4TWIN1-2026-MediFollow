import React from "react";
import { Link } from "react-router-dom";


const InboxEmailIcon = (props) => {

    const { handleEmailClick } = props

    return (
        <>
            <ul className="iq-social-media">
                <li><Link to=""><i className="ri-delete-bin-2-line" onClick={handleEmailClick}></i></Link></li>
                <li><Link to=""><i className="ri-mail-line" onClick={handleEmailClick}></i></Link></li>
                <li><Link to=""><i className="ri-file-list-2-line" onClick={handleEmailClick}></i></Link></li>
                <li><Link to=""><i className="ri-time-line" onClick={handleEmailClick}></i></Link></li>
            </ul>
        </>
    )
}

export default InboxEmailIcon
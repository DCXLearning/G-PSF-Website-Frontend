"use client";

import { useEffect } from "react";

const AdminRedirect: React.FC = () => {
    useEffect(() => {
        window.location.href = "https://admin-gpsf.datacolabx.com";
    }, []);

    return <p>Redirecting to admin...</p>;
};

export default AdminRedirect;

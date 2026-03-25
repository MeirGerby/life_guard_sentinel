import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

function ProtectedRoute({ children }) {
    const [isAuth, setIsAuth] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await axios.get("http://127.0.0.1:8000/me", {
                    withCredentials: true,
                });

                if (res.data.user) {
                    setIsAuth(true);
                } else {
                    setIsAuth(false);
                }
            } catch (err) {
                setIsAuth(false);
            }
        };

        checkAuth();
    }, []);

    if (isAuth === null) {
        return <div>Loading...</div>;
    }

    return isAuth ? children : <Navigate to="/" />;
}

export default ProtectedRoute;
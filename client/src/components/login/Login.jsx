import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // ✅ חשוב לייבא את ה-CSS

function Login() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [token, setToken] = useState(null); // 🔐 memory storage

    function updateName(e) {
        setName(e.target.value);
    }

    function updatePassword(e) {
        setPassword(e.target.value);
    }

    async function sendUserInput() {
        try {
            setError(""); // Reset error

            const res = await axios.post(
                "http://127.0.0.1:8000/auth/login",
                { name, password },
                { withCredentials: true } // 🍪 אם בעתיד נשתמש ב-Cookies
            );

            const data = res.data;

            if (data.error) {
                setError("User doesn't exist");
                return;
            }

            setToken(data.token);
            localStorage.setItem("token", data.token);

            navigate('http://localhost:3000');

        } catch (err) {
            console.log("Login error:", err.response?.data || err.message);
            setError("User doesn't exist, please try again");
        }
    }

    return (
        <div className="page">
            <div className="login-container">
                <h2>Login</h2>

                <label>Name:</label>
                <input
                    type="text"
                    value={name}
                    onChange={updateName}
                    placeholder="Enter your name"
                />

                <label>Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={updatePassword}
                    placeholder="Enter your password"
                />

                {error && <div className="error-box">{error}</div>}

                <button onClick={sendUserInput}>Submit</button>
            </div>
        </div>
    );
}

export default Login;
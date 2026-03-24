import { useState } from "react";
import axios from "axios";
import "./AddUser.css";

function AddUser() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleNameChange = (e) => setName(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);

    const handleSubmit = async () => {
        try {
            setError("");
            setMessage("");

            const res = await axios.post(
                "http://127.0.0.1:8000/users",
                { name, password },
                { withCredentials: true } // חובה אם משתמשים ב-Cookies
            );

            const data = res.data;

            if (data.error) {
                setError(data.error);
            } else {
                setMessage("User added successfully!");
                setName("");
                setPassword("");
            }

        } catch (err) {
            console.log(err);
            setError("Failed to add user");
        }
    };

    return (
        <div className="page">
            <div className="form-container">
                <h2>Add User</h2>

                {error && <div className="error-box">{error}</div>}
                {message && <div className="success-box">{message}</div>}

                <label>Name:</label>
                <input
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="Enter user name"
                />

                <label>Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Enter password"
                />

                <button onClick={handleSubmit}>Add User</button>
            </div>
        </div>
    );
}

export default AddUser;
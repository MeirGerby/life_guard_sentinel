import { useState } from "react";
import axios from "axios";
import "./UpdateUser.css";

function UpdateUser() {
    const [userId, setUserId] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleUserIdChange = (e) => setUserId(e.target.value);
    const handleNameChange = (e) => setName(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);

    const handleUpdate = async () => {
        try {
            setError("");
            setMessage("");

            const res = await axios.put(
                `http://127.0.0.1:8000/users/${userId}`,
                { name, password },
                { withCredentials: true }
            );

            const data = res.data;

            if (data.error) {
                setError(data.error);
            } else {
                setMessage("User updated successfully!");
                setUserId("");
                setName("");
                setPassword("");
            }

        } catch (err) {
            console.log(err);
            setError("Failed to update user");
        }
    };

    return (
        <div className="page">
            <div className="form-container">
                <h2>Update User</h2>

                {error && <div className="error-box">{error}</div>}
                {message && <div className="success-box">{message}</div>}

                <label>User ID:</label>
                <input
                    type="text"
                    value={userId}
                    onChange={handleUserIdChange}
                    placeholder="Enter user ID"
                />

                <label>Name:</label>
                <input
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="Enter new name"
                />

                <label>Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                />

                <button onClick={handleUpdate}>Update User</button>
            </div>
        </div>
    );
}

export default UpdateUser;
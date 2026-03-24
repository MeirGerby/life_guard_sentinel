import { useState } from "react";
import axios from "axios";
import "./DeleteUser.css";

function DeleteUser() {
    const [userId, setUserId] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleUserIdChange = (e) => setUserId(e.target.value);

    const handleDelete = async () => {
        try {
            setError("");
            setMessage("");

            const res = await axios.delete(
                `http://127.0.0.1:8000/users/${userId}`,
                { withCredentials: true }
            );

            const data = res.data;

            if (data.error) {
                setError(data.error);
            } else {
                setMessage("User deleted successfully!");
                setUserId("");
            }

        } catch (err) {
            console.log(err);
            setError("Failed to delete user");
        }
    };

    return (
        <div className="page">
            <div className="form-container">
                <h2>Delete User</h2>

                {error && <div className="error-box">{error}</div>}
                {message && <div className="success-box">{message}</div>}

                <label>User ID:</label>
                <input
                    type="text"
                    value={userId}
                    onChange={handleUserIdChange}
                    placeholder="Enter user ID"
                />

                <button onClick={handleDelete}>Delete User</button>
            </div>
        </div>
    );
}

export default DeleteUser;
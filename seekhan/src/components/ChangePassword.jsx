import React, { useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from "./AuthorContext.jsx";

function ChangePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { userId } = useContext(AuthContext);
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (password !== confirmPassword) {
        setError("Passwords do not match");
      } else {
        setError("");
        const response = await axios.put(
          `http://localhost:6969/setPassword/${userId}`,
          { password }
        );
        console.log(response.data);
        alert("Password successfully set!");
        // You can add further logic (e.g., sending data to the backend)
      }
    } catch (error) {
      console.log(`password set failed ${error}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Set Password
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="relative mb-6">
            <input
              type="password"
              id="password"
              placeholder=" "
              className="peer w-full px-4 py-3 border border-gray-300 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-600"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label
              htmlFor="password"
              className="absolute text-sm text-gray-500 left-4 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-5 peer-focus:text-sm peer-focus:text-blue-500 px-1"
            >
              Password
            </label>
          </div>

          <div className="relative mb-6">
            <input
              type="password"
              id="confirmPassword"
              placeholder=" "
              className="peer w-full px-4 py-3 border border-gray-300 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-600"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <label
              htmlFor="confirmPassword"
              className="absolute text-sm text-gray-500 left-4 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-5 peer-focus:text-sm peer-focus:text-blue-500 px-1"
            >
              Confirm Password
            </label>
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md text-center font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Set Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "./AuthorContext";

function Verifymail() {
  const navigate = useNavigate();
  const { userId } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [clicked, setClicked] = useState(false);
  const [otp, setOtp] = useState(null);
  const [inputOtp, setInputOtp] = useState("");
  const [timer, setTimer] = useState(35);

  useEffect(() => {
    let interval;
    if (clicked && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setClicked(false); // Re-enable OTP generation
      setTimer(35); // Reset timer
    }
    return () => clearInterval(interval);
  }, [clicked, timer]);

  const verifyitUsingOtp = (e) => {
    e.preventDefault(); // Prevent form refresh
    if (parseInt(otp) === parseInt(inputOtp)) {
      navigate("/Verifymail/ChangePassword");
    } else {
      alert("INCORRECT OTP, try again");
    }
  };

  const generateOTP = async (e) => {
    e.preventDefault(); // Prevent form refresh
    try {
      if (!email) {
        alert("Please enter your email first.");
        return;
      }
      setClicked(true);
      const getOtp = await axios.get(
        `http://localhost:6969/getOtp/${userId}/${email}`
      );
      setOtp(getOtp.data.data);
    } catch (error) {
      console.log(`Error in receiving the OTP: ${error}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Verify Email
        </h2>
        <form>
          <div className="relative mb-6">
            <input
              type="email"
              id="email"
              placeholder=" "
              className="peer w-full px-4 py-3 border border-gray-300 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-600"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label
              htmlFor="email"
              className="absolute text-sm text-gray-500 left-4 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-5 peer-focus:text-sm peer-focus:text-blue-500  px-1"
            >
              Email Id
            </label>
          </div>
          <div className="flex gap-x-4">
            <input
              type="number"
              id="OTP"
              placeholder="Enter OTP"
              disabled={!clicked}
              className="w-full px-4 py-3 border border-gray-300 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-600"
              required
              value={inputOtp}
              onChange={(e) => setInputOtp(e.target.value)}
            />
            <button
              className={`w-[150px] px-4 py-3 rounded-md font-bold ${
                clicked
                  ? "bg-gray-600 text-white cursor-not-allowed"
                  : "bg-white text-gray-900"
              }`}
              onClick={generateOTP}
              disabled={clicked}
            >
              OTP
            </button>
            {clicked && <span>{timer}s</span>}
          </div>
          {clicked && (
            <button
              type="submit"
              className="w-full bg-blue-600 mt-[30px] text-white py-3 rounded-md font-medium hover:bg-blue-700"
              onClick={verifyitUsingOtp}
            >
              Confirm
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default Verifymail;

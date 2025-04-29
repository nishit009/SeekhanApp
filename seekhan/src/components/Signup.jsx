import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthorContext";
import axios from "axios";
function Signup() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phoneno, setPhoneno] = useState(0);
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [checkValidEmail, setCheckValidEmail] = useState(true);
  const { login, addusername } = useContext(AuthContext);
  const handleSubmit = (e) => {
    if (confirmEmail()) {
      // Prevent the default form submission behavior
      e.preventDefault();
      sendData();
    } else {
      setCheckValidEmail(false);
    }
  };
  const confirmEmail = async () => {
    try {
      const response = await axios.post("http://localhost:6969/confirmMail", {
        email,
        firstname,
      });

      if (response.status === 200) {
        console.log("✅ Mail sent successfully");
        return true;
      } else {
        console.log("⚠️ Mail was not sent");
        return false;
      }
    } catch (error) {
      console.error(
        "❌ Error:",
        error.response?.data?.message || error.message
      );
      return false;
    }
  };

  async function sendData() {
    try {
      const response = await fetch("http://localhost:6969/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fname: firstname,
          lname: lastname,
          emailId: email,
          pno: phoneno,
          gen: gender,
          HashPw: password,
        }),
      });
      const result = await response.json();
      if (result.success) {
        alert("Signup successful! Redirecting to login page...");
        navigate("/login");
      } else {
        alert(result.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.log(`error is this ${error}`);
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
        <h2
          className={`text-2xl font-bold ${
            checkValidEmail ? "text-white" : "text-red-600"
          } text-center mb-6`}
        >
          {checkValidEmail ? "Signup" : "Invalid email"}
        </h2>
        <form onSubmit={handleSubmit}>
          {/* First Name */}
          <div className="relative mb-6">
            <input
              type="text"
              id="firstName"
              placeholder=" "
              className="peer w-full px-4 py-3 border border-gray-300 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-600"
              required
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
            />
            <label
              htmlFor="firstName"
              className="absolute text-sm text-gray-500 left-4 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-5 peer-focus:text-sm peer-focus:text-blue-500  px-1"
            >
              First Name
            </label>
          </div>

          {/* Last Name */}
          <div className="relative mb-6">
            <input
              type="text"
              id="lastName"
              placeholder=" "
              className="peer w-full px-4 py-3 border border-gray-300 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-600"
              required
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
            />
            <label
              htmlFor="lastName"
              className="absolute text-sm text-gray-500 left-4 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-5 peer-focus:text-sm peer-focus:text-blue-500  px-1"
            >
              Last Name
            </label>
          </div>

          {/* Email */}
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
              Email
            </label>
          </div>

          {/* Phone */}
          <div className="relative mb-6">
            <input
              type="tel"
              id="phone"
              placeholder=" "
              className="peer w-full px-4 py-3 border border-gray-300 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-600"
              required
              value={phoneno}
              onChange={(e) => setPhoneno(e.target.value)}
            />
            <label
              htmlFor="phone"
              className="absolute text-sm text-gray-500 left-4 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-5 peer-focus:text-sm peer-focus:text-blue-500 px-1"
            >
              Phone
            </label>
          </div>

          {/* Gender */}
          <div className="relative mb-6">
            <select
              id="gender"
              className="peer w-full px-4 py-3 border border-gray-300 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-600"
              required
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="" disabled>
                Select Gender
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Password */}
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

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md text-center font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign Up
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <a href="Login" className="text-blue-600 font-medium hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
export default Signup;

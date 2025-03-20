import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthorContext";
import axios from "axios";
function Login() {
  const { addusername } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  async function sendData() {
    try {
      const response = await fetch("http://localhost:6969/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailId: email,
          HashPw: password,
        }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        alert(errorResult.message || "An error occurred. Please try again.");
        return;
      }

      const result = await response.json();
      if (result.success) {
        console.log(result);
        login(result.message, result.userid);
        alert("Login successful! Redirecting to home page...");
      }
      const name = await axios.get(`http://localhost:6969/getName/${email}`);
      addusername(name.data.data);
      console.log(name.data);
      navigate("/home");
    } catch (error) {
      console.log(`Error occurred: ${error.message}`);
      alert("An error occurred. Please try again later.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Login
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendData();
          }}
        >
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
            <p className="text-sm text-red-500 mt-2 hidden peer-invalid:block">
              Please enter a valid email
            </p>
          </div>
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
              className="absolute text-sm text-gray-500 left-4 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-5 peer-focus:text-sm peer-focus:text-blue-500  px-1"
            >
              Enter Your Password
            </label>
            <a
              href="#"
              className="text-sm text-blue-600 hover:underline mt-2 block"
            >
              Forgot password?
            </a>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md text-center font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Login
          </button>
        </form>
        <p className="text-center text-sm text-white mt-6">
          Don't have an account?{" "}
          <a
            href="signup"
            className="text-blue-600 font-medium hover:underline"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
export default Login;

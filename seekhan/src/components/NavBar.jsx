import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthorContext";
import { NavLink } from "react-router-dom";
import logoimg1 from "./assets/updated_logo.png";
import profileLogo from "./assets/R.png";
import axios from "axios";

function NavBar() {
  const navigate = useNavigate();
  const [isDropdownOpen, setDropdownOpen] = useState(false); // Dropdown state
  const { setHistory, userId } = useContext(AuthContext);
  const openSignup = () => {
    navigate("/Signup");
  };

  const { isLoggedIn, logout, isAdmin, username } = useContext(AuthContext);

  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);
  const updateTheHistory = async () => {
    try {
      const getHistory = await axios.get(
        `http://localhost:6969/getHistory/${userId}`
      );
      const response = getHistory.data.message;
      setHistory(response);
      console.log(`succesfully fetched the backup data ${response}`);
      navigate("/History");
    } catch (error) {
      console.log(`unsuccessfull in fetching data ${error} `);
    }
  };

  return (
    <nav className="w-full h-[80px] px-[50px] flex items-center justify-between bg-[#002D62] text-white">
      {/* Logo Section */}
      <div>
        <img src={logoimg1} className="h-[30px] w-auto" alt="Logo" />
      </div>

      {/* Center Navigation Links */}
      <ul className="flex space-x-[50px]">
        <li className="font-bold cursor-pointer">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              isActive
                ? "underline decoration-[#59AACF] decoration-2 underline-offset-4"
                : "hover:underline hover:decoration-[#59AACF] hover:decoration-2 hover:underline-offset-4"
            }
          >
            Home
          </NavLink>
        </li>
        <li className="font-bold cursor-pointer">
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive
                ? "underline decoration-[#59AACF] decoration-2 underline-offset-4"
                : "hover:underline hover:decoration-[#59AACF] hover:decoration-2 hover:underline-offset-4"
            }
          >
            About
          </NavLink>
        </li>
        {isAdmin && (
          <li className="font-bold cursor-pointer">
            <NavLink
              to="/Git"
              className={({ isActive }) =>
                isActive
                  ? "underline decoration-[#59AACF] decoration-2 underline-offset-4"
                  : "hover:underline hover:decoration-[#59AACF] hover:decoration-2 hover:underline-offset-4"
              }
            >
              Git
            </NavLink>
          </li>
        )}
        {isLoggedIn && (
          <li className="font-bold cursor-pointer">
            <NavLink
              to="/quiz"
              className={({ isActive }) =>
                isActive
                  ? "underline decoration-[#59AACF] decoration-2 underline-offset-4"
                  : "hover:underline hover:decoration-[#59AACF] hover:decoration-2 hover:underline-offset-4"
              }
            >
              Quiz
            </NavLink>
          </li>
        )}
      </ul>

      {/* Profile Section */}
      <div className="relative flex items-center space-x-5">
        {isLoggedIn && (
          <>
            {/* Profile Dropdown */}
            <div className="relative">
              <img
                src={profileLogo}
                alt="Profile"
                onClick={toggleDropdown}
                className={`h-[40px] w-[40px] rounded-full cursor-pointer bg-blue-800 ${
                  toggleDropdown ? "hover:bg-blue-400" : "hover:bg-gray-400"
                }`}
              />
              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-[#002D62] text-white rounded shadow-lg z-50"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="block w-full text-left px-4 py-2 bg-black">
                    welcome {username} !
                  </div>
                  <button
                    onClick={updateTheHistory}
                    className="block w-full text-left px-4 py-2 hover:bg-black"
                  >
                    History
                  </button>
                  <button
                    onClick={() => navigate("/ChangePassword")}
                    className="block w-full text-left px-4 py-2 hover:bg-black"
                  >
                    Change Password
                  </button>
                </div>
              )}
            </div>

            {/* Separate Logout Button */}
            <button
              onClick={logout}
              className="font-bold cursor-pointer hover:underline"
            >
              Logout
            </button>
          </>
        )}

        {!isLoggedIn && (
          <button
            className="outline-none bg-[#59AACF] hover:bg-[#011732] w-fit h-fit px-4 font-bold py-2"
            onClick={openSignup}
          >
            SignUp
          </button>
        )}
      </div>
    </nav>
  );
}

export default NavBar;

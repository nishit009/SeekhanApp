import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [history, setHistory] = useState([]); // Stores the history of prompt-result pairs
  const [userId, setUserId] = useState(null);
  const [qAndAns, setQAndAns] = useState({
    question: "",
    generatedOutput: "",
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    const isAdminStored = localStorage.getItem("isAdmin") === "true";
    const storedHistory = localStorage.getItem("history");
    const storedUsername = localStorage.getItem("username");

    if (storedToken) {
      setIsLoggedIn(true);
      setIsAdmin(isAdminStored);
      setUserId(storedUserId);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
      if (storedUsername) {
        setUsername(storedUsername);
      }
    }
  }, []);

  // Helper to generate a token (for demonstration)
  const generateToken = () => Date.now();

  // Handles user login
  const login = async (result, userId) => {
    try {
      const isAdminFlag = result === "admin";
      setIsAdmin(isAdminFlag);
      localStorage.setItem("isAdmin", isAdminFlag);
      const token = generateToken();
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      setIsLoggedIn(true);
      setUserId(userId);
    } catch (error) {
      console.log(`error in seting the history ${error}`);
    }
  };

  // Handles user logout
  const logout = async () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("userId");
      localStorage.removeItem("history");
      localStorage.removeItem("username");
      setIsLoggedIn(false);
      setIsAdmin(false);
      setUserId(null);
      setHistory([]);
      setUsername("guest");
      window.location.href = "/";
    } catch (error) {
      console.log(`error in seting the history ${error}`);
    }
  };

  // Adds a question-answer pair to the history
  const addToHistory = async (question, answer) => {
    try {
      const newEntry = { question, answer };
      setHistory((prev) => [...prev, newEntry]);
      const putResponse = await axios.put(
        `http://localhost:6969/storeHistory/${userId}`,
        { history }
      );
      console.log(putResponse.data.message);
    } catch (error) {
      console.log(`couldnt update the history ${error}`);
    }
  };
  const addusername = (firstName) => {
    setUsername(firstName);
    localStorage.setItem("username", firstName);
  };
  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        login,
        logout,
        isAdmin,
        history,
        addToHistory, // Add questions and answers to history
        qAndAns,
        setQAndAns,
        addusername,
        username,
        setUsername,
        userId,
        setHistory,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

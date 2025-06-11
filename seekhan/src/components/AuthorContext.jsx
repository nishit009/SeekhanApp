import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import axiosInstance from "./axiosInstancs";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [history, setHistory] = useState([]);
  const [userId, setUserId] = useState(null);
  const [qAndAns, setQAndAns] = useState({
    question: "",
    generatedOutput: "",
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedUserId = localStorage.getItem("userId");
    const isAdminStored = localStorage.getItem("isAdmin") === "true";
    const storedHistory = localStorage.getItem("history");
    const storedUsername = localStorage.getItem("username");

    if (storedToken) {
      setIsLoggedIn(true);
      setIsAdmin(isAdminStored);
      setUserId(storedUserId);

      if (storedHistory) {
        try {
          const parsedHistory = JSON.parse(storedHistory);
          setHistory(Array.isArray(parsedHistory) ? parsedHistory : []);
        } catch (e) {
          console.warn("Invalid history in localStorage, clearing it:", e);
          setHistory([]);
          localStorage.removeItem("history");
        }
      }

      if (storedUsername) {
        setUsername(storedUsername);
      }
    }
  }, []);

  const login = async (role, userId, refreshToken, accessToken) => {
    try {
      const isAdminFlag = role === "admin";
      setIsAdmin(isAdminFlag);
      localStorage.setItem("isAdmin", isAdminFlag);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userId", userId);
      setUserId(userId);
    } catch (error) {
      console.error("Error during login setup:", error);
    }
  };

  const refreshToken = async () => {
    try {
      const res = await fetch("http://localhost:6969/refresh-token", {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        console.log("Access token refreshed!");
      } else {
        console.warn("Refresh token failed:", data.message);
        logout();
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      logout();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refreshToken();
    }, 5 * 60 * 1000); // every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const logout = async () => {
    try {
      localStorage.removeItem("accessToken");
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
      console.error("Error during logout:", error);
    }
  };

  const addToHistory = async (question, answer) => {
    try {
      const newEntry = { question, answer };

      // Optimistically update UI
      setHistory((prevHistory) => [...prevHistory, newEntry]);

      // Send only the new entry to the server
      const responseServer = await axiosInstance.put(
        `http://localhost:6969/storeHistory/${userId}`,
        newEntry
      );

      console.log(responseServer.data.message);
    } catch (error) {
      console.error("Couldn't update the history:", error);
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
        addToHistory,
        qAndAns,
        setQAndAns,
        addusername,
        username,
        setUsername,
        userId,
        setHistory,
        setIsLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

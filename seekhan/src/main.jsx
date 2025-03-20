import { createRoot } from "react-dom/client";
import Llamato from "./App.jsx";
import "./index.css";
import Home from "./components/home.jsx";
import React from "react";
import NavBar from "./components/NavBar.jsx";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Layout from "./Layout.jsx";
import Quiz from "./components/Quiz.jsx";
import About from "./components/About.jsx";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import Rag from "./components/quizComponents/Rag.jsx";
import VoiceRag from "./components/quizComponents/VoiceRag.jsx";
import FineTune from "./components/quizComponents/FineTune.jsx";
import { AuthProvider } from "./components/AuthorContext.jsx";
import History from "./components/History.jsx";
import Git from "./components/Git.jsx";
import Verifymail from "./components/Verifymail.jsx";
import ChangePassword from "./components/ChangePassword.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "", element: <Home /> },
      { path: "home", element: <Home /> },
      { path: "quiz", element: <Quiz /> },
      {
        path: "quiz",
        element: <Quiz />,
      },
      { path: "quiz/VoiceRag", element: <VoiceRag /> },
      { path: "quiz/Rag", element: <Rag /> },
      { path: "quiz/FineTune", element: <FineTune /> },
      { path: "about", element: <About /> },
      { path: "Login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "git", element: <Git /> },
      { path: "history", element: <History /> },
      { path: "Verifymail", element: <Verifymail /> },
      { path: "Verifymail/ChangePassword", element: <ChangePassword /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </>
);

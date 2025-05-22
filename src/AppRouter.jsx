import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

const AppRouter = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Router>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute role="manager"><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/products"
          element={<ProtectedRoute><Products /></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
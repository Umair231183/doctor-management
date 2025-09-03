import React from "react";

import { Routes, Route, Navigate } from "react-router-dom";
import Index from "./app/(app)/pages/Index";
import Login from "./app/(app)/pages/Login";
import Register from "./app/(app)/pages/Register";
import PatientDashboard from "./app/(app)/pages/patient/Dashboard";
import DoctorDashboard from "./app/(app)/pages/doctor/Dashboard";
import ProtectedRoute from "./app/(app)/pages/ProtectedRoute";
import NotFound from "./app/(app)/pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute requiredRole="patient">
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute requiredRole="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

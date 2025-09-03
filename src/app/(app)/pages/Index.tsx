import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStor";
import { Navbar } from "../components/layout/Navbar";
import { Users, CalendarCheck, Heart } from "lucide-react";
import Footer from "../components/layout/Footer";

export default function Index() {
  const user = useAuthStore((state) => state.user);

  // Redirect logged-in users to their dashboard
  if (user?.role === "patient") return <Navigate to="/patient/dashboard" replace />;
  if (user?.role === "doctor") return <Navigate to="/doctor/dashboard" replace />;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Navbar />

      {/* Hero Section */}
      <section className="flex flex-col-reverse lg:flex-row items-center justify-between max-w-7xl mx-auto px-6 lg:px-8 py-20 gap-12">
        <div className="flex-1 text-center lg:text-left space-y-6">
          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
            Book Doctor Appointments <span className="text-indigo-600">Easily & Quickly</span>
          </h1>
          <p className="text-gray-700 text-lg max-w-xl mx-auto lg:mx-0">
            Manage your health appointments with ease. Find the best doctors near you and book your consultations online in just a few clicks.
          </p>
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <a
              href="/register"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition font-medium"
            >
              Get Started
            </a>
            <a
              href="/login"
              className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition font-medium"
            >
              Login
            </a>
          </div>
        </div>
        <div className="flex-1">
          <img
            src="/images/hero.webp"
            alt="Doctor Appointment"
            width={600}
            height={400}
            className="rounded-xl shadow-xl"
  />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center space-y-12">
          <h2 className="text-3xl font-bold text-gray-900">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-6 bg-indigo-50 rounded-xl shadow hover:shadow-lg transition">
              <CalendarCheck className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-700">Schedule appointments with doctors effortlessly through our intuitive platform.</p>
            </div>
            <div className="p-6 bg-indigo-50 rounded-xl shadow hover:shadow-lg transition">
              <Users className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Trusted Doctors</h3>
              <p className="text-gray-700">Access a curated list of certified and highly experienced healthcare professionals.</p>
            </div>
            <div className="p-6 bg-indigo-50 rounded-xl shadow hover:shadow-lg transition">
              <Heart className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Health Management</h3>
              <p className="text-gray-700">Keep track of your appointments, medical records, and consultations in one place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-indigo-600 py-16 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Manage Your Health?</h2>
        <p className="mb-6 text-lg max-w-xl mx-auto">
          Sign up today and take control of your appointments and health consultations online.
        </p>
        <a
          href="/register"
          className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition"
        >
          Get Started
        </a>
      </section>
 
        <Footer />         
    </div>
  );
}

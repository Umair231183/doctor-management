"use client";
import React, { useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Filter } from "lucide-react";

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  experience: string;
}

const doctors: Doctor[] = [
  { id: 1, name: "Dr. Ahsan Khan", specialization: "Cardiology", experience: "10 years" },
  { id: 2, name: "Dr. Sara Malik", specialization: "Neurology", experience: "7 years" },
  { id: 3, name: "Dr. Imran Ali", specialization: "Orthopedics", experience: "12 years" },
  { id: 4, name: "Dr. Zainab Fatima", specialization: "Dermatology", experience: "5 years" },
];

const specializations = ["Cardiology", "Neurology", "Orthopedics", "Dermatology"];

const PatientDashboard: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialization =
      selectedSpecialization === "" || doctor.specialization === selectedSpecialization;
    return matchesSearch && matchesSpecialization;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto bg-[#1C829E] min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Patient Dashboard</h1>

      {/* Search & Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <Input
          placeholder="🔍 Search doctors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:w-1/2 shadow-md focus:ring-2 focus:ring-blue-500"
        />

        <Select
          value={selectedSpecialization || "all"}
          onValueChange={(value) => setSelectedSpecialization(value === "all" ? "" : value)}
        >
          <SelectTrigger className="md:w-1/3 shadow-md border-gray-300 focus:ring-2 focus:ring-blue-500">
            <Filter className="w-4 h-4 mr-2 text-gray-500" />
            <SelectValue placeholder="All Specializations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specializations</SelectItem>
            {specializations.map((spec) => (
              <SelectItem key={spec} value={spec}>
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Doctors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <Card
            key={doctor.id}
            className="hover:shadow-xl transition-shadow duration-300 border border-gray-200 rounded-xl"
          >
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-blue-600">
                {doctor.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Specialization: <span className="font-medium">{doctor.specialization}</span></p>
              <p className="text-gray-600">Experience: <span className="font-medium">{doctor.experience}</span></p>
              <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                Book Appointment
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <p className="text-gray-500 mt-6 text-center">No doctors found matching your criteria.</p>
      )}
    </div>
  );
};

export default PatientDashboard;

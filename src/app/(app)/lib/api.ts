// authAPI
export const authAPI = {
  login: async (data: { email: string; password: string; role: 'patient' | 'doctor' }) => {
    await mockDelay(800);
    const { email, role } = data;

    const mockUser = {
      id: '1',
      email,
      name: role === 'doctor' ? 'Dr. John Smith' : 'Jane Doe',
      role,
      specialization: role === 'doctor' ? 'Cardiologist' : undefined,
      phone: '+1 (555) 123-4567',
      avatar: `https://api.dicebear.com/6.x/avataaars/svg?seed=${email}`,
    };

    return { user: mockUser, token: 'mock-jwt-token-' + Date.now() };
  },

  registerPatient: async (data: { name: string; email: string; password: string; phone: string }) => {
    await mockDelay(1000);
    const mockUser = {
      id: '2',
      email: data.email,
      name: data.name,
      role: 'patient' as const,
      phone: data.phone,
      avatar: `https://api.dicebear.com/6.x/avataaars/svg?seed=${data.email}`,
    };
    return { user: mockUser, token: 'mock-jwt-token-' + Date.now() };
  },

  registerDoctor: async (data: { name: string; email: string; password: string; specialization: string; phone: string; licenseNumber: string }) => {
    await mockDelay(1200);
    const mockUser = {
      id: '3',
      email: data.email,
      name: data.name,
      role: 'doctor' as const,
      specialization: data.specialization,
      phone: data.phone,
      avatar: `https://api.dicebear.com/6.x/avataaars/svg?seed=${data.email}`,
    };
    return { user: mockUser, token: 'mock-jwt-token-' + Date.now() };
  },
};

// Mock delay
function mockDelay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export const appointmentsAPI = {
  getDoctorAppointments: async () => {
    const res = await fetch('/api/appointments/doctor');
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
  },

  getPatientAppointments: async () => {
    const res = await fetch('/api/appointments/patient');
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
  },

  updateStatus: async (appointmentId: string, status: string) => {
    const res = await fetch(`/api/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update appointment status');
    return res.json();
  },

  cancelAppointment: async (appointmentId: string) => {
    const res = await fetch(`/api/appointments/${appointmentId}/cancel`, {
      method: 'PATCH', // or 'POST' depending on your API
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to cancel appointment');
    return res.json();
  },
bookAppointment: async (data: {
  doctorId: string;
  date: string;
  consultationFee?: number;   // optional
  patientId?: string;         // optional
  notes?: string;
}) => {
  const res = await fetch('/api/appointments/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to book appointment');
  return res.json();
},
}

export type Appointment = {
  id: string;
  doctorName: string;
  doctorAvatar?: string | null;
  doctorSpecialization?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  date: string;
  consultationFee?: number;
};


export const specializations = [
  'Cardiologist',
  'Dermatologist',
  'Neurologist',
  'Pediatrician',
  'Psychiatrist',
  'Radiologist',
  'Oncologist',
  'Gynecologist',
  'Orthopedic Surgeon',
  'General Practitioner',
];
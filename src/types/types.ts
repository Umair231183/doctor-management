export interface Doctor {
  id?: string;
  _id?: string;
  name: string;
  specialization?: string;
  photo_url?:string;    
  // Add other fields if needed
}


export interface AppointmentPayload {
  doctorId: string;
  date: string;
}


export interface BookingModalProps {
  doctor: Doctor | null;
  onClose: () => void;
}


export interface AppointmentResponse {
  id: string;
  doctorId: string;
  date: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}
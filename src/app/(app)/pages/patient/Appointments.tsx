import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../../app/(app)/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../app/(app)/components/ui/card';
import { Badge } from '../../../../app/(app)/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../app/(app)/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../app/(app)/components/ui/tabs';
import { Skeleton } from '../../../../app/(app)/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../../app/(app)/components/ui/alert-dialog';
import { useToast } from '../../hooks/use-toast';
import { appointmentsAPI } from '../../lib/api';
import { Navbar } from '../../../../app/(app)/components/layout/Navbar';
import { Calendar, Clock, DollarSign, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export type Appointment = {
  id: string;
  doctorName: string;
  doctorAvatar?: string;
  doctorSpecialization?: string;
  consultationFee?: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  date: string;
};

type AppointmentStatus = 'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled';

export default function PatientAppointments() {
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch appointments
  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['patient-appointments'],
    queryFn: appointmentsAPI.getPatientAppointments,
  });

  // Cancel appointment mutation
  const cancelMutation = useMutation<void, Error, string>({
    mutationFn: (appointmentId: string) => appointmentsAPI.cancelAppointment(appointmentId),
    onSuccess: () => {
      toast({
        title: 'Appointment Cancelled',
        description: 'Your appointment has been cancelled successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Cancellation Failed',
        description: error.message || 'Unable to cancel appointment. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Filter appointments by status
  const filteredAppointments = appointments.filter((appointment: Appointment) =>
    selectedStatus === 'all' ? true : appointment.status === selectedStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'completed':
        return 'bg-primary text-primary-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getAppointmentCounts = () => ({
    all: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    pending: appointments.filter(a => a.status === 'pending').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  });

  const counts = getAppointmentCounts();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Appointments</h1>
          <p className="text-muted-foreground">
            View and manage your upcoming and past appointments
          </p>
        </div>

        {/* Status Tabs */}
        <Tabs value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as AppointmentStatus)}>
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            {(['all', 'confirmed', 'pending', 'completed', 'cancelled'] as AppointmentStatus[]).map((status) => (
              <TabsTrigger key={status} value={status} className="flex items-center gap-2">
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {counts[status] > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                    {counts[status]}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedStatus} className="mt-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="shadow-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-40" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No {selectedStatus !== 'all' ? selectedStatus : ''} appointments
                </h3>
                <p className="text-muted-foreground mb-4">
                  {selectedStatus === 'all'
                    ? "You don't have any appointments yet."
                    : `You don't have any ${selectedStatus} appointments.`}
                </p>
                <Button variant="medical" asChild>
                  <a href="/patient/dashboard">Book Your First Appointment</a>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <Card key={appointment.id} className="shadow-card hover:shadow-hover transition-all bg-gradient-card">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={appointment.doctorAvatar} alt={appointment.doctorName} />
                            <AvatarFallback>
                              {appointment.doctorName
                                .split(' ')
                                .map(n => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{appointment.doctorName}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {appointment.doctorSpecialization ?? 'N/A'}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1 capitalize">{appointment.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{format(new Date(appointment.date), 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{format(new Date(appointment.date), 'h:mm a')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-success" />
                            <span className="font-medium text-success">
                              ${appointment.consultationFee ?? 0}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {appointment.status === 'confirmed' || appointment.status === 'pending' ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel this appointment with{' '}
                                    {appointment.doctorName}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => cancelMutation.mutate(appointment.id)}
                                    disabled={cancelMutation.isPending}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {cancelMutation.isPending ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Cancelling...
                                      </>
                                    ) : (
                                      'Cancel Appointment'
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : null}
                        </div>  
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

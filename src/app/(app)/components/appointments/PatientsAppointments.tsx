import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Skeleton } from '../ui/skeleton';
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
} from '../ui/alert-dialog';
import { useToast } from '../../hooks/use-toast';
import { appointmentsAPI }from '../../lib/api';
import { Calendar, Clock, DollarSign, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

type AppointmentStatus = 'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled';

export type Appointment = {
  id: string;
  doctorAvatar: string;
  doctorName: string;
  doctorSpecialization: string;
  status: AppointmentStatus;
  date: string;
  consultationFee: number;
};

export default function PatientAppointments() {
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ✅ Fetch appointments with proper typing
  const { data: appointments = [], isPending } = useQuery<Appointment[], Error>({
    queryKey: ['patient-appointments'],
    queryFn: appointmentsAPI.getPatientAppointments,
  });

  // ✅ Cancel appointment mutation with proper typing
  const cancelMutation: UseMutationResult<void, Error, string> = useMutation({
    mutationFn: appointmentsAPI.cancelAppointment,
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

  // ✅ Filter appointments safely
  const filteredAppointments = appointments.filter((appt) =>
    selectedStatus === 'all' ? true : appt.status === selectedStatus
  );

  // ✅ Status helpers
  const getStatusColor = (status: AppointmentStatus) => {
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

  const getStatusIcon = (status: AppointmentStatus) => {
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

  const counts = {
    all: appointments.length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
  };

  return (
    <div className="min-h-screen bg-background p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">My Appointments</h1>
      <p className="text-muted-foreground mb-8">View and manage your upcoming and past appointments</p>

      <Tabs value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as AppointmentStatus)}>
        <TabsList className="grid grid-cols-5 gap-2 mb-6">
          <TabsTrigger value="all" className="flex items-center justify-center gap-1">
            All {counts.all > 0 && <Badge variant="secondary">{counts.all}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="flex items-center justify-center gap-1">
            Confirmed {counts.confirmed > 0 && <Badge variant="secondary">{counts.confirmed}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center justify-center gap-1">
            Pending {counts.pending > 0 && <Badge variant="secondary">{counts.pending}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center justify-center gap-1">
            Completed {counts.completed > 0 && <Badge variant="secondary">{counts.completed}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center justify-center gap-1">
            Cancelled {counts.cancelled > 0 && <Badge variant="secondary">{counts.cancelled}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus}>
          {isPending ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">
                No {selectedStatus !== 'all' ? selectedStatus : ''} appointments
              </h3>
              <p>
                {selectedStatus === 'all'
                  ? "You don't have any appointments yet."
                  : `You don't have any ${selectedStatus} appointments.`}
              </p>
              <Button variant="medical" className="mt-6">
                <a href="/patient/dashboard">Book Your First Appointment</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredAppointments.map((appointment) => (
                <Card key={appointment.id} className="shadow hover:shadow-lg transition">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={appointment.doctorAvatar} alt={appointment.doctorName} />
                          <AvatarFallback>
                            {appointment.doctorName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle>{appointment.doctorName}</CardTitle>
                          <p className="text-sm text-muted-foreground">{appointment.doctorSpecialization}</p>
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
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{appointment.date ? format(new Date(appointment.date), 'MMM d, yyyy') : '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{appointment.date ? format(new Date(appointment.date), 'h:mm a') : '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-success" />
                          <span className="font-semibold text-success">${appointment.consultationFee}</span>
                        </div>
                      </div>

                      <div>
                        {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
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
                                  Are you sure you want to cancel this appointment with {appointment.doctorName}? This action cannot be undone.
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
                        )}
                        {(appointment.status === 'completed' || appointment.status === 'cancelled') && (
                          <Button variant="outline" size="sm" disabled>
                            {appointment.status === 'completed' ? 'Completed' : 'Cancelled'}
                          </Button>
                        )}
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
  );
}

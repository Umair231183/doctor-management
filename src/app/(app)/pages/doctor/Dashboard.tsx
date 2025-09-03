// DoctorDashboard.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Skeleton } from '../../components/ui/skeleton';
import { useToast } from '../../hooks/use-toast';
import { appointmentsAPI } from '../../lib/api';
import { Navbar } from '../../components/layout/Navbar';
import {
  Calendar,
  Clock,
  Mail,
  CheckCircle,
  X,
  Search,
  Loader2,
} from 'lucide-react';
import { format, startOfDay, endOfDay } from 'date-fns';

type AppointmentStatus = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

type Appointment = {
  id: string;
  patientName: string;
  patientEmail: string;
  patientAvatar?: string | null;
  status: Exclude<AppointmentStatus, 'all'>; // 'pending' | 'confirmed' | 'completed' | 'cancelled'
  date: string; // ISO string
};

export default function DoctorDashboard(): JSX.Element {
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null); // id of appointment currently updating

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch appointments (typed)
  const { data: appointments = [], isLoading, isError, error } = useQuery<Appointment[], Error>({
    queryKey: ['doctor-appointments'],
    queryFn: () => appointmentsAPI.getDoctorAppointments(),
    staleTime: 1000 * 60 * 30, // 30 minutes stale (adjust as needed)
  });

  // Optimistic status update mutation
  const updateStatusMutation = useMutation<
    Appointment, // returned appointment (if your API returns it)
    Error,
    { appointmentId: string; status: Appointment['status'] }
  >({
    mutationFn: ({ appointmentId, status }) => appointmentsAPI.updateStatus(appointmentId, status),
    onMutate: async ({ appointmentId, status }) => {
      // Track which appointment is updating to show per-row loader
      setUpdatingId(appointmentId);

      // Cancel any outgoing refetches (so they don't overwrite optimistic update)
      await queryClient.cancelQueries({ queryKey: ['doctor-appointments'] });

      const previous = queryClient.getQueryData<Appointment[]>(['doctor-appointments']);

      // Optimistically update cache
      if (previous) {
        queryClient.setQueryData<Appointment[]>(
          ['doctor-appointments'],
          previous.map((a) => (a.id === appointmentId ? { ...a, status } : a))
        );
      }

      return { previous };
    },
    onError: (err, variables, context: any | undefined) => {
      // rollback
      if (context?.previous) {
        queryClient.setQueryData<Appointment[]>(['doctor-appointments'], context.previous);
      }

      toast({
        title: 'Update failed',
        description: err.message || 'Unable to update appointment status',
        variant: 'destructive',
      });
    },
    onSettled: (_data, _err, _vars) => {
      setUpdatingId(null);
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
    },
    onSuccess: (data) => {
      toast({
        title: 'Status updated',
        description: `Appointment marked as ${data.status}.`,
      });
    },
  });

  // Filters (memoized)
  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];

    return appointments.filter((appointment) => {
      // Status filter
      if (selectedStatus !== 'all' && appointment.status !== selectedStatus) return false;

      // Search filter
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        if (
          !appointment.patientName?.toLowerCase().includes(q) &&
          !appointment.patientEmail?.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      // Date filter
      if (dateFilter) {
        const appointmentDate = new Date(appointment.date);
        const filterDate = new Date(dateFilter);
        if (Number.isNaN(appointmentDate.getTime()) || Number.isNaN(filterDate.getTime()))
          return false;
        if (appointmentDate < startOfDay(filterDate) || appointmentDate > endOfDay(filterDate))
          return false;
      }

      return true;
    });
  }, [appointments, selectedStatus, searchTerm, dateFilter]);

  const getStatusColor = useCallback((status: Appointment['status']) => {
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
  }, []);

  const getStatusIcon = useCallback((status: Appointment['status']) => {
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
        return <Clock className="w-4 h-4" />;
    }
  }, []);

  const handleStatusUpdate = (appointmentId: string, status: Appointment['status']) => {
    updateStatusMutation.mutate({ appointmentId, status });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter('');
  };

  // Simple counts
  const counts = useMemo(() => {
    const all = appointments.length;
    return {
      all,
      confirmed: appointments.filter((a) => a.status === 'confirmed').length,
      pending: appointments.filter((a) => a.status === 'pending').length,
      completed: appointments.filter((a) => a.status === 'completed').length,
      cancelled: appointments.filter((a) => a.status === 'cancelled').length,
    };
  }, [appointments]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Appointments</h1>
          <p className="text-muted-foreground">Manage your patient appointments and consultations</p>
        </div>

        {/* Filters */}
        <div className="bg-gradient-card rounded-lg p-6 shadow-card mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                aria-label="Search by patient name or email"
                placeholder="Search by patient name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="w-full md:w-48">
              <Input
                type="date"
                aria-label="Filter by date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              {(searchTerm || dateFilter) && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">{counts.all}</div>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">{counts.confirmed}</div>
              <p className="text-sm text-muted-foreground">Confirmed</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-warning">{counts.pending}</div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{counts.completed}</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-destructive">{counts.cancelled}</div>
              <p className="text-sm text-muted-foreground">Cancelled</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs & List */}
        <Tabs value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as AppointmentStatus)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
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
                        <div className="flex gap-2">
                          <Skeleton className="h-9 w-20" />
                          <Skeleton className="h-9 w-20" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-12">
                <p className="text-destructive">Failed to load appointments: {error?.message}</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {selectedStatus !== 'all' ? `${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} ` : ''}appointments
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || dateFilter ? 'No appointments match your current filters.' : 'Your appointment schedule is clear.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => {
                  // safe date formatting
                  const dateObj = new Date(appointment.date);
                  const validDate = !Number.isNaN(dateObj.getTime());

                  return (
                    <Card key={appointment.id} className="shadow-card hover:shadow-hover transition-all bg-gradient-card">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              {appointment.patientAvatar ? (
                                <AvatarImage src={appointment.patientAvatar} alt={appointment.patientName} />
                              ) : (
                                <AvatarFallback>
                                  {appointment.patientName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">{appointment.patientName}</CardTitle>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                <span>{appointment.patientEmail}</span>
                              </div>
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
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{validDate ? format(dateObj, 'MMM d, yyyy') : 'Invalid date'}</span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{validDate ? format(dateObj, 'h:mm a') : 'Invalid time'}</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {appointment.status === 'pending' && (
                              <>
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                                  disabled={Boolean(updatingId)}
                                  aria-disabled={Boolean(updatingId)}
                                >
                                  {updatingId === appointment.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    'Confirm'
                                  )}
                                </Button>

                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                                  disabled={Boolean(updatingId)}
                                  aria-disabled={Boolean(updatingId)}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}

                            {appointment.status === 'confirmed' && (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                                  disabled={Boolean(updatingId)}
                                  aria-disabled={Boolean(updatingId)}
                                >
                                  {updatingId === appointment.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    'Mark Complete'
                                  )}
                                </Button>

                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                                  disabled={Boolean(updatingId)}
                                  aria-disabled={Boolean(updatingId)}
                                >
                                  Cancel
                                </Button>
                              </>
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
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Calendar } from '../ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { useToast } from '../../hooks/use-toast';
import { appointmentsAPI } from '../../lib/api';
import { CalendarIcon, Clock, DollarSign, Loader2, Stethoscope } from 'lucide-react';
import { cn } from '../../lib/utils';

const appointmentSchema = z.object({
  date: z.date({
    required_error: 'Please select an appointment date',
  }),
  time: z.string().min(1, 'Please select an appointment time'),
  notes: z.string().optional(),
});

type AppointmentForm = z.infer<typeof appointmentSchema>;

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  consultationFee: number;
  avatar: string;
  rating: number;
  experience: number;
}

interface BookAppointmentModalProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

export function BookAppointmentModal({ doctor, isOpen, onClose }: BookAppointmentModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      date: undefined,
      time: '',
      notes: '',
    },
  });

  const watchedTime = watch('time');

  const bookingMutation = useMutation({
    mutationFn: (data: { doctorId: string; date: string; notes?: string }) =>
      appointmentsAPI.bookAppointment(data),
    onSuccess: () => {
      toast({
        title: 'Appointment Booked!',
        description: 'Your appointment has been successfully scheduled. You will receive a confirmation email shortly.',
      });
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
      handleClose();
    },
    onError: (error: unknown) => {
      toast({
        title: 'Booking Failed',
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: AppointmentForm) => {
    if (!doctor || !selectedDate) return;

    const appointmentDateTime = new Date(selectedDate);
    const [hours, minutes] = data.time.split(':').map(Number);
    appointmentDateTime.setHours(hours, minutes);

    bookingMutation.mutate({
      doctorId: doctor.id,
      date: appointmentDateTime.toISOString(),
      notes: data.notes,
    });
  };

  const handleClose = () => {
    reset();
    setSelectedDate(undefined);
    onClose();
  };

  const handleDateSelect = (date?: Date) => {
    if (date) {
      setSelectedDate(date);
      setValue('date', date, { shouldValidate: true });
    }
  };

  const handleTimeSelect = (time: string) => {
    setValue('time', time, { shouldValidate: true });
  };

  if (!doctor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Stethoscope className="w-5 h-5 text-primary" />
            Book Appointment
          </DialogTitle>
          <DialogDescription>
            Schedule your consultation with {doctor.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Doctor Info */}
          <div className="bg-gradient-card p-4 rounded-lg">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={doctor.avatar} alt={doctor.name} />
                <AvatarFallback>
                  {doctor.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{doctor.name}</h3>
                <Badge variant="secondary" className="mb-2">
                  {doctor.specialization}
                </Badge>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {doctor.experience}y experience
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-success" />
                    <span className="font-medium text-success">${doctor.consultationFee}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Date Selection */}
            <div className="space-y-2">
              <Label>Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) =>
                      date < new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                    className={cn('p-3 pointer-events-auto')}
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <Label>Select Time</Label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    type="button"
                    variant={watchedTime === time ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTimeSelect(time)}
                    disabled={!selectedDate}
                  >
                    {time}
                  </Button>
                ))}
              </div>
              {errors.time && (
                <p className="text-sm text-destructive">{errors.time.message}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                {...register('notes')}
                placeholder="Describe your symptoms or reason for visit..."
                className="min-h-[100px]"
              />
            </div>

            {/* Appointment Summary */}
            {selectedDate && watchedTime && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Appointment Summary</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Date:</span>{' '}
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Time:</span> {watchedTime}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Consultation Fee:</span>{' '}
                    <span className="font-semibold text-success">${doctor.consultationFee}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="medical"
                disabled={bookingMutation.isPending || !selectedDate || !watchedTime}
                className="flex-1"
              >
                {bookingMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  'Book Appointment'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
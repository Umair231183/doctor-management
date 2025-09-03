import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import { authAPI,  specializations } from '../lib/api';
import { useAuthStore } from '../store/authStor';
import { Heart, Loader2, Eye, EyeOff, UserPlus, Stethoscope } from 'lucide-react';

const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  phone: z.string().min(10, 'Please enter a valid phone number'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const doctorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  specialization: z.string().min(1, 'Please select a specialization'),
  licenseNumber: z.string().min(5, 'Please enter a valid license number'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PatientForm = z.infer<typeof patientSchema>;
type DoctorForm = z.infer<typeof doctorSchema>;

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  // Fetch specializations
  const { data: specializations = [] } = useQuery({
  queryKey: ["specializations"],
  queryFn: async () => {
    // Replace this with actual API call later
    return [
      "Cardiology",
      "Dermatology",
      "Neurology",
      "Pediatrics",
    ];
  },
});


  // Patient form
  const patientForm = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
  });

  // Doctor form
  const doctorForm = useForm<DoctorForm>({
    resolver: zodResolver(doctorSchema),
  });

  const patientMutation = useMutation({
    mutationFn: (data: { name: string; email: string; password: string; phone: string }) => 
      authAPI.registerPatient(data),
    onSuccess: (response) => {
      login(response.user, response.token);
      toast({
        title: 'Account Created!',
        description: 'Welcome to MediCare. Your patient account has been created successfully.',
      });
      navigate('/patient/dashboard');
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const doctorMutation = useMutation({
    mutationFn: (data: { name: string; email: string; password: string; specialization: string; phone: string; licenseNumber: string }) => 
      authAPI.registerDoctor(data),
    onSuccess: (response) => {
      login(response.user, response.token);
      toast({
        title: 'Account Created!',
        description: 'Welcome to MediCare. Your doctor account has been created successfully.',
      });
      navigate('/doctor/dashboard');
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onPatientSubmit = (data: PatientForm) => {
    const submitData = {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
    };
    patientMutation.mutate(submitData);
  };

  const onDoctorSubmit = (data: DoctorForm) => {
    const submitData = {
      name: data.name,
      email: data.email,
      password: data.password,
      specialization: data.specialization,
      phone: data.phone,
      licenseNumber: data.licenseNumber,
    };
    doctorMutation.mutate(submitData);
  };

  return (
    <div className="min-h-screen bg-[url('/images/hero.webp')] bg-cover bg-center  flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-background/80 backdrop-blur-sm p-3 rounded-full">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Join MediCare</h1>
          <p className="text-white/80 mt-2">Create your account to get started</p>
        </div>

        {/* Registration Form */}
        <Card className="bg-background/80 backdrop-blur-sm shadow-hover border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Choose your account type and fill in the details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="patient" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="patient" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Patient
                </TabsTrigger>
                <TabsTrigger value="doctor" className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Doctor
                </TabsTrigger>
              </TabsList>

              {/* Patient Registration */}
              <TabsContent value="patient" className="space-y-4">
                <form onSubmit={patientForm.handleSubmit(onPatientSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient-name">Full Name</Label>
                    <Input
                      {...patientForm.register('name')}
                      placeholder="Enter your full name"
                      className="transition-all focus:shadow-medical"
                    />
                    {patientForm.formState.errors.name && (
                      <p className="text-sm text-destructive">{patientForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient-email">Email</Label>
                    <Input
                      {...patientForm.register('email')}
                      type="email"
                      placeholder="Enter your email"
                      className="transition-all focus:shadow-medical"
                    />
                    {patientForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{patientForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient-phone">Phone Number</Label>
                    <Input
                      {...patientForm.register('phone')}
                      type="tel"
                      placeholder="Enter your phone number"
                      className="transition-all focus:shadow-medical"
                    />
                    {patientForm.formState.errors.phone && (
                      <p className="text-sm text-destructive">{patientForm.formState.errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient-password">Password</Label>
                    <div className="relative">
                      <Input
                        {...patientForm.register('password')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        className="pr-10 transition-all focus:shadow-medical"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {patientForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{patientForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        {...patientForm.register('confirmPassword')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        className="pr-10 transition-all focus:shadow-medical"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {patientForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">{patientForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    variant="medical"
                    disabled={patientMutation.isPending}
                  >
                    {patientMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Patient Account'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Doctor Registration */}
              <TabsContent value="doctor" className="space-y-4">
                <form onSubmit={doctorForm.handleSubmit(onDoctorSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctor-name">Full Name</Label>
                    <Input
                      {...doctorForm.register('name')}
                      placeholder="Dr. Your Name"
                      className="transition-all focus:shadow-medical"
                    />
                    {doctorForm.formState.errors.name && (
                      <p className="text-sm text-destructive">{doctorForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-email">Email</Label>
                    <Input
                      {...doctorForm.register('email')}
                      type="email"
                      placeholder="Enter your email"
                      className="transition-all focus:shadow-medical"
                    />
                    {doctorForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{doctorForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-specialization">Specialization</Label>
                    <Select onValueChange={(value) => doctorForm.setValue('specialization', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        {specializations.map((spec:any) => (
                          <SelectItem key={spec} value={spec}>
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {doctorForm.formState.errors.specialization && (
                      <p className="text-sm text-destructive">{doctorForm.formState.errors.specialization.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-license">Medical License Number</Label>
                    <Input
                      {...doctorForm.register('licenseNumber')}
                      placeholder="Enter your license number"
                      className="transition-all focus:shadow-medical"
                    />
                    {doctorForm.formState.errors.licenseNumber && (
                      <p className="text-sm text-destructive">{doctorForm.formState.errors.licenseNumber.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-phone">Phone Number</Label>
                    <Input
                      {...doctorForm.register('phone')}
                      type="tel"
                      placeholder="Enter your phone number"
                      className="transition-all focus:shadow-medical"
                    />
                    {doctorForm.formState.errors.phone && (
                      <p className="text-sm text-destructive">{doctorForm.formState.errors.phone.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="doctor-password">Password</Label>
                      <Input
                        {...doctorForm.register('password')}
                        type="password"
                        placeholder="Create a password"
                        className="transition-all focus:shadow-medical"
                      />
                      {doctorForm.formState.errors.password && (
                        <p className="text-sm text-destructive">{doctorForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doctor-confirm-password">Confirm</Label>
                      <Input
                        {...doctorForm.register('confirmPassword')}
                        type="password"
                        placeholder="Confirm password"
                        className="transition-all focus:shadow-medical"
                      />
                      {doctorForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-destructive">{doctorForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    variant="medical"
                    disabled={doctorMutation.isPending}
                  >
                    {doctorMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Doctor Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
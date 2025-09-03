import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import { authAPI } from '../lib/api';
import { useAuthStore } from '../store/authStor';
import { Heart, Loader2, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['patient', 'doctor'], { required_error: 'Please select a role' }),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuthStore();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: LoginForm) => authAPI.login(data.email,data.password,data.role),
    onSuccess: (res) => {
      login(res.user, res.token);
      toast({ title: 'Welcome back!', description: 'Successfully logged in.' });
      navigate(res.user.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');
    },
    onError: (err: any) => {
      toast({ title: 'Login Failed', description: err.message, variant: 'destructive' });
    },
  });

  const onSubmit = (data: LoginForm) => mutation.mutate(data);

  return (
    <div className="min-h-screen bg-[url('/images/hero.webp')] bg-cover bg-center  flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center text-white">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
              <Heart className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-white/80 mt-2">Sign in to your MediCare account</p>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">I am a</Label>
                <Select value={role} onValueChange={(val) => { setRole(val); setValue('role', val as 'patient' | 'doctor'); }}>
                  <SelectTrigger><SelectValue placeholder="Select your role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input {...register('email')} type="email" placeholder="Enter email" />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Enter password" className="pr-10" />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? <><Loader2 className="animate-spin mr-2 h-4 w-4" />Signing In...</> : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gray-100 rounded-lg text-xs">
              <p className="font-medium mb-2">Demo Credentials:</p>
              <p><strong>Patient:</strong> patient@demo.com / password123</p>
              <p><strong>Doctor:</strong> doctor@demo.com / password123</p>
            </div>

            <div className="text-center mt-4 text-sm">
              Don't have an account? <Link to="/register" className="text-blue-600 hover:underline font-medium">Sign up here</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

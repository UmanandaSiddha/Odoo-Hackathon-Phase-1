import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { useAuth } from '@/features/auth/AuthContext';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Loader2, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import '@/styles/animations.css';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { registerUser } from '@/store/slice/auth.slice';

const registerSchema = z.object({
  firstName: z.string().min(2, "Name must be at least 2 characters"),
  lastName: z.string().min(2, "last name must be at least 2 characters"),
  username: z.string().min(2, "username must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { loading, error, user } = useAppSelector((state) => state.auth);
    
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    // Navigate to onboarding once registration is successful and user is set
    useEffect(() => {
        if (user) {
            navigate('/onboarding');
        }
    }, [user, navigate]);

    const onSubmit = (data: RegisterFormData) => {
        dispatch(registerUser(data));
    };


  // const [error, setError] = useState('');
  // const [showPassword, setShowPassword] = useState(false);
  // // const { login } = useAuth();
  // const navigate = useNavigate();
  
  // const {
  //   register,
  //   handleSubmit,
  //   formState: { errors, isSubmitting },
  // } = useForm<RegisterFormData>({
  //   resolver: zodResolver(registerSchema),
  // });

  // const onSubmit = async (data: RegisterFormData) => {
  //   try {
  //     setError('');
  //     const response = await axios.post('http://localhost:8000/api/v1/auth/register', data);
  //     const { user, accessToken } = response.data;
  //     // login(accessToken, user);
  //     navigate('/onboarding');
  //   } catch (err: any) {
  //     if (err.response?.data?.errors) {
  //       // Handle Zod validation errors from the server
  //       setError(err.response.data.errors.map((e: any) => e.message).join(', '));
  //     } else {
  //       setError(err.response?.data?.message || 'Failed to create account');
  //     }
  //   }
  // };

  const formFields = [
    {
      name: 'firstName' as const,
      type: 'text',
      placeholder: 'First Name',
      icon: User,
      delay: 0.1,
    },
    {
      name: 'lastName' as const,
      type: 'text',
      placeholder: 'Last Name',
      icon: User,
      delay: 0.2,
    },
    {
      name: 'username' as const,
      type: 'text',
      placeholder: 'Username',
      icon: User,
      delay: 0.3,
    },
    {
      name: 'email' as const,
      type: 'email',
      placeholder: 'Email',
      icon: Mail,
      delay: 0.4,
    },
    {
      name: 'password' as const,
      type: showPassword ? 'text' : 'password',
      placeholder: 'Password',
      icon: Lock,
      showPasswordToggle: true,
      delay: 0.5,
    },
  ];

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Enter your details to get started"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {formFields.map((field) => (
          <motion.div
            key={field.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: field.delay }}
            className="space-y-2"
          >
            <div className="relative input-focus-ring">
              <Input
                type={field.type}
                placeholder={field.placeholder}
                {...register(field.name)}
                className={`pl-10 ${field.showPasswordToggle ? 'pr-10' : ''} ${
                  errors[field.name] ? 'border-destructive' : ''
                }`}
              />
              <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              {field.showPasswordToggle && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
            <AnimatePresence mode="wait">
              {errors[field.name] && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-destructive"
                >
                  {errors[field.name]?.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-destructive/10 text-destructive text-sm p-3 rounded-md"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            type="submit"
            className="w-full relative overflow-hidden group"
            disabled={loading}
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-primary"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                </motion.div>
              ) : (
                <motion.span
                  key="text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Create account
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-center text-muted-foreground"
        >
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary hover:underline focus:outline-none focus:underline"
          >
            Sign in
          </Link>
        </motion.p>
      </form>
    </AuthLayout>
  );
}; 
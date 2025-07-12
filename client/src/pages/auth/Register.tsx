import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth/AuthContext';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Loader2, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import '@/styles/animations.css';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register = () => {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('');
      const response = await axios.post('/api/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      const { token, user } = response.data;
      login(token, user);
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account');
    }
  };

  const formFields = [
    {
      name: 'name' as const,
      type: 'text',
      placeholder: 'Full Name',
      icon: User,
      delay: 0.1,
    },
    {
      name: 'email' as const,
      type: 'email',
      placeholder: 'Email',
      icon: Mail,
      delay: 0.2,
    },
    {
      name: 'password' as const,
      type: showPassword ? 'text' : 'password',
      placeholder: 'Password',
      icon: Lock,
      showPasswordToggle: true,
      delay: 0.3,
    },
    {
      name: 'confirmPassword' as const,
      type: showConfirmPassword ? 'text' : 'password',
      placeholder: 'Confirm Password',
      icon: Lock,
      showPasswordToggle: true,
      isConfirmPassword: true,
      delay: 0.4,
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
                  onClick={() =>
                    field.isConfirmPassword
                      ? setShowConfirmPassword(!showConfirmPassword)
                      : setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {(field.isConfirmPassword ? showConfirmPassword : showPassword) ? (
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
            disabled={isSubmitting}
          >
            <AnimatePresence mode="wait">
              {isSubmitting ? (
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
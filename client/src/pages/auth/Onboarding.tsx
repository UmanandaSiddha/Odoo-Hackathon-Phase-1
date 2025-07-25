import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth/AuthContext';
import { Loader2, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import '@/styles/animations.css';

const steps = [
  {
    id: 'profile',
    title: 'Complete your profile',
    description: 'Tell us a bit about yourself',
    icon: '👤',
  },
  {
    id: 'skills',
    title: 'Your skills',
    description: 'What skills can you share with others?',
    icon: '🎯',
  },
  {
    id: 'interests',
    title: 'Learning interests',
    description: 'What skills would you like to learn?',
    icon: '📚',
  },
  {
    id: 'availability',
    title: 'Your availability',
    description: 'When are you available for skill swaps?',
    icon: '📅',
  },
];

export const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    skills: [] as string[],
    interests: [] as string[],
    availability: {
      weekdays: false,
      weekends: false,
      mornings: false,
      afternoons: false,
      evenings: false,
    },
  });
  
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStepClick = (index: number) => {
    if (index < currentStep) {
      setCurrentStep(index);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      await axios.post('/api/users/onboarding', formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <div className="relative input-focus-ring">
                <textarea
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none relative z-10"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <div className="relative input-focus-ring">
                <Input
                  placeholder="Where are you based?"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
          </motion.div>
        );
      
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Skills</label>
              <div className="flex flex-wrap gap-2">
                {['Programming', 'Design', 'Marketing', 'Writing', 'Music'].map((skill) => (
                  <motion.div
                    key={skill}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant={formData.skills.includes(skill) ? 'default' : 'outline'}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          skills: prev.skills.includes(skill)
                            ? prev.skills.filter(s => s !== skill)
                            : [...prev.skills, skill],
                        }));
                      }}
                      className="relative overflow-hidden group"
                    >
                      <span className="relative z-10">{skill}</span>
                      {formData.skills.includes(skill) && (
                        <motion.span
                          layoutId="skillHighlight"
                          className="absolute inset-0 bg-primary opacity-10"
                          transition={{ type: "spring", bounce: 0.2 }}
                        />
                      )}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Skills You Want to Learn</label>
              <div className="flex flex-wrap gap-2">
                {['Programming', 'Design', 'Marketing', 'Writing', 'Music'].map((skill) => (
                  <motion.div
                    key={skill}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant={formData.interests.includes(skill) ? 'default' : 'outline'}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          interests: prev.interests.includes(skill)
                            ? prev.interests.filter(s => s !== skill)
                            : [...prev.interests, skill],
                        }));
                      }}
                      className="relative overflow-hidden group"
                    >
                      <span className="relative z-10">{skill}</span>
                      {formData.interests.includes(skill) && (
                        <motion.span
                          layoutId="interestHighlight"
                          className="absolute inset-0 bg-primary opacity-10"
                          transition={{ type: "spring", bounce: 0.2 }}
                        />
                      )}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">When are you available?</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(formData.availability).map(([key, value]) => (
                  <motion.div
                    key={key}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant={value ? 'default' : 'outline'}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          availability: {
                            ...prev.availability,
                            [key]: !value,
                          },
                        }));
                      }}
                      className="w-full relative overflow-hidden group"
                    >
                      <span className="relative z-10">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                      {value && (
                        <motion.span
                          layoutId="availabilityHighlight"
                          className="absolute inset-0 bg-primary opacity-10"
                          transition={{ type: "spring", bounce: 0.2 }}
                        />
                      )}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full bg-primary/5"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full bg-primary/5"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="w-full max-w-2xl space-y-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 text-center"
        >
          <h1 className="text-3xl font-bold">Welcome, {user?.name}!</h1>
          <p className="text-muted-foreground">Let's set up your profile</p>
        </motion.div>

        {/* Step indicator */}
        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2" />
          <div className="relative z-10 flex justify-between">
            {steps.map((step, index) => (
              <motion.button
                key={step.id}
                onClick={() => handleStepClick(index)}
                className={`flex flex-col items-center space-y-2 relative ${
                  index <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                }`}
                whileHover={index <= currentStep ? { scale: 1.05 } : {}}
                whileTap={index <= currentStep ? { scale: 0.95 } : {}}
              >
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg relative ${
                    index < currentStep
                      ? 'bg-primary text-primary-foreground'
                      : index === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                  animate={{
                    scale: index === currentStep ? 1.1 : 1,
                    backgroundColor: index <= currentStep ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                  }}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </motion.div>
                <span className="text-xs font-medium absolute -bottom-6 whitespace-nowrap">
                  {step.title}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-lg p-6 space-y-6 relative overflow-hidden backdrop-blur-sm bg-opacity-50 border border-border">
          {/* Card shine effect */}
          <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent shine-effect" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{steps[currentStep].title}</h2>
            <p className="text-sm text-muted-foreground">
              {steps[currentStep].description}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="relative overflow-hidden group"
            >
              <ChevronLeft className="mr-2 h-4 w-4 relative z-10" />
              <span className="relative z-10">Back</span>
              <motion.span
                className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity"
                initial={false}
              />
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="relative overflow-hidden group"
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
                    <motion.div
                      key="complete"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center"
                    >
                      <span className="relative z-10">Complete</span>
                      <Check className="ml-2 h-4 w-4 relative z-10" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="relative overflow-hidden group"
              >
                <motion.div
                  className="flex items-center"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <span className="relative z-10">Next</span>
                  <ChevronRight className="ml-2 h-4 w-4 relative z-10" />
                </motion.div>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 
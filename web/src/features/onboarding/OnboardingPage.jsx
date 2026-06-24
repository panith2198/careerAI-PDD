import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { HugeiconsIcon } from '@hugeicons/react';
import { 
  SparklesIcon, 
  BrainIcon, 
  ArrowRight01Icon, 
  ArrowLeft01Icon, 
  RouteIcon, 
  Briefcase01Icon, 
  RocketIcon, 
  ChatBotIcon 
} from '@hugeicons/core-free-icons';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import StepIndicator from './StepIndicator';
import SlideContainer from './SlideContainer';
import CareerInterestChips from './CareerInterestChips';
import WorkModeSelector from './WorkModeSelector';
import SalarySlider from './SalarySlider';
import { updateUserProfile } from './onboarding.api';

// Floating AI glowing particles background effect
const FloatingParticles = ({ count = 12 }) => {
  const particles = Array.from({ length: count });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((_, i) => {
        const size = Math.random() * 4 + 2;
        const color = Math.random() > 0.5 ? '#8B5CF6' : '#22D3EE';
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: color,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.2 + 0.05,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 4 + 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = next, -1 = back

  // State values across onboarding wizard
  const [experienceLevel, setExperienceLevel] = useState('Beginner');
  const [goal, setGoal] = useState('Learn new skills');
  const [careerInterests, setCareerInterests] = useState([]);
  const [preferredWorkMode, setPreferredWorkMode] = useState('remote');
  const [expectedSalary, setExpectedSalary] = useState(800000);

  // Profile update PUT request mutation
  const onboardingMutation = useMutation({
    mutationFn: async (payload) => {
      return await updateUserProfile(payload);
    },
    onSuccess: () => {
      toast.success('Your AI career profile has been personalized successfully!');
      navigate('/dashboard');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update onboarding preferences. Please try again.');
    },
  });

  const handleNext = () => {
    if (step < 4) {
      setDirection(1);
      setStep((prev) => prev + 1);
    } else {
      // Final step submit
      onboardingMutation.mutate({
        career_interests: careerInterests,
        preferred_work_mode: preferredWorkMode,
        expected_salary: expectedSalary,
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    toast.info('Onboarding skipped. You can personalize your goals anytime in settings.');
    navigate('/dashboard');
  };

  return (
    <div className="h-screen w-full bg-[#060608] flex items-center justify-center relative overflow-hidden font-sans text-foreground select-none">
      {/* Subtle AI Grid Overlay (linear gradient structure at 5% opacity) */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#8B5CF6]/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#22D3EE]/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Floating particles */}
      <FloatingParticles count={12} />

      {/* Top right Skip button */}
      {step < 4 && (
        <button
          type="button"
          onClick={handleSkip}
          disabled={onboardingMutation.isPending}
          className="absolute top-4 right-6 text-sm font-semibold text-[#9D99B8] hover:text-[#8B5CF6] transition-colors bg-transparent border-0 cursor-pointer select-none outline-none z-20"
        >
          Skip for now
        </button>
      )}

      {/* Main Container */}
      <div className="z-10 w-full max-w-[860px] px-4 py-4 flex flex-col gap-4 items-center justify-center h-[96vh] md:h-auto">
        {/* Progress bar indicator */}
        <StepIndicator currentStep={step} totalSteps={4} />

        {/* Wizard card container */}
        <div className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-5 md:p-8 shadow-[0_0_60px_rgba(139,92,246,0.15)] overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {step === 1 && (
              <SlideContainer direction={direction} slideKey="welcome" key="step1">
                <div className="flex flex-col items-center text-center gap-4 py-2 select-none">
                  {/* Glowing Welcome Icon Circle */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
                    className="size-14 rounded-full bg-gradient-to-br from-[#8B5CF6]/20 to-[#22D3EE]/20 border border-violet-400/30 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                  >
                    <HugeiconsIcon icon={SparklesIcon} className="size-7 text-[#A78BFA]" strokeWidth={2} />
                  </motion.div>

                  {/* Gradient Welcome Heading */}
                  <h1 
                    className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#6D28D9] to-[#A78BFA] bg-clip-text text-transparent leading-tight"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    Let's personalize<br />your AI career journey
                  </h1>

                  {/* Subtext description */}
                  <p className="max-w-md text-sm text-[#9D99B8] leading-relaxed">
                    Answer a few questions so AI can understand your goals and create better recommendations.
                  </p>
                </div>
              </SlideContainer>
            )}

            {step === 2 && (
              <SlideContainer direction={direction} slideKey="background" key="step2">
                <div className="flex flex-col gap-4 py-1 select-none">
                  <h2 
                    className="text-xl font-bold text-[#EEEAF8] tracking-tight text-center md:text-left animate-fade-in"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    Tell us about your experience
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['Student', 'Beginner', 'Intermediate', 'Professional'].map((level) => {
                      const isSelected = experienceLevel === level;
                      return (
                        <motion.div
                          key={level}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setExperienceLevel(level)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'bg-violet-500/10 border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.2)] text-white'
                              : 'bg-[#161525] border-white/10 hover:border-white/20 text-[#9D99B8]'
                          }`}
                        >
                          <h3 className="font-bold text-sm text-[#EEEAF8]">{level}</h3>
                          <p className="text-[11px] text-[#5C5A78] mt-0.5 leading-normal">
                            {level === 'Student' && 'Currently enrolled in an academic or training program'}
                            {level === 'Beginner' && 'Less than 1-2 years of industry experience'}
                            {level === 'Intermediate' && 'Solid hands-on foundation with 2-5 years experience'}
                            {level === 'Professional' && 'Senior developer or leadership role with 5+ years experience'}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </SlideContainer>
            )}

            {step === 3 && (
              <SlideContainer direction={direction} slideKey="goals" key="step3">
                <div className="flex flex-col gap-4 py-1 select-none">
                  <h2 
                    className="text-xl font-bold text-[#EEEAF8] tracking-tight text-center md:text-left"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    What are you aiming for?
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { id: 'Learn new skills', label: 'Learn new skills', icon: RouteIcon },
                      { id: 'Switch career', label: 'Switch career', icon: RouteIcon },
                      { id: 'Get a better job', label: 'Get a better job', icon: Briefcase01Icon },
                      { id: 'Build projects', label: 'Build projects', icon: RocketIcon },
                      { id: 'Prepare interviews', label: 'Prepare interviews', icon: ChatBotIcon },
                    ].map((g) => {
                      const isSelected = goal === g.id;
                      return (
                        <motion.div
                          key={g.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setGoal(g.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3 transition-all duration-200 ${
                            isSelected
                              ? 'bg-violet-500/10 border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                              : 'bg-[#161525] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className={`size-8 shrink-0 rounded-lg flex items-center justify-center border ${
                            isSelected ? 'bg-violet-500/20 border-violet-400 text-white' : 'bg-white/5 border-white/10 text-[#9D99B8]'
                          }`}>
                            <HugeiconsIcon icon={g.icon} className="size-4" strokeWidth={2} />
                          </div>
                          <span className="font-bold text-xs text-[#EEEAF8]">{g.label}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </SlideContainer>
            )}

            {step === 4 && (
              <SlideContainer direction={direction} slideKey="preferences" key="step4">
                <div className="flex flex-col gap-3 py-0.5 select-none">
                  <h2 
                    className="text-xl font-bold text-[#EEEAF8] tracking-tight text-center md:text-left"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    Personalization setup
                  </h2>

                  {/* Career Interests Multi-select Chips */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-[#9D99B8]">Career Interests</span>
                    <CareerInterestChips selectedInterests={careerInterests} onChange={setCareerInterests} />
                  </div>

                  {/* Work Mode radio selector */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-[#9D99B8]">Work Mode Preference</span>
                    <WorkModeSelector selectedMode={preferredWorkMode} onChange={setPreferredWorkMode} />
                  </div>

                  {/* Expected Salary Slider */}
                  <SalarySlider value={expectedSalary} onChange={setExpectedSalary} />
                </div>
              </SlideContainer>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="w-full flex items-center justify-between mt-4 gap-4 max-w-md">
          {step > 1 ? (
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="flex-1"
            >
              <Button
                type="button"
                onClick={handleBack}
                disabled={onboardingMutation.isPending}
                className="w-full h-12 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-xs font-semibold rounded-xl text-[#EEEAF8] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" strokeWidth={2.5} />
                <span>Back</span>
              </Button>
            </motion.div>
          ) : (
            /* Spacer to keep Next button aligned to the right on page 1 */
            <div className="flex-1" />
          )}

          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="flex-1"
          >
            <Button
              type="button"
              onClick={handleNext}
              disabled={onboardingMutation.isPending}
              className="w-full h-12 bg-gradient-to-r from-[#6D28D9] to-[#A78BFA] text-white hover:brightness-110 transition-all shadow-[0_4px_25px_rgba(109,40,217,0.35)] border-0 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {onboardingMutation.isPending ? (
                <>
                  <Spinner className="size-4 text-white" />
                  <span>Building Profile...</span>
                </>
              ) : step === 4 ? (
                <span>Complete Setup</span>
              ) : (
                <>
                  <span>Continue</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2.5} />
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

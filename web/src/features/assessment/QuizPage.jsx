import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useBlocker, useBeforeUnload } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { getAssessments } from './assessment.api';
import { startAssessmentSession, submitSessionAnswer, submitAssessmentSession } from './quiz.api';
import QuizTimer from './QuizTimer';
import QuizProgress from './QuizProgress';
import QuestionCard from './QuestionCard';

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Local state coordination
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [direction, setDirection] = useState(1);
  
  const [sessionTimeLimit, setSessionTimeLimit] = useState(600); // default 10 minutes
  const [questionStartTime, setQuestionStartTime] = useState(null);
  
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saved'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Load assessment lists to find the matching metadata (like the assessment title)
  const { data: assessmentsData } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => getAssessments()
  });

  const currentAssessment = assessmentsData?.items?.find(
    (a) => a.assessment_id === parseInt(id)
  );

  // 2. Session start mutation
  const startMutation = useMutation({
    mutationFn: () => startAssessmentSession(id),
    onSuccess: (data) => {
      setSessionId(data.session_id);
      setQuestions([data.first_question]);
      setSessionTimeLimit(data.time_limit_seconds || 600);
      setAnswers({});
      setCurrentIndex(0);
      setQuestionStartTime(Date.now());
    },
    onError: (err) => {
      toast.error('Failed to initialize the assessment session.');
      navigate('/assessments');
    }
  });

  // Start the session on mount
  useEffect(() => {
    if (id) {
      startMutation.mutate();
    }
  }, [id]);

  // 3. Answer saving mutation
  const answerMutation = useMutation({
    mutationFn: ({ questionId, selectedOptionId, timeTakenMs }) =>
      submitSessionAnswer({
        sessionId,
        questionId,
        selectedOptionId,
        timeTakenMs
      }),
    onSuccess: (data) => {
      setSaving(false);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 1200);

      if (data.next_question) {
        // Safe check to avoid adding duplicate questions to the sequence array
        setQuestions((prev) => {
          if (prev.some((q) => q.question_id === data.next_question.question_id)) {
            return prev;
          }
          return [...prev, data.next_question];
        });

        // Automatically slide next after a brief delay for a fluid transition
        setTimeout(() => {
          setDirection(1);
          setCurrentIndex((prev) => prev + 1);
          setQuestionStartTime(Date.now());
        }, 600);
      }
    },
    onError: (err) => {
      setSaving(false);
      toast.error('Failed to sync answer with the server. Please select it again.');
    }
  });

  // 4. Session submit mutation
  const submitMutation = useMutation({
    mutationFn: () => submitAssessmentSession(sessionId),
    onSuccess: () => {
      setIsSubmitting(false);
      // Invalidate the assessment results cache to force fresh reload on the results page
      queryClient.invalidateQueries({ queryKey: ['assessmentResults'] });
      // Route immediately to the results page
      navigate(`/assessments/${sessionId}/result`);
    },
    onError: (err) => {
      setIsSubmitting(false);
      toast.error('Failed to submit the assessment. Please try clicking Submit again.');
    }
  });

  // Interaction handlers
  const handleSelectOption = (optionId) => {
    if (saving || isSubmitting || currentIndex < questions.length - 1) return;

    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return;

    // Track answer locally
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.question_id]: optionId
    }));

    const elapsed = Date.now() - questionStartTime;
    setSaving(true);

    answerMutation.mutate({
      questionId: currentQuestion.question_id,
      selectedOptionId: parseInt(optionId),
      timeTakenMs: elapsed
    });
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    submitMutation.mutate();
  };

  const handleTimeout = () => {
    toast.error('Assessment time limit reached. Finalizing and submitting answers...', {
      duration: 5000
    });
    handleSubmit();
  };

  // Exit Protection Guards
  const isAssessmentActive = sessionId && !isSubmitting && !submitMutation.isSuccess;

  // browser closing / reloads
  useBeforeUnload(
    React.useCallback((event) => {
      if (isAssessmentActive) {
        event.preventDefault();
        event.returnValue = 'Your assessment is active. Leaving now will discard your current progress.';
      }
    }, [isAssessmentActive])
  );

  // inside-app transitions blocker
  const blocker = useBlocker(
    React.useCallback(
      ({ currentLocation, nextLocation }) =>
        isAssessmentActive && currentLocation.pathname !== nextLocation.pathname,
      [isAssessmentActive]
    )
  );

  // Loading Skeleton State
  if (startMutation.isPending) {
    return (
      <div className="fixed inset-0 z-50 bg-[#060608] flex flex-col items-center justify-between text-white p-6 overflow-y-auto">
        <div className="absolute inset-0 bg-[#060608] bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none opacity-50" />
        
        {/* Floating Header Skeleton */}
        <header className="sticky top-0 z-30 w-full bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-2xl px-6 py-4 flex items-center justify-between animate-pulse">
          <div className="h-4 w-40 bg-white/10 rounded" />
          <div className="h-6 w-20 bg-white/10 rounded-lg" />
        </header>

        {/* Main Work Area Skeleton */}
        <div className="flex-1 w-full max-w-7xl flex flex-col justify-center gap-8 py-12 select-none">
          {/* Progress Skeleton */}
          <div className="space-y-2.5 animate-pulse">
            <div className="flex justify-between text-xs">
              <div className="h-3.5 w-28 bg-white/5 rounded" />
              <div className="h-3.5 w-8 bg-white/5 rounded" />
            </div>
            <div className="h-2 bg-white/5 rounded-full" />
          </div>

          {/* Question Card Skeleton */}
          <div className="w-full bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col gap-6 animate-pulse">
            <div className="flex justify-between border-b border-white/5 pb-4">
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-white/15 rounded-full" />
                <div className="h-5 w-16 bg-white/15 rounded-full" />
              </div>
              <div className="h-4 w-12 bg-white/5 rounded" />
            </div>
            
            <div className="space-y-3 py-4">
              <div className="h-6 bg-white/10 rounded w-full" />
              <div className="h-6 bg-white/10 rounded w-4/5" />
            </div>

            <div className="space-y-3 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-white/5 border border-white/5 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="w-full max-w-7xl flex justify-between border-t border-white/5 pt-6 mt-6 animate-pulse select-none">
          <div className="h-10 w-24 bg-white/5 rounded-xl" />
          <div className="h-10 w-32 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const totalQuestions = 5; // Hard limit for the Adaptive MLE quiz model
  const hasSelectedAnswer = currentQuestion && answers[currentQuestion.question_id] !== undefined;
  const isReadOnly = currentIndex < questions.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-[#060608] flex flex-col items-center justify-between text-white overflow-y-auto pb-10">
      {/* Sci-Fi grid pattern background */}
      <div className="absolute inset-0 bg-[#060608] bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_28px] pointer-events-none opacity-60 z-0" />
      
      {/* Giant Violet Background Focus Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-violet-600/10 rounded-full blur-[130px] pointer-events-none z-0" />

      {/* Floating Glass Header */}
      <header className="sticky top-0 z-30 w-full bg-white/[0.02] border-b border-white/10 backdrop-blur-xl px-6 py-4 flex items-center justify-between select-none">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest font-mono">
            AI Skill Certification
          </span>
          <h1 className="text-sm md:text-base font-extrabold text-white tracking-tight leading-none font-sans">
            {currentAssessment?.title || 'Technical Skill Assessment'}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {sessionId && (
            <QuizTimer 
              durationSeconds={sessionTimeLimit} 
              onTimeout={handleTimeout} 
              isPaused={isSubmitting} 
            />
          )}
        </div>
      </header>

      {/* Main assessment exam workspace */}
      <main className="flex-1 w-full max-w-7xl px-4 md:px-6 flex flex-col justify-center gap-8 py-10 relative z-10">
        
        {/* Progress Tracker container */}
        <div className="w-full">
          <QuizProgress currentQuestion={currentIndex + 1} totalQuestions={totalQuestions} />
        </div>

        {/* Dynamic transition Question card wrapper */}
        <div className="relative w-full">
          <QuestionCard
            question={currentQuestion}
            selectedOptionId={currentQuestion ? answers[currentQuestion.question_id] : null}
            onSelect={handleSelectOption}
            questionIndex={currentIndex + 1}
            direction={direction}
            onPrevious={handlePrevious}
            onNext={handleNext}
            isPreviousDisabled={currentIndex === 0 || saving || isSubmitting}
            isNextDisabled={(!hasSelectedAnswer && currentIndex === questions.length - 1) || saving || isSubmitting}
            nextText={currentIndex === totalQuestions - 1 ? 'Submit Assessment' : 'Next Question'}
            saving={saving}
            saveStatus={saveStatus}
            isReadOnly={isReadOnly}
            isSubmitting={isSubmitting}
          />
        </div>
      </main>

      {/* Premium Submit/Completion Overlay */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#060608]/90 backdrop-blur-md flex flex-col items-center justify-center gap-6"
          >
            {/* Spinning radar visualizer */}
            <div className="relative size-24">
              <div 
                className="absolute inset-0 rounded-full border border-dashed border-violet-500/20 animate-spin" 
                style={{ animationDuration: '8s' }} 
              />
              <div 
                className="absolute -inset-2.5 rounded-full border-2 border-t-violet-500 border-r-cyan-400 border-b-transparent border-l-transparent animate-spin" 
                style={{ animationDuration: '1.2s' }} 
              />
              <div className="absolute inset-4 bg-violet-600/10 rounded-full blur-md" />
            </div>

            <div className="text-center space-y-2 z-10 max-w-sm px-6">
              <h2 className="text-lg font-extrabold text-white tracking-tight leading-none">
                Analyzing your performance...
              </h2>
              <p className="text-xs text-[#9D99B8] leading-relaxed">
                Applying Item Response Theory algorithms to estimate latent skills proficiency and identify potential career matches.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit confirmation dialog using Shadcn UI */}
      <AlertDialog open={blocker.state === 'blocked'}>
        <AlertDialogContent className="bg-[#0a0a0f] border border-white/10 text-white rounded-3xl p-6 max-w-md select-none">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-lg font-bold text-white animate-fade-in" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Quit Assessment?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-[#9D99B8] leading-relaxed">
              Are you sure you want to quit this assessment? Your current session progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex items-center gap-3 mt-6">
            <AlertDialogCancel
              onClick={() => blocker.reset()}
              className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-[#A2A0C2] hover:bg-white/10 hover:text-white transition-all font-semibold text-xs cursor-pointer h-10 w-full sm:w-auto"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => blocker.proceed()}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all cursor-pointer h-10 w-full sm:w-auto"
            >
              Quit Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
}

const STEPS = [
  { id: 0, label: 'Sign In' },
  { id: 1, label: 'Address' },
  { id: 2, label: 'Payment' },
  { id: 3, label: 'Done' }
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full max-w-3xl mx-auto mb-8 px-4 sm:px-0">
      <div className="relative flex items-center justify-between">
        {/* Background Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-slate-800 z-0 hidden sm:block" />

        {STEPS.map((step, idx) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 group">
              <div 
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-[#1D9E75] text-white shadow-[0_0_15px_rgba(29,158,117,0.4)]' 
                    : isCurrent 
                    ? 'bg-[#534AB7] text-white shadow-[0_0_15px_rgba(83,74,183,0.4)] ring-4 ring-[#534AB7]/20' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {isCompleted ? <Check size={16} strokeWidth={3} className="sm:w-5 sm:h-5" /> : <span className="text-sm sm:text-base font-medium">{step.id + 1}</span>}
              </div>
              <span 
                className={`text-[10px] sm:text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isCurrent ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>

              {/* Mobile connecting lines */}
              {idx < STEPS.length - 1 && (
                <div 
                  className={`absolute left-[50%] top-4 sm:top-5 -z-10 h-0.5 w-[calc(100vw/3)] sm:w-[calc(768px/3)] transition-colors duration-500 ${
                    isCompleted ? 'bg-[#1D9E75]' : 'bg-slate-800'
                  }`} 
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

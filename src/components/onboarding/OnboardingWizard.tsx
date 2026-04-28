import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Step1CompanyInfo } from "./steps/Step1CompanyInfo";
import { Step2Products } from "./steps/Step2Products";
import { Step3Contacts } from "./steps/Step3Contacts";
import { Step4InviteTeam } from "./steps/Step4InviteTeam";
import { cn } from "@/lib/utils";

interface OnboardingWizardProps {
  onComplete: () => void;
}

const STEPS = [
  { label: "Company",  short: "1" },
  { label: "Products", short: "2" },
  { label: "Contacts", short: "3" },
  { label: "Team",     short: "4" },
];

export const OnboardingWizard = ({ onComplete }: OnboardingWizardProps) => {
  const [step, setStep] = useState(0);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const skip = () => next();

  return (
    <Dialog open modal>
      <DialogContent
        className="sm:max-w-[480px] p-0 gap-0 overflow-hidden"
        // Prevent closing by clicking outside during onboarding
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Progress header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5">
          <h2 className="text-white font-bold text-xl mb-1">Welcome! Let's set things up 🚀</h2>
          <p className="text-blue-100 text-sm">Step {step + 1} of {STEPS.length}</p>

          {/* Step dots */}
          <div className="flex gap-2 mt-4">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 h-1.5 rounded-full transition-all duration-300",
                  i <= step ? "bg-white" : "bg-blue-400"
                )}
              />
            ))}
          </div>

          {/* Step labels */}
          <div className="flex mt-1.5">
            {STEPS.map((s, i) => (
              <div key={i} className="flex-1 text-center">
                <span className={cn(
                  "text-xs transition-all",
                  i === step ? "text-white font-semibold" : "text-blue-300"
                )}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="p-6">
          {step === 0 && <Step1CompanyInfo onNext={next} />}
          {step === 1 && <Step2Products onNext={next} onSkip={skip} />}
          {step === 2 && <Step3Contacts onNext={next} onSkip={skip} />}
          {step === 3 && <Step4InviteTeam onFinish={onComplete} />}
        </div>
      </DialogContent>
    </Dialog>
  );
};

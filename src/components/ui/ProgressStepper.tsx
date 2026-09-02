"use client";

import { memo } from "react";
import { cn } from "@/config/utils";
import { Check } from "@/components/icons";

type StepItemType = {
  title?: string;
  stepNumber: number;
};

type ProgressStepperProps = {
  currentStep: number;
  stepItems: StepItemType[];
};

const ProgressStepper = ({ currentStep, stepItems }: ProgressStepperProps) => {
  return (
    <div className="flex w-full max-w-2xl mx-auto">
      {stepItems.map((step, index) => (
        <ProgressStepperItem
          key={step.stepNumber}
          currentStep={currentStep}
          step={step}
          isFirstStep={index === 0}
          isLastStep={index === stepItems.length - 1}
        />
      ))}
    </div>
  );
};

type ProgressStepperItemProps = {
  currentStep: number;
  step: StepItemType;
  isFirstStep: boolean;
  isLastStep: boolean;
};

const ProgressStepperItem = ({
  currentStep,
  step,
  isFirstStep,
  isLastStep,
}: ProgressStepperItemProps) => {
  const isActive = currentStep >= step.stepNumber;
  const isCurrent = currentStep === step.stepNumber;
  const isCompleted = currentStep > step.stepNumber;

  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <span
        className={cn(
          "text-xs sm:text-sm transition-colors duration-300",
          isCurrent
            ? "text-primary-700 font-semibold"
            : isActive
              ? "text-dark-800 font-semibold"
              : "text-dark-500 font-medium"
        )}
      >
        {step.title}
      </span>

      <div className="flex w-full items-center">
        <div
          className={cn(
            "h-[1.5px] w-1/2 transition-colors duration-300",
            isFirstStep
              ? "bg-transparent"
              : isActive
                ? "bg-primary-300"
                : "bg-white-500"
          )}
        />

        <div
          className={cn(
            "flex items-center justify-center w-8 h-8 shrink-0 rounded-full text-xs font-bold transition-all duration-300",
            isActive
              ? "bg-primary text-white"
              : "bg-white border-[1.5px] border-white-600 text-dark-500",
            isCurrent && "ring-[3px] ring-primary-100"
          )}
          aria-current={isCurrent ? "step" : undefined}
        >
          {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.stepNumber}
        </div>

        <div
          className={cn(
            "h-[1.5px] w-1/2 transition-colors duration-300",
            isLastStep
              ? "bg-transparent"
              : isCompleted
                ? "bg-primary-300"
                : "bg-white-500"
          )}
        />
      </div>
    </div>
  );
};

export default memo(ProgressStepper);

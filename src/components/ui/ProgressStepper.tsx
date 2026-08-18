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
    <div className="flex justify-between w-full max-w-3xl mx-auto">
      {stepItems.map((step, index) => (
        <ProgressStepperItem
          key={step.stepNumber}
          currentStep={currentStep}
          step={step}
          isLastStep={index === stepItems.length - 1}
        />
      ))}
    </div>
  );
};

type ProgressStepperItemProps = {
  currentStep: number;
  step: StepItemType;
  isLastStep: boolean;
};

const getBackgroundColorClass = (isActive: boolean) =>
  isActive ? "bg-primary-500" : "bg-gray-300";

const ProgressStepperItem = ({
  currentStep,
  step,
  isLastStep,
}: ProgressStepperItemProps) => {
  const isActive = currentStep >= step.stepNumber;
  const isCompleted = currentStep > step.stepNumber;

  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="mb-2">
        <span
          className={cn(
            "block text-center text-xs sm:text-sm md:text-base font-medium transition-colors duration-300",
            isActive ? "text-primary-600" : "text-gray-400"
          )}
        >
          {step.title}
        </span>
      </div>

      <div className="flex w-full items-center">
        <div
          className={cn(
            "h-[2px] w-1/2 transition-colors duration-500",
            getBackgroundColorClass(currentStep >= step.stepNumber)
          )}
        ></div>

        <div
          className={cn(
            "flex items-center justify-center text-white text-sm w-9 h-9 shrink-0 rounded-full transition-all duration-500",
            isActive
              ? "bg-primary-500 scale-110 ring-2 ring-primary-100 shadow-md"
              : "bg-gray-300 hover:bg-gray-400 cursor-pointer"
          )}
        >
          {isActive ? <Check className="w-4 h-4" /> : `0${step.stepNumber}`}
        </div>

        <div
          className={cn(
            "h-[2px] w-1/2 transition-all duration-500",
            getBackgroundColorClass(
              currentStep > step.stepNumber || isLastStep ? isActive : false
            )
          )}
        ></div>
      </div>
    </div>
  );
};

export default memo(ProgressStepper);

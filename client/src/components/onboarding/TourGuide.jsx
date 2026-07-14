import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  X,
} from "lucide-react";

export const getTargetRect = (target) => {
  if (!target) return null;

  const element = document.querySelector(`[data-tour="${target}"]`);
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  const isVisible =
    rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < window.innerHeight &&
    rect.left < window.innerWidth;

  if (!isVisible) return null;

  const padding = 8;
  return {
    top: Math.max(rect.top - padding, 8),
    left: Math.max(rect.left - padding, 8),
    width: Math.min(rect.width + padding * 2, window.innerWidth - 16),
    height: Math.min(rect.height + padding * 2, window.innerHeight - 16),
  };
};

function TourGuide({ steps, onClose, titleId = "tour-title" }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const step = steps[currentStep];
  const StepIcon = step.icon || CircleHelp;
  const isLastStep = currentStep === steps.length - 1;

  const updateSpotlight = useCallback(() => {
    setTargetRect(getTargetRect(steps[currentStep].target));
  }, [currentStep, steps]);

  useEffect(() => {
    updateSpotlight();
    const delayedUpdate = window.setTimeout(updateSpotlight, 350);
    const loadedContentUpdate = window.setTimeout(updateSpotlight, 900);
    const contentObserver = new MutationObserver(updateSpotlight);
    contentObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", updateSpotlight);
    window.addEventListener("scroll", updateSpotlight, true);

    return () => {
      window.clearTimeout(delayedUpdate);
      window.clearTimeout(loadedContentUpdate);
      contentObserver.disconnect();
      window.removeEventListener("resize", updateSpotlight);
      window.removeEventListener("scroll", updateSpotlight, true);
    };
  }, [updateSpotlight]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 100 }}>
      <div
        className="fixed inset-0 pointer-events-auto"
        style={{
          zIndex: 100,
          background: targetRect ? "transparent" : "rgba(15, 23, 42, 0.72)",
        }}
        aria-hidden="true"
      />

      {targetRect && (
        <motion.div
          key={step.target}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          }}
          transition={{ duration: 0.25 }}
          className="fixed rounded-xl border-2 pointer-events-none"
          style={{
            zIndex: 101,
            borderColor: "#6366f1",
            boxShadow:
              "0 0 0 9999px rgba(15, 23, 42, 0.72), 0 0 0 5px rgba(99, 102, 241, 0.22)",
          }}
        />
      )}

      <div
        className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 pointer-events-none"
        style={{ zIndex: 110 }}
      >
        <AnimatePresence mode="wait">
          <motion.section
            key={currentStep}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-800 pointer-events-auto"
          >
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700">
              <motion.div
                className="h-full"
                style={{ backgroundColor: "#4f46e5" }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Skip guide"
              className="absolute right-4 top-5 rounded-full p-2 text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6 sm:p-8">
              <div
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg"
                style={{
                  backgroundColor: "#4f46e5",
                  boxShadow: "0 10px 24px rgba(79, 70, 229, 0.28)",
                }}
              >
                <StepIcon className="h-6 w-6" />
              </div>

              <p
                className="mb-2 text-xs font-bold uppercase tracking-widest"
                style={{ color: "#4f46e5" }}
              >
                Step {currentStep + 1} of {steps.length}
              </p>
              <h2
                id={titleId}
                className="pr-8 text-2xl font-bold text-slate-900 dark:text-white"
              >
                {step.title}
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
                {step.description}
              </p>

              <div className="mt-7 flex items-center justify-between gap-3 border-t border-slate-100 pt-5 dark:border-slate-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-500 transition-colors duration-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Skip
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep((value) => value - 1)}
                    disabled={currentStep === 0}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={
                      isLastStep
                        ? onClose
                        : () => setCurrentStep((value) => value + 1)
                    }
                    className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-bold text-white shadow-md transition-all duration-200 hover:brightness-110 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                    style={{ backgroundColor: "#4f46e5" }}
                  >
                    {isLastStep ? "Finish" : "Next"}
                    {!isLastStep && <ChevronRight className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default TourGuide;
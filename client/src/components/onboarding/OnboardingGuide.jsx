import React, { useCallback } from "react";
import {
  FilePlus2,
  Files,
  LayoutDashboard,
  Palette,
  Settings,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";
import { clearGuidePreference } from "../../utils/onboarding";
import TourGuide from "./TourGuide";

const steps = [
  {
    title: "Welcome to your dashboard",
    description:
      "This is your command center for tracking invoice activity, recent documents, and monthly performance at a glance.",
    icon: LayoutDashboard,
    target: "dashboard",
  },
  {
    title: "Create invoices and templates",
    description:
      "Start a new invoice from an airline ticket, prepare a quotation, or build reusable templates for a faster workflow.",
    icon: FilePlus2,
    target: "create-template",
  },
  {
    title: "Manage every document",
    description:
      "Review recent invoices and quotations here, then open the complete list whenever you need to edit, send, or revisit one.",
    icon: Files,
    target: "invoice-section",
  },
  {
    title: "Your profile and settings",
    description:
      "Open Settings from the sidebar to view your profile and access account options available to your role.",
    icon: Settings,
    target: "settings",
  },
  {
    title: "Make AirInvoice yours",
    description:
      "Choose System, Light, or Dark mode in Settings. You are ready to create polished invoices with AirInvoice Pro.",
    icon: Palette,
    target: "settings",
  },
];

function OnboardingGuide({ onClose }) {
  const closeGuide = useCallback(() => {
    const token = localStorage.getItem("token");
    clearGuidePreference();
    onClose();

    if (!token) return;

    fetch(`${API_BASE_URL}/api/user/guide-seen`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Guide update failed with status ${response.status}`);
        }
      })
      .catch((error) => {
        console.error("Unable to mark onboarding guide as seen:", error);
      });
  }, [onClose]);

  return (
    <TourGuide
      steps={steps}
      onClose={closeGuide}
      titleId="onboarding-title"
    />
  );
}

export default OnboardingGuide;

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  hasSeenPageTour,
  preparePageToursForCurrentUser,
} from "../../utils/onboarding";
import PageTourGuide from "./PageTourGuide";
import { pageTours } from "./pageTours";

function PageTourManager({ disabled = false }) {
  const location = useLocation();
  const [tourOpen, setTourOpen] = useState(false);
  const activeTour = pageTours[location.pathname];

  useEffect(() => {
    if (disabled || !activeTour) {
      setTourOpen(false);
      return;
    }

    preparePageToursForCurrentUser();
    setTourOpen(!hasSeenPageTour(activeTour.guideId));
  }, [activeTour, disabled, location.pathname]);

  if (!activeTour || !tourOpen || disabled) return null;

  return (
    <PageTourGuide
      key={activeTour.guideId}
      guideId={activeTour.guideId}
      steps={activeTour.steps}
      onClose={() => setTourOpen(false)}
    />
  );
}

export default PageTourManager;

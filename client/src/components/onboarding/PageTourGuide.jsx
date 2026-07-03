import React, { useCallback } from "react";
import { markPageTourSeen } from "../../utils/onboarding";
import TourGuide from "./TourGuide";

function PageTourGuide({ guideId, steps, onClose }) {
  const completeTour = useCallback(() => {
    markPageTourSeen(guideId);
    onClose();
  }, [guideId, onClose]);

  return (
    <TourGuide
      steps={steps}
      onClose={completeTour}
      titleId={`page-tour-${guideId}`}
    />
  );
}

export default PageTourGuide;

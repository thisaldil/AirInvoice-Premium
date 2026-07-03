// src/utils/onboarding.js
// Small helper around a temporary localStorage flag that tells the
// dashboard whether to open the first-time onboarding guide.
// Backed by the `showGuide` boolean the backend returns on login
// (see authController.js -> recordSuccessfulLogin).

const STORAGE_KEY = "showGuide";
const PAGE_TOUR_PREFIX = "tourSeen:";
const PAGE_TOUR_STORAGE_VERSION = "2";
const PAGE_TOUR_IDS = [
  "new-invoice",
  "new-quotation",
  "templates",
  "invoices-list",
];

const getPageTourKey = (guideId) => {
  const userId = localStorage.getItem("userId") || "guest";
  return `${PAGE_TOUR_PREFIX}${userId}:${guideId}`;
};

const resetPageToursForCurrentUser = () => {
  PAGE_TOUR_IDS.forEach((guideId) => {
    localStorage.removeItem(getPageTourKey(guideId));
    localStorage.removeItem(`${PAGE_TOUR_PREFIX}${guideId}`);
  });
};

export const preparePageToursForCurrentUser = () => {
  try {
    const userId = localStorage.getItem("userId") || "guest";
    const versionKey = `${PAGE_TOUR_PREFIX}${userId}:version`;

    if (localStorage.getItem(versionKey) !== PAGE_TOUR_STORAGE_VERSION) {
      resetPageToursForCurrentUser();
      localStorage.setItem(versionKey, PAGE_TOUR_STORAGE_VERSION);
    }
  } catch (error) {
    console.error("Unable to prepare page tour preferences:", error);
  }
};

/**
 * Call this right after a successful login/signup response.
 * `data` is the raw JSON body returned by the backend
 * (expects a `showGuide` boolean field on it).
 */
export const saveGuidePreference = (data) => {
  try {
    const showGuide =
      typeof data?.showGuide === "boolean"
        ? data.showGuide
        : Number(data?.user?.loginCount) === 1 &&
          data?.user?.hasSeenGuide !== true;

    if (showGuide) {
      resetPageToursForCurrentUser();
      localStorage.setItem(STORAGE_KEY, "true");
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.error("Unable to save onboarding guide preference:", error);
  }
};

/**
 * Used as the initial state for whether the guide overlay should render.
 */
export const shouldShowGuide = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch (error) {
    console.error("Unable to read onboarding guide preference:", error);
    return false;
  }
};

/**
 * Call this on Skip/Finish, on logout, or whenever the guide should no
 * longer be shown for the current session.
 */
export const clearGuidePreference = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Unable to clear onboarding guide preference:", error);
  }
};

export const hasSeenPageTour = (guideId) => {
  try {
    return localStorage.getItem(getPageTourKey(guideId)) === "true";
  } catch (error) {
    console.error(`Unable to read page tour preference for ${guideId}:`, error);
    return false;
  }
};

export const markPageTourSeen = (guideId) => {
  try {
    localStorage.setItem(getPageTourKey(guideId), "true");
  } catch (error) {
    console.error(`Unable to save page tour preference for ${guideId}:`, error);
  }
};

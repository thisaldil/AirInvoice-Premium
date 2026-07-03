// src/utils/onboarding.js
// Small helper around a temporary localStorage flag that tells the
// dashboard whether to open the first-time onboarding guide.
// Backed by the `showGuide` boolean the backend returns on login
// (see authController.js -> recordSuccessfulLogin).

const STORAGE_KEY = "showGuide";

/**
 * Call this right after a successful login/signup response.
 * `data` is the raw JSON body returned by the backend
 * (expects a `showGuide` boolean field on it).
 */
export const saveGuidePreference = (data) => {
  try {
    if (data?.showGuide) {
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
// import { activateBGServices } from "./services.js";

try {
  // sw - is intalled
  self.addEventListener("install", e => {
    console.log("[SW2] Installed.");
  });

  // sw - is activated
  self.addEventListener("activate", e => {
    console.log("[SW2] Activated.");
  });

} catch (err) {
  console.error(err);
}

// import { activateBGServices } from "./services.js";

try {
  // sw - is intalled
  self.addEventListener("install", e => {
    console.log("Service Worker Installed.");
  });

  // sw - is activated
  self.addEventListener("activate", e => {
    console.log("Service Worker Activated.");
  });

  // activateBGServices();

} catch (err) {
  console.error(err);
}

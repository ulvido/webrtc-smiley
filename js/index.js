// service worker registration
if ("serviceWorker" in navigator) {
  // window.addEventListener("load", () => {
  navigator.serviceWorker
    .register("sw.js")
    .then(
      reg => console.log("[SW] Registered ✓"/*, reg*/),
      error => console.log("[SW] Registration failed!", error))
    .catch(console.error);
  // });
} else {
  console.log("[SW] Service Workers NOT Supported!");
}
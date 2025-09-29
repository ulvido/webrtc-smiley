// import { activateBGServices } from "./services.js";

try {
	// sw - is intalled
	self.addEventListener("install", (e) => {
		console.log("[SW2] Installed.");
	});

	// sw - is activated
	self.addEventListener("activate", (e) => {
		console.log("[SW2] Activated.");
	});

	// catch fetch events
	self.addEventListener("fetch", (e) => {
		console.log("[SW2] Fetch event for ", e.request.url);
		// can intercept own requests here
		if (e.request.url.includes("todos/2")) {
			e.respondWith(
				new Response(
					JSON.stringify({
						slm: 2,
						naber: 2,
						title: "değiştirilmiş görev applet tarafından değiştirildi",
						completed: false,
					}),
					{
						headers: { "Content-Type": "application/json" },
					}
				)
			);
		}
		// can NOT intercept main domain requests
		if (e.request.url.includes("todos/1")) {
			console.error("intercept main domain request not possible");
			e.respondWith(
				new Response(
					JSON.stringify({
						slm: 1,
						naber: 1,
						title: "değiştirilmiş görev applet tarafından değiştirildi (değiştiremedi)",
						completed: false,
					}),
					{
						headers: { "Content-Type": "application/json" },
					}
				)
			);
		}
	});
} catch (err) {
	console.error(err);
}

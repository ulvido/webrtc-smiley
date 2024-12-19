self.onconnect = (e) => {
  const port = e.ports[0];

  port.addEventListener("message", (e) => {
    console.log("[SHARED WORKER]", e.data);
    port.postMessage("[SHARED WORKER] shared workerdan response");
  });

  port.start(); // Required when using addEventListener. Otherwise called implicitly by onmessage setter.

  port.postMessage("shared workerdan selamlar");
};

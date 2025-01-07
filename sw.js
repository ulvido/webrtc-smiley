/**
 * SERVICE WORKER
 * high level bir locationda bulunması gerekiyor.
 */

// import { activateBGServices } from "./services.js";

try {
  // sw - is intalled
  self.addEventListener("install", e => {
    console.log("[SW] Installed.");
  });

  // sw - is activated
  self.addEventListener("activate", e => {
    console.log("[SW] Activated.");
  });

  // activateBGServices();

  // I - BROADCAST
  // dikkat herkese gönderiyor. 
  // yeni tab açsan bile eski taba da gönderiyor.
  const broadcast = new BroadcastChannel('channel-123');
  broadcast.postMessage("[BROADCAST SW] den selamlar");
  broadcast.addEventListener("message", e => {
    console.log("[BORADCAST SW] mekanına düştün", e.data);
  })

  // II - CLIENT API
  self.addEventListener("message", e => {
    console.log("[SW] sw mesaj geldi. swdeki abonelik", e);
    // shared workerla iletişim
    e.ports[0]?.addEventListener("message", e => {
      console.log("[SW] shared workerdan geldi")
    })
    e.ports[0]?.postMessage("servisten shareda")
    // to the tab
    e.source.postMessage("Hi client");
    // to all window clients
    self.clients
      .matchAll({ includeUncontrolled: true, type: "window" })
      .then(clients => {
        console.log("CLIENTS", clients);
        if (clients && clients.length) {
          //Respond to last focused tab
          clients.forEach(client => {
            client.postMessage("[SW] to all clients");
          });
        }
      });
    // to worker clients
    self.clients
      .matchAll({ includeUncontrolled: true, type: "worker" })
      .then(workers => {
        console.log("WORKERS", workers);
        if (workers && workers.length) {
          //Respond to last focused tab
          workers.forEach(worker => {
            worker.postMessage("[SW] to workers"); // çalışmıyor
          });
        }
      });

    // III - MESSAGE CHANNEL
    // e.ports[0].postMessage("port hülooo from sw");
    // e.ports[0].addEventListener("message", e => {
    //   console.log("[SW] port mesajı dinleme.", e)
    // })
  });


} catch (err) {
  console.error(err);
}

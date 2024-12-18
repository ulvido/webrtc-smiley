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

  console.log("Service Worker aaaaa.");

  // I - BROADCAST
  // dikkat herkese gönderiyor. 
  // yeni tab açsan bile eski taba da gönderiyor.
  // const broadcast = new BroadcastChannel('channel-123');
  // broadcast.postMessage("[BROADCAST SW] everybody says that:");
  // broadcast.addEventListener("message", e => {
  //   console.log(e.data)
  //   broadcast.postMessage("[BROADCAST SW] coco jambo");
  // })

  // II - CLIENT API
  self.addEventListener("message", e => {
    console.log("[SW] sw mesaj geldi. swdeki abonelik", e);
    e.source.postMessage("Hi client");
    self.clients.matchAll({ includeUncontrolled: true, type: "window" }).then(clients => {
      if (clients && clients.length) {
        //Respond to last focused tab
        clients[0].postMessage("hülooo from sw");
      }
    });

    // III - MESSAGE CHANNEL
    e.ports[0].postMessage("port hülooo from sw");
    e.ports[0].addEventListener("message", e => {
      console.log("[SW] port mesajı dinleme.", e)
    })
  });


} catch (err) {
  console.error(err);
}

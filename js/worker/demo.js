// BROADCAST
// dikkat herkese gönderiyor. 
// yeni tab açsan bile eski taba da gönderiyor.
const broadcast = new BroadcastChannel('channel-123');
broadcast.postMessage("[BROADCAST WORKER] dan selamlar");
broadcast.addEventListener("message", e => {
  console.log("[BROADCAST WORKER] mekanına düştün", e.data)
})


self.addEventListener("message", e => {
  console.log("[WORKER]", e.data);
  postMessage("iyidir sağol");
  // WEBRTC
  // const config = {
  //   iceServers: [{
  //     urls: [
  //       "stun:stun.l.google.com:19302",
  //       // "stun:stun1.l.google.com:19302",
  //       // "stun:stun2.l.google.com:19302",
  //       // "stun:stun3.l.google.com:19302",
  //       // "stun:stun4.l.google.com:19302",
  //     ]
  //   }],
  //   iceCandidatePoolSize: 10,
  // }

  // let pc = new RTCPeerConnection(config);
  // console.log("worker pc", pc)

})

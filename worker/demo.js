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

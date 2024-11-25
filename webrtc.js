// ELEMENTS
const callBtn = document.getElementById("btncall");
const answerBtn = document.getElementById("btnanswer");
const acceptBtn = document.getElementById("btnaccept");
const offerSdpArea = document.getElementById("sdp-offer");
const answerSdpArea = document.getElementById("sdp-answer");
const connectionWrapper = document.querySelector(".wrapper");
const msgWrapper = document.querySelector(".msg-wrapper");
const channelLabel = document.getElementById("datachannel-label");
const messages = document.getElementById("messages");
const emojiBtnList = document.querySelectorAll(".btn-emoji");

// WEBRTC
const config = {
  iceServers: [{
    urls: [
      "stun:stun.l.google.com:19302",
      "stun:stun1.l.google.com:19302",
      "stun:stun2.l.google.com:19302",
      "stun:stun3.l.google.com:19302",
      "stun:stun4.l.google.com:19302",
    ]
  }],
  iceCandidatePoolSize: 10,
}

let pc = new RTCPeerConnection(config);

pc.addEventListener("connectionstatechange", e => {
  console.log("CONNECTION STATE CHANGED TO: ", pc.connectionState)
});

// create offer
const createOffer = () => new Promise(async (resolve, reject) => {
  const offerDescription = await pc.createOffer();
  await pc.setLocalDescription(offerDescription);
  offerSdpArea.value = JSON.stringify(offerDescription);

  pc.addEventListener("icecandidate", e => {
    console.log("ICE Candidate Detected!")
    console.log(e.candidate)
    if (e.candidate) {
      console.log("+ICE Candidate Added.")
      pc.addIceCandidate(e.candidate);
      offerSdpArea.value = JSON.stringify(pc.localDescription);
    }
  });

  return resolve(offerDescription)
});

const createAnswer = (offerSDP) => new Promise(async (resolve, reject) => {
  await pc.setRemoteDescription(JSON.parse(offerSDP)); // set remote connection 

  const answerDescription = await pc.createAnswer();
  await pc.setLocalDescription(answerDescription);
  answerSdpArea.value = JSON.stringify(answerDescription);

  pc.addEventListener("icecandidate", e => {
    console.log("ICE Candidate Detected!")
    console.log(e.candidate)
    if (e.candidate) {
      console.log("+ICE Candidate Added.")
      pc.addIceCandidate(e.candidate);
      answerSdpArea.value = JSON.stringify(pc.localDescription);
    }
  });

  return resolve(answerDescription)
});

const acceptAnswer = (answerSDP) => new Promise(async (resolve, reject) => {
  if (!pc.currentRemoteDescription) {
    await pc.setRemoteDescription(JSON.parse(answerSDP)) // accept connection
  }
  return resolve()
});

pc.addEventListener("signalingstatechange", e => {
  console.log("SIGNAL STATE CHANGED");
  console.log(e);
  console.log(pc.signalingState);
});


// DATACHANNEL
const dc = pc.createDataChannel("papi data channel");

pc.addEventListener("datachannel", event => {
  const dc = event.channel;
  // console.group(dc)

  dc.addEventListener("open", (event) => {
    console.log("DATACHANNEL OPENED", dc);
    msgWrapper.style.visibility = "visible";
    connectionWrapper.style.display = "none";
    channelLabel.innerText = dc.label;
  });

  dc.addEventListener("close", event => {
    console.log("DATACHANNEL CLOSED", dc);
    // ...
  });

  dc.addEventListener("message", e => {
    console.log("received:", e.data);
    messages.innerText += e.data;
    window.scrollTo(0, document.body.scrollHeight);
  })
});

console.log(pc)

// ELEMENT EVENTS
callBtn.addEventListener("click", e => {
  createOffer();
})
answerBtn.addEventListener("click", e => {
  if (!offerSdpArea.value.trim()) {
    alert("offer alanı boş");
    return;
  }
  createAnswer(offerSdpArea.value.trim());
})
acceptBtn.addEventListener("click", e => {
  if (!offerSdpArea.value.trim() && !answerSdpArea.value.trim()) {
    alert("offer veya answer alanı boş olamaz");
    return;
  }
  acceptAnswer(answerSdpArea.value.trim());
})

emojiBtnList.forEach(btn => {
  btn.addEventListener("click", e => {
    messages.innerText += e.target.value;
    window.scrollTo(0, document.body.scrollHeight);
    dc.send(e.target.value)
  })
})

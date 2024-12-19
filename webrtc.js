// ELEMENTS
const createBtn = document.getElementById("btn-create-connection");
const cancelBtn = document.getElementById("btn-cancel-create");
const datachannelBtn = document.getElementById("btn-create-datachannel");
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
const btnCopyOffer = document.getElementById("btn-copy-offer");
const btnCopyAnswer = document.getElementById("btn-copy-answer");
const loader = document.querySelectorAll(".loader");
const clear = document.getElementById("clear");

// opfs working?
// navigator.storage.getDirectory().then(root => {
//   const fileHandle = root.getFileHandle("my first file", {
//     create: true,
//   }).then(console.log).catch(console.error);
// });

// WORKER
const demoWorker = new Worker("worker/demo.js");
demoWorker.addEventListener("message", e => {
  console.log("[MAIN WORKER]", e.data)
})
demoWorker.postMessage("naber worker");

// SHARED WORKER
const sharedWorker = new SharedWorker("worker/shared.js", {
  name: "test-shared-worker",
  credentials: "include",
});
sharedWorker.port.start();
sharedWorker.port.addEventListener("message", e => {
  console.log("[MAIN SHARED WORKER]", e.data)
})
sharedWorker.port.postMessage("naber shared worker");

// I - BROADCAST
// dikkat herkese gönderiyor. 
// yeni tab açsan bile eski taba da gönderiyor.
// const broadcast = new BroadcastChannel('channel-123');
// broadcast.postMessage("[BROADCAST MAIN] ya ya ye");
// broadcast.addEventListener("message", e => {
//   console.log(e.data)
//   console.log("[BROADCAST MAIN] ya ya ye")
// })




// III - MESSAGE CHANNEL
const messageChannel = new MessageChannel();

messageChannel.port1.addEventListener("message", e => {
  console.log("[MAIN] port mesajı geldi. burası main", e);
})

navigator.serviceWorker.ready.then((registration) => {

  registration.active.postMessage(
    "[MAIN] service workera mesaj gönderdim", [sharedWorker.port]
  );

  navigator.serviceWorker.addEventListener("message", (event) => {
    // event is a MessageEvent object
    console.log(`The service worker sent me a message: ${event.data}`);
  });
});



// WEBRTC
const config = {
  iceServers: [{
    urls: [
      "stun:stun.l.google.com:19302",
      // "stun:stun1.l.google.com:19302",
      // "stun:stun2.l.google.com:19302",
      // "stun:stun3.l.google.com:19302",
      // "stun:stun4.l.google.com:19302",
    ]
  }],
  iceCandidatePoolSize: 10,
}

let pc; // peer connection
let dcs = []; // datachannels
let dcMap = {};  // datachannel maps local label : remote label 

const createPeerConnection = config => {
  pc = new RTCPeerConnection(config);

  pc.addEventListener("negotiationneeded", e => {
    console.log("NEGOTIATION NEEDED!", e);
  });

  pc.addEventListener("connectionstatechange", e => {
    console.log("CONNECTION STATE CHANGED TO: ", pc.connectionState);
  });

  pc.addEventListener("signalingstatechange", e => {
    console.log("SIGNAL STATE CHANGED");
    console.log(e);
    console.log(pc.signalingState);
  });

  pc.addEventListener("icecandidate", e => {
    console.log("ICE Candidate Detected!");
    console.log(e.candidate);
    if (e.candidate) {
      if (pc?.localDescription?.type === "offer" && !pc.remoteDescription) return; // remote description yok erroru olmasın diye
      console.log("+ICE Candidate Added.");
      pc.addIceCandidate(e.candidate);

      // complete beklemeden bi yandan bulduğunu eklesin textareaya eklesin.
      if (pc?.localDescription?.type === "offer") {
        offerSdpArea.value = JSON.stringify(pc.localDescription);
      } else {
        answerSdpArea.value = JSON.stringify(pc.localDescription);
      }
    }
  });

  pc.addEventListener("icegatheringstatechange", e => {
    let connection = e.target;

    switch (connection.iceGatheringState) {
      case "gathering":
        /* collection of candidates has begun */
        console.log("GATHERING ICE CANDIDATES...");
        loader.forEach(el => el.style.display = "grid");
        btnCopyOffer.style.display = "none";
        btnCopyAnswer.style.display = "none";
        break;
      case "complete":
        console.log("GATHERING ICE CANDIDATES COMPLETED!");
        loader.forEach(el => el.style.display = "none");
        btnCopyOffer.style.display = "block";
        btnCopyAnswer.style.display = "block";
        /* collection of candidates is finished */
        if (pc?.localDescription?.type === "offer") {
          offerSdpArea.value = JSON.stringify(pc.localDescription);
        } else {
          answerSdpArea.value = JSON.stringify(pc.localDescription);
        }
        break;
    }
  });

  console.log(pc)
}

// create offer
const createOffer = () => new Promise(async (resolve, reject) => {
  const offerDescription = await pc.createOffer();
  await pc.setLocalDescription(offerDescription);
  offerSdpArea.value = JSON.stringify(offerDescription);

  return resolve(offerDescription)
});

const createAnswer = (offerSDP) => new Promise(async (resolve, reject) => {
  await pc.setRemoteDescription(JSON.parse(offerSDP)); // set remote connection 

  const answerDescription = await pc.createAnswer();
  await pc.setLocalDescription(answerDescription);
  answerSdpArea.value = JSON.stringify(answerDescription);

  return resolve(answerDescription)
});

const acceptAnswer = (answerSDP) => new Promise(async (resolve, reject) => {
  if (!pc.currentRemoteDescription) {
    await pc.setRemoteDescription(JSON.parse(answerSDP)) // accept connection
  }
  return resolve()
});

// DATACHANNEL
const createDataChannel = async () => {

  const label = "channel-" + Date.now();
  const dc = await pc.createDataChannel(label);
  dcs.push(dc);

  pc.addEventListener("datachannel", event => {
    const channel = event.channel;

    console.log("DATACHANNEL INITIATED", channel);

    channel.addEventListener("open", (event) => {
      console.log("DATACHANNEL OPENED", channel);
      dcMap[channel.label] = label;
      msgWrapper.style.visibility = "visible";
      channelLabel.innerText = Object.keys(dcMap).map(remoteLabel => `<<${dcMap[remoteLabel]}__${remoteLabel}>>`).join(" | ");
      // channelLabel.innerText = dcs.map(dc => dc.label).join(" | ");
      createBtn.style.display = "block";
      cancelBtn.style.display = "none";
      datachannelBtn.style.display = "none";
      connectionWrapper.style.display = "none";
    });

    channel.addEventListener("close", event => {
      console.log("DATACHANNEL CLOSED", channel);
      // ...
    });

    channel.addEventListener("message", e => {
      console.log("received e:", e);
      console.log("received:", e.data);
      messages.innerText += e.data;
      window.scrollTo(0, document.body.scrollHeight);

      // eğer ana makina ise mesajları forward etsin.
      if (pc?.localDescription?.type === "offer") {
        const senderRemoteLabel = e?.currentTarget?.label;
        const senderlocalLabel = dcMap[senderRemoteLabel] || null;
        if (senderlocalLabel) {
          let otherChannels = dcs.filter(dc => dc.label !== senderlocalLabel);
          if (otherChannels) {
            otherChannels.map(dc => dc.send(e.data));
          }
        }
      }
    })
  });

  console.log(pc)
}

// ELEMENT EVENTS
createBtn.addEventListener("click", e => {
  createBtn.style.display = "none";
  cancelBtn.style.display = "block";
  datachannelBtn.style.display = "block";
  connectionWrapper.style.display = "flex";
  offerSdpArea.value = "";
  answerSdpArea.value = "";
  createPeerConnection(config);
})

cancelBtn.addEventListener("click", e => {
  createBtn.style.display = "block";
  cancelBtn.style.display = "none";
  datachannelBtn.style.display = "none";
  connectionWrapper.style.display = "none";
  pc.close();
});

datachannelBtn.addEventListener("click", e => {
  createDataChannel();
});

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

btnCopyOffer.addEventListener("click", e => {
  offerSdpArea.select();
  offerSdpArea.setSelectionRange(0, 99999); // For mobile devices
  navigator.clipboard.writeText(offerSdpArea.value);
})

btnCopyAnswer.addEventListener("click", e => {
  answerSdpArea.select();
  answerSdpArea.setSelectionRange(0, 99999); // For mobile devices
  navigator.clipboard.writeText(answerSdpArea.value);
})

clear.addEventListener("click", e => {
  messages.innerText = "";
})

emojiBtnList.forEach(btn => {
  btn.addEventListener("click", e => {
    messages.innerText += e.target.value;
    window.scrollTo(0, document.body.scrollHeight);
    // console.log("dcs", dcs);
    for (let i = 0; i < dcs.length; i++) {
      dcs[i].send(e.target.value)
    }
  })
})


// rakamlarla emoji gönderebilsin: 1-6 tuşları
const emojis = ["👋", "👍🏻", "🔥", "😎", "🧿", "🙋🏻‍♂️"]
addEventListener("keydown", (e) => {
  // console.log(e.code)
  // console.log(e.key)
  // console.log(typeof e.key)
  if ((e.key >= "1" && e.key <= "6") && (pc?.connectionState === "connected")) {
    e.preventDefault();
    let emoji = emojis[(parseInt(e.key) - 1)];
    messages.innerText += emoji;
    window.scrollTo(0, document.body.scrollHeight);
    // console.log("dcs", dcs);
    for (let i = 0; i < dcs.length; i++) {
      dcs[i].send(emoji)
    }
  }
  return;
});
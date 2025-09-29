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
const channelList = document.getElementById("datachannel-list");
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

// Origin Private File System
import { createFileListWrapper, refreshLocalList } from "./opfs.js";
document.addEventListener("DOMContentLoaded", (e) => {
	createFileListWrapper({ id: "opfs-local", title: "LOCAL", onRefreshClicked: refreshLocalList });
});

export const createRemoteFileViews = (options = { id: "opfs-remote", files, channelLabel }) => {
	let { id, files, channelLabel } = options;
	// clear
	let ul = document.getElementById(id);
	// TODO clear btn events (memory leak?)
	ul.innerHTML = "";
	// populate
	Object.values(files).forEach((item) => {
		let li = document.createElement("li");
		li.style.marginBottom = "8px";
		// filename text
		let span = document.createElement("span");
		span.innerHTML = item.filename;
		li.appendChild(span);
		// download
		let a = document.createElement("a");
		// a.href = item.url;
		// a.download = item.filename;
		let btn = document.createElement("input");
		btn.type = "button";
		btn.value = "İndir";
		btn.title = "Remote OPFS'den bilgisayarına indir";
		btn.addEventListener("click", () => {
			downloadBuffer = []; // reset buffer - birisi bitmeden diğerine tıkladıysa diye
			dcs
				.filter((dc) => dc.label === channelLabel)[0]
				.send(JSON.stringify({ type: "DOWNLOAD_REQUESTED", payload: { filename: item.filename, url: item.url } }));
		});
		btn.style.marginLeft = "10px";
		btn.style.width = "64px";
		a.appendChild(btn);
		li.appendChild(a);
		// link to file
		a = document.createElement("a");
		// a.href = item.url;
		a.target = "_blank";
		btn = document.createElement("input");
		btn.type = "button";
		btn.value = "Göster";
		btn.title = "Remote OPFS'den göster";
		btn.addEventListener("click", () => {
			downloadBuffer = []; // reset buffer - birisi bitmeden diğerine tıkladıysa diye
			dcs
				.filter((dc) => dc.label === channelLabel)[0]
				.send(JSON.stringify({ type: "VIEW_REQUESTED", payload: { filename: item.filename, url: item.url } }));
		});
		btn.style.marginLeft = "10px";
		btn.style.width = "64px";
		a.appendChild(btn);
		li.appendChild(a);

		ul.appendChild(li);
	});
};

// Message from Service Worker
navigator?.serviceWorker?.addEventListener("message", (event) => {
	console.log("FROM SW Genel Mesaj: ", event.data);
});

// document.addEventListener("click", event => {
//   navigator.serviceWorker.ready.then((registration) => {
//     registration.active.postMessage(
//       { type: "GREET", playload: { msg: "nabersin?" } }
//     );
//   });
// })

// WORKER
if (typeof Worker !== "undefined") {
	console.log("Yes! Web worker support!");

	// -- demo worker
	const demoWorker = new Worker("js/worker/demo.js");
	demoWorker.addEventListener("message", (e) => {
		console.log("[MAIN WORKER]", e.data);
	});
	demoWorker.postMessage("naber worker");
} else {
	console.log("Sorry! No Web Worker support!");
}
//
// -- SHARED WORKER
//
// COMLINK WORKER
// bu kütüphane çok küçük -> 5kb falan.
// workerda tanımladığın bir API'nin
// promise olarak mainden çağırılabilmesini sağlıyor.
import * as Comlink from "./lib/comlink/comlink@4.4.2.min.js";
// andorid chrome SharedWorker desteklemiyor. önce kontrol etmemiz lazım.
if (typeof SharedWorker !== "undefined") {
	console.log("Yes! SharedWorker support!");

	// COMMLINK INIT
	async function init() {
		const worker = new SharedWorker("js/worker/comlink-demo.js", { type: "module" });
		/**
		 * SharedWorkers communicate via the `postMessage` function in their `port` property.
		 * Therefore you must use the SharedWorker's `port` property when calling `Comlink.wrap`.
		 */
		const obj = Comlink.wrap(worker.port); // illa workerla aynı olsun diye obj koymak zorunda değilsin.
		console.log(`[COMLINK] Counter now (about to increment): ${await obj.counter}`);
		await obj.inc();
		console.log(`[COMLINK] Counter: ${await obj.counter}`);
	}
	init();

	// SHARED WORKER SAMPLE
	const sharedWorker = new SharedWorker("js/worker/shared.js", {
		name: "test-shared-worker",
		credentials: "include",
	});
	sharedWorker.port.start();
	sharedWorker.port.addEventListener("message", (e) => {
		console.log("[MAIN SHARED WORKER]", e.data);
	});
	sharedWorker.port.postMessage("naber shared worker");
} else {
	console.log("Sorry! No SharedWorker support!");
}

// I - BROADCAST
// dikkat herkese gönderiyor.
// yeni tab açsan bile eski taba da gönderiyor.
// const broadcast = new BroadcastChannel("channel-123");
// broadcast.postMessage("[BROADCAST MAIN] ya ya ye");
// broadcast.addEventListener("message", e => {
//   console.log("[BROADCAST MAIN] e düştün", e.data)
// })
const broadcast = new BroadcastChannel("opfs");
broadcast.addEventListener("message", (e) => {
	const { type, payload } = JSON.parse(e.data);
	switch (type) {
		case "FILES_REFRESHED":
			for (let i = 0; i < dcs.length; i++) {
				dcs[i].send(JSON.stringify({ type: "REMOTE_FILES_REFRESHED", payload }));
			}
			break;

		default:
			break;
	}
});

// remote'un refresh butonuna tıklandığında
const refreshRemoteList = (channelLabel) => () => {
	dcs
		.filter((dc) => dc.label === channelLabel)[0]
		.send(JSON.stringify({ type: "REFRESH_REQUESTED_FROM_REMOTE", payload: {} }));
};

// III - MESSAGE CHANNEL
// const messageChannel = new MessageChannel();

// messageChannel.port1.addEventListener("message", e => {
//   console.log("[MAIN] port mesajı geldi. burası main", e);
// })

// navigator.serviceWorker.ready.then((registration) => {

//   registration.active.postMessage(
//     "[MAIN] service workera mesaj gönderdim", [sharedWorker.port]
//   );

//   navigator.serviceWorker.addEventListener("message", (event) => {
//     // event is a MessageEvent object
//     console.log(`The service worker sent me a message: ${event.data}`);
//   });
// });

// WEBRTC
const config = {
	iceServers: [
		{
			urls: [
				"stun:stun.l.google.com:19302",
				// "stun:stun1.l.google.com:19302",
				// "stun:stun2.l.google.com:19302",
				// "stun:stun3.l.google.com:19302",
				// "stun:stun4.l.google.com:19302",
			],
		},
	],
	iceCandidatePoolSize: 10,
};

let pc; // peer connection
let dcs = []; // datachannels
let dcMap = {}; // datachannel maps local label : remote label
let downloadBuffer = [];

const createPeerConnection = (config) => {
	pc = new RTCPeerConnection(config);

	pc.addEventListener("negotiationneeded", (e) => {
		console.log("NEGOTIATION NEEDED!", e);
	});

	pc.addEventListener("connectionstatechange", (e) => {
		console.log("CONNECTION STATE CHANGED TO: ", pc.connectionState);
	});

	pc.addEventListener("signalingstatechange", (e) => {
		console.log("SIGNAL STATE CHANGED");
		console.log(e);
		console.log(pc.signalingState);
	});

	pc.addEventListener("icecandidate", (e) => {
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

	pc.addEventListener("icegatheringstatechange", (e) => {
		let connection = e.target;

		switch (connection.iceGatheringState) {
			case "gathering":
				/* collection of candidates has begun */
				console.log("GATHERING ICE CANDIDATES...");
				loader.forEach((el) => (el.style.display = "grid"));
				btnCopyOffer.style.display = "none";
				btnCopyAnswer.style.display = "none";
				break;
			case "complete":
				console.log("GATHERING ICE CANDIDATES COMPLETED!");
				loader.forEach((el) => (el.style.display = "none"));
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

	console.log(pc);
};

// create offer
const createOffer = () =>
	new Promise(async (resolve, reject) => {
		const offerDescription = await pc.createOffer();
		await pc.setLocalDescription(offerDescription);
		offerSdpArea.value = JSON.stringify(offerDescription);

		return resolve(offerDescription);
	});

const createAnswer = (offerSDP) =>
	new Promise(async (resolve, reject) => {
		await pc.setRemoteDescription(JSON.parse(offerSDP)); // set remote connection

		const answerDescription = await pc.createAnswer();
		await pc.setLocalDescription(answerDescription);
		answerSdpArea.value = JSON.stringify(answerDescription);

		return resolve(answerDescription);
	});

const acceptAnswer = (answerSDP) =>
	new Promise(async (resolve, reject) => {
		if (!pc.currentRemoteDescription) {
			await pc.setRemoteDescription(JSON.parse(answerSDP)); // accept connection
		}
		return resolve();
	});

// DATACHANNEL
const createDataChannel = async () => {
	const label = "channel-" + Date.now();
	const dc = await pc.createDataChannel(label);
	dcs.push(dc);

	pc.addEventListener("datachannel", (event) => {
		const channel = event.channel;

		console.log("DATACHANNEL INITIATED", channel);

		channel.addEventListener("open", (event) => {
			console.log("DATACHANNEL OPENED", channel);
			dcMap[channel.label] = {
				localChannelName: label,
				isOffer: pc?.localDescription?.type === "offer" || false,
			};
			msgWrapper.style.visibility = "visible";
			channelList.innerText = ""; // kanal listesini resetledik. hemen altta baştan oluşturacaz.
			Object.keys(dcMap).map((remoteLabel) => {
				let li = document.createElement("li");
				li.style.fontSize = "12px";
				li.innerHTML = `<u>LOCAL</u> ${dcMap[remoteLabel].localChannelName} <strong>><</strong> <u>REMOTE</u> ${remoteLabel}`;
				if (dcMap[remoteLabel].isOffer) {
					li.innerHTML = "<strong>[OFFERER]</strong> " + li.innerHTML;
				} else {
					li.innerHTML = li.innerHTML + " <strong>[OFFERER]</strong>";
				}
				channelList.append(li);
			});
			createBtn.style.display = "block";
			cancelBtn.style.display = "none";
			datachannelBtn.style.display = "none";
			connectionWrapper.style.display = "none";
			createFileListWrapper({
				id: `opfs-remote-${channel.label}`,
				title: `REMOTE [${channel.label}]`,
				onRefreshClicked: refreshRemoteList(label),
			});
			refreshRemoteList(label)();
		});

		channel.addEventListener("close", (event) => {
			console.log("DATACHANNEL CLOSED", channel);
			// ...
		});

		channel.addEventListener("message", (e) => {
			console.log("received e:", e);
			console.log("received:", e.data);

			// INFO:
			// label -> local channel'ın kanal adı
			// e.target.label -> remote channel'ın kanal adı
			// dc -> local channel'ın kendisi
			// channel, e.target -> remote channel'ın kendisi
			// gönderim yaparken kanalın kendi tarafından gönderirsin. yani dc.send(...)
			// console.log("label", label);
			// console.log("e.target.label", e.target.label);
			// console.log("dc", dc);
			// console.log("e.target", e.target);
			// console.log("channel", channel);

			let type, payload;

			if (
				e.data instanceof ArrayBuffer || // blob'u chunk'lara ayırıp gönderdiyse
				e.data instanceof Blob // veya tek seferde bütün bir blob şeklinde gönderdiyse
			) {
				downloadBuffer.push(e.data); // download yapıyoruz demektir. buffer'a ekle.
				return;
			} else {
				let parsed = JSON.parse(e.data);
				type = parsed.type;
				payload = parsed.payload;
			}

			switch (type) {
				case "EMOJI":
					messages.innerText += payload.text;
					// window.scrollTo(0, document.body.scrollHeight);
					break;
				case "REMOTE_FILES_REFRESHED":
					console.log({ payload }, e.currentTarget.label);
					createRemoteFileViews({
						id: "opfs-remote-" + e.currentTarget.label,
						files: payload.opfsFiles,
						channelLabel: label,
					});
					break;
				case "REFRESH_REQUESTED_FROM_REMOTE":
					refreshLocalList();
					break;
				case "DOWNLOAD_REQUESTED":
					// download button clicked from a REMOTE listed file
					fetch(payload.url)
						.then((f) => f.blob())
						.then((blob) => {
							// const chunkSize = 16 * 1024; // 16Kb for cross browser and backwards compatibility
							const chunkSize = 64 * 1024; // 64Kb (firefox ile chrome arasındaki bug fixlenmiş)
							let offset = 0;
							const reader = new FileReader();
							// helper function
							const sendChunk = (event) => {
								// console.log("BEFORE BUFFER: ", dc.bufferedAmount);
								dc.send(event.target.result);
								// console.log("AFTER BUFFER: ", dc.bufferedAmount);
								offset += event.target.result.byteLength;
								if (offset < blob.size) {
									readSlice(offset);
								} else {
									dc.send(
										JSON.stringify({
											type: "DOWNLOAD_COMPLETED",
											payload: {
												name: payload.filename,
												type: blob.type,
												lastModified: blob.lastModified || Date.now(),
											},
										})
									);
								}
							};
							reader.addEventListener("load", (event) => {
								// buffer boşalmamış. bu webrtc'nin kendi limitleriyle alakalı.
								// buffer'ın boşalmasına abone olup gönder.
								if (dc.bufferedAmount > dc.bufferedAmountLowThreshold) {
									dc.onbufferedamountlow = () => {
										dc.onbufferedamountlow = null;
										sendChunk(event);
									};
								} else {
									// buffer sorunu yok, chunk'ı gönder.
									sendChunk(event);
								}
							});
							reader.addEventListener("loadend", (event) => {
								console.log("BLOB READ END: ", event.target.result);
								//
								// NOT: webrtc nin bufferAmountTreshold muhabbeti yüzünden loadend eventini kullanamadık
								// çünkü bitişi bunla bildirirsek şöyle bir sorun çıkıyor.
								// diyelim ki buffer çok seri geldi ve o eventloopta boşalmadı
								// bu sefer biz buffer'ın boşalmasına abone olup gönderiyoruz.
								// o tamam ama bizim talebimizin süreklilik arzettiğini loadend anlamıyor
								// ve eğer ki webrtc bufferAmount meselesine düşersen loadend tetikleniyor.
								// yani bu loadend eventi büyük datalarda pek sağlıklı çalışmıyor.
								//
								// if (event.target.result) { // if ended
								//   console.log("TARGET: ", e.target);
								//   remoteChannelEnd.send(JSON.stringify({ type: "DOWNLOAD_COMPLETED", payload: { name: payload.filename, type: blob.type, lastModified: blob.lastModified || Date.now() } }))
								// }
								// reader.result contains the contents of blob as a typed array
							});
							const readSlice = (o) => {
								console.log("readSlice ", o);
								if (blob.size < chunkSize) {
									// blob chunktan küçükse zaten parçalamaya gerek yok direk oku
									reader.readAsArrayBuffer(blob);
								} else {
									const slice = blob.slice(offset, o + chunkSize); // chunk kadar dilim alıp
									reader.readAsArrayBuffer(slice); // o kadarlığını okuyoruz
								}
							};
							readSlice(0);
						});
					break;
				case "DOWNLOAD_COMPLETED":
					// incoming file from remote peer
					const receivedDownload = new Blob(downloadBuffer, {
						name: payload.name,
						type: payload.type,
						lastModified: payload.lastModified,
					});
					downloadBuffer = []; // reset buffer
					let blobUrlDownload = URL.createObjectURL(receivedDownload);
					const linkDownload = document.createElement("a");
					linkDownload.href = blobUrlDownload;
					linkDownload.download = payload.name;
					linkDownload.click();
					break;
				case "VIEW_REQUESTED":
					// view button clicked from a REMOTE listed file
					// TODO burası download ile aynı sadece completed type değişik. refactor later
					fetch(payload.url)
						.then((f) => f.blob())
						.then((blob) => {
							// const chunkSize = 16 * 1024; // 16Kb for cross browser and backwards compatibility
							const chunkSize = 64 * 1024; // 64Kb (firefox ile chrome arasındaki bug fixlenmiş)
							let offset = 0;
							const reader = new FileReader();
							// helper function
							const sendChunk = (event) => {
								// console.log("BEFORE BUFFER: ", dc.bufferedAmount);
								dc.send(event.target.result);
								// console.log("AFTER BUFFER: ", dc.bufferedAmount);
								offset += event.target.result.byteLength;
								if (offset < blob.size) {
									readSlice(offset);
								} else {
									dc.send(
										JSON.stringify({
											type: "VIEW_COMPLETED",
											payload: {
												name: payload.filename,
												type: blob.type,
												lastModified: blob.lastModified || Date.now(),
											},
										})
									);
								}
							};
							reader.addEventListener("load", (event) => {
								// buffer boşalmamış. bu webrtc'nin kendi limitleriyle alakalı.
								// buffer'ın boşalmasına abone olup gönder.
								if (dc.bufferedAmount > dc.bufferedAmountLowThreshold) {
									dc.onbufferedamountlow = () => {
										dc.onbufferedamountlow = null;
										sendChunk(event);
									};
								} else {
									// buffer sorunu yok, chunk'ı direk gönder.
									sendChunk(event);
								}
							});
							reader.addEventListener("loadend", (event) => {
								//
								// NOT: webrtc nin bufferAmountTreshold muhabbeti yüzünden loadend eventini kullanamadık
								// çünkü bitişi bunla bildirirsek şöyle bir sorun çıkıyor.
								// diyelim ki buffer çok seri geldi ve o eventloopta boşalmadı
								// bu sefer biz buffer'ın boşalmasına abone olup gönderiyoruz.
								// o tamam ama bizim talebimizin süreklilik arzettiğini loadend anlamıyor
								// ve eğer ki webrtc bufferAmount meselesine düşersen loadend tetikleniyor.
								// yani bu loadend eventi büyük datalarda pek sağlıklı çalışmıyor.
								//
								// console.log("BLOB READ END: ", event.target.result);
								// if (event.target.result) { // if ended
								//   console.log("TARGET: ", e.target);
								//   dc.send(JSON.stringify({ type: "VIEW_COMPLETED", payload: { name: payload.filename, type: blob.type, lastModified: blob.lastModified || Date.now() } }))
								// }
								// reader.result contains the contents of blob as a typed array
							});
							const readSlice = (o) => {
								console.log("readSlice ", o);
								const slice = blob.slice(offset, o + chunkSize); // chunk kadar dilim alıp
								reader.readAsArrayBuffer(slice); // o kadarlığını okuyoruz
							};
							readSlice(0);
						});
					break;
				case "VIEW_COMPLETED":
					// incoming file from remote peer
					const receivedView = new Blob(downloadBuffer, {
						name: payload.name,
						type: payload.type,
						lastModified: payload.lastModified,
					});
					downloadBuffer = []; // reset buffer
					let blobUrlView = URL.createObjectURL(receivedView);
					const linkView = document.createElement("a");
					linkView.href = blobUrlView;
					linkView.target = "_blank";
					linkView.click();
					break;

				default:
					break;
			}

			// eğer ana makina ise mesajları diğer makinalara forward etsin.
			if (pc?.localDescription?.type === "offer" && JSON.parse(e.data)?.payload?.meta?.forward) {
				const senderRemoteLabel = e?.currentTarget?.label;
				const senderlocalLabel = dcMap[senderRemoteLabel].localChannelName || null;
				if (senderlocalLabel) {
					let otherChannels = dcs.filter((dc) => dc.label !== senderlocalLabel);
					if (otherChannels) {
						otherChannels.map((dc) => dc.send(e.data));
					}
				}
			}
		});
	});

	console.log(pc);
};

// ELEMENT EVENTS
createBtn.addEventListener("click", (e) => {
	createBtn.style.display = "none";
	cancelBtn.style.display = "block";
	datachannelBtn.style.display = "block";
	connectionWrapper.style.display = "flex";
	offerSdpArea.value = "";
	answerSdpArea.value = "";
	createPeerConnection(config);
});

cancelBtn.addEventListener("click", (e) => {
	createBtn.style.display = "block";
	cancelBtn.style.display = "none";
	datachannelBtn.style.display = "none";
	connectionWrapper.style.display = "none";
	pc.close();
});

datachannelBtn.addEventListener("click", (e) => {
	createDataChannel();
});

callBtn.addEventListener("click", (e) => {
	createOffer();
});

answerBtn.addEventListener("click", (e) => {
	if (!offerSdpArea.value.trim()) {
		alert("offer alanı boş");
		return;
	}
	createAnswer(offerSdpArea.value.trim());
});

acceptBtn.addEventListener("click", (e) => {
	if (!offerSdpArea.value.trim() && !answerSdpArea.value.trim()) {
		alert("offer veya answer alanı boş olamaz");
		return;
	}
	acceptAnswer(answerSdpArea.value.trim());
});

btnCopyOffer.addEventListener("click", (e) => {
	offerSdpArea.select();
	offerSdpArea.setSelectionRange(0, 99999); // For mobile devices
	navigator.clipboard.writeText(offerSdpArea.value);
});

btnCopyAnswer.addEventListener("click", (e) => {
	answerSdpArea.select();
	answerSdpArea.setSelectionRange(0, 99999); // For mobile devices
	navigator.clipboard.writeText(answerSdpArea.value);
});

clear.addEventListener("click", (e) => {
	messages.innerText = "";
});

// emojilere tıklayıp emoji gönderebilsin
emojiBtnList.forEach((btn) => {
	btn.addEventListener("click", (e) => {
		messages.innerText += e.target.value;
		// window.scrollTo(0, document.body.scrollHeight);
		// console.log("dcs", dcs);
		for (let i = 0; i < dcs.length; i++) {
			dcs[i].send(JSON.stringify({ type: "EMOJI", payload: { text: e.target.value, meta: { forward: true } } }));
		}
	});
});

// rakamlarla emoji gönderebilsin: 1-6 tuşları
const emojis = ["👋", "👍🏻", "🔥", "😎", "🧿", "🙋🏻‍♂️"];
addEventListener("keydown", (e) => {
	// console.log(e.code)
	// console.log(e.key)
	// console.log(typeof e.key)
	if (e.key >= "1" && e.key <= "6" && pc?.connectionState === "connected") {
		e.preventDefault();
		let emoji = emojis[parseInt(e.key) - 1];
		messages.innerText += emoji;
		// window.scrollTo(0, document.body.scrollHeight);
		console.log("dcs", dcs);
		// console.log("dcMap", dcMap);
		for (let i = 0; i < dcs.length; i++) {
			dcs[i].send(JSON.stringify({ type: "EMOJI", payload: { text: emoji, meta: { forward: true } } }));
		}
	}
	return;
});

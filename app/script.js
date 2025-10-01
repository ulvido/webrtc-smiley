fetch("https://jsonplaceholder.typicode.com/todos/2")
	.then((response) => response.json())
	.then((json) => console.log(json));

// Speech Synthesis
const syntezSpeech = (text) =>
	new Promise((resolve, reject) => {
		if ("speechSynthesis" in window) {
			console.log("speechSynthesis is supported");
			let utterance = new SpeechSynthesisUtterance(text);
			// let utterance = new SpeechSynthesisUtterance(`Çaylıoğlu Eczanesine hoşgeldiniz.Size nasıl yardımcı olabilirim?`);
			// let utterance = new SpeechSynthesisUtterance(
			// 	`Çaylıoğlu Eczanesine hoşgeldiniz.Size nasıl yardımcı olabilirim? Dilerseniz sesli dilerseniz de dokunmatik yüzey ile komut verebilirsiniz.`
			// );
			utterance.lang = "tr-TR";
			utterance.pitch = 1;
			utterance.rate = 1;
			utterance.volume = 1;
			// utterance.voice = speechSynthesis.getVoices().find((voice) => voice.lang === "tr-TR");
			// wait on voices to be loaded before fetching list
			window.speechSynthesis.onvoiceschanged = function () {
				const voices = synth.getVoices().find((voice) => voice.lang === "tr-TR");
				console.log({ voices });
			};
			const synth = window.speechSynthesis;
			synth.speak(utterance);
			resolve();
		} else {
			console.log("speechSynthesis is not supported");
			resolve();
		}
	});
const textarea = document.getElementById("text-to-speech");
const speakBtn = document.getElementById("speak-btn");

speakBtn.addEventListener("click", async () => {
	await syntezSpeech(textarea.value);
});

// Speech Recognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

console.log({ recognition });
recognition.lang = "tr-TR";
recognition.interimResults = true;
recognition.maxAlternatives = 1;
recognition.continuous = false;

const startBtn = document.getElementById("start-rec-btn");
const resultDiv = document.getElementById("result-rec");

startBtn.addEventListener("click", () => {
	recognition.start();
});

recognition.addEventListener("start", (event) => {
	console.log("Voice recognition started. Speak into the microphone.");
	startBtn.disabled = true;
	startBtn.value = "Listening...";
});

recognition.addEventListener("end", async (event) => {
	console.log("Voice recognition ended.");
	startBtn.disabled = false;
	startBtn.value = "Click to start speech recognition";
	if (
		resultDiv.textContent.toLocaleLowerCase("TR").includes("ilaç") ||
		resultDiv.textContent.toLocaleLowerCase("TR").includes("reçete")
	) {
		textarea.value = "Sizi reçete sırasına ekledim. Bekleme alanına geçebilirsiniz.";
		await syntezSpeech("Sizi reçete sırasına ekledim. Bekleme alanına geçebilirsiniz.");
	}
});

recognition.addEventListener("speechstart", (event) => {
	console.log("Speech has been detected.");
});

recognition.addEventListener("speechend", (event) => {
	console.log("Speech has been ended.");
});

recognition.addEventListener("result", async (event) => {
	const transcript = event.results[0][0].transcript;
	console.log("Transcript: ", transcript);
	resultDiv.textContent = `You said: ${transcript}`;
});

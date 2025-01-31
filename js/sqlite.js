// ELEMENTS
let textarea = document.getElementById("sql");
let btn = document.getElementById("btn-sql-run");
let sqlResult = document.getElementById("sql-result");

let worker;

// WORKER
if (typeof (Worker) !== "undefined") {
  console.log("Yes! Web worker support!");
  // -- db worker
  worker = new Worker("js/worker/db.js", { type: "module" });
  worker.addEventListener("message", e => {
    console.log("[SQLITE]", e.data)
    const { type, payload } = e.data;
    switch (type) {

      case "DB_WORKER_READY":
        console.log("db worker ready. initing db...")
        worker.postMessage({ type: "INIT_DB" });
        break;

      case "DB_INIT_DONE":
        console.log("init db done. db is now ready to accept commands.");
        btn.value = "RUN SQL COMMAND";
        btn.disabled = false;
        break;

      case "RUN_COMMAND_RESULT":
        // console.log("Result rows:", JSON.stringify(resultRows, undefined, 2));
        let result = JSON.stringify(payload.result, undefined, 2);
        sqlResult.innerText += "\n----------------------\n" + result;
        break;

      default:
        break;
    }
  })
} else {
  console.log("Sorry! No Web Worker support!");
}

btn.addEventListener("click", e => {
  sqlResult.innerText = "";
  if (textarea.value.trim()) { // textarea boş değilse
    let commands = textarea.value // teaxareanın içindeki komple yazı
      .trim() // en baş ve sondan boşluk varsa (space) kırp
      .split("\n") // her satırı bir öğe olacak şekinde array yap
      .filter(l => l !== "") // boş satırları sil
      .map(l => l.trim().split(";").filter(l => l !== "")) // komutları aynı satıra yazarsa yine de çalışsın.
      .flat() // üstteki map ile oluşan nested arrayi flatla
      .map(l => l + ";"); // sqlite queryler ; ile biter. her satıra ekle.
    // console.log({ commands });
    // let uniqueCommands = Array.from(new Set(commands));
    // console.log({ uniqueCommands });
    worker.postMessage({ type: "RUN_COMMAND", payload: { commands } });
  }
})

// BROADCAST
// dikkat herkese gönderiyor. 
// yeni tab açsan bile eski taba da gönderiyor.
// const broadcast = new BroadcastChannel('channel-123');
// broadcast.postMessage("[BROADCAST DB WORKER] dan selamlar");
// broadcast.addEventListener("message", e => {
//   console.log("[BROADCAST DB WORKER] mekanına düştün", e.data)
// })
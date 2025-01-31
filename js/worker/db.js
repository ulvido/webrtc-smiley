/**
 * DB WORKER - SQLITE
 */

self.postMessage({ type: "DB_WORKER_READY" })

let db;

self.addEventListener("message", e => {
  console.log("[DB WORKER]", e.data);
  const { type, payload } = e.data;
  switch (type) {
    case "INIT_DB":
      import("../lib/sqlite-wasm-3480000/jswasm/sqlite3.mjs")
        // .then(console.log)
        .then(() => new Promise((resolve, reject) => {
          return sqlite3InitModule({ print: console.log, printErr: console.error })
            .then(sqlite3 => {
              console.log("SQLite3 Initialized!", { sqlite3 });
              const oo = sqlite3?.oo1;
              const capi = sqlite3?.capi;
              console.log("sqlite3 ",
                capi.sqlite3_libversion(),
                capi.sqlite3_sourceid(),
                `OPFS? ==> ${capi.sqlite3_vfs_find("opfs")}`
              );
              db = new oo.OpfsDb("/medkit.db");
              console.log("transient db = ", db.filename);
              db.exec(["PRAGMA journal_mode = wal;", "PRAGMA syncronous = normal;"]);
              resolve({ ok: true })
            })
        }))
        .then(data => {
          console.log("result of init db", data);
          postMessage({ type: "DB_INIT_DONE" });
          // db.exec([
          //   "CREATE TABLE IF NOT EXISTS account(name,age);",
          //   "INSERT INTO account(name,age) values('Ulvi',39),('Özge',32),('Bilge',2);"
          // ]);
        })
        .catch(console.error);

      break;

    case "RUN_COMMAND":
      // sync - run commands ordered 
      for (let i = 0; i < payload.commands.length; i++) {
        const command = payload.commands[i];
        let resultRows = [];
        db.exec({
          sql: command,
          rowMode: 'object',
          resultRows,
        });
        // console.log({ resultRows });
        postMessage({ type: "RUN_COMMAND_RESULT", payload: { result: resultRows } })
      }

      // async - run commands unordered 
      // let allCommandPromises = payload.commands.map(getData);
      // Promise.all(allCommandPromises)
      //   .then((result) => {
      //     // console.log(result);
      //     postMessage({ type: "RUN_COMMAND_RESULT", payload: { result } })
      //   })
      break;
    default:
      break;
  }
});


// helper function 
const getData = (command) => new Promise((resolve, reject) => {
  let resultRows = [];
  db.exec({
    sql: command,
    rowMode: 'object',
    resultRows,
  });
  resolve(resultRows);
})
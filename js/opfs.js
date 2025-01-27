// BROADCAST CHANNEL
const broadcast = new BroadcastChannel("opfs");
broadcast.addEventListener("message", e => {
  const { type, payload } = e.data;
  switch (type) {
    case "FILES_REFRESHED":
      for (let i = 0; i < dcs.length; i++) {
        dcs[i].send(JSON.stringify({ type: "REMOTE_FILES_REFRESHED", payload }));
      }
      break;

    default:
      break;
  }
})

// ELEMENTS
const filesWrapper = document.querySelector(".files-wrapper");
const inputFile = document.getElementById("input-file");
const btnSave = document.getElementById("btn-save");
const filesArea = document.getElementById("files");

let opfsFiles = {};

// WORKER
let worker;

if (typeof (Worker) !== "undefined") {
  console.log("Yes! Web worker support!");

  worker = new Worker("js/worker/opfs-worker.js", { type: "module" });
  worker.addEventListener("message", e => {
    console.log(e.data);
    switch (e.data?.type) {

      case "WORKER_READY":
      case "FILE_SAVED":
      case "FILE_DELETED":
        // refresh file list
        refreshLocalList();
        break;

      case "FILE_FROM_OPFS":
        // opfsFiles[e.data.payload.filename] = e.data.payload;
        // createFileViews({ id: "opfs-local", files: opfsFiles })
        break;

      case "LIST_FILES_DONE":
        opfsFiles = e.data.payload.allFiles;
        createFileViews({ id: "opfs-local", files: opfsFiles });
        // for sending files to remote channels, make them refresh themselves
        broadcast.postMessage(JSON.stringify({ type: "FILES_REFRESHED", payload: { opfsFiles } }));
        break;

      default:
        break;
    }
  });
} else {
  console.log("Sorry! No Web Worker support!");
}

// HELPERS
export const showFiles = () => {
  filesWrapper.style.display = "block"
}

export const hideFiles = () => {
  filesWrapper.style.display = "none"
}

export const createFileListWrapper = (options = { id: "opfs-local", title: "LOCAL", onRefreshClicked: refreshLocalList }) => {
  let { id, title, onRefreshClicked } = options;
  let div = document.createElement("div");
  // title part wrapper (title + refresh button)
  let divTitle = document.createElement("div");
  divTitle.style.display = "flex";
  div.appendChild(divTitle);
  // title
  let h5 = document.createElement("h5");
  h5.innerHTML = title;
  divTitle.appendChild(h5);
  // refresh button
  let btn = document.createElement("input");
  btn.type = "button";
  btn.value = "REFRESH"
  btn.title = "OPFS'den dosyaları çek ve görünümü yenile"
  btn.style.marginLeft = "10px";
  btn.style.width = "64px";
  btn.style.padding = "4px";
  btn.style.fontSize = "9px";
  btn.addEventListener("click", onRefreshClicked);
  divTitle.appendChild(btn);
  // create list holder
  let ul = document.createElement("ul");
  ul.id = id;
  div.appendChild(ul);
  // divider
  let divider = document.createElement("hr")
  div.appendChild(divider);
  // add to parent wrapper
  filesArea.append(div);
}

export const refreshLocalList = () => {
  // clear
  let ul = document.getElementById("opfs-local");
  // TODO clear btn events (memory leak?)
  ul.innerHTML = "";
  // clear memory
  if (0 < Object.keys(opfsFiles).length) {
    Object.values(opfsFiles).map(({ url }) => URL.revokeObjectURL(url));
  };
  if (worker) {
    worker.postMessage({ type: "LIST_FILES" });
  } else {
    console.log("OPFS: Web Worker not supported!");
  }
}

export const createFileViews = (options = { id: "opfs-local", files: opfsFiles }) => {
  let { id, files } = options;
  // clear
  let ul = document.getElementById(id);
  // TODO clear btn events (memory leak?)
  ul.innerHTML = "";
  // populate
  Object.values(files).forEach(item => {
    let li = document.createElement("li");
    li.style.marginBottom = "8px";
    // filename text
    let span = document.createElement("span");
    span.innerHTML = item.filename;
    li.appendChild(span)
    // delete
    let btn = document.createElement("input");
    btn.type = "button";
    btn.value = "Sil"
    btn.title = "Dosyayı Local OPFS'den sil"
    btn.style.marginLeft = "10px";
    btn.style.width = "36px";
    btn.addEventListener("click", _ => {
      worker.postMessage({ type: "DELETE_FILE", payload: { filename: item.filename } })
    });
    li.appendChild(btn);
    // download
    let a = document.createElement("a");
    a.href = item.url;
    a.download = item.filename;
    btn = document.createElement("input");
    btn.type = "button";
    btn.value = "İndir"
    btn.title = "Local OPFS'den bilgisayarına indir"
    btn.style.marginLeft = "10px";
    btn.style.width = "64px";
    a.appendChild(btn);
    li.appendChild(a)
    // link to file
    a = document.createElement("a");
    a.href = item.url;
    a.target = "_blank";
    btn = document.createElement("input");
    btn.type = "button";
    btn.value = "Göster"
    btn.title = "Local OPFS'den göster"
    btn.style.marginLeft = "10px";
    btn.style.width = "64px";
    a.appendChild(btn);
    li.appendChild(a)

    ul.appendChild(li);
  })
}

// EVENTS
self.addEventListener("DOMContentLoaded", e => {
  btnSave.disabled = true;
})

inputFile.addEventListener("change", e => {
  console.log(e.target.files[0])
  if (e.target.files[0]) {
    btnSave.disabled = false;
  } else {
    btnSave.disabled = true;
  }
})

btnSave.addEventListener("click", e => {
  // console.log(e.target.value)
  // console.log(inputFile.value)
  const file = inputFile.files[0];
  let url = URL.createObjectURL(file);
  console.log(url);
  let { name, size, type } = file;
  console.log(name, size, type)
  worker.postMessage({ type: "SAVE_FILE", payload: { url, name, size, type } })
  // clear inputs
  inputFile.value = "";
  btnSave.disabled = true;
})

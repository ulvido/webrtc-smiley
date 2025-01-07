import * as Comlink from "../lib/comlink/comlink@4.4.2.min.js";

const obj = {
  counter: 0,
  inc() {
    this.counter++;
  },
};

/**
 * When a connection is made into this shared worker, expose `obj`
 * via the connection `port`.
 */
onconnect = (e) => {
  const port = e.ports[0];

  Comlink.expose(obj, port);
};

// Single line alternative:
// onconnect = (e) => Comlink.expose(obj, e.ports[0]);
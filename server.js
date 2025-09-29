import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { secureHeaders } from "hono/secure-headers";

// -- server
const app = new Hono();

// middleware - add headers for opfs
app.use(
	"*",
	secureHeaders({
		crossOriginOpenerPolicy: true,
		crossOriginEmbedderPolicy: true,
	})
);

// -- static file serving
app.use("*", serveStatic({ root: "./" }));

// starting the server
const { port } = Bun.serve({
	fetch: app.fetch,
	port: process.env.PORT || 5000, // default: 3000
	tls: {
		key: Bun.file("key.pem"),
		cert: Bun.file("cert.pem"),
	},
});

console.log("Server started on https://localhost:" + port);

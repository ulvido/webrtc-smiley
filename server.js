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

app.get("/", serveStatic({ path: "./index.html" }));

// starting the server
const { port } = Bun.serve({
	fetch: app.fetch,
	port: process.env.PORT || 5000, // default: 3000
	tls: {
		key: Bun.file("example.com+6-key.pem"),
		cert: Bun.file("example.com+6.pem"),
	},
});

console.log("Server started on https://localhost:" + port);

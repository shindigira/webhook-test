// api/[...all].js
import dotenv from "dotenv";
import express from "express";
import { dirname, join } from "path";
import serverless from "serverless-http";
// Only needed for local static serving
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(express.json());

// Optional: serve /public locally so hitting http://localhost:3000/ shows your page.
// On Vercel, /public is auto-served at the root already.
if (!process.env.VERCEL) {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);
	app.use(express.static(join(__dirname, "../public")));
}

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "dev-token";

// Handler functions
const verify = (req, res) => {
	const mode = req.query["hub.mode"];
	const token = req.query["hub.verify_token"];
	const challenge = req.query["hub.challenge"];
	if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
		return res.status(200).send(challenge);
	}
	return res.sendStatus(403);
};

const receive = (req, res) => {
	console.log("Webhook event:", JSON.stringify(req.body, null, 2));
	res.sendStatus(200);
};

// Register routes for both /api/* and /* to handle Vercel catch-all routing
// Vercel's catch-all routes might preserve or strip the /api prefix
app.get("/api/webhook", verify);
app.post("/api/webhook", receive);
app.get("/api/health", (_req, res) => res.status(200).send("ok"));

// Also handle without /api prefix (in case Vercel strips it)
app.get("/webhook", verify);
app.post("/webhook", receive);
app.get("/health", (_req, res) => res.status(200).send("ok"));

// Export serverless handler for Vercel
export default serverless(app);

// Local-only server
if (!process.env.VERCEL) {
	const PORT = process.env.PORT || 3000;
	app.listen(PORT, () => {
		console.log(`Local server: http://localhost:${PORT}`);
		console.log(`Health:       http://localhost:${PORT}/api/health`);
		console.log(
			`Webhook GET:  http://localhost:${PORT}/api/webhook?hub.mode=subscribe&hub.verify_token=dev-token&hub.challenge=1234`,
		);
		console.log(`Webhook POST: http://localhost:${PORT}/api/webhook`);
	});
}

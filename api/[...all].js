// api/[...all].js
import dotenv from "dotenv";
import express from "express";
import serverless from "serverless-http";

dotenv.config();

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "dev-token";

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

// ✅ No /api prefix here
app.get("/webhook", verify);
app.post("/webhook", receive);
app.get("/health", (_req, res) => res.status(200).send("ok"));

export default serverless(app);

// (Optional) local-only listener if you want it:
if (!process.env.VERCEL) {
	const PORT = process.env.PORT || 3000;
	app.listen(PORT, () => {
		console.log(`Local: http://localhost:${PORT}`);
	});
}

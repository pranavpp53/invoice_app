import express from "express";
import cors from "cors";
import "dotenv/config";
import router from "./routes/router.js";
import ConnectDB from "./db/index.js";
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

ConnectDB();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/uploads",express.static(path.join(__dirname, 'uploads')));

app.use("/api", router);

app.all("*", (req, res) => {
  res.status(404).send({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`ZIDNI INVOICE Server is running on port ${PORT}`);
});

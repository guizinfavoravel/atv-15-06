import e from "express";
import 'dotenv/config';
import routes from './routes/routes.js';
import cors from "cors";

const app = e();

app.use(cors());
app.use(e.json());
app.use('/', routes);

app.use(
    "/uploads/images",
    e.static("uploads/images")
);

const SERVER_PORT = process.env.SERVER_PORT;

app.listen(SERVER_PORT, () => {
    console.log(`Servidor rodando em: http://localhost:${SERVER_PORT}`);
})
import 'dotenv/config';
import express from 'express';
import routes from './routes/routes.js';
import { initializeDatabase } from './configs/database.js';

const app = express();

app.use(express.json());
app.use('/', routes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

initializeDatabase().catch(err => {
    console.error("Erro ao inicializar o banco de dados:", err);
    process.exit(1);
});
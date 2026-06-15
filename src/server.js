import 'dotenv/config';
import express from 'express';
import routes from './routes/routes.js';
import { initializeDatabase } from './configs/database.js';


const app = express();


app.use(express.json());
app.use('/', routes);


initializeDatabase().then(() => {
    const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
}).catch(err => {
    console.error("Erro ao inicializar o banco de dados:", err);
});

import 'dotenv/config';
import express from 'express';
import routes from './routes/routes.js';
import { initializeDatabase } from './configs/database.js';

const app = express();

app.use(express.json());
app.use('/', routes);

// const PORT = process.env.PORT || 8080;

// app.listen(PORT, () => {
//     console.log(`Servidor rodando na porta ${PORT}`);
// });

// initializeDatabase().catch(err => {
//     console.error("Erro ao inicializar o banco de dados:", err);
//     process.exit(1);
// });

app.use(
    "/uploads/images",
    express.static("uploads/images")
)

initializeDatabase().then(() => {
    app.listen(process.env.SERVER_PORT, () => {
        console.log(`Servidor rodando na porta ${process.env.SERVER_PORT}`);
    });
}).catch(err => {
    console.error("Erro ao inicializar o banco de dados:", err);
});

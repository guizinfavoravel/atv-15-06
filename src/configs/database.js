import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

class Database {
    static #instance = null;
    #pool = null;

    #createPool() {
        this.#pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            port: process.env.DB_PORT,
            waitForConnections: true,
            connectionLimit: 100,
            queueLimit: 0,
            ssl: {
                rejectUnauthorized: false
            }
        });
    }

    static getInstance() {
        if (!Database.#instance) {
            Database.#instance = new Database();
            Database.#instance.#createPool();
        }
        return Database.#instance;
    }

    getPool() {
        return this.#pool;
    }
}

export const connection = Database.getInstance().getPool();

export async function initializeDatabase() {
    console.log("Inicializando o banco de dados e tabelas...");
    try {
        const tempConnection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
            ssl: { rejectUnauthorized: false }
        });

        const dbName = process.env.DB_DATABASE || 'deploy';

        await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        await tempConnection.query(`USE \`${dbName}\`;`);
        
        await tempConnection.query(`SET FOREIGN_KEY_CHECKS = 0;`);
        await tempConnection.query(`DROP TABLE IF EXISTS itens_pedido;`);
        await tempConnection.query(`DROP TABLE IF EXISTS pedidos;`);
        await tempConnection.query(`DROP TABLE IF EXISTS produtos;`);
        await tempConnection.query(`DROP TABLE IF EXISTS categorias;`);
        await tempConnection.query(`SET FOREIGN_KEY_CHECKS = 1;`);

        await tempConnection.query(`
            CREATE TABLE IF NOT EXISTS categorias (
                id_categoria INT AUTO_INCREMENT PRIMARY KEY,
                nome_categoria VARCHAR(100) NOT NULL,
                descricao_categoria VARCHAR(255)
            ) ENGINE=InnoDB;
        `);

        await tempConnection.query(`
            CREATE TABLE IF NOT EXISTS produtos (
                id_produto INT AUTO_INCREMENT PRIMARY KEY,
                nome_produto VARCHAR(100) NOT NULL,
                descricao_produto TEXT,
                preco_produto DECIMAL(10,2) NOT NULL,
                imagem_produto VARCHAR(255),
                estoque_produto INT NOT NULL DEFAULT 0,
                id_categoria INT NOT NULL,
                CONSTRAINT fk_produtos_categoria
                    FOREIGN KEY (id_categoria)
                    REFERENCES categorias(id_categoria)
                    ON DELETE RESTRICT
                    ON UPDATE CASCADE
            ) ENGINE=InnoDB;
        `);

        await tempConnection.query(`
            CREATE TABLE IF NOT EXISTS pedidos (
                id_pedido INT AUTO_INCREMENT PRIMARY KEY,
                data_pedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                status_pedido ENUM(
                    'PENDENTE',
                    'PAGO',
                    'ENVIADO',
                    'ENTREGUE',
                    'CANCELADO'
                ) NOT NULL DEFAULT 'PENDENTE',
                valor_total DECIMAL(10,2) NOT NULL DEFAULT 0
            ) ENGINE=InnoDB;
        `);

        await tempConnection.query(`
            CREATE TABLE IF NOT EXISTS itens_pedido (
                id_item_pedido INT AUTO_INCREMENT PRIMARY KEY,
                quantidade INT NOT NULL,
                preco_unitario DECIMAL(10,2) NOT NULL,
                subtotal DECIMAL(10,2) GENERATED ALWAYS AS (
                    quantidade * preco_unitario
                ) STORED,
                id_produto INT NOT NULL,
                id_pedido INT NOT NULL,
                CONSTRAINT fk_itens_produto
                    FOREIGN KEY (id_produto)
                    REFERENCES produtos(id_produto)
                    ON DELETE RESTRICT
                    ON UPDATE CASCADE,
                CONSTRAINT fk_itens_pedido
                    FOREIGN KEY (id_pedido)
                    REFERENCES pedidos(id_pedido)
                    ON DELETE CASCADE
                    ON UPDATE CASCADE
            ) ENGINE=InnoDB;
        `);

        await tempConnection.end();
        console.log("Banco de dados e tabelas verificados/criados com sucesso.");
    } catch (error) {
        console.error("Erro ao criar o banco ou as tabelas:", error);
        throw error;
    }
}

export const db = connection;
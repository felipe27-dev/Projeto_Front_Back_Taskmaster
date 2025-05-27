const { Pool } = require("pg");

// Configuração da conexão com o banco de dados PostgreSQL
// Utiliza as informações fornecidas pelo usuário
const pool = new Pool({
  user: "postgres", // Usuário do PostgreSQL
  host: "localhost", // Host do banco (geralmente localhost)
  database: "controle_tarefas", // Nome do banco de dados
  password: "facom", // Senha do usuário
  port: 5432, // Porta padrão do PostgreSQL
});

// Testa a conexão (opcional, mas bom para depuração)
pool.connect((err, client, release) => {
  if (err) {
    return console.error("❌ Erro ao conectar ao banco de dados:", err.stack);
  }
  console.log("✅ Conexão com o banco de dados PostgreSQL estabelecida com sucesso!");
  client.release(); // Libera o cliente de volta para o pool
});

module.exports = pool;


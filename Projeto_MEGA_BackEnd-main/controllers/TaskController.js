const pool = require("../database/db");

// GET /api/tasks - Busca todas as tarefas
const getTasks = async (req, res) => {
  console.log("➡️ GET /api/tasks chamado");
  try {
    // Seleciona todas as colunas, incluindo list_title e o status simplificado
    // Ordena por lista e depois por data de criação para uma visualização mais organizada
    const result = await pool.query("SELECT * FROM tasks ORDER BY list_title, criada_em DESC");
    console.log("✅ Tarefas retornadas com sucesso");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Erro ao buscar tarefas:", err);
    res.status(500).json({ message: "Erro no servidor ao buscar tarefas" });
  }
};

// POST /api/tasks - Cria uma nova tarefa
const createTask = async (req, res) => {
  console.log("➡️ POST /api/tasks chamado");
  // Extrai title, description e list_title do corpo da requisição
  // Status será 'To Do' por padrão (definido no DB e aqui como fallback)
  const { title, description, list_title,delivery_date,priority } = req.body;
  console.log("📥 Dados recebidos:", { title, description, list_title, delivery_date,priority });

  // Validação básica: title é obrigatório
  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "O título da tarefa é obrigatório" });
  }

  // Define o status inicial e a lista (usa padrão do DB se não fornecido)
  const initialStatus = 'To Do';
  const targetList = list_title || 'Backlog'; // Garante que temos uma lista

  try {
    // Insere a nova tarefa no banco, incluindo list_title e status padrão
    const result = await pool.query(
      "INSERT INTO tasks (title, description, status, list_title, delivery_date,priority) VALUES ($1, $2, $3, $4, $5,$6) RETURNING *",
      [title, description || null, initialStatus, targetList, delivery_date,priority || null]
    );
    console.log("✅ Tarefa inserida com sucesso:", result.rows[0]);
    res.status(201).json(result.rows[0]); // Retorna a tarefa criada
  } catch (err) {
    console.error("❌ Erro ao inserir tarefa:", err);
    // Verifica erro de constraint (ex: status inválido, embora o check deva pegar)
    if (err.code === '23514') { // check_violation
        return res.status(400).json({ message: "Status inválido. Use 'To Do' ou 'Done'." });
    }
    res.status(500).json({ message: "Erro no servidor ao inserir tarefa" });
  }
};

// PUT /api/tasks/:id - Atualiza uma tarefa existente (title, description, status, list_title)
const updateTask = async (req, res) => {
  const { id } = req.params;
  // Extrai os campos que podem ser atualizados
  const { title, description, status, list_title } = req.body;
  console.log(`➡️ PUT /api/tasks/${id} chamado`);
  console.log("📥 Dados para atualização:", { title, description, status, list_title });

  // Pelo menos um campo deve ser fornecido para atualização
  if (title === undefined && description === undefined && status === undefined && list_title === undefined) {
    return res.status(400).json({ message: "Nenhum dado fornecido para atualização" });
  }

  // Validação do status, se fornecido
  if (status !== undefined && !['To Do', 'Done'].includes(status)) {
      return res.status(400).json({ message: "Status inválido. Use 'To Do' ou 'Done'." });
  }

  // Constrói a query de atualização dinamicamente
  let query = "UPDATE tasks SET ";
  const values = [];
  let paramIndex = 1;

  if (title !== undefined) {
    query += `title = $${paramIndex++}, `;
    values.push(title);
  }
  if (description !== undefined) {
    query += `description = $${paramIndex++}, `;
    values.push(description);
  }
  if (status !== undefined) {
    query += `status = $${paramIndex++}, `;
    values.push(status);
  }
  if (list_title !== undefined) {
    query += `list_title = $${paramIndex++}, `;
    values.push(list_title);
  }

  // Remove a vírgula e espaço extras no final
  query = query.slice(0, -2);

  // Adiciona a condição WHERE e o RETURNING
  query += ` WHERE id = $${paramIndex} RETURNING *`;
  values.push(id);

  console.log("🔧 Query de atualização:", query);
  console.log("🔢 Valores:", values);

  try {
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Tarefa não encontrada para atualização" });
    }

    console.log(`✅ Tarefa ${id} atualizada com sucesso:`, result.rows[0]);
    res.status(200).json(result.rows[0]); // Retorna a tarefa atualizada
  } catch (err) {
    console.error(`❌ Erro ao atualizar tarefa ${id}:`, err);
     // Verifica erro de constraint (ex: status inválido)
    if (err.code === '23514') { // check_violation
        return res.status(400).json({ message: "Status inválido. Use 'To Do' ou 'Done'." });
    }
    res.status(500).json({ message: "Erro no servidor ao atualizar tarefa" });
  }
};

// DELETE /api/tasks/:id - Deleta uma tarefa (sem alterações necessárias)
const deleteTask = async (req, res) => {
  const { id } = req.params;
  console.log(`➡️ DELETE /api/tasks/${id} chamado`);

  try {
    const result = await pool.query("DELETE FROM tasks WHERE id = $1 RETURNING *", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Tarefa não encontrada para deletar" });
    }

    console.log(`🗑️ Tarefa ${id} apagada com sucesso`);
    res.status(200).json({ message: `Tarefa ${id} apagada com sucesso`, deletedTask: result.rows[0] });
  } catch (err) {
    console.error(`❌ Erro ao apagar tarefa ${id}:`, err);
    res.status(500).json({ message: "Erro no servidor ao apagar tarefa" });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};


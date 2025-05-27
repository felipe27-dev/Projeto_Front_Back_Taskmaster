const express = require("express");
const router = express.Router();
const TaskController = require("../controllers/TaskController");

// Define as rotas da API para tarefas
router.get("/tasks", TaskController.getTasks); // Busca todas as tarefas
router.post("/tasks", TaskController.createTask); // Cria uma nova tarefa
router.put("/tasks/:id", TaskController.updateTask); // Atualiza uma tarefa existente (PUT ou PATCH podem ser usados)
router.delete("/tasks/:id", TaskController.deleteTask); // Deleta uma tarefa

module.exports = router;

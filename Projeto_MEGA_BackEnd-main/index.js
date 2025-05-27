const express = require('express');
const path = require('path');
const cors = require('cors'); // Importa o pacote cors

const taskRoutes = require('./routes/taskRou');
const viewRoutes = require('./routes/viewRoutes');

const app = express();
const port = 3000; // A porta pode precisar ser diferente da porta do frontend (Vite usa 5173 por padrão)

// Middleware CORS - Permite requisições de qualquer origem (ajustar em produção)
app.use(cors());

// Configurar EJS (Manteremos por enquanto, mas as rotas serão desabilitadas depois)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para arquivos estáticos (CSS, JS) - Será ajustado depois para servir o build do React
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para interpretar JSON no corpo das requisições
app.use(express.json());

// Rotas da API (manter)
app.use('/api', taskRoutes); // Prefixo /api para clareza

// Rotas de visualização EJS (serão removidas/desabilitadas)
// app.use('/', viewRoutes); // Comentado por enquanto

app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});


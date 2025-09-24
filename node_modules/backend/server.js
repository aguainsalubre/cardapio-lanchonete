const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));

// Função para ler arquivo JSON
function readJsonFile(filename) {
    try {
        const data = fs.readFileSync(path.join(__dirname, filename), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Erro ao ler arquivo ${filename}:`, error);
        return null;
    }
}

// Função para escrever arquivo JSON
function writeJsonFile(filename, data) {
    try {
        fs.writeFileSync(path.join(__dirname, filename), JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Erro ao escrever arquivo ${filename}:`, error);
        return false;
    }
}

// Rota para listar cardápio
app.get('/cardapio', (req, res) => {
    const cardapio = readJsonFile('cardapio.json');
    
    if (!cardapio) {
        return res.status(500).json({ error: 'Erro ao carregar cardápio' });
    }

    const { nome, categoria } = req.query;
    
    // Se não há filtros, retorna todo o cardápio
    if (!nome && !categoria) {
        return res.json(cardapio);
    }

    let resultados = {};
    
    // Filtrar por categoria se especificada
    const categoriasParaBuscar = categoria ? [categoria] : Object.keys(cardapio);
    
    categoriasParaBuscar.forEach(cat => {
        if (cardapio[cat]) {
            let itens = cardapio[cat];
            
            // Filtrar por nome se especificado
            if (nome) {
                itens = itens.filter(item => 
                    item.nome.toLowerCase().includes(nome.toLowerCase())
                );
            }
            
            if (itens.length > 0) {
                resultados[cat] = itens;
            }
        }
    });
    
    res.json(resultados);
});

// Rota para receber pedidos
app.post('/pedidos', (req, res) => {
    const { nomeCliente, observacoes, itens, total } = req.body;
    
    // Validação básica
    if (!nomeCliente || !itens || itens.length === 0) {
        return res.status(400).json({ 
            error: 'Nome do cliente e itens são obrigatórios' 
        });
    }
    
    // Ler pedidos existentes
    let pedidos = readJsonFile('pedidos.json') || [];
    
    // Criar novo pedido
    const novoPedido = {
        id: Date.now(),
        nomeCliente,
        observacoes: observacoes || '',
        itens,
        total,
        dataHora: new Date().toISOString(),
        status: 'recebido'
    };
    
    // Adicionar novo pedido
    pedidos.push(novoPedido);
    
    // Salvar pedidos
    if (writeJsonFile('pedidos.json', pedidos)) {
        res.status(201).json({ 
            message: 'Pedido recebido com sucesso!',
            pedido: novoPedido
        });
    } else {
        res.status(500).json({ 
            error: 'Erro ao salvar pedido' 
        });
    }
});

// Rota para listar pedidos (para consulta da lanchonete)
app.get('/pedidos', (req, res) => {
    const pedidos = readJsonFile('pedidos.json');
    
    if (!pedidos) {
        return res.status(500).json({ error: 'Erro ao carregar pedidos' });
    }
    
    res.json(pedidos);
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
    console.log('Cardápio disponível em: http://0.0.0.0:3000/cardapio');
    console.log('Para enviar pedidos: POST http://0.0.0.0:3000/pedidos');
});


// Configuração da API
const API_BASE_URL = 'http://localhost:3000';

// Estado da aplicação
let cardapio = {};
let carrinho = [];
let categoriaAtiva = '';

// Elementos DOM
const menuContainer = document.getElementById('menuContainer');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const filterBtns = document.querySelectorAll('.filter-btn');
const cartContainer = document.getElementById('cartContainer');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');
const toggleCartBtn = document.getElementById('toggleCart');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const checkoutForm = document.getElementById('checkoutForm');
const closeModal = document.getElementById('closeModal');
const cancelOrder = document.getElementById('cancelOrder');
const orderSummary = document.getElementById('orderSummary');
const orderTotal = document.getElementById('orderTotal');
const messageContainer = document.getElementById('messageContainer');

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    carregarCardapio();
    configurarEventListeners();
});

// Configurar event listeners
function configurarEventListeners() {
    // Busca
    searchBtn.addEventListener('click', buscarItens);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            buscarItens();
        }
    });
    
    // Filtros de categoria
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const categoria = this.dataset.categoria;
            filtrarPorCategoria(categoria);
            
            // Atualizar botão ativo
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Carrinho
    toggleCartBtn.addEventListener('click', toggleCarrinho);
    checkoutBtn.addEventListener('click', abrirModalCheckout);
    
    // Modal
    closeModal.addEventListener('click', fecharModal);
    cancelOrder.addEventListener('click', fecharModal);
    checkoutForm.addEventListener('submit', enviarPedido);
    
    // Fechar modal clicando fora
    checkoutModal.addEventListener('click', function(e) {
        if (e.target === checkoutModal) {
            fecharModal();
        }
    });
}

// Carregar cardápio da API
async function carregarCardapio() {
    try {
        mostrarMensagem('Carregando cardápio...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/cardapio`);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar cardápio');
        }
        
        cardapio = await response.json();
        exibirCardapio(cardapio);
        
        // Remover mensagem de carregamento
        setTimeout(() => {
            const messages = document.querySelectorAll('.message');
            messages.forEach(msg => msg.remove());
        }, 1000);
        
    } catch (error) {
        console.error('Erro ao carregar cardápio:', error);
        mostrarMensagem('Erro ao carregar cardápio. Tente novamente.', 'error');
    }
}

// Exibir cardápio na tela
function exibirCardapio(dados) {
    menuContainer.innerHTML = '';
    
    if (!dados || Object.keys(dados).length === 0) {
        menuContainer.innerHTML = '<p class="no-results">Nenhum item encontrado.</p>';
        return;
    }
    
    Object.keys(dados).forEach(categoria => {
        if (dados[categoria] && dados[categoria].length > 0) {
            const categorySection = criarSecaoCategoria(categoria, dados[categoria]);
            menuContainer.appendChild(categorySection);
        }
    });
}

// Criar seção de categoria
function criarSecaoCategoria(categoria, itens) {
    const section = document.createElement('div');
    section.className = 'category-section';
    
    const title = document.createElement('h3');
    title.className = 'category-title';
    title.textContent = categoria.charAt(0).toUpperCase() + categoria.slice(1);
    
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'category-items';
    
    itens.forEach(item => {
        const itemElement = criarElementoItem(item);
        itemsContainer.appendChild(itemElement);
    });
    
    section.appendChild(title);
    section.appendChild(itemsContainer);
    
    return section;
}

// Criar elemento de item do cardápio
function criarElementoItem(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'menu-item';
    
    itemDiv.innerHTML = `
        <div class="item-info">
            <div class="item-name">${item.nome}</div>
            <div class="item-description">${item.descricao}</div>
            <div class="item-price">R$ ${item.preco.toFixed(2).replace('.', ',')}</div>
        </div>
        <button class="add-btn" onclick="adicionarAoCarrinho(${item.id})">
            Adicionar
        </button>
    `;
    
    return itemDiv;
}

// Buscar itens
async function buscarItens() {
    const termo = searchInput.value.trim();
    
    if (!termo) {
        carregarCardapio();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/cardapio?nome=${encodeURIComponent(termo)}`);
        
        if (!response.ok) {
            throw new Error('Erro na busca');
        }
        
        const resultados = await response.json();
        exibirCardapio(resultados);
        
    } catch (error) {
        console.error('Erro na busca:', error);
        mostrarMensagem('Erro ao buscar itens. Tente novamente.', 'error');
    }
}

// Filtrar por categoria
async function filtrarPorCategoria(categoria) {
    categoriaAtiva = categoria;
    
    try {
        let url = `${API_BASE_URL}/cardapio`;
        if (categoria) {
            url += `?categoria=${categoria}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Erro ao filtrar');
        }
        
        const resultados = await response.json();
        exibirCardapio(resultados);
        
    } catch (error) {
        console.error('Erro ao filtrar:', error);
        mostrarMensagem('Erro ao filtrar itens. Tente novamente.', 'error');
    }
}

// Adicionar item ao carrinho
function adicionarAoCarrinho(itemId) {
    // Encontrar o item no cardápio
    let item = null;
    
    Object.values(cardapio).forEach(categoria => {
        if (Array.isArray(categoria)) {
            const encontrado = categoria.find(i => i.id === itemId);
            if (encontrado) {
                item = encontrado;
            }
        }
    });
    
    if (!item) {
        mostrarMensagem('Item não encontrado.', 'error');
        return;
    }
    
    // Verificar se o item já está no carrinho
    const itemExistente = carrinho.find(i => i.id === itemId);
    
    if (itemExistente) {
        itemExistente.quantidade++;
    } else {
        carrinho.push({
            ...item,
            quantidade: 1
        });
    }
    
    atualizarCarrinho();
    mostrarMensagem(`${item.nome} adicionado ao carrinho!`, 'success');
}

// Atualizar exibição do carrinho
function atualizarCarrinho() {
    // Atualizar contador
    const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
    cartCount.textContent = totalItens;
    
    // Atualizar lista de itens
    cartItems.innerHTML = '';
    
    if (carrinho.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Carrinho vazio</p>';
        checkoutBtn.disabled = true;
    } else {
        carrinho.forEach(item => {
            const itemElement = criarElementoCarrinho(item);
            cartItems.appendChild(itemElement);
        });
        checkoutBtn.disabled = false;
    }
    
    // Atualizar total
    const total = calcularTotal();
    cartTotal.textContent = total.toFixed(2).replace('.', ',');
}

// Criar elemento do carrinho
function criarElementoCarrinho(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    
    const subtotal = item.preco * item.quantidade;
    
    itemDiv.innerHTML = `
        <div class="cart-item-info">
            <div class="cart-item-name">${item.nome}</div>
            <div class="cart-item-price">R$ ${item.preco.toFixed(2).replace('.', ',')} cada</div>
        </div>
        <div class="quantity-controls">
            <button class="quantity-btn" onclick="alterarQuantidade(${item.id}, -1)">-</button>
            <span class="quantity">${item.quantidade}</span>
            <button class="quantity-btn" onclick="alterarQuantidade(${item.id}, 1)">+</button>
        </div>
        <div class="item-subtotal">
            R$ ${subtotal.toFixed(2).replace('.', ',')}
        </div>
        <button class="remove-btn" onclick="removerDoCarrinho(${item.id})">🗑️</button>
    `;
    
    return itemDiv;
}

// Alterar quantidade de item no carrinho
function alterarQuantidade(itemId, delta) {
    const item = carrinho.find(i => i.id === itemId);
    
    if (item) {
        item.quantidade += delta;
        
        if (item.quantidade <= 0) {
            removerDoCarrinho(itemId);
        } else {
            atualizarCarrinho();
        }
    }
}

// Remover item do carrinho
function removerDoCarrinho(itemId) {
    const index = carrinho.findIndex(i => i.id === itemId);
    
    if (index !== -1) {
        const item = carrinho[index];
        carrinho.splice(index, 1);
        atualizarCarrinho();
        mostrarMensagem(`${item.nome} removido do carrinho.`, 'success');
    }
}

// Calcular total do carrinho
function calcularTotal() {
    return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
}

// Toggle carrinho
function toggleCarrinho() {
    cartContainer.classList.toggle('hidden');
}

// Abrir modal de checkout
function abrirModalCheckout() {
    if (carrinho.length === 0) {
        mostrarMensagem('Carrinho vazio!', 'error');
        return;
    }
    
    // Atualizar resumo do pedido
    orderSummary.innerHTML = '';
    
    carrinho.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'order-item';
        
        const subtotal = item.preco * item.quantidade;
        
        itemDiv.innerHTML = `
            <span>${item.nome} (${item.quantidade}x)</span>
            <span>R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
        `;
        
        orderSummary.appendChild(itemDiv);
    });
    
    // Atualizar total
    const total = calcularTotal();
    orderTotal.textContent = total.toFixed(2).replace('.', ',');
    
    // Mostrar modal
    checkoutModal.classList.remove('hidden');
}

// Fechar modal
function fecharModal() {
    checkoutModal.classList.add('hidden');
    checkoutForm.reset();
}

// Enviar pedido
async function enviarPedido(e) {
    e.preventDefault();
    
    const formData = new FormData(checkoutForm);
    const nomeCliente = formData.get('customerName').trim();
    const observacoes = formData.get('observations').trim();
    
    if (!nomeCliente) {
        mostrarMensagem('Nome do cliente é obrigatório!', 'error');
        return;
    }
    
    if (carrinho.length === 0) {
        mostrarMensagem('Carrinho vazio!', 'error');
        return;
    }
    
    const pedido = {
        nomeCliente,
        observacoes,
        itens: carrinho.map(item => ({
            id: item.id,
            nome: item.nome,
            preco: item.preco,
            quantidade: item.quantidade,
            subtotal: item.preco * item.quantidade
        })),
        total: calcularTotal()
    };
    
    try {
        mostrarMensagem('Enviando pedido...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/pedidos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pedido)
        });
        
        if (!response.ok) {
            throw new Error('Erro ao enviar pedido');
        }
        
        const resultado = await response.json();
        
        // Limpar carrinho
        carrinho = [];
        atualizarCarrinho();
        
        // Fechar modal
        fecharModal();
        
        // Mostrar sucesso
        mostrarMensagem('Pedido enviado com sucesso! Aguarde a confirmação.', 'success');
        
    } catch (error) {
        console.error('Erro ao enviar pedido:', error);
        mostrarMensagem('Erro ao enviar pedido. Tente novamente.', 'error');
    }
}

// Mostrar mensagem
function mostrarMensagem(texto, tipo = 'info') {
    const message = document.createElement('div');
    message.className = `message ${tipo}`;
    message.textContent = texto;
    
    messageContainer.appendChild(message);
    
    // Remover mensagem após 5 segundos
    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 5000);
}

// Função global para adicionar ao carrinho (chamada pelos botões)
window.adicionarAoCarrinho = adicionarAoCarrinho;
window.alterarQuantidade = alterarQuantidade;
window.removerDoCarrinho = removerDoCarrinho;


/**
 * Tabela de Preços - Script Otimizado
 * Script responsável por carregar e exibir tabela de preços
 * com funcionalidades de busca, abas e calculadora
 */

// Espera pelo carregamento do DOM
document.addEventListener('DOMContentLoaded', inicializarAplicacao);

/**
 * Função principal que inicializa a aplicação
 */
async function inicializarAplicacao() {
  try {
        const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.value = '';
      limparResultadosBusca();
    }
    // Adiciona estilos personalizados
    adicionarEstilosPersonalizados();
    
    // Carrega dados
    const data = await carregarDados();
    if (!data) return;
    
    // Inicializa componentes
    preencherPagina(data);
    inicializarAbas();
    inicializarPesquisa();
    inicializarCalculadora();
    melhorarInterface();
    
    // Exibe loader durante o carregamento (opcional)
    document.getElementById('loader')?.classList.add('hidden');
  } catch (erro) {
    console.error('Erro ao inicializar aplicação:', erro);
    exibirMensagemErro('Não foi possível inicializar a aplicação. Por favor, recarregue a página.');
  }
}

/**
 * Carrega os dados do arquivo JSON
 * @returns {Promise<Object>} Dados do arquivo JSON
 */
async function carregarDados() {
  try {
    const response = await fetch('precos.json');
    
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }
    
    return await response.json();
  } catch (erro) {
    console.error('Erro ao carregar dados:', erro);
    exibirMensagemErro('Não foi possível carregar os dados. Por favor, recarregue a página.');
    return null;
  }
}

/**
 * Exibe mensagem de erro para o usuário
 * @param {string} mensagem - Mensagem de erro
 */
function exibirMensagemErro(mensagem) {
  // Verifica se já existe um elemento de erro
  let erroElement = document.querySelector('.erro-mensagem');
  
  if (!erroElement) {
    erroElement = document.createElement('div');
    erroElement.className = 'erro-mensagem';
    document.body.appendChild(erroElement);
  }
  
  erroElement.textContent = mensagem;
  erroElement.classList.add('visivel');
  
  // Remove a mensagem após 5 segundos
  setTimeout(() => {
    erroElement.classList.remove('visivel');
  }, 5000);
}

/**
 * Preenche a página com os dados carregados
 * @param {Object} data - Dados do arquivo JSON
 */
function preencherPagina(data) {
  // Atualiza o título da página e rodapé
  document.title = data.configuracoes.titulo_site;
  const footerDataElement = document.querySelector('footer p');
  if (footerDataElement) {
    footerDataElement.textContent = `Tabela de Preços - Atualizada em ${data.configuracoes.data_atualizacao}`;
  }
  
  // Processa cada categoria
  for (const [id, categoria] of Object.entries(data.categorias)) {
    const sectionElement = document.getElementById(id);
    
    if (!sectionElement) continue;
    
    // Atualiza o título da categoria
    const tituloElement = sectionElement.querySelector('.category-title');
    if (tituloElement) tituloElement.textContent = categoria.titulo;
    
    // Atualiza o container de itens
    const gridContainer = sectionElement.querySelector('.grid-container');
    if (!gridContainer) continue;
    
    // Usa DocumentFragment para melhor performance
    const fragment = document.createDocumentFragment();
    
    // Processa cada item da categoria
    categoria.itens.forEach(item => {
      const cardElement = criarCardItem(item, id);
      fragment.appendChild(cardElement);
    });
    
    // Limpa e adiciona os novos elementos
    gridContainer.innerHTML = '';
    gridContainer.appendChild(fragment);
  }
}

/**
 * Cria um card de item
 * @param {Object} item - Dados do item
 * @param {string} categoriaId - ID da categoria
 * @returns {HTMLElement} Elemento do card
 */
function criarCardItem(item, categoriaId) {
  const cardElement = document.createElement('div');
  cardElement.className = 'item-card redesigned';
  
  const isPercentage = item.isPercentage || false;
  const precoRegular = isPercentage ? item.preco_regular : formatarDinheiro(item.preco_regular);
  
  // Header do card
  const headerElement = document.createElement('div');
  headerElement.className = 'card-header';
  headerElement.innerHTML = `
    <span class="item-icon">${item.icone}</span>
    <span class="item-title">${item.nome}</span>
  `;
  
  // Seção de preços
  const priceSection = document.createElement('div');
  priceSection.className = 'price-section';
  
  // Preço regular
  const regularRow = document.createElement('div');
  regularRow.className = 'price-row regular';
  regularRow.innerHTML = `
    <span class="price-label">Preço</span>
    <span class="price-value">${precoRegular}</span>
  `;
  
  priceSection.appendChild(regularRow);
  
  // Preço parceria (formato diferente para categoria "lavagem")
  if (categoriaId === 'lavagem') {
    const precosParceria = isPercentage ? item.preco_parceria_min : formatarDinheiro(item.preco_parceria_min);
    
    const parceriaRow = document.createElement('div');
    parceriaRow.className = 'price-row parceria';
    parceriaRow.innerHTML = `
      <span class="price-label">Parceria</span>
      <span class="price-value">${precosParceria}</span>
    `;
    
    priceSection.appendChild(parceriaRow);
  } else {
    const precoMinParceria = isPercentage ? item.preco_parceria_min : formatarDinheiro(item.preco_parceria_min);
    const precoMaxParceria = isPercentage ? item.preco_parceria_max : formatarDinheiro(item.preco_parceria_max);
    
    const parceriaRow = document.createElement('div');
    parceriaRow.className = 'price-row parceria';
    parceriaRow.innerHTML = `
      <span class="price-label">Parceria</span>
      <span class="price-value">${precoMinParceria} ~ ${precoMaxParceria}</span>
    `;
    
    priceSection.appendChild(parceriaRow);
  }
  
  // Monta o card
  cardElement.appendChild(headerElement);
  cardElement.appendChild(priceSection);
  
  return cardElement;
}

/**
 * Inicializa as abas
 */
function inicializarAbas() {
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
      // Remove classe ativa de todas as abas
      document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
      
      // Adiciona classe ativa à aba clicada
      button.classList.add('active');
      
      // Exibe o conteúdo da aba
      const tabId = button.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
      
      // Limpa resultado de busca E o campo de busca
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.value = '';
      }
      limparResultadosBusca();
      
      // Mostra todos os cards da aba atual
      document.querySelectorAll(`#${tabId} .item-card`).forEach(card => {
        card.style.display = 'block';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
      
      // Anima cards
      animarCardsAoCarregar(tabId);
    });
  });
}
/**
 * Inicializa a funcionalidade de pesquisa
 */
function inicializarPesquisa() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;
  
  // Adiciona efeitos visuais
  searchInput.addEventListener('focus', function() {
    this.parentElement.classList.add('focused');
  });
  
  searchInput.addEventListener('blur', function() {
    this.parentElement.classList.remove('focused');
  });
  
  // Adiciona debounce para melhorar performance
  let timeoutId;
  searchInput.addEventListener('input', function() {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      realizarBusca(this.value.toLowerCase());
    }, 200); // 200ms de delay
  });
}

/**
 * Realiza busca nos itens
 * @param {string} termoBusca - Termo de busca
 */
function realizarBusca(termoBusca) {
  // Obtem todos os cards
  const allItemCards = document.querySelectorAll('.item-card');
  
  // Reset de display e classes
  allItemCards.forEach(card => {
    card.style.display = 'none';
    card.classList.remove('search-result');
  });
  
  // Se o campo estiver vazio, mostra apenas itens da aba ativa
  if (termoBusca === '') {
    const activeTabId = document.querySelector('.tab-content.active')?.id;
    if (activeTabId) {
      document.querySelectorAll(`#${activeTabId} .item-card`).forEach(card => {
        card.style.display = 'block';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    }
    
    // Remove indicador de resultados
    document.querySelector('.search-results-indicator')?.remove();
    return;
  }
  
  // Variáveis para controle dos resultados
  let encontrouResultados = false;
  let resultadosPorCategoria = {};
  
  // Processa todos os cards
  allItemCards.forEach(card => {
    const itemName = card.querySelector('.item-title')?.textContent.toLowerCase() || '';
    const tabContent = card.closest('.tab-content');
    
    if (!tabContent) return;
    
    const tabId = tabContent.id;
    
    if (itemName.includes(termoBusca)) {
      // Contabiliza resultados
      resultadosPorCategoria[tabId] = (resultadosPorCategoria[tabId] || 0) + 1;
      
      // Exibe e anima o card
      card.style.display = 'block';
      card.classList.add('search-result');
      
      requestAnimationFrame(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
      
      encontrouResultados = true;
    }
  });
  
  // Exibe resultados
  if (encontrouResultados) {
    // Encontra a primeira categoria com resultados
    const primeiraCategoria = Object.keys(resultadosPorCategoria).find(
      key => resultadosPorCategoria[key] > 0
    );
    
    // Ativa a aba correspondente
    document.querySelectorAll('.tab-content').forEach(content => 
      content.classList.remove('active')
    );
    document.getElementById(primeiraCategoria)?.classList.add('active');
    
    // Ativa o botão correspondente
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-tab') === primeiraCategoria) {
        btn.classList.add('active');
      }
    });
    
    // Exibe indicador de resultados
    const totalResultados = Object.values(resultadosPorCategoria).reduce((a, b) => a + b, 0);
    mostrarIndicadorResultados(totalResultados, resultadosPorCategoria);
  } else if (termoBusca !== '') {
    // Nenhum resultado encontrado
    mostrarIndicadorResultados(0);
  }
}

/**
 * Limpa os resultados de busca
 */
function limparResultadosBusca() {
  // Remove indicador de resultados
  const resultIndicator = document.querySelector('.search-results-indicator');
  if (resultIndicator) resultIndicator.remove();
  
  // Reseta campo de busca
  const searchInput = document.getElementById('search-input');
  if (searchInput && searchInput.value !== '') {
    searchInput.value = '';
    
    // Reinicia exibição dos cards
    document.querySelectorAll('.item-card').forEach(card => {
      card.classList.remove('search-result');
    });
  }
}

/**
 * Mostra indicador de resultados da busca
 * @param {number} total - Total de resultados
 * @param {Object} resultadosPorCategoria - Resultados agrupados por categoria
 */
function mostrarIndicadorResultados(total, resultadosPorCategoria = {}) {
  // Remove indicador existente
  const existingIndicator = document.querySelector('.search-results-indicator');
  if (existingIndicator) existingIndicator.remove();
  
  // Cria novo indicador
  const indicator = document.createElement('div');
  indicator.className = 'search-results-indicator';
  
  if (total > 0) {
    // Texto principal
    const mainText = document.createElement('div');
    mainText.className = 'indicator-main';
    mainText.innerHTML = `<span>${total}</span> ${total === 1 ? 'resultado encontrado' : 'resultados encontrados'}`;
    indicator.appendChild(mainText);
    
    // Distribuição de resultados
    const distribution = document.createElement('div');
    distribution.className = 'indicator-distribution';
    
    // Ordena categorias por quantidade de resultados
    const categoriasOrdenadas = Object.entries(resultadosPorCategoria)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
    
    // Cria botões para cada categoria
    categoriasOrdenadas.forEach(([catId, count]) => {
      const tabButton = document.querySelector(`.tab-button[data-tab="${catId}"]`);
      const catName = tabButton ? tabButton.textContent.trim() : catId;
      
      const catButton = document.createElement('button');
      catButton.className = 'category-result-btn';
      catButton.innerHTML = `${catName} <span>(${count})</span>`;
      
      // Marca como ativo se for a categoria atual
      if (document.getElementById(catId)?.classList.contains('active')) {
        catButton.classList.add('active');
      }
      
      // Evento de clique
      catButton.addEventListener('click', () => {
        // Ativa a categoria
        document.querySelectorAll('.tab-content').forEach(content => 
          content.classList.remove('active')
        );
        document.getElementById(catId)?.classList.add('active');
        
        // Ativa o botão de aba
        document.querySelectorAll('.tab-button').forEach(btn => {
          btn.classList.remove('active');
          if (btn.getAttribute('data-tab') === catId) {
            btn.classList.add('active');
          }
        });
        
        // Ativa o botão de categoria
        document.querySelectorAll('.category-result-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        catButton.classList.add('active');
      });
      
      distribution.appendChild(catButton);
    });
    
    indicator.appendChild(distribution);
  } else {
    // Mensagem de nenhum resultado
    indicator.innerHTML = `<div class="no-results">Nenhum resultado encontrado</div>`;
  }
  
  // Adiciona o indicador após a barra de pesquisa
  const searchContainer = document.querySelector('.search-container');
  if (searchContainer) {
    searchContainer.after(indicator);
    
    // Anima a entrada do indicador
    requestAnimationFrame(() => {
      setTimeout(() => {
        indicator.classList.add('visible');
      }, 10);
    });
  }
}

/**
 * Inicializa a calculadora
 */
function inicializarCalculadora() {
  const valorInput = document.getElementById('valor-sujo');
  const tipoPrecoToggle = document.getElementById('tipo-preco-toggle');
  const labelRegular = document.getElementById('label-regular');
  const labelParceria = document.getElementById('label-parceria');
  
  if (!valorInput || !tipoPrecoToggle || !labelRegular || !labelParceria) return;
  
  // Configuração inicial
  let tipoPreco = 'regular';
  setupMoneyFormatting(valorInput);
  
  // Toggle entre preço regular e parceria
  tipoPrecoToggle.addEventListener('change', function() {
    if (this.checked) {
      labelRegular.classList.remove('active');
      labelParceria.classList.add('active');
      tipoPreco = 'parceria';
    } else {
      labelParceria.classList.remove('active');
      labelRegular.classList.add('active');
      tipoPreco = 'regular';
    }
    
    atualizarInfoPreco(tipoPreco);
    calcularLavagem();
  });
  
  // Calcula ao digitar
  valorInput.addEventListener('input', calcularLavagem);
  
  /**
   * Atualiza informações de preço
   * @param {string} tipo - Tipo de preço (regular ou parceria)
   */
  function atualizarInfoPreco(tipo) {
    const infoElement = document.getElementById('info-tipo-preco');
    if (!infoElement) return;
    
    if (tipo === 'regular') {
      infoElement.innerHTML = `
        <li>Regular: <strong>30%</strong> para valores abaixo de 1 milhão</li>
        <li>Regular: <strong>25%</strong> para valores acima de 1 milhão</li>
      `;
    } else {
      infoElement.innerHTML = `
        <li>Parceria: <strong>25%</strong> para valores abaixo de 1 milhão</li>
        <li>Parceria: <strong>20%</strong> para valores acima de 1 milhão</li>
      `;
    }
  }
  
  /**
   * Calcula valor de lavagem
   */
  function calcularLavagem() {
    const valorTexto = valorInput.value.replace(/\./g, '').replace(',', '.');
    const valorSujo = parseFloat(valorTexto);
    
    // Valida entrada
    if (isNaN(valorSujo) || valorSujo <= 0) {
      document.getElementById('taxa-aplicada').textContent = `-`;
      document.getElementById('valor-taxa').textContent = `-`;
      document.getElementById('valor-limpo').textContent = `-`;
      return;
    }
    
    // Calcula taxa baseada no tipo e valor
    let taxa = tipoPreco === 'regular' 
      ? (valorSujo < 1000000 ? 0.30 : 0.25)
      : (valorSujo < 1000000 ? 0.25 : 0.20);
    
    const valorTaxa = valorSujo * taxa;
    const valorLimpo = valorSujo - valorTaxa;
    
    // Atualiza interface
    document.getElementById('taxa-aplicada').textContent = `${(taxa * 100).toFixed(1)}%`;
    document.getElementById('valor-taxa').textContent = formatarDinheiro(valorTaxa);
    document.getElementById('valor-limpo').textContent = formatarDinheiro(valorLimpo);
  }
}

/**
 * Configura formatação de valores monetários
 * @param {HTMLElement} inputElement - Elemento de input
 */
function setupMoneyFormatting(inputElement) {
  // Formata ao digitar
  inputElement.addEventListener('input', function() {
    let value = this.value.replace(/[^0-9]/g, '');
    
    if (value) {
      const numberValue = parseFloat(value) / 100;
      const formattedValue = numberValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      this.value = formattedValue;
    }
  });
  
  // Completa decimais ao perder foco
  inputElement.addEventListener('blur', function() {
    if (this.value) {
      const parts = this.value.split(',');
      if (parts.length === 1) {
        this.value += ',00';
      } else if (parts[1].length === 1) {
        this.value += '0';
      }
    }
  });
  
  // Seleciona todo o conteúdo ao focar
  inputElement.addEventListener('focus', function() {
    this.select();
  });
}

/**
 * Formata valor para formato monetário
 * @param {number} valor - Valor a ser formatado
 * @returns {string} Valor formatado
 */
function formatarDinheiro(valor) {
  return '$' + valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Melhora a interface com efeitos visuais
 */
function melhorarInterface() {
  // Anima cards ao carregar
  const activeTabId = document.querySelector('.tab-content.active')?.id;
  if (activeTabId) {
    animarCardsAoCarregar(activeTabId);
  }
  
  // Adiciona efeito de ripple aos botões
  adicionarEfeitoRipple();
  
  // Adiciona observer para animações de scroll
  adicionarAnimacoesScroll();
}

/**
 * Anima cards ao carregar
 * @param {string} tabId - ID da aba
 */
function animarCardsAoCarregar(tabId) {
  const cards = document.querySelectorAll(`#${tabId} .item-card`);
  
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    requestAnimationFrame(() => {
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 40 * index);
    });
  });
}

/**
 * Adiciona efeito de ripple aos botões
 */
function adicionarEfeitoRipple() {
  document.querySelectorAll('.tab-button, .category-result-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      // Remove outros efeitos
      this.querySelectorAll('.ripple-effect').forEach(ripple => ripple.remove());
      
      // Cria o elemento de efeito
      const circle = document.createElement('span');
      circle.className = 'ripple-effect';
      
      // Posiciona no local do clique
      const diameter = Math.max(this.clientWidth, this.clientHeight);
      const radius = diameter / 2;
      
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - radius;
      const y = e.clientY - rect.top - radius;
      
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${x}px`;
      circle.style.top = `${y}px`;
      
      this.appendChild(circle);
      
      // Remove após a animação
      setTimeout(() => {
        circle.remove();
      }, 800);
    });
  });
}

/**
 * Adiciona animações baseadas em scroll
 */
function adicionarAnimacoesScroll() {
  // Verifica suporte a IntersectionObserver
  if (!('IntersectionObserver' in window)) return;
  
  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, options);
  
  // Observa elementos para animar
  document.querySelectorAll('.category-title, .grid-container, .calculadora-section').forEach(element => {
    element.classList.add('animate-on-scroll');
    observer.observe(element);
  });
}

/**
 * Adiciona estilos personalizados
 */
function adicionarEstilosPersonalizados() {
  // Estilos para os cartões de itens
  adicionarEstilosRedesenhados();
  
  // Estilos adicionais para UI
  const style = document.createElement('style');
  style.textContent = `
    /* Estilos para a busca e resultados */
    .search-container {
      position: relative;
      transition: all 0.3s ease;
    }
    
    .search-container.focused {
      transform: translateY(-2px);
    }
    
    .search-results-indicator {
      background: linear-gradient(135deg, rgba(40, 40, 40, 0.7), rgba(30, 30, 30, 0.7));
      border-radius: 12px;
      padding: 15px 20px;
      margin: 15px 0 25px;
      border: 1px solid var(--border);
      box-shadow: var(--shadow-md);
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.3s cubic-bezier(0.215, 0.61, 0.355, 1);
    }
    
    .search-results-indicator.visible {
      opacity: 1;
      transform: translateY(0);
    }
    
    .indicator-main {
      font-size: 1.1rem;
      margin-bottom: 10px;
      color: var(--text-secondary);
    }
    
    .indicator-main span {
      color: var(--accent);
      font-weight: 700;
    }
    
    .indicator-distribution {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .category-result-btn {
      background: rgba(30, 30, 30, 0.6);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      padding: 8px 15px;
      border-radius: 20px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .category-result-btn span {
      opacity: 0.7;
    }
    
    .category-result-btn:hover, .category-result-btn.active {
      background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
      color: white;
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    
    .no-results {
      color: var(--text-muted);
      font-size: 1rem;
      text-align: center;
      padding: 5px 0;
    }
    
    .search-result {
      animation: highlightResult 1.5s ease;
    }
    
    @keyframes highlightResult {
      0%, 100% { border-color: var(--border); }
      50% { border-color: var(--accent); box-shadow: 0 0 15px var(--glow); }
    }
    
    /* Efeito ripple para os botões */
    .tab-button, .category-result-btn {
      position: relative;
      overflow: hidden;
    }
    
    .ripple-effect {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0);
      animation: ripple 0.8s linear;
      pointer-events: none;
    }
    
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    /* Efeito de hover aprimorado para os cards */
    .item-card {
      transition: all 0.4s cubic-bezier(0.215, 0.61, 0.355, 1);
    }
    
    .item-card:hover .item-icon {
      transform: scale(1.1);
      color: var(--accent);
      transition: all 0.3s ease;
    }
    
    /* Animações de scroll */
    .animate-on-scroll {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .animate-in {
      opacity: 1;
      transform: translateY(0);
    }
    
    /* Mensagem de erro */
    .erro-mensagem {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(-100px);
      background: rgba(220, 53, 69, 0.9);
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      opacity: 0;
      transition: transform 0.4s ease, opacity 0.4s ease;
    }
    
    .erro-mensagem.visivel {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    
    /* Responsividade aprimorada */
    @media (max-width: 576px) {
      .price-row {
        padding: 12px 15px;
      }
      
      .card-header {
        padding: 12px 15px;
      }
      
      .price-value, .price-label {
        font-size: 0.95rem;
      }
      
      .indicator-distribution {
        flex-direction: column;
      }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Adiciona estilos redesenhados para os cartões
 */
function adicionarEstilosRedesenhados() {
  const style = document.createElement('style');
  style.textContent = `
    /* Novo design para os cartões de itens */
    .item-card.redesigned {
      position: relative;
      overflow: hidden;
      padding: 0;
      display: flex;
      flex-direction: column;
      transition: all 0.3s cubic-bezier(0.215, 0.61, 0.355, 1);
    }
    
    .card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 15px 20px;
      border-bottom: 1px solid var(--border);
      background: linear-gradient(to right, rgba(35, 35, 35, 0.8), rgba(30, 30, 30, 0.8));
    }
    
    .card-header .item-icon {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      border-radius: 8px;
      color: var(--accent);
      background-color: rgba(0, 207, 255, 0.1);
      transition: transform 0.2s ease, background-color 0.2s ease;
    }
    
    .card-header .item-title {
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--text-primary);
    }
    
    .price-section {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    
    .price-row {
      display: flex;
      align-items: center;
      padding: 15px 20px;
      transition: all 0.2s ease;
    }
    
    .price-row.regular {
      background-color: rgba(25, 25, 25, 0.6);
      border-left: 3px solid var(--regular-price);
    }
    
    .price-row.parceria {
      background-color: rgba(0, 120, 150, 0.15);
      border-left: 3px solid var(--partner-price);
    }
    
    .price-row:hover {
      transform: translateX(5px);
    }
    
    .price-label {
      font-weight: 600;
      font-size: 1rem;
      flex: 1;
      color: var(--text-secondary);
    }
    
    .price-row.regular .price-value {
      color: var(--regular-price);
    }
    
    .price-row.parceria .price-value {
      color: var(--partner-price);
    }
    
    .price-value {
      font-weight: 700;
      font-size: 1.1rem;
      text-align: right;
    }
    
    /* Efeitos hover aprimorados */
    .item-card.redesigned:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-lg), 0 0 15px rgba(0, 207, 255, 0.15);
    }
    
    .item-card.redesigned:hover .card-header {
      background: linear-gradient(to right, rgba(40, 40, 40, 0.9), rgba(35, 35, 35, 0.9));
    }
    
    .item-card.redesigned:hover .item-icon {
      transform: scale(1.1);
      background-color: rgba(0, 207, 255, 0.2);
    }
    
    /* Adiciona sombreamento/brilho nos preços ao passar o mouse */
    .item-card.redesigned:hover .price-value {
      text-shadow: 0 0 8px rgba(0, 207, 255, 0.3);
    }
    
    /* Responsividade */
    @media (max-width: 576px) {
      .price-row {
        padding: 12px 15px;
      }
      
      .card-header {
        padding: 12px 15px;
      }
      
      .price-value, .price-label {
        font-size: 0.95rem;
      }
    }
  `;
  document.head.appendChild(style);
}

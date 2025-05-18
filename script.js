document.addEventListener('DOMContentLoaded', function() {
 fetch('precos.json')
   .then(response => {
     if (!response.ok) throw new Error('Erro: ' + response.status);
     return response.json();
   })
   .then(data => {
     preencherPagina(data);
     inicializarAbas();
     inicializarPesquisa();
     inicializarCalculadora();
     melhorarInterface(); // Nova função para aprimorar a interface
   })
   .catch(error => {
     console.error('Erro ao carregar dados:', error);
     alert('Não foi possível carregar os dados. Por favor, recarregue a página.');
   });
 
function preencherPagina(data) {
  for (const [id, categoria] of Object.entries(data.categorias)) {
    const sectionElement = document.getElementById(id);
    
    if (sectionElement) {
      const tituloElement = sectionElement.querySelector('.category-title');
      if (tituloElement) tituloElement.textContent = categoria.titulo;
      
      const gridContainer = sectionElement.querySelector('.grid-container');
      if (gridContainer) {
        gridContainer.innerHTML = '';
        
        categoria.itens.forEach(item => {
          const isPercentage = item.isPercentage || false;
          const precoRegular = isPercentage ? item.preco_regular : formatarDinheiro(item.preco_regular);
          
          if (id === 'lavagem') {
            // Formato especial para cartões de lavagem
            const precosParceria = isPercentage ? item.preco_parceria_min : formatarDinheiro(item.preco_parceria_min);
            
            const cardHTML = `
              <div class="item-card redesigned">
                <div class="card-header">
                  <span class="item-icon">${item.icone}</span>
                  <span class="item-title">${item.nome}</span>
                </div>
                <div class="price-section">
                  <div class="price-row regular">
                    <span class="price-label">Preço</span>
                    <span class="price-value">${precoRegular}</span>
                  </div>
                  <div class="price-row parceria">
                    <span class="price-label">Parceria</span>
                    <span class="price-value">${precosParceria}</span>
                  </div>
                </div>
              </div>
            `;
            
            gridContainer.insertAdjacentHTML('beforeend', cardHTML);
          } else {
            // Formato redesenhado para outros cartões
            const precoMinParceria = isPercentage ? item.preco_parceria_min : formatarDinheiro(item.preco_parceria_min);
            const precoMaxParceria = isPercentage ? item.preco_parceria_max : formatarDinheiro(item.preco_parceria_max);
            
            const cardHTML = `
              <div class="item-card redesigned">
                <div class="card-header">
                  <span class="item-icon">${item.icone}</span>
                  <span class="item-title">${item.nome}</span>
                </div>
                <div class="price-section">
                  <div class="price-row regular">
                    <span class="price-label">Preço</span>
                    <span class="price-value">${precoRegular}</span>
                  </div>
                  <div class="price-row parceria">
                    <span class="price-label">Parceria</span>
                    <span class="price-value">${precoMinParceria} ~ ${precoMaxParceria}</span>
                  </div>
                </div>
              </div>
            `;
            
            gridContainer.insertAdjacentHTML('beforeend', cardHTML);
          }
        });
      }
    }
  }
  
  document.title = data.configuracoes.titulo_site;
  const footerDataElement = document.querySelector('footer p');
  if (footerDataElement) {
    footerDataElement.textContent = `Tabela de Preços - Atualizada em ${data.configuracoes.data_atualizacao}`;
  }
}

// Adicionar estilos para o novo design
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

// Adicionar ao carregamento do documento
document.addEventListener('DOMContentLoaded', function() {
  fetch('precos.json')
    .then(response => {
      if (!response.ok) throw new Error('Erro: ' + response.status);
      return response.json();
    })
    .then(data => {
      adicionarEstilosRedesenhados(); // Adicionar novos estilos
      preencherPagina(data);
      inicializarAbas();
      inicializarPesquisa();
      inicializarCalculadora();
      melhorarInterface(); // Se você já tiver esta função
    })
    .catch(error => {
      console.error('Erro ao carregar dados:', error);
      alert('Não foi possível carregar os dados. Por favor, recarregue a página.');
    });
});
 
 function inicializarAbas() {
   document.querySelectorAll('.tab-button').forEach(button => {
     button.addEventListener('click', () => {
       document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
       document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
       
       button.classList.add('active');
       
       const tabId = button.getAttribute('data-tab');
       document.getElementById(tabId).classList.add('active');
       
       // Limpa qualquer indicador de resultados de busca quando trocar de aba
       const resultIndicator = document.querySelector('.search-results-indicator');
       if (resultIndicator) resultIndicator.remove();
       
       // Reseta o campo de busca
       const searchInput = document.getElementById('search-input');
       if (searchInput && searchInput.value !== '') {
         searchInput.value = '';
         // Reinicia a exibição dos cards
         document.querySelectorAll('.item-card').forEach(card => {
           card.classList.remove('search-result');
         });
       }
       
       // Anima a entrada dos cards
       const cards = document.querySelectorAll(`#${tabId} .item-card`);
       cards.forEach((card, index) => {
         card.style.opacity = '0';
         card.style.transform = 'translateY(20px)';
         setTimeout(() => {
           card.style.opacity = '1';
           card.style.transform = 'translateY(0)';
         }, 40 * index);
       });
     });
   });
 }
 
 function inicializarPesquisa() {
   const searchInput = document.getElementById('search-input');
   if (searchInput) {
     // Adiciona efeito de foco na barra de pesquisa
     searchInput.addEventListener('focus', function() {
       this.parentElement.classList.add('focused');
     });
     
     searchInput.addEventListener('blur', function() {
       this.parentElement.classList.remove('focused');
     });
     
     // Funcionalidade de busca em todas as categorias
     searchInput.addEventListener('input', function() {
       const searchTerm = this.value.toLowerCase();
       
       // Verifica todos os item-cards em todas as categorias
       const allItemCards = document.querySelectorAll('.item-card');
       let encontrouResultados = false;
       let resultadosPorCategoria = {};
       
       // Primeiro, oculta todos os cards e remove a classe de resultado de busca
       allItemCards.forEach(card => {
         card.style.display = 'none';
         card.classList.remove('search-result');
       });
       
       // Se o campo de busca estiver vazio, mostra apenas os itens da aba ativa
       if (searchTerm === '') {
         const activeTabId = document.querySelector('.tab-content.active').id;
         document.querySelectorAll(`#${activeTabId} .item-card`).forEach(card => {
           card.style.display = 'block';
           setTimeout(() => {
             card.style.opacity = '1';
             card.style.transform = 'translateY(0)';
           }, 50);
         });
         
         // Limpa o indicador de resultados, se existir
         const resultIndicator = document.querySelector('.search-results-indicator');
         if (resultIndicator) resultIndicator.remove();
         
         return;
       }
       
       // Processa todos os cards com o termo de busca
       allItemCards.forEach(card => {
         const itemName = card.querySelector('.item-title').textContent.toLowerCase();
         const tabContent = card.closest('.tab-content');
         const tabId = tabContent.id;
         
         if (itemName.includes(searchTerm)) {
           // Conta resultados por categoria
           if (!resultadosPorCategoria[tabId]) {
             resultadosPorCategoria[tabId] = 0;
           }
           resultadosPorCategoria[tabId]++;
           
           // Mostra o card e adiciona classe de resultado
           card.style.display = 'block';
           card.classList.add('search-result');
           setTimeout(() => {
             card.style.opacity = '1';
             card.style.transform = 'translateY(0)';
           }, 50);
           
           encontrouResultados = true;
         }
       });
       
       // Se encontrou resultados, ativa a primeira aba com resultados
       if (encontrouResultados) {
         // Encontra a primeira categoria com resultados
         const primeiraCategoria = Object.keys(resultadosPorCategoria).find(
           key => resultadosPorCategoria[key] > 0
         );
         
         // Alterna para essa categoria
         document.querySelectorAll('.tab-content').forEach(content => 
           content.classList.remove('active')
         );
         document.getElementById(primeiraCategoria).classList.add('active');
         
         // Ativa o botão correspondente
         document.querySelectorAll('.tab-button').forEach(btn => {
           btn.classList.remove('active');
           if (btn.getAttribute('data-tab') === primeiraCategoria) {
             btn.classList.add('active');
           }
         });
         
         // Mostra indicador com total de resultados e distribuição
         let totalResultados = Object.values(resultadosPorCategoria).reduce((a, b) => a + b, 0);
         mostrarIndicadorResultados(totalResultados, resultadosPorCategoria);
       } else if (searchTerm !== '') {
         // Se não encontrou resultados, mostra mensagem
         mostrarIndicadorResultados(0);
       }
     });
   }
 }
 
 // Função para mostrar indicador de resultados da busca
 function mostrarIndicadorResultados(total, resultadosPorCategoria = {}) {
   // Remove o indicador existente, se houver
   const existingIndicator = document.querySelector('.search-results-indicator');
   if (existingIndicator) existingIndicator.remove();
   
   // Cria novo indicador
   const indicator = document.createElement('div');
   indicator.className = 'search-results-indicator';
   
   if (total > 0) {
     // Texto principal com total de resultados
     const mainText = document.createElement('div');
     mainText.className = 'indicator-main';
     mainText.innerHTML = `<span>${total}</span> ${total === 1 ? 'resultado encontrado' : 'resultados encontrados'}`;
     indicator.appendChild(mainText);
     
     // Distribuição de resultados por categorias
     const distribution = document.createElement('div');
     distribution.className = 'indicator-distribution';
     
     // Ordena categorias por quantidade de resultados (decrescente)
     const categoriasOrdenadas = Object.entries(resultadosPorCategoria)
       .filter(([_, count]) => count > 0)
       .sort((a, b) => b[1] - a[1]);
     
     // Cria botões para cada categoria com resultados
     categoriasOrdenadas.forEach(([catId, count]) => {
       const tabButton = document.querySelector(`.tab-button[data-tab="${catId}"]`);
       const catName = tabButton ? tabButton.textContent.trim() : catId;
       
       const catButton = document.createElement('button');
       catButton.className = 'category-result-btn';
       catButton.innerHTML = `${catName} <span>(${count})</span>`;
       
       // Marca como ativo se for a categoria atual
       if (document.getElementById(catId).classList.contains('active')) {
         catButton.classList.add('active');
       }
       
       // Ativa esta categoria ao clicar
       catButton.addEventListener('click', () => {
         document.querySelectorAll('.tab-content').forEach(content => 
           content.classList.remove('active')
         );
         document.getElementById(catId).classList.add('active');
         
         document.querySelectorAll('.tab-button').forEach(btn => {
           btn.classList.remove('active');
           if (btn.getAttribute('data-tab') === catId) {
             btn.classList.add('active');
           }
         });
         
         // Destaca os botões de categoria no indicador
         document.querySelectorAll('.category-result-btn').forEach(btn => {
           btn.classList.remove('active');
         });
         catButton.classList.add('active');
       });
       
       distribution.appendChild(catButton);
     });
     
     indicator.appendChild(distribution);
   } else {
     // Mensagem quando não há resultados
     indicator.innerHTML = `<div class="no-results">Nenhum resultado encontrado</div>`;
   }
   
   // Adiciona o indicador depois da barra de pesquisa
   const searchContainer = document.querySelector('.search-container');
   searchContainer.after(indicator);
   
   // Anima a entrada do indicador
   setTimeout(() => {
     indicator.classList.add('visible');
   }, 10);
 }
 
 function inicializarCalculadora() {
   const valorInput = document.getElementById('valor-sujo');
   const tipoPrecoToggle = document.getElementById('tipo-preco-toggle');
   const labelRegular = document.getElementById('label-regular');
   const labelParceria = document.getElementById('label-parceria');
   
   let tipoPreco = 'regular';
   
   if (valorInput && tipoPrecoToggle) {
     setupMoneyFormatting();
     
     tipoPrecoToggle.addEventListener('change', function() {
       if(this.checked) {
         labelRegular.classList.remove('active');
         labelParceria.classList.add('active');
       } else {
         labelParceria.classList.remove('active');
         labelRegular.classList.add('active');
       }
       
       tipoPreco = this.checked ? 'parceria' : 'regular';
       atualizarInfoPreco(tipoPreco);
       calcularLavagem();
     });
     
     valorInput.addEventListener('input', calcularLavagem);
     
     function atualizarInfoPreco(tipo) {
       const infoElement = document.getElementById('info-tipo-preco');
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
     
     function calcularLavagem() {
       const valorTexto = valorInput.value.replace(/\./g, '').replace(',', '.');
       const valorSujo = parseFloat(valorTexto);
       
       if (isNaN(valorSujo) || valorSujo <= 0) {
         document.getElementById('taxa-aplicada').textContent = `-`;
         document.getElementById('valor-taxa').textContent = `-`;
         document.getElementById('valor-limpo').textContent = `-`;
         return;
       }
       
       let taxa = tipoPreco === 'regular' 
         ? (valorSujo < 1000000 ? 0.30 : 0.25)
         : (valorSujo < 1000000 ? 0.25 : 0.20);
       
       const valorTaxa = valorSujo * taxa;
       const valorLimpo = valorSujo - valorTaxa;
       
       document.getElementById('taxa-aplicada').textContent = `${(taxa * 100).toFixed(1)}%`;
       document.getElementById('valor-taxa').textContent = formatarDinheiro(valorTaxa);
       document.getElementById('valor-limpo').textContent = formatarDinheiro(valorLimpo);
     }
   }
 }

 function setupMoneyFormatting() {
   const valorInput = document.getElementById('valor-sujo');
   
   valorInput.addEventListener('input', function(e) {
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
   
   valorInput.addEventListener('blur', function() {
     if (this.value) {
       const parts = this.value.split(',');
       if (parts.length === 1) {
         this.value += ',00';
       } else if (parts[1].length === 1) {
         this.value += '0';
       }
     }
   });
   
   valorInput.addEventListener('focus', function() {
     this.select();
   });
 }
 
 function formatarDinheiro(valor) {
   return '$' + valor.toLocaleString('pt-BR', {
     minimumFractionDigits: 2,
     maximumFractionDigits: 2
   });
 }
 
 // Novas funções para melhorar a interface
 function melhorarInterface() {
   // Adiciona estilos para os resultados de busca e outros elementos
   adicionarEstilos();
   
   // Anima a entrada dos cards quando a página carrega
   animarCardsAoCarregar();
   
   // Adiciona efeito de ripple aos botões
   adicionarEfeitoRipple();
 }
 
 function adicionarEstilos() {
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
     .tab-button {
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
   `;
   document.head.appendChild(style);
 }
 
 function animarCardsAoCarregar() {
   // Animação inicial dos cards na página atual
   const activeTabId = document.querySelector('.tab-content.active').id;
   const cards = document.querySelectorAll(`#${activeTabId} .item-card`);
   
   cards.forEach((card, index) => {
     card.style.opacity = '0';
     card.style.transform = 'translateY(20px)';
     
     setTimeout(() => {
       card.style.opacity = '1';
       card.style.transform = 'translateY(0)';
     }, 40 * index);
   });
 }
 
 function adicionarEfeitoRipple() {
   document.querySelectorAll('.tab-button').forEach(button => {
     button.addEventListener('click', function(e) {
       // Cria o elemento de efeito
       const circle = document.createElement('span');
       circle.className = 'ripple-effect';
       
       // Posiciona o efeito no local do clique
       const diameter = Math.max(this.clientWidth, this.clientHeight);
       const radius = diameter / 2;
       
       const rect = this.getBoundingClientRect();
       const x = e.clientX - rect.left - radius;
       const y = e.clientY - rect.top - radius;
       
       circle.style.width = circle.style.height = `${diameter}px`;
       circle.style.left = `${x}px`;
       circle.style.top = `${y}px`;
       
       this.appendChild(circle);
       
       // Remove o efeito após a animação
       setTimeout(() => {
         circle.remove();
       }, 800);
     });
   });
 }
});

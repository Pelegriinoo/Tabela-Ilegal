// JavaScript para a tabela de preços com JSON
document.addEventListener('DOMContentLoaded', function() {
    // Carrega os dados do JSON
    fetch('precos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar dados: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            // Com os dados carregados, podemos preencher as seções
            preencherPagina(data);
            
            // Inicializar funcionalidades
            inicializarAbas();
            inicializarPesquisa();
            inicializarCalculadora();
        })
        .catch(error => {
            console.error('Erro ao carregar ou processar dados:', error);
            alert('Não foi possível carregar os dados. Por favor, recarregue a página.');
        });
    
    // Função para preencher as seções com os dados do JSON
    function preencherPagina(data) {
        // Preencher cada seção de conteúdo
        for (const [id, categoria] of Object.entries(data.categorias)) {
            const sectionElement = document.getElementById(id);
            
            if (sectionElement) {
                // Atualizar o título da categoria
                const tituloElement = sectionElement.querySelector('.category-title');
                if (tituloElement) {
                    tituloElement.textContent = categoria.titulo;
                }
                
                // Criar a estrutura para os cards de itens
                const gridContainer = sectionElement.querySelector('.grid-container');
                if (gridContainer) {
                    // Limpar conteúdo existente
                    gridContainer.innerHTML = '';
                    
                    // Adicionar cada item
                    categoria.itens.forEach(item => {
                        // Verificar se é porcentagem ou valor numérico
                        const isPercentage = item.isPercentage || false;
                        
                        // Formatação do preço (% ou valor)
                        const precoRegular = isPercentage ? item.preco_regular : formatarDinheiro(item.preco_regular);
                        const precosParceria = isPercentage 
                            ? `${item.preco_parceria_min} ~ ${item.preco_parceria_max}`
                            : `${formatarDinheiro(item.preco_parceria_min)} ~ ${formatarDinheiro(item.preco_parceria_max)}`;
                        
                        // Criar o HTML do card
                        const cardHTML = `
                            <article class="item-card">
                                <div class="item-name"><span class="item-icon">${item.icone}</span> ${item.nome}</div>
                                <div class="price-container">
                                    <div class="price-regular">Preço: ${precoRegular}</div>
                                    <div class="price-range">Parceria: <span class="partner-price">${precosParceria}</span></div>
                                </div>
                            </article>
                        `;
                        
                        // Adicionar o card ao grid
                        gridContainer.insertAdjacentHTML('beforeend', cardHTML);
                    });
                }
            }
        }
        
        // Atualizar outros elementos baseados nos dados de configuração
        document.title = data.configuracoes.titulo_site;
        const footerDataElement = document.querySelector('footer p');
        if (footerDataElement) {
            footerDataElement.textContent = `Tabela de Preços - Atualizada em ${data.configuracoes.data_atualizacao}`;
        }
    }
    
    // PARTE 1: Sistema de abas
    function inicializarAbas() {
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                // Remove a classe active de todos os botões e conteúdos
                document.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
               
                // Adiciona a classe active ao botão clicado
                button.classList.add('active');
               
                // Mostra o conteúdo correspondente
                const tabId = button.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
               
                // Adiciona um efeito visual - aparecimento suave dos itens
                const cards = document.querySelectorAll(`#${tabId} .item-card`);
                cards.forEach((card, index) => {
                    card.style.opacity = '0';
                    setTimeout(() => {
                        card.style.opacity = '1';
                    }, 50 * index);
                });
            });
        });
    }
    
    // PARTE 2: Sistema de pesquisa
    function inicializarPesquisa() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const activeTabId = document.querySelector('.tab-content.active').id;
                const itemCards = document.querySelectorAll(`#${activeTabId} .item-card`);
                
                itemCards.forEach(card => {
                    const itemName = card.querySelector('.item-name').textContent.toLowerCase();
                    if (itemName.includes(searchTerm)) {
                        card.style.display = 'block';
                        // Adiciona efeito de fade-in ao mostrar resultados
                        card.style.opacity = '0';
                        setTimeout(() => {
                            card.style.opacity = '1';
                        }, 50);
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        }
    }
    
    // PARTE 3: Calculadora
    function inicializarCalculadora() {
        // Seleção dos elementos da calculadora
        const calcularBtn = document.getElementById('calcular-btn');
        const valorInput = document.getElementById('valor-sujo');
        const taxaPersonalizada = document.getElementById('taxa-personalizada');
        const usarTaxaPersonalizadaCheckbox = document.getElementById('usar-taxa-personalizada');
        const autoTaxaCheckbox = document.getElementById('auto-taxa');
        const taxaBtns = document.querySelectorAll('.taxa-btn.preset');
        
        // Verificar se os elementos da calculadora existem
        const calculadoraElementosExistem = calcularBtn && valorInput && taxaPersonalizada && 
                                          autoTaxaCheckbox && taxaBtns.length > 0;
        
        // Só inicializa a calculadora se os elementos existirem
        if (calculadoraElementosExistem) {
            console.log("Inicializando a calculadora");
            
            // Inicializar estado da calculadora
            let taxaSelecionada = 30; // Valor padrão 30%
            let usandoTaxaPersonalizada = false;
            
            // Inicializar a UI
            atualizarEstadoTaxas();
            
            // Event listeners
            calcularBtn.addEventListener('click', calcularLavagem);
            taxaPersonalizada.addEventListener('input', atualizarTaxaPersonalizada);
            autoTaxaCheckbox.addEventListener('change', atualizarEstadoTaxas);
            
            // Event listener para opção de taxa personalizada
            if (usarTaxaPersonalizadaCheckbox) {
                usarTaxaPersonalizadaCheckbox.addEventListener('change', function() {
                    usandoTaxaPersonalizada = this.checked;
                    
                    if (usandoTaxaPersonalizada) {
                        // Ativar taxa personalizada
                        ativarTaxaPersonalizada();
                    } else {
                        // Ativar taxas fixas
                        ativarTaxaFixa();
                    }
                    
                    // Desativa o checkbox de auto taxa ao mudar o tipo
                    autoTaxaCheckbox.checked = false;
                    atualizarEstadoTaxas();
                    
                    // Recalcular se já tiver um valor
                    if (valorInput.value.trim() !== '') {
                        calcularLavagem();
                    }
                });
            }
            
            // Event listeners para os botões de taxa pré-definida
            taxaBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    if (!usandoTaxaPersonalizada && !autoTaxaCheckbox.checked) {
                        // Ativar botão selecionado e desativar os outros
                        taxaBtns.forEach(b => b.classList.remove('active'));
                        this.classList.add('active');
                        
                        // Definir a taxa selecionada
                        taxaSelecionada = parseInt(this.getAttribute('data-taxa'));
                        console.log("Taxa selecionada pelo botão:", taxaSelecionada);
                        
                        // Se já tiver um valor, recalcular
                        if (valorInput.value.trim() !== '') {
                            calcularLavagem();
                        }
                    }
                });
            });
            
            // Adicionar evento de tecla Enter no input
            valorInput.addEventListener('keyup', function(event) {
                if (event.key === 'Enter') {
                    calcularLavagem();
                }
            });
            
            // Função para ativar taxa fixa
            function ativarTaxaFixa() {
                // Ativar os botões de taxa fixa
                taxaBtns.forEach(btn => {
                    btn.classList.remove('disabled');
                });
                
                // Desativar input de taxa personalizada
                taxaPersonalizada.disabled = true;
                
                // Ativar o botão correspondente à taxa atual
                taxaBtns.forEach(btn => {
                    if (parseInt(btn.getAttribute('data-taxa')) === taxaSelecionada) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }
            
            // Função para ativar taxa personalizada
            function ativarTaxaPersonalizada() {
                // Desativar os botões de taxa fixa
                taxaBtns.forEach(btn => {
                    btn.classList.add('disabled');
                    btn.classList.remove('active');
                });
                
                // Ativar input de taxa personalizada
                taxaPersonalizada.disabled = false;
                taxaPersonalizada.value = taxaSelecionada;
            }
            
            // Função para atualizar o estado da UI com base na escolha de taxa automática
            function atualizarEstadoTaxas() {
                const isAutoTaxa = autoTaxaCheckbox.checked;
                
                if (isAutoTaxa) {
                    // Desabilitar escolha manual de taxa
                    taxaBtns.forEach(btn => {
                        btn.classList.add('disabled');
                    });
                    taxaPersonalizada.disabled = true;
                    if (usarTaxaPersonalizadaCheckbox) {
                        usarTaxaPersonalizadaCheckbox.disabled = true;
                    }
                } else {
                    // Habilitar escolha manual de taxa
                    if (usarTaxaPersonalizadaCheckbox) {
                        usarTaxaPersonalizadaCheckbox.disabled = false;
                    }
                    
                    if (usandoTaxaPersonalizada) {
                        ativarTaxaPersonalizada();
                    } else {
                        ativarTaxaFixa();
                    }
                }
            }
            
            // Função para atualizar a taxa personalizada
            function atualizarTaxaPersonalizada() {
                // Limitar entre 1 e 99
                let valor = parseInt(taxaPersonalizada.value);
                if (isNaN(valor)) {
                    valor = 30;
                } else if (valor < 1) {
                    valor = 1;
                } else if (valor > 99) {
                    valor = 99;
                }
                
                taxaPersonalizada.value = valor;
                taxaSelecionada = valor;
                
                // Recalcular se já tiver um valor
                if (valorInput.value.trim() !== '') {
                    calcularLavagem();
                }
            }
            
            // Função principal para calcular a lavagem
            function calcularLavagem() {
                console.log("Calculando lavagem...");
                
                // Obter o valor inserido
                const valorSujo = parseFloat(valorInput.value);
                
                // Verificar se o valor é válido
                if (isNaN(valorSujo) || valorSujo <= 0) {
                    alert('Por favor, insira um valor válido maior que zero.');
                    return;
                }
                
                // Determinar a taxa
                let taxa;
                
                if (autoTaxaCheckbox.checked) {
                    // Modo automático - taxa baseada no valor
                    if (valorSujo < 1000000) {
                        taxa = 0.30; // 30% para regular
                    } else {
                        taxa = 0.25; // 25% para regular
                    }
                    console.log("Taxa automática:", taxa * 100 + "%");
                } else {
                    // Modo manual - taxa personalizada ou fixa
                    if (usandoTaxaPersonalizada) {
                        taxa = parseInt(taxaPersonalizada.value) / 100;
                        console.log("Taxa personalizada:", taxa * 100 + "%");
                    } else {
                        // Encontrar o botão ativo corretamente
                        const botaoAtivo = document.querySelector('.taxa-btn.preset.active');
                        if (botaoAtivo) {
                            taxa = parseInt(botaoAtivo.getAttribute('data-taxa')) / 100;
                            console.log("Taxa do botão ativo:", taxa * 100 + "%");
                        } else {
                            taxa = taxaSelecionada / 100;
                            console.log("Taxa selecionada (padrão):", taxa * 100 + "%");
                        }
                    }
                }
                
                // Calcular os valores
                const valorTaxa = valorSujo * taxa;
                const valorLimpo = valorSujo - valorTaxa;
                
                // Atualizar a interface
                document.getElementById('taxa-aplicada').textContent = `${(taxa * 100).toFixed(1)}%`;
                document.getElementById('valor-taxa').textContent = formatarDinheiro(valorTaxa);
                document.getElementById('valor-limpo').textContent = formatarDinheiro(valorLimpo);
                
                // Adicionar efeito visual para destacar os resultados
                const resultados = document.querySelectorAll('.result-item');
                resultados.forEach((resultado, index) => {
                    resultado.style.opacity = '0';
                    setTimeout(() => {
                        resultado.style.opacity = '1';
                    }, 100 * index);
                });
            }
            
            // Ativar o botão de 30% por padrão
            const botao30 = document.querySelector('.taxa-btn[data-taxa="30"]');
            if (botao30) {
                botao30.classList.add('active');
            }
        } else {
            console.error("Não foi possível inicializar a calculadora. Alguns elementos estão faltando.");
        }
    }
    
    // Função para formatar valores monetários
    function formatarDinheiro(valor) {
        return '$' + valor.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
});

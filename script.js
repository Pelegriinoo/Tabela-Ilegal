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
           const precosParceria = isPercentage 
             ? `${item.preco_parceria_min} ~ ${item.preco_parceria_max}`
             : `${formatarDinheiro(item.preco_parceria_min)} ~ ${formatarDinheiro(item.preco_parceria_max)}`;
           
           const cardHTML = `
             <article class="item-card">
               <div class="item-name"><span class="item-icon">${item.icone}</span> ${item.nome}</div>
               <div class="price-container">
                 <div class="price-regular">Preço: ${precoRegular}</div>
                 <div class="price-range">Parceria: <span class="partner-price">${precosParceria}</span></div>
               </div>
             </article>
           `;
           
           gridContainer.insertAdjacentHTML('beforeend', cardHTML);
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
 
 function inicializarAbas() {
   document.querySelectorAll('.tab-button').forEach(button => {
     button.addEventListener('click', () => {
       document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
       document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
       
       button.classList.add('active');
       
       const tabId = button.getAttribute('data-tab');
       document.getElementById(tabId).classList.add('active');
       
       const cards = document.querySelectorAll(`#${tabId} .item-card`);
       cards.forEach((card, index) => {
         card.style.opacity = '0';
         setTimeout(() => card.style.opacity = '1', 50 * index);
       });
     });
   });
 }
 
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
           card.style.opacity = '0';
           setTimeout(() => card.style.opacity = '1', 50);
         } else {
           card.style.display = 'none';
         }
       });
     });
   }
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
});

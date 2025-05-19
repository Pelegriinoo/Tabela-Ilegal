const discordConfig = {
  // O webhook será fornecido como variável de ambiente
  webhookURL: "https://discord.com/api/webhooks/1374069878880997509/NCpwSnu6pdiabZxZYPShCRTb-mclYcUmEG3gyLnWCZ2X68Xp7QfZ-kc-8t0bzFJEEfA7",
  
  // Outras configurações permanecem as mesmas
  ativado: true,
  botName: "AVENUE ILEGAL - Bot de Preços",
  botAvatar: "https://i.imgur.com/YmbTn8k.png",
  corEmbed: 0x333333  // Cinza escuro em formato hexadecimal
};

// Mapeamento de emojis por categoria
const emojiPorCategoria = {
  armamento: "<:arma:1308582218330804284>",
  lavagem: "<:money1:1334296862731276382>",
  drogas: {
    "MACONHA": "<:weed:1334233556129546311>",
    "COCAÍNA": "<:cocaine:1334233558533017803>",
    "METANFETAMINA": "<:meth:1334233570587312199>"
  },
  municao: "<:municao:1308582220033818715>",
  itens: {
    "COLETE": "<:vest:1332123173147246724>",
    "ATTACHS": "<:supressor:1334357006986903652>",
    "ALGEMA": "<:algema:1308582214463914034>",
    "CAPUZ": "<:hood:1334233249437716502>",
    "LOCKPICK": "<:lockpick:1334233560650878996>",
    "LOCKPICK DE COBRE": "<:lockpick:1334233560650878996>",
    "C4": "<:c4:1334233226625028199>",
    "CARTÃO COMUM": "<a:car01:1334233567558897695>",
    "CARTÃO ÉPICO": "<a:car01:1334233567558897695>",
    "CARTÃO LENDÁRIO": "<a:car01:1334233567558897695>",
    "PAGER": "<:pager:1335000772852846684>",
    "BLOQUEADOR DE SINAL": "<:jammer:1335001675219468430>",
    "MOCHILA": "<:mochila:1335007723711889429>",
    "CORDA": "<:corda:1335002722663137300>"
  }
};

/**
 * Verifica se os preços foram alterados e envia para o Discord quando necessário
 * @param {Object} data - Dados do arquivo JSON
 */
// Cria variável para controlar o envio
let enviandoParaDiscord = false;

async function verificarMudancasEEnviar(data) {
  console.log("Verificando mudanças nos preços...");

  // Verifica se já está enviando
  if (enviandoParaDiscord) {
    console.log('Já existe um envio em andamento, ignorando...');
    return;
  }
  
  // Saia da função se a integração estiver desativada
  if (!discordConfig.ativado || !discordConfig.webhookURL) {
    console.log('Integração com Discord desativada ou webhook não configurado');
    return;
  }
  
  try {
    // Marca que está enviando
    enviandoParaDiscord = true;
    
    // Obtém o hash dos dados anteriores e a última data de atualização
    const hashAnterior = localStorage.getItem('precosHash');
    const ultimaAtualizacao = localStorage.getItem('precosUltimaAtualizacao');
    const dataAtual = data.configuracoes.data_atualizacao;
    
    // Verifica se já enviou recentemente (nos últimos 30 segundos)
    const ultimoEnvio = localStorage.getItem('ultimoEnvioTimestamp');
    const agora = Date.now();
    
    // Se foi enviado recentemente E já temos um hash armazenado, evita duplicação
    if (ultimoEnvio && hashAnterior && agora - parseInt(ultimoEnvio) < 30000) {
      console.log('Envio recente detectado, ignorando para evitar duplicação...');
      enviandoParaDiscord = false;
      return;
    }
    
    // Cria um hash dos dados atuais
    const hashAtual = await criarHashDados(data);
    
    // Verifica se há mudanças no hash ou na data de atualização ou se é o primeiro carregamento
    const primeiroCarregamento = !hashAnterior;
    const precisaAtualizar = primeiroCarregamento || hashAtual !== hashAnterior || dataAtual !== ultimaAtualizacao;
    
    if (precisaAtualizar) {
      console.log(primeiroCarregamento 
        ? 'Primeiro carregamento detectado, enviando para o Discord...' 
        : 'Mudanças detectadas nos preços, enviando para o Discord...');
      
      // Registra timestamp antes do envio
      localStorage.setItem('ultimoEnvioTimestamp', agora.toString());
      
      // Envia para o Discord
      const sucesso = await enviarParaDiscord(data);
      
      if (sucesso) {
        // Salva o novo hash e a data de atualização
        localStorage.setItem('precosHash', hashAtual);
        localStorage.setItem('precosUltimaAtualizacao', dataAtual);
        console.log('Preços atualizados com sucesso no Discord!');
      }
    } else {
      console.log('Nenhuma mudança detectada nos preços');
    }
  } catch (erro) {
    console.error('Erro ao verificar mudanças:', erro);
  } finally {
    // Marca que finalizou
    enviandoParaDiscord = false;
  }
}

/**
 * Cria um hash simplificado dos dados de preços
 * @param {Object} data - Dados do arquivo JSON
 * @returns {string} - Hash baseado no conteúdo
 */
async function criarHashDados(data) {
  // Extrai apenas as informações relevantes de preço para um objeto simplificado
  const precosSimplificados = {};
  
  for (const [id, categoria] of Object.entries(data.categorias)) {
    precosSimplificados[id] = categoria.itens.map(item => ({
      nome: item.nome,
      preco_regular: item.preco_regular,
      preco_parceria_min: item.preco_parceria_min,
      preco_parceria_max: item.preco_parceria_max
    }));
  }
  
  // Usa a data de atualização como parte do hash
  const dataAtualizacao = data.configuracoes.data_atualizacao;
  
  // Cria uma string do objeto e usa como hash
  return JSON.stringify({ precos: precosSimplificados, data: dataAtualizacao });
}

/**
 * Envia os dados de preços para o webhook do Discord usando um único embed
 * @param {Object} data - Dados do arquivo JSON
 */
async function enviarParaDiscord(data) {
  try {
    console.log("Iniciando envio para o Discord usando um único embed...");
    
    // Conteúdo completo do embed
    let descricao = "";
    
    // Processa cada categoria
    for (const [id, categoria] of Object.entries(data.categorias)) {
      console.log(`Processando categoria: ${categoria.titulo}`);
      
      // Adiciona o cabeçalho da categoria
      descricao += `**### ${categoria.titulo.toUpperCase()}**\n`;
      
      // Adiciona cada item
      categoria.itens.forEach(item => {
        const isPercentage = item.isPercentage || false;
        const precoRegular = isPercentage ? `${item.preco_regular}%` : formatarNumero(item.preco_regular);
        
        let precosParceria;
        if (id === 'lavagem') {
          precosParceria = isPercentage ? `${item.preco_parceria_min}%` : formatarNumero(item.preco_parceria_min);
        } else {
          const precoMinParceria = isPercentage ? `${item.preco_parceria_min}%` : formatarNumero(item.preco_parceria_min);
          const precoMaxParceria = isPercentage ? `${item.preco_parceria_max}%` : formatarNumero(item.preco_parceria_max);
          precosParceria = `${precoMinParceria} ~ ${precoMaxParceria}`;
        }
        
        // Determina o emoji apropriado para o item
        let emoji = "";
        if (typeof emojiPorCategoria[id] === 'object') {
          // Se temos emojis específicos por item nesta categoria
          emoji = emojiPorCategoria[id][item.nome] || "";
        } else {
          // Se temos um emoji geral para a categoria
          emoji = emojiPorCategoria[id] || "";
        }
        
        // Adiciona a linha do item
        descricao += `**${item.nome}** ${emoji}\n`;
        descricao += `\`\`\`${precoRegular} | P: ${precosParceria}\`\`\`\n`;
      });
      
      // Adiciona uma linha em branco entre categorias
      descricao += "\n";
    }
    
    // Adiciona a nota de rodapé
    descricao += "**Qualquer facção que não respeitar o preço imposto pela cúpula, será penalizada monetariamente. Punição escalável.**";
    
    // Verifica se o texto é muito longo para um único embed e trunca se necessário
    if (descricao.length > 4096) {
      console.log(`Descrição excede o limite (${descricao.length} caracteres). Truncando...`);
      descricao = descricao.substring(0, 4000) + "...\n**[Tabela truncada devido ao limite do Discord]**";
    }
    
    // Cria o embed
    const embed = {
      title: "TABELA DE PREÇOS ILEGAL",
      description: descricao,
      color: discordConfig.corEmbed,
      footer: {
        text: `Preços atualizados em ${data.configuracoes.data_atualizacao}`
      }
    };
    
    // Configura o payload para o webhook
    const payload = {
      username: discordConfig.botName,
      avatar_url: discordConfig.botAvatar,
      embeds: [embed]
    };
    
    // Envia o payload para o webhook
    const response = await fetch(discordConfig.webhookURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro ao enviar para o Discord: ${response.status} - ${errorText}`);
      return false;
    }
    
    console.log('Preços enviados para o Discord com sucesso!');
    return true;
  } catch (erro) {
    console.error('Erro ao enviar para o Discord:', erro);
    return false;
  }
}

/**
 * Força o envio dos preços para o Discord, ignorando verificação de mudanças
 * @param {Object} data - Dados do arquivo JSON
 */
async function forcarEnvioDiscord(data) {
  if (!discordConfig.ativado || !discordConfig.webhookURL) {
    console.log('Integração com Discord desativada ou webhook não configurado');
    return false;
  }
  
  console.log('Forçando envio de preços para o Discord...');
  
  // Envia para o Discord
  const sucesso = await enviarParaDiscord(data);
  
  if (sucesso) {
    // Atualiza o hash
    const hashAtual = await criarHashDados(data);
    localStorage.setItem('precosHash', hashAtual);
    localStorage.setItem('precosUltimaAtualizacao', data.configuracoes.data_atualizacao);
  }
  
  return sucesso;
}

/**
 * Formata um número para o formato monetário sem o símbolo de $
 * @param {number} valor - Valor a ser formatado
 * @returns {string} Valor formatado
 */
function formatarNumero(valor) {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
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

// Exibe mensagem no console
console.log('Módulo Discord ' + (discordConfig.ativado ? 'ativado' : 'desativado'));

// Exporta funções para uso em outros arquivos
window.discordIntegration = {
  verificarMudancasEEnviar,
  forcarEnvioDiscord,
  config: discordConfig
};
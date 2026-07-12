# 🏆 VI Todas as Danças — Sistema de Apuração e Placar de Rankings

Este repositório contém o código-fonte do **Sistema de Apuração e Placar de Rankings** do festival *"VI Todas as Danças - Festival de Dança de São Sebastião 2026"*. O sistema é alimentado por uma Planilha do Google (Google Sheets) via Google Apps Script e apresenta um painel dinâmico em tempo real para controle, monitoramento de premiações e suporte ao locutor do evento.

---

## 📋 Visão Geral e Arquitetura

O sistema opera no modelo **offline-first e sincronização contínua**. Ele foi otimizado para atuar como um placar de rankings dinâmico e visualizador de impressão para premiação de troféus.

```
┌─────────────────────────────────┐
│     Planilha do Google          │ (Banco de dados principal:
│ (Coreografias, Notas, Ordem)    │  Apenas abas necessárias)
└────────────────┬────────────────┘
                 │
                 ▼ (Google Apps Script API)
┌─────────────────────────────────┐
│       Visualizador Web          │ (Placar de Rankings Ao Vivo
│      (HTML5 / JS / CSS)         │  Auto-refresh de 5s + Cache Local)
└─────────────────────────────────┘
```

1. **Planilha de Lançamento (Origem)**: O operador lança as notas dos jurados diretamente em sua planilha principal.
2. **Importação Automática (`IMPORTRANGE`)**: Os dados das notas (J1, J2, J3, média e maior nota) são transferidos de forma automática para a planilha vinculada ao Apps Script deste repositório.
3. **Placar em Tempo Real**: A interface web consome a planilha a cada **5 segundos** de forma transparente via AJAX (`google.script.run`) e renderiza os rankings de forma reativa, sem necessidade de atualizar a página (`F5`).

---

## ✨ Principais Funcionalidades

### 1. Atualização Automática Dinâmica (Auto-Refresh de 5s)
A tela de Rankings atualiza a tabela e as posições em tempo real (5s), reordenando as apresentações conforme os dados são lançados na planilha. Conta também com um **Indicador de Conexão** no canto superior que alerta se o dispositivo perder o acesso à internet.

### 2. Controle de Falso-Positivo na Digitação (Filtro de Três Notas)
Para evitar que a tela exiba médias parciais e erradas enquanto o operador digita (por exemplo, exibir média `3.33` logo após digitar a nota `10.0` do primeiro jurado), implementamos uma validação de segurança:
* A média e a maior nota **só são calculadas e exibidas quando as três notas dos jurados estiverem totalmente preenchidas** e válidas.
* Enquanto as três notas não constarem, a coreografia permanecerá listada no final da categoria com o rótulo **`⏳ Pendente`** e notas `- / - / -`.

### 3. Filtro Inteligente e Dinâmico por Mostra (Chips)
A interface possui botões de filtro rápido estilo "chips" que são construídos dinamicamente com base nas mostras existentes na planilha (ex: *Mostra Competitiva*, *Mostra PCD*, *Não Competitiva*).
* Ao selecionar uma mostra, o painel exibe **apenas** as seções e tabelas daquela mostra.
* Categorias que não possuem nenhuma coreografia na mostra selecionada são **totalmente ocultadas**, otimizando a leitura do locutor.

### 4. Definição da Ordem de Premiação (Ordem de Gêneros)
Através de um painel estilo *accordion* ("Definir Ordem de Premiação"), a coordenação do festival pode redefinir numericamente a ordem em que os gêneros e categorias serão apresentados e salvá-la diretamente no banco de dados remoto da planilha, sincronizando a ordem de leitura em todos os dispositivos instantaneamente.

### 5. Regras do Edital & Critérios de Desempate (Edital Fundass nº 02/2026)
* **Limiares de Nota Mínima (Item 7.3 do Edital)**:
  * 🥇 **1º Lugar**: Média mínima de `9.0`
  * 🥈 **2º Lugar**: Média mínima de `8.0`
  * 🥉 **3º Lugar**: Média mínima de `7.0`
  * *Se um grupo obtiver a maior nota de uma categoria, mas sua média for, por exemplo, 8.5, ele será classificado como 2º Lugar (o 1º Lugar é omitido). O sistema exibe um pequeno asterisco cinza `*` detalhando essa regra.*
* **Desempate por Maior Nota (Item 7.4.1)**: Havendo empate na média, o sistema consulta a coluna de maior nota atribuída pelos jurados para decidir o vencedor.
* **Detecção de Empates Persistentes (Item 7.4.1.1)**: Se o empate persistir na média e na maior nota, o sistema exibe automaticamente um distintivo **`⚠️ EMPATE`**, alertando a banca organizadora para a deliberação na coxia.
* **Apenas Mostra (Não Competitiva)**: Coreografias identificadas como apenas mostra aparecem no rodapé da categoria de forma itálica, com o rótulo `✨ Apenas Mostra`, sem disputar ou interferir nas colocações competitivas.

### 6. Geração de PDF e Impressão Limpa Automática
* **Ocultação de URL/Data**: Utiliza regras avançadas de impressão CSS (`@page { margin: 0; }`) que forçam o navegador a **ocultar automaticamente a URL do script, a data e o título da página** no topo e no rodapé do PDF.
* **Margens de Segurança contra Cortes de Impressora**: Para compensar a perda física de margem mecânica das impressoras de papel, o estilo de impressão aplica `padding-top: 1.4cm` e `padding-bottom: 1.4cm` a cada bloco de categoria, gerando uma área de impressão segura que nunca sofre colapso de margens no Chrome.
* **Prevenção de Quebras de Linha Órfãs**: Categorias e tabelas são protegidas contra quebras entre páginas (`page-break-inside: avoid;`). As linhas da tabela nunca são cortadas ao meio.

---

## 📊 Estrutura da Planilha do Google (Banco de Dados)

O banco de dados foi simplificado para conter apenas as abas de dados operacionais ativos. As abas antigas de gerenciamento interno de jurados e auditoria (`Jurados` e `Log`) foram **desconectadas do script** e podem ser excluídas sem problemas.

As abas necessárias são:

1. **`Coreografias`**:
   * *Colunas obrigatórias*: `Nº de Ordem Global`, `Nome da Coreografia`, `Grupo/Companhia/Academia`, `Mostra`, `Gênero`, `Subgênero`, `Categoria`, `Dia de Apresentação`, `Status`.
2. **`Notas`**:
   * *Colunas obrigatórias*: `Nº de Ordem`, `Nome da Coreografia`, `Grupo`, `Mostra`, `Gênero`, `Subgênero`, `Categoria`, `Jurado 1`, `Jurado 2`, `Jurado 3`, `Média`, `Maior Nota`, `Observação`.
3. **`Ordem_Relatorio`** *(Oculta)*:
   * Contém a lista com o mapeamento e a ordenação personalizada das categorias.

---

## 🛠️ Instruções de Implantação no Google Apps Script

Para implantar ou atualizar o placar do festival:

1. Abra a sua Planilha do Google vinculada ao sistema de notas.
2. No menu superior, clique em **Extensões** > **Apps Script**.
3. Crie os seguintes arquivos no editor do Apps Script:
   * **`Código.gs`** (tipo: Script): Copie e cole todo o conteúdo do arquivo `Código.gs` contido nesta pasta.
   * **`Index.html`** (tipo: HTML): Copie e cole todo o conteúdo do arquivo `index.html` contido nesta pasta (ou crie um arquivo HTML e renomeie-o para `Index`).
4. Salve o projeto (`Ctrl + S`).
5. Clique em **Implantar** > **Nova implantação**:
   * Tipo: *Aplicativo da Web*
   * Executar como: *Eu (seu-email@gmail.com)*
   * Quem pode acessar: *Qualquer pessoa* (necessário para que outros dispositivos acessem o placar)
6. Copie a URL gerada do Web App e abra-a no navegador da TV, tablet ou celular para acompanhar as notas ao vivo.

---

*Desenvolvido com foco em desempenho, segurança e conformidade absoluta com as regras do festival.* 🏆✨

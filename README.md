# RELATÓRIO TÉCNICO: SISTEMA DISTRIBUÍDO DE AUTOPEÇAS

## 1. Introdução
Este relatório descreve a fundamentação teórica para o desenvolvimento de um sistema de gerenciamento de autopeças. O projeto adota o modelo de **Sistemas Distribuídos**, utilizando uma arquitetura **Cliente-Servidor** para garantir a separação entre a interface do usuário e a lógica de negócios.

## 2. Arquitetura do Sistema
O sistema é dividido em duas camadas principais que se comunicam através da rede:
- **Client (Cliente):** Interface desenvolvida em HTML/JavaScript que realiza requisições assíncronas (AJAX/Fetch).
- **Server (Servidor):** API desenvolvida em PHP que processa as regras de negócio e acessa o banco de dados.

## 3. Framework Utilizado: Slim Framework (PHP)
Para a construção da camada servidora, foi escolhido o **Slim Framework**. 
- **Justificativa:** Por ser um micro-framework, o Slim oferece as ferramentas essenciais para roteamento de APIs sem a complexidade de frameworks maiores. Ele permite a criação de endpoints **RESTful** que retornam dados em formato **JSON**, facilitando a interoperabilidade no ambiente distribuído.

## 4. Persistência de Dados: Microsoft SQL Server
A gestão dos dados será realizada no **Microsoft SQL Server (MSSQL)**, utilizando o **SQL Server Management Studio (SSMS)** para administração.
- **Integração:** A conexão será feita via driver `sqlsrv` do PHP, garantindo alta performance e segurança em ambiente Windows.
- **Vantagem:** O uso do MSSQL em sistemas distribuídos oferece suporte nativo a transações complexas (ACID), garantindo que o estoque de peças seja atualizado de forma consistente mesmo com múltiplos acessos simultâneos.

## 5. Conceitos de Sistemas Distribuídos Aplicados
- **Concorrência:** O servidor gerencia múltiplas requisições de diferentes clientes simultaneamente.
- **Escalabilidade:** A separação entre o banco de dados SQL Server e a API PHP permite escalar os recursos de hardware de forma independente.
- **Tolerância a Falhas:** O design permite a implementação futura de clusters de banco de dados para garantir alta disponibilidade.

## 6. Conclusão
A combinação do **Slim Framework** com o **Microsoft SQL Server** provê uma base sólida e profissional para o projeto, atendendo aos requisitos de um sistema distribuído moderno, seguro e eficiente.

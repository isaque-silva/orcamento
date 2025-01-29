# Sistema de Orçamentos

Este é um sistema de geração de orçamentos desenvolvido com React, TypeScript e Supabase.

## Funcionalidades

- Cadastro e gerenciamento de clientes
- Criação e gerenciamento de orçamentos
- Configuração da conexão com o Supabase
- Interface moderna e responsiva com Chakra UI

## Pré-requisitos

- Node.js (versão 14 ou superior)
- NPM ou Yarn
- Conta no Supabase (https://supabase.com)

## Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Configuração do Supabase

1. Crie uma conta no Supabase (https://supabase.com)
2. Crie um novo projeto
3. Na página de configurações do projeto, copie a URL e a chave anônima
4. No sistema, acesse a página de Configurações e insira os dados do Supabase

## Estrutura do Banco de Dados

### Tabela: clientes
- id (uuid, primary key)
- nome (text)
- email (text)
- telefone (text)
- endereco (text)
- created_at (timestamp with time zone)

### Tabela: orcamentos
- id (uuid, primary key)
- numero (text)
- cliente_id (uuid, foreign key)
- data (date)
- valor_total (numeric)
- status (text)
- observacoes (text)
- created_at (timestamp with time zone)

### Tabela: itens_orcamento
- id (uuid, primary key)
- orcamento_id (uuid, foreign key)
- descricao (text)
- quantidade (numeric)
- valor_unitario (numeric)
- valor_total (numeric)

## Tecnologias Utilizadas

- React
- TypeScript
- Vite
- Chakra UI
- React Router DOM
- React Hook Form
- Supabase

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

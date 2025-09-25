# EduConnect - Plataforma de Mentoria

Um SPA (Single Page Application) moderno e acessível que conecta alunos e mentores para aprendizado colaborativo.

## 🚀 Características

- **Design System Personalizado**: Tema escuro com alto contraste e foco na acessibilidade
- **Autenticação Completa**: Sistema de login/cadastro com diferentes roles (aluno/mentor)
- **Integração Airtable**: Backend completo usando Airtable REST API
- **Responsivo**: Interface adaptativa para desktop e mobile
- **Acessível**: Implementa WCAG 2.1 com foco visível, ARIA labels e navegação por teclado
- **TypeScript**: Tipagem completa para maior confiabilidade

## 🎨 Design System

### Cores do Tema
- **Brand Primary**: `#2447F9` - Azul principal da marca
- **Brand Secondary**: `#1B2B66` - Azul escuro secundário  
- **Background**: `#0B0E16` - Fundo principal escuro
- **Surface**: `#121725` - Superfícies elevadas
- **Text**: `#E6E9F2` - Texto principal claro
- **Accent**: `#36E3A8` - Verde de destaque
- **Danger**: `#FF5D5D` - Vermelho para alertas

### Componentes Customizados
- Gradientes definidos no design system
- Sombras com glow effects
- Animações suaves e transições
- Skeletons com shimmer effect

## 🔧 Configuração

### Variáveis de Ambiente Necessárias

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_AIRTABLE_API_KEY=your_airtable_api_key
VITE_AIRTABLE_BASE_ID=your_base_id
VITE_AIRTABLE_USERS=Users
VITE_AIRTABLE_GRUPOS=Grupos
VITE_AIRTABLE_SESSOES=Sessoes
```

### Esquema Airtable

#### Tabela Users
- `email` (E-mail, primary key)
- `password_hash` (Single line text)
- `role` (Single select: aluno, mentor)
- `nome` (Single line text)
- `areas` (Multiple select)
- `preco_hora` (Currency)
- `bio` (Long text)
- `foto_url` (URL)
- `created_at` (Created time)
- `record_id` (Formula: RECORD_ID())
- `email_lc` (Formula: LOWER(email))

#### Tabela Grupos
- `nome` (Single line text)
- `descricao` (Long text)
- `owner_user` (Link to Users)
- `membros` (Link to Users, múltiplos)
- `criado_em` (Created time)
- `record_id` (Formula: RECORD_ID())

#### Tabela Sessoes
- `id` (Auto number, primary)
- `mentor` (Link to Users)
- `aluno` (Link to Users)
- `inicio` (Date & time)
- `fim` (Date & time)
- `status` (Single select: solicitada, confirmada, concluida, cancelada)
- `observacoes` (Long text)
- `criado_em` (Created time)
- `record_id` (Formula: RECORD_ID())

## 🏗️ Arquitetura

### Estrutura de Pastas
```
src/
├── components/           # Componentes reutilizáveis
│   ├── ui/              # Componentes shadcn customizados
│   ├── Header.tsx       # Cabeçalho com navegação
│   ├── ProtectedRoute.tsx # Roteamento protegido
│   └── ...
├── contexts/            # Contextos React
│   └── AuthContext.tsx  # Gerenciamento de autenticação
├── pages/               # Páginas da aplicação
│   ├── Login.tsx        # Login/Cadastro
│   ├── HomeAluno.tsx    # Dashboard do aluno
│   ├── HomeMentor.tsx   # Dashboard do mentor
│   └── ...
├── services/            # Serviços e APIs
│   └── airtableClient.ts # Cliente HTTP para Airtable
├── utils/               # Utilitários
│   ├── crypto.ts        # Funções de hash SHA-256
│   └── smokeTests.ts    # Testes de funcionalidade
└── hooks/               # Custom hooks
```

### Roteamento
- `/login` - Página de autenticação
- `/home-aluno` - Dashboard para alunos
- `/home-mentor` - Dashboard para mentores
- `/mentores` - Listagem de mentores (em breve)
- `/grupos` - Grupos de estudo (em breve)
- `/sessoes` - Sessões de mentoria (em breve)

## 🔐 Segurança

- **Hash de Senhas**: SHA-256 client-side antes de enviar para API
- **Autenticação Persistente**: localStorage com limpeza automática
- **Roteamento Protegido**: Verificação de role em todas as rotas
- **Validação de Entrada**: Validação client-side em todos os formulários
- **Case Insensitive**: E-mails normalizados para lowercase

## 🧪 Testes

Execute os testes de funcionalidade no console do navegador:

```javascript
import { runSmokeTests } from './src/utils/smokeTests';
runSmokeTests();
```

Testa:
- Hash e verificação de senhas
- Normalização de e-mails
- Variáveis de ambiente
- Funcionalidades críticas

## 🎯 Funcionalidades Implementadas

### ✅ Completas
- Sistema de autenticação (login/cadastro)
- Diferentes roles (aluno/mentor)
- Dashboard personalizado por role
- Integração completa com Airtable
- Design system responsivo
- Navegação acessível
- Validação de formulários

### 🚧 Em Desenvolvimento
- Listagem e busca de mentores
- Sistema de grupos de estudo
- Agendamento de sessões
- Chat entre usuários
- Sistema de avaliações
- Notificações

## 🚀 Deploy

1. Configure as variáveis de ambiente no seu provedor
2. Build o projeto: `npm run build`
3. Deploy os arquivos da pasta `dist`

## 📱 Responsividade

- Mobile First design
- Breakpoints otimizados
- Menu hamburguer em mobile
- Touch-friendly interfaces
- Testes em dispositivos reais

## ♿ Acessibilidade

- WCAG 2.1 AA compliant
- Navegação por teclado completa
- Screen reader friendly
- Alto contraste (4.5:1 mínimo)
- Focus visível em todos os elementos
- ARIA labels apropriados
- Semântica HTML correta

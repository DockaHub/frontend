
# Docka Workspace - Design System & UI/UX Guidelines

**Versão:** 3.0 (Current Production)
**Framework:** React + Tailwind CSS
**Ícones:** Lucide React
**Filosofia:** "Enterprise Minimalist" - Foco em densidade de informação, contraste semântico e suporte nativo a Dark Mode.

---

## 1. Fundamentos Visuais

### Paleta de Cores (Core)
O sistema baseia-se em uma escala de cinzas frios (`docka-*`) para o tema claro e `zinc-*` para o tema escuro, garantindo conforto visual.

| Token | Light Mode (`docka-*`) | Dark Mode (`zinc-*`) | Uso |
|-------|------------------------|----------------------|-----|
| **Canvas** | `bg-white` | `bg-zinc-950` | Fundo principal da aplicação (App Shell). |
| **Surface** | `bg-docka-50` | `bg-zinc-900` | Fundo de sidebars, áreas secundárias, headers de tabelas. |
| **Border** | `border-docka-200` | `border-zinc-800` | Bordas estruturais, divisores. |
| **Border Soft**| `border-docka-100` | `border-zinc-800` | Divisores internos sutis. |
| **Text Main** | `text-docka-900` | `text-zinc-100` | Títulos, valores importantes. |
| **Text Sec** | `text-docka-600` | `text-zinc-400` | Corpo de texto, descrições. |
| **Text Muted** | `text-docka-400` | `text-zinc-500` | Placeholders, ícones inativos, metadados. |

### Identidade de Tenants (Branding)
Cada organização possui uma cor primária que dita acentos, badges e botões de ação em seus respectivos dashboards.

| Tenant | Cor Semântica | Tailwind Class (Light/Dark) |
|--------|---------------|-----------------------------|
| **Docka (HQ)** | Slate/Zinc | `bg-docka-900` / `bg-zinc-100` |
| **Tokyon** | Red/Orange | `bg-red-600` ou `bg-orange-600` |
| **Fauves** | Amber | `bg-amber-500` |
| **Asterysko** | Blue | `bg-blue-600` |
| **UmaChave** | Orange | `bg-orange-600` |
| **Hostizi** | Emerald | `bg-emerald-600` |

---

## 2. Tipografia

**Família:** Inter (`sans-serif`).
**Anti-aliasing:** Sempre ativo (`antialiased`).

*   **Page Title (H1):** `text-2xl font-bold text-docka-900 dark:text-zinc-100`
*   **Section Title (H2):** `text-lg font-bold text-docka-900 dark:text-zinc-100`
*   **Card Header (H3):** `text-sm font-bold text-docka-900 dark:text-zinc-100`
*   **Label/Micro:** `text-xs font-bold text-docka-500 dark:text-zinc-500 uppercase tracking-wider`
*   **Monospace:** Usado para IDs, Protocolos e IPs (`font-mono text-xs`).

---

## 3. Componentes Estruturais (Layout)

### App Shell
A aplicação segue um layout de **Sidebar Fixa + Área de Conteúdo Fluida**.

*   **Sidebar:**
    *   Width: `w-[260px]` (aberta), `w-[68px]` (fechada).
    *   Bg: `bg-docka-50 dark:bg-zinc-900`.
    *   Border: `border-r border-docka-200 dark:border-zinc-800`.
*   **Main Content:**
    *   Container: `flex-1 h-full overflow-hidden flex flex-col`.
    *   Background: `bg-white dark:bg-zinc-950`.

### View Header (Padrão de Página)
Barra superior fixa dentro da área de conteúdo.

```tsx
<div className="h-16 border-b border-docka-200 dark:border-zinc-800 flex items-center justify-between px-6 shrink-0 bg-white dark:bg-zinc-950 z-20">
  <h1 className="text-xl font-bold text-docka-900 dark:text-zinc-100">Título da Página</h1>
  <div className="flex gap-2">
    {/* Ações / Filtros */}
  </div>
</div>
```

---

## 4. Biblioteca de Componentes (Snippets)

### Botões

**Primary (Action)**
```tsx
<button className="bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2">
  <Plus size={16} /> Criar Novo
</button>
```

**Secondary / Ghost**
```tsx
<button className="bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 text-docka-700 dark:text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-50 dark:hover:bg-zinc-700 transition-colors">
  Cancelar
</button>
```

**Icon Button**
```tsx
<button className="p-1.5 text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
  <MoreHorizontal size={16} />
</button>
```

### Cards & Surfaces

**Card Padrão**
```tsx
<div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm hover:border-docka-300 dark:hover:border-zinc-700 transition-all">
  {/* Conteúdo */}
</div>
```

**Metric Card (KPI)**
```tsx
<div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
    <div className="flex items-center justify-between mb-4">
       <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Icon size={20} /></div>
    </div>
    <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">Valor</h3>
    <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">Legenda</p>
</div>
```

### Tabelas (Data Grid)

```tsx
<div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
    <table className="w-full text-sm text-left">
        <thead className="bg-docka-50 dark:bg-zinc-800/50 text-docka-500 dark:text-zinc-500 font-semibold text-xs uppercase tracking-wider border-b border-docka-100 dark:border-zinc-800">
            <tr>
                <th className="px-6 py-4">Coluna 1</th>
                <th className="px-6 py-4 text-right">Ações</th>
            </tr>
        </thead>
        <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
            <tr className="hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4 text-docka-900 dark:text-zinc-100">Dado</td>
                <td className="px-6 py-4 text-right">...</td>
            </tr>
        </tbody>
    </table>
</div>
```

### Badges de Status

Sempre usar `bg-opacity-100` no light e `bg-opacity-30` no dark para contraste.

*   **Sucesso:** `bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800`
*   **Aviso:** `bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800`
*   **Erro:** `bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800`
*   **Neutro:** `bg-docka-100 dark:bg-zinc-800 text-docka-600 dark:text-zinc-400 border border-docka-200 dark:border-zinc-700`

### Modal (Padrão)

Use o componente `<Modal />` existente. Ele lida com `Backdrop`, `Animation` (zoom-in) e `Dark Mode`.

```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Título do Modal"
  size="lg" // sm, md, lg, xl
  footer={
    <>
      <button>Cancelar</button>
      <button>Salvar</button>
    </>
  }
>
  {/* Conteúdo */}
</Modal>
```

---

## 5. Animações e Feedback

Utilizamos `tailwindcss-animate`.

*   **Entrada de Página:** `animate-in fade-in duration-300`
*   **Modais/Dialogs:** `animate-in zoom-in-95 duration-200`
*   **Painéis Laterais:** `animate-in slide-in-from-right duration-300`
*   **Toasts:** `animate-in slide-in-from-right-10 fade-in`

---

## 6. Diretrizes de UX

1.  **Empty States:** Nunca deixe uma lista ou tabela vazia em branco. Use um ícone centralizado (tamanho 32/48px), um título e uma instrução ou botão de ação (CTA).
2.  **Breadcrumbs:** Sempre mostre o caminho em visualizações profundas (ex: Drive, Processos).
3.  **Loading:** Use `animate-pulse` em esqueletos (skeletons) cinzas (`bg-docka-100 dark:bg-zinc-800`) em vez de spinners gigantes, exceto para ações de bloqueio de tela.
4.  **Mobile:** Todas as Sidebars devem se transformar em Drawers (`fixed inset-y-0 left-0`) em telas menores que `lg`. Os Headers devem ganhar um botão de Menu (Hambúrguer).

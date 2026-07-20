# ManySpace - Design System & UI/UX Guidelines

**Versão:** 4.0 (ManySpace Rebranding)
**Framework:** React + Tailwind CSS
**Ícones:** Lucide React
**Filosofia:** "Minimalist Clean Canvas" - Foco em contrastes geométricos, divisores finos, fundo branco sólido e acentos de cores vibrantes específicos por tenant.

---

## 1. Fundamentos Visuais

### Paleta de Cores (Core)
O sistema baseia-se em um fundo branco absoluto para conforto e leveza visual, utilizando divisores finos para delimitar as áreas de dados.

| Token | Valor CSS/Hex | Uso |
|-------|---------------|-----|
| **Canvas** | `#ffffff` | Fundo principal da aplicação (App Shell, Cards, Grids). |
| **Border / Divider** | `#e5e5e5` (1px) | Bordas estruturais de cards, divisores e tabelas. |
| **Text Main** | `#000000` | Títulos, valores importantes, textos padrão. |
| **Text Sec** | `#7f7f7f` | Corpo de texto secundário, descrições. |
| **Text Muted** | `#9f9f9f` | Legendas pequenas, metadados, placeholders. |

### Identidade e Acentos de Tenants (Branding)
Cada tenant/organização dita o acento visual ativo do seu menu lateral (item ativo), botões de ação primários e links de destaque.

| Tenant | Cor Semântica | Hex | Tailwind Class (Active) |
|--------|---------------|-----|-------------------------|
| **ManySpace / Manyways (HQ)** | Orange-Red | `#fd6b32` | `text-manyspace-orange` / `bg-manyspace-orange` |
| **Asterysko** | Vibrant Blue | `#0412dd` | `text-blue-700` / `bg-blue-700` |
| **Fauves** | Dark Purple-Blue | `#2a2ad7` | `text-indigo-700` / `bg-indigo-700` |

---

## 2. Tipografia

*   **Season Mix (Regular):** Usado para títulos de saudação estilizados (ex: "Olá, Levy" - 22px) e grandes valores numéricos/KPIs (32px).
*   **Plus Jakarta Sans (Medium/SemiBold):** Usado para itens de navegação (12px), títulos de tabelas (14px), labels, metadados (10px) e corpo de texto.
*   **IBM Plex Mono (Monospace):** Usado para identificadores, tags técnicas e dados monospaçados.

---

## 3. Componentes Estruturais (Layout)

### App Shell
A aplicação segue um layout geométrico limpo.

*   **Sidebar:**
    *   Width: `w-[180px]` (fixo).
    *   Bg: `#ffffff`.
    *   Border: Borda direita de 1px (`border-r border-[#e5e5e5]`).
    *   Padding: `p-[15px]`.
    *   Item Gap: `gap-[27px]`.
*   **Main Content:**
    *   Container: `flex-1 h-full overflow-hidden flex flex-col`.
    *   Background: `#ffffff`.

---

## 4. Exemplos de Componentes (Snippets)

### Botões e Ícones Ativos
Sempre aplicar a cor de acento condicional do tenant ativo:

```tsx
// Exemplo ManySpace HQ
<button className="bg-[#fd6b32] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
  Criar Novo
</button>
```

### Metric Card (KPI)
Fundo branco, borda `#e5e5e5`, padding de 30px e fonte Season Mix:

```tsx
<div className="bg-white border border-[#e5e5e5] p-[30px] flex flex-col gap-[50px] w-[334px] h-[221px]">
  <h4 className="text-sm font-medium text-black">Receita de ABRIL</h4>
  <div className="flex flex-col gap-2">
    <span className="font-['Season_Mix'] text-[32px] leading-[32px] text-black">R$ 771.297,00</span>
    <span className="text-[10px] font-semibold text-[#9f9f9f]">+12% vs mês anterior</span>
  </div>
</div>
```

### Tabelas (Data Grid)
Bordas de 1px `#e5e5e5`, sem fundos cinzas.

```tsx
<div className="bg-white border border-[#e5e5e5]">
  <table className="w-full text-left">
    <thead>
      <tr className="border-b border-[#e5e5e5] text-xs font-semibold text-black">
        <th className="p-4">Prioridade</th>
        <th className="p-4">Item</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-[#e5e5e5] text-sm text-[#7f7f7f] hover:bg-[#f5f5f5]/30">
        <td className="p-4 text-black">Alta</td>
        <td className="p-4">Pagamento INPI</td>
      </tr>
    </tbody>
  </table>
</div>
```

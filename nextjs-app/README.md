# CasaManager — Next.js + Tailwind + Shadcn UI

Versión moderna del `CasaManager.html` migrada a React con **Next.js**, **Tailwind CSS** y **Shadcn UI**.

## Características

✨ **UI Moderna:**
- Interfaz elegante con Tailwind CSS + Shadcn UI
- Componentes reutilizables (Button, Card, Input, Dialog, Badge, etc.)
- Tema claro/oscuro con transiciones suaves
- Responsive design (mobile, tablet, desktop)
- Iconos y emojis para mejor UX

⚙️ **Funcionalidad:**
- ✅ Formulario de gastos con validación
- ✅ Tabla histórica con búsqueda
- ✅ Gestión de personas (Kevin/Alba) con modal de edición
- ✅ Reasignación de gastos cuando se elimina persona
- ✅ Presupuestos mensuales con barras de progreso
- ✅ Alertas de presupuesto excedido
- ✅ Gráfico de categorías (Chart.js)
- ✅ Balances por cuenta y persona
- ✅ Exportar/importar datos (JSON)

💾 **Persistencia:**
- localStorage para almacenamiento local
- Datos persistentes entre sesiones
- Export/import para backups

## Quick Start

### 1. Instalar dependencias

```bash
cd nextjs-app
npm install
```

### 2. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### 3. Build para producción

```bash
npm run build
npm start
```

## Estructura del proyecto

```
nextjs-app/
├── components/         # React components
│   ├── ui/            # Shadcn UI components (Button, Card, Dialog, etc.)
│   ├── Layout.js      # Layout con theme toggle
│   ├── Header.js      # Header mejorado
│   ├── AddExpenseForm.js
│   ├── ExpensesList.js
│   ├── BudgetPanel.js
│   ├── OwnersList.js
│   └── CategoryChart.js
├── contexts/          # React Context
│   └── GastosContext.js
├── lib/              # Utilidades
│   └── data.js
├── pages/            # Rutas Next.js
│   ├── _app.js
│   └── index.js
├── styles/           # CSS global
│   └── globals.css
└── [config files]
```

## Componentes Shadcn UI

Los siguientes componentes están predefinidos en `components/ui/`:
- **Button** - Botones con variantes (default, destructive, outline, ghost)
- **Card** - Cards con header, title, content, footer
- **Input** - Inputs con estilos consistentes
- **Select** - Selects mejorados
- **Dialog** - Modales para edición y confirmación
- **Badge** - Etiquetas para estados
- **Label** - Labels para formularios

## Datos (localStorage)

Almacenamiento bajo la clave `gastosData_v1`:
```json
{
  "accounts": [...],
  "owners": [...],
  "categories": [...],
  "budgets": [...],
  "expenses": [...]
}
```

Tema guardado en `gastos_theme` (light/dark).

## Extender Shadcn UI

Para agregar más componentes de Shadcn UI:

```bash
npx shadcn-ui@latest add [component]
```

Luego importa en tus componentes:
```jsx
import { Component } from '@/components/ui/component'
```

Componentes recomendados:
- Tabs (para navegación)
- Tooltip (para hints)
- DropdownMenu (para acciones)
- AlertDialog (para confirmaciones)

## Customización

### Cambiar colores

Edita `styles/globals.css` para ajustar las variables CSS:
```css
:root {
  --bg: #f9fafb;
  --card: #fff;
  --text: #111827;
}
```

### Agregar nuevas categorías

En `lib/data.js`, modifica `defaultData()`:
```js
categories: [
  { id: 1, name: 'Comida' },
  { id: 2, name: 'Servicios' },
  // Añade aquí...
]
```

## Próximos pasos

- [ ] Add API routes para sync en cloud (Firebase, Supabase)
- [ ] Agregar más gráficos (pie, line charts)
- [ ] Filtros avanzados en tabla de gastos
- [ ] Exportar a PDF
- [ ] Notificaciones push
- [ ] Mobile app (React Native / Expo)

## Limpieza y mantenimiento

- Archivé scripts de mantenimiento sensibles en `nextjs-app/maintenance/scripts/`.
- Los archivos de entorno con claves se movieron a `nextjs-app/maintenance/secrets/` y están **redactados** en el repositorio; coloca tus valores reales en `.env.local` localmente y no los compartas.
- Ejecuta `npm run check:secrets` para verificar que no haya secretos en archivos rastreados.



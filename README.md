# CasaManager

Aplicación personal para controlar los gastos de la casa. Esta versión es una SPA (archivo único) que guarda los datos en tu navegador usando `localStorage`.

## Contenido
- `CasaManager.html`: interfaz principal. Ábrelo con tu navegador (doble clic o `Archivo -> Abrir`).

## Características principales

### Soporte multiusuario
- Identifica la `Persona` de cada gasto (por defecto `Kevin` y `Alba`).
- Gestión de personas desde la UI: crear, editar y eliminar.
- Al eliminar una persona con gastos, un **diálogo visual** permite reasignar los gastos a otra persona.

### Presupuestos mensuales
- **Sección destacada en la parte superior** con fondo amarillo resaltado.
- Muestra presupuesto vs. gasto actual de cada persona por mes.
- Progress bar con código de colores:
  - Verde: dentro del presupuesto (≤80%)
  - Naranja: alerta (>80% y ≤100%)
  - Rojo: excedido (>100%)
- Editable en **Administrar → Presupuestos mensuales**.
 - Si alguien sobrepasa el presupuesto, verás el importe excedido (+X €) resaltado junto a su barra.

### Modo oscuro
- Dispones de un toggle "Modo oscuro" en la esquina superior derecha. Se guarda la preferencia en `localStorage`.

### Gastos detallados
- Tabla de gastos recientes con columnas:
  - Fecha
  - Cuenta
  - Persona
  - Categoría
  - **Descripción** (para anotaciones sobre cada gasto)
  - Monto

### Responsive
- Diseño adaptable a cualquier tamaño de pantalla.
- En móvil: barra lateral aparece arriba, tabla con scroll horizontal.

## Cómo usar

1. **Abre `CasaManager.html`** en tu navegador.
2. Opcionalmente, **crea nuevas cuentas y categorías** en la sección Administrar.
3. **Define presupuestos mensuales** en Administrar → Presupuestos mensuales (p.ej., 500 para Kevin, 500 para Alba).
4. **Registra gastos**: selecciona Cuenta, Persona, Categoría, Monto, Fecha y (opcional) Descripción.
5. **Monitorea en la barra lateral**:
   - Presupuestos: barra de progreso visual con gasto vs. presupuesto.
   - Balances por cuenta.
   - Resumen mensual por categoría y persona.

## Exportar / Importar

- **Exportar JSON**: descarga una copia de seguridad de tus datos.
- **Importar JSON**: restaura datos desde un archivo JSON previamente exportado.

## Almacenamiento y respaldo

- Los datos se guardan en `localStorage` del navegador (persistente entre sesiones).
- Haz exportaciones regulares para respaldos externos.
- Si borras el almacenamiento del navegador, perderás los datos si no los exportaste.

## Nota

- Esta app es personal y almacena datos solo en tu navegador (sin servidor).

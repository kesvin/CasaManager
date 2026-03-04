'use client'

import { useEffect, useRef } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend } from 'chart.js'
import { useGastos } from '../contexts/GastosContext'
import { formatMoney, getChartColors } from '../lib/data'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'

ChartJS.register(BarController, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const topOwnerLabelPlugin = {
  id: 'topOwnerLabelPlugin',
  afterDatasetsDraw(chart) {
    const { ctx } = chart
    const topOwners = chart?.options?.plugins?.topOwnerLabelPlugin?.topOwners || []
    const meta = chart.getDatasetMeta(0)

    ctx.save()
    ctx.font = '600 11px Inter, system-ui, sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    meta.data.forEach((bar, index) => {
      const ownerName = topOwners[index]
      if(!ownerName) return

      const barHeight = Math.abs(bar.base - bar.y)
      if(barHeight < 14) return

      const maxWidth = Math.max(bar.width - 8, 40)
      let text = ownerName
      if(ctx.measureText(text).width > maxWidth){
        let cut = text.length
        while(cut > 2 && ctx.measureText(`${text.slice(0, cut)}…`).width > maxWidth){
          cut -= 1
        }
        text = `${text.slice(0, cut)}…`
      }

      const yPos = barHeight >= 24 ? bar.y + 11 : (bar.y + bar.base) / 2
      const textWidth = ctx.measureText(text).width
      const tagWidth = textWidth + 10
      const tagHeight = 16

      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)'
      ctx.fillRect(bar.x - tagWidth / 2, yPos - tagHeight / 2, tagWidth, tagHeight)
      ctx.fillStyle = '#ffffff'
      ctx.fillText(text, bar.x, yPos)
    })

    ctx.restore()
  }
}

ChartJS.register(topOwnerLabelPlugin)

export default function CategoryChart(){
  const canvasRef = useRef(null)
  const chartRef = useRef(null)
  const { state } = useGastos()

  useEffect(() => {
    if(!canvasRef.current || !state) return

    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
    const start = `${currentMonth}-01`
    const end = `${currentMonth}-31`

    const totals = {}
    const totalsByCategoryOwner = {}
    state.categories.forEach(c => totals[c.name] = 0)
    state.expenses
      .filter(e => e.date>=start && e.date<=end)
      .forEach(e => {
        const cname = state.categories.find(c=>c.id===e.category_id)?.name || '(sin categoría)'
        const oname = state.owners.find(o=>o.id===e.owner_id)?.name || '—'
        totals[cname] = (totals[cname]||0) + Number(e.amount)
        if(!totalsByCategoryOwner[cname]) totalsByCategoryOwner[cname] = {}
        totalsByCategoryOwner[cname][oname] = (totalsByCategoryOwner[cname][oname] || 0) + Number(e.amount)
      })

    const labels = Object.keys(totals).filter(k => totals[k]>0).sort((a,b) => totals[b]-totals[a])
    const data = labels.map(l => totals[l])
    const topOwners = labels.map(label => {
      const ownerTotals = totalsByCategoryOwner[label] || {}
      let topOwnerName = ''
      let topAmount = -1
      Object.entries(ownerTotals).forEach(([ownerName, amount]) => {
        if(Number(amount) > topAmount){
          topAmount = Number(amount)
          topOwnerName = ownerName
        }
      })
      return topOwnerName
    })

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    const cssVars = getComputedStyle(document.documentElement)
    const textColor = cssVars.getPropertyValue('--text')?.trim() || '#ffffff'
    const mutedColor = cssVars.getPropertyValue('--muted')?.trim() || '#bbe4db'
    const borderColor = cssVars.getPropertyValue('--border')?.trim() || 'rgb(227 20 103 / 42%)'

    // Get budgets by category
    const budgetsByCategory = {};
    if (state.budgets && state.categories) {
      state.budgets.forEach(budget => {
        const cat = state.categories.find(c => c.id === budget.category_id);
        if (cat) budgetsByCategory[cat.name] = budget.amount;
      });
    }

    // Assign green if not exceeded
    const colors = labels.map((label, idx) => {
      const budget = budgetsByCategory[label];
      const spent = totals[label];
      if (budget && spent <= budget) {
        return '#22c55e'; // Tailwind green-500
      }
      return getChartColors(1, isDark)[0];
    });

    if(chartRef.current){
      chartRef.current.data.labels = labels
      chartRef.current.data.datasets[0].data = data
      chartRef.current.data.datasets[0].backgroundColor = colors
      chartRef.current.options.plugins.topOwnerLabelPlugin = { topOwners }
      chartRef.current.options.plugins.tooltip = {
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.96)',
        borderColor: borderColor,
        borderWidth: 1,
        titleColor: textColor,
        bodyColor: textColor,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const ownerName = topOwners[context.dataIndex]
            return `${formatMoney(context.parsed.y)} · Mayor gasto: ${ownerName || '—'}`
          }
        }
      }
      chartRef.current.options.scales.x = {
        ticks: {
          color: mutedColor,
          maxRotation: 0,
          autoSkip: true
        },
        grid: {
          color: isDark ? 'rgba(187, 228, 219, 0.12)' : 'rgba(29, 78, 216, 0.18)',
          drawBorder: false
        }
      }
      chartRef.current.options.scales.y = {
        ticks: {
          color: mutedColor,
          callback: (val) => formatMoney(val)
        },
        grid: {
          color: isDark ? 'rgba(187, 228, 219, 0.14)' : 'rgba(29, 78, 216, 0.2)',
          drawBorder: false
        }
      }
      chartRef.current.update()
    }else{
      chartRef.current = new ChartJS(canvasRef.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Gastos',
            data,
            backgroundColor: colors,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            topOwnerLabelPlugin: { topOwners },
            tooltip: {
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.96)',
              borderColor: borderColor,
              borderWidth: 1,
              titleColor: textColor,
              bodyColor: textColor,
              displayColors: false,
              callbacks: {
                label: (context) => {
                  const ownerName = topOwners[context.dataIndex]
                  return `${formatMoney(context.parsed.y)} · Mayor gasto: ${ownerName || '—'}`
                }
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: mutedColor,
                maxRotation: 0,
                autoSkip: true
              },
              grid: {
                color: isDark ? 'rgba(187, 228, 219, 0.12)' : 'rgba(29, 78, 216, 0.18)',
                drawBorder: false
              }
            },
            y: {
              ticks: {
                color: mutedColor,
                callback: (val) => formatMoney(val)
              },
              grid: {
                color: isDark ? 'rgba(187, 228, 219, 0.14)' : 'rgba(29, 78, 216, 0.2)',
                drawBorder: false
              }
            }
          }
        }
      })
    }

    return () => {
      // cleanup on unmount
    }
  }, [state])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gráfico por categoría</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="chart-wrap" style={{height: '200px'}}>
          <canvas ref={canvasRef} />
        </div>
      </CardContent>
      <style jsx>{`
        .chart-wrap{height:180px !important}
        @media (min-width:640px){
          .chart-wrap{height:200px !important}
        }
      `}</style>
    </Card>
  )
}

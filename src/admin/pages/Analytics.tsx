import React, { useState } from 'react';
import { useAdminState } from '../hooks/useAdminState';
import { 
  MONTHLY_REVENUE_DATA, 
  WEEKLY_ORDERS_DATA, 
  CATEGORY_DISTRIBUTION 
} from '../utils/mockData';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Package,
  Layers
} from 'lucide-react';

export const Analytics: React.FC = () => {
  const { orders } = useAdminState();
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Filter completed or active orders (non-cancelled)
  const activeOrders = orders.filter(o => o.orderStatus !== 'Cancelled');
  const deliveredOrders = orders.filter(o => o.orderStatus === 'Delivered');

  // Compute Total Revenue
  const totalRevenue = activeOrders.reduce((sum, o) => sum + o.amount, 0);

  // Compute Completed Orders Count
  const completedOrdersCount = deliveredOrders.length;

  // Compute Average Order Value
  const avgOrderValue = activeOrders.length > 0 
    ? Math.round(totalRevenue / activeOrders.length) 
    : 0;

  // Compute best sellers list from orders state
  const getProductSales = () => {
    const counts: { [key: string]: { count: number, revenue: number } } = {};
    orders.forEach(o => {
      if (o.orderStatus !== 'Cancelled') {
        const prod = o.orderedProduct.split('(')[0].trim();
        if (!counts[prod]) {
          counts[prod] = { count: 0, revenue: 0 };
        }
        counts[prod].count += o.quantity || 1;
        counts[prod].revenue += o.amount;
      }
    });
    return Object.entries(counts)
      .map(([name, val]) => ({ name, count: val.count, revenue: val.revenue }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const bestSellers = getProductSales();

  // 1. SVG Bar Chart Constants (Revenue Jan - Jun)
  const barChartWidth = 500;
  const barChartHeight = 220;
  const maxRevenue = Math.max(...MONTHLY_REVENUE_DATA.map(d => d.revenue));
  
  // 2. SVG Line Chart Constants (Weekly Orders)
  const lineChartWidth = 500;
  const lineChartHeight = 220;
  const maxCount = Math.max(...WEEKLY_ORDERS_DATA.map(d => d.count));

  // 3. SVG Donut Chart Constants
  const donutSize = 180;
  const radius = 60;
  const strokeWidth = 16;
  const circum = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="space-y-6 select-none animate-fade-in">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-playfair font-bold text-slate-800">Business Intelligence Console</h2>
        <p className="text-xs text-[#A38848] font-bold mt-0.5">Live store trends, customer ticket size analysis, and financial indicators</p>
      </div>

      {/* Summary KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Order Value</span>
          <span className="text-2xl font-playfair font-black text-slate-800 block">₹{avgOrderValue}</span>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Live basket mean</span>
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Sales Revenue</span>
          <span className="text-2xl font-playfair font-black text-slate-800 block">₹{totalRevenue.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Cumulative gross</span>
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">All Orders Tracked</span>
          <span className="text-2xl font-playfair font-black text-[#A38848] block">{completedOrdersCount} Orders</span>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Live log count</span>
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Retention Rate</span>
          <span className="text-2xl font-playfair font-black text-emerald-700 block">82.5%</span>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Loyalty baseline</span>
          </span>
        </div>
      </div>

      {/* Visual Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* BAR CHART: Monthly Revenue */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-playfair text-base font-bold text-slate-800 flex items-center gap-1.5">
              <DollarSign className="w-5 h-5 text-brand-gold-700" />
              <span>Monthly Gross Revenue Trends (₹)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Revenue data for the past 6 trading cycles</p>
          </div>

          <div className="w-full flex items-center justify-center py-4">
            <svg viewBox={`0 0 ${barChartWidth} ${barChartHeight}`} className="w-full h-auto overflow-visible select-none">
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#A38848" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((val, idx) => (
                <line
                  key={idx}
                  x1={30}
                  y1={barChartHeight - 30 - val * (barChartHeight - 60)}
                  x2={barChartWidth - 10}
                  y2={barChartHeight - 30 - val * (barChartHeight - 60)}
                  stroke="#E2E8F0"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
              ))}

              {/* Bars */}
              {MONTHLY_REVENUE_DATA.map((d, idx) => {
                const startX = 50 + idx * ((barChartWidth - 80) / 6);
                const barHeight = (d.revenue / maxRevenue) * (barChartHeight - 60);
                const barY = barChartHeight - 30 - barHeight;
                const barWidth = 26;

                return (
                  <g key={idx}>
                    <rect
                      x={startX}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      fill="url(#barGrad)"
                      rx={4}
                      className="cursor-pointer transition-all duration-300 hover:brightness-110"
                      onMouseEnter={() => setHoveredBar(idx)}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                    
                    {/* Tooltip on Hover */}
                    {hoveredBar === idx && (
                      <g>
                        <rect
                          x={startX - 22}
                          y={barY - 32}
                          width={70}
                          height={24}
                          fill="#1A1110"
                          rx={6}
                        />
                        <text
                          x={startX + 13}
                          y={barY - 16}
                          fill="#D4AF37"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          ₹{(d.revenue / 1000).toFixed(0)}k
                        </text>
                      </g>
                    )}

                    {/* Month Label */}
                    <text
                      x={startX + barWidth / 2}
                      y={barChartHeight - 10}
                      fill="#94A3B8"
                      fontSize="10"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {d.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* LINE CHART: Weekly Orders */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-playfair text-base font-bold text-slate-800 flex items-center gap-1.5">
              <ShoppingBag className="w-5 h-5 text-brand-gold-700" />
              <span>Weekly Orders Volume Trends</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Total tickets processed per weekday</p>
          </div>

          <div className="w-full flex items-center justify-center py-4">
            <svg viewBox={`0 0 ${lineChartWidth} ${lineChartHeight}`} className="w-full h-auto overflow-visible select-none">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((val, idx) => (
                <line
                  key={idx}
                  x1={30}
                  y1={lineChartHeight - 30 - val * (lineChartHeight - 60)}
                  x2={lineChartWidth - 10}
                  y2={lineChartHeight - 30 - val * (lineChartHeight - 60)}
                  stroke="#E2E8F0"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
              ))}

              {/* Generate Coordinates */}
              {(() => {
                const points = WEEKLY_ORDERS_DATA.map((d, idx) => {
                  const x = 40 + idx * ((lineChartWidth - 70) / 6);
                  const y = lineChartHeight - 30 - (d.count / maxCount) * (lineChartHeight - 60);
                  return { x, y, ...d };
                });

                const pathD = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;
                const areaD = `${pathD} L ${points[points.length - 1].x} ${lineChartHeight - 30} L ${points[0].x} ${lineChartHeight - 30} Z`;

                return (
                  <g>
                    {/* Shadow Area under the line */}
                    <path d={areaD} fill="url(#areaGrad)" />
                    
                    {/* Main Line path */}
                    <path d={pathD} fill="none" stroke="#D4AF37" strokeWidth={3} strokeLinecap="round" />
                    
                    {/* Circles on dots */}
                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={hoveredPoint === idx ? 6 : 4}
                          fill={hoveredPoint === idx ? '#1A1110' : '#D4AF37'}
                          stroke="white"
                          strokeWidth={2}
                          className="cursor-pointer transition-all duration-300"
                          onMouseEnter={() => setHoveredPoint(idx)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                        
                        {/* Tooltip */}
                        {hoveredPoint === idx && (
                          <g>
                            <rect
                              x={p.x - 20}
                              y={p.y - 30}
                              width={40}
                              height={20}
                              fill="#1A1110"
                              rx={4}
                            />
                            <text
                              x={p.x}
                              y={p.y - 17}
                              fill="white"
                              fontSize="9"
                              fontWeight="bold"
                              textAnchor="middle"
                            >
                              {p.count}
                            </text>
                          </g>
                        )}

                        {/* Weekday Label */}
                        <text
                          x={p.x}
                          y={lineChartHeight - 10}
                          fill="#94A3B8"
                          fontSize="10"
                          fontWeight="600"
                          textAnchor="middle"
                        >
                          {p.day}
                        </text>
                      </g>
                    ))}
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>

      </div>

      {/* Donut Chart & Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* DONUT CHART: Category Sales Share (1 col) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between lg:col-span-1">
          <div>
            <h3 className="font-playfair text-base font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-5 h-5 text-brand-gold-700" />
              <span>Category Share (%)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Product categorization performance share</p>
          </div>

          {/* SVG Donut */}
          <div className="flex flex-col items-center justify-center py-6">
            <svg width={donutSize} height={donutSize} className="overflow-visible select-none">
              <circle
                cx={donutSize / 2}
                cy={donutSize / 2}
                r={radius}
                fill="transparent"
                stroke="#F1F5F9"
                strokeWidth={strokeWidth}
              />
              {CATEGORY_DISTRIBUTION.map((item, idx) => {
                const strokeDash = circum;
                const strokeOffset = circum - (item.percentage / 100) * circum;
                const rotation = (accumulatedPercent / 100) * 360;
                accumulatedPercent += item.percentage;

                return (
                  <circle
                    key={idx}
                    cx={donutSize / 2}
                    cy={donutSize / 2}
                    r={radius}
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDash}
                    strokeDashoffset={strokeOffset}
                    transform={`rotate(${rotation - 90} ${donutSize / 2} ${donutSize / 2})`}
                  />
                );
              })}
              
              {/* Central text readout */}
              <text x={donutSize / 2} y={donutSize / 2 + 4} textAnchor="middle" className="font-playfair font-black text-lg text-slate-800">
                100%
              </text>
              <text x={donutSize / 2} y={donutSize / 2 + 18} textAnchor="middle" className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
                Fresh Stock
              </text>
            </svg>

            {/* Legend table */}
            <div className="w-full mt-6 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
              {CATEGORY_DISTRIBUTION.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate">{item.category} ({item.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BEST SELLING PRODUCTS TABLE (2 cols) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-playfair text-base font-bold text-slate-800 flex items-center gap-1.5">
                <Package className="w-5 h-5 text-brand-gold-700" />
                <span>Top Selling Cakes & Pastries</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">High velocity items by order counts</p>
            </div>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-250 font-bold">Live Data</span>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                  <th className="py-2.5 px-4">Rank</th>
                  <th className="py-2.5 px-4">Item Name</th>
                  <th className="py-2.5 px-4 text-center">Units Sold</th>
                  <th className="py-2.5 px-4 text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-650">
                {bestSellers.length > 0 ? (
                  bestSellers.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40">
                      <td className="py-3 px-4 text-slate-400 font-mono">#0{idx + 1}</td>
                      <td className="py-3 px-4 text-slate-800 font-bold">{item.name}</td>
                      <td className="py-3 px-4 text-center text-slate-500">{item.count} units</td>
                      <td className="py-3 px-4 text-right text-slate-800 font-black">₹{item.revenue.toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 px-4 text-center text-slate-400">
                      Processing live sales logs... Add orders to check rankings.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

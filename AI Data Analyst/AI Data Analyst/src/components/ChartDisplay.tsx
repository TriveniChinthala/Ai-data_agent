import React from 'react';
import { BarChart3, TrendingUp, PieChart, ScatterChart as Scatter } from 'lucide-react';

interface ChartDisplayProps {
  chartType: 'bar' | 'line' | 'pie' | 'scatter';
  data: any;
  title: string;
}

export const ChartDisplay: React.FC<ChartDisplayProps> = ({ 
  chartType, 
  data, 
  title 
}) => {
  const getChartIcon = () => {
    switch (chartType) {
      case 'line': return <TrendingUp className="h-5 w-5" />;
      case 'pie': return <PieChart className="h-5 w-5" />;
      case 'scatter': return <Scatter className="h-5 w-5" />;
      default: return <BarChart3 className="h-5 w-5" />;
    }
  };

  const getChartTypeLabel = () => {
    switch (chartType) {
      case 'line': return 'Line Chart';
      case 'pie': return 'Pie Chart';
      case 'scatter': return 'Scatter Plot';
      default: return 'Bar Chart';
    }
  };

  // Mock chart visualization using CSS
  const renderChart = () => {
    if (!data || !data.datasets || !data.datasets[0]) return null;

    const dataset = data.datasets[0];
    const maxValue = Math.max(...dataset.data);

    if (chartType === 'bar') {
      return (
        <div className="space-y-4">
          {data.labels.map((label: string, index: number) => {
            const value = dataset.data[index];
            const percentage = (value / maxValue) * 100;
            const colors = ['#2563EB', '#0D9488', '#EA580C', '#7C3AED'];
            
            return (
              <div key={label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{label}</span>
                  <span className="text-gray-600">{value.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: colors[index % colors.length]
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (chartType === 'line') {
      return (
        <div className="relative h-64 bg-gradient-to-t from-blue-50 to-transparent rounded-lg p-4">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#2563EB', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: '#2563EB', stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1="0"
                y1={i * 40}
                x2="400"
                y2={i * 40}
                stroke="#E5E7EB"
                strokeWidth="1"
              />
            ))}
            
            {/* Data line */}
            <polyline
              fill="url(#lineGradient)"
              stroke="#2563EB"
              strokeWidth="3"
              points={data.labels.map((_, index: number) => {
                const x = (index / (data.labels.length - 1)) * 400;
                const y = 200 - ((dataset.data[index] / maxValue) * 180);
                return `${x},${y}`;
              }).join(' ')}
            />
            
            {/* Data points */}
            {data.labels.map((_, index: number) => {
              const x = (index / (data.labels.length - 1)) * 400;
              const y = 200 - ((dataset.data[index] / maxValue) * 180);
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#2563EB"
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
          
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            {data.labels.map((label: string) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      );
    }

    if (chartType === 'pie') {
      const total = dataset.data.reduce((sum: number, value: number) => sum + value, 0);
      let currentAngle = 0;
      const colors = ['#2563EB', '#0D9488', '#EA580C', '#7C3AED'];

      return (
        <div className="flex items-center space-x-8">
          <div className="relative">
            <svg width="200" height="200" viewBox="0 0 200 200">
              {data.labels.map((label: string, index: number) => {
                const value = dataset.data[index];
                const percentage = (value / total) * 360;
                const x1 = 100 + 90 * Math.cos((currentAngle - 90) * Math.PI / 180);
                const y1 = 100 + 90 * Math.sin((currentAngle - 90) * Math.PI / 180);
                const x2 = 100 + 90 * Math.cos((currentAngle + percentage - 90) * Math.PI / 180);
                const y2 = 100 + 90 * Math.sin((currentAngle + percentage - 90) * Math.PI / 180);
                const largeArcFlag = percentage > 180 ? 1 : 0;
                
                const pathData = `M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                
                const slice = (
                  <path
                    key={label}
                    d={pathData}
                    fill={colors[index % colors.length]}
                    stroke="white"
                    strokeWidth="2"
                    className="hover:opacity-80 transition-opacity"
                  />
                );
                
                currentAngle += percentage;
                return slice;
              })}
            </svg>
          </div>
          
          <div className="space-y-3">
            {data.labels.map((label: string, index: number) => {
              const value = dataset.data[index];
              const percentage = ((value / total) * 100).toFixed(1);
              
              return (
                <div key={label} className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{label}</div>
                    <div className="text-xs text-gray-600">
                      {value.toLocaleString()} ({percentage}%)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          {getChartIcon()}
          <span>{title}</span>
        </h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {getChartTypeLabel()}
        </span>
      </div>
      
      <div className="min-h-[200px]">
        {renderChart()}
      </div>
      
      {data?.datasets?.[0]?.label && (
        <p className="text-sm text-gray-600 mt-4 text-center">
          {data.datasets[0].label}
        </p>
      )}
    </div>
  );
};
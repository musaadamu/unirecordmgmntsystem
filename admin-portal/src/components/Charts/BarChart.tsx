import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';

interface BarChartProps {
  data: any[];
  title?: string;
  height?: number;
  bars: Array<{
    dataKey: string;
    fill: string;
    name: string;
  }>;
  xAxisKey: string;
  showGrid?: boolean;
  showLegend?: boolean;
  formatTooltip?: (value: any, name: string) => [string, string];
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  height = 300,
  bars,
  xAxisKey,
  showGrid = true,
  showLegend = true,
  formatTooltip,
}) => {
  const theme = useTheme();

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: 1,
            p: 2,
            boxShadow: theme.shadows[4],
          }}
        >
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography
              key={index}
              variant="body2"
              sx={{ color: entry.color }}
            >
              {entry.name}: {formatTooltip ? formatTooltip(entry.value, entry.name)[0] : entry.value}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 12 }}
            stroke={theme.palette.text.secondary}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke={theme.palette.text.secondary}
          />
          <Tooltip content={customTooltip} />
          {showLegend && <Legend />}
          {bars.map((bar, index) => (
            <Bar
              key={index}
              dataKey={bar.dataKey}
              fill={bar.fill}
              name={bar.name}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default BarChart;

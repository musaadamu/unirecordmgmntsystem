import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  height?: number;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  formatTooltip?: (value: any, name: string) => [string, string];
}

const COLORS = [
  '#1976d2',
  '#2e7d32',
  '#ed6c02',
  '#d32f2f',
  '#9c27b0',
  '#00796b',
  '#f57c00',
  '#5d4037',
  '#616161',
  '#e91e63',
];

const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  height = 300,
  showLegend = true,
  innerRadius = 0,
  outerRadius = 80,
  formatTooltip,
}) => {
  const theme = useTheme();

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
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
          <Typography variant="body2" fontWeight="bold">
            {data.name}
          </Typography>
          <Typography variant="body2" sx={{ color: data.payload.color }}>
            Value: {formatTooltip ? formatTooltip(data.value, data.name)[0] : data.value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Percentage: {((data.value / data.payload.total) * 100).toFixed(1)}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Calculate total for percentage calculation
  const total = data.reduce((sum, entry) => sum + entry.value, 0);
  const dataWithTotal = data.map(entry => ({ ...entry, total }));

  return (
    <Box>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={dataWithTotal}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
          >
            {dataWithTotal.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={customTooltip} />
          {showLegend && <Legend />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PieChart;

import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';

interface LineChartProps {
  data: any[];
  title?: string;
  height?: number;
  lines: Array<{
    dataKey: string;
    stroke: string;
    name: string;
    strokeWidth?: number;
  }>;
  xAxisKey: string;
  showGrid?: boolean;
  showLegend?: boolean;
  formatTooltip?: (value: any, name: string) => [string, string];
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  height = 300,
  lines,
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
        <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
          {lines.map((line, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.stroke}
              strokeWidth={line.strokeWidth || 2}
              name={line.name}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default LineChart;

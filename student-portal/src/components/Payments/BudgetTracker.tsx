import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  ShoppingCart,
  Home,
  DirectionsCar,
  Restaurant,
  School,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

import { Budget, BudgetCategory } from '@/services/paymentsService';

interface BudgetTrackerProps {
  semester: string;
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({ semester }) => {
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    budgetedAmount: 0,
  });

  // Mock budget data
  const mockBudget: Budget = {
    _id: '1',
    student: 'student1',
    semester: 'Fall',
    academicYear: '2024',
    totalIncome: 500000,
    totalExpenses: 450000,
    netAmount: 50000,
    categories: [
      {
        _id: '1',
        name: 'Tuition & Fees',
        type: 'expense',
        budgetedAmount: 300000,
        actualAmount: 300000,
        variance: 0,
        percentage: 66.7,
        color: '#1976d2',
      },
      {
        _id: '2',
        name: 'Accommodation',
        type: 'expense',
        budgetedAmount: 80000,
        actualAmount: 80000,
        variance: 0,
        percentage: 17.8,
        color: '#2e7d32',
      },
      {
        _id: '3',
        name: 'Food & Meals',
        type: 'expense',
        budgetedAmount: 50000,
        actualAmount: 45000,
        variance: -5000,
        percentage: 10.0,
        color: '#ed6c02',
      },
      {
        _id: '4',
        name: 'Transportation',
        type: 'expense',
        budgetedAmount: 20000,
        actualAmount: 25000,
        variance: 5000,
        percentage: 5.6,
        color: '#9c27b0',
      },
      {
        _id: '5',
        name: 'Family Support',
        type: 'income',
        budgetedAmount: 400000,
        actualAmount: 400000,
        variance: 0,
        percentage: 80.0,
        color: '#0288d1',
      },
      {
        _id: '6',
        name: 'Scholarship',
        type: 'income',
        budgetedAmount: 100000,
        actualAmount: 100000,
        variance: 0,
        percentage: 20.0,
        color: '#388e3c',
      },
    ],
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('tuition') || lowerName.includes('school')) return <School />;
    if (lowerName.includes('accommodation') || lowerName.includes('housing')) return <Home />;
    if (lowerName.includes('food') || lowerName.includes('meal')) return <Restaurant />;
    if (lowerName.includes('transport')) return <DirectionsCar />;
    if (lowerName.includes('income') || lowerName.includes('support')) return <AccountBalance />;
    return <ShoppingCart />;
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'error.main';
    if (variance < 0) return 'success.main';
    return 'text.secondary';
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <TrendingUp sx={{ color: 'error.main' }} />;
    if (variance < 0) return <TrendingDown sx={{ color: 'success.main' }} />;
    return null;
  };

  const getBudgetHealth = () => {
    const totalVariance = mockBudget.categories
      .filter(cat => cat.type === 'expense')
      .reduce((sum, cat) => sum + cat.variance, 0);
    
    if (totalVariance <= 0) return { status: 'good', message: 'You are within budget!' };
    if (totalVariance <= mockBudget.totalIncome * 0.1) return { status: 'warning', message: 'Slightly over budget' };
    return { status: 'danger', message: 'Significantly over budget' };
  };

  const getIncomeCategories = () => mockBudget.categories.filter(cat => cat.type === 'income');
  const getExpenseCategories = () => mockBudget.categories.filter(cat => cat.type === 'expense');

  const handleAddCategory = () => {
    setEditingCategory(null);
    setNewCategory({ name: '', type: 'expense', budgetedAmount: 0 });
    setCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: BudgetCategory) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      type: category.type,
      budgetedAmount: category.budgetedAmount,
    });
    setCategoryDialogOpen(true);
  };

  const handleSaveCategory = () => {
    console.log('Saving category...', newCategory);
    setCategoryDialogOpen(false);
  };

  const handleDeleteCategory = (categoryId: string) => {
    console.log('Deleting category...', categoryId);
  };

  const budgetHealth = getBudgetHealth();

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="bold">
          Budget Tracker - {semester}
        </Typography>
        
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddCategory}
          >
            Add Category
          </Button>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => setBudgetDialogOpen(true)}
          >
            Edit Budget
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Budget Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Budget Overview
              </Typography>
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">Total Income</Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {formatCurrency(mockBudget.totalIncome)}
                </Typography>
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">Total Expenses</Typography>
                <Typography variant="h5" fontWeight="bold" color="error.main">
                  {formatCurrency(mockBudget.totalExpenses)}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">Net Amount</Typography>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color={mockBudget.netAmount >= 0 ? 'success.main' : 'error.main'}
                >
                  {formatCurrency(mockBudget.netAmount)}
                </Typography>
              </Box>
              
              <Alert
                severity={budgetHealth.status === 'good' ? 'success' : budgetHealth.status === 'warning' ? 'warning' : 'error'}
                sx={{ mt: 2 }}
              >
                {budgetHealth.message}
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Expense Breakdown */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Expense Breakdown
              </Typography>
              
              <Box height={250}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getExpenseCategories()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="actualAmount"
                    >
                      {getExpenseCategories().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              
              <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
                {getExpenseCategories().map((category) => (
                  <Box key={category._id} display="flex" alignItems="center" gap={0.5}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: category.color,
                      }}
                    />
                    <Typography variant="caption">
                      {category.name}: {category.percentage.toFixed(1)}%
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Income Categories */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Income Sources
              </Typography>
              
              <List sx={{ p: 0 }}>
                {getIncomeCategories().map((category, index) => (
                  <React.Fragment key={category._id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            {getCategoryIcon(category.name)}
                            <Typography variant="subtitle2" fontWeight="bold">
                              {category.name}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                              <Typography variant="body2">
                                Budgeted: {formatCurrency(category.budgetedAmount)}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                Actual: {formatCurrency(category.actualAmount)}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={(category.actualAmount / category.budgetedAmount) * 100}
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton size="small" onClick={() => handleEditCategory(category)}>
                          <Edit />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < getIncomeCategories().length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Expense Categories */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Expense Categories
              </Typography>
              
              <List sx={{ p: 0 }}>
                {getExpenseCategories().map((category, index) => (
                  <React.Fragment key={category._id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            {getCategoryIcon(category.name)}
                            <Typography variant="subtitle2" fontWeight="bold">
                              {category.name}
                            </Typography>
                            {category.variance !== 0 && (
                              <Box display="flex" alignItems="center" gap={0.5}>
                                {getVarianceIcon(category.variance)}
                                <Typography
                                  variant="caption"
                                  sx={{ color: getVarianceColor(category.variance) }}
                                >
                                  {formatCurrency(Math.abs(category.variance))}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                              <Typography variant="body2">
                                Budgeted: {formatCurrency(category.budgetedAmount)}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                Actual: {formatCurrency(category.actualAmount)}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={(category.actualAmount / category.budgetedAmount) * 100}
                              color={category.variance > 0 ? 'error' : 'primary'}
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton size="small" onClick={() => handleEditCategory(category)}>
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteCategory(category._id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < getExpenseCategories().length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Budget vs Actual Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Budget vs Actual Comparison
              </Typography>
              
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockBudget.categories}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="budgetedAmount" fill="#8884d8" name="Budgeted" />
                    <Bar dataKey="actualAmount" fill="#82ca9d" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Category Dialog */}
      <Dialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category Name"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newCategory.type}
                  label="Type"
                  onChange={(e) => setNewCategory(prev => ({ ...prev, type: e.target.value as 'income' | 'expense' }))}
                >
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Budgeted Amount"
                type="number"
                value={newCategory.budgetedAmount}
                onChange={(e) => setNewCategory(prev => ({ ...prev, budgetedAmount: Number(e.target.value) }))}
                InputProps={{
                  startAdornment: '₦',
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveCategory}
            variant="contained"
            disabled={!newCategory.name || newCategory.budgetedAmount <= 0}
          >
            {editingCategory ? 'Update' : 'Add'} Category
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BudgetTracker;

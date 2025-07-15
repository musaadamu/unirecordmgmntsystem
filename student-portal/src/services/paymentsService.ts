import { apiClient, buildQueryString } from './api';
import { ApiResponse } from '@/types';

export interface PaymentItem {
  _id: string;
  type: 'tuition' | 'accommodation' | 'library' | 'laboratory' | 'examination' | 'registration' | 'late_fee' | 'other';
  description: string;
  amount: number;
  currency: string;
  dueDate: string;
  semester: string;
  academicYear: string;
  status: 'pending' | 'paid' | 'overdue' | 'waived' | 'partial';
  paidAmount: number;
  remainingAmount: number;
  category: 'mandatory' | 'optional';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  student: string;
  paymentItems: string[];
  totalAmount: number;
  paidAmount: number;
  currency: string;
  paymentMethod: 'card' | 'bank_transfer' | 'remita' | 'paystack' | 'flutterwave' | 'cash';
  paymentReference: string;
  transactionId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentDate: string;
  description: string;
  receipt?: {
    receiptNumber: string;
    downloadUrl: string;
    generatedAt: string;
  };
  metadata?: {
    gateway: string;
    gatewayReference: string;
    gatewayResponse?: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FinancialAid {
  _id: string;
  student: string;
  type: 'scholarship' | 'grant' | 'loan' | 'work_study' | 'bursary';
  name: string;
  description: string;
  amount: number;
  currency: string;
  semester: string;
  academicYear: string;
  status: 'applied' | 'approved' | 'disbursed' | 'rejected' | 'pending_documents';
  provider: {
    name: string;
    type: 'government' | 'university' | 'private' | 'international';
    contact?: string;
  };
  requirements: string[];
  applicationDeadline?: string;
  disbursementDate?: string;
  renewalRequired: boolean;
  documents: Array<{
    name: string;
    type: string;
    status: 'required' | 'submitted' | 'approved' | 'rejected';
    uploadedAt?: string;
    url?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialSummary {
  totalFees: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  financialAidTotal: number;
  netAmount: number;
  paymentStatus: 'current' | 'overdue' | 'partial' | 'paid_in_full';
  nextPaymentDue?: {
    amount: number;
    dueDate: string;
    description: string;
  };
  semester: string;
  academicYear: string;
}

export interface PaymentPlan {
  _id: string;
  student: string;
  totalAmount: number;
  installments: Array<{
    installmentNumber: number;
    amount: number;
    dueDate: string;
    status: 'pending' | 'paid' | 'overdue';
    paidDate?: string;
    paymentId?: string;
  }>;
  setupFee: number;
  interestRate: number;
  status: 'active' | 'completed' | 'defaulted' | 'cancelled';
  semester: string;
  academicYear: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRequest {
  paymentItems: string[];
  paymentMethod: string;
  amount: number;
  currency: string;
  description?: string;
  callbackUrl?: string;
  metadata?: any;
}

export interface PaymentFilters {
  semester?: string;
  academicYear?: string;
  status?: string;
  paymentMethod?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
  sortBy?: 'paymentDate' | 'amount' | 'status' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface BudgetCategory {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
  percentage: number;
  color: string;
}

export interface Budget {
  _id: string;
  student: string;
  semester: string;
  academicYear: string;
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  categories: BudgetCategory[];
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export const paymentsService = {
  // Get payment items (fees)
  getPaymentItems: async (filters: Partial<PaymentFilters> = {}): Promise<PaymentItem[]> => {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get<ApiResponse<{ paymentItems: PaymentItem[] }>>(
      `/student/payments/items${queryString}`
    );
    return response.data.data.paymentItems;
  },

  // Get payment history
  getPaymentHistory: async (filters: PaymentFilters = {}): Promise<{ payments: Payment[]; total: number; page: number; totalPages: number }> => {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get<ApiResponse<{ payments: Payment[]; pagination: any }>>(
      `/student/payments/history${queryString}`
    );
    return {
      payments: response.data.data.payments,
      total: response.data.data.pagination.total,
      page: response.data.data.pagination.page,
      totalPages: response.data.data.pagination.totalPages,
    };
  },

  // Get financial summary
  getFinancialSummary: async (semester?: string, academicYear?: string): Promise<FinancialSummary> => {
    const queryString = buildQueryString({ semester, academicYear });
    const response = await apiClient.get<ApiResponse<FinancialSummary>>(
      `/student/payments/summary${queryString}`
    );
    return response.data.data;
  },

  // Initiate payment
  initiatePayment: async (paymentRequest: PaymentRequest): Promise<{ paymentUrl: string; paymentReference: string }> => {
    const response = await apiClient.post<ApiResponse<{ paymentUrl: string; paymentReference: string }>>(
      '/student/payments/initiate',
      paymentRequest
    );
    return response.data.data;
  },

  // Verify payment
  verifyPayment: async (paymentReference: string): Promise<Payment> => {
    const response = await apiClient.get<ApiResponse<{ payment: Payment }>>(
      `/student/payments/verify/${paymentReference}`
    );
    return response.data.data.payment;
  },

  // Download receipt
  downloadReceipt: async (paymentId: string): Promise<void> => {
    const response = await apiClient.get(`/student/payments/${paymentId}/receipt`, {
      responseType: 'blob',
    });
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${paymentId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Get financial aid
  getFinancialAid: async (): Promise<FinancialAid[]> => {
    const response = await apiClient.get<ApiResponse<{ financialAid: FinancialAid[] }>>(
      '/student/financial-aid'
    );
    return response.data.data.financialAid;
  },

  // Apply for financial aid
  applyForFinancialAid: async (application: {
    aidId: string;
    documents: Array<{ name: string; file: File }>;
    additionalInfo?: string;
  }): Promise<{ applicationId: string }> => {
    const formData = new FormData();
    formData.append('aidId', application.aidId);
    if (application.additionalInfo) {
      formData.append('additionalInfo', application.additionalInfo);
    }
    
    application.documents.forEach((doc, index) => {
      formData.append(`documents[${index}][name]`, doc.name);
      formData.append(`documents[${index}][file]`, doc.file);
    });

    const response = await apiClient.post<ApiResponse<{ applicationId: string }>>(
      '/student/financial-aid/apply',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  // Get payment plans
  getPaymentPlans: async (): Promise<PaymentPlan[]> => {
    const response = await apiClient.get<ApiResponse<{ paymentPlans: PaymentPlan[] }>>(
      '/student/payments/plans'
    );
    return response.data.data.paymentPlans;
  },

  // Create payment plan
  createPaymentPlan: async (plan: {
    totalAmount: number;
    numberOfInstallments: number;
    firstPaymentDate: string;
    paymentItems: string[];
  }): Promise<PaymentPlan> => {
    const response = await apiClient.post<ApiResponse<{ paymentPlan: PaymentPlan }>>(
      '/student/payments/plans',
      plan
    );
    return response.data.data.paymentPlan;
  },

  // Get budget
  getBudget: async (semester?: string, academicYear?: string): Promise<Budget | null> => {
    const queryString = buildQueryString({ semester, academicYear });
    try {
      const response = await apiClient.get<ApiResponse<{ budget: Budget }>>(
        `/student/budget${queryString}`
      );
      return response.data.data.budget;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Create or update budget
  saveBudget: async (budget: Omit<Budget, '_id' | 'student' | 'createdAt' | 'updatedAt'>): Promise<Budget> => {
    const response = await apiClient.post<ApiResponse<{ budget: Budget }>>(
      '/student/budget',
      budget
    );
    return response.data.data.budget;
  },

  // Get payment statistics
  getPaymentStatistics: async (period: 'semester' | 'year' | 'all' = 'semester'): Promise<{
    totalPaid: number;
    totalPending: number;
    paymentsByMethod: Array<{ method: string; amount: number; count: number }>;
    paymentsByType: Array<{ type: string; amount: number; count: number }>;
    monthlyTrend: Array<{ month: string; amount: number; count: number }>;
  }> => {
    const queryString = buildQueryString({ period });
    const response = await apiClient.get<ApiResponse<any>>(
      `/student/payments/statistics${queryString}`
    );
    return response.data.data;
  },

  // Request refund
  requestRefund: async (refund: {
    paymentId: string;
    amount: number;
    reason: string;
    bankDetails?: {
      accountName: string;
      accountNumber: string;
      bankName: string;
      bankCode: string;
    };
  }): Promise<{ refundId: string }> => {
    const response = await apiClient.post<ApiResponse<{ refundId: string }>>(
      '/student/payments/refund',
      refund
    );
    return response.data.data;
  },

  // Get available payment methods
  getPaymentMethods: async (): Promise<Array<{
    id: string;
    name: string;
    type: string;
    description: string;
    fees: number;
    enabled: boolean;
    logo?: string;
  }>> => {
    const response = await apiClient.get<ApiResponse<{ paymentMethods: any[] }>>(
      '/student/payments/methods'
    );
    return response.data.data.paymentMethods;
  },
};

export default paymentsService;

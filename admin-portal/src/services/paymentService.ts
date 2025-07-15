import { apiClient, buildQueryString } from './api';
import { ApiResponse, PaginatedResponse } from '@/types';

export interface Payment {
  _id: string;
  studentId: string;
  student: {
    _id: string;
    personalInfo: {
      firstName: string;
      lastName: string;
    };
    email: string;
    studentId: string;
  };
  paymentType: 'tuition' | 'accommodation' | 'library' | 'laboratory' | 'examination' | 'registration' | 'other';
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: 'remita' | 'bank_transfer' | 'cash' | 'card' | 'other';
  semester: string;
  academicYear: string;
  description: string;
  dueDate: string;
  paidDate?: string;
  remitaDetails?: {
    rrr: string;
    transactionId: string;
    orderId: string;
    paymentReference: string;
    merchantId: string;
    serviceTypeId: string;
    hash: string;
    responseUrl: string;
    statusUrl: string;
  };
  receiptNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentFilters {
  studentId?: string;
  paymentType?: string;
  status?: string;
  semester?: string;
  academicYear?: string;
  paymentMethod?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  pendingPayments: number;
  pendingAmount: number;
  completedPayments: number;
  completedAmount: number;
  failedPayments: number;
  refundedAmount: number;
  paymentsByType: Array<{
    type: string;
    count: number;
    amount: number;
  }>;
  paymentsByMethod: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    payments: number;
    amount: number;
  }>;
}

export interface RemitaPaymentRequest {
  studentId: string;
  amount: number;
  paymentType: string;
  description: string;
  semester: string;
  academicYear: string;
  dueDate: string;
}

export interface RemitaPaymentResponse {
  success: boolean;
  rrr: string;
  orderId: string;
  paymentUrl: string;
  statusUrl: string;
  message: string;
}

export interface BulkPaymentResult {
  successful: Array<{
    studentId: string;
    amount: number;
    paymentId: string;
  }>;
  failed: Array<{
    studentId: string;
    error: string;
  }>;
  total: number;
}

export const paymentService = {
  // Get all payments with pagination and filtering
  getPayments: async (filters: PaymentFilters & { page?: number; limit?: number }) => {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get<PaginatedResponse<Payment>>(`/payments${queryString}`);
    return response.data;
  },

  // Get payment by ID
  getPaymentById: async (id: string): Promise<Payment> => {
    const response = await apiClient.get<ApiResponse<{ payment: Payment }>>(`/payments/${id}`);
    return response.data.data.payment;
  },

  // Create new payment
  createPayment: async (paymentData: any): Promise<Payment> => {
    const response = await apiClient.post<ApiResponse<{ payment: Payment }>>('/payments', paymentData);
    return response.data.data.payment;
  },

  // Update payment
  updatePayment: async (id: string, paymentData: any): Promise<Payment> => {
    const response = await apiClient.put<ApiResponse<{ payment: Payment }>>(`/payments/${id}`, paymentData);
    return response.data.data.payment;
  },

  // Delete payment
  deletePayment: async (id: string): Promise<void> => {
    await apiClient.delete(`/payments/${id}`);
  },

  // Get payment statistics
  getPaymentStats: async (filters?: PaymentFilters): Promise<PaymentStats> => {
    const queryString = buildQueryString(filters || {});
    const response = await apiClient.get<ApiResponse<PaymentStats>>(`/payments/stats${queryString}`);
    return response.data.data;
  },

  // Get student payments
  getStudentPayments: async (studentId: string, filters?: PaymentFilters) => {
    const params = { ...filters, studentId };
    const queryString = buildQueryString(params);
    const response = await apiClient.get<PaginatedResponse<Payment>>(`/payments/student${queryString}`);
    return response.data;
  },

  // Remita Payment Integration
  initiateRemitaPayment: async (paymentRequest: RemitaPaymentRequest): Promise<RemitaPaymentResponse> => {
    const response = await apiClient.post<ApiResponse<RemitaPaymentResponse>>(
      '/payments/remita/initiate',
      paymentRequest
    );
    return response.data.data;
  },

  // Verify Remita payment status
  verifyRemitaPayment: async (rrr: string): Promise<Payment> => {
    const response = await apiClient.post<ApiResponse<{ payment: Payment }>>(
      '/payments/remita/verify',
      { rrr }
    );
    return response.data.data.payment;
  },

  // Get Remita payment status
  getRemitaPaymentStatus: async (rrr: string) => {
    const response = await apiClient.get<ApiResponse<any>>(`/payments/remita/status/${rrr}`);
    return response.data.data;
  },

  // Process Remita webhook
  processRemitaWebhook: async (webhookData: any) => {
    const response = await apiClient.post<ApiResponse<{ payment: Payment }>>(
      '/payments/remita/webhook',
      webhookData
    );
    return response.data.data.payment;
  },

  // Generate payment receipt
  generateReceipt: async (paymentId: string): Promise<void> => {
    const response = await apiClient.get(`/payments/${paymentId}/receipt`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payment_receipt_${paymentId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Bulk create payments
  bulkCreatePayments: async (payments: any[]): Promise<BulkPaymentResult> => {
    const response = await apiClient.post<ApiResponse<BulkPaymentResult>>('/admin/payments/bulk-create', {
      payments,
    });
    return response.data.data;
  },

  // Export payments to CSV
  exportPaymentsToCSV: async (filters?: PaymentFilters): Promise<void> => {
    const queryString = buildQueryString({ ...filters, format: 'csv' });
    const response = await apiClient.get(`/admin/payments/export${queryString}`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payments_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Send payment reminder
  sendPaymentReminder: async (paymentId: string): Promise<void> => {
    await apiClient.post(`/payments/${paymentId}/reminder`);
  },

  // Process refund
  processRefund: async (paymentId: string, refundData: any): Promise<Payment> => {
    const response = await apiClient.post<ApiResponse<{ payment: Payment }>>(
      `/payments/${paymentId}/refund`,
      refundData
    );
    return response.data.data.payment;
  },

  // Get payment history
  getPaymentHistory: async (paymentId: string) => {
    const response = await apiClient.get<ApiResponse<{ history: any[] }>>(
      `/payments/${paymentId}/history`
    );
    return response.data.data.history;
  },

  // Mark payment as paid (manual)
  markAsPaid: async (paymentId: string, paymentData: any): Promise<Payment> => {
    const response = await apiClient.post<ApiResponse<{ payment: Payment }>>(
      `/payments/${paymentId}/mark-paid`,
      paymentData
    );
    return response.data.data.payment;
  },

  // Cancel payment
  cancelPayment: async (paymentId: string, reason: string): Promise<Payment> => {
    const response = await apiClient.post<ApiResponse<{ payment: Payment }>>(
      `/payments/${paymentId}/cancel`,
      { reason }
    );
    return response.data.data.payment;
  },

  // Get payment analytics
  getPaymentAnalytics: async (filters?: PaymentFilters) => {
    const queryString = buildQueryString(filters || {});
    const response = await apiClient.get<ApiResponse<any>>(`/payments/analytics${queryString}`);
    return response.data.data;
  },

  // Generate payment report
  generatePaymentReport: async (filters?: PaymentFilters): Promise<void> => {
    const queryString = buildQueryString({ ...filters, format: 'pdf' });
    const response = await apiClient.get(`/admin/payments/report${queryString}`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payment_report_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default paymentService;

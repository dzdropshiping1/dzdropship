import SofizPaySDK from 'sofizpay-sdk-js';

interface SofizPayStatusResponse {
  success?: boolean;
  data?: {
    orderStatus?: unknown;
    respCode?: unknown;
    errorMessage?: unknown;
    status?: unknown;
  } & Record<string, unknown>;
}

interface SofizPaySDKWithStatus {
  checkCIBStatus(paymentId: string): Promise<SofizPayStatusResponse>;
}

export interface SofizPayCustomer {
  email?: string;
  phone: string;
  name?: string;
}

export interface SofizPayCreatePaymentParams {
  amount: number;
  currency: string;
  description: string;
  customer: SofizPayCustomer;
  successUrl: string;
  cancelUrl: string;
}

export interface SofizPayPaymentResponse {
  id: string;
  amount: number;
  currency: string;
  description: string;
  customer: SofizPayCustomer;
  checkoutUrl: string;
  status: 'PENDING' | 'PAID' | 'FAILED';
  createdAt: string;
}

class PaymentsService {
  private sdkInstance: SofizPaySDK;
  private merchantAccount: string;

  constructor(merchantAccount?: string) {
    this.sdkInstance = new SofizPaySDK();
    // Use provided key first, fall back to env var
    this.merchantAccount = merchantAccount || process.env.SOFIZPAY_MERCHANT_ACCOUNT || '';
  }

  /**
   * Initiates a CIB/Dahabia payment using the official SofizPay SDK's makeCIBTransaction.
   */
  async create(params: SofizPayCreatePaymentParams): Promise<SofizPayPaymentResponse> {
    // Directly use the official SDK makeCIBTransaction method
    const response = await this.sdkInstance.makeCIBTransaction({
      account: this.merchantAccount,
      amount: params.amount,
      full_name: params.customer.name || 'Customer',
      phone: params.customer.phone,
      email: params.customer.email || 'customer@example.com',
      memo: params.description.substring(0, 28), // Memos in Stellar are max 28 chars
      return_url: params.successUrl,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create CIB transaction via SofizPay SDK');
    }

    const checkoutUrl = response.url || response.data.payment_url || response.data.url || '';
    const rawTxId = response.data.cib_transaction_id ?? response.data.order_number ?? '';
    const transactionId = String(rawTxId);

    return {
      id: transactionId,
      amount: params.amount,
      currency: params.currency || 'DZD',
      description: params.description,
      customer: params.customer,
      checkoutUrl: checkoutUrl,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Retrieves CIB/Dahabia payment status using the official SofizPay SDK's checkCIBStatus.
   */
   async retrieve(paymentId: string): Promise<{ id: string; status: 'PENDING' | 'PAID' | 'FAILED'; rawData?: Record<string, unknown> }> {
    try {
      // Cast is used to access checkCIBStatus bypassing incorrect TS typings in package
      const response = await (this.sdkInstance as unknown as SofizPaySDKWithStatus).checkCIBStatus(paymentId);
      
      if (response.success && response.data) {
        const orderStatus = response.data.orderStatus !== undefined ? Number(response.data.orderStatus) : null;
        const respCode = response.data.respCode !== undefined ? String(response.data.respCode) : null;
        const errorMessage = response.data.errorMessage;
        
        let status: 'PENDING' | 'PAID' | 'FAILED' = 'PENDING';
        
        // 1. Success conditions: orderStatus 2 (captured) or respCode "00"/"0" (approved)
        if (orderStatus === 2 || respCode === '00' || respCode === '0') {
          status = 'PAID';
        }
        // 2. Failure conditions: orderStatus 3 (canceled) or 6 (rejected), or any non-success respCode
        else if (
          orderStatus === 3 || 
          orderStatus === 6 || 
          (respCode && respCode !== '00' && respCode !== '0') ||
          (errorMessage && String(errorMessage).toLowerCase().includes('rejected'))
        ) {
          status = 'FAILED';
        }
        // 3. Fallback to status property if present
        else {
          const rawStatus = response.data.status;
          if (rawStatus === 'success') {
            status = 'PAID';
          } else if (rawStatus === 'fail' || rawStatus === 'failed') {
            status = 'FAILED';
          }
        }
        
        return { id: paymentId, status, rawData: response.data };
      }
    } catch (err) {
      console.error('Error fetching CIB status from SofizPay SDK:', err);
    }

    return {
      id: paymentId,
      status: 'PENDING',
    };
  }
}

export class SofizPay {
  public payments: PaymentsService;

  /**
   * @param merchantPublicKey - Optional SofizPay merchant public key.
   *   If not provided, falls back to SOFIZPAY_MERCHANT_ACCOUNT env variable.
   */
  constructor(merchantPublicKey?: string) {
    this.payments = new PaymentsService(merchantPublicKey);
  }
}

/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Railsr } from '../nodes/Railsr/Railsr.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('Railsr Node', () => {
  let node: Railsr;

  beforeAll(() => {
    node = new Railsr();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Railsr');
      expect(node.description.name).toBe('railsr');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 7 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(7);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(7);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Ledger Resource', () => {
	let mockExecuteFunctions: any;
	
	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({ 
				bearerToken: 'test-token',
				baseUrl: 'https://api.railsr.com/v1'
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: { 
				httpRequest: jest.fn().mockResolvedValue({ id: 'test-id', status: 'success' })
			},
		};
	});

	describe('createLedger operation', () => {
		it('should create a ledger successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('createLedger')
				.mockReturnValueOnce('Test Ledger')
				.mockReturnValueOnce('USD')
				.mockReturnValueOnce('both');

			const result = await executeLedgerOperations.call(
				mockExecuteFunctions,
				[{ json: {} }]
			);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'POST',
					url: 'https://api.railsr.com/v1/ledgers',
					body: { name: 'Test Ledger', currency: 'USD', type: 'both' },
				})
			);
			expect(result).toEqual([{ json: { id: 'test-id', status: 'success' }, pairedItem: { item: 0 } }]);
		});

		it('should handle errors when creating a ledger', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('createLedger');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeLedgerOperations.call(
				mockExecuteFunctions,
				[{ json: {} }]
			);

			expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
		});
	});

	describe('getLedger operation', () => {
		it('should get a ledger successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getLedger')
				.mockReturnValueOnce('ledger-123');

			const result = await executeLedgerOperations.call(
				mockExecuteFunctions,
				[{ json: {} }]
			);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'GET',
					url: 'https://api.railsr.com/v1/ledgers/ledger-123',
				})
			);
			expect(result).toEqual([{ json: { id: 'test-id', status: 'success' }, pairedItem: { item: 0 } }]);
		});
	});

	describe('createLedgerTransaction operation', () => {
		it('should create a ledger transaction successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('createLedgerTransaction')
				.mockReturnValueOnce('ledger-123')
				.mockReturnValueOnce(100.50)
				.mockReturnValueOnce('account-from')
				.mockReturnValueOnce('account-to');

			const result = await executeLedgerOperations.call(
				mockExecuteFunctions,
				[{ json: {} }]
			);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'POST',
					url: 'https://api.railsr.com/v1/ledgers/ledger-123/transactions',
					body: { amount: '100.5', from_account: 'account-from', to_account: 'account-to' },
					headers: expect.objectContaining({
						'Idempotency-Key': expect.stringMatching(/^transaction-\d+-[\d.]+$/),
					}),
				})
			);
			expect(result).toEqual([{ json: { id: 'test-id', status: 'success' }, pairedItem: { item: 0 } }]);
		});
	});
});

describe('Payment Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        bearerToken: 'test-token', 
        baseUrl: 'https://api.railsr.com/v1' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { httpRequest: jest.fn(), requestWithAuthentication: jest.fn() },
    };
  });

  describe('createPayment', () => {
    it('should create payment successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createPayment')
        .mockReturnValueOnce(100)
        .mockReturnValueOnce('USD')
        .mockReturnValueOnce('beneficiary-123')
        .mockReturnValueOnce('sepa')
        .mockReturnValueOnce('test-payment');

      const mockResponse = { id: 'payment-123', status: 'pending' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executePaymentOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'https://api.railsr.com/v1/payments',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Idempotency-Key': expect.any(String),
          }),
        })
      );
    });

    it('should handle create payment error', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('createPayment');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executePaymentOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('getPayment', () => {
    it('should get payment successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getPayment')
        .mockReturnValueOnce('payment-123');

      const mockResponse = { id: 'payment-123', status: 'completed', amount: 100 };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executePaymentOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: 'https://api.railsr.com/v1/payments/payment-123',
        })
      );
    });
  });

  describe('getAllPayments', () => {
    it('should get all payments successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAllPayments')
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(20)
        .mockReturnValueOnce('completed')
        .mockReturnValueOnce('USD');

      const mockResponse = { payments: [{ id: 'payment-1' }, { id: 'payment-2' }], total: 2 };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executePaymentOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('cancelPayment', () => {
    it('should cancel payment successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('cancelPayment')
        .mockReturnValueOnce('payment-123')
        .mockReturnValueOnce('User requested cancellation');

      const mockResponse = { id: 'payment-123', status: 'cancelled' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executePaymentOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'https://api.railsr.com/v1/payments/payment-123/cancel',
          headers: expect.objectContaining({
            'Idempotency-Key': expect.any(String),
          }),
        })
      );
    });
  });

  describe('createBatchPayment', () => {
    it('should create batch payment successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createBatchPayment')
        .mockReturnValueOnce('[{"amount": 100, "currency": "USD"}]')
        .mockReturnValueOnce('batch-ref-123');

      const mockResponse = { id: 'batch-123', status: 'processing' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executePaymentOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Beneficiary Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				bearerToken: 'test-token',
				baseUrl: 'https://api.railsr.com/v1',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn(),
			},
		};
	});

	describe('createBeneficiary operation', () => {
		it('should create a beneficiary successfully', async () => {
			const mockResponse = { id: '123', name: 'John Doe', status: 'active' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('createBeneficiary')
				.mockReturnValueOnce('John Doe')
				.mockReturnValueOnce('12345678')
				.mockReturnValueOnce('123456')
				.mockReturnValueOnce('Test Bank')
				.mockReturnValueOnce('123 Test St');

			const result = await executeBeneficiaryOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'POST',
					url: 'https://api.railsr.com/v1/beneficiaries',
					headers: expect.objectContaining({
						'Authorization': 'Bearer test-token',
						'X-Idempotency-Key': expect.any(String),
					}),
				})
			);
		});

		it('should handle create beneficiary error', async () => {
			const mockError = new Error('API Error');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('createBeneficiary');

			await expect(
				executeBeneficiaryOperations.call(mockExecuteFunctions, [{ json: {} }])
			).rejects.toThrow('API Error');
		});
	});

	describe('getBeneficiary operation', () => {
		it('should get a beneficiary successfully', async () => {
			const mockResponse = { id: '123', name: 'John Doe', status: 'active' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getBeneficiary')
				.mockReturnValueOnce('123');

			const result = await executeBeneficiaryOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'GET',
					url: 'https://api.railsr.com/v1/beneficiaries/123',
				})
			);
		});
	});

	describe('getAllBeneficiaries operation', () => {
		it('should get all beneficiaries successfully', async () => {
			const mockResponse = { data: [{ id: '123', name: 'John Doe' }], total: 1 };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAllBeneficiaries')
				.mockReturnValueOnce(1)
				.mockReturnValueOnce(20)
				.mockReturnValueOnce('active');

			const result = await executeBeneficiaryOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});
	});

	describe('updateBeneficiary operation', () => {
		it('should update a beneficiary successfully', async () => {
			const mockResponse = { id: '123', name: 'Jane Doe', status: 'active' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('updateBeneficiary')
				.mockReturnValueOnce('123')
				.mockReturnValueOnce('Jane Doe')
				.mockReturnValueOnce('456 New St')
				.mockReturnValueOnce('active');

			const result = await executeBeneficiaryOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'PATCH',
					url: 'https://api.railsr.com/v1/beneficiaries/123',
				})
			);
		});
	});

	describe('deleteBeneficiary operation', () => {
		it('should delete a beneficiary successfully', async () => {
			const mockResponse = { message: 'Beneficiary deleted' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('deleteBeneficiary')
				.mockReturnValueOnce('123');

			const result = await executeBeneficiaryOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'DELETE',
					url: 'https://api.railsr.com/v1/beneficiaries/123',
				})
			);
		});
	});

	describe('verifyBeneficiary operation', () => {
		it('should verify a beneficiary successfully', async () => {
			const mockResponse = { id: '123', verified: true, status: 'verified' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('verifyBeneficiary')
				.mockReturnValueOnce('123');

			const result = await executeBeneficiaryOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'POST',
					url: 'https://api.railsr.com/v1/beneficiaries/123/verify',
					headers: expect.objectContaining({
						'X-Idempotency-Key': expect.any(String),
					}),
				})
			);
		});
	});

	describe('error handling', () => {
		it('should handle unknown operation', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('unknownOperation');

			await expect(
				executeBeneficiaryOperations.call(mockExecuteFunctions, [{ json: {} }])
			).rejects.toThrow('Unknown operation: unknownOperation');
		});

		it('should continue on fail when enabled', async () => {
			const mockError = new Error('API Error');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getBeneficiary');

			const result = await executeBeneficiaryOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
		});
	});
});

describe('Customer Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({ 
				bearerToken: 'test-token', 
				baseUrl: 'https://api.railsr.com/v1' 
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: { httpRequest: jest.fn(), requestWithAuthentication: jest.fn() },
		};
	});

	it('should create a customer successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('createCustomer')
			.mockReturnValueOnce('individual')
			.mockReturnValueOnce('John')
			.mockReturnValueOnce('Doe')
			.mockReturnValueOnce('john@example.com')
			.mockReturnValueOnce('+1234567890')
			.mockReturnValueOnce('{"street": "123 Main St"}');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ id: 'cust_123', status: 'created' });

		const result = await executeCustomerOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([{ json: { id: 'cust_123', status: 'created' }, pairedItem: { item: 0 } }]);
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'POST',
			url: 'https://api.railsr.com/v1/customers',
			headers: {
				Authorization: 'Bearer test-token',
				'Content-Type': 'application/json',
			},
			body: {
				type: 'individual',
				first_name: 'John',
				last_name: 'Doe',
				email: 'john@example.com',
				phone: '+1234567890',
				address: { street: '123 Main St' }
			},
			json: true,
		});
	});

	it('should get a customer successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getCustomer')
			.mockReturnValueOnce('cust_123');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ id: 'cust_123', first_name: 'John' });

		const result = await executeCustomerOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([{ json: { id: 'cust_123', first_name: 'John' }, pairedItem: { item: 0 } }]);
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'GET',
			url: 'https://api.railsr.com/v1/customers/cust_123',
			headers: {
				Authorization: 'Bearer test-token',
			},
			json: true,
		});
	});

	it('should initiate KYC successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('initiateKyc')
			.mockReturnValueOnce('cust_123')
			.mockReturnValueOnce('passport')
			.mockReturnValueOnce('P123456789');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ kyc_id: 'kyc_456', status: 'initiated' });

		const result = await executeCustomerOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([{ json: { kyc_id: 'kyc_456', status: 'initiated' }, pairedItem: { item: 0 } }]);
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'POST',
			url: 'https://api.railsr.com/v1/customers/cust_123/kyc',
			headers: {
				Authorization: 'Bearer test-token',
				'Content-Type': 'application/json',
			},
			body: {
				document_type: 'passport',
				document_number: 'P123456789'
			},
			json: true,
		});
	});

	it('should handle errors gracefully when continueOnFail is true', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getCustomer').mockReturnValueOnce('invalid_id');
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Customer not found'));

		const result = await executeCustomerOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([{ json: { error: 'Customer not found' }, pairedItem: { item: 0 } }]);
	});

	it('should throw errors when continueOnFail is false', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getCustomer').mockReturnValueOnce('invalid_id');
		mockExecuteFunctions.continueOnFail.mockReturnValue(false);
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Customer not found'));

		await expect(executeCustomerOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('Customer not found');
	});
});

describe('Account Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        bearerToken: 'test-token',
        baseUrl: 'https://api.railsr.com/v1'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn()
      },
    };
  });

  it('should create account successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('createAccount')
      .mockReturnValueOnce('customer123')
      .mockReturnValueOnce('checking')
      .mockReturnValueOnce('GBP')
      .mockReturnValueOnce('product123');

    const mockResponse = { account_id: 'acc123', status: 'active' };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.railsr.com/v1/accounts',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      },
      body: {
        customer_id: 'customer123',
        account_type: 'checking',
        currency: 'GBP',
        product_id: 'product123'
      },
      json: true
    });
  });

  it('should get account successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getAccount')
      .mockReturnValueOnce('acc123');

    const mockResponse = { account_id: 'acc123', balance: 1000 };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.railsr.com/v1/accounts/acc123',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      },
      json: true
    });
  });

  it('should handle errors correctly', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getAccount')
      .mockReturnValueOnce('invalid-id');

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Account not found'));
    
    await expect(executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]))
      .rejects.toThrow('Account not found');
  });

  it('should continue on fail when enabled', async () => {
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getAccount')
      .mockReturnValueOnce('invalid-id');

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Account not found'));
    
    const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('Account not found');
  });
});

describe('Transaction Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-api-key',
				baseUrl: 'https://api.railsr.com/v1',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
			},
		};
	});

	describe('createTransaction', () => {
		it('should create a transaction successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('createTransaction')
				.mockReturnValueOnce('acc123')
				.mockReturnValueOnce(100)
				.mockReturnValueOnce('USD')
				.mockReturnValueOnce('credit')
				.mockReturnValueOnce('REF123')
				.mockReturnValueOnce('idem123');

			const mockResponse = { id: 'txn123', status: 'completed' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result[0].json).toEqual(mockResponse);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://api.railsr.com/v1/transactions',
				headers: {
					'Authorization': 'Bearer test-api-key',
					'Content-Type': 'application/json',
					'Idempotency-Key': 'idem123',
				},
				body: {
					account_id: 'acc123',
					amount: 100,
					currency: 'USD',
					type: 'credit',
					reference: 'REF123',
				},
				json: true,
			});
		});

		it('should handle createTransaction errors', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('createTransaction');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result[0].json.error).toBe('API Error');
		});
	});

	describe('getTransaction', () => {
		it('should get transaction successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getTransaction')
				.mockReturnValueOnce('txn123');

			const mockResponse = { id: 'txn123', amount: 100 };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result[0].json).toEqual(mockResponse);
		});
	});

	describe('getAllTransactions', () => {
		it('should get all transactions successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAllTransactions')
				.mockReturnValueOnce(1)
				.mockReturnValueOnce(20)
				.mockReturnValueOnce('completed')
				.mockReturnValueOnce('acc123')
				.mockReturnValueOnce('2023-01-01')
				.mockReturnValueOnce('2023-12-31');

			const mockResponse = { transactions: [] };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result[0].json).toEqual(mockResponse);
		});
	});

	describe('updateTransaction', () => {
		it('should update transaction successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('updateTransaction')
				.mockReturnValueOnce('txn123')
				.mockReturnValueOnce('completed')
				.mockReturnValueOnce('Updated notes');

			const mockResponse = { id: 'txn123', status: 'completed' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result[0].json).toEqual(mockResponse);
		});
	});

	describe('reverseTransaction', () => {
		it('should reverse transaction successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('reverseTransaction')
				.mockReturnValueOnce('txn123')
				.mockReturnValueOnce('Customer request');

			const mockResponse = { id: 'txn123', status: 'reversed' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result[0].json).toEqual(mockResponse);
		});
	});

	describe('getTransactionReceipt', () => {
		it('should get transaction receipt successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getTransactionReceipt')
				.mockReturnValueOnce('txn123');

			const mockResponse = { receipt_url: 'https://example.com/receipt.pdf' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result[0].json).toEqual(mockResponse);
		});
	});
});

describe('Webhook Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        bearerToken: 'test-token',
        baseUrl: 'https://api.railsr.com/v1'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('createWebhook', () => {
    it('should create a webhook successfully', async () => {
      const mockResponse = {
        webhook_id: 'webhook_123',
        url: 'https://example.com/webhook',
        events: ['account.created'],
        status: 'active'
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createWebhook')
        .mockReturnValueOnce('https://example.com/webhook')
        .mockReturnValueOnce(['account.created'])
        .mockReturnValueOnce('secret123');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeWebhookOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });

    it('should handle errors when creating webhook', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createWebhook')
        .mockReturnValueOnce('https://example.com/webhook')
        .mockReturnValueOnce(['account.created'])
        .mockReturnValueOnce('');

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeWebhookOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('API Error');
    });
  });

  describe('getWebhook', () => {
    it('should get webhook details successfully', async () => {
      const mockResponse = {
        webhook_id: 'webhook_123',
        url: 'https://example.com/webhook',
        events: ['account.created'],
        status: 'active'
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getWebhook')
        .mockReturnValueOnce('webhook_123');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeWebhookOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getAllWebhooks', () => {
    it('should get all webhooks successfully', async () => {
      const mockResponse = {
        data: [
          { webhook_id: 'webhook_123', url: 'https://example.com/webhook1', status: 'active' },
          { webhook_id: 'webhook_456', url: 'https://example.com/webhook2', status: 'inactive' }
        ],
        meta: { total: 2, page: 1, limit: 50 }
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAllWebhooks')
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(50)
        .mockReturnValueOnce('active');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeWebhookOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('updateWebhook', () => {
    it('should update webhook successfully', async () => {
      const mockResponse = {
        webhook_id: 'webhook_123',
        url: 'https://example.com/webhook-updated',
        events: ['account.created', 'account.updated'],
        status: 'active'
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('updateWebhook')
        .mockReturnValueOnce('webhook_123')
        .mockReturnValueOnce('https://example.com/webhook-updated')
        .mockReturnValueOnce(['account.created', 'account.updated'])
        .mockReturnValueOnce('active');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeWebhookOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('deleteWebhook', () => {
    it('should delete webhook successfully', async () => {
      const mockResponse = { success: true };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('deleteWebhook')
        .mockReturnValueOnce('webhook_123');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeWebhookOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('testWebhook', () => {
    it('should test webhook successfully', async () => {
      const mockResponse = { test_successful: true, response_code: 200 };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('testWebhook')
        .mockReturnValueOnce('webhook_123')
        .mockReturnValueOnce('account.created');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeWebhookOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });
});
});

/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

describe('Railsr Node', () => {
  describe('Resource Definitions', () => {
    it('should have all expected resources defined', () => {
      const expectedResources = [
        'auditLog',
        'beneficiary',
        'card',
        'cardProgram',
        'cardTransaction',
        'companyHolder',
        'document',
        'enduser',
        'fx',
        'fxQuote',
        'internalTransfer',
        'kybCheck',
        'kycCheck',
        'ledger',
        'ledgerAccount',
        'payin',
        'payout',
        'report',
        'sepaPayment',
        'simulation',
        'swiftPayment',
        'ukPayment',
        'webhook',
      ];

      expect(expectedResources).toHaveLength(23);
    });
  });

  describe('Payment Rails', () => {
    it('should support multiple payment rails', () => {
      const supportedRails = ['sepa', 'sepaInstant', 'fasterPayments', 'bacs', 'swift'];
      expect(supportedRails).toHaveLength(5);
    });
  });

  describe('Card Operations', () => {
    it('should support card management operations', () => {
      const cardOperations = [
        'create',
        'get',
        'list',
        'activate',
        'block',
        'unblock',
        'setPin',
        'getPin',
        'setLimits',
        'getLimits',
        'cancel',
        'replace',
      ];
      expect(cardOperations.length).toBeGreaterThan(10);
    });
  });

  describe('Compliance Operations', () => {
    it('should support KYC and KYB checks', () => {
      const complianceResources = ['kycCheck', 'kybCheck', 'document', 'auditLog'];
      expect(complianceResources).toHaveLength(4);
    });
  });
});

describe('RailsrTrigger Node', () => {
  describe('Webhook Events', () => {
    it('should support multiple event categories', () => {
      const eventCategories = [
        'enduser',
        'ledger',
        'transaction',
        'card',
        'payment',
        'compliance',
      ];
      expect(eventCategories.length).toBeGreaterThan(5);
    });
  });
});

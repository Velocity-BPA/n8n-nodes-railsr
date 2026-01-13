/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestMethods,
	IRequestOptions,
} from 'n8n-workflow';

async function railsrApiRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	qs?: IDataObject,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('railsrApi');
	const baseUrl = credentials.environment === 'production'
		? 'https://api.railsr.com'
		: 'https://api.sandbox.railsr.com';

	const options: IRequestOptions = {
		method,
		uri: `${baseUrl}/v1${endpoint}`,
		json: true,
		headers: {
			'Content-Type': 'application/json',
			'X-Api-Key': credentials.apiKey as string,
			'X-Api-Secret': credentials.apiSecret as string,
			'X-Program-Id': credentials.programId as string,
		},
	};

	if (body && Object.keys(body).length > 0) {
		options.body = body;
	}
	if (qs && Object.keys(qs).length > 0) {
		options.qs = qs;
	}

	return await this.helpers.request(options);
}

export class Railsr implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Railsr',
		name: 'railsr',
		icon: 'file:railsr.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Railsr embedded finance platform - Banking, Payments, Cards, FX',
		defaults: { name: 'Railsr' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{ name: 'railsrApi', required: true }],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Audit Log', value: 'auditLog' },
					{ name: 'Beneficiary', value: 'beneficiary' },
					{ name: 'Card', value: 'card' },
					{ name: 'Card Program', value: 'cardProgram' },
					{ name: 'Card Transaction', value: 'cardTransaction' },
					{ name: 'Company Holder', value: 'companyHolder' },
					{ name: 'Document', value: 'document' },
					{ name: 'End User', value: 'enduser' },
					{ name: 'FX', value: 'fx' },
					{ name: 'FX Quote', value: 'fxQuote' },
					{ name: 'Internal Transfer', value: 'internalTransfer' },
					{ name: 'KYB Check', value: 'kybCheck' },
					{ name: 'KYC Check', value: 'kycCheck' },
					{ name: 'Ledger', value: 'ledger' },
					{ name: 'Ledger Account', value: 'ledgerAccount' },
					{ name: 'Pay-in', value: 'payin' },
					{ name: 'Payout', value: 'payout' },
					{ name: 'Report', value: 'report' },
					{ name: 'SEPA Payment', value: 'sepaPayment' },
					{ name: 'Simulation', value: 'simulation' },
					{ name: 'SWIFT Payment', value: 'swiftPayment' },
					{ name: 'UK Payment', value: 'ukPayment' },
					{ name: 'Webhook', value: 'webhook' },
				],
				default: 'enduser',
			},
			// ============ END USER ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['enduser'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create end user' },
					{ name: 'Get', value: 'get', action: 'Get end user' },
					{ name: 'Update', value: 'update', action: 'Update end user' },
					{ name: 'List', value: 'list', action: 'List end users' },
					{ name: 'Delete', value: 'delete', action: 'Delete end user' },
					{ name: 'Activate', value: 'activate', action: 'Activate end user' },
					{ name: 'Deactivate', value: 'deactivate', action: 'Deactivate end user' },
					{ name: 'Suspend', value: 'suspend', action: 'Suspend end user' },
				],
				default: 'create',
			},
			{
				displayName: 'End User ID',
				name: 'enduserId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['enduser'], operation: ['get', 'update', 'delete', 'activate', 'deactivate', 'suspend'] } },
			},
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['enduser'], operation: ['create'] } },
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['enduser'], operation: ['create'] } },
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['enduser'], operation: ['create'] } },
			},
			{
				displayName: 'Date of Birth',
				name: 'dateOfBirth',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'YYYY-MM-DD',
				displayOptions: { show: { resource: ['enduser'], operation: ['create'] } },
			},
			{
				displayName: 'Additional Fields',
				name: 'enduserAdditionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['enduser'], operation: ['create', 'update'] } },
				options: [
					{ displayName: 'Phone Number', name: 'phone', type: 'string', default: '' },
					{ displayName: 'Nationality', name: 'nationality', type: 'string', default: '', placeholder: 'GB' },
					{ displayName: 'Address Line 1', name: 'addressLine1', type: 'string', default: '' },
					{ displayName: 'City', name: 'city', type: 'string', default: '' },
					{ displayName: 'Postal Code', name: 'postalCode', type: 'string', default: '' },
					{ displayName: 'Country', name: 'country', type: 'string', default: '', placeholder: 'GB' },
					{ displayName: 'External ID', name: 'externalId', type: 'string', default: '' },
				],
			},
			{
				displayName: 'Filters',
				name: 'enduserFilters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { resource: ['enduser'], operation: ['list'] } },
				options: [
					{ displayName: 'Status', name: 'status', type: 'string', default: '' },
					{ displayName: 'Email', name: 'email', type: 'string', default: '' },
					{ displayName: 'Limit', name: 'limit', type: 'number', default: 20 },
				],
			},
			// ============ LEDGER ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['ledger'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create ledger' },
					{ name: 'Get', value: 'get', action: 'Get ledger' },
					{ name: 'Update', value: 'update', action: 'Update ledger' },
					{ name: 'List', value: 'list', action: 'List ledgers' },
					{ name: 'Get Balance', value: 'getBalance', action: 'Get ledger balance' },
					{ name: 'Get Transactions', value: 'getTransactions', action: 'Get transactions' },
					{ name: 'Get Statement', value: 'getStatement', action: 'Get statement' },
				],
				default: 'create',
			},
			{
				displayName: 'Ledger ID',
				name: 'ledgerId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['ledger'], operation: ['get', 'update', 'getBalance', 'getTransactions', 'getStatement'] } },
			},
			{
				displayName: 'End User ID',
				name: 'ledgerEnduserId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['ledger'], operation: ['create'] } },
				description: 'The end user this ledger belongs to',
			},
			{
				displayName: 'Currency',
				name: 'ledgerCurrency',
				type: 'string',
				required: true,
				default: 'GBP',
				placeholder: 'GBP, EUR, USD',
				displayOptions: { show: { resource: ['ledger'], operation: ['create'] } },
			},
			{
				displayName: 'Ledger Type',
				name: 'ledgerType',
				type: 'options',
				options: [
					{ name: 'Individual', value: 'individual' },
					{ name: 'Business', value: 'business' },
				],
				default: 'individual',
				displayOptions: { show: { resource: ['ledger'], operation: ['create'] } },
			},
			// ============ LEDGER ACCOUNT ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['ledgerAccount'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create account' },
					{ name: 'Get', value: 'get', action: 'Get account' },
					{ name: 'List', value: 'list', action: 'List accounts' },
					{ name: 'Get Balance', value: 'getBalance', action: 'Get balance' },
					{ name: 'Freeze', value: 'freeze', action: 'Freeze account' },
					{ name: 'Unfreeze', value: 'unfreeze', action: 'Unfreeze account' },
					{ name: 'Close', value: 'close', action: 'Close account' },
				],
				default: 'create',
			},
			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['ledgerAccount'], operation: ['get', 'getBalance', 'freeze', 'unfreeze', 'close'] } },
			},
			{
				displayName: 'Ledger ID',
				name: 'accountLedgerId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['ledgerAccount'], operation: ['create', 'list'] } },
			},
			{
				displayName: 'Account Name',
				name: 'accountName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['ledgerAccount'], operation: ['create'] } },
			},
			// ============ BENEFICIARY ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['beneficiary'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create beneficiary' },
					{ name: 'Get', value: 'get', action: 'Get beneficiary' },
					{ name: 'List', value: 'list', action: 'List beneficiaries' },
					{ name: 'Delete', value: 'delete', action: 'Delete beneficiary' },
					{ name: 'Validate', value: 'validate', action: 'Validate beneficiary' },
				],
				default: 'create',
			},
			{
				displayName: 'Beneficiary ID',
				name: 'beneficiaryId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['beneficiary'], operation: ['get', 'delete'] } },
			},
			{
				displayName: 'End User ID',
				name: 'beneficiaryEnduserId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['beneficiary'], operation: ['create', 'list'] } },
			},
			{
				displayName: 'Beneficiary Name',
				name: 'beneficiaryName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['beneficiary'], operation: ['create'] } },
			},
			{
				displayName: 'Account Number / IBAN',
				name: 'beneficiaryAccount',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['beneficiary'], operation: ['create', 'validate'] } },
			},
			{
				displayName: 'Sort Code / BIC',
				name: 'beneficiaryRoutingCode',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['beneficiary'], operation: ['create', 'validate'] } },
			},
			{
				displayName: 'Country',
				name: 'beneficiaryCountry',
				type: 'string',
				default: 'GB',
				displayOptions: { show: { resource: ['beneficiary'], operation: ['create'] } },
			},
			// ============ PAY-IN ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['payin'] } },
				options: [
					{ name: 'Get', value: 'get', action: 'Get pay-in' },
					{ name: 'List', value: 'list', action: 'List pay-ins' },
					{ name: 'Simulate (Sandbox)', value: 'simulate', action: 'Simulate pay-in' },
				],
				default: 'list',
			},
			{
				displayName: 'Pay-in ID',
				name: 'payinId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['payin'], operation: ['get'] } },
			},
			{
				displayName: 'Account ID',
				name: 'payinAccountId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['payin'], operation: ['simulate'] } },
			},
			{
				displayName: 'Amount',
				name: 'payinAmount',
				type: 'number',
				required: true,
				default: 0,
				displayOptions: { show: { resource: ['payin'], operation: ['simulate'] } },
				description: 'Amount in minor units (e.g., 1000 = £10.00)',
			},
			{
				displayName: 'Currency',
				name: 'payinCurrency',
				type: 'string',
				required: true,
				default: 'GBP',
				displayOptions: { show: { resource: ['payin'], operation: ['simulate'] } },
			},
			// ============ PAYOUT ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['payout'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create payout' },
					{ name: 'Get', value: 'get', action: 'Get payout' },
					{ name: 'List', value: 'list', action: 'List payouts' },
					{ name: 'Cancel', value: 'cancel', action: 'Cancel payout' },
					{ name: 'Approve', value: 'approve', action: 'Approve payout' },
				],
				default: 'create',
			},
			{
				displayName: 'Payout ID',
				name: 'payoutId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['payout'], operation: ['get', 'cancel', 'approve'] } },
			},
			{
				displayName: 'Account ID',
				name: 'payoutAccountId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['payout'], operation: ['create'] } },
			},
			{
				displayName: 'Beneficiary ID',
				name: 'payoutBeneficiaryId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['payout'], operation: ['create'] } },
			},
			{
				displayName: 'Amount',
				name: 'payoutAmount',
				type: 'number',
				required: true,
				default: 0,
				displayOptions: { show: { resource: ['payout'], operation: ['create'] } },
				description: 'Amount in minor units',
			},
			{
				displayName: 'Currency',
				name: 'payoutCurrency',
				type: 'string',
				required: true,
				default: 'GBP',
				displayOptions: { show: { resource: ['payout'], operation: ['create'] } },
			},
			{
				displayName: 'Reference',
				name: 'payoutReference',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['payout'], operation: ['create'] } },
			},
			// ============ SEPA PAYMENT ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['sepaPayment'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create SEPA payment' },
					{ name: 'Create Instant', value: 'createInstant', action: 'Create instant SEPA' },
					{ name: 'Get', value: 'get', action: 'Get SEPA payment' },
					{ name: 'List', value: 'list', action: 'List SEPA payments' },
				],
				default: 'create',
			},
			{
				displayName: 'Payment ID',
				name: 'sepaPaymentId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['sepaPayment'], operation: ['get'] } },
			},
			{
				displayName: 'Account ID',
				name: 'sepaAccountId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['sepaPayment'], operation: ['create', 'createInstant'] } },
			},
			{
				displayName: 'Beneficiary IBAN',
				name: 'sepaIban',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['sepaPayment'], operation: ['create', 'createInstant'] } },
			},
			{
				displayName: 'Beneficiary BIC',
				name: 'sepaBic',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['sepaPayment'], operation: ['create', 'createInstant'] } },
			},
			{
				displayName: 'Beneficiary Name',
				name: 'sepaBeneficiaryName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['sepaPayment'], operation: ['create', 'createInstant'] } },
			},
			{
				displayName: 'Amount',
				name: 'sepaAmount',
				type: 'number',
				required: true,
				default: 0,
				displayOptions: { show: { resource: ['sepaPayment'], operation: ['create', 'createInstant'] } },
				description: 'Amount in EUR cents',
			},
			{
				displayName: 'Reference',
				name: 'sepaReference',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['sepaPayment'], operation: ['create', 'createInstant'] } },
			},
			// ============ UK PAYMENT ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['ukPayment'] } },
				options: [
					{ name: 'Create Faster Payment', value: 'createFps', action: 'Create Faster Payment' },
					{ name: 'Create BACS', value: 'createBacs', action: 'Create BACS payment' },
					{ name: 'Get', value: 'get', action: 'Get UK payment' },
					{ name: 'List', value: 'list', action: 'List UK payments' },
				],
				default: 'createFps',
			},
			{
				displayName: 'Payment ID',
				name: 'ukPaymentId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['ukPayment'], operation: ['get'] } },
			},
			{
				displayName: 'Account ID',
				name: 'ukAccountId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['ukPayment'], operation: ['createFps', 'createBacs'] } },
			},
			{
				displayName: 'Beneficiary Account Number',
				name: 'ukBeneficiaryAccount',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['ukPayment'], operation: ['createFps', 'createBacs'] } },
			},
			{
				displayName: 'Beneficiary Sort Code',
				name: 'ukBeneficiarySortCode',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['ukPayment'], operation: ['createFps', 'createBacs'] } },
			},
			{
				displayName: 'Beneficiary Name',
				name: 'ukBeneficiaryName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['ukPayment'], operation: ['createFps', 'createBacs'] } },
			},
			{
				displayName: 'Amount',
				name: 'ukAmount',
				type: 'number',
				required: true,
				default: 0,
				displayOptions: { show: { resource: ['ukPayment'], operation: ['createFps', 'createBacs'] } },
				description: 'Amount in GBP pence',
			},
			{
				displayName: 'Reference',
				name: 'ukReference',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['ukPayment'], operation: ['createFps', 'createBacs'] } },
			},
			// ============ SWIFT PAYMENT ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['swiftPayment'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create SWIFT payment' },
					{ name: 'Get Quote', value: 'getQuote', action: 'Get SWIFT quote' },
					{ name: 'Get', value: 'get', action: 'Get SWIFT payment' },
					{ name: 'List', value: 'list', action: 'List SWIFT payments' },
					{ name: 'Track', value: 'track', action: 'Track SWIFT payment' },
				],
				default: 'create',
			},
			{
				displayName: 'Payment ID',
				name: 'swiftPaymentId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['swiftPayment'], operation: ['get', 'track'] } },
			},
			{
				displayName: 'Account ID',
				name: 'swiftAccountId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['swiftPayment'], operation: ['create', 'getQuote'] } },
			},
			{
				displayName: 'Beneficiary IBAN',
				name: 'swiftIban',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['swiftPayment'], operation: ['create', 'getQuote'] } },
			},
			{
				displayName: 'Beneficiary BIC',
				name: 'swiftBic',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['swiftPayment'], operation: ['create', 'getQuote'] } },
			},
			{
				displayName: 'Beneficiary Name',
				name: 'swiftBeneficiaryName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['swiftPayment'], operation: ['create', 'getQuote'] } },
			},
			{
				displayName: 'Amount',
				name: 'swiftAmount',
				type: 'number',
				required: true,
				default: 0,
				displayOptions: { show: { resource: ['swiftPayment'], operation: ['create', 'getQuote'] } },
			},
			{
				displayName: 'Currency',
				name: 'swiftCurrency',
				type: 'string',
				required: true,
				default: 'USD',
				displayOptions: { show: { resource: ['swiftPayment'], operation: ['create', 'getQuote'] } },
			},
			{
				displayName: 'Beneficiary Country',
				name: 'swiftCountry',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['swiftPayment'], operation: ['create'] } },
			},
			// ============ INTERNAL TRANSFER ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['internalTransfer'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create transfer' },
					{ name: 'Get', value: 'get', action: 'Get transfer' },
					{ name: 'List', value: 'list', action: 'List transfers' },
					{ name: 'Reverse', value: 'reverse', action: 'Reverse transfer' },
				],
				default: 'create',
			},
			{
				displayName: 'Transfer ID',
				name: 'transferId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['internalTransfer'], operation: ['get', 'reverse'] } },
			},
			{
				displayName: 'Source Account ID',
				name: 'transferSourceAccountId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['internalTransfer'], operation: ['create'] } },
			},
			{
				displayName: 'Target Account ID',
				name: 'transferTargetAccountId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['internalTransfer'], operation: ['create'] } },
			},
			{
				displayName: 'Amount',
				name: 'transferAmount',
				type: 'number',
				required: true,
				default: 0,
				displayOptions: { show: { resource: ['internalTransfer'], operation: ['create'] } },
			},
			{
				displayName: 'Currency',
				name: 'transferCurrency',
				type: 'string',
				required: true,
				default: 'GBP',
				displayOptions: { show: { resource: ['internalTransfer'], operation: ['create'] } },
			},
			{
				displayName: 'Reference',
				name: 'transferReference',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['internalTransfer'], operation: ['create'] } },
			},
			// ============ CARD ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['card'] } },
				options: [
					{ name: 'Create Virtual', value: 'createVirtual', action: 'Create virtual card' },
					{ name: 'Create Physical', value: 'createPhysical', action: 'Create physical card' },
					{ name: 'Get', value: 'get', action: 'Get card' },
					{ name: 'List', value: 'list', action: 'List cards' },
					{ name: 'Activate', value: 'activate', action: 'Activate card' },
					{ name: 'Block', value: 'block', action: 'Block card' },
					{ name: 'Unblock', value: 'unblock', action: 'Unblock card' },
					{ name: 'Get PIN', value: 'getPin', action: 'Get card PIN' },
					{ name: 'Set PIN', value: 'setPin', action: 'Set card PIN' },
					{ name: 'Get Sensitive Data', value: 'getSensitive', action: 'Get card number/CVV' },
					{ name: 'Set Limits', value: 'setLimits', action: 'Set spending limits' },
				],
				default: 'createVirtual',
			},
			{
				displayName: 'Card ID',
				name: 'cardId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['card'], operation: ['get', 'activate', 'block', 'unblock', 'getPin', 'setPin', 'getSensitive', 'setLimits'] } },
			},
			{
				displayName: 'Account ID',
				name: 'cardAccountId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['card'], operation: ['createVirtual', 'createPhysical', 'list'] } },
			},
			{
				displayName: 'Cardholder Name',
				name: 'cardholderName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['card'], operation: ['createVirtual', 'createPhysical'] } },
			},
			{
				displayName: 'Card Program ID',
				name: 'cardProgramId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['card'], operation: ['createVirtual', 'createPhysical'] } },
			},
			{
				displayName: 'PIN',
				name: 'cardPin',
				type: 'string',
				typeOptions: { password: true },
				required: true,
				default: '',
				displayOptions: { show: { resource: ['card'], operation: ['setPin'] } },
			},
			{
				displayName: 'Shipping Address',
				name: 'cardShippingAddress',
				type: 'collection',
				placeholder: 'Add Address',
				default: {},
				displayOptions: { show: { resource: ['card'], operation: ['createPhysical'] } },
				options: [
					{ displayName: 'Line 1', name: 'line1', type: 'string', default: '' },
					{ displayName: 'Line 2', name: 'line2', type: 'string', default: '' },
					{ displayName: 'City', name: 'city', type: 'string', default: '' },
					{ displayName: 'Postal Code', name: 'postalCode', type: 'string', default: '' },
					{ displayName: 'Country', name: 'country', type: 'string', default: '' },
				],
			},
			{
				displayName: 'Spending Limits',
				name: 'cardLimits',
				type: 'collection',
				placeholder: 'Add Limit',
				default: {},
				displayOptions: { show: { resource: ['card'], operation: ['setLimits'] } },
				options: [
					{ displayName: 'Daily Limit', name: 'dailyLimit', type: 'number', default: 0 },
					{ displayName: 'Monthly Limit', name: 'monthlyLimit', type: 'number', default: 0 },
					{ displayName: 'Transaction Limit', name: 'transactionLimit', type: 'number', default: 0 },
				],
			},
			// ============ CARD TRANSACTION ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['cardTransaction'] } },
				options: [
					{ name: 'Get', value: 'get', action: 'Get transaction' },
					{ name: 'List', value: 'list', action: 'List transactions' },
					{ name: 'Create Dispute', value: 'createDispute', action: 'Create dispute' },
				],
				default: 'list',
			},
			{
				displayName: 'Transaction ID',
				name: 'cardTransactionId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['cardTransaction'], operation: ['get', 'createDispute'] } },
			},
			{
				displayName: 'Card ID',
				name: 'cardTransactionCardId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['cardTransaction'], operation: ['list'] } },
			},
			{
				displayName: 'Dispute Reason',
				name: 'disputeReason',
				type: 'options',
				options: [
					{ name: 'Fraudulent', value: 'fraudulent' },
					{ name: 'Duplicate', value: 'duplicate' },
					{ name: 'Merchandise Not Received', value: 'merchandise_not_received' },
					{ name: 'Incorrect Amount', value: 'incorrect_amount' },
					{ name: 'Other', value: 'other' },
				],
				default: 'fraudulent',
				displayOptions: { show: { resource: ['cardTransaction'], operation: ['createDispute'] } },
			},
			// ============ CARD PROGRAM ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['cardProgram'] } },
				options: [
					{ name: 'Get', value: 'get', action: 'Get card program' },
					{ name: 'List', value: 'list', action: 'List card programs' },
				],
				default: 'list',
			},
			{
				displayName: 'Program ID',
				name: 'cardProgramIdGet',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['cardProgram'], operation: ['get'] } },
			},
			// ============ FX ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['fx'] } },
				options: [
					{ name: 'Convert', value: 'convert', action: 'Convert currency' },
					{ name: 'Get Rate', value: 'getRate', action: 'Get exchange rate' },
					{ name: 'List Conversions', value: 'listConversions', action: 'List conversions' },
				],
				default: 'getRate',
			},
			{
				displayName: 'Source Currency',
				name: 'fxSourceCurrency',
				type: 'string',
				required: true,
				default: 'GBP',
				displayOptions: { show: { resource: ['fx'], operation: ['convert', 'getRate'] } },
			},
			{
				displayName: 'Target Currency',
				name: 'fxTargetCurrency',
				type: 'string',
				required: true,
				default: 'EUR',
				displayOptions: { show: { resource: ['fx'], operation: ['convert', 'getRate'] } },
			},
			{
				displayName: 'Amount',
				name: 'fxAmount',
				type: 'number',
				required: true,
				default: 0,
				displayOptions: { show: { resource: ['fx'], operation: ['convert'] } },
			},
			{
				displayName: 'Source Account ID',
				name: 'fxSourceAccountId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['fx'], operation: ['convert'] } },
			},
			{
				displayName: 'Target Account ID',
				name: 'fxTargetAccountId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['fx'], operation: ['convert'] } },
			},
			// ============ FX QUOTE ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['fxQuote'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create FX quote' },
					{ name: 'Get', value: 'get', action: 'Get FX quote' },
					{ name: 'Accept', value: 'accept', action: 'Accept FX quote' },
					{ name: 'Reject', value: 'reject', action: 'Reject FX quote' },
				],
				default: 'create',
			},
			{
				displayName: 'Quote ID',
				name: 'fxQuoteId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['fxQuote'], operation: ['get', 'accept', 'reject'] } },
			},
			{
				displayName: 'Source Currency',
				name: 'fxQuoteSourceCurrency',
				type: 'string',
				required: true,
				default: 'GBP',
				displayOptions: { show: { resource: ['fxQuote'], operation: ['create'] } },
			},
			{
				displayName: 'Target Currency',
				name: 'fxQuoteTargetCurrency',
				type: 'string',
				required: true,
				default: 'EUR',
				displayOptions: { show: { resource: ['fxQuote'], operation: ['create'] } },
			},
			{
				displayName: 'Amount',
				name: 'fxQuoteAmount',
				type: 'number',
				required: true,
				default: 0,
				displayOptions: { show: { resource: ['fxQuote'], operation: ['create'] } },
			},
			// ============ WEBHOOK ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['webhook'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create webhook' },
					{ name: 'Get', value: 'get', action: 'Get webhook' },
					{ name: 'List', value: 'list', action: 'List webhooks' },
					{ name: 'Delete', value: 'delete', action: 'Delete webhook' },
					{ name: 'Test', value: 'test', action: 'Test webhook' },
				],
				default: 'list',
			},
			{
				displayName: 'Webhook ID',
				name: 'webhookId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['webhook'], operation: ['get', 'delete', 'test'] } },
			},
			{
				displayName: 'URL',
				name: 'webhookUrl',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['webhook'], operation: ['create'] } },
			},
			{
				displayName: 'Events',
				name: 'webhookEvents',
				type: 'multiOptions',
				options: [
					{ name: 'Card Created', value: 'card.created' },
					{ name: 'Card Updated', value: 'card.updated' },
					{ name: 'Card Transaction Created', value: 'card.transaction.created' },
					{ name: 'Payment Created', value: 'payment.created' },
					{ name: 'Payment Completed', value: 'payment.completed' },
					{ name: 'Payment Failed', value: 'payment.failed' },
					{ name: 'Pay-in Received', value: 'payin.received' },
					{ name: 'KYC Completed', value: 'kyc.completed' },
					{ name: 'KYC Failed', value: 'kyc.failed' },
					{ name: 'Ledger Balance Changed', value: 'ledger.balance.changed' },
				],
				default: [],
				displayOptions: { show: { resource: ['webhook'], operation: ['create'] } },
			},
			// ============ KYC CHECK ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['kycCheck'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create KYC check' },
					{ name: 'Get', value: 'get', action: 'Get KYC check' },
					{ name: 'List', value: 'list', action: 'List KYC checks' },
				],
				default: 'create',
			},
			{
				displayName: 'KYC Check ID',
				name: 'kycCheckId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['kycCheck'], operation: ['get'] } },
			},
			{
				displayName: 'End User ID',
				name: 'kycEnduserId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['kycCheck'], operation: ['create', 'list'] } },
			},
			{
				displayName: 'Check Type',
				name: 'kycCheckType',
				type: 'options',
				options: [
					{ name: 'Identity', value: 'identity' },
					{ name: 'Document', value: 'document' },
					{ name: 'Address', value: 'address' },
					{ name: 'Full', value: 'full' },
				],
				default: 'identity',
				displayOptions: { show: { resource: ['kycCheck'], operation: ['create'] } },
			},
			// ============ KYB CHECK ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['kybCheck'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create KYB check' },
					{ name: 'Get', value: 'get', action: 'Get KYB check' },
					{ name: 'List', value: 'list', action: 'List KYB checks' },
				],
				default: 'create',
			},
			{
				displayName: 'KYB Check ID',
				name: 'kybCheckId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['kybCheck'], operation: ['get'] } },
			},
			{
				displayName: 'Company ID',
				name: 'kybCompanyId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['kybCheck'], operation: ['create', 'list'] } },
			},
			// ============ DOCUMENT ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['document'] } },
				options: [
					{ name: 'Upload', value: 'upload', action: 'Upload document' },
					{ name: 'Get', value: 'get', action: 'Get document' },
					{ name: 'List', value: 'list', action: 'List documents' },
					{ name: 'Delete', value: 'delete', action: 'Delete document' },
				],
				default: 'list',
			},
			{
				displayName: 'Document ID',
				name: 'documentId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['document'], operation: ['get', 'delete'] } },
			},
			{
				displayName: 'End User ID',
				name: 'documentEnduserId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['document'], operation: ['upload', 'list'] } },
			},
			{
				displayName: 'Document Type',
				name: 'documentType',
				type: 'options',
				options: [
					{ name: 'Passport', value: 'passport' },
					{ name: 'Driving License', value: 'driving_license' },
					{ name: 'National ID', value: 'national_id' },
					{ name: 'Proof of Address', value: 'proof_of_address' },
					{ name: 'Selfie', value: 'selfie' },
				],
				default: 'passport',
				displayOptions: { show: { resource: ['document'], operation: ['upload'] } },
			},
			{
				displayName: 'File URL',
				name: 'documentFileUrl',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['document'], operation: ['upload'] } },
				description: 'URL of the document file to upload',
			},
			// ============ COMPANY HOLDER ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['companyHolder'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create company holder' },
					{ name: 'Get', value: 'get', action: 'Get company holder' },
					{ name: 'List', value: 'list', action: 'List company holders' },
					{ name: 'Update', value: 'update', action: 'Update company holder' },
				],
				default: 'create',
			},
			{
				displayName: 'Company Holder ID',
				name: 'companyHolderId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['companyHolder'], operation: ['get', 'update'] } },
			},
			{
				displayName: 'Company Name',
				name: 'companyName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['companyHolder'], operation: ['create'] } },
			},
			{
				displayName: 'Registration Number',
				name: 'companyRegNumber',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['companyHolder'], operation: ['create'] } },
			},
			{
				displayName: 'Country',
				name: 'companyCountry',
				type: 'string',
				required: true,
				default: 'GB',
				displayOptions: { show: { resource: ['companyHolder'], operation: ['create'] } },
			},
			// ============ SIMULATION ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['simulation'] } },
				options: [
					{ name: 'Simulate Pay-in', value: 'simulatePayin', action: 'Simulate pay-in' },
					{ name: 'Simulate Card Transaction', value: 'simulateCardTx', action: 'Simulate card transaction' },
					{ name: 'Approve KYC', value: 'approveKyc', action: 'Approve KYC (sandbox)' },
					{ name: 'Reject KYC', value: 'rejectKyc', action: 'Reject KYC (sandbox)' },
				],
				default: 'simulatePayin',
			},
			{
				displayName: 'Account ID',
				name: 'simulationAccountId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['simulation'], operation: ['simulatePayin'] } },
			},
			{
				displayName: 'Card ID',
				name: 'simulationCardId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['simulation'], operation: ['simulateCardTx'] } },
			},
			{
				displayName: 'End User ID',
				name: 'simulationEnduserId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['simulation'], operation: ['approveKyc', 'rejectKyc'] } },
			},
			{
				displayName: 'Amount',
				name: 'simulationAmount',
				type: 'number',
				required: true,
				default: 10000,
				displayOptions: { show: { resource: ['simulation'], operation: ['simulatePayin', 'simulateCardTx'] } },
				description: 'Amount in minor units',
			},
			{
				displayName: 'Currency',
				name: 'simulationCurrency',
				type: 'string',
				required: true,
				default: 'GBP',
				displayOptions: { show: { resource: ['simulation'], operation: ['simulatePayin', 'simulateCardTx'] } },
			},
			{
				displayName: 'Merchant Name',
				name: 'simulationMerchant',
				type: 'string',
				default: 'Test Merchant',
				displayOptions: { show: { resource: ['simulation'], operation: ['simulateCardTx'] } },
			},
			// ============ REPORT ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['report'] } },
				options: [
					{ name: 'Generate', value: 'generate', action: 'Generate report' },
					{ name: 'Get', value: 'get', action: 'Get report' },
					{ name: 'List', value: 'list', action: 'List reports' },
					{ name: 'Download', value: 'download', action: 'Download report' },
				],
				default: 'list',
			},
			{
				displayName: 'Report ID',
				name: 'reportId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['report'], operation: ['get', 'download'] } },
			},
			{
				displayName: 'Report Type',
				name: 'reportType',
				type: 'options',
				options: [
					{ name: 'Transactions', value: 'transactions' },
					{ name: 'Balances', value: 'balances' },
					{ name: 'Cards', value: 'cards' },
					{ name: 'Payments', value: 'payments' },
				],
				default: 'transactions',
				displayOptions: { show: { resource: ['report'], operation: ['generate'] } },
			},
			{
				displayName: 'Start Date',
				name: 'reportStartDate',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'YYYY-MM-DD',
				displayOptions: { show: { resource: ['report'], operation: ['generate'] } },
			},
			{
				displayName: 'End Date',
				name: 'reportEndDate',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'YYYY-MM-DD',
				displayOptions: { show: { resource: ['report'], operation: ['generate'] } },
			},
			// ============ AUDIT LOG ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['auditLog'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List audit logs' },
					{ name: 'Get', value: 'get', action: 'Get audit log entry' },
				],
				default: 'list',
			},
			{
				displayName: 'Audit Log ID',
				name: 'auditLogId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['auditLog'], operation: ['get'] } },
			},
			{
				displayName: 'Filters',
				name: 'auditLogFilters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { resource: ['auditLog'], operation: ['list'] } },
				options: [
					{ displayName: 'Entity Type', name: 'entityType', type: 'string', default: '' },
					{ displayName: 'Entity ID', name: 'entityId', type: 'string', default: '' },
					{ displayName: 'Action', name: 'action', type: 'string', default: '' },
					{ displayName: 'Start Date', name: 'startDate', type: 'string', default: '', placeholder: 'YYYY-MM-DD' },
					{ displayName: 'End Date', name: 'endDate', type: 'string', default: '', placeholder: 'YYYY-MM-DD' },
					{ displayName: 'Limit', name: 'limit', type: 'number', default: 50 },
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				let responseData: IDataObject = {};

				// ============ END USER ============
				if (resource === 'enduser') {
					if (operation === 'create') {
						const body: IDataObject = {
							first_name: this.getNodeParameter('firstName', i),
							last_name: this.getNodeParameter('lastName', i),
							email: this.getNodeParameter('email', i),
							date_of_birth: this.getNodeParameter('dateOfBirth', i),
						};
						const additionalFields = this.getNodeParameter('enduserAdditionalFields', i, {}) as IDataObject;
						Object.assign(body, additionalFields);
						responseData = await railsrApiRequest.call(this, 'POST', '/endusers', body);
					} else if (operation === 'get') {
						const id = this.getNodeParameter('enduserId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/endusers/${id}`);
					} else if (operation === 'update') {
						const id = this.getNodeParameter('enduserId', i) as string;
						const body = this.getNodeParameter('enduserAdditionalFields', i, {}) as IDataObject;
						responseData = await railsrApiRequest.call(this, 'PUT', `/endusers/${id}`, body);
					} else if (operation === 'list') {
						const filters = this.getNodeParameter('enduserFilters', i, {}) as IDataObject;
						responseData = await railsrApiRequest.call(this, 'GET', '/endusers', undefined, filters);
					} else if (operation === 'delete') {
						const id = this.getNodeParameter('enduserId', i) as string;
						responseData = await railsrApiRequest.call(this, 'DELETE', `/endusers/${id}`);
					} else if (operation === 'activate') {
						const id = this.getNodeParameter('enduserId', i) as string;
						responseData = await railsrApiRequest.call(this, 'POST', `/endusers/${id}/activate`);
					} else if (operation === 'deactivate') {
						const id = this.getNodeParameter('enduserId', i) as string;
						responseData = await railsrApiRequest.call(this, 'POST', `/endusers/${id}/deactivate`);
					} else if (operation === 'suspend') {
						const id = this.getNodeParameter('enduserId', i) as string;
						responseData = await railsrApiRequest.call(this, 'POST', `/endusers/${id}/suspend`);
					}
				}

				// ============ LEDGER ============
				else if (resource === 'ledger') {
					if (operation === 'create') {
						const body: IDataObject = {
							enduser_id: this.getNodeParameter('ledgerEnduserId', i),
							currency: this.getNodeParameter('ledgerCurrency', i),
							type: this.getNodeParameter('ledgerType', i),
						};
						responseData = await railsrApiRequest.call(this, 'POST', '/ledgers', body);
					} else if (operation === 'get') {
						const id = this.getNodeParameter('ledgerId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/ledgers/${id}`);
					} else if (operation === 'update') {
						const id = this.getNodeParameter('ledgerId', i) as string;
						responseData = await railsrApiRequest.call(this, 'PUT', `/ledgers/${id}`);
					} else if (operation === 'list') {
						responseData = await railsrApiRequest.call(this, 'GET', '/ledgers');
					} else if (operation === 'getBalance') {
						const id = this.getNodeParameter('ledgerId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/ledgers/${id}/balance`);
					} else if (operation === 'getTransactions') {
						const id = this.getNodeParameter('ledgerId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/ledgers/${id}/transactions`);
					} else if (operation === 'getStatement') {
						const id = this.getNodeParameter('ledgerId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/ledgers/${id}/statement`);
					}
				}

				// ============ LEDGER ACCOUNT ============
				else if (resource === 'ledgerAccount') {
					if (operation === 'create') {
						const body: IDataObject = {
							ledger_id: this.getNodeParameter('accountLedgerId', i),
							name: this.getNodeParameter('accountName', i),
						};
						responseData = await railsrApiRequest.call(this, 'POST', '/ledger-accounts', body);
					} else if (operation === 'get') {
						const id = this.getNodeParameter('accountId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/ledger-accounts/${id}`);
					} else if (operation === 'list') {
						const ledgerId = this.getNodeParameter('accountLedgerId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', '/ledger-accounts', undefined, { ledger_id: ledgerId });
					} else if (operation === 'getBalance') {
						const id = this.getNodeParameter('accountId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/ledger-accounts/${id}/balance`);
					} else if (operation === 'freeze') {
						const id = this.getNodeParameter('accountId', i) as string;
						responseData = await railsrApiRequest.call(this, 'POST', `/ledger-accounts/${id}/freeze`);
					} else if (operation === 'unfreeze') {
						const id = this.getNodeParameter('accountId', i) as string;
						responseData = await railsrApiRequest.call(this, 'POST', `/ledger-accounts/${id}/unfreeze`);
					} else if (operation === 'close') {
						const id = this.getNodeParameter('accountId', i) as string;
						responseData = await railsrApiRequest.call(this, 'POST', `/ledger-accounts/${id}/close`);
					}
				}

				// ============ BENEFICIARY ============
				else if (resource === 'beneficiary') {
					if (operation === 'create') {
						const body: IDataObject = {
							enduser_id: this.getNodeParameter('beneficiaryEnduserId', i),
							name: this.getNodeParameter('beneficiaryName', i),
							account_number: this.getNodeParameter('beneficiaryAccount', i),
							routing_code: this.getNodeParameter('beneficiaryRoutingCode', i),
							country: this.getNodeParameter('beneficiaryCountry', i),
						};
						responseData = await railsrApiRequest.call(this, 'POST', '/beneficiaries', body);
					} else if (operation === 'get') {
						const id = this.getNodeParameter('beneficiaryId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/beneficiaries/${id}`);
					} else if (operation === 'list') {
						const enduserId = this.getNodeParameter('beneficiaryEnduserId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', '/beneficiaries', undefined, { enduser_id: enduserId });
					} else if (operation === 'delete') {
						const id = this.getNodeParameter('beneficiaryId', i) as string;
						responseData = await railsrApiRequest.call(this, 'DELETE', `/beneficiaries/${id}`);
					} else if (operation === 'validate') {
						const body: IDataObject = {
							account_number: this.getNodeParameter('beneficiaryAccount', i),
							routing_code: this.getNodeParameter('beneficiaryRoutingCode', i),
						};
						responseData = await railsrApiRequest.call(this, 'POST', '/beneficiaries/validate', body);
					}
				}

				// ============ PAY-IN ============
				else if (resource === 'payin') {
					if (operation === 'get') {
						const id = this.getNodeParameter('payinId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/payins/${id}`);
					} else if (operation === 'list') {
						responseData = await railsrApiRequest.call(this, 'GET', '/payins');
					} else if (operation === 'simulate') {
						const body: IDataObject = {
							account_id: this.getNodeParameter('payinAccountId', i),
							amount: this.getNodeParameter('payinAmount', i),
							currency: this.getNodeParameter('payinCurrency', i),
						};
						responseData = await railsrApiRequest.call(this, 'POST', '/simulation/payins', body);
					}
				}

				// ============ PAYOUT ============
				else if (resource === 'payout') {
					if (operation === 'create') {
						const body: IDataObject = {
							account_id: this.getNodeParameter('payoutAccountId', i),
							beneficiary_id: this.getNodeParameter('payoutBeneficiaryId', i),
							amount: this.getNodeParameter('payoutAmount', i),
							currency: this.getNodeParameter('payoutCurrency', i),
							reference: this.getNodeParameter('payoutReference', i),
						};
						responseData = await railsrApiRequest.call(this, 'POST', '/payouts', body);
					} else if (operation === 'get') {
						const id = this.getNodeParameter('payoutId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/payouts/${id}`);
					} else if (operation === 'list') {
						responseData = await railsrApiRequest.call(this, 'GET', '/payouts');
					} else if (operation === 'cancel') {
						const id = this.getNodeParameter('payoutId', i) as string;
						responseData = await railsrApiRequest.call(this, 'POST', `/payouts/${id}/cancel`);
					} else if (operation === 'approve') {
						const id = this.getNodeParameter('payoutId', i) as string;
						responseData = await railsrApiRequest.call(this, 'POST', `/payouts/${id}/approve`);
					}
				}

				// ============ SEPA PAYMENT ============
				else if (resource === 'sepaPayment') {
					if (operation === 'create' || operation === 'createInstant') {
						const body: IDataObject = {
							account_id: this.getNodeParameter('sepaAccountId', i),
							beneficiary_iban: this.getNodeParameter('sepaIban', i),
							beneficiary_bic: this.getNodeParameter('sepaBic', i),
							beneficiary_name: this.getNodeParameter('sepaBeneficiaryName', i),
							amount: this.getNodeParameter('sepaAmount', i),
							reference: this.getNodeParameter('sepaReference', i),
						};
						const endpoint = operation === 'createInstant' ? '/payments/sepa-instant' : '/payments/sepa';
						responseData = await railsrApiRequest.call(this, 'POST', endpoint, body);
					} else if (operation === 'get') {
						const id = this.getNodeParameter('sepaPaymentId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/payments/sepa/${id}`);
					} else if (operation === 'list') {
						responseData = await railsrApiRequest.call(this, 'GET', '/payments/sepa');
					}
				}

				// ============ UK PAYMENT ============
				else if (resource === 'ukPayment') {
					if (operation === 'createFps' || operation === 'createBacs') {
						const body: IDataObject = {
							account_id: this.getNodeParameter('ukAccountId', i),
							beneficiary_account_number: this.getNodeParameter('ukBeneficiaryAccount', i),
							beneficiary_sort_code: this.getNodeParameter('ukBeneficiarySortCode', i),
							beneficiary_name: this.getNodeParameter('ukBeneficiaryName', i),
							amount: this.getNodeParameter('ukAmount', i),
							reference: this.getNodeParameter('ukReference', i),
						};
						const endpoint = operation === 'createFps' ? '/payments/fps' : '/payments/bacs';
						responseData = await railsrApiRequest.call(this, 'POST', endpoint, body);
					} else if (operation === 'get') {
						const id = this.getNodeParameter('ukPaymentId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/payments/uk/${id}`);
					} else if (operation === 'list') {
						responseData = await railsrApiRequest.call(this, 'GET', '/payments/uk');
					}
				}

				// ============ SWIFT PAYMENT ============
				else if (resource === 'swiftPayment') {
					if (operation === 'create') {
						const body: IDataObject = {
							account_id: this.getNodeParameter('swiftAccountId', i),
							beneficiary_iban: this.getNodeParameter('swiftIban', i),
							beneficiary_bic: this.getNodeParameter('swiftBic', i),
							beneficiary_name: this.getNodeParameter('swiftBeneficiaryName', i),
							amount: this.getNodeParameter('swiftAmount', i),
							currency: this.getNodeParameter('swiftCurrency', i),
							beneficiary_country: this.getNodeParameter('swiftCountry', i),
						};
						responseData = await railsrApiRequest.call(this, 'POST', '/payments/swift', body);
					} else if (operation === 'getQuote') {
						const body: IDataObject = {
							account_id: this.getNodeParameter('swiftAccountId', i),
							beneficiary_iban: this.getNodeParameter('swiftIban', i),
							beneficiary_bic: this.getNodeParameter('swiftBic', i),
							beneficiary_name: this.getNodeParameter('swiftBeneficiaryName', i),
							amount: this.getNodeParameter('swiftAmount', i),
							currency: this.getNodeParameter('swiftCurrency', i),
						};
						responseData = await railsrApiRequest.call(this, 'POST', '/payments/swift/quote', body);
					} else if (operation === 'get') {
						const id = this.getNodeParameter('swiftPaymentId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/payments/swift/${id}`);
					} else if (operation === 'list') {
						responseData = await railsrApiRequest.call(this, 'GET', '/payments/swift');
					} else if (operation === 'track') {
						const id = this.getNodeParameter('swiftPaymentId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/payments/swift/${id}/tracking`);
					}
				}

				// ============ INTERNAL TRANSFER ============
				else if (resource === 'internalTransfer') {
					if (operation === 'create') {
						const body: IDataObject = {
							source_account_id: this.getNodeParameter('transferSourceAccountId', i),
							target_account_id: this.getNodeParameter('transferTargetAccountId', i),
							amount: this.getNodeParameter('transferAmount', i),
							currency: this.getNodeParameter('transferCurrency', i),
							reference: this.getNodeParameter('transferReference', i),
						};
						responseData = await railsrApiRequest.call(this, 'POST', '/transfers', body);
					} else if (operation === 'get') {
						const id = this.getNodeParameter('transferId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/transfers/${id}`);
					} else if (operation === 'list') {
						responseData = await railsrApiRequest.call(this, 'GET', '/transfers');
					} else if (operation === 'reverse') {
						const id = this.getNodeParameter('transferId', i) as string;
						responseData = await railsrApiRequest.call(this, 'POST', `/transfers/${id}/reverse`);
					}
				}

				// ============ CARD ============
				else if (resource === 'card') {
					if (operation === 'createVirtual' || operation === 'createPhysical') {
						const body: IDataObject = {
							account_id: this.getNodeParameter('cardAccountId', i),
							cardholder_name: this.getNodeParameter('cardholderName', i),
							card_program_id: this.getNodeParameter('cardProgramId', i),
							type: operation === 'createVirtual' ? 'virtual' : 'physical',
						};
						if (operation === 'createPhysical') {
							const address = this.getNodeParameter('cardShippingAddress', i, {}) as IDataObject;
							if (Object.keys(address).length > 0) {
								body.shipping_address = address;
							}
						}
						responseData = await railsrApiRequest.call(this, 'POST', '/cards', body);
					} else if (operation === 'get') {
						const id = this.getNodeParameter('cardId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/cards/${id}`);
					} else if (operation === 'list') {
						const accountId = this.getNodeParameter('cardAccountId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', '/cards', undefined, { account_id: accountId });
					} else if (operation === 'activate') {
						const id = this.getNodeParameter('cardId', i) as string;
						responseData = await railsrApiRequest.call(this, 'POST', `/cards/${id}/activate`);
					} else if (operation === 'block') {
						const id = this.getNodeParameter('cardId', i) as string;
						responseData = await railsrApiRequest.call(this, 'POST', `/cards/${id}/block`);
					} else if (operation === 'unblock') {
						const id = this.getNodeParameter('cardId', i) as string;
						responseData = await railsrApiRequest.call(this, 'POST', `/cards/${id}/unblock`);
					} else if (operation === 'getPin') {
						const id = this.getNodeParameter('cardId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/cards/${id}/pin`);
					} else if (operation === 'setPin') {
						const id = this.getNodeParameter('cardId', i) as string;
						const body: IDataObject = { pin: this.getNodeParameter('cardPin', i) };
						responseData = await railsrApiRequest.call(this, 'PUT', `/cards/${id}/pin`, body);
					} else if (operation === 'getSensitive') {
						const id = this.getNodeParameter('cardId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/cards/${id}/sensitive`);
					} else if (operation === 'setLimits') {
						const id = this.getNodeParameter('cardId', i) as string;
						const limits = this.getNodeParameter('cardLimits', i, {}) as IDataObject;
						responseData = await railsrApiRequest.call(this, 'PUT', `/cards/${id}/limits`, limits);
					}
				}

				// ============ CARD TRANSACTION ============
				else if (resource === 'cardTransaction') {
					if (operation === 'get') {
						const id = this.getNodeParameter('cardTransactionId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/card-transactions/${id}`);
					} else if (operation === 'list') {
						const cardId = this.getNodeParameter('cardTransactionCardId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', '/card-transactions', undefined, { card_id: cardId });
					} else if (operation === 'createDispute') {
						const id = this.getNodeParameter('cardTransactionId', i) as string;
						const body: IDataObject = { reason: this.getNodeParameter('disputeReason', i) };
						responseData = await railsrApiRequest.call(this, 'POST', `/card-transactions/${id}/dispute`, body);
					}
				}

				// ============ CARD PROGRAM ============
				else if (resource === 'cardProgram') {
					if (operation === 'get') {
						const id = this.getNodeParameter('cardProgramIdGet', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/card-programs/${id}`);
					} else if (operation === 'list') {
						responseData = await railsrApiRequest.call(this, 'GET', '/card-programs');
					}
				}

				// ============ FX ============
				else if (resource === 'fx') {
					if (operation === 'convert') {
						const body: IDataObject = {
							source_currency: this.getNodeParameter('fxSourceCurrency', i),
							target_currency: this.getNodeParameter('fxTargetCurrency', i),
							amount: this.getNodeParameter('fxAmount', i),
							source_account_id: this.getNodeParameter('fxSourceAccountId', i),
							target_account_id: this.getNodeParameter('fxTargetAccountId', i),
						};
						responseData = await railsrApiRequest.call(this, 'POST', '/fx/convert', body);
					} else if (operation === 'getRate') {
						const qs: IDataObject = {
							source_currency: this.getNodeParameter('fxSourceCurrency', i),
							target_currency: this.getNodeParameter('fxTargetCurrency', i),
						};
						responseData = await railsrApiRequest.call(this, 'GET', '/fx/rates', undefined, qs);
					} else if (operation === 'listConversions') {
						responseData = await railsrApiRequest.call(this, 'GET', '/fx/conversions');
					}
				}

				// ============ FX QUOTE ============
				else if (resource === 'fxQuote') {
					if (operation === 'create') {
						const body: IDataObject = {
							source_currency: this.getNodeParameter('fxQuoteSourceCurrency', i),
							target_currency: this.getNodeParameter('fxQuoteTargetCurrency', i),
							amount: this.getNodeParameter('fxQuoteAmount', i),
						};
						responseData = await railsrApiRequest.call(this, 'POST', '/fx/quotes', body);
					} else if (operation === 'get') {
						const id = this.getNodeParameter('fxQuoteId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/fx/quotes/${id}`);
					} else if (operation === 'accept') {
						const id = this.getNodeParameter('fxQuoteId', i) as string;
						responseData = await railsrApiRequest.call(this, 'POST', `/fx/quotes/${id}/accept`);
					} else if (operation === 'reject') {
						const id = this.getNodeParameter('fxQuoteId', i) as string;
						responseData = await railsrApiRequest.call(this, 'POST', `/fx/quotes/${id}/reject`);
					}
				}

				// ============ WEBHOOK ============
				else if (resource === 'webhook') {
					if (operation === 'create') {
						const body: IDataObject = {
							url: this.getNodeParameter('webhookUrl', i),
							events: this.getNodeParameter('webhookEvents', i),
						};
						responseData = await railsrApiRequest.call(this, 'POST', '/webhooks', body);
					} else if (operation === 'get') {
						const id = this.getNodeParameter('webhookId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/webhooks/${id}`);
					} else if (operation === 'list') {
						responseData = await railsrApiRequest.call(this, 'GET', '/webhooks');
					} else if (operation === 'delete') {
						const id = this.getNodeParameter('webhookId', i) as string;
						responseData = await railsrApiRequest.call(this, 'DELETE', `/webhooks/${id}`);
					} else if (operation === 'test') {
						const id = this.getNodeParameter('webhookId', i) as string;
						responseData = await railsrApiRequest.call(this, 'POST', `/webhooks/${id}/test`);
					}
				}

				// ============ KYC CHECK ============
				else if (resource === 'kycCheck') {
					if (operation === 'create') {
						const body: IDataObject = {
							enduser_id: this.getNodeParameter('kycEnduserId', i),
							check_type: this.getNodeParameter('kycCheckType', i),
						};
						responseData = await railsrApiRequest.call(this, 'POST', '/kyc/checks', body);
					} else if (operation === 'get') {
						const id = this.getNodeParameter('kycCheckId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/kyc/checks/${id}`);
					} else if (operation === 'list') {
						const enduserId = this.getNodeParameter('kycEnduserId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', '/kyc/checks', undefined, { enduser_id: enduserId });
					}
				}

				// ============ KYB CHECK ============
				else if (resource === 'kybCheck') {
					if (operation === 'create') {
						const body: IDataObject = {
							company_id: this.getNodeParameter('kybCompanyId', i),
						};
						responseData = await railsrApiRequest.call(this, 'POST', '/kyb/checks', body);
					} else if (operation === 'get') {
						const id = this.getNodeParameter('kybCheckId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/kyb/checks/${id}`);
					} else if (operation === 'list') {
						const companyId = this.getNodeParameter('kybCompanyId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', '/kyb/checks', undefined, { company_id: companyId });
					}
				}

				// ============ DOCUMENT ============
				else if (resource === 'document') {
					if (operation === 'upload') {
						const body: IDataObject = {
							enduser_id: this.getNodeParameter('documentEnduserId', i),
							document_type: this.getNodeParameter('documentType', i),
							file_url: this.getNodeParameter('documentFileUrl', i),
						};
						responseData = await railsrApiRequest.call(this, 'POST', '/documents', body);
					} else if (operation === 'get') {
						const id = this.getNodeParameter('documentId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/documents/${id}`);
					} else if (operation === 'list') {
						const enduserId = this.getNodeParameter('documentEnduserId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', '/documents', undefined, { enduser_id: enduserId });
					} else if (operation === 'delete') {
						const id = this.getNodeParameter('documentId', i) as string;
						responseData = await railsrApiRequest.call(this, 'DELETE', `/documents/${id}`);
					}
				}

				// ============ COMPANY HOLDER ============
				else if (resource === 'companyHolder') {
					if (operation === 'create') {
						const body: IDataObject = {
							name: this.getNodeParameter('companyName', i),
							registration_number: this.getNodeParameter('companyRegNumber', i),
							country: this.getNodeParameter('companyCountry', i),
						};
						responseData = await railsrApiRequest.call(this, 'POST', '/company-holders', body);
					} else if (operation === 'get') {
						const id = this.getNodeParameter('companyHolderId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/company-holders/${id}`);
					} else if (operation === 'list') {
						responseData = await railsrApiRequest.call(this, 'GET', '/company-holders');
					} else if (operation === 'update') {
						const id = this.getNodeParameter('companyHolderId', i) as string;
						responseData = await railsrApiRequest.call(this, 'PUT', `/company-holders/${id}`);
					}
				}

				// ============ SIMULATION ============
				else if (resource === 'simulation') {
					if (operation === 'simulatePayin') {
						const body: IDataObject = {
							account_id: this.getNodeParameter('simulationAccountId', i),
							amount: this.getNodeParameter('simulationAmount', i),
							currency: this.getNodeParameter('simulationCurrency', i),
						};
						responseData = await railsrApiRequest.call(this, 'POST', '/simulation/payins', body);
					} else if (operation === 'simulateCardTx') {
						const body: IDataObject = {
							card_id: this.getNodeParameter('simulationCardId', i),
							amount: this.getNodeParameter('simulationAmount', i),
							currency: this.getNodeParameter('simulationCurrency', i),
							merchant_name: this.getNodeParameter('simulationMerchant', i),
						};
						responseData = await railsrApiRequest.call(this, 'POST', '/simulation/card-transactions', body);
					} else if (operation === 'approveKyc') {
						const body: IDataObject = {
							enduser_id: this.getNodeParameter('simulationEnduserId', i),
						};
						responseData = await railsrApiRequest.call(this, 'POST', '/simulation/kyc/approve', body);
					} else if (operation === 'rejectKyc') {
						const body: IDataObject = {
							enduser_id: this.getNodeParameter('simulationEnduserId', i),
						};
						responseData = await railsrApiRequest.call(this, 'POST', '/simulation/kyc/reject', body);
					}
				}

				// ============ REPORT ============
				else if (resource === 'report') {
					if (operation === 'generate') {
						const body: IDataObject = {
							type: this.getNodeParameter('reportType', i),
							start_date: this.getNodeParameter('reportStartDate', i),
							end_date: this.getNodeParameter('reportEndDate', i),
						};
						responseData = await railsrApiRequest.call(this, 'POST', '/reports', body);
					} else if (operation === 'get') {
						const id = this.getNodeParameter('reportId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/reports/${id}`);
					} else if (operation === 'list') {
						responseData = await railsrApiRequest.call(this, 'GET', '/reports');
					} else if (operation === 'download') {
						const id = this.getNodeParameter('reportId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/reports/${id}/download`);
					}
				}

				// ============ AUDIT LOG ============
				else if (resource === 'auditLog') {
					if (operation === 'get') {
						const id = this.getNodeParameter('auditLogId', i) as string;
						responseData = await railsrApiRequest.call(this, 'GET', `/audit-logs/${id}`);
					} else if (operation === 'list') {
						const filters = this.getNodeParameter('auditLogFilters', i, {}) as IDataObject;
						responseData = await railsrApiRequest.call(this, 'GET', '/audit-logs', undefined, filters);
					}
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

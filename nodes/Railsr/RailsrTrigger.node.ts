/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	IDataObject,
	IHttpRequestMethods,
	IRequestOptions,
} from 'n8n-workflow';

async function railsrApiRequest(
	this: IHookFunctions | IWebhookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
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

	return await this.helpers.request(options);
}

export class RailsrTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Railsr Trigger',
		name: 'railsrTrigger',
		icon: 'file:railsr.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Receive Railsr webhook events in real-time',
		defaults: { name: 'Railsr Trigger' },
		inputs: [],
		outputs: ['main'],
		credentials: [{ name: 'railsrApi', required: true }],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: [],
				options: [
					// Card Events
					{ name: 'Card Activated', value: 'card.activated' },
					{ name: 'Card Blocked', value: 'card.blocked' },
					{ name: 'Card Created', value: 'card.created' },
					{ name: 'Card Expired', value: 'card.expired' },
					{ name: 'Card PIN Changed', value: 'card.pin_changed' },
					{ name: 'Card Unblocked', value: 'card.unblocked' },
					// Card Transaction Events
					{ name: 'Card Transaction Authorized', value: 'card.transaction.authorized' },
					{ name: 'Card Transaction Cleared', value: 'card.transaction.cleared' },
					{ name: 'Card Transaction Declined', value: 'card.transaction.declined' },
					{ name: 'Card Transaction Reversed', value: 'card.transaction.reversed' },
					// End User Events
					{ name: 'End User Activated', value: 'enduser.activated' },
					{ name: 'End User Created', value: 'enduser.created' },
					{ name: 'End User Deactivated', value: 'enduser.deactivated' },
					{ name: 'End User Suspended', value: 'enduser.suspended' },
					{ name: 'End User Updated', value: 'enduser.updated' },
					// KYC Events
					{ name: 'KYC Approved', value: 'kyc.approved' },
					{ name: 'KYC Failed', value: 'kyc.failed' },
					{ name: 'KYC Pending', value: 'kyc.pending' },
					{ name: 'KYC Referred', value: 'kyc.referred' },
					// KYB Events
					{ name: 'KYB Approved', value: 'kyb.approved' },
					{ name: 'KYB Failed', value: 'kyb.failed' },
					{ name: 'KYB Pending', value: 'kyb.pending' },
					// Ledger Events
					{ name: 'Ledger Balance Changed', value: 'ledger.balance.changed' },
					{ name: 'Ledger Created', value: 'ledger.created' },
					// Account Events
					{ name: 'Account Closed', value: 'account.closed' },
					{ name: 'Account Created', value: 'account.created' },
					{ name: 'Account Frozen', value: 'account.frozen' },
					{ name: 'Account Unfrozen', value: 'account.unfrozen' },
					// Pay-in Events
					{ name: 'Pay-in Completed', value: 'payin.completed' },
					{ name: 'Pay-in Failed', value: 'payin.failed' },
					{ name: 'Pay-in Received', value: 'payin.received' },
					// Payout Events
					{ name: 'Payout Approved', value: 'payout.approved' },
					{ name: 'Payout Cancelled', value: 'payout.cancelled' },
					{ name: 'Payout Completed', value: 'payout.completed' },
					{ name: 'Payout Created', value: 'payout.created' },
					{ name: 'Payout Failed', value: 'payout.failed' },
					{ name: 'Payout Pending', value: 'payout.pending' },
					// SEPA Events
					{ name: 'SEPA Payment Completed', value: 'sepa.payment.completed' },
					{ name: 'SEPA Payment Failed', value: 'sepa.payment.failed' },
					{ name: 'SEPA Payment Pending', value: 'sepa.payment.pending' },
					// UK Payment Events
					{ name: 'FPS Completed', value: 'fps.completed' },
					{ name: 'FPS Failed', value: 'fps.failed' },
					{ name: 'BACS Completed', value: 'bacs.completed' },
					{ name: 'BACS Failed', value: 'bacs.failed' },
					// SWIFT Events
					{ name: 'SWIFT Payment Completed', value: 'swift.payment.completed' },
					{ name: 'SWIFT Payment Failed', value: 'swift.payment.failed' },
					{ name: 'SWIFT Payment Processing', value: 'swift.payment.processing' },
					// Transfer Events
					{ name: 'Transfer Completed', value: 'transfer.completed' },
					{ name: 'Transfer Failed', value: 'transfer.failed' },
					{ name: 'Transfer Reversed', value: 'transfer.reversed' },
					// FX Events
					{ name: 'FX Conversion Completed', value: 'fx.conversion.completed' },
					{ name: 'FX Quote Accepted', value: 'fx.quote.accepted' },
					{ name: 'FX Quote Expired', value: 'fx.quote.expired' },
					// Document Events
					{ name: 'Document Uploaded', value: 'document.uploaded' },
					{ name: 'Document Verified', value: 'document.verified' },
					{ name: 'Document Rejected', value: 'document.rejected' },
					// Company Holder Events
					{ name: 'Company Holder Created', value: 'company_holder.created' },
					{ name: 'Company Holder Updated', value: 'company_holder.updated' },
					// Beneficiary Events
					{ name: 'Beneficiary Created', value: 'beneficiary.created' },
					{ name: 'Beneficiary Deleted', value: 'beneficiary.deleted' },
					// Report Events
					{ name: 'Report Ready', value: 'report.ready' },
					// All Events
					{ name: 'All Events', value: '*' },
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const webhookData = this.getWorkflowStaticData('node');
				
				if (webhookData.webhookId) {
					try {
						await railsrApiRequest.call(this, 'GET', `/webhooks/${webhookData.webhookId}`);
						return true;
					} catch {
						delete webhookData.webhookId;
						return false;
					}
				}

				// Check if webhook already exists with this URL
				try {
					const response = await railsrApiRequest.call(this, 'GET', '/webhooks') as IDataObject;
					const webhooks = (response.data || response) as IDataObject[];
					
					for (const webhook of webhooks) {
						if (webhook.url === webhookUrl) {
							webhookData.webhookId = webhook.id;
							return true;
						}
					}
				} catch {
					// Ignore errors
				}

				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const events = this.getNodeParameter('events') as string[];
				const webhookData = this.getWorkflowStaticData('node');

				const body: IDataObject = {
					url: webhookUrl,
					events: events.includes('*') ? ['*'] : events,
					active: true,
				};

				try {
					const response = await railsrApiRequest.call(this, 'POST', '/webhooks', body) as IDataObject;
					webhookData.webhookId = response.id;
					return true;
				} catch (error) {
					throw new Error(`Failed to create Railsr webhook: ${(error as Error).message}`);
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId) {
					try {
						await railsrApiRequest.call(this, 'DELETE', `/webhooks/${webhookData.webhookId}`);
					} catch (error) {
						// Log but don't throw - webhook might already be deleted
						console.warn(`Failed to delete webhook: ${(error as Error).message}`);
					}
					delete webhookData.webhookId;
				}

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const body = this.getBodyData() as IDataObject;
		const events = this.getNodeParameter('events') as string[];

		// Verify the event is one we're listening for
		const eventType = body.event_type as string || body.type as string;
		
		if (!events.includes('*') && eventType && !events.includes(eventType)) {
			// Event not in our subscription list - acknowledge but don't process
			return {
				webhookResponse: { status: 200, body: 'OK' },
				workflowData: undefined,
			};
		}

		// Return the webhook data for processing
		return {
			workflowData: [
				this.helpers.returnJsonArray({
					event: eventType,
					data: body.data || body,
					timestamp: body.timestamp || body.created_at || new Date().toISOString(),
					webhookId: body.webhook_id,
					headers: req.headers,
				}),
			],
		};
	}
}

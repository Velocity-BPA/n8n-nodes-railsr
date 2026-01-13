/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class RailsrApi implements ICredentialType {
	name = 'railsrApi';
	displayName = 'Railsr API';
	documentationUrl = 'https://docs.railsr.com';
	properties: INodeProperties[] = [
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{ name: 'Sandbox', value: 'sandbox' },
				{ name: 'Production', value: 'production' },
			],
			default: 'sandbox',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
		{
			displayName: 'API Secret',
			name: 'apiSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
		{
			displayName: 'Program ID',
			name: 'programId',
			type: 'string',
			default: '',
			required: true,
			description: 'Your Railsr program identifier',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-Api-Key': '={{$credentials.apiKey}}',
				'X-Api-Secret': '={{$credentials.apiSecret}}',
				'X-Program-Id': '={{$credentials.programId}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.environment === "production" ? "https://api.railsr.com" : "https://api.sandbox.railsr.com"}}',
			url: '/v1/endusers',
			method: 'GET',
			qs: { limit: 1 },
		},
	};
}

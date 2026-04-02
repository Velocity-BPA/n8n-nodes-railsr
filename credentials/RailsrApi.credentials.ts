import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class RailsrApi implements ICredentialType {
	name = 'railsrApi';
	displayName = 'Railsr API';
	documentationUrl = 'https://docs.railsr.com/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'API key for authentication. Separate keys required for sandbox and production environments.',
		},
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Production',
					value: 'production',
				},
				{
					name: 'Sandbox',
					value: 'sandbox',
				},
			],
			default: 'sandbox',
			description: 'Environment to connect to',
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.railsr.com/v1',
			description: 'Base URL for the Railsr API',
		},
	];
}
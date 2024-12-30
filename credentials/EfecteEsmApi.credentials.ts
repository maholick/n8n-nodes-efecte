import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class EfecteEsmApi implements ICredentialType {
	name = 'efecteEsmApi';
	displayName = 'Efecte ESM API';
	documentationUrl = 'https://example.com/docs/efecte-esm';
	properties: INodeProperties[] = [
		{
			displayName: 'Efecte Instance URL',
			name: 'instanceUrl',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'https://your-instance.efectecloud.com',
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			qs: {},
			body: {
				login: '={{$credentials.username}}',
				password: '={{$credentials.password}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.instanceUrl}}',
			url: '/rest-api/itsm/v1/users/login',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: {
				login: '={{$credentials.username}}',
				password: '={{$credentials.password}}',
			},
			skipSslCertificateValidation: true,
		},
	};
}

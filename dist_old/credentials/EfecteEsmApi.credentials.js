"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EfecteEsmApi = void 0;
class EfecteEsmApi {
    constructor() {
        this.name = 'efecteEsmApi';
        this.displayName = 'Efecte ESM API';
        this.documentationUrl = 'https://example.com/docs/efecte-esm';
        this.properties = [
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
        this.authenticate = {
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
        this.test = {
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
}
exports.EfecteEsmApi = EfecteEsmApi;
//# sourceMappingURL=EfecteEsmApi.credentials.js.map
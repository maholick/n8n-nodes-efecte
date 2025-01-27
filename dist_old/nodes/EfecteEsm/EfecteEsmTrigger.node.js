"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EfecteEsmTrigger = void 0;
const n8n_workflow_1 = require("n8n-workflow");
class EfecteEsmTrigger {
    constructor() {
        this.description = {
            displayName: 'Efecte ESM Trigger',
            name: 'efecteEsmTrigger',
            icon: 'file:favicon_matrix42.png',
            group: ['trigger'],
            version: 1,
            description: 'Starts the workflow when Efecte DataCards change',
            subtitle: '={{$parameter["templateCode"]}}',
            defaults: {
                name: 'Efecte ESM Trigger',
            },
            credentials: [
                {
                    name: 'efecteEsmApi',
                    required: true,
                },
            ],
            polling: true,
            inputs: [],
            outputs: ['main'],
            properties: [
                {
                    displayName: 'Template Code',
                    name: 'templateCode',
                    type: 'string',
                    default: '',
                    required: true,
                    description: 'The template code to monitor (e.g. "Incidents", "ServiceRequests", etc.)',
                    placeholder: 'e.g. Incidents',
                },
                {
                    displayName: 'Additional Fields',
                    name: 'additionalFields',
                    type: 'collection',
                    placeholder: 'Add Field',
                    default: {},
                    options: [
                        {
                            displayName: 'Filter',
                            name: 'filter',
                            type: 'string',
                            default: '',
                            description: 'EQL filter for data. Use single quotes for values and operators like &gt;, &lt;, =. Example: $created$ &gt; \'now - 2w\' and $status$ = \'02 - In progress\'',
                            placeholder: '$created$ > \'now - 2w\'',
                        },
                        {
                            displayName: 'Selected Attributes',
                            name: 'selectedAttributes',
                            type: 'string',
                            default: '',
                            description: 'Comma-separated list of attributes to be returned. If empty, all are returned.',
                            placeholder: 'subject, description, status',
                        },
                        {
                            displayName: 'Limit',
                            name: 'limit',
                            type: 'number',
                            default: 50,
                            description: 'Max number of results to return',
                            typeOptions: {
                                minValue: 1,
                            },
                            hint: 'The API returns a maximum of 200 entries per request. If you set a higher limit, pagination will be used automatically to fetch the requested number of entries.',
                        },
                    ],
                },
            ],
        };
    }
    async poll() {
        var _a, _b, _c, _d, _e;
        const templateCode = this.getNodeParameter('templateCode');
        const additionalFields = this.getNodeParameter('additionalFields');
        const credentials = await this.getCredentials('efecteEsmApi');
        const pollData = this.getWorkflowStaticData('node');
        let processedDataCards = [];
        if (Array.isArray(pollData.processedDataCards)) {
            processedDataCards = pollData.processedDataCards;
        }
        pollData.processedDataCards = processedDataCards;
        let baseUrl = credentials.instanceUrl.replace(/\/$/, '');
        if (!baseUrl.startsWith('http')) {
            baseUrl = `https://${baseUrl}`;
        }
        const authResponse = await this.helpers.request({
            method: 'POST',
            url: `${baseUrl}/rest-api/itsm/v1/users/login`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            form: {
                login: credentials.username,
                password: credentials.password,
            },
            resolveWithFullResponse: true,
        });
        const authHeader = (_a = authResponse.headers) === null || _a === void 0 ? void 0 : _a.authorization;
        let token = '';
        if (authHeader && typeof authHeader === 'string') {
            token = authHeader.replace(/^Bearer\s+/i, '').trim();
        }
        if (!token) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'No token found in Authorization header', {
                description: 'The API response did not contain a valid Authorization header',
            });
        }
        const qs = {
            ...additionalFields,
        };
        if (additionalFields.selectedAttributes) {
            try {
                const templateInfo = await this.helpers.request({
                    method: 'GET',
                    url: `${baseUrl}/rest-api/itsm/v1/dc/${templateCode}`,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
                });
                const parsedTemplateInfo = typeof templateInfo === 'string' ? JSON.parse(templateInfo) : templateInfo;
                const availableAttributes = Object.keys(parsedTemplateInfo.attributes || {});
                const selectedAttrs = additionalFields.selectedAttributes
                    .split(',')
                    .map(attr => attr.trim())
                    .filter(attr => attr.length > 0);
                const invalidAttributes = selectedAttrs.filter(attr => !availableAttributes.includes(attr));
                if (invalidAttributes.length > 0) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Ungültige Attribute ausgewählt', {
                        description: `Folgende Attribute existieren nicht im Template "${templateCode}":\n` +
                            `${invalidAttributes.join(', ')}\n\n` +
                            `Verfügbare Attribute sind:\n${availableAttributes.join(', ')}`,
                    });
                }
                if (selectedAttrs.length > 0) {
                    qs.attributes = selectedAttrs.join(',');
                }
            }
            catch (error) {
                if (error instanceof n8n_workflow_1.NodeOperationError) {
                    throw error;
                }
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Fehler beim Validieren der Attribute', {
                    description: 'Die Template-Informationen konnten nicht abgerufen werden.',
                });
            }
        }
        try {
            if (typeof qs.limit === 'number' && qs.limit > 200) {
                const requestedLimit = qs.limit;
                qs.limit = 200;
                let lastFilterId = 0;
                if (pollData.lastFilterId !== undefined) {
                    lastFilterId = pollData.lastFilterId;
                }
                qs.filterId = lastFilterId;
                let totalProcessed = 0;
                let allDataCards = [];
                while (totalProcessed < requestedLimit) {
                    const response = await this.helpers.request({
                        method: 'GET',
                        url: `${baseUrl}/rest-api/itsm/v1/dc/${templateCode}/data`,
                        qs,
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json',
                        },
                    });
                    const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
                    const dataCards = parsedResponse.data || [];
                    if (dataCards.length === 0) {
                        break;
                    }
                    const newDataCards = dataCards.filter((card) => !processedDataCards.includes(card.dataCardId));
                    const remainingCount = requestedLimit - allDataCards.length;
                    const cardsToAdd = newDataCards.slice(0, remainingCount);
                    allDataCards = allDataCards.concat(cardsToAdd);
                    totalProcessed += dataCards.length;
                    if (allDataCards.length >= requestedLimit) {
                        break;
                    }
                    const lastCard = dataCards[dataCards.length - 1];
                    if (lastCard && lastCard.dataCardId) {
                        pollData.lastFilterId = parseInt(lastCard.dataCardId, 10);
                        qs.filterId = pollData.lastFilterId;
                    }
                    if (dataCards.length < 200) {
                        break;
                    }
                }
                allDataCards.forEach((card) => {
                    if (card.dataCardId) {
                        processedDataCards.push(card.dataCardId);
                    }
                });
                if (processedDataCards.length > 1000) {
                    processedDataCards = processedDataCards.slice(-1000);
                }
                pollData.processedDataCards = processedDataCards;
                if (allDataCards.length === 0) {
                    return null;
                }
                return [this.helpers.returnJsonArray(allDataCards)];
            }
            const response = await this.helpers.request({
                method: 'GET',
                url: `${baseUrl}/rest-api/itsm/v1/dc/${templateCode}/data`,
                qs,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });
            const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
            const dataCards = parsedResponse.data || [];
            if (dataCards.length === 0) {
                return null;
            }
            const newDataCards = dataCards.filter((card) => !processedDataCards.includes(card.dataCardId));
            if (newDataCards.length === 0) {
                return null;
            }
            newDataCards.forEach((card) => {
                if (card.dataCardId) {
                    processedDataCards.push(card.dataCardId);
                }
            });
            if (processedDataCards.length > 1000) {
                processedDataCards = processedDataCards.slice(-1000);
            }
            pollData.processedDataCards = processedDataCards;
            return [this.helpers.returnJsonArray(newDataCards)];
        }
        catch (error) {
            if (((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) === 404) {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Template "${templateCode}" not found`, {
                    description: 'Please check the template code. Valid codes are e.g. "Incidents", "ServiceRequests", etc.',
                });
            }
            else if (((_c = error.response) === null || _c === void 0 ? void 0 : _c.status) === 400 && additionalFields.filter) {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Invalid filter syntax', {
                    description: 'Please check your filter syntax. Make sure to:\n' +
                        '1. Use single quotes for values\n' +
                        '2. Use correct field names (e.g. $created$, $status$)\n' +
                        '3. Use correct operators (>, <, =)\n' +
                        'Example: $created$ > \'now - 2w\' and $status$ = \'02 - In progress\'',
                });
            }
            else if (((_d = error.response) === null || _d === void 0 ? void 0 : _d.status) === 429) {
                const responseData = typeof error.response.data === 'string'
                    ? JSON.parse(error.response.data)
                    : error.response.data;
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'API-Ratenlimit überschritten', {
                    description: `Das API-Ratenlimit wurde überschritten.\nBitte warten Sie ${((_e = responseData.message.match(/\d+/)) === null || _e === void 0 ? void 0 : _e[0]) || 'einige'} Sekunden, bevor Sie es erneut versuchen.\n\nURL: ${responseData.url}\nZeitstempel: ${responseData.timestamp}`,
                });
            }
            throw error;
        }
    }
}
exports.EfecteEsmTrigger = EfecteEsmTrigger;
//# sourceMappingURL=EfecteEsmTrigger.node.js.map
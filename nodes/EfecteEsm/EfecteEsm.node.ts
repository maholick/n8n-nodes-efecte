/* eslint-disable n8n-nodes-base/node-param-operation-option-action-miscased */
import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export class EfecteEsm implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Efecte ESM',
		name: 'efecteEsm',
		icon: 'file:icon.png',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Consume Efecte ESM API',
		defaults: {
			name: 'Efecte ESM',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'efecteEsmApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials?.instanceUrl}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		},
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get All Templates',
						value: 'getAllTemplates',
						description: 'Get list of all available templates',
						action: 'Get all Templates',
					},
					{
						name: 'Get Template',
						value: 'getTemplate',
						description: 'Get detailed template information including attributes',
						action: 'Get Template',
					},
					{
						name: 'Get DataCard',
						value: 'getDataCard',
						description: 'Get full details of a single data card by ID',
						action: 'Get a DataCard',
					},
					{
						name: 'Create DataCard',
						value: 'createDataCard',
						description: 'Create a new data card',
						action: 'Create a DataCard',
					},
					{
						name: 'Update DataCard',
						value: 'updateDataCard',
						description: 'Update an existing data card',
						action: 'Update DataCard',
					},
					{
						name: 'Delete DataCard',
						value: 'deleteDataCard',
						description: 'Delete a DataCard',
						action: 'Delete DataCard',
					},
					{
						name: 'List Data Cards',
						value: 'listDataCards',
						description: 'Get all data cards by template code',
						action: 'List all DataCards',
					},
					{
						name: 'Search Data Cards',
						value: 'searchDataCards',
						description: 'Search for data cards using EQL',
						action: 'Search DataCards',
					},
					{
						name: 'Get Attribute',
						value: 'getAttribute',
						description: 'Get value of a specific attribute from a data card',
						action: 'Get an Attribute',
					},
					{
						name: 'Update Attribute',
						value: 'updateAttribute',
						description: 'Replace attribute value(s)',
						action: 'Update an Attribute',
					},
					{
						name: 'Add Attribute Value',
						value: 'addAttributeValue',
						description: 'Add value to multi-value or empty attribute',
						action: 'Add Value to Attribute',
					},
					{
						name: 'Delete Attribute',
						value: 'deleteAttribute',
						description: 'Clear attribute value(s)',
						action: 'Delete an Attribute',
					},
					{
						name: 'Upload File',
						value: 'uploadFile',
						description: 'Upload file attachment to data card',
						action: 'Upload a File',
					},
					{
						name: 'Download File',
						value: 'downloadFile',
						description: 'Download file attachment from data card',
						action: 'Download a File',
					},
					{
						name: 'Bulk Import DataCards',
						value: 'bulkImportDataCards',
						description: 'Import multiple data cards synchronously',
						action: 'Bulk Import DataCards',
					},
					{
						name: 'Stream Data Cards',
						value: 'streamDataCards',
						description: 'Stream all data cards (for large datasets)',
						action: 'Stream DataCards',
					},
				],
				default: 'listDataCards',
			},
			{
				displayName: 'Template Code',
				name: 'templateCode',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					hide: {
						operation: ['getAllTemplates'],
					},
				},
				description: 'The template code for tickets (e.g. "Incidents", "ServiceRequests", etc.)',
				placeholder: 'e.g. Incidents',
			},
			{
				displayName: 'Folder Code',
				name: 'folderCode',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['createDataCard', 'listDataCards', 'searchDataCards', 'updateDataCard'],
					},
				},
				description: 'The folder code for the data card (required for create operations, optional for others)',
				placeholder: 'e.g. incident_management',
			},
			{
				displayName: 'DataCard ID',
				name: 'dataCardId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['getDataCard', 'updateDataCard', 'deleteDataCard', 'getAttribute', 'updateAttribute', 'addAttributeValue', 'deleteAttribute', 'uploadFile', 'downloadFile'],
					},
				},
				description: 'The ID of the DataCard',
			},
			{
				displayName: 'Attribute Code',
				name: 'attributeCode',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['getAttribute', 'updateAttribute', 'addAttributeValue', 'deleteAttribute', 'uploadFile', 'downloadFile'],
					},
				},
				description: 'The code of the attribute',
				placeholder: 'e.g. subject',
			},
			{
				displayName: 'File Location',
				name: 'fileLocation',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['downloadFile'],
					},
				},
				description: 'The location of the file to download',
			},
			{
				displayName: 'Fields',
				name: 'fields',
				placeholder: 'Add Field',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				displayOptions: {
					show: {
						operation: ['createDataCard', 'updateDataCard'],
					},
				},
				options: [
					{
						name: 'field',
						displayName: 'Field',
						values: [
							{
								displayName: 'Field Name',
								name: 'fieldName',
								type: 'string',
								default: '',
								placeholder: 'e.g. subject',
								required: true,
								description: 'Name of the field',
							},
							{
								displayName: 'Field Type',
								name: 'fieldType',
								type: 'options',
								options: [
									{
										name: 'Date',
										value: 'date',
									},
									{
										name: 'External Reference',
										value: 'external-reference',
									},
									{
										name: 'Number',
										value: 'number',
									},
									{
										name: 'Reference',
										value: 'reference',
									},
									{
										name: 'Static Value',
										value: 'static-value',
									},
									{
										name: 'String',
										value: 'string',
									},
								],
								default: 'string',
								description: 'Type of the field',
							},
							{
								displayName: 'Field Value',
								name: 'fieldValue',
								type: 'string',
								default: '',
								description: 'Value to set for the field',
							},
						],
					},
				],
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['createDataCard', 'updateDataCard'],
					},
				},
				options: [
					{
						displayName: 'Create Empty References',
						name: 'createEmptyReferences',
						type: 'boolean',
						default: false,
						description: 'Whether to create empty references',
					},
					{
						displayName: 'Return Full DataCard',
						name: 'returnFullDataCard',
						type: 'boolean',
						default: false,
						description: 'Whether to return the full DataCard object instead of just the ID',
					},
				],
			},
			{
				displayName: 'Search Query',
				name: 'searchQuery',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['searchDataCards'],
					},
				},
				description: 'EQL search query. Use single quotes for values and operators like &gt;, &lt;, =. Example: $created$ &gt; \'now - 2w\' and $status$ = \'02 - In progress\'',
				placeholder: '$created$ > \'now - 2w\'',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['listDataCards'],
					},
				},
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
						displayName: 'Get Full Data Cards',
						name: 'dataCards',
						type: 'boolean',
						default: false,
						description: 'Whether to get full data cards or simple info-elements',
					},
					{
						displayName: 'Selected Attributes',
						name: 'selectedAttributes',
						type: 'string',
						default: '',
						displayOptions: {
							hide: {
								dataCards: [true],
							},
						},
						description: 'Comma-separated list of attributes to be returned. If empty, basic info-elements are returned.',
						placeholder: 'subject, description, status',
					},
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 50,
						description: 'Max number of results to return',
					},
					{
						displayName: 'Visibility',
						name: 'visibility',
						type: 'options',
						options: [
							{
								name: 'All',
								value: 'all',
								description: 'Show all data cards (visible and hidden)',
							},
							{
								name: 'Visible Only',
								value: 'visible',
								description: 'Show only visible data cards',
							},
							{
								name: 'Hidden Only',
								value: 'hidden',
								description: 'Show only hidden data cards',
							},
						],
						default: 'visible',
						description: 'Filter data cards by their visibility status',
					},
				],
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['searchDataCards'],
					},
				},
				options: [
					{
						displayName: 'Get Full Data Cards',
						name: 'dataCards',
						type: 'boolean',
						default: false,
						description: 'Whether to get full data cards or simple info-elements',
					},
					{
						displayName: 'Selected Attributes',
						name: 'selectedAttributes',
						type: 'string',
						default: '',
						displayOptions: {
							hide: {
								dataCards: [true],
							},
						},
						description: 'Comma-separated list of attributes to be returned. If empty, basic info-elements are returned.',
						placeholder: 'subject, description, status',
					},
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 50,
						description: 'Max number of results to return',
					},
					{
						displayName: 'Visibility',
						name: 'visibility',
						type: 'options',
						options: [
							{
								name: 'All',
								value: 'all',
								description: 'Show all data cards (visible and hidden)',
							},
							{
								name: 'Visible Only',
								value: 'visible',
								description: 'Show only visible data cards',
							},
							{
								name: 'Hidden Only',
								value: 'hidden',
								description: 'Show only hidden data cards',
							},
						],
						default: 'visible',
						description: 'Filter data cards by their visibility status',
					},
				],
			},
			{
				displayName: 'DataCard IDs',
				name: 'dataCardIds',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['deleteDataCards'],
					},
				},
				description: 'ID or comma-separated list of IDs of the DataCards to delete',
				placeholder: 'e.g. 12345 or 12345,67890',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['deleteDataCard'],
					},
				},
				options: [
					{
						displayName: 'Folder Code',
						name: 'folderCode',
						type: 'string',
						default: '',
						description: 'The folder code to filter data cards (e.g. "incident_management")',
						placeholder: 'e.g. incident_management',
					},
					{
						displayName: 'Visibility',
						name: 'visibility',
						type: 'options',
						options: [
							{
								name: 'All',
								value: 'all',
								description: 'Delete data card regardless of visibility',
							},
							{
								name: 'Visible Only',
								value: 'visible',
								description: 'Delete only if data card is visible',
							},
							{
								name: 'Hidden Only',
								value: 'hidden',
								description: 'Delete only if data card is hidden',
							},
						],
						default: 'visible',
						description: 'Check data card visibility before deletion',
					},
				],
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['getDataCard'],
					},
				},
				options: [
					{
						displayName: 'Selected Attributes',
						name: 'selectedAttributes',
						type: 'string',
						default: '',
						description: 'Comma-separated list of attributes to be returned. If empty, all are returned.',
						placeholder: 'subject, description, status',
					},
				],
			},
			{
				displayName: 'Attribute Value',
				name: 'attributeValue',
				type: 'fixedCollection',
				placeholder: 'Add Value',
				default: {},
				displayOptions: {
					show: {
						operation: ['updateAttribute', 'addAttributeValue'],
					},
				},
				options: [
					{
						name: 'value',
						displayName: 'Value',
						values: [
							{
								displayName: 'Field Type',
								name: 'fieldType',
								type: 'options',
								options: [
									{
										name: 'Date',
										value: 'date',
									},
									{
										name: 'External Reference',
										value: 'external-reference',
									},
									{
										name: 'Number',
										value: 'number',
									},
									{
										name: 'Reference',
										value: 'reference',
									},
									{
										name: 'Static Value',
										value: 'static-value',
									},
									{
										name: 'String',
										value: 'string',
									},
								],
								default: 'string',
								description: 'Type of the field',
							},
							{
								displayName: 'Field Value',
								name: 'fieldValue',
								type: 'string',
								default: '',
								description: 'Value to set for the field',
							},
						],
					},
				],
			},
			{
				displayName: 'File Data',
				name: 'fileData',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['uploadFile'],
					},
				},
				description: 'Binary data of the file to upload (use binary property from previous node)',
			},
			{
				displayName: 'File Name',
				name: 'fileName',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['uploadFile'],
					},
				},
				description: 'Name of the file to upload',
			},
			{
				displayName: 'Data Cards',
				name: 'dataCards',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Data Card',
				default: {},
				displayOptions: {
					show: {
						operation: ['bulkImportDataCards'],
					},
				},
				options: [
					{
						name: 'dataCard',
						displayName: 'Data Card',
						values: [
							{
								displayName: 'Folder Code',
								name: 'folderCode',
								type: 'string',
								default: '',
								required: true,
								description: 'The folder code for this data card',
							},
							{
								displayName: 'Fields',
								name: 'fields',
								type: 'fixedCollection',
								typeOptions: {
									multipleValues: true,
								},
								default: {},
								options: [
									{
										name: 'field',
										displayName: 'Field',
										values: [
											{
												displayName: 'Field Name',
												name: 'fieldName',
												type: 'string',
												default: '',
												required: true,
												description: 'Name of the field',
											},
											{
												displayName: 'Field Type',
												name: 'fieldType',
												type: 'options',
												options: [
													{
														name: 'Date',
														value: 'date',
													},
													{
														name: 'External Reference',
														value: 'external-reference',
													},
													{
														name: 'Number',
														value: 'number',
													},
													{
														name: 'Reference',
														value: 'reference',
													},
													{
														name: 'Static Value',
														value: 'static-value',
													},
													{
														name: 'String',
														value: 'string',
													},
												],
												default: 'string',
												description: 'Type of the field',
											},
											{
												displayName: 'Field Value',
												name: 'fieldValue',
												type: 'string',
												default: '',
												description: 'Value to set for the field',
											},
										],
									},
								],
							},
						],
					},
				],
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['streamDataCards'],
					},
				},
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
						displayName: 'Get Full Data Cards',
						name: 'dataCards',
						type: 'boolean',
						default: false,
						description: 'Whether to get full data cards or simple info-elements',
					},
					{
						displayName: 'Selected Attributes',
						name: 'selectedAttributes',
						type: 'string',
						default: '',
						displayOptions: {
							hide: {
								dataCards: [true],
							},
						},
						description: 'Comma-separated list of attributes to be returned. If empty, all are returned.',
						placeholder: 'subject, description, status',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;
		const credentials = await this.getCredentials('efecteEsmApi');

		// Ensure baseUrl is properly formatted
		let baseUrl = (credentials.instanceUrl as string).replace(/\/$/, '');
		if (!baseUrl.startsWith('http')) {
			baseUrl = `https://${baseUrl}`;
		}

		// Get authentication token first
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

		// Extract token from Authorization header
		const authHeader = authResponse.headers?.authorization;
		let token = '';

		if (authHeader && typeof authHeader === 'string') {
			// Remove 'Bearer ' prefix if present and trim whitespace
			token = authHeader.replace(/^Bearer\s+/i, '').trim();
		}

		if (!token) {
			throw new NodeOperationError(
				this.getNode(),
				'No token found in Authorization header',
				{
					description: 'The API response did not contain a valid Authorization header',
					itemIndex: 0,
					message: `Auth Response Headers: ${JSON.stringify(authResponse.headers)}`,
				}
			);
		}

		for (let i = 0; i < items.length; i++) {
			try {
				if (operation === 'getAllTemplates') {
					try {
						const response = await this.helpers.request({
							method: 'GET',
							url: `${baseUrl}/rest-api/itsm/v1/dc`,
							headers: {
								'Authorization': `Bearer ${token}`,
								'Accept': 'application/json',
							},
						});

						const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
						const templates = Array.isArray(parsedResponse) ? parsedResponse : [parsedResponse];
						returnData.push(...templates);
					} catch (error) {
						if (error.response?.status === 401) {
							throw new NodeOperationError(
								this.getNode(),
								'Unauthorized',
								{
									description: 'User is unauthorized to access templates.',
									itemIndex: i,
								},
							);
						}
						throw error;
					}
				} else if (operation === 'getTemplate') {
					const templateCode = this.getNodeParameter('templateCode', i) as string;
					try {
						const response = await this.helpers.request({
							method: 'GET',
							url: `${baseUrl}/rest-api/itsm/v1/dc/${templateCode}`,
							headers: {
								'Authorization': `Bearer ${token}`,
								'Accept': 'application/json',
							},
						});

						const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
						returnData.push(parsedResponse);
					} catch (error) {
						if (error.response?.status === 404) {
							throw new NodeOperationError(
								this.getNode(),
								'Template not found',
								{
									description: 'Please check if the template code is correct.',
									itemIndex: i,
								},
							);
						} else if (error.response?.status === 401) {
							throw new NodeOperationError(
								this.getNode(),
								'Unauthorized',
								{
									description: 'User is unauthorized to access this template.',
									itemIndex: i,
								},
							);
						}
						throw error;
					}
				} else if (operation === 'getDataCard') {
					const templateCode = this.getNodeParameter('templateCode', i) as string;
					const dataCardId = this.getNodeParameter('dataCardId', i) as string;
					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

					const qs: IDataObject = {};
					if (additionalFields.selectedAttributes) {
						qs.selectedAttributes = additionalFields.selectedAttributes;
					}

					try {
						const response = await this.helpers.request({
							method: 'GET',
							url: `${baseUrl}/rest-api/itsm/v1/dc/${templateCode}/data/${dataCardId}`,
							qs,
							headers: {
								'Authorization': `Bearer ${token}`,
								'Accept': 'application/json',
							},
						});

						const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
						returnData.push(parsedResponse);
					} catch (error) {
						if (error.response?.status === 404) {
							throw new NodeOperationError(
								this.getNode(),
								'DataCard not found',
								{
									description: 'Please check if the template code and DataCard ID are correct.',
									itemIndex: i,
								},
							);
						} else if (error.response?.status === 401) {
							throw new NodeOperationError(
								this.getNode(),
								'Unauthorized',
								{
									description: 'User is unauthorized to access this data card.',
									itemIndex: i,
								},
							);
						}
						throw error;
					}
				} else if (operation === 'listDataCards' || operation === 'searchDataCards') {
					const templateCode = this.getNodeParameter('templateCode', i) as string;
					const folderCode = this.getNodeParameter('folderCode', i) as string;
					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

					const qs: IDataObject = {};

					// Set query parameters
					if (operation === 'searchDataCards') {
						const searchQuery = this.getNodeParameter('searchQuery', i) as string;
						qs.filter = searchQuery;
					} else if (additionalFields.filter) {
						qs.filter = additionalFields.filter;
					}

					// Set visibility filter
					const visibility = (additionalFields.visibility as string) || 'visible';
					let hiddenFilter = '';
					switch (visibility) {
						case 'all':
							// No additional filter for 'all'
							break;
						case 'hidden':
							hiddenFilter = 'hidden = 1';
							break;
						case 'visible':
						default:
							hiddenFilter = 'hidden = 0';
							break;
					}

					// Combine existing filter with hidden filter
					if (hiddenFilter && qs.filter) {
						qs.filter = `${qs.filter} and ${hiddenFilter}`;
					} else if (hiddenFilter) {
						qs.filter = hiddenFilter;
					}

					if (folderCode) {
						qs.folderCode = folderCode;
					}

					if (additionalFields.selectedAttributes) {
						qs.selectedAttributes = additionalFields.selectedAttributes;
					}

					if (additionalFields.limit) {
						qs.limit = additionalFields.limit;
					}

					// Set dataCards=true when Get Full Data Cards is enabled
					if (additionalFields.dataCards === true) {
						qs.dataCards = true;
					}

					// Note: sort parameter is not supported by the API, removed

					try {
						let allDataCards: IDataObject[] = [];
						let hasMore = true;
						let filterId = 0;
						const requestedLimit = additionalFields.limit as number || 50;
						let totalCount = 0;
						let nextLink = '';

						// Fetch data cards in chunks until we have all or reach the limit
						// API uses filterId (ID of last data card) for pagination, not offset
						while (hasMore) {
							const currentLimit = Math.min(200, requestedLimit - allDataCards.length);
							if (currentLimit <= 0) {
								hasMore = false;
								continue;
							}

							const requestQs: IDataObject = {
								...qs,
								limit: currentLimit,
							};

							// Use filterId for pagination (only if we have a previous filterId)
							if (filterId > 0) {
								requestQs.filterId = filterId;
							}

							const response = await this.helpers.request({
								method: 'GET',
								url: `${baseUrl}/rest-api/itsm/v1/dc/${templateCode}/data`,
								qs: requestQs,
								headers: {
									'Authorization': `Bearer ${token}`,
									'Accept': 'application/json',
									'Content-Type': 'application/json',
								},
							});

							// Parse response if it's a string
							const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;

							// Extract data cards and metadata
							const dataCards = parsedResponse.data || [];
							totalCount = parsedResponse.meta?.count || totalCount;
							nextLink = parsedResponse.meta?.links?.next || '';

							// Add metadata to each data card
							const enrichedDataCards = dataCards.map((card: IDataObject) => ({
								...card,
								_meta: {
									count: totalCount,
									limit: requestedLimit,
									nextLink,
								},
							}));

							allDataCards = allDataCards.concat(enrichedDataCards);

							// Check if we need to fetch more data cards
							if (dataCards.length < currentLimit || allDataCards.length >= requestedLimit) {
								hasMore = false;
							} else {
								// Update filterId to the ID of the last data card for next page
								const lastCard = dataCards[dataCards.length - 1];
								if (lastCard && lastCard.dataCardId) {
									filterId = parseInt(lastCard.dataCardId as string, 10);
								} else {
									hasMore = false;
								}
							}
						}

						const executionData = this.helpers.constructExecutionMetaData(
							this.helpers.returnJsonArray(allDataCards),
							{ itemData: { item: i } },
						);

						returnData.push(...executionData);

					} catch (error) {
						if (error.response?.status === 404) {
							throw new NodeOperationError(
								this.getNode(),
								'Template not found',
								{
									description: 'Please check if the template code is correct.',
									itemIndex: i,
								},
							);
						} else if (error.response?.status === 429) {
							throw new NodeOperationError(
								this.getNode(),
								'Rate limit exceeded',
								{
									description: 'Please wait before making more requests.',
									itemIndex: i,
								},
							);
						}
						throw error;
					}
				} else if (operation === 'createDataCard' || operation === 'updateDataCard') {
					const templateCode = this.getNodeParameter('templateCode', i) as string;
					const fields = this.getNodeParameter('fields', i) as IDataObject;
					const options = this.getNodeParameter('options', i) as IDataObject;
					const folderCode = this.getNodeParameter('folderCode', i) as string;

					// Prepare data object
					const data: IDataObject = {};
					if (fields.field) {
						for (const field of fields.field as IDataObject[]) {
							const fieldName = field.fieldName as string;
							const fieldType = field.fieldType as string;
							const fieldValue = field.fieldValue;

							// Handle different field types
							switch (fieldType) {
								case 'string':
								case 'number':
								case 'date':
									data[fieldName] = {
										values: [{ value: fieldValue }],
									};
									break;
								case 'reference':
									data[fieldName] = {
										values: [{ dataCardId: fieldValue }],
									};
									break;
								case 'external-reference':
									const [name, location] = (fieldValue as string).split('|');
									data[fieldName] = {
										values: [{ name, location }],
									};
									break;
								case 'static-value':
									const [value, code] = (fieldValue as string).split('|');
									data[fieldName] = {
										values: [{ value, code }],
									};
									break;
							}
						}
					}

					const qs: IDataObject = {};
					if (options.createEmptyReferences) {
						qs.createEmptyReferences = true;
					}
					if (options.returnFullDataCard) {
						qs.dataCards = true;
					}

					try {
						let response;
						if (operation === 'createDataCard') {
							// folderCode is required for create operations (enforced by parameter definition)
							if (!folderCode) {
								throw new NodeOperationError(
									this.getNode(),
									'Folder Code is required',
									{
										description: 'Folder Code is required when creating a data card.',
										itemIndex: i,
									},
								);
							}

							response = await this.helpers.request({
								method: 'POST',
								url: `${baseUrl}/rest-api/itsm/v1/dc/${templateCode}/data`,
								qs,
								body: { data, folderCode },
								headers: {
									'Authorization': `Bearer ${token}`,
									'Accept': 'application/json',
									'Content-Type': 'application/json',
								},
							});
						} else {
							const dataCardId = this.getNodeParameter('dataCardId', i) as string;
							// folderCode is optional for update operations (can be used to move data card)
							const updateBody: IDataObject = { data };
							if (folderCode) {
								updateBody.folderCode = folderCode;
							}

							response = await this.helpers.request({
								method: 'PATCH',
								url: `${baseUrl}/rest-api/itsm/v1/dc/${templateCode}/data/${dataCardId}`,
								qs,
								body: updateBody,
								headers: {
									'Authorization': `Bearer ${token}`,
									'Accept': 'application/json',
									'Content-Type': 'application/json',
								},
							});
						}

						// Parse response if it's a string
						const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
						returnData.push(parsedResponse);

					} catch (error) {
						if (error.response?.status === 404) {
							throw new NodeOperationError(
								this.getNode(),
								`DataCard or template not found: ${error.message}`,
								{
									description: 'Please check if the template code and DataCard ID are correct.',
									itemIndex: i,
								},
							);
						} else if (error.response?.status === 400) {
							throw new NodeOperationError(
								this.getNode(),
								'Invalid request data',
								{
									description: error.response.data.message || 'Please check your input data.',
									itemIndex: i,
								},
							);
						} else if (error.response?.status === 429) {
							throw new NodeOperationError(
								this.getNode(),
								'Rate limit exceeded',
								{
									description: 'Please wait before making more requests.',
									itemIndex: i,
								},
							);
						} else if (error.response?.status === 409) {
							throw new NodeOperationError(
								this.getNode(),
								'Resource is locked',
								{
									description: 'The DataCard is currently locked by another process.',
									itemIndex: i,
								},
							);
						}
						throw error;
					}
				} else if (operation === 'deleteDataCard') {
					const templateCode = this.getNodeParameter('templateCode', i) as string;
					const dataCardId = this.getNodeParameter('dataCardId', i) as string;
					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

					// Set visibility filter
					const visibility = (additionalFields.visibility as string) || 'visible';
					let hiddenFilter = '';
					switch (visibility) {
						case 'all':
							// No additional filter for 'all'
							break;
						case 'hidden':
							hiddenFilter = 'hidden = 1';
							break;
						case 'visible':
						default:
							hiddenFilter = 'hidden = 0';
							break;
					}

					try {
						// Optional: Check visibility and folder code before deletion
						if (hiddenFilter || additionalFields.folderCode) {
							const cardInfo = await this.helpers.request({
								method: 'GET',
								url: `${baseUrl}/rest-api/itsm/v1/dc/${templateCode}/data/${dataCardId}`,
								headers: {
									'Authorization': `Bearer ${token}`,
									'Accept': 'application/json',
								},
							});

							const parsedCardInfo = typeof cardInfo === 'string' ? JSON.parse(cardInfo) : cardInfo;

							// Check visibility
							if (hiddenFilter) {
								const isHidden = parsedCardInfo.hidden === true;
								if ((visibility === 'visible' && isHidden) ||
									(visibility === 'hidden' && !isHidden)) {
									throw new NodeOperationError(
										this.getNode(),
										`DataCard visibility (${isHidden ? 'hidden' : 'visible'}) does not match filter (${visibility})`,
										{
											description: 'The DataCard cannot be deleted due to visibility mismatch',
											itemIndex: i,
										},
									);
								}
							}

							// Check folder code
							if (additionalFields.folderCode &&
								parsedCardInfo.folderCode !== additionalFields.folderCode) {
								throw new NodeOperationError(
									this.getNode(),
									`DataCard folder code (${parsedCardInfo.folderCode}) does not match filter (${additionalFields.folderCode})`,
									{
										description: 'The DataCard cannot be deleted due to folder code mismatch',
										itemIndex: i,
									},
								);
							}
						}

						// Perform the deletion
						await this.helpers.request({
							method: 'DELETE',
							url: `${baseUrl}/rest-api/itsm/v1/dc/${templateCode}/data/${dataCardId}`,
							headers: {
								'Authorization': `Bearer ${token}`,
								'Accept': 'application/json',
							},
						});

						returnData.push({
							success: true,
							dataCardId,
						});

					} catch (error) {
						if (error instanceof NodeOperationError) {
							throw error;
						}
						if (error.response?.status === 404) {
							throw new NodeOperationError(
								this.getNode(),
								'DataCard not found',
								{
									description: 'Please check if the DataCard ID exists.',
									itemIndex: i,
								},
							);
						} else if (error.response?.status === 403) {
							throw new NodeOperationError(
								this.getNode(),
								'Forbidden - No permission to delete DataCard',
								{
									description: 'You do not have the required permissions to delete this DataCard.',
									itemIndex: i,
								},
							);
						} else if (error.response?.status === 409) {
							throw new NodeOperationError(
								this.getNode(),
								'DataCard is already in the trashcan',
								{
									description: 'The DataCard has already been deleted.',
									itemIndex: i,
								},
							);
						}
						throw error;
					}
				} else if (operation === 'getAttribute') {
					const templateCode = this.getNodeParameter('templateCode', i) as string;
					const dataCardId = this.getNodeParameter('dataCardId', i) as string;
					const attributeCode = this.getNodeParameter('attributeCode', i) as string;

					try {
						const response = await this.helpers.request({
							method: 'GET',
							url: `${baseUrl}/rest-api/itsm/v1/dc/${templateCode}/data/${dataCardId}/${attributeCode}`,
							headers: {
								'Authorization': `Bearer ${token}`,
								'Accept': 'application/json',
							},
						});

						const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
						returnData.push(parsedResponse);
					} catch (error) {
						if (error.response?.status === 404) {
							throw new NodeOperationError(
								this.getNode(),
								'Attribute or DataCard not found',
								{
									description: 'Please check if the template code, DataCard ID, and attribute code are correct.',
									itemIndex: i,
								},
							);
						} else if (error.response?.status === 403) {
							throw new NodeOperationError(
								this.getNode(),
								'Forbidden',
								{
									description: 'No permission to access this resource.',
									itemIndex: i,
								},
							);
						}
						throw error;
					}
				} else if (operation === 'updateAttribute' || operation === 'addAttributeValue') {
					const templateCode = this.getNodeParameter('templateCode', i) as string;
					const dataCardId = this.getNodeParameter('dataCardId', i) as string;
					const attributeCode = this.getNodeParameter('attributeCode', i) as string;
					const attributeValue = this.getNodeParameter('attributeValue', i) as IDataObject;

					// Prepare attribute value data
					const values: IDataObject[] = [];
					if (attributeValue.value) {
						const valueData = attributeValue.value as IDataObject;
						const fieldType = valueData.fieldType as string;
						const fieldValue = valueData.fieldValue;

						let valueObj: IDataObject = {};
						switch (fieldType) {
							case 'string':
							case 'number':
							case 'date':
								valueObj = { value: fieldValue };
								break;
							case 'reference':
								valueObj = { dataCardId: fieldValue };
								break;
							case 'external-reference':
								const [name, location] = (fieldValue as string).split('|');
								valueObj = { name, location };
								break;
							case 'static-value':
								const [value, code] = (fieldValue as string).split('|');
								valueObj = { value, code };
								break;
						}
						values.push(valueObj);
					}

					const requestBody = { values };

					try {
						const method = operation === 'updateAttribute' ? 'PUT' : 'POST';
						const response = await this.helpers.request({
							method,
							url: `${baseUrl}/rest-api/itsm/v1/dc/${templateCode}/data/${dataCardId}/${attributeCode}`,
							body: requestBody,
							headers: {
								'Authorization': `Bearer ${token}`,
								'Accept': 'application/json',
								'Content-Type': 'application/json',
							},
						});

						const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
						returnData.push(parsedResponse);
					} catch (error) {
						if (error.response?.status === 404) {
							throw new NodeOperationError(
								this.getNode(),
								'Attribute or DataCard not found',
								{
									description: 'Please check if the template code, DataCard ID, and attribute code are correct.',
									itemIndex: i,
								},
							);
						} else if (error.response?.status === 400) {
							throw new NodeOperationError(
								this.getNode(),
								'Invalid request data',
								{
									description: error.response.data?.message || 'Please check your input data.',
									itemIndex: i,
								},
							);
						} else if (error.response?.status === 409) {
							throw new NodeOperationError(
								this.getNode(),
								'Resource is locked',
								{
									description: 'The DataCard is currently locked by another process.',
									itemIndex: i,
								},
							);
						}
						throw error;
					}
				} else if (operation === 'deleteAttribute') {
					const templateCode = this.getNodeParameter('templateCode', i) as string;
					const dataCardId = this.getNodeParameter('dataCardId', i) as string;
					const attributeCode = this.getNodeParameter('attributeCode', i) as string;

					try {
						const response = await this.helpers.request({
							method: 'DELETE',
							url: `${baseUrl}/rest-api/itsm/v1/dc/${templateCode}/data/${dataCardId}/${attributeCode}`,
							headers: {
								'Authorization': `Bearer ${token}`,
								'Accept': 'application/json',
							},
						});

						const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
						returnData.push({
							success: true,
							attributeCode,
							...parsedResponse,
						});
					} catch (error) {
						if (error.response?.status === 404) {
							throw new NodeOperationError(
								this.getNode(),
								'Attribute or DataCard not found',
								{
									description: 'Please check if the template code, DataCard ID, and attribute code are correct.',
									itemIndex: i,
								},
							);
						} else if (error.response?.status === 409) {
							throw new NodeOperationError(
								this.getNode(),
								'Resource is locked',
								{
									description: 'The DataCard is currently locked by another process.',
									itemIndex: i,
								},
							);
						}
						throw error;
					}
				} else if (operation === 'uploadFile') {
					const templateCode = this.getNodeParameter('templateCode', i) as string;
					const dataCardId = this.getNodeParameter('dataCardId', i) as string;
					const attributeCode = this.getNodeParameter('attributeCode', i) as string;
					const fileName = this.getNodeParameter('fileName', i) as string;
					const fileDataProperty = this.getNodeParameter('fileData', i) as string;

					try {
						// Get binary data from the item
						const binaryData = await this.helpers.getBinaryDataBuffer(i, fileDataProperty);
						
						const response = await this.helpers.request({
							method: 'POST',
							url: `${baseUrl}/rest-api/itsm/v1/dc/${templateCode}/data/${dataCardId}/${attributeCode}/file`,
							headers: {
								'Authorization': `Bearer ${token}`,
								'Accept': 'application/json',
							},
							formData: {
								fileUpload: {
									value: binaryData,
									options: {
										filename: fileName,
									},
								},
								fileName,
							},
						});

						const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
						returnData.push(parsedResponse);
					} catch (error) {
						if (error.response?.status === 404) {
							throw new NodeOperationError(
								this.getNode(),
								'DataCard or attribute not found',
								{
									description: 'Please check if the template code, DataCard ID, and attribute code are correct.',
									itemIndex: i,
								},
							);
						} else if (error.response?.status === 400) {
							throw new NodeOperationError(
								this.getNode(),
								'Invalid file data',
								{
									description: error.response.data?.message || 'Please check your file data.',
									itemIndex: i,
								},
							);
						}
						throw error;
					}
				} else if (operation === 'downloadFile') {
					const templateCode = this.getNodeParameter('templateCode', i) as string;
					const dataCardId = this.getNodeParameter('dataCardId', i) as string;
					const attributeCode = this.getNodeParameter('attributeCode', i) as string;
					const fileLocation = this.getNodeParameter('fileLocation', i) as string;

					try {
						const response = await this.helpers.request({
							method: 'GET',
							url: `${baseUrl}/rest-api/itsm/v1/dc/${templateCode}/data/${dataCardId}/${attributeCode}/file/${fileLocation}`,
							headers: {
								'Authorization': `Bearer ${token}`,
							},
							returnFullResponse: true,
							encoding: null,
						});

						// Store binary data
						const binaryData = Buffer.isBuffer(response.body) 
							? response.body 
							: Buffer.from(response.body as string);
						
						// Prepare binary data for n8n
						const binaryPropertyName = 'data';
						const binaryDataObj = await this.helpers.prepareBinaryData(binaryData, fileLocation);
						
						// Return data with binary property - use type assertion to allow binary property
						const item = {
							json: {
								fileName: fileLocation,
								mimeType: response.headers['content-type'] || 'application/octet-stream',
							},
							binary: {
								[binaryPropertyName]: binaryDataObj,
							},
						} as IDataObject & { binary?: { [key: string]: IDataObject } };

						returnData.push(item);
					} catch (error) {
						if (error.response?.status === 404) {
							throw new NodeOperationError(
								this.getNode(),
								'File not found',
								{
									description: 'Please check if the template code, DataCard ID, attribute code, and file location are correct.',
									itemIndex: i,
								},
							);
						} else if (error.response?.status === 403) {
							throw new NodeOperationError(
								this.getNode(),
								'No permission to load data card',
								{
									description: 'You do not have permission to access this file.',
									itemIndex: i,
								},
							);
						}
						throw error;
					}
				} else if (operation === 'bulkImportDataCards') {
					const templateCode = this.getNodeParameter('templateCode', i) as string;
					const dataCards = this.getNodeParameter('dataCards', i) as IDataObject;

					// Prepare bulk import data
					const bulkData: IDataObject[] = [];
					if (dataCards.dataCard) {
						for (const dataCard of dataCards.dataCard as IDataObject[]) {
							const cardData: IDataObject = {
								folderCode: dataCard.folderCode,
								data: {},
							};

							if (dataCard.fields?.field) {
								for (const field of dataCard.fields.field as IDataObject[]) {
									const fieldName = field.fieldName as string;
									const fieldType = field.fieldType as string;
									const fieldValue = field.fieldValue;

									let valueObj: IDataObject = {};
									switch (fieldType) {
										case 'string':
										case 'number':
										case 'date':
											valueObj = { value: fieldValue };
											break;
										case 'reference':
											valueObj = { dataCardId: fieldValue };
											break;
										case 'external-reference':
											const [name, location] = (fieldValue as string).split('|');
											valueObj = { name, location };
											break;
										case 'static-value':
											const [value, code] = (fieldValue as string).split('|');
											valueObj = { value, code };
											break;
									}

									cardData.data[fieldName] = {
										values: [valueObj],
									};
								}
							}

							bulkData.push(cardData);
						}
					}

					try {
						const response = await this.helpers.request({
							method: 'PUT',
							url: `${baseUrl}/rest-api/itsm/v1/dc/${templateCode}/data`,
							body: bulkData,
							headers: {
								'Authorization': `Bearer ${token}`,
								'Accept': 'application/json',
								'Content-Type': 'application/json',
							},
						});

						const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
						returnData.push(parsedResponse);
					} catch (error) {
						if (error.response?.status === 404) {
							throw new NodeOperationError(
								this.getNode(),
								'Template not found',
								{
									description: 'Please check if the template code is correct.',
									itemIndex: i,
								},
							);
						} else if (error.response?.status === 400) {
							throw new NodeOperationError(
								this.getNode(),
								'Invalid request data',
								{
									description: error.response.data?.message || 'Please check your input data.',
									itemIndex: i,
								},
							);
						}
						throw error;
					}
				} else if (operation === 'streamDataCards') {
					const templateCode = this.getNodeParameter('templateCode', i) as string;
					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

					const qs: IDataObject = {};

					if (additionalFields.filter) {
						qs.filter = additionalFields.filter;
					}

					if (additionalFields.selectedAttributes) {
						qs.selectedAttributes = additionalFields.selectedAttributes;
					}

					if (additionalFields.dataCards === true) {
						qs.dataCards = true;
					}

					try {
						const response = await this.helpers.request({
							method: 'GET',
							url: `${baseUrl}/rest-api/itsm/v1/dc/${templateCode}/data/stream`,
							qs,
							headers: {
								'Authorization': `Bearer ${token}`,
								'Accept': 'application/json',
							},
						});

						const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
						const dataCards = parsedResponse.data || [];
						
						const executionData = this.helpers.constructExecutionMetaData(
							this.helpers.returnJsonArray(dataCards),
							{ itemData: { item: i } },
						);

						returnData.push(...executionData);
					} catch (error) {
						if (error.response?.status === 404) {
							throw new NodeOperationError(
								this.getNode(),
								'Template not found',
								{
									description: 'Please check if the template code is correct.',
									itemIndex: i,
								},
							);
						} else if (error.response?.status === 401) {
							throw new NodeOperationError(
								this.getNode(),
								'Unauthorized',
								{
									description: 'User is unauthorized to access this template.',
									itemIndex: i,
								},
							);
						}
						throw error;
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({
							error: error.message,
							details: {
								baseUrl,
								templateCode: this.getNodeParameter('templateCode', i),
								additionalFields: this.getNodeParameter('additionalFields', i),
								authResponse: authResponse.headers,
								token,
							}
						}),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw error;
			}
		}

		// Check if we have binary data (from downloadFile operation)
		// Use type assertion to check for binary property safely
		const hasBinaryData = returnData.some((item) => {
			const itemWithBinary = item as IDataObject & { binary?: { [key: string]: IDataObject } };
			return itemWithBinary.binary !== undefined;
		});
		
		if (hasBinaryData) {
			// Return items with binary data
			const result: INodeExecutionData[] = returnData.map((item) => {
				const itemWithBinary = item as IDataObject & { binary?: { [key: string]: IDataObject } };
				if (itemWithBinary.binary) {
					return {
						json: (itemWithBinary.json as IDataObject) || {},
						binary: itemWithBinary.binary,
					};
				}
				return { json: item };
			});
			return [result];
		}
		
		return [this.helpers.returnJsonArray(returnData)];
	}
}

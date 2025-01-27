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
		icon: 'file:favicon_matrix42.png',
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
						name: 'Create DataCard',
						value: 'createDataCard',
						description: 'Create a new data card',
						action: 'Create a DataCard',
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
						name: 'Update DataCard',
						value: 'updateDataCard',
						description: 'Update an existing data card',
						action: 'Update DataCard',
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
						description: 'The template code for tickets (e.g. "Incidents", "ServiceRequests", etc.)',
						placeholder: 'e.g. Incidents',
			},
			{
				displayName: 'Folder Code',
				name: 'folderCode',
				type: 'string',
				default: '',
				description: 'The folder code to filter data cards (e.g. "incident_management")',
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
						operation: ['updateDataCard', 'deleteDataCard'],
					},
				},
				description: 'The ID of the DataCard',
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
						displayName: 'Sort By',
						name: 'sortBy',
						type: 'string',
						default: '',
						description: 'Attribute to sort the results by',
						placeholder: 'e.g. createdDate',
					},
					{
						displayName: 'Sort Order',
						name: 'sortOrder',
						type: 'options',
						options: [
							{
								name: 'Ascending',
								value: 'asc',
							},
							{
								name: 'Descending',
								value: 'desc',
							},
						],
						default: 'asc',
						description: 'Order to sort the results in',
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
				if (operation === 'listDataCards' || operation === 'searchDataCards') {
					const templateCode = this.getNodeParameter('templateCode', i) as string;
					const folderCode = this.getNodeParameter('folderCode', i) as string;
					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

					const qs: IDataObject = {};

					// Setze die Query-Parameter
					if (operation === 'searchDataCards') {
						const searchQuery = this.getNodeParameter('searchQuery', i) as string;
						qs.filter = searchQuery;
					} else if (additionalFields.filter) {
						qs.filter = additionalFields.filter;
					}

					// Setze Visibility Filter
					const visibility = (additionalFields.visibility as string) || 'visible';
					let hiddenFilter = '';
					switch (visibility) {
						case 'all':
							// Keine zusätzlichen Parameter für 'all'
							break;
						case 'hidden':
							hiddenFilter = 'hidden = 1';
							break;
						case 'visible':
						default:
							hiddenFilter = 'hidden = 0';
							break;
					}

					// Kombiniere existierenden Filter mit hidden Filter
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

					// Setze dataCards=true wenn Get Full Data Cards aktiviert ist
					if (additionalFields.dataCards === true) {
						qs.dataCards = true;
					}

					if (additionalFields.sortBy) {
						qs.sort = `${additionalFields.sortBy} ${additionalFields.sortOrder || 'asc'}`;
					}

					try {
						let allDataCards: IDataObject[] = [];
						let hasMore = true;
						let offset = 0;
						const requestedLimit = additionalFields.limit as number || 50;
						let totalCount = 0;
						let nextLink = '';

						// Fetch data cards in chunks until we have all or reach the limit
						while (hasMore) {
							const currentLimit = Math.min(200, requestedLimit - allDataCards.length);
							if (currentLimit <= 0) {
								hasMore = false;
								continue;
							}

							const response = await this.helpers.request({
								method: 'GET',
								url: `${baseUrl}/rest-api/itsm/v1/dc/${templateCode}/data`,
								qs: {
									...qs,
									offset,
									limit: currentLimit,
								},
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
								offset += dataCards.length;
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
							response = await this.helpers.request({
								method: 'POST',
								url: `${baseUrl}/rest-api/itsm/v1/dc/${templateCode}/data`,
								qs,
								body: { data },
								headers: {
									'Authorization': `Bearer ${token}`,
									'Accept': 'application/json',
									'Content-Type': 'application/json',
								},
							});
						} else {
							const dataCardId = this.getNodeParameter('dataCardId', i) as string;
							response = await this.helpers.request({
								method: 'PATCH',
								url: `${baseUrl}/rest-api/itsm/v1/dc/${templateCode}/data/${dataCardId}`,
								qs,
								body: { data },
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

					// Setze Visibility Filter
					const visibility = (additionalFields.visibility as string) || 'visible';
					let hiddenFilter = '';
					switch (visibility) {
						case 'all':
							// Keine zusätzlichen Parameter für 'all'
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
						// Optional: Prüfe Visibility und Folder Code vor dem Löschen
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

							// Prüfe Visibility
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

							// Prüfe Folder Code
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

						// Führe die Löschung durch
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

		return [this.helpers.returnJsonArray(returnData)];
	}
}

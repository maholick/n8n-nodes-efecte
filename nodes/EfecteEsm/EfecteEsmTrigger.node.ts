import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IPollFunctions,
	NodeOperationError,
} from 'n8n-workflow';

export class EfecteEsmTrigger implements INodeType {
	description: INodeTypeDescription = {
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

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const templateCode = this.getNodeParameter('templateCode') as string;
		const additionalFields = this.getNodeParameter('additionalFields') as IDataObject;
		const credentials = await this.getCredentials('efecteEsmApi');
		const pollData = this.getWorkflowStaticData('node') as IDataObject;
		let processedDataCards: string[] = [];

		// Ensure processedDataCards is always an array
		if (Array.isArray(pollData.processedDataCards)) {
			processedDataCards = pollData.processedDataCards as string[];
		}
		pollData.processedDataCards = processedDataCards;

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
			token = authHeader.replace(/^Bearer\s+/i, '').trim();
		}

		if (!token) {
			throw new NodeOperationError(
				this.getNode(),
				'No token found in Authorization header',
				{
					description: 'The API response did not contain a valid Authorization header',
				},
			);
		}

		const qs: IDataObject = {
			...additionalFields,
		};

		// Process selectedAttributes if provided
		if (additionalFields.selectedAttributes) {
			try {
				// Get template info first to validate attributes
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

				const selectedAttrs = (additionalFields.selectedAttributes as string)
					.split(',')
					.map(attr => attr.trim())
					.filter(attr => attr.length > 0);

				// Check if all selected attributes are available
				const invalidAttributes = selectedAttrs.filter(attr => !availableAttributes.includes(attr));

				if (invalidAttributes.length > 0) {
					throw new NodeOperationError(
						this.getNode(),
						'Ungültige Attribute ausgewählt',
						{
							description: `Folgende Attribute existieren nicht im Template "${templateCode}":\n` +
								`${invalidAttributes.join(', ')}\n\n` +
								`Verfügbare Attribute sind:\n${availableAttributes.join(', ')}`,
						},
					);
				}

				if (selectedAttrs.length > 0) {
					qs.attributes = selectedAttrs.join(',');
				}
			} catch (error) {
				if (error instanceof NodeOperationError) {
					throw error;
				}
				throw new NodeOperationError(
					this.getNode(),
					'Fehler beim Validieren der Attribute',
					{
						description: 'Die Template-Informationen konnten nicht abgerufen werden.',
					},
				);
			}
		}

		try {
			// Ensure limit doesn't exceed 200
			if (typeof qs.limit === 'number' && qs.limit > 200) {
				const requestedLimit = qs.limit;
				qs.limit = 200;

				// Get last processed filterId from static data
				let lastFilterId = 0;
				if (pollData.lastFilterId !== undefined) {
					lastFilterId = pollData.lastFilterId as number;
				}
				qs.filterId = lastFilterId;

				// Process all pages until we reach the requested limit
				let totalProcessed = 0;
				let allDataCards: IDataObject[] = [];

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
						break; // No more data cards available
					}

					// Filter out already processed data cards
					const newDataCards = dataCards.filter((card: IDataObject) =>
						!processedDataCards.includes(card.dataCardId as string)
					);

					// Ensure we don't exceed the requested limit
					const remainingCount = requestedLimit - allDataCards.length;
					const cardsToAdd = newDataCards.slice(0, remainingCount);

					allDataCards = allDataCards.concat(cardsToAdd);
					totalProcessed += dataCards.length;

					// Break if we've reached the requested limit
					if (allDataCards.length >= requestedLimit) {
						break;
					}

					// Update lastFilterId for next page
					const lastCard = dataCards[dataCards.length - 1];
					if (lastCard && lastCard.dataCardId) {
						pollData.lastFilterId = parseInt(lastCard.dataCardId as string, 10);
						qs.filterId = pollData.lastFilterId;
					}

					if (dataCards.length < 200) {
						break; // Last page reached
					}
				}

				// Update processed data cards
				allDataCards.forEach((card: IDataObject) => {
					if (card.dataCardId) {
						processedDataCards.push(card.dataCardId as string);
					}
				});

				// Keep only the last 1000 processed data cards to prevent memory issues
				if (processedDataCards.length > 1000) {
					processedDataCards = processedDataCards.slice(-1000);
				}
				pollData.processedDataCards = processedDataCards;

				if (allDataCards.length === 0) {
					return null;
				}

				return [this.helpers.returnJsonArray(allDataCards)];
			}

			// Original logic for requests with limit <= 200
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

			// Filter out already processed data cards
			const newDataCards = dataCards.filter((card: IDataObject) =>
				!processedDataCards.includes(card.dataCardId as string)
			);

			if (newDataCards.length === 0) {
				return null;
			}

			// Update processed data cards
			newDataCards.forEach((card: IDataObject) => {
				if (card.dataCardId) {
					processedDataCards.push(card.dataCardId as string);
				}
			});

			// Keep only the last 1000 processed data cards to prevent memory issues
			if (processedDataCards.length > 1000) {
				processedDataCards = processedDataCards.slice(-1000);
			}
			pollData.processedDataCards = processedDataCards;

			return [this.helpers.returnJsonArray(newDataCards)];

		} catch (error) {
			if (error.response?.status === 404) {
				throw new NodeOperationError(
					this.getNode(),
					`Template "${templateCode}" not found`,
					{
						description: 'Please check the template code. Valid codes are e.g. "Incidents", "ServiceRequests", etc.',
					},
				);
			} else if (error.response?.status === 400 && additionalFields.filter) {
				throw new NodeOperationError(
					this.getNode(),
					'Invalid filter syntax',
					{
						description: 'Please check your filter syntax. Make sure to:\n' +
							'1. Use single quotes for values\n' +
							'2. Use correct field names (e.g. $created$, $status$)\n' +
							'3. Use correct operators (>, <, =)\n' +
							'Example: $created$ > \'now - 2w\' and $status$ = \'02 - In progress\'',
					},
				);
			} else if (error.response?.status === 429) {
				const responseData = typeof error.response.data === 'string'
					? JSON.parse(error.response.data)
					: error.response.data;

				throw new NodeOperationError(
					this.getNode(),
					'API-Ratenlimit überschritten',
					{
						description: `Das API-Ratenlimit wurde überschritten.\nBitte warten Sie ${responseData.message.match(/\d+/)?.[0] || 'einige'} Sekunden, bevor Sie es erneut versuchen.\n\nURL: ${responseData.url}\nZeitstempel: ${responseData.timestamp}`,
					},
				);
			}
			throw error;
		}
	}
}

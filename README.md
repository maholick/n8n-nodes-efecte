# n8n-nodes-efecte

This is an n8n community node for integrating with Efecte (Matrix42 Core/Pro) Service Management Tool. It provides nodes to interact with the Efecte REST API v1.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  

## Installation

### Locally

Follow these steps to install the node package in your local n8n instance:

```bash
# Install n8n (if not already installed)
npm install n8n -g

# Install the Efecte node package
npm install n8n-nodes-efecte

# Start n8n
n8n start
```

### Using Docker

To use this node with n8n in Docker, you can use the following docker-compose configuration:

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_CUSTOM_EXTENSIONS=n8n-nodes-efecte
    volumes:
      - ~/.n8n:/home/node/.n8n
    command: n8n start
```

## Operations

This node implements the following operations for interacting with Efecte:

### Trigger Node
- Watch for new/updated data cards

### Regular Node
- Create data card
- Update data card
- Get data cards (list/search)

## Credentials

To use the Efecte nodes, you need to configure authentication credentials:

1. Open your n8n instance
2. Go to **Settings** > **Credentials**
3. Click on **Add Credential**
4. Search for "Efecte ESM API"
5. Configure the following fields:
   - **Host**: Your Efecte instance URL (e.g., https://your-instance.efectecloud.com)
   - **Username**: Your Efecte username
   - **Password**: Your Efecte password

The node uses JWT authentication internally to communicate with the Efecte API.

## Compatibility

- Efecte Service Management Tool REST API v1
- n8n version >= 1.70.0 (tested up to 1.72.1)

## Usage

1. **Authentication Setup**
   - Configure credentials as described above
   - The node will automatically handle JWT token management

2. **Basic Workflow Example**
   ```
   Trigger (Efecte ESM) -> Process Data -> Action (Efecte ESM)
   ```

3. **Data Card Operations**
   - Use template codes to specify which type of data card to work with
   - Available templates can be retrieved from the API
   - Follow Efecte's data model for creating/updating cards

4. **Error Handling**
   - The node implements proper error handling for API responses
   - Check workflow execution logs for detailed error messages

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [Efecte API Documentation](https://docs.efecte.com/other-technical-esm-documentation/esm-rest-api-overview)

## License

[MIT](LICENSE.md)



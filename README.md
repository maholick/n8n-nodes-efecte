# n8n Efecte/Matrix42 Nodes

**Community nodes for integrating n8n workflows with Efecte/Matrix42 Service Management systems**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.19+-green.svg)](https://nodejs.org/)
[![n8n](https://img.shields.io/badge/n8n-2.0+-orange.svg)](https://n8n.io/)

---

## ⚠️ Important Legal Notice

**This is an unofficial, community-driven integration project.** This software is not affiliated with, endorsed by, or sponsored by Efecte Oyj, Matrix42 AG, or any of their subsidiaries or affiliates.

- **Efecte** and **Matrix42** are registered trademarks of their respective owners
- This project is provided as-is for educational and integration purposes
- Users are responsible for ensuring compliance with their Efecte/Matrix42 license agreements
- This software uses the publicly documented REST API endpoints

**Note:** Following Matrix42's acquisition of Efecte in April 2024, the products were rebranded to **Matrix42 Core** and **Matrix42 Professional**. However, the REST API endpoints and technical integration continue to use the "Efecte" branding in API paths (e.g., `/rest-api/itsm/v1`). This integration works with both legacy Efecte instances and the rebranded Matrix42 service management platforms.

---

## 🚀 Overview

Integrate your n8n workflows with Efecte/Matrix42 Service Management systems. This package provides comprehensive nodes for managing incidents, service requests, problems, and other service management entities through n8n workflows.

### Key Capabilities

- 🔄 **Workflow Automation** - Automate service management processes with n8n
- 📊 **Full CRUD Operations** - Create, read, update, and delete data cards
- 🔍 **Advanced Search** - Query data cards using EQL (Efecte Query Language)
- 📎 **File Management** - Upload and download attachments
- 🎯 **Template Discovery** - Discover available templates and attributes
- ⚡ **Trigger Support** - Watch for new/updated data cards
- 🔒 **Secure Authentication** - Automatic JWT token management

---

## ✨ Features

### Regular Node Operations

- ✅ **Get All Templates** - List all available templates
- ✅ **Get Template** - Retrieve detailed template information including attributes
- ✅ **Get DataCard** - Retrieve a single data card by ID
- ✅ **Create DataCard** - Create new data cards
- ✅ **Update DataCard** - Update existing data cards
- ✅ **Delete DataCard** - Delete data cards (move to trash)
- ✅ **List Data Cards** - Get paginated list of data cards with filtering
- ✅ **Search Data Cards** - Search using EQL filters
- ✅ **Get Attribute** - Get value of a specific attribute
- ✅ **Update Attribute** - Replace attribute value(s)
- ✅ **Add Attribute Value** - Add value to multi-value attributes
- ✅ **Delete Attribute** - Clear attribute value(s)
- ✅ **Upload File** - Upload file attachments to data cards
- ✅ **Download File** - Download file attachments from data cards
- ✅ **Bulk Import** - Import multiple data cards synchronously
- ✅ **Stream Data Cards** - Stream all data cards for large datasets

### Trigger Node

- ✅ **Watch Data Cards** - Poll for new/updated data cards and trigger workflows

---

## 📦 Installation

### Prerequisites

- n8n version >= 2.0.0
- Node.js >= 20.19
- Access to an Efecte/Matrix42 instance with REST API enabled
- Valid API credentials

### Install from npm

```bash
npm install n8n-nodes-efecte
```

### Install Locally

```bash
# Clone the repository
git clone https://github.com/maholick/n8n-nodes-efecte.git
cd n8n-nodes-efecte

# Install dependencies
pnpm install

# Build the project
pnpm run build

# Link for local development
pnpm link
# Then in your n8n installation directory:
# pnpm link n8n-nodes-efecte
```

### Using Docker

To use this node with n8n in Docker, use the following docker-compose configuration:

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

---

## ⚙️ Configuration

### Credentials Setup

1. Open your n8n instance
2. Go to **Settings** > **Credentials**
3. Click on **Add Credential**
4. Search for "Efecte ESM API"
5. Configure the following fields:
   - **Efecte Instance URL**: Your Efecte instance URL (e.g., `https://your-instance.efectecloud.com`)
   - **Username**: Your Efecte username
   - **Password**: Your Efecte password

The node uses JWT authentication internally to communicate with the Efecte API. Authentication tokens are automatically managed and refreshed as needed.

---

## 🛠️ Available Operations

### Template Operations

| Operation | Description |
|-----------|-------------|
| Get All Templates | List all available templates in your Efecte instance |
| Get Template | Get detailed template information including all attributes and their types |

### DataCard Operations

| Operation | Description |
|-----------|-------------|
| Get DataCard | Retrieve full details of a single data card by ID |
| Create DataCard | Create a new data card (requires folderCode) |
| Update DataCard | Update an existing data card (optionally move to different folder) |
| Delete DataCard | Delete a data card (moves to trash) |
| List Data Cards | Get paginated list of data cards with EQL filtering |
| Search Data Cards | Search data cards using EQL (Efecte Query Language) |
| Stream Data Cards | Stream all data cards for large datasets |

### Attribute Operations

| Operation | Description |
|-----------|-------------|
| Get Attribute | Get value of a specific attribute from a data card |
| Update Attribute | Replace attribute value(s) |
| Add Attribute Value | Add value to multi-value or empty attribute |
| Delete Attribute | Clear attribute value(s) |

### File Operations

| Operation | Description |
|-----------|-------------|
| Upload File | Upload file attachment to a data card |
| Download File | Download file attachment from a data card |

### Bulk Operations

| Operation | Description |
|-----------|-------------|
| Bulk Import DataCards | Import multiple data cards synchronously |

### Trigger Node

| Feature | Description |
|---------|-------------|
| Watch Data Cards | Poll for new/updated data cards and trigger workflow |

---

## 🔍 EQL Filter Syntax

The nodes support EQL (Efecte Query Language) for filtering data cards. EQL uses `$attribute_name$` syntax to reference attributes.

### Basic Syntax

- **Attribute References**: Use `$attribute_name$` to reference attributes
- **String Values**: Enclose string values in single quotes: `'value'`
- **Operators**: `=`, `<>`, `>`, `<`, `>=`, `<=`
- **Logical Operators**: `AND`, `OR`, `NOT`

### Filter Examples

**Static Value Attributes:**
```
$status$ = '02 - Solving'
$priority$ = '2. High'
$status$ <> '07 - Closed'
```

**Reference Attributes (by name):**
```
$support_group$ = 'IT Support'
$customer$ = 'John Doe'
$organization_inc$ = 'collaboration Factory GmbH'
```

**Date Comparisons:**
```
$created$ > '2025-01-01'
$created$ >= '2025-01-01T00:00:00Z'
$created$ > 'now - 2w'
```

**Complex Filters:**
```
$status$ = '02 - Solving' AND $priority$ = '2. High'
$status$ = '01 - New' OR $status$ = '02 - Solving'
$support_group$ = 'IT Support' AND $priority$ <> '3. Medium'
```

### Finding Attribute Names

To find the correct attribute names for filtering:
1. Use the **Get Template** operation to see all available attributes for a template
2. Use **List Data Cards** with "Get Full Data Cards" enabled to see actual attribute names
3. Attribute codes are typically lowercase with underscores (e.g., `support_group`, `customer`, `organization_inc`)

---

## 💡 Usage Examples

### List Active Incidents

Use the **List Data Cards** operation:
- Template Code: `incident`
- Filter: `$status$ = '02 - Solving'`
- Limit: `50`

### Create a New Incident

Use the **Create DataCard** operation:
- Template Code: `incident`
- Folder Code: `incident_management` (required)
- Fields:
  - Field Name: `subject`, Type: `String`, Value: `Network connectivity issue`
  - Field Name: `description`, Type: `String`, Value: `Users unable to access network resources`
  - Field Name: `priority`, Type: `Static Value`, Value: `02|high`

### Update an Incident

Use the **Update DataCard** operation:
- Template Code: `incident`
- DataCard ID: `12345`
- Fields:
  - Field Name: `status`, Type: `Static Value`, Value: `03|solved`
- Options: Enable "Return Full DataCard" to get the updated card back

### Search by Support Group

Use the **Search Data Cards** operation:
- Template Code: `ServiceRequest`
- Search Query: `$support_group$ = 'IT Support'`
- Limit: `20`

### Watch for New Data Cards

Use the **Efecte ESM Trigger** node:
- Template Code: `incident`
- Additional Fields:
  - Filter: `$status$ = '01 - New'`
  - Limit: `10`

The trigger will poll for new data cards matching the filter and start the workflow when found.

### Upload an Attachment

Use the **Upload File** operation:
- Template Code: `incident`
- DataCard ID: `12345`
- Attribute Code: `attachments`
- File Name: `screenshot.png`
- File Data: Use binary data from previous node

### Get Template Information

Use the **Get Template** operation:
- Template Code: `incident`

This returns all available attributes, their types, and other template metadata, which is useful for discovering what fields are available for creating or filtering data cards.

---

## 🏃 Development

This project uses [@n8n/node-cli](https://docs.n8n.io/integrations/creating-nodes/build/n8n-node/) for development and building.

### Prerequisites

- Node.js >= 20.19
- pnpm >= 9.1

### Setup

```bash
# Install dependencies
pnpm install
```

### Development Commands

```bash
# Start development server with hot reload
pnpm run dev

# Build for production
pnpm run build

# Run linter
pnpm run lint

# Fix linting issues
pnpm run lintfix

# Format code
pnpm run format
```

The `dev` command will:
- Build your node with watch mode
- Start n8n with your node loaded
- Automatically rebuild when you make changes
- Open n8n in your browser (usually http://localhost:5678)

---

## 🏗️ Project Structure

```
n8n-nodes-efecte/
├── credentials/
│   └── EfecteEsmApi.credentials.ts  # Credential definition
├── nodes/
│   └── EfecteEsm/
│       ├── EfecteEsm.node.ts        # Main node implementation
│       ├── EfecteEsmTrigger.node.ts # Trigger node implementation
│       └── icon.png                 # Node icon
├── dist/                             # Compiled output
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc.js
└── README.md
```

---

## 🔒 Security

- **Credentials**: Stored securely in n8n's credential system
- **Token Handling**: Automatic JWT token management with refresh
- **Error Handling**: No sensitive data exposed in error messages
- **Input Validation**: Comprehensive validation of all inputs

---

## ⚡ Performance

- **Pagination Support**: Configurable limits (default: 50, max: 200)
- **Streaming Support**: Handle large datasets efficiently
- **Efficient Polling**: Trigger node uses filterId-based pagination
- **Automatic Token Refresh**: Seamless authentication management

---

## 🐛 Troubleshooting

### Authentication Issues

1. Verify credentials in n8n credential settings
2. Check that the instance URL is correct
3. Ensure user has API access permissions

### Template Not Found

1. Use **Get All Templates** to see available template codes
2. Verify the template code spelling (case-sensitive)
3. Check that the template exists in your Efecte instance

### Filter Errors

1. Use **Get Template** to see available attributes
2. Verify attribute names are correct (case-sensitive)
3. Check EQL syntax (use single quotes for string values)
4. For reference attributes, use the exact name as it appears in Efecte

### Pagination Issues

- The API uses `filterId` (ID of last data card) for pagination, not offset
- Large result sets are automatically paginated
- Use **Stream Data Cards** for very large datasets

---

## 📋 Limitations

- File uploads are limited by n8n's binary data handling
- Large dataset operations may require pagination or streaming
- EQL filter syntax must match Efecte's requirements exactly
- Reference attribute values must match exactly (case-sensitive)

---

## 🤝 Contributing

Contributions are welcome! This is a community-driven project. Please ensure:

- Code follows existing style and patterns
- All linting passes
- Documentation is updated
- No sensitive information is committed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

## ⚖️ Trademark Notice

**Efecte** and **Matrix42** are registered trademarks of their respective owners. This project is not affiliated with, endorsed by, or sponsored by Efecte Oyj, Matrix42 AG, or any of their subsidiaries or affiliates. This software is provided as-is for integration purposes only.

---

## 📞 Support

For issues or questions:

1. Check the documentation above
2. Review n8n workflow execution logs
3. Contact your Efecte/Matrix42 administrator for API access issues
4. Open an issue in the [GitHub repository](https://github.com/maholick/n8n-nodes-efecte)

---

## 🙏 Acknowledgments

- Built with [n8n](https://n8n.io/) workflow automation platform
- Integrates with the Efecte/Matrix42 REST API
- Uses [@n8n/node-cli](https://docs.n8n.io/integrations/creating-nodes/build/n8n-node/) for development
- Community-driven and open-source

---

## 📚 Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Efecte API Documentation](https://docs.efecte.com/other-technical-esm-documentation/esm-rest-api-overview)
- [n8n node development guide](https://docs.n8n.io/integrations/creating-nodes/build/n8n-node/)
- [n8n-nodes-starter template](https://github.com/n8n-io/n8n-nodes-starter)

---

**Made with ❤️ for the workflow automation community**

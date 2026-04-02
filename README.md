# n8n-nodes-railsr

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides seamless integration with Railsr's Banking-as-a-Service platform. It includes 7 comprehensive resources for managing digital banking operations including ledgers, payments, beneficiaries, customers, accounts, transactions, and webhooks, enabling complete financial service automation workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Banking](https://img.shields.io/badge/Banking-as--a--Service-green)
![Payments](https://img.shields.io/badge/Payments-API-orange)
![Financial Services](https://img.shields.io/badge/FinTech-Integration-purple)

## Features

- **Complete Banking Operations** - Full CRUD operations for accounts, customers, and beneficiaries
- **Payment Processing** - Execute domestic and international payments with comprehensive tracking
- **Ledger Management** - Real-time balance tracking and transaction recording
- **Transaction Monitoring** - Query and analyze transaction history with advanced filtering
- **Webhook Integration** - Automated event handling for real-time notifications
- **Secure Authentication** - API key-based authentication with enterprise security
- **Error Handling** - Comprehensive error management with detailed response parsing
- **Validation Support** - Built-in data validation for all banking operations

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-railsr`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-railsr
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-railsr.git
cd n8n-nodes-railsr
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-railsr
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your Railsr API key from the dashboard | ✓ |
| Environment | Production or Sandbox environment | ✓ |
| Base URL | API endpoint URL (auto-configured by environment) | ✓ |

## Resources & Operations

### 1. Ledger

| Operation | Description |
|-----------|-------------|
| Get Balance | Retrieve current ledger balance |
| Get Ledger | Fetch ledger details and configuration |
| List Entries | Get all ledger entries with filtering |
| Create Entry | Add new transaction entry to ledger |
| Update Entry | Modify existing ledger entry |

### 2. Payment

| Operation | Description |
|-----------|-------------|
| Create Payment | Initiate new payment transaction |
| Get Payment | Retrieve payment details by ID |
| List Payments | Get all payments with filtering options |
| Cancel Payment | Cancel pending payment transaction |
| Update Payment | Modify payment details |

### 3. Beneficiary

| Operation | Description |
|-----------|-------------|
| Create Beneficiary | Add new payment beneficiary |
| Get Beneficiary | Retrieve beneficiary details |
| List Beneficiaries | Get all beneficiaries with search |
| Update Beneficiary | Modify beneficiary information |
| Delete Beneficiary | Remove beneficiary from system |

### 4. Customer

| Operation | Description |
|-----------|-------------|
| Create Customer | Register new customer profile |
| Get Customer | Retrieve customer details |
| List Customers | Get all customers with filtering |
| Update Customer | Modify customer information |
| Delete Customer | Remove customer from system |
| Verify Customer | Execute KYC verification process |

### 5. Account

| Operation | Description |
|-----------|-------------|
| Create Account | Open new customer account |
| Get Account | Retrieve account details |
| List Accounts | Get all accounts with filtering |
| Update Account | Modify account settings |
| Close Account | Close existing account |
| Freeze Account | Temporarily suspend account |
| Unfreeze Account | Reactivate frozen account |

### 6. Transaction

| Operation | Description |
|-----------|-------------|
| Get Transaction | Retrieve transaction details by ID |
| List Transactions | Get transaction history with filtering |
| Search Transactions | Advanced transaction search |
| Get Statement | Generate account statement |

### 7. Webhook

| Operation | Description |
|-----------|-------------|
| Create Webhook | Register new webhook endpoint |
| Get Webhook | Retrieve webhook configuration |
| List Webhooks | Get all registered webhooks |
| Update Webhook | Modify webhook settings |
| Delete Webhook | Remove webhook registration |
| Test Webhook | Send test payload to endpoint |

## Usage Examples

```javascript
// Create a new customer
{
  "personal_details": {
    "name": "John Doe",
    "date_of_birth": "1990-01-15",
    "email": "john.doe@example.com",
    "phone": "+1234567890"
  },
  "address": {
    "address_line_one": "123 Main Street",
    "address_city": "New York",
    "address_postal_code": "10001",
    "address_country": "US"
  }
}
```

```javascript
// Execute a payment
{
  "payment_type": "domestic",
  "amount": 1000.00,
  "currency": "GBP",
  "beneficiary_id": "ben_12345678",
  "reference": "Invoice payment #INV-001",
  "payment_date": "2024-01-15"
}
```

```javascript
// Query transactions with filters
{
  "account_id": "acc_12345678",
  "from_date": "2024-01-01",
  "to_date": "2024-01-31",
  "transaction_type": "credit",
  "limit": 100
}
```

```javascript
// Create webhook for payment notifications
{
  "url": "https://your-app.com/webhook/railsr",
  "events": ["payment.completed", "payment.failed"],
  "active": true,
  "secret": "webhook_secret_key"
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | Authentication failed with provided credentials | Verify API key in credentials configuration |
| Insufficient Balance | Account balance too low for transaction | Check account balance before payment execution |
| Invalid Beneficiary | Beneficiary ID not found or inactive | Verify beneficiary exists and is active |
| Rate Limit Exceeded | Too many API requests in time window | Implement delays between requests |
| Validation Error | Required fields missing or invalid format | Check field requirements in API documentation |
| Network Timeout | Request timed out during API call | Retry with exponential backoff strategy |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-railsr/issues)
- **API Documentation**: [Railsr API Docs](https://docs.railsr.com)
- **Developer Portal**: [Railsr Developer Hub](https://developer.railsr.com)
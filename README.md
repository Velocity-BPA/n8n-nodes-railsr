# n8n-nodes-railsr

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for the **Railsr** embedded finance platform. Enables no-code/low-code automation of Banking-as-a-Service operations including ledger management, multi-rail payments (SEPA, Faster Payments, BACS, SWIFT), card issuing, FX, and KYC/KYB compliance workflows.

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **23 Resource Categories** covering the complete Railsr embedded finance API
- **150+ Operations** for comprehensive banking automation
- **Multi-Rail Payments**: SEPA, SEPA Instant, UK Faster Payments, BACS, SWIFT
- **Card Issuing**: Virtual and physical card creation, PIN management, transaction controls
- **Multi-Currency Ledgers**: Account management, balances, statements, transactions
- **Real-Time FX**: Currency conversion, rate quotes, conversion history
- **Compliance Workflows**: KYC/KYB checks, document verification, audit logging
- **Webhook Triggers**: 80+ event types for real-time notifications
- **Sandbox & Production**: Full support for both environments

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** > **Community Nodes**
3. Select **Install**
4. Enter `n8n-nodes-railsr`
5. Agree to the risks and click **Install**

### Manual Installation

```bash
cd ~/.n8n/custom
npm install n8n-nodes-railsr
```

### Development Installation

```bash
# Clone and install
git clone https://github.com/Velocity-BPA/n8n-nodes-railsr.git
cd n8n-nodes-railsr
npm install

# Build
npm run build

# Link to n8n
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-railsr

# Restart n8n
```

## Credentials Setup

| Field | Description |
|-------|-------------|
| **Environment** | Select Sandbox or Production |
| **API Key** | Your Railsr API key |
| **API Secret** | Your Railsr API secret |
| **Program ID** | Your Railsr program identifier |

Obtain credentials from the [Railsr Dashboard](https://dashboard.railsr.com).

## Resources & Operations

### End User Management
| Operation | Description |
|-----------|-------------|
| Create | Create a new end user (individual customer) |
| Get | Retrieve end user details |
| Update | Update end user information |
| List | List all end users with filtering |
| Delete | Remove an end user |
| Activate | Activate an end user account |
| Deactivate | Deactivate an end user account |
| Suspend | Suspend an end user account |

### Ledger Management
| Operation | Description |
|-----------|-------------|
| Create | Create a new multi-currency ledger |
| Get | Retrieve ledger details |
| Update | Update ledger configuration |
| List | List all ledgers |
| Delete | Remove a ledger |
| Get Balance | Get current ledger balance |
| Get Transactions | List ledger transactions |
| Get Statement | Generate ledger statement |

### Ledger Account
| Operation | Description |
|-----------|-------------|
| Create | Create a ledger account |
| Get | Retrieve account details |
| Update | Update account information |
| List | List accounts |
| Delete | Remove an account |
| Get Balance | Get account balance |
| Freeze | Freeze an account |
| Unfreeze | Unfreeze an account |
| Close | Close an account |

### Payments - SEPA
| Operation | Description |
|-----------|-------------|
| Create | Initiate a SEPA transfer |
| Create Instant | Initiate a SEPA Instant payment |
| Get | Get payment details |
| List | List SEPA payments |
| Cancel | Cancel a pending payment |
| Create Direct Debit | Create a SEPA Direct Debit |
| Create Mandate | Create a Direct Debit mandate |
| Get Mandate | Retrieve mandate details |

### Payments - UK
| Operation | Description |
|-----------|-------------|
| Create Faster Payment | Initiate a Faster Payment |
| Create BACS | Initiate a BACS payment |
| Get | Get payment details |
| List | List UK payments |
| Cancel | Cancel a pending payment |
| Create Direct Debit | Create a UK Direct Debit |

### Payments - SWIFT
| Operation | Description |
|-----------|-------------|
| Create | Initiate a SWIFT transfer |
| Get | Get payment details |
| List | List SWIFT payments |
| Track | Track payment status |
| Get Quote | Get SWIFT transfer quote |

### Cards
| Operation | Description |
|-----------|-------------|
| Create Virtual | Issue a virtual card |
| Create Physical | Issue a physical card |
| Get | Get card details |
| List | List cards |
| Activate | Activate a card |
| Block | Block a card |
| Unblock | Unblock a card |
| Set PIN | Set card PIN |
| Get PIN | Retrieve card PIN |
| Set Limits | Configure spending limits |
| Get Limits | Get spending limits |
| Cancel | Cancel a card |

### FX (Foreign Exchange)
| Operation | Description |
|-----------|-------------|
| Convert | Execute currency conversion |
| Get Rate | Get current exchange rate |
| Get Rates | Get all available rates |
| Get History | Get conversion history |
| Get Quote | Get a conversion quote |

### Compliance - KYC
| Operation | Description |
|-----------|-------------|
| Create | Initiate a KYC check |
| Get | Get KYC check status |
| List | List KYC checks |
| Update | Update KYC information |
| Approve | Manually approve KYC |

### Compliance - KYB
| Operation | Description |
|-----------|-------------|
| Create | Initiate a KYB check |
| Get | Get KYB check status |
| List | List KYB checks |
| Update | Update KYB information |
| Approve | Manually approve KYB |

### Additional Resources
- **Beneficiary**: Payment recipient management and validation
- **Pay-in**: Incoming payment processing and reconciliation
- **Payout**: Outgoing payment management with approval workflows
- **Internal Transfer**: Inter-account transfers and reversals
- **Card Transaction**: Transaction history, disputes, authorization details
- **Card Program**: Program configuration and controls
- **FX Quote**: Real-time quote management
- **Webhook**: Subscription management
- **Document**: Document upload and verification
- **Company Holder**: Corporate entity management
- **Simulation**: Sandbox testing scenarios
- **Report**: Compliance and transaction reporting
- **Audit Log**: Activity tracking and compliance

## Trigger Node

The **Railsr Trigger** node supports 80+ webhook event types for real-time notifications:

### Event Categories
- **End User Events**: Created, updated, activated, suspended
- **Ledger Events**: Balance changes, transactions
- **Card Events**: Created, activated, blocked, transactions
- **Payment Events**: Initiated, completed, failed
- **Compliance Events**: KYC/KYB status changes
- **Document Events**: Uploaded, verified, rejected

## Usage Examples

### Create End User and Issue Card
```
1. Railsr Node: Create End User
2. Railsr Node: Create Ledger (linked to end user)
3. Railsr Node: Create Virtual Card (linked to ledger)
```

### Process SEPA Payment
```
1. Railsr Node: Create Beneficiary
2. Railsr Node: Validate Beneficiary
3. Railsr Node: Create SEPA Payment
4. Railsr Trigger: Wait for payment.completed event
```

### Currency Conversion Flow
```
1. Railsr Node: Get FX Quote
2. IF Node: Check rate acceptability
3. Railsr Node: Execute Conversion
```

## Embedded Finance Concepts

### Ledgers
Multi-currency ledgers serve as the core account structure. Each ledger can hold multiple currencies and track all financial movements.

### Payment Rails
- **SEPA**: Single Euro Payments Area - European transfers (1-2 business days)
- **SEPA Instant**: Real-time European payments (seconds)
- **Faster Payments**: UK real-time payments
- **BACS**: UK batch payments (3 business days)
- **SWIFT**: International wire transfers

### Card Issuing
Issue virtual or physical cards linked to ledger accounts with configurable spending limits, geographic restrictions, and merchant category controls.

## Error Handling

The node provides detailed error messages for common scenarios:
- **Authentication Errors**: Invalid API credentials
- **Validation Errors**: Missing or invalid parameters
- **Business Errors**: Insufficient funds, compliance blocks
- **Rate Limits**: API throttling responses

## Security Best Practices

1. **Use Sandbox First**: Test all workflows in sandbox before production
2. **Secure Credentials**: Store API credentials securely in n8n
3. **Validate Beneficiaries**: Always validate before sending payments
4. **Monitor Webhooks**: Set up alerts for failed webhook deliveries
5. **Audit Logging**: Enable audit logs for compliance

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run linting
npm run lint

# Watch mode
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
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **Documentation**: [Railsr API Docs](https://docs.railsr.com)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-railsr/issues)
- **n8n Community**: [community.n8n.io](https://community.n8n.io)

## Acknowledgments

- [Railsr](https://railsr.com) for their embedded finance platform
- [n8n](https://n8n.io) for the workflow automation platform
- The n8n community for feedback and contributions

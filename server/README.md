# CreditFlow Backend API

A comprehensive Node.js/Express backend for the Credit Card Management System with PostgreSQL database integration.

## 🚀 Features

- **JWT Authentication** - Secure user authentication and authorization
- **Payment Processing** - Complete payment workflow with transaction management
- **Database Integration** - PostgreSQL with proper ERD structure
- **Real-time Balance Updates** - Automatic balance updates after successful payments
- **Webhook Simulation** - External payment gateway webhook handling
- **Receipt Generation** - Digital receipt generation for successful payments
- **Rate Limiting** - API protection against abuse
- **Security** - Helmet.js security headers and CORS configuration

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠 Installation

1. **Clone and setup**
```bash
cd server
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Database Setup**
```bash
# Create PostgreSQL database
createdb creditflow

# Run migrations
npm run migrate
```

4. **Start Development Server**
```bash
npm run dev
```

## 🗄 Database Schema

### Users Table
```sql
- id (UUID, PK)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- password (VARCHAR, hashed)
- created_at (TIMESTAMP)
```

### Card Accounts Table
```sql
- id (UUID, PK)
- user_id (UUID, FK → users.id)
- card_number (VARCHAR)
- card_type (VARCHAR)
- credit_limit (NUMERIC)
- outstanding_balance (NUMERIC)
- available_credit (COMPUTED)
- status (VARCHAR)
```

### Payments Table
```sql
- id (UUID, PK)
- account_id (UUID, FK → card_accounts.id)
- payment_id (VARCHAR, UNIQUE)
- user_id (UUID, FK → users.id)
- amount (NUMERIC)
- method (ENUM: 'bank', 'card', 'instant')
- status (ENUM: 'pending', 'success', 'failed')
- payment_time (TIMESTAMP)
- external_id (VARCHAR, nullable)
```

### Transactions Table
```sql
- id (UUID, PK)
- account_id (UUID, FK → card_accounts.id)
- user_id (UUID, FK → users.id)
- amount (NUMERIC)
- type (VARCHAR)
- txn_time (TIMESTAMP)
- merchant_name (VARCHAR)
- status (VARCHAR)
- description (TEXT)
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Accounts
- `GET /api/accounts` - Get user's card accounts
- `GET /api/accounts/:id` - Get specific account details

### Payments
- `POST /api/payments` - Create new payment
- `GET /api/payments/:id` - Get payment details
- `GET /api/payments/user/:userId` - Get user's payment history
- `GET /api/payments/:id/receipt` - Get payment receipt
- `POST /api/payments/webhook` - Payment gateway webhook

## 💳 Payment Flow

1. **Validation**
   - User authentication via JWT
   - Account ownership verification
   - Amount validation (> 0, ≤ outstanding balance)

2. **Processing**
   - Create payment record with 'pending' status
   - Simulate payment gateway (90% success rate)
   - Update payment status based on result

3. **Success Actions**
   - Create transaction record
   - Update outstanding balance
   - Generate receipt

4. **Response**
   - Return payment status and details
   - Include updated balance information

## 🧪 Testing

### Demo Credentials
```
Email: john.doe@example.com
Password: password123
```

### Sample Payment Request
```json
POST /api/payments
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "accountId": "660e8400-e29b-41d4-a716-446655440000",
  "amount": 5000,
  "method": "bank"
}
```

### Sample Response
```json
{
  "success": true,
  "message": "Payment of ₹5,000 successful",
  "data": {
    "paymentId": "PAY_1704067200_ABC123DEF",
    "amount": 5000,
    "method": "bank",
    "status": "success",
    "newBalance": 40320,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **CORS Protection** - Configured for frontend domain
- **Helmet.js** - Security headers
- **Input Validation** - Comprehensive request validation
- **SQL Injection Protection** - Parameterized queries

## 🚀 Deployment

1. **Environment Variables**
```bash
NODE_ENV=production
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_super_secret_key
```

2. **Build and Start**
```bash
npm start
```

## 📊 Monitoring

- Health check endpoint: `GET /health`
- Comprehensive error logging
- Database connection monitoring
- Request/response logging in development

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## 📄 License

MIT License - see LICENSE file for details
# Credit Card Recommendation System - Backend

Backend API for the Credit Card Recommendation System built with Node.js, Express, Prisma ORM, and PostgreSQL.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup PostgreSQL Database

Create a new PostgreSQL database:

```sql
CREATE DATABASE credit_card_db;
```

### 3. Configure Environment

Copy the example environment file and update with your database credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/credit_card_db?schema=public"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 4. Run Database Migrations

```bash
# Generate Prisma client and push schema to database
npm run db:push

# Or use migrations for production
npm run db:migrate
```

### 5. Seed the Database

```bash
npm run db:seed
```

This will create:
- 12 spending categories (Fuel, Grocery, Travel, etc.)
- 4 banks (HDFC, ICICI, SBI, Axis)
- 8 credit cards with real HDFC card data
- 10 cashback rules
- 1 demo user with 3 cards

### 6. Start the Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

Server runs at `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Admin APIs (`/api/admin`)

#### Banks
- `POST /banks` - Create a bank
- `GET /banks` - List all banks
- `PUT /banks/:id` - Update a bank

#### Credit Cards
- `POST /credit-cards` - Create a credit card
- `GET /credit-cards` - List all cards (filter: `?bankId=1&active=true`)
- `GET /credit-cards/:id` - Get card details with rules
- `PUT /credit-cards/:id` - Update a card
- `PATCH /credit-cards/:id/toggle` - Enable/disable a card

#### Categories
- `POST /categories` - Create a category
- `GET /categories` - List all categories

#### Cashback Rules
- `POST /cashback-rules` - Create a rule
- `GET /cashback-rules` - List rules (filter: `?cardId=1&categoryId=2`)
- `PUT /cashback-rules/:id` - Update a rule
- `DELETE /cashback-rules/:id` - Delete a rule

#### Exclusions
- `POST /exclusions` - Add an exclusion
- `DELETE /exclusions/:id` - Remove an exclusion

#### Fee Rules
- `POST /fee-rules` - Create fee rule
- `GET /fee-rules` - List fee rules

### User APIs (`/api/user`)

#### User Management
- `POST /` - Create a user
- `GET /email/:email` - Get user by email
- `GET /firebase/:firebaseUid` - Get user by Firebase UID

#### User Cards
- `POST /cards` - Add a card to wallet
- `GET /:userId/cards` - Get user's cards
- `DELETE /:userId/cards/:cardId` - Remove a card
- `PATCH /:userId/cards/:cardId/verify` - Verify a card

#### User Expenses
- `POST /expenses` - Record an expense
- `GET /:userId/expenses` - Get expenses (filter: `?startDate=&endDate=&categoryId=`)
- `GET /:userId/expenses/summary` - Get monthly summary

### Recommendation APIs (`/api/recommendation`)

- `POST /` - Get best card recommendation
- `POST /compare` - Compare all cards for an expense
- `GET /category/:categoryId` - Get all cards for a category
- `GET /user/:userId/best-cards` - Get best card per category

## Example API Calls

### Get Recommendation

```bash
curl -X POST http://localhost:3001/api/recommendation \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "categoryId": 1,
    "amount": 3000
  }'
```

Response:
```json
{
  "success": true,
  "bestCard": "Millennia",
  "bank": "HDFC Bank",
  "reward": 30,
  "rewardType": "waiver",
  "explanation": "1% surcharge waiver (max ₹250) per statement"
}
```

### Add User Card

```bash
curl -X POST http://localhost:3001/api/user/cards \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "cardId": 3,
    "last4Digits": "1234"
  }'
```

## Database Schema

See `prisma/schema.prisma` for the complete database schema.

### Main Tables
- `banks` - Issuing bank information
- `credit_cards` - Credit card master data
- `categories` - Expense categories
- `card_cashback_rules` - Cashback/reward rules
- `cashback_exclusions` - Rule exclusions
- `card_fee_rules` - Annual/joining fees
- `users` - User accounts
- `user_cards` - User's card wallet (many-to-many)
- `user_expenses` - Expense tracking

## Development Tools

```bash
# Open Prisma Studio (database GUI)
npm run db:studio

# View database logs
# Set NODE_ENV=development in .env
```

## Architecture

```
Frontend (React) → Backend APIs → PostgreSQL Database
                        ↓
              Recommendation Service
                   (Rule Engine)
```

The recommendation engine:
1. Fetches user's active cards
2. Gets applicable cashback rules for the category
3. Validates date, spend limits, and exclusions
4. Calculates reward using: `MIN(amount × percent / 100, max_reward)`
5. Ranks cards by net benefit
6. Returns best recommendation with explanation

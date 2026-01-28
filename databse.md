Credit Card Recommendation System
Backend & Database Design Documentation

1. Introduction
This document explains the problem statement, database design decisions, backend architecture, and step-by-step implementation plan for a Credit Card Recommendation System.
The goal is to build a trustworthy, scalable, and accurate system that helps users:
Track their credit cards
Understand cashback & offers
Get recommendations for the best card per expense
The frontend (Admin + Customer portal) already exists. This document focuses on what comes next: database and backend.

2. Problem Statements
2.1 User Problems
Users own multiple credit cards but don’t know which one to use
Cashback rules are complex, unclear, and change frequently
Annual fees vs actual benefit is hard to calculate
Users cannot easily track spending vs rewards
2.2 Business / System Problems
Cashback calculations are often incorrect
Offers have exclusions, caps, and validity periods
Admin teams are non-technical but need to manage data
Recommendation logic must be transparent and explainable

3. Why a Relational Database Is Required
3.1 Nature of the Data
The system deals with:
Structured financial data
Strong relationships (users ↔ cards ↔ offers)
Rule-based calculations
Accuracy-critical logic (money)
This makes a Relational Database mandatory.
3.2 Why PostgreSQL
PostgreSQL is chosen because it provides:
Strong Foreign Key enforcement (data integrity)
ACID transactions (financial correctness)
Advanced joins & aggregations
JSON support (bank API raw data)
Scalability without redesign
Key Principle: If your system makes money-related decisions, relational integrity is non-negotiable.

4. High-Level Architecture
Frontend (Admin / User)
        ↓
Backend APIs (Validation + Logic)
        ↓
PostgreSQL Database

Frontend never talks directly to the database.
Backend acts as the single source of truth and control.

5. Database Design Overview
The database is split into:
Admin-controlled master data
User-owned data
Rule & calculation data

6. Database Schema (Tables + Purpose)
6.1 Banks
Stores issuing bank information.
banks
- id (PK)
- name
- logo_url
- api_identifier
- created_at


6.2 Credit Cards (Master Table)
This table defines each credit card product.
credit_cards
- id (PK)
- bank_id (FK → banks.id)
- card_name
- card_network
- annual_fee
- fee_waiver_spend
- active

Why this table is critical:
One card definition is reused across users
Prevents duplication
Central point for updates

6.3 Spend Categories
categories
- id (PK)
- name (Fuel, Grocery, Travel, etc.)

Used for mapping expenses and cashback rules.

6.4 Card Cashback Rules (Recommendation Engine Core)
This table defines how cashback is calculated.
card_cashback_rules
- id (PK)
- card_id (FK → credit_cards.id)
- category_id (FK → categories.id)
- cashback_percent
- max_cashback
- min_spend
- monthly_cap
- start_date
- end_date

Why this exists:
Stores rules, not results
Enables dynamic calculation
Supports future rule changes

6.5 Cashback Exclusions
cashback_exclusions
- id (PK)
- cashback_rule_id (FK → card_cashback_rules.id)
- excluded_merchant

Used to block invalid cashback scenarios.

6.6 Users
users
- id (PK)
- name
- email
- phone
- created_at


6.7 User Cards (Bridge Table)
Connects users and cards (many-to-many).
user_cards
- id (PK)
- user_id (FK → users.id)
- card_id (FK → credit_cards.id)
- last_4_digits
- linked_phone
- verified
- added_at

Why this table exists:
A user can have multiple cards
Same card can be owned by many users
Stores user-specific card metadata

6.8 User Expenses
user_expenses
- id (PK)
- user_id (FK → users.id)
- category_id (FK → categories.id)
- amount
- merchant
- expense_date

Used for:
Expense tracking
Backtracking analysis
Recommendation improvement

7. Recommendation Logic (How the System Thinks)
Input
Expense amount
Expense category
User’s active cards
Processing Steps
Fetch user’s cards
Fetch applicable cashback rules
Validate date, spend, exclusions
Calculate cashback per card
Rank cards by net benefit
Cashback Formula
cashback = MIN(
  amount × cashback_percent / 100,
  max_cashback
)

Output
Best card recommendation
Cashback value
Reason (explainability)

8. Admin Portal – Backend Responsibilities
Admin can:
Add / update banks & logos
Add credit cards
Define cashback rules
Add exclusions
Enable / disable cards
Backend ensures:
Validation
Referential integrity
No broken rules
Admin never writes calculations, only rules.

9. Backend Setup Steps (Given Frontend Exists)
Step 1: Initialize Backend
Node.js (NestJS / Express) or Python (FastAPI)
Environment config
Step 2: Setup PostgreSQL
Create database
Apply schema migrations
Step 3: ORM Integration
Prisma / SQLAlchemy
Map tables to models
Step 4: Admin APIs
Create card
Update offers
Manage exclusions
Step 5: User APIs
Add card (OTP verification)
Add expense
Get recommendation
Step 6: Recommendation Service
Pure backend logic layer
No UI logic

10. Bank API & Verification Handling
Reality
Direct bank APIs are restricted
Use aggregators (Setu, FinBox, OneMoney)
Flow
User enters bank + last 4 digits + phone
Backend calls aggregator
OTP sent to registered phone
Verification result stored
Security Rules:
Never store full card number
Never store CVV
Store verification reference only

11. Common Cashback Calculation Mistakes (Avoid These)
Storing calculated cashback in DB
Ignoring caps & exclusions
Mixing UI logic with backend logic
Duplicate card definitions
No date validation

12. Key Design Principles
Database stores truth
Backend applies logic
Frontend displays results
AI comes after correctness

13. Final Summary
This system is a database-first, rule-driven recommendation platform. A relational database with strong keys and normalized tables ensures correctness, while backend logic enables explainable and scalable recommendations. With this foundation, AI and personalization can be safely layered on top.

End of Documentation

14. HDFC CREDIT CARD DATA MAPPING (PDF → DATABASE)
This section incorporates real HDFC Credit Card MITC data (fees, waiver thresholds, fuel surcharge rules, exclusions) into the database design.
14.1 What the HDFC PDF Represents
The HDFC MITC document is a rule book, not static content. It defines:
Card variants (Infinia, Regalia Gold, Millennia, Swiggy, etc.)
Annual / joining fees
Spend-based fee waivers
Category-specific surcharge waivers (Fuel)
Transaction exclusions (wallet load, cash withdrawal, balance transfer)
Caps per statement cycle
These rules must be stored as structured data, not hardcoded logic.

15. HDFC-SPECIFIC DATABASE SEED DATA (EXAMPLES)
15.1 Bank Seed
INSERT INTO banks (name) VALUES ('HDFC Bank');

15.2 Credit Card Seeds (Sample)
INSERT INTO credit_cards (bank_id, card_name)
VALUES
(1, 'Infinia'),
(1, 'Regalia Gold'),
(1, 'Millennia'),
(1, 'Swiggy HDFC Bank Credit Card');

15.3 Fee Rules (Regalia Gold Example)
INSERT INTO card_fee_rules (card_id, annual_fee, fee_waiver_spend)
VALUES (2, 2500, 400000);

15.4 Fuel Surcharge Waiver Rule (Millennia)
INSERT INTO card_cashback_rules (
  card_id,
  category_id,
  reward_type,
  reward_percent,
  min_txn_amount,
  max_txn_amount,
  max_reward,
  reward_cycle
)
VALUES (
  3,
  1,
  'waiver',
  1.00,
  400,
  5000,
  250,
  'statement'
);

15.5 Exclusion Rules
INSERT INTO cashback_exclusions (cashback_rule_id, exclusion_type)
VALUES
(1, 'Wallet Load'),
(1, 'Cash Withdrawal'),
(1, 'Balance Transfer');


16. HOW THIS HELPS THE USER (END-TO-END)
User Scenario
User spends ₹3,000 on fuel.
Backend Processing
Identify user cards
Fetch applicable cashback rules
Validate min/max transaction limits
Check exclusions
Calculate reward using:
reward = MIN(amount × reward_percent / 100, max_reward)

Result Shown to User
Best Card: HDFC Millennia
Benefit: ₹30 fuel surcharge waiver
Reason: Highest eligible reward under statement cap

This logic is fully data-driven, not hardcoded.

17. API CONTRACTS (BACKEND INTERFACE)
17.1 Admin APIs
Create Credit Card
POST /admin/credit-cards

Request:
{
  "bankId": 1,
  "cardName": "Millennia"
}

Create Cashback Rule
POST /admin/cashback-rules

{
  "cardId": 3,
  "categoryId": 1,
  "rewardType": "waiver",
  "rewardPercent": 1.0,
  "minTxnAmount": 400,
  "maxTxnAmount": 5000,
  "maxReward": 250,
  "rewardCycle": "statement"
}


17.2 User APIs
Add Card
POST /user/cards

{
  "cardId": 3,
  "last4Digits": "1234"
}

Get Recommendation
POST /user/recommendation

{
  "categoryId": 1,
  "amount": 3000
}

Response:
{
  "bestCard": "Millennia",
  "reward": 30,
  "explanation": "1% fuel surcharge waiver within cap"
}


18. ER DIAGRAM (LOGICAL VIEW)
BANKS
  |
  | 1
  |
CREDIT_CARDS
  |
  | 1
  |
CARD_FEE_RULES

CREDIT_CARDS
  |
  | 1
  |
CARD_CASHBACK_RULES ---- SPEND_CATEGORIES
          |
          |
   CASHBACK_EXCLUSIONS

USERS
  |
  | 1
  |
USER_CARDS ---- CREDIT_CARDS

USERS ---- USER_EXPENSES ---- SPEND_CATEGORIES

This ER structure guarantees:
No duplicate cashback rules
Correct joins for recommendation
Safe admin updates

19. MVP ROADMAP (30–60 DAY PLAN)
Phase 1 (Week 1–2): Foundation
PostgreSQL setup
Core tables + migrations
Seed HDFC card data
Phase 2 (Week 3–4): Admin Portal Integration
Admin APIs
Card & cashback rule management
Validation & audit logging
Phase 3 (Week 5–6): User Features
Add card flow
Expense input
Recommendation API
Phase 4 (Week 7–8): Refinement
Explanation engine
Fee recovery analysis
Performance optimization

20. FINAL TAKEAWAY
This documentation now represents a complete, production-ready blueprint for a credit card recommendation system powered by real HDFC credit card rules. The system is:
Database-first
Rule-driven
Admin-friendly
User-explainable
AI-ready
This foundation ensures trust, correctness, and scalability before intelligence is layered on top.




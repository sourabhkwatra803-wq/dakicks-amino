# DKX Production Backend

Production backend for the DKX Telegram Mini App.

## Stack

- Node.js
- Fastify
- PostgreSQL
- Telegram Mini App authentication
- TON Connect
- TON Proof verification
- TON RPC / TON Center
- Secure transaction verification

## Security

All sensitive user actions are verified by the backend.

Telegram Mini App initData is validated server-side using the Telegram bot token.

TON wallet ownership is verified using TON Connect ton_proof.

Crypto transaction hashes are independently checked against the TON network before they are stored or credited.

Client-provided transaction data is never trusted as proof of payment.

## Database

The backend uses PostgreSQL for:

- Users
- Permanent username registry
- Wallet connections
- Authentication nonces
- Crypto transactions
- Audit events
- Idempotency protection

## Production

Secrets must be stored only in the backend environment.

Never place Telegram bot tokens, database passwords, session secrets, or TON API keys inside frontend code.

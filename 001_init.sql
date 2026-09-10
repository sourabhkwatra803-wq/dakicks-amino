BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS app_users(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 telegram_user_id bigint NOT NULL UNIQUE,
 telegram_username text,
 username_normalized text,
 email text,
 balance_dkx numeric(30,0) NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS username_registry(
 username_normalized text PRIMARY KEY,
 first_user_id uuid NOT NULL REFERENCES app_users(id),
 first_claimed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallet_connections(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 address_raw text NOT NULL,
 address_friendly text,
 network text NOT NULL,
 public_key_hex text,
 wallet_state_init text,
 proof_verified boolean NOT NULL DEFAULT false,
 proof_verified_at timestamptz,
 connected_at timestamptz NOT NULL DEFAULT now(),
 disconnected_at timestamptz,
 UNIQUE(user_id,address_raw)
);
CREATE UNIQUE INDEX IF NOT EXISTS wallet_one_live_owner
 ON wallet_connections(address_raw,network) WHERE disconnected_at IS NULL;

CREATE TABLE IF NOT EXISTS auth_nonces(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 kind text NOT NULL CHECK(kind IN('ton_proof')),
 nonce text NOT NULL UNIQUE,
 expires_at timestamptz NOT NULL,
 consumed_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crypto_transactions(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 wallet_connection_id uuid REFERENCES wallet_connections(id),
 tx_hash_hex text NOT NULL,
 tx_lt numeric(30,0),
 network text NOT NULL,
 source_address text,
 destination_address text NOT NULL,
 asset_type text NOT NULL CHECK(asset_type IN('TON','JETTON')),
 jetton_master text,
 amount_base_units numeric(50,0) NOT NULL,
 status text NOT NULL CHECK(status IN('verified','rejected')),
 rpc_verified_at timestamptz,
 raw_rpc jsonb,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(network,tx_hash_hex)
);

CREATE TABLE IF NOT EXISTS audit_events(
 id bigserial PRIMARY KEY,
 user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
 action text NOT NULL,
 request_id text,
 ip inet,
 user_agent text,
 success boolean NOT NULL,
 metadata jsonb,
 created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS idempotency_keys(
 user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 key text NOT NULL,
 response jsonb,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,key)
);

CREATE INDEX IF NOT EXISTS crypto_transactions_user_idx ON crypto_transactions(user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS audit_events_user_idx ON audit_events(user_id,created_at DESC);
COMMIT;

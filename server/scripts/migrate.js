const pool = require('../config/database');

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database migration...');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Users table created');

    // Create card_accounts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS card_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        card_number VARCHAR(16) NOT NULL,
        card_type VARCHAR(50) NOT NULL,
        credit_limit NUMERIC(12,2) NOT NULL DEFAULT 0,
        outstanding_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
        available_credit NUMERIC(12,2) GENERATED ALWAYS AS (credit_limit - outstanding_balance) STORED,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Card accounts table created');

    // Create payments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id UUID NOT NULL REFERENCES card_accounts(id) ON DELETE CASCADE,
        payment_id VARCHAR(255) UNIQUE NOT NULL,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount NUMERIC(12,2) NOT NULL,
        method VARCHAR(50) NOT NULL CHECK (method IN ('bank', 'card', 'instant')),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
        payment_time TIMESTAMP DEFAULT NOW(),
        external_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Payments table created');

    // Create transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id UUID NOT NULL REFERENCES card_accounts(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount NUMERIC(12,2) NOT NULL,
        type VARCHAR(50) NOT NULL,
        txn_time TIMESTAMP DEFAULT NOW(),
        merchant_name VARCHAR(255),
        status VARCHAR(20) DEFAULT 'success',
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Transactions table created');

    // Insert demo data
    console.log('📝 Inserting demo data...');

    // Insert demo user
    const userResult = await client.query(`
      INSERT INTO users (id, name, email, password)
      VALUES ('550e8400-e29b-41d4-a716-446655440000', 'John Doe', 'john.doe@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qK')
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
    `);

    // Insert demo card account
    await client.query(`
      INSERT INTO card_accounts (id, user_id, card_number, card_type, credit_limit, outstanding_balance)
      VALUES (
        '660e8400-e29b-41d4-a716-446655440000',
        '550e8400-e29b-41d4-a716-446655440000',
        '4532123456789012',
        'Platinum',
        500000,
        45320
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insert demo transactions
    await client.query(`
      INSERT INTO transactions (account_id, user_id, amount, type, merchant_name, description)
      VALUES 
        ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', -2340, 'purchase', 'Amazon', 'Online Shopping'),
        ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', -480, 'purchase', 'Swiggy', 'Food Delivery'),
        ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', -15000, 'payment', 'CreditFlow Payment', 'Payment via bank')
      ON CONFLICT DO NOTHING;
    `);

    console.log('✅ Demo data inserted');
    console.log('🎉 Database migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run migration
createTables()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
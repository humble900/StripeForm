// Fix missing slug column in forms table
require('dotenv').config({ path: '.env' });

const postgres = require('postgres');

async function fixFormsTable() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in environment variables');
    return;
  }
  
  console.log('🔧 Fixing forms table...');
  
  try {
    const sql = postgres(connectionString, {
      max: 1,
      idle_timeout: 5,
      connect_timeout: 10,
    });
    
    // Check current columns in forms table
    const currentColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'forms' 
      AND table_schema = 'public'
    `;
    
    const columnNames = currentColumns.map(col => col.column_name);
    console.log('📋 Current forms table columns:', columnNames.join(', '));
    
    // Add missing columns
    const missingColumns = [
      {
        name: 'slug',
        definition: 'text NOT NULL UNIQUE'
      },
      {
        name: 'is_public',
        definition: 'boolean DEFAULT false NOT NULL'
      },
      {
        name: 'allow_anonymous',
        definition: 'boolean DEFAULT true NOT NULL'
      },
      {
        name: 'require_captcha',
        definition: 'boolean DEFAULT false NOT NULL'
      },
      {
        name: 'max_submissions',
        definition: 'integer'
      },
      {
        name: 'submission_limit',
        definition: 'integer'
      },
      {
        name: 'submission_count',
        definition: 'integer DEFAULT 0 NOT NULL'
      },
      {
        name: 'theme',
        definition: 'jsonb DEFAULT \'{}\'::jsonb'
      },
      {
        name: 'brand_kit',
        definition: 'jsonb DEFAULT \'{}\'::jsonb'
      },
      {
        name: 'published_at',
        definition: 'timestamp'
      },
      {
        name: 'expires_at',
        definition: 'timestamp'
      },
      {
        name: 'metadata',
        definition: 'jsonb DEFAULT \'{}\'::jsonb'
      }
    ];
    
    for (const col of missingColumns) {
      if (!columnNames.includes(col.name)) {
        console.log(`➕ Adding ${col.name} column...`);
        await sql.unsafe(`ALTER TABLE forms ADD COLUMN ${col.name} ${col.definition}`);
        console.log(`✅ ${col.name} column added successfully!`);
      } else {
        console.log(`✅ ${col.name} column already exists`);
      }
    }
    
    // Verify final structure
    const finalColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'forms' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    console.log('\n📋 Final forms table structure:');
    finalColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    await sql.end();
    return true;
  } catch (error) {
    console.error('❌ Fix failed:', error);
    return false;
  }
}

fixFormsTable();

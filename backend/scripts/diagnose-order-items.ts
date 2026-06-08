import 'dotenv/config';
import { DataSource } from 'typeorm';

async function diagnoseOrderItems() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
    synchronize: false,
  });

  await ds.initialize();

  const prefix = process.env.DB_TABLE_PREFIX || '';
  const orderItemsTable = `${prefix}order_items`;
  const itemsTable = `${prefix}items`;

  // Check for NULL item_id
  const nullItemIds = await ds.query(`
    SELECT oi.id, oi.order_id, oi.quantity, oi.unit_price, oi.total_price, oi.created_at
    FROM "${orderItemsTable}" oi
    WHERE oi.item_id IS NULL
    ORDER BY oi.created_at DESC
    LIMIT 20
  `);

  console.log(`\n=== Order Items with NULL item_id: ${nullItemIds.length} ===`);
  if (nullItemIds.length > 0) {
    console.table(nullItemIds);
  } else {
    console.log('No order items with NULL item_id found. Good!');
  }

  // Check for item_id referencing soft-deleted items
  const softDeletedRefs = await ds.query(`
    SELECT oi.id, oi.order_id, oi.item_id, oi.quantity, oi.created_at, i.name as item_name, i.deleted_at
    FROM "${orderItemsTable}" oi
    INNER JOIN "${itemsTable}" i ON oi.item_id = i.id
    WHERE i.deleted_at IS NOT NULL
    ORDER BY oi.created_at DESC
    LIMIT 20
  `);

  console.log(`\n=== Order Items referencing soft-deleted items: ${softDeletedRefs.length} ===`);
  if (softDeletedRefs.length > 0) {
    console.table(softDeletedRefs);
  } else {
    console.log('No order items referencing soft-deleted items found.');
  }

  // Check overall stats
  const stats = await ds.query(`
    SELECT 
      COUNT(*) as total_order_items,
      COUNT(oi.item_id) as with_item_id,
      COUNT(*) - COUNT(oi.item_id) as null_item_id_count
    FROM "${orderItemsTable}" oi
  `);

  console.log('\n=== Overall Order Item Stats ===');
  console.table(stats);

  await ds.destroy();
}

diagnoseOrderItems().catch((err) => {
  console.error('Diagnostic failed:', err);
  process.exit(1);
});

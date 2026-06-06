import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPerformanceIndexes1750000000000 implements MigrationInterface {
  name = 'AddPerformanceIndexes1750000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Critical for mobile orders list (filtered by status + sorted by date)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cc_orders_status_created_at"
      ON "cc_orders" ("status", "created_at" DESC)
    `);

    // Critical for customer-specific order lookups
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cc_orders_customer_id"
      ON "cc_orders" ("customer_id")
    `);

    // Critical for staff/admin order lookups
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cc_orders_user_id"
      ON "cc_orders" ("user_id")
    `);

    // Critical for order detail hydration (order items)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cc_order_items_order_id"
      ON "cc_order_items" ("order_id")
    `);

    // Critical for public menu filtering
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cc_items_status_type"
      ON "cc_items" ("status", "type")
    `);

    // Critical for customer list filtering
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cc_customers_is_active"
      ON "cc_customers" ("is_active")
    `);

    // Critical for reservation lookups
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cc_reservations_customer_status_date"
      ON "cc_reservations" ("customer_id", "status", "date")
    `);

    // Critical for table availability queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cc_tables_status_location"
      ON "cc_tables" ("status", "location")
    `);

    // Index for order type filtering (reports, kitchen views)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cc_orders_order_type"
      ON "cc_orders" ("order_type")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cc_orders_status_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cc_orders_customer_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cc_orders_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cc_order_items_order_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cc_items_status_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cc_customers_is_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cc_reservations_customer_status_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cc_tables_status_location"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cc_orders_order_type"`);
  }
}

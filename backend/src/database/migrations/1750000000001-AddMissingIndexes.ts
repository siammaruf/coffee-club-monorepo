import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingIndexes1750000000001 implements MigrationInterface {
  name = 'AddMissingIndexes1750000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Index for order_id uniqueness check with soft deletes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cc_orders_order_id"
      ON "cc_orders" ("order_id")
    `);

    // Standalone created_at index for date range queries without status filter
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cc_orders_created_at"
      ON "cc_orders" ("created_at" DESC)
    `);

    // Index for expense date range queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cc_expenses_created_at"
      ON "cc_expenses" ("created_at" DESC)
    `);

    // Index for order token lookups by token string
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cc_order_tokens_token"
      ON "cc_order_tokens" ("token")
    `);

    // Index for order token lookups by order_id
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cc_order_tokens_order_id"
      ON "cc_order_tokens" ("order_id")
    `);

    // Index for order token lookups by type and date
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cc_order_tokens_type_created_at"
      ON "cc_order_tokens" ("token_type", "created_at" DESC)
    `);

    // Index for cart item lookups by cart_id
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cc_cart_items_cart_id"
      ON "cc_cart_items" ("cart_id")
    `);

    // Index for daily report date lookups
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cc_daily_reports_report_date"
      ON "cc_daily_reports" ("report_date" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cc_orders_order_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cc_orders_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cc_expenses_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cc_order_tokens_token"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cc_order_tokens_order_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cc_order_tokens_type_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cc_cart_items_cart_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cc_daily_reports_report_date"`);
  }
}

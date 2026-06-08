import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVendorAndVendorPayment1749400000000 implements MigrationInterface {
  name = 'AddVendorAndVendorPayment1749400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create vendors table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "cc_vendors" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "vendor_name" character varying NOT NULL,
        "contact_person" character varying NOT NULL,
        "vendor_type" character varying NOT NULL,
        "address" text NOT NULL,
        "mobile" character varying NOT NULL,
        "email" character varying,
        "status" character varying NOT NULL DEFAULT 'ACTIVE',
        "deleted_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cc_vendors" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_cc_vendors_vendor_name" UNIQUE ("vendor_name")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cc_vendors_status"
      ON "cc_vendors" ("status")
    `);

    // Create vendor_payments table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "cc_vendor_payments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "vendor_id" uuid NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "payment_date" date NOT NULL,
        "payment_type" character varying NOT NULL,
        "note" text,
        "screenshot_url" character varying,
        "created_by_id" uuid,
        "deleted_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cc_vendor_payments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_cc_vendor_payments_vendor"
          FOREIGN KEY ("vendor_id") REFERENCES "cc_vendors"("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cc_vendor_payments_vendor_id"
      ON "cc_vendor_payments" ("vendor_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cc_vendor_payments_payment_date"
      ON "cc_vendor_payments" ("payment_date")
    `);

    // Add vendor_id to kitchen_stock
    await queryRunner.query(`
      ALTER TABLE "cc_kitchen_stock"
      ADD COLUMN IF NOT EXISTS "vendor_id" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "cc_kitchen_stock"
      ADD CONSTRAINT "FK_cc_kitchen_stock_vendor"
      FOREIGN KEY ("vendor_id") REFERENCES "cc_vendors"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cc_kitchen_stock_vendor_id"
      ON "cc_kitchen_stock" ("vendor_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cc_kitchen_stock_vendor_id"`);
    await queryRunner.query(`ALTER TABLE "cc_kitchen_stock" DROP CONSTRAINT IF EXISTS "FK_cc_kitchen_stock_vendor"`);
    await queryRunner.query(`ALTER TABLE "cc_kitchen_stock" DROP COLUMN IF EXISTS "vendor_id"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cc_vendor_payments_payment_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cc_vendor_payments_vendor_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cc_vendor_payments"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cc_vendors_status"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cc_vendors"`);
  }
}

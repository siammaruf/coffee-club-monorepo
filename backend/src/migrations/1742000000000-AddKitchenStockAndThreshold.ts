import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddKitchenStockAndThreshold1742000000000 implements MigrationInterface {
  name = 'AddKitchenStockAndThreshold1742000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add low_stock_threshold to kitchen_items
    await queryRunner.query(`
      ALTER TABLE "kitchen_items"
      ADD COLUMN IF NOT EXISTS "low_stock_threshold" integer
    `);

    // Create kitchen_stock table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "kitchen_stock" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "kitchen_item_id" uuid NOT NULL,
        "quantity" numeric(10,2) NOT NULL,
        "purchase_price" numeric(10,2) NOT NULL,
        "purchase_date" date NOT NULL,
        "note" text,
        "deleted_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_kitchen_stock" PRIMARY KEY ("id"),
        CONSTRAINT "FK_kitchen_stock_item" FOREIGN KEY ("kitchen_item_id")
          REFERENCES "kitchen_items"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_kitchen_stock_item_id"
      ON "kitchen_stock" ("kitchen_item_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_kitchen_stock_purchase_date"
      ON "kitchen_stock" ("purchase_date")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "kitchen_stock"`);
    await queryRunner.query(`
      ALTER TABLE "kitchen_items" DROP COLUMN IF EXISTS "low_stock_threshold"
    `);
  }
}

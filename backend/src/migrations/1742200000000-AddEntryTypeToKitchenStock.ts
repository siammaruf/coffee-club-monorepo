import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEntryTypeToKitchenStock1742200000000 implements MigrationInterface {
  name = 'AddEntryTypeToKitchenStock1742200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."cc_kitchen_stock_entry_type_enum" AS ENUM('PURCHASE', 'USAGE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "cc_kitchen_stock" ADD "entry_type" "public"."cc_kitchen_stock_entry_type_enum" NOT NULL DEFAULT 'PURCHASE'`,
    );
    await queryRunner.query(
      `ALTER TABLE "cc_kitchen_stock" ADD "created_by_id" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_kitchen_stock_entry_type" ON "cc_kitchen_stock" ("entry_type")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_kitchen_stock_entry_type"`);
    await queryRunner.query(`ALTER TABLE "cc_kitchen_stock" DROP COLUMN IF EXISTS "created_by_id"`);
    await queryRunner.query(`ALTER TABLE "cc_kitchen_stock" DROP COLUMN IF EXISTS "entry_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."cc_kitchen_stock_entry_type_enum"`);
  }
}

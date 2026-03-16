import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUnitToKitchenStock1742100000000 implements MigrationInterface {
  name = 'AddUnitToKitchenStock1742100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."cc_kitchen_stock_unit_enum" AS ENUM('quantity', 'kg', 'gram')`,
    );
    await queryRunner.query(
      `ALTER TABLE "cc_kitchen_stock" ADD "unit" "public"."cc_kitchen_stock_unit_enum" NOT NULL DEFAULT 'quantity'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cc_kitchen_stock" DROP COLUMN "unit"`);
    await queryRunner.query(`DROP TYPE "public"."cc_kitchen_stock_unit_enum"`);
  }
}

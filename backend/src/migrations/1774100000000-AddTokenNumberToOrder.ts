import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTokenNumberToOrder1774100000000 implements MigrationInterface {
  name = 'AddTokenNumberToOrder1774100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cc_orders" ADD COLUMN IF NOT EXISTS "token_number" varchar NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cc_orders" DROP COLUMN IF EXISTS "token_number"`
    );
  }
}

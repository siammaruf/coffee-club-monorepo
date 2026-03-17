import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhoneVerifiedToCustomers1742301000000 implements MigrationInterface {
  name = 'AddPhoneVerifiedToCustomers1742301000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "cc_customers"
      ADD COLUMN IF NOT EXISTS "phone_verified" boolean NOT NULL DEFAULT false
    `);
    await queryRunner.query(`
      ALTER TABLE "cc_customers"
      ADD COLUMN IF NOT EXISTS "otp_sent_at" timestamp NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cc_customers" DROP COLUMN IF EXISTS "otp_sent_at"`);
    await queryRunner.query(`ALTER TABLE "cc_customers" DROP COLUMN IF EXISTS "phone_verified"`);
  }
}

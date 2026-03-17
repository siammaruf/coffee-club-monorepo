import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhoneVerifiedToUsers1742300000000 implements MigrationInterface {
  name = 'AddPhoneVerifiedToUsers1742300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cc_users" ADD COLUMN IF NOT EXISTS "phone_verified" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cc_users" DROP COLUMN IF EXISTS "phone_verified"`
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveServiceAccountFields1741920000000 implements MigrationInterface {
  name = 'RemoveServiceAccountFields1741920000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tablePrefix = process.env.DB_TABLE_PREFIX || 'cc_';
    await queryRunner.query(
      `ALTER TABLE "${tablePrefix}backup_settings" DROP COLUMN IF EXISTS "google_drive_service_account_email"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${tablePrefix}backup_settings" DROP COLUMN IF EXISTS "google_drive_private_key"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tablePrefix = process.env.DB_TABLE_PREFIX || 'cc_';
    await queryRunner.query(
      `ALTER TABLE "${tablePrefix}backup_settings" ADD COLUMN IF NOT EXISTS "google_drive_private_key" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "${tablePrefix}backup_settings" ADD COLUMN IF NOT EXISTS "google_drive_service_account_email" character varying`,
    );
  }
}

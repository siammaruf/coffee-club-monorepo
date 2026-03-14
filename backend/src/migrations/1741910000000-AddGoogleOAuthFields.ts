import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGoogleOAuthFields1741910000000 implements MigrationInterface {
  name = 'AddGoogleOAuthFields1741910000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tablePrefix = process.env.DB_TABLE_PREFIX || 'cc_';
    await queryRunner.query(
      `ALTER TABLE "${tablePrefix}backup_settings" ADD COLUMN IF NOT EXISTS "google_oauth_client_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "${tablePrefix}backup_settings" ADD COLUMN IF NOT EXISTS "google_oauth_client_secret" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "${tablePrefix}backup_settings" ADD COLUMN IF NOT EXISTS "google_oauth_refresh_token" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tablePrefix = process.env.DB_TABLE_PREFIX || 'cc_';
    await queryRunner.query(
      `ALTER TABLE "${tablePrefix}backup_settings" DROP COLUMN IF EXISTS "google_oauth_refresh_token"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${tablePrefix}backup_settings" DROP COLUMN IF EXISTS "google_oauth_client_secret"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${tablePrefix}backup_settings" DROP COLUMN IF EXISTS "google_oauth_client_id"`,
    );
  }
}

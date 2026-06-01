import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshTokenToUsers1774300000000 implements MigrationInterface {
  name = 'AddRefreshTokenToUsers1774300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tablePrefix = process.env.DB_TABLE_PREFIX || 'cc_';
    await queryRunner.query(
      `ALTER TABLE "${tablePrefix}users" ADD COLUMN IF NOT EXISTS "refresh_token" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tablePrefix = process.env.DB_TABLE_PREFIX || 'cc_';
    await queryRunner.query(
      `ALTER TABLE "${tablePrefix}users" DROP COLUMN IF EXISTS "refresh_token"`,
    );
  }
}

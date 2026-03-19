import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUploadedBackupType1773900448336 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "cc_backup_history_type_enum" ADD VALUE IF NOT EXISTS 'uploaded'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL does not support removing a value from an enum type.
    // To fully revert, the enum would need to be recreated, which is
    // destructive if rows reference 'uploaded'. Leaving as a no-op.
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddItemEnumValues1739612400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add 'simple' to item type enum
    await queryRunner.query(
      `ALTER TYPE public.cc_items_type_enum ADD VALUE IF NOT EXISTS 'simple'`,
    );

    // Add 'active' to item status enum
    await queryRunner.query(
      `ALTER TYPE public.cc_items_status_enum ADD VALUE IF NOT EXISTS 'active'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL does not support removing enum values directly.
    // To rollback, you'd need to recreate the enum type without these values.
  }
}

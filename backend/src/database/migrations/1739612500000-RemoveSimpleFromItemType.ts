import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveSimpleFromItemType1739612500000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cc_items'`,
    );
    if (!tableExists.length) {
      return;
    }

    const enumExists = await queryRunner.query(
      `SELECT 1 FROM pg_type WHERE typname = 'cc_items_type_enum'`,
    );
    if (!enumExists.length) {
      return;
    }

    // Update any existing items with type 'simple' to 'bar'
    await queryRunner.query(
      `UPDATE cc_items SET type = 'bar' WHERE type = 'simple'`,
    );

    // Drop default before altering type to avoid dependency issues when dropping the old enum
    await queryRunner.query(
      `ALTER TABLE cc_items ALTER COLUMN type DROP DEFAULT`,
    );

    // Clean up stale new enum from any previous failed run
    const newEnumExists = await queryRunner.query(
      `SELECT 1 FROM pg_type WHERE typname = 'cc_items_type_enum_new'`,
    );
    if (newEnumExists.length) {
      await queryRunner.query(`DROP TYPE public.cc_items_type_enum_new`);
    }

    // Recreate the enum without 'simple'
    await queryRunner.query(
      `CREATE TYPE public.cc_items_type_enum_new AS ENUM ('bar', 'kitchen')`,
    );
    await queryRunner.query(
      `ALTER TABLE cc_items ALTER COLUMN type TYPE public.cc_items_type_enum_new USING type::text::public.cc_items_type_enum_new`,
    );
    await queryRunner.query(`DROP TYPE public.cc_items_type_enum`);
    await queryRunner.query(
      `ALTER TYPE public.cc_items_type_enum_new RENAME TO cc_items_type_enum`,
    );

    // Re-add default
    await queryRunner.query(
      `ALTER TABLE cc_items ALTER COLUMN type SET DEFAULT 'bar'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const enumExists = await queryRunner.query(
      `SELECT 1 FROM pg_type WHERE typname = 'cc_items_type_enum'`,
    );
    if (!enumExists.length) {
      return;
    }

    // Re-add 'simple' to the enum
    await queryRunner.query(
      `ALTER TYPE public.cc_items_type_enum ADD VALUE IF NOT EXISTS 'simple'`,
    );
  }
}

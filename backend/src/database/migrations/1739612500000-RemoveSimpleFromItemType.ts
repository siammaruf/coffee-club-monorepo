import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveSimpleFromItemType1739612500000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update any existing items with type 'simple' to 'bar'
    await queryRunner.query(
      `UPDATE cc_items SET type = 'bar' WHERE type = 'simple'`,
    );

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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-add 'simple' to the enum
    await queryRunner.query(
      `ALTER TYPE public.cc_items_type_enum ADD VALUE IF NOT EXISTS 'simple'`,
    );
  }
}

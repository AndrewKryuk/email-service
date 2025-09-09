import { MigrationInterface, QueryRunner } from 'typeorm';

export class Emails1757431549661 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS emails
        (
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          to_addresses TEXT[] NOT NULL,
          subject TEXT NOT NULL,
          html TEXT NOT NULL,
          retry_count SMALLINT NOT NULL DEFAULT 0,
          status email_status NOT NULL,
          error TEXT,
          next_retry_at timestamptz,
          created_at timestamptz NOT NULL DEFAULT NOW(),
          updated_at timestamptz NOT NULL DEFAULT NOW(),
          deleted_at timestamptz
        );

        CREATE INDEX idx_emails_failed_retry
          ON emails (status, retry_count, next_retry_at, created_at)
          WHERE status = 'failed' AND deleted_at IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS emails`);
  }
}

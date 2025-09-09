import { MigrationInterface, QueryRunner } from 'typeorm';

export class EmailsOutbox1757431549661 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS emails_outbox
        (
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          to_addresses TEXT[] NOT NULL,
          subject TEXT NOT NULL,
          html TEXT NOT NULL,
          retry_count SMALLINT NOT NULL DEFAULT 0,
          status email_outbox_status NOT NULL,
          error TEXT,
          next_retry_at timestamptz,
          locked_at timestamptz,
          created_at timestamptz NOT NULL DEFAULT NOW(),
          updated_at timestamptz NOT NULL DEFAULT NOW(),
          deleted_at timestamptz
        );

        CREATE INDEX idx_emails_outbox_failed_retry
          ON emails_outbox (status, retry_count, next_retry_at, created_at)
          WHERE status = 'failed' AND deleted_at IS NULL;

        CREATE INDEX idx_emails_outbox_processing_locked
          ON emails_outbox (status, locked_at, created_at)
          WHERE status = 'processing' AND deleted_at IS NULL;

        CREATE INDEX idx_emails_outbox_sent_updated
          ON emails_outbox (status, updated_at, created_at)
          WHERE status = 'sent' AND deleted_at IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS emails_outbox`);
  }
}

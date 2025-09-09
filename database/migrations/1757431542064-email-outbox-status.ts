import { MigrationInterface, QueryRunner } from 'typeorm';

export class EmailOutboxStatus1757431542064 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE email_outbox_status AS ENUM ('processing', 'sent', 'failed', 'max_retries_exceeded');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TYPE email_outbox_status;`);
  }
}

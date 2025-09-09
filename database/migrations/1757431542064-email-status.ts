import { MigrationInterface, QueryRunner } from 'typeorm';

export class EmailStatus1757431542064 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE email_status AS ENUM ('sent', 'failed');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TYPE email_status;`);
  }
}

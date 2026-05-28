import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateFavoriteLocations1713715200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'favorite_locations',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'user_id', type: 'int', isNullable: false },
          { name: 'name', type: 'varchar', length: '50', isNullable: false, comment: '地点名称' },
          { name: 'address', type: 'varchar', length: '200', isNullable: false, comment: '详细地址' },
          { name: 'latitude', type: 'decimal', precision: 10, scale: 7, isNullable: true, comment: '纬度' },
          { name: 'longitude', type: 'decimal', precision: 10, scale: 7, isNullable: true, comment: '经度' },
          { name: 'use_count', type: 'int', default: 0, comment: '使用次数' },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'favorite_locations',
      new TableIndex({ name: 'idx_fav_user_id', columnNames: ['user_id'] }),
    );

    await queryRunner.createIndex(
      'favorite_locations',
      new TableIndex({ name: 'idx_fav_use_count', columnNames: ['user_id', 'use_count'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('favorite_locations');
  }
}

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'absensis'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('pegawai_id').unsigned().notNullable()
      table.foreign('pegawai_id').references('id').inTable('pegawais').onDelete('CASCADE')
      table.date('tanggal').notNullable()
      table.enum('status', ['hadir', 'izin', 'sakit', 'alfa']).notNullable().defaultTo('hadir')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

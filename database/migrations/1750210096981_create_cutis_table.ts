import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cutis'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('pegawai_id').unsigned().notNullable()
      table.foreign('pegawai_id').references('id').inTable('pegawais').onDelete('CASCADE')
      table.date('tanggal_mulai').notNullable()
      table.date('tanggal_akhir').notNullable()
      table.string('alasan', 255).notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

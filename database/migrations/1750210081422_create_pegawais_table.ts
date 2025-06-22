import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pegawais'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nip', 20).notNullable().unique()
      table.string('nama', 255).notNullable()
      table.decimal('gaji', 15, 2).unsigned().notNullable()
      table.integer('unit_kerja_id').unsigned().notNullable()
      table.foreign('unit_kerja_id').references('id').inTable('unit_kerjas').onDelete('CASCADE')
      table.integer('jabatan_id').unsigned().notNullable()
      table.foreign('jabatan_id').references('id').inTable('jabatans').onDelete('CASCADE')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

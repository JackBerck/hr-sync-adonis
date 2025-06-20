import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import UnitKerja from './unit_kerja.js'
import Jabatan from './jabatan.js'
import Absensi from './absensi.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

export default class Pegawai extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nip: string

  @column()
  declare nama: string

  @column({ columnName: 'unit_kerja_id' })
  declare unitKerjaId: number

  @column({ columnName: 'jabatan_id' })
  declare jabatanId: number

  @belongsTo(() => UnitKerja, {
    foreignKey: 'unitKerjaId',
    localKey: 'id',
  })
  declare unitKerja: BelongsTo<typeof UnitKerja>

  @belongsTo(() => Jabatan, {
    foreignKey: 'jabatanId',
    localKey: 'id',
  })
  declare jabatan: BelongsTo<typeof Jabatan>

  @hasMany(() => Absensi, {
    foreignKey: 'pegawaiId',
    localKey: 'id',
  })
  declare absensis: HasMany<typeof Absensi>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}

import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Pegawai from './pegawai.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Absensi extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'pegawai_id' })
  declare pegawaiId: number

  @belongsTo(() => Pegawai, {
    foreignKey: 'pegawaiId',
    localKey: 'id',
  })
  declare pegawai: BelongsTo<typeof Pegawai>

  @column()
  declare tanggal: Date

  @column()
  declare status: 'hadir' | 'izin' | 'sakit' | 'alfa'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}

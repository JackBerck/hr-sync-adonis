import Cuti from '#models/cuti'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Cuti.createMany([
      {
        pegawaiId: 1,
        tanggalMulai: new Date('2024-01-15'),
        tanggalAkhir: new Date('2024-01-17'),
        alasan: 'Liburan keluarga',
      },
      {
        pegawaiId: 2,
        tanggalMulai: new Date('2024-02-10'),
        tanggalAkhir: new Date('2024-02-12'),
        alasan: 'Keperluan pribadi',
      },
      {
        pegawaiId: 3,
        tanggalMulai: new Date('2024-03-05'),
        tanggalAkhir: new Date('2024-03-08'),
        alasan: 'Sakit',
      },
      {
        pegawaiId: 1,
        tanggalMulai: new Date('2024-04-20'),
        tanggalAkhir: new Date('2024-04-22'),
        alasan: 'Mudik lebaran',
      },
      {
        pegawaiId: 4,
        tanggalMulai: new Date('2024-05-01'),
        tanggalAkhir: new Date('2024-05-03'),
        alasan: 'Cuti tahunan',
      },
      {
        pegawaiId: 2,
        tanggalMulai: new Date('2024-06-10'),
        tanggalAkhir: new Date('2024-06-12'),
        alasan: 'Acara keluarga',
      },
      {
        pegawaiId: 3,
        tanggalMulai: new Date('2024-07-15'),
        tanggalAkhir: new Date('2024-07-17'),
        alasan: 'Pendidikan',
      },
      {
        pegawaiId: 4,
        tanggalMulai: new Date('2024-08-20'),
        tanggalAkhir: new Date('2024-08-22'),
        alasan: 'Cuti sakit',
      },
      {
        pegawaiId: 1,
        tanggalMulai: new Date('2024-09-10'),
        tanggalAkhir: new Date('2024-09-12'),
        alasan: 'Cuti pribadi',
      },
      {
        pegawaiId: 2,
        tanggalMulai: new Date('2024-10-05'),
        tanggalAkhir: new Date('2024-10-07'),
        alasan: 'Liburan akhir tahun',
      },
      {
        pegawaiId: 3,
        tanggalMulai: new Date('2024-11-15'),
        tanggalAkhir: new Date('2024-11-17'),
        alasan: 'Cuti keluarga',
      },
    ])
  }
}

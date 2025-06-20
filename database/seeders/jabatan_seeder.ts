import Jabatan from '#models/jabatan'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Jabatan.createMany([
      { nama_jabatan: 'Manager', tunjangan: 5000000 },
      { nama_jabatan: 'Supervisor', tunjangan: 3000000 },
      { nama_jabatan: 'Staff', tunjangan: 2000000 },
      { nama_jabatan: 'Intern', tunjangan: 1000000 },
      { nama_jabatan: 'Direktur', tunjangan: 10000000 },
      { nama_jabatan: 'HRD', tunjangan: 4000000 },
      { nama_jabatan: 'IT Support', tunjangan: 2500000 },
      { nama_jabatan: 'Akuntan', tunjangan: 3500000 },
      { nama_jabatan: 'Marketing', tunjangan: 3000000 },
      { nama_jabatan: 'Sales', tunjangan: 3000000 },
      { nama_jabatan: 'Customer Service', tunjangan: 2000000 },
      { nama_jabatan: 'Quality Control', tunjangan: 2500000 },
      { nama_jabatan: 'Logistik', tunjangan: 2000000 },
      { nama_jabatan: 'Produksi', tunjangan: 2500000 },
      { nama_jabatan: 'R&D', tunjangan: 4000000 },
      { nama_jabatan: 'Legal', tunjangan: 3000000 },
      { nama_jabatan: 'Business Analyst', tunjangan: 3500000 },
    ])
  }
}

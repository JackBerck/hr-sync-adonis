import Pegawai from '#models/pegawai'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Pegawai.createMany([
      {
        nama: 'John Doe',
        nip: '1234567890',
        unitKerjaId: 1,
        jabatanId: 1,
        gaji: 5000000,
      },
      {
        nama: 'Jane Smith',
        nip: '0987654321',
        unitKerjaId: 2,
        jabatanId: 2,
        gaji: 6000000,
      },
      { nama: 'Alice Johnson', nip: '1122334455', unitKerjaId: 1, jabatanId: 3, gaji: 4500000 },
      { nama: 'Bob Brown', nip: '5566778899', unitKerjaId: 2, jabatanId: 4, gaji: 7000000 },
      { nama: 'Charlie White', nip: '2233445566', unitKerjaId: 3, jabatanId: 1, gaji: 5200000 },
      { nama: 'Diana Green', nip: '6677889900', unitKerjaId: 3, jabatanId: 2, gaji: 5800000 },
      { nama: 'Ethan Blue', nip: '3344556677', unitKerjaId: 4, jabatanId: 3, gaji: 4800000 },
      { nama: 'Fiona Yellow', nip: '7788990011', unitKerjaId: 4, jabatanId: 4, gaji: 6500000 },
      { nama: 'George Black', nip: '4455667788', unitKerjaId: 5, jabatanId: 1, gaji: 5300000 },
      { nama: 'Hannah Purple', nip: '9900112233', unitKerjaId: 5, jabatanId: 2, gaji: 5900000 },
      { nama: 'Ian Orange', nip: '5566778891', unitKerjaId: 6, jabatanId: 3, gaji: 4700000 },
      { nama: 'Julia Pink', nip: '2233445567', unitKerjaId: 6, jabatanId: 4, gaji: 6800000 },
      { nama: 'Kevin Gray', nip: '6677889902', unitKerjaId: 7, jabatanId: 1, gaji: 5400000 },
      { nama: 'Laura Cyan', nip: '3344556678', unitKerjaId: 7, jabatanId: 2, gaji: 6100000 },
      { nama: 'Mike Magenta', nip: '7788990012', unitKerjaId: 8, jabatanId: 3, gaji: 4900000 },
      { nama: 'Nina Brown', nip: '4455667789', unitKerjaId: 8, jabatanId: 4, gaji: 7200000 },
    ])
  }
}

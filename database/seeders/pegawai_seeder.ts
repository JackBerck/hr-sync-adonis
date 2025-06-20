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
      },
      {
        nama: 'Jane Smith',
        nip: '0987654321',
        unitKerjaId: 2,
        jabatanId: 2,
      },
      { nama: 'Alice Johnson', nip: '1122334455', unitKerjaId: 1, jabatanId: 3 },
      { nama: 'Bob Brown', nip: '5566778899', unitKerjaId: 2, jabatanId: 4 },
      { nama: 'Charlie White', nip: '2233445566', unitKerjaId: 3, jabatanId: 1 },
      { nama: 'Diana Green', nip: '6677889900', unitKerjaId: 3, jabatanId: 2 },
      { nama: 'Ethan Blue', nip: '3344556677', unitKerjaId: 4, jabatanId: 3 },
      { nama: 'Fiona Yellow', nip: '7788990011', unitKerjaId: 4, jabatanId: 4 },
      { nama: 'George Black', nip: '4455667788', unitKerjaId: 5, jabatanId: 1 },
      { nama: 'Hannah Purple', nip: '9900112233', unitKerjaId: 5, jabatanId: 2 },
      { nama: 'Ian Orange', nip: '5566778891', unitKerjaId: 6, jabatanId: 3 },
      { nama: 'Julia Pink', nip: '2233445567', unitKerjaId: 6, jabatanId: 4 },
      { nama: 'Kevin Gray', nip: '6677889902', unitKerjaId: 7, jabatanId: 1 },
      { nama: 'Laura Cyan', nip: '3344556678', unitKerjaId: 7, jabatanId: 2 },
      { nama: 'Mike Magenta', nip: '7788990012', unitKerjaId: 8, jabatanId: 3 },
      { nama: 'Nina Brown', nip: '4455667789', unitKerjaId: 8, jabatanId: 4 },
    ])
  }
}

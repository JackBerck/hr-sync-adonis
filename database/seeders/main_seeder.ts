import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  private async runSeeder(Seeder: { default: typeof BaseSeeder }) {
    await new Seeder.default(this.client).run()
  }
  async run() {
    await this.runSeeder(await import('./jabatan_seeder.ts'))
    await this.runSeeder(await import('./unit_kerja_seeder.ts'))
    await this.runSeeder(await import('./pegawai_seeder.ts'))
    await this.runSeeder(await import('./cuti_seeder.ts'))
  }
}

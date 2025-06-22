import type { HttpContext } from '@adonisjs/core/http'
import Pegawai from '#models/pegawai'
import UnitKerja from '#models/unit_kerja'
import Jabatan from '#models/jabatan'

export default class PegawaisController {
  async index({ view, response, request }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const search = request.input('search', '')
      const unitKerjaId = request.input('unit_kerja_id', '')
      const jabatanId = request.input('jabatan_id', '')

      let query = Pegawai.query().preload('unitKerja').preload('jabatan').orderBy('nama', 'asc')

      if (search) {
        query = query.where((builder) => {
          builder.where('nama', 'LIKE', `%${search}%`).orWhere('nip', 'LIKE', `%${search}%`)
        })
      }

      if (unitKerjaId && unitKerjaId !== '') {
        query = query.where('unit_kerja_id', Number.parseInt(unitKerjaId))
      }

      if (jabatanId && jabatanId !== '') {
        query = query.where('jabatan_id', Number.parseInt(jabatanId))
      }

      const pegawais = await query.paginate(page, 10)

      const unitKerjas = await UnitKerja.query().orderBy('nama_unit', 'asc')
      const jabatans = await Jabatan.query().orderBy('nama_jabatan', 'asc')

      return view.render('pages/pegawai/index', {
        pegawais,
        unitKerjas,
        jabatans,
      })
    } catch (error) {
      console.error('Error in index:', error)
      return response.status(500).json({ error: 'Gagal mengambil data pegawai' })
    }
  }

  async create({ view, response }: HttpContext) {
    try {
      // Get all unit kerja and jabatan for form dropdowns
      const unitKerjas = await UnitKerja.query().orderBy('nama_unit', 'asc')
      const jabatans = await Jabatan.query().orderBy('nama_jabatan', 'asc')

      return view.render('pages/pegawai/create', {
        unitKerjas,
        jabatans,
      })
    } catch (error) {
      console.error('Error in create:', error)
      return response.status(500).json({ error: 'Gagal memuat halaman tambah pegawai' })
    }
  }

  async store({ request, response, session }: HttpContext) {
    try {
      const data = request.only(['nip', 'nama', 'gaji', 'unit_kerja_id', 'jabatan_id'])

      // Validasi manual
      if (!data.nip || data.nip.trim() === '') {
        session.flash('error', 'NIP tidak boleh kosong')
        return response.redirect().back()
      }

      if (!data.nama || data.nama.trim() === '') {
        session.flash('error', 'Nama pegawai tidak boleh kosong')
        return response.redirect().back()
      }

      if (!data.gaji || Number.isNaN(Number(data.gaji)) || data.gaji <= 0) {
        session.flash('error', 'Gaji harus diisi dengan angka yang valid')
        return response.redirect().back()
      }

      if (!data.unit_kerja_id || Number.isNaN(Number(data.unit_kerja_id))) {
        session.flash('error', 'Unit kerja harus dipilih')
        return response.redirect().back()
      }

      if (!data.jabatan_id || Number.isNaN(Number(data.jabatan_id))) {
        session.flash('error', 'Jabatan harus dipilih')
        return response.redirect().back()
      }

      // Check if NIP already exists
      const existingPegawai = await Pegawai.query().where('nip', data.nip).first()
      if (existingPegawai) {
        session.flash('error', 'NIP sudah digunakan oleh pegawai lain')
        return response.redirect().back()
      }

      // Convert IDs to number
      data.unit_kerja_id = Number(data.unit_kerja_id)
      data.jabatan_id = Number(data.jabatan_id)

      // Verify that unit kerja and jabatan exist
      const unitKerja = await UnitKerja.find(data.unit_kerja_id)
      const jabatan = await Jabatan.find(data.jabatan_id)

      if (!unitKerja) {
        session.flash('error', 'Unit kerja tidak ditemukan')
        return response.redirect().back()
      }

      if (!jabatan) {
        session.flash('error', 'Jabatan tidak ditemukan')
        return response.redirect().back()
      }

      await Pegawai.create(data)

      session.flash('success', 'Pegawai berhasil ditambahkan')
      return response.redirect().toPath('/pegawai')
    } catch (error) {
      console.error('Error in store:', error)
      session.flash('error', 'Gagal membuat data pegawai')
      return response.redirect().back()
    }
  }

  async show({ params, view, response }: HttpContext) {
    try {
      const pegawai = await Pegawai.query()
        .where('id', params.id)
        .preload('unitKerja')
        .preload('jabatan')
        .firstOrFail()

      return view.render('pages/pegawai/show', { pegawai })
    } catch (error) {
      console.error('Error in show:', error)
      return response.status(404).json({ error: 'Pegawai tidak ditemukan' })
    }
  }

  async edit({ params, view, response }: HttpContext) {
    try {
      const pegawai = await Pegawai.query()
        .where('id', params.id)
        .preload('unitKerja')
        .preload('jabatan')
        .firstOrFail()

      // Get all unit kerja and jabatan for form dropdowns
      const unitKerjas = await UnitKerja.query().orderBy('nama_unit', 'asc')
      const jabatans = await Jabatan.query().orderBy('nama_jabatan', 'asc')

      return view.render('pages/pegawai/edit', {
        pegawai,
        unitKerjas,
        jabatans,
      })
    } catch (error) {
      console.error('Error in edit:', error)
      return response.status(404).json({ error: 'Pegawai tidak ditemukan' })
    }
  }

  async update({ params, request, response, session }: HttpContext) {
    try {
      const pegawai = await Pegawai.findOrFail(params.id)
      const data = request.only(['nip', 'nama', 'unit_kerja_id', 'jabatan_id'])

      // Validasi
      if (!data.nip || data.nip.trim() === '') {
        session.flash('error', 'NIP tidak boleh kosong')
        return response.redirect().back()
      }

      if (!data.nama || data.nama.trim() === '') {
        session.flash('error', 'Nama pegawai tidak boleh kosong')
        return response.redirect().back()
      }

      if (!data.unit_kerja_id || Number.isNaN(Number(data.unit_kerja_id))) {
        session.flash('error', 'Unit kerja harus dipilih')
        return response.redirect().back()
      }

      if (!data.jabatan_id || Number.isNaN(Number(data.jabatan_id))) {
        session.flash('error', 'Jabatan harus dipilih')
        return response.redirect().back()
      }

      // Check if NIP already exists (except current pegawai)
      const existingPegawai = await Pegawai.query()
        .where('nip', data.nip)
        .whereNot('id', params.id)
        .first()

      if (existingPegawai) {
        session.flash('error', 'NIP sudah digunakan oleh pegawai lain')
        return response.redirect().back()
      }

      // Convert IDs to number
      data.unit_kerja_id = Number(data.unit_kerja_id)
      data.jabatan_id = Number(data.jabatan_id)

      // Verify that unit kerja and jabatan exist
      const unitKerja = await UnitKerja.find(data.unit_kerja_id)
      const jabatan = await Jabatan.find(data.jabatan_id)

      if (!unitKerja) {
        session.flash('error', 'Unit kerja tidak ditemukan')
        return response.redirect().back()
      }

      if (!jabatan) {
        session.flash('error', 'Jabatan tidak ditemukan')
        return response.redirect().back()
      }

      pegawai.merge(data)
      await pegawai.save()

      session.flash('success', 'Pegawai berhasil diperbarui')
      return response.redirect().toPath('/pegawai')
    } catch (error) {
      console.error('Error in update:', error)
      session.flash('error', 'Gagal memperbarui data pegawai')
      return response.redirect().back()
    }
  }

  async destroy({ params, response, session }: HttpContext) {
    try {
      const pegawai = await Pegawai.findOrFail(params.id)
      await pegawai.delete()

      session.flash('success', 'Pegawai berhasil dihapus')
      return response.redirect().toPath('/pegawai')
    } catch (error) {
      console.error('Error in destroy:', error)
      session.flash('error', 'Gagal menghapus data pegawai: ' + error.message)
      return response.redirect().back()
    }
  }
}

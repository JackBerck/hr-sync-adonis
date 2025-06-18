import type { HttpContext } from '@adonisjs/core/http'
import UnitKerja from '#models/unit_kerja'

export default class UnitKerjasController {
  async index({ view, response, request }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const search = request.input('search', '')

      let query = UnitKerja.query().orderBy('nama_unit', 'asc')

      // Add search functionality
      if (search) {
        query = query
          .where('nama_unit', 'LIKE', `%${search}%`)
          .orWhere('lokasi', 'LIKE', `%${search}%`)
      }

      const unitKerjas = await query.paginate(page, 10)

      return view.render('pages/unit-kerja/index', {
        unitKerjas,
      })
    } catch (error) {
      return response.status(500).json({ error: 'Gagal mengambil data unit kerja' })
    }
  }

  async create({ view }: HttpContext) {
    return view.render('pages/unit-kerja/create')
  }

  async store({ request, response, session }: HttpContext) {
    try {
      const data = request.only(['nama_unit', 'lokasi'])

      // Validasi manual
      if (!data.nama_unit || data.nama_unit.trim() === '') {
        session.flash('error', 'Nama unit kerja tidak boleh kosong')
        return response.redirect().back()
      }

      if (!data.lokasi || data.lokasi.trim() === '') {
        session.flash('error', 'Lokasi tidak boleh kosong')
        return response.redirect().back()
      }

      await UnitKerja.create(data)

      session.flash('success', 'Unit kerja berhasil ditambahkan')
      return response.redirect().toPath('/unit-kerja')
    } catch (error) {
      session.flash('error', 'Gagal membuat data unit kerja')
      return response.redirect().back()
    }
  }

  async show({ params, view }: HttpContext) {
    try {
      const unitKerja = await UnitKerja.findOrFail(params.id)
      return view.render('pages/unit-kerja/show', { unitKerja })
    } catch (error) {
      return response.status(404).json({ error: 'Unit kerja tidak ditemukan' })
    }
  }

  async edit({ params, view, response }: HttpContext) {
    try {
      const unitKerja = await UnitKerja.findOrFail(params.id)
      return view.render('pages/unit-kerja/edit', { unitKerja })
    } catch (error) {
      return response.status(404).json({ error: 'Unit kerja tidak ditemukan' })
    }
  }

  async update({ params, request, response, session }: HttpContext) {
    try {
      const unitKerja = await UnitKerja.findOrFail(params.id)
      const data = request.only(['nama_unit', 'lokasi'])

      // Validasi
      if (!data.nama_unit || data.nama_unit.trim() === '') {
        session.flash('error', 'Nama unit kerja tidak boleh kosong')
        return response.redirect().back()
      }

      if (!data.lokasi || data.lokasi.trim() === '') {
        session.flash('error', 'Lokasi tidak boleh kosong')
        return response.redirect().back()
      }

      unitKerja.merge(data)
      await unitKerja.save()

      session.flash('success', 'Unit kerja berhasil diperbarui')
      return response.redirect().toPath('/unit-kerja')
    } catch (error) {
      session.flash('error', 'Gagal memperbarui data unit kerja')
      return response.redirect().back()
    }
  }

  async destroy({ params, response, session }: HttpContext) {
    try {
      const unitKerja = await UnitKerja.findOrFail(params.id)
      await unitKerja.delete()

      session.flash('success', 'Unit kerja berhasil dihapus')
      return response.redirect().toPath('/unit-kerja')
    } catch (error) {
      session.flash('error', 'Gagal menghapus data unit kerja: ' + error.message)
      return response.redirect().back()
    }
  }
}

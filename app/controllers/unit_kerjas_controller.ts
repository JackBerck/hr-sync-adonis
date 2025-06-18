import type { HttpContext } from '@adonisjs/core/http'
import UnitKerja from '#models/unit_kerja'

export default class UnitKerjasController {
  async index({ view, response, request }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 10)

      const unitKerjas = await UnitKerja.query().orderBy('nama_unit', 'asc').paginate(page, limit)

      // Serialize pagination data
      const paginatedData = unitKerjas.serialize()

      return view.render('pages/unit-kerjas/index', {
        unitKerjas: paginatedData,
      })
    } catch (error) {
      console.error('Error fetching unit kerjas:', error)
      return response.status(500).json({ error: 'Gagal mengambil data unit kerja' })
    }
  }

  async create({ view }: HttpContext) {
    return view.render('pages/unit-kerjas/create')
  }

  async store({ request, response, session }: HttpContext) {
    try {
      const data = request.only(['nama_unit', 'lokasi'])
      await UnitKerja.create(data)

      session.flash('success', 'Unit kerja berhasil dibuat')
      return response.redirect('/unit-kerjas')
    } catch (error) {
      console.error('Error creating unit kerja:', error)
      session.flash('error', 'Gagal membuat data unit kerja')
      return response.redirect().back()
    }
  }

  async edit({ params, view, response }: HttpContext) {
    try {
      const unitKerja = await UnitKerja.findOrFail(params.id)
      return view.render('pages/unit-kerjas/edit', { unitKerja })
    } catch (error) {
      console.error('Error fetching unit kerja:', error)
      return response.status(404).json({ error: 'Unit kerja tidak ditemukan' })
    }
  }

  async update({ params, request, response, session }: HttpContext) {
    try {
      const unitKerja = await UnitKerja.findOrFail(params.id)
      const data = request.only(['nama_unit', 'lokasi'])
      unitKerja.merge(data)
      await unitKerja.save()

      session.flash('success', 'Unit kerja berhasil diperbarui')
      return response.redirect('/unit-kerjas')
    } catch (error) {
      console.error('Error updating unit kerja:', error)
      session.flash('error', 'Gagal memperbarui data unit kerja')
      return response.redirect().back()
    }
  }

  async destroy({ params, response, session }: HttpContext) {
    try {
      const unitKerja = await UnitKerja.findOrFail(params.id)
      await unitKerja.delete()

      session.flash('success', 'Unit kerja berhasil dihapus')
      return response.redirect('/unit-kerjas')
    } catch (error) {
      console.error('Error deleting unit kerja:', error)
      session.flash('error', 'Gagal menghapus data unit kerja')
      return response.redirect().back()
    }
  }
}

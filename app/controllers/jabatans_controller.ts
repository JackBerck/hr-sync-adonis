import Jabatan from '#models/jabatan'
import Pegawai from '#models/pegawai'
import type { HttpContext } from '@adonisjs/core/http'

export default class JabatansController {
  async index({ view, request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const search = request.input('search', '')

      let query = Jabatan.query().orderBy('nama_jabatan', 'asc')

      if (search) {
        query = query.where('nama_jabatan', 'LIKE', `%${search}%`)
      }

      const jabatans = await query.paginate(page, 10)

      return view.render('pages/jabatan/index', {
        jabatans,
      })
    } catch (error) {
      return response.status(500).json({ error: 'Gagal mengambil data jabatan' })
    }
  }

  async create({ view }: HttpContext) {
    return view.render('pages/jabatan/create')
  }

  async store({ request, response, session }: HttpContext) {
    try {
      const data = request.only(['nama_jabatan', 'tunjangan'])

      // Validasi manual
      if (!data.nama_jabatan || data.nama_jabatan.trim() === '') {
        session.flash('error', 'Nama jabatan tidak boleh kosong')
        return response.redirect().back()
      }

      if (!data.tunjangan || Number.isNaN(Number(data.tunjangan))) {
        session.flash('error', 'Tunjangan harus berupa angka')
        return response.redirect().back()
      }

      // Convert tunjangan ke number
      data.tunjangan = Number(data.tunjangan)

      await Jabatan.create(data)

      session.flash('success', 'Jabatan berhasil ditambahkan')
      return response.redirect().toPath('/jabatan')
    } catch (error) {
      session.flash('error', 'Gagal membuat data jabatan')
      return response.redirect().back()
    }
  }

  async show({ params, view }: HttpContext) {
    const jabatan = await Jabatan.findOrFail(params.id)

    const result = await Pegawai.query()
      .where('jabatan_id', jabatan.id)
      .count('* as total')
      .pojo<{ total: number }>() // <-- INI KUNCINYA

    const totalPegawai = result.length > 0 ? result[0].total : 0

    return view.render('pages/jabatan/show', { jabatan, totalPegawai })
  }

  async edit({ params, view }: HttpContext) {
    const jabatan = await Jabatan.findOrFail(params.id)
    return view.render('pages/jabatan/edit', { jabatan })
  }

  async update({ params, request, response, session }: HttpContext) {
    try {
      const jabatan = await Jabatan.findOrFail(params.id)
      const data = request.only(['nama_jabatan', 'tunjangan'])

      // Validasi
      if (!data.nama_jabatan || data.nama_jabatan.trim() === '') {
        session.flash('error', 'Nama jabatan tidak boleh kosong')
        return response.redirect().back()
      }

      if (!data.tunjangan || Number.isNaN(Number(data.tunjangan))) {
        session.flash('error', 'Tunjangan harus berupa angka')
        return response.redirect().back()
      }

      data.tunjangan = Number(data.tunjangan)

      jabatan.merge(data)
      await jabatan.save()

      session.flash('success', 'Jabatan berhasil diperbarui')
      return response.redirect().toPath('/jabatan')
    } catch (error) {
      session.flash('error', 'Gagal memperbarui data jabatan')
      return response.redirect().back()
    }
  }

  async destroy({ params, response, session }: HttpContext) {
    try {
      const jabatan = await Jabatan.findOrFail(params.id)
      await jabatan.delete()

      session.flash('success', 'Jabatan berhasil dihapus')
      return response.redirect().toPath('/jabatan')
    } catch (error) {
      session.flash('error', 'Gagal menghapus data jabatan: ' + error.message)
      return response.redirect().back()
    }
  }
}

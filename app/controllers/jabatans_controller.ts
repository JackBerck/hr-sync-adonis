import Jabatan from '#models/jabatan'
import Pegawai from '#models/pegawai'
import type { HttpContext } from '@adonisjs/core/http'
import { createJabatanValidator, updateJabatanValidator } from '#validators/jabatan'

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
      // ✅ Menggunakan validator untuk validasi data
      const data = await request.validateUsing(createJabatanValidator)

      await Jabatan.create(data)

      session.flash('success', 'Jabatan berhasil ditambahkan')
      return response.redirect().toPath('/jabatan')
    } catch (error) {
      // ✅ Handle validation errors
      if (error.messages) {
        // Jika ada validation errors, flash ke session
        session.flash('errors', error.messages)
        session.flash('error', 'Data yang dimasukkan tidak valid')
      } else {
        session.flash('error', 'Gagal membuat data jabatan')
      }
      return response.redirect().back()
    }
  }

  async show({ params, view }: HttpContext) {
    const jabatan = await Jabatan.findOrFail(params.id)

    const result = await Pegawai.query()
      .where('jabatan_id', jabatan.id)
      .count('* as total')
      .pojo<{ total: number }>()

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

      // ✅ Menggunakan validator untuk validasi data update
      const data = await request.validateUsing(updateJabatanValidator)

      jabatan.merge(data)
      await jabatan.save()

      session.flash('success', 'Jabatan berhasil diperbarui')
      return response.redirect().toPath('/jabatan')
    } catch (error) {
      // ✅ Handle validation errors
      if (error.messages) {
        session.flash('errors', error.messages)
        session.flash('error', 'Data yang dimasukkan tidak valid')
      } else {
        session.flash('error', 'Gagal memperbarui data jabatan')
      }
      return response.redirect().back()
    }
  }

  async destroy({ params, response, session }: HttpContext) {
    try {
      const jabatan = await Jabatan.findOrFail(params.id)

      // ✅ Cek apakah jabatan masih digunakan oleh pegawai
      const pegawaiCount = await Pegawai.query()
        .where('jabatan_id', jabatan.id)
        .count('* as total')
        .pojo<{ total: number }>()

      const totalPegawai = pegawaiCount.length > 0 ? pegawaiCount[0].total : 0

      if (totalPegawai > 0) {
        session.flash(
          'error',
          `Tidak dapat menghapus jabatan karena masih digunakan oleh ${totalPegawai} pegawai`
        )
        return response.redirect().back()
      }

      await jabatan.delete()

      session.flash('success', 'Jabatan berhasil dihapus')
      return response.redirect().toPath('/jabatan')
    } catch (error) {
      session.flash('error', 'Gagal menghapus data jabatan: ' + error.message)
      return response.redirect().back()
    }
  }
}

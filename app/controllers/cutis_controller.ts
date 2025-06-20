import type { HttpContext } from '@adonisjs/core/http'
import Cuti from '#models/cuti'
import Pegawai from '#models/pegawai'
import { DateTime } from 'luxon'

export default class CutisController {
  async index({ view, response, request }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const search = request.input('search', '')
      const pegawaiId = request.input('pegawai_id', '')
      const tahun = request.input('tahun', '')

      let query = Cuti.query()
        .preload('pegawai', (pegawaiQuery) => {
          pegawaiQuery.preload('unitKerja').preload('jabatan')
        })
        .orderBy('tanggal_mulai', 'desc')

      // Add search functionality (NIP or nama pegawai)
      if (search) {
        query = query.whereHas('pegawai', (pegawaiQuery) => {
          pegawaiQuery.where('nama', 'LIKE', `%${search}%`).orWhere('nip', 'LIKE', `%${search}%`)
        })
      }

      // Filter by pegawai
      if (pegawaiId && pegawaiId !== '') {
        query = query.where('pegawai_id', Number.parseInt(pegawaiId))
      }

      // Filter by tahun
      if (tahun && tahun !== '') {
        const startOfYear = DateTime.fromObject({
          year: Number.parseInt(tahun),
          month: 1,
          day: 1,
        }).toJSDate()
        const endOfYear = DateTime.fromObject({
          year: Number.parseInt(tahun),
          month: 12,
          day: 31,
        }).toJSDate()
        query = query.whereBetween('tanggal_mulai', [startOfYear, endOfYear])
      }

      const cutis = await query.paginate(page, 10)

      // Transform cutis data with calculated fields
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const transformedCutis = cutis.all().map((cuti) => {
        const tanggalMulai = new Date(cuti.tanggalMulai)
        const tanggalAkhir = new Date(cuti.tanggalAkhir)

        const duration =
          Math.ceil((tanggalAkhir.getTime() - tanggalMulai.getTime()) / (1000 * 60 * 60 * 24)) + 1

        const isUpcoming = tanggalMulai > today
        const isOngoing = tanggalMulai <= today && tanggalAkhir >= today
        const isCompleted = tanggalAkhir < today

        return {
          id: cuti.id,
          pegawaiId: cuti.pegawaiId,
          tanggalMulai: cuti.tanggalMulai,
          tanggalAkhir: cuti.tanggalAkhir,
          alasan: cuti.alasan,
          createdAt: cuti.createdAt,
          updatedAt: cuti.updatedAt,
          duration,
          isUpcoming,
          isOngoing,
          isCompleted,
          tanggalMulaiFormatted: tanggalMulai.toISOString(),
          tanggalAkhirFormatted: tanggalAkhir.toISOString(),
          pegawai: {
            id: cuti.pegawai.id,
            nama: cuti.pegawai.nama,
            nip: cuti.pegawai.nip,
            jabatan: {
              id: cuti.pegawai.jabatan?.id || null,
              nama_jabatan: cuti.pegawai.jabatan?.nama_jabatan || 'Tidak ada jabatan',
            },
            unitKerja: {
              id: cuti.pegawai.unitKerja?.id || null,
              nama_unit: cuti.pegawai.unitKerja?.nama_unit || 'Tidak ada unit kerja',
            },
          },
        }
      })

      // Get all pegawai for filter dropdown
      const pegawais = await Pegawai.query()
        .preload('unitKerja')
        .preload('jabatan')
        .orderBy('nama', 'asc')

      // Get available years from existing cuti data
      const existingCutis = await Cuti.query().orderBy('tanggal_mulai', 'desc')
      const availableYears = [
        ...new Set(existingCutis.map((cuti) => DateTime.fromJSDate(cuti.tanggalMulai).year)),
      ].sort((a, b) => b - a)

      // Add current year if not in the list
      const currentYear = DateTime.now().year
      if (!availableYears.includes(currentYear)) {
        availableYears.unshift(currentYear)
      }

      // Create custom pagination object that works with Edge
      const paginationInfo = {
        data: transformedCutis,
        total: cutis.total,
        perPage: cutis.perPage,
        currentPage: cutis.currentPage,
        lastPage: cutis.lastPage,
        hasPages: cutis.hasPages,
        hasMorePages: cutis.hasMorePages,
        isEmpty: transformedCutis.length === 0,
      }

      return view.render('pages/cuti/index', {
        cutis: paginationInfo,
        pegawais,
        availableYears,
      })
    } catch (error) {
      console.error('Error in index:', error)
      return response.status(500).json({ error: 'Gagal mengambil data cuti' })
    }
  }

  async create({ view, response }: HttpContext) {
    try {
      // Get all pegawai for dropdown
      const pegawais = await Pegawai.query()
        .preload('unitKerja')
        .preload('jabatan')
        .orderBy('nama', 'asc')

      return view.render('pages/cuti/create', {
        pegawais,
      })
    } catch (error) {
      console.error('Error in create:', error)
      return response.status(500).json({ error: 'Gagal memuat halaman tambah cuti' })
    }
  }

  async store({ request, response, session }: HttpContext) {
    try {
      const data = request.only(['pegawai_id', 'tanggal_mulai', 'tanggal_akhir', 'alasan'])

      // Validasi manual
      if (!data.pegawai_id || Number.isNaN(Number(data.pegawai_id))) {
        session.flash('error', 'Pegawai harus dipilih')
        return response.redirect().back()
      }

      if (!data.tanggal_mulai || data.tanggal_mulai.trim() === '') {
        session.flash('error', 'Tanggal mulai cuti tidak boleh kosong')
        return response.redirect().back()
      }

      if (!data.tanggal_akhir || data.tanggal_akhir.trim() === '') {
        session.flash('error', 'Tanggal akhir cuti tidak boleh kosong')
        return response.redirect().back()
      }

      if (!data.alasan || data.alasan.trim() === '') {
        session.flash('error', 'Alasan cuti tidak boleh kosong')
        return response.redirect().back()
      }

      // Convert string to Date
      const tanggalMulai = new Date(data.tanggal_mulai)
      const tanggalAkhir = new Date(data.tanggal_akhir)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Validate dates
      if (tanggalMulai < today) {
        session.flash('error', 'Tanggal mulai cuti tidak boleh di masa lalu')
        return response.redirect().back()
      }

      if (tanggalAkhir < tanggalMulai) {
        session.flash('error', 'Tanggal akhir cuti tidak boleh sebelum tanggal mulai')
        return response.redirect().back()
      }

      // Calculate duration
      const duration =
        Math.ceil((tanggalAkhir.getTime() - tanggalMulai.getTime()) / (1000 * 60 * 60 * 24)) + 1

      if (duration > 12) {
        session.flash('error', 'Durasi cuti tidak boleh lebih dari 12 hari')
        return response.redirect().back()
      }

      // Verify pegawai exists
      const pegawai = await Pegawai.find(data.pegawai_id)
      if (!pegawai) {
        session.flash('error', 'Pegawai tidak ditemukan')
        return response.redirect().back()
      }

      // Check annual leave quota (12 days per year)
      const year = tanggalMulai.getFullYear()
      const startOfYear = new Date(year, 0, 1)
      const endOfYear = new Date(year, 11, 31)

      const existingCutis = await Cuti.query()
        .where('pegawai_id', data.pegawai_id)
        .whereBetween('tanggal_mulai', [startOfYear, endOfYear])

      let totalUsedDays = 0
      for (const cuti of existingCutis) {
        const cutiDuration =
          Math.ceil(
            (cuti.tanggalAkhir.getTime() - cuti.tanggalMulai.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1
        totalUsedDays += cutiDuration
      }

      const remainingDays = 12 - totalUsedDays
      if (duration > remainingDays) {
        session.flash(
          'error',
          `Sisa kuota cuti untuk tahun ${year} hanya ${remainingDays} hari. Anda mengajukan ${duration} hari.`
        )
        return response.redirect().back()
      }

      // Check for overlapping dates
      const overlappingCuti = await Cuti.query()
        .where('pegawai_id', data.pegawai_id)
        .where((builder) => {
          builder
            .whereBetween('tanggal_mulai', [tanggalMulai, tanggalAkhir])
            .orWhereBetween('tanggal_akhir', [tanggalMulai, tanggalAkhir])
            .orWhere((subBuilder) => {
              subBuilder
                .where('tanggal_mulai', '<=', tanggalMulai)
                .where('tanggal_akhir', '>=', tanggalAkhir)
            })
        })

      if (overlappingCuti.length > 0) {
        session.flash('error', 'Tanggal cuti yang dipilih bertabrakan dengan cuti yang sudah ada')
        return response.redirect().back()
      }

      // Create cuti
      await Cuti.create({
        pegawaiId: Number(data.pegawai_id),
        tanggalMulai,
        tanggalAkhir,
        alasan: data.alasan.trim(),
      })

      session.flash(
        'success',
        `Cuti berhasil diajukan untuk ${duration} hari. Sisa kuota tahun ${year}: ${remainingDays - duration} hari.`
      )
      return response.redirect().toPath('/cuti')
    } catch (error) {
      console.error('Error in store:', error)
      session.flash('error', 'Gagal membuat data cuti')
      return response.redirect().back()
    }
  }

  async show({ params, view, response }: HttpContext) {
    try {
      const cuti = await Cuti.query()
        .where('id', params.id)
        .preload('pegawai', (pegawaiQuery) => {
          pegawaiQuery.preload('unitKerja').preload('jabatan')
        })
        .firstOrFail()

      // Calculate duration
      const duration =
        Math.ceil(
          (cuti.tanggalAkhir.getTime() - cuti.tanggalMulai.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1

      // Get annual summary for this year
      const year = DateTime.fromJSDate(cuti.tanggalMulai).year
      const startOfYear = new Date(year, 0, 1)
      const endOfYear = new Date(year, 11, 31)

      const yearCutis = await Cuti.query()
        .where('pegawai_id', cuti.pegawaiId)
        .whereBetween('tanggal_mulai', [startOfYear, endOfYear])

      let totalUsedDaysThisYear = 0
      for (const yearCuti of yearCutis) {
        const cutiDuration =
          Math.ceil(
            (yearCuti.tanggalAkhir.getTime() - yearCuti.tanggalMulai.getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1
        totalUsedDaysThisYear += cutiDuration
      }

      // Create clean object for template with safe data access
      const cleanCuti = {
        id: cuti.id,
        pegawaiId: cuti.pegawaiId,
        tanggalMulai: cuti.tanggalMulai,
        tanggalAkhir: cuti.tanggalAkhir,
        alasan: cuti.alasan,
        createdAt: cuti.createdAt,
        tanggalMulaiFormatted: cuti.tanggalMulai.toISOString(),
        tanggalAkhirFormatted: cuti.tanggalAkhir.toISOString(),
        createdAtFormatted: cuti.createdAt.toString(),
        pegawai: {
          id: cuti.pegawai.id,
          nama: cuti.pegawai.nama,
          nip: cuti.pegawai.nip,
          jabatan: {
            id: cuti.pegawai.jabatan?.id || null,
            nama_jabatan: cuti.pegawai.jabatan?.nama_jabatan || 'Tidak ada jabatan',
          },
          unitKerja: {
            id: cuti.pegawai.unitKerja?.id || null,
            nama_unit: cuti.pegawai.unitKerja?.nama_unit || 'Tidak ada unit kerja',
          },
        },
      }

      // Calculate progress percentage for template
      const progressPercentage = Math.min((totalUsedDaysThisYear / 12) * 100, 100)

      return view.render('pages/cuti/show', {
        cuti: cleanCuti,
        duration,
        year,
        totalUsedDaysThisYear,
        remainingQuota: 12 - totalUsedDaysThisYear,
        progressPercentage: Math.round(progressPercentage),
      })
    } catch (error) {
      console.error('Error in show:', error)
      return response.status(404).json({ error: 'Cuti tidak ditemukan' })
    }
  }

  async edit({ params, view, response }: HttpContext) {
    try {
      const cuti = await Cuti.query()
        .where('id', params.id)
        .preload('pegawai', (pegawaiQuery) => {
          pegawaiQuery.preload('unitKerja').preload('jabatan')
        })
        .firstOrFail()

      const pegawais = await Pegawai.query()
        .preload('unitKerja')
        .preload('jabatan')
        .orderBy('nama', 'asc')

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (!cuti.tanggalMulai || !cuti.tanggalAkhir) {
        throw new Error('Tanggal mulai atau tanggal akhir tidak valid')
      }

      const tanggalMulai = new Date(cuti.tanggalMulai)
      const tanggalAkhir = new Date(cuti.tanggalAkhir)

      if (Number.isNaN(tanggalMulai.getTime()) || Number.isNaN(tanggalAkhir.getTime())) {
        throw new Error('Format tanggal tidak valid')
      }

      const isUpcoming = tanggalMulai > today
      const isOngoing = tanggalMulai <= today && tanggalAkhir >= today
      const isCompleted = tanggalAkhir < today

      return view.render('pages/cuti/edit', {
        cuti,
        pegawais,
        isUpcoming,
        isOngoing,
        isCompleted,
      })
    } catch (error) {
      console.error('Error in edit:', error)
      return response.status(404).json({ error: 'Cuti tidak ditemukan' })
    }
  }

  async update({ params, request, response, session }: HttpContext) {
    try {
      const cuti = await Cuti.findOrFail(params.id)
      const data = request.only(['pegawai_id', 'tanggal_mulai', 'tanggal_akhir', 'alasan'])

      // Validasi manual
      if (!data.pegawai_id || Number.isNaN(Number(data.pegawai_id))) {
        session.flash('error', 'Pegawai harus dipilih')
        return response.redirect().back()
      }

      if (!data.tanggal_mulai || data.tanggal_mulai.trim() === '') {
        session.flash('error', 'Tanggal mulai cuti tidak boleh kosong')
        return response.redirect().back()
      }

      if (!data.tanggal_akhir || data.tanggal_akhir.trim() === '') {
        session.flash('error', 'Tanggal akhir cuti tidak boleh kosong')
        return response.redirect().back()
      }

      if (!data.alasan || data.alasan.trim() === '') {
        session.flash('error', 'Alasan cuti tidak boleh kosong')
        return response.redirect().back()
      }

      // Convert string to Date
      const tanggalMulai = new Date(data.tanggal_mulai)
      const tanggalAkhir = new Date(data.tanggal_akhir)

      // Validate dates
      if (tanggalAkhir < tanggalMulai) {
        session.flash('error', 'Tanggal akhir cuti tidak boleh sebelum tanggal mulai')
        return response.redirect().back()
      }

      // Calculate duration
      const duration =
        Math.ceil((tanggalAkhir.getTime() - tanggalMulai.getTime()) / (1000 * 60 * 60 * 24)) + 1

      if (duration > 12) {
        session.flash('error', 'Durasi cuti tidak boleh lebih dari 12 hari')
        return response.redirect().back()
      }

      // Verify pegawai exists
      const pegawai = await Pegawai.find(data.pegawai_id)
      if (!pegawai) {
        session.flash('error', 'Pegawai tidak ditemukan')
        return response.redirect().back()
      }

      // Check annual leave quota (exclude current cuti from calculation)
      const year = tanggalMulai.getFullYear()
      const startOfYear = new Date(year, 0, 1)
      const endOfYear = new Date(year, 11, 31)

      const existingCutis = await Cuti.query()
        .where('pegawai_id', data.pegawai_id)
        .whereNot('id', params.id) // Exclude current cuti
        .whereBetween('tanggal_mulai', [startOfYear, endOfYear])

      let totalUsedDays = 0
      for (const existingCuti of existingCutis) {
        const cutiDuration =
          Math.ceil(
            (existingCuti.tanggalAkhir.getTime() - existingCuti.tanggalMulai.getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1
        totalUsedDays += cutiDuration
      }

      const remainingDays = 12 - totalUsedDays
      if (duration > remainingDays) {
        session.flash(
          'error',
          `Sisa kuota cuti untuk tahun ${year} hanya ${remainingDays} hari. Anda mengajukan ${duration} hari.`
        )
        return response.redirect().back()
      }

      // Check for overlapping dates (exclude current cuti)
      const overlappingCuti = await Cuti.query()
        .where('pegawai_id', data.pegawai_id)
        .whereNot('id', params.id)
        .where((builder) => {
          builder
            .whereBetween('tanggal_mulai', [tanggalMulai, tanggalAkhir])
            .orWhereBetween('tanggal_akhir', [tanggalMulai, tanggalAkhir])
            .orWhere((subBuilder) => {
              subBuilder
                .where('tanggal_mulai', '<=', tanggalMulai)
                .where('tanggal_akhir', '>=', tanggalAkhir)
            })
        })

      if (overlappingCuti.length > 0) {
        session.flash('error', 'Tanggal cuti yang dipilih bertabrakan dengan cuti yang sudah ada')
        return response.redirect().back()
      }

      // Update cuti
      cuti.merge({
        pegawaiId: Number(data.pegawai_id),
        tanggalMulai,
        tanggalAkhir,
        alasan: data.alasan.trim(),
      })
      await cuti.save()

      session.flash(
        'success',
        `Cuti berhasil diperbarui untuk ${duration} hari. Sisa kuota tahun ${year}: ${remainingDays - duration} hari.`
      )
      return response.redirect().toPath('/cuti')
    } catch (error) {
      console.error('Error in update:', error)
      session.flash('error', 'Gagal memperbarui data cuti')
      return response.redirect().back()
    }
  }

  async destroy({ params, response, session }: HttpContext) {
    try {
      const cuti = await Cuti.findOrFail(params.id)

      // Calculate days for success message
      const duration =
        Math.ceil(
          (cuti.tanggalAkhir.getTime() - cuti.tanggalMulai.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1

      await cuti.delete()

      session.flash('success', `Cuti berhasil dihapus. ${duration} hari kuota telah dikembalikan.`)
      return response.redirect().toPath('/cuti')
    } catch (error) {
      console.error('Error in destroy:', error)
      session.flash('error', 'Gagal menghapus data cuti: ' + error.message)
      return response.redirect().back()
    }
  }

  // Helper method to get cuti summary for a pegawai and year
  async getSummary({ params, response }: HttpContext) {
    try {
      const { pegawaiId, tahun } = params

      const year = Number.parseInt(tahun)
      const startOfYear = new Date(year, 0, 1)
      const endOfYear = new Date(year, 11, 31)

      const cutis = await Cuti.query()
        .where('pegawai_id', pegawaiId)
        .whereBetween('tanggal_mulai', [startOfYear, endOfYear])

      let totalUsedDays = 0
      for (const cuti of cutis) {
        const duration =
          Math.ceil(
            (cuti.tanggalAkhir.getTime() - cuti.tanggalMulai.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1
        totalUsedDays += duration
      }

      return response.json({
        year,
        totalUsedDays,
        remainingQuota: 12 - totalUsedDays,
        cutisCount: cutis.length,
      })
    } catch (error) {
      console.error('Error in getSummary:', error)
      return response.status(500).json({ error: 'Gagal mengambil ringkasan cuti' })
    }
  }
}

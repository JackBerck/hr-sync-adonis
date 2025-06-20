import type { HttpContext } from '@adonisjs/core/http'
import Absensi from '#models/absensi'
import Pegawai from '#models/pegawai'
import { DateTime } from 'luxon'

export default class AbsensisController {
  /**
   * Display list of attendance dates
   */
  async index({ view, request }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const month = request.input('month', '')
      const year = request.input('year', DateTime.now().year)

      // Get attendance dates grouped by date
      let query = Absensi.query().select('tanggal').groupBy('tanggal').orderBy('tanggal', 'desc')

      // Filter by month/year
      if (month && year) {
        const startOfMonth = DateTime.fromObject({
          year: Number.parseInt(year),
          month: Number.parseInt(month),
          day: 1,
        }).toJSDate()
        const endOfMonth = DateTime.fromObject({
          year: Number.parseInt(year),
          month: Number.parseInt(month),
          day: 1,
        })
          .endOf('month')
          .toJSDate()
        query = query.whereBetween('tanggal', [startOfMonth, endOfMonth])
      } else if (year) {
        const startOfYear = DateTime.fromObject({
          year: Number.parseInt(year),
          month: 1,
          day: 1,
        }).toJSDate()
        const endOfYear = DateTime.fromObject({
          year: Number.parseInt(year),
          month: 12,
          day: 31,
        }).toJSDate()
        query = query.whereBetween('tanggal', [startOfYear, endOfYear])
      }

      const attendanceDates = await query

      // Get statistics for each date
      const attendanceData = []
      for (const dateRecord of attendanceDates) {
        const date = dateRecord.tanggal

        const statistics = await Absensi.query()
          .select('status')
          .where('tanggal', date)
          .groupBy('status')
          .count('* as total')

        const stats = {
          hadir: 0,
          izin: 0,
          sakit: 0,
          alfa: 0,
        }

        statistics.forEach((stat) => {
          stats[stat.status] = Number(stat.$extras.total)
        })

        const totalPegawai = await Pegawai.query().count('* as total')
        const totalAbsensi = Object.values(stats).reduce((sum, count) => sum + count, 0)
        const totalBelumAbsen = Number(totalPegawai[0].$extras.total) - totalAbsensi

        attendanceData.push({
          tanggal: date,
          tanggalFormatted: date.toISOString(),
          stats,
          totalAbsensi,
          totalBelumAbsen,
          totalPegawai: Number(totalPegawai[0].$extras.total),
        })
      }

      // Pagination simulation (since we're doing custom grouping)
      const perPage = 10
      const startIndex = (page - 1) * perPage
      const endIndex = startIndex + perPage
      const paginatedData = attendanceData.slice(startIndex, endIndex)

      const pagination = {
        data: paginatedData,
        total: attendanceData.length,
        perPage,
        currentPage: page,
        lastPage: Math.ceil(attendanceData.length / perPage),
        hasPages: attendanceData.length > perPage,
        hasMorePages: page < Math.ceil(attendanceData.length / perPage),
        isEmpty: attendanceData.length === 0,
      }

      // Get available years and months
      const availableYears = await this.getAvailableYears()
      const availableMonths = [
        { value: 1, label: 'Januari' },
        { value: 2, label: 'Februari' },
        { value: 3, label: 'Maret' },
        { value: 4, label: 'April' },
        { value: 5, label: 'Mei' },
        { value: 6, label: 'Juni' },
        { value: 7, label: 'Juli' },
        { value: 8, label: 'Agustus' },
        { value: 9, label: 'September' },
        { value: 10, label: 'Oktober' },
        { value: 11, label: 'November' },
        { value: 12, label: 'Desember' },
      ]

      return view.render('pages/absensi/index', {
        absensi: pagination,
        availableYears,
        availableMonths,
        currentYear: year,
        currentMonth: month,
      })
    } catch (error) {
      console.error('Error in absensi index:', error)
      return view.render('pages/absensi/index', {
        absensi: { data: [], isEmpty: true },
        availableYears: [],
        availableMonths: [],
      })
    }
  }

  /**
   * Show attendance form for specific date
   */
  async create({ view, request }: HttpContext) {
    try {
      const tanggal = request.input('tanggal', DateTime.now().toFormat('yyyy-MM-dd'))
      const targetDate = new Date(tanggal)

      // Get all pegawai with their unit kerja and jabatan
      const pegawais = await Pegawai.query()
        .preload('unitKerja')
        .preload('jabatan')
        .orderBy('nama', 'asc')

      // Get existing attendance for this date
      const existingAttendance = await Absensi.query()
        .where('tanggal', targetDate)
        .preload('pegawai')

      // Create attendance map
      const attendanceMap = new Map()
      existingAttendance.forEach((absensi) => {
        attendanceMap.set(absensi.pegawaiId, absensi)
      })

      // Combine pegawai with their attendance status
      const pegawaiWithAttendance = pegawais.map((pegawai) => {
        const attendance = attendanceMap.get(pegawai.id)
        return {
          id: pegawai.id,
          nama: pegawai.nama,
          nip: pegawai.nip,
          jabatan: {
            id: pegawai.jabatan?.id || null,
            nama_jabatan: pegawai.jabatan?.nama_jabatan || 'Tidak ada jabatan',
          },
          unitKerja: {
            id: pegawai.unitKerja?.id || null,
            nama_unit: pegawai.unitKerja?.nama_unit || 'Tidak ada unit kerja',
          },
          attendance: attendance
            ? {
                id: attendance.id,
                status: attendance.status,
                createdAt: attendance.createdAt,
                updatedAt: attendance.updatedAt,
              }
            : null,
        }
      })

      const statusOptions = [
        { value: 'hadir', label: 'Hadir', color: 'green' },
        { value: 'izin', label: 'Izin', color: 'yellow' },
        { value: 'sakit', label: 'Sakit', color: 'blue' },
        { value: 'alfa', label: 'Alfa', color: 'red' },
      ]

      return view.render('pages/absensi/create', {
        tanggal,
        tanggalFormatted: targetDate.toISOString(),
        pegawais: pegawaiWithAttendance,
        statusOptions,
      })
    } catch (error) {
      console.error('Error in absensi create:', error)
      return view.render('pages/absensi/create', {
        tanggal: DateTime.now().toFormat('yyyy-MM-dd'),
        pegawais: [],
        statusOptions: [],
      })
    }
  }

  /**
   * Store attendance for specific date
   */
  async store({ request, response, session }: HttpContext) {
    try {
      const tanggal = request.input('tanggal')
      const pegawaiIds = request.input('pegawai_ids', [])

      console.log('Received data:', { tanggal, pegawaiIds }) // Debug log

      const targetDate = new Date(tanggal)
      let updatedCount = 0
      let createdCount = 0

      // Process each pegawai attendance
      for (const pegawaiId of pegawaiIds) {
        const pegawaiIdNum = Number.parseInt(pegawaiId)
        const status = request.input(`status_${pegawaiId}`)

        console.log('Processing:', { pegawaiId, pegawaiIdNum, status }) // Debug log

        // Skip if status is empty or pegawaiId is invalid
        if (!status || status === '' || Number.isNaN(pegawaiIdNum) || pegawaiIdNum <= 0) {
          console.log('Skipping invalid data:', { pegawaiIdNum, status })
          continue
        }

        // Verify pegawai exists
        const pegawaiExists = await Pegawai.find(pegawaiIdNum)
        if (!pegawaiExists) {
          console.log('Pegawai not found:', pegawaiIdNum)
          continue
        }

        // Check if attendance already exists
        const existingAttendance = await Absensi.query()
          .where('pegawai_id', pegawaiIdNum)
          .where('tanggal', targetDate)
          .first()

        if (existingAttendance) {
          // Update existing attendance
          existingAttendance.status = status as 'hadir' | 'izin' | 'sakit' | 'alfa'
          await existingAttendance.save()
          updatedCount++
          console.log('Updated attendance for pegawai:', pegawaiIdNum)
        } else {
          // Create new attendance
          const newAttendance = await Absensi.create({
            pegawaiId: pegawaiIdNum,
            tanggal: targetDate,
            status: status as 'hadir' | 'izin' | 'sakit' | 'alfa',
          })
          createdCount++
          console.log('Created new attendance:', newAttendance.toJSON())
        }
      }

      session.flash(
        'success',
        `Absensi berhasil disimpan! ${createdCount} data baru ditambahkan, ${updatedCount} data diperbarui.`
      )
      return response.redirect('/absensi')
    } catch (error) {
      console.error('Error in store attendance:', error)
      session.flash('error', 'Gagal menyimpan data absensi. Silakan coba lagi.')
      return response.redirect().back()
    }
  }

  /**
   * Show attendance details for specific date
   */
  async show({ params, view, response }: HttpContext) {
    try {
      const tanggal = params.tanggal
      const targetDate = new Date(tanggal)

      // Get attendance for this date
      const attendances = await Absensi.query()
        .where('tanggal', targetDate)
        .preload('pegawai', (pegawaiQuery) => {
          pegawaiQuery.preload('unitKerja').preload('jabatan')
        })
        .orderBy('pegawai.nama', 'asc')

      if (attendances.length === 0) {
        return response.redirect('/absensi')
      }

      // Transform data
      const transformedAttendances = attendances.map((absensi) => ({
        id: absensi.id,
        status: absensi.status,
        createdAt: absensi.createdAt,
        updatedAt: absensi.updatedAt,
        createdAtFormatted: absensi.createdAt.toString(),
        updatedAtFormatted: absensi.updatedAt.toString(),
        pegawai: {
          id: absensi.pegawai.id,
          nama: absensi.pegawai.nama,
          nip: absensi.pegawai.nip,
          jabatan: {
            id: absensi.pegawai.jabatan?.id || null,
            nama_jabatan: absensi.pegawai.jabatan?.nama_jabatan || 'Tidak ada jabatan',
          },
          unitKerja: {
            id: absensi.pegawai.unitKerja?.id || null,
            nama_unit: absensi.pegawai.unitKerja?.nama_unit || 'Tidak ada unit kerja',
          },
        },
      }))

      // Calculate statistics
      const stats = {
        hadir: 0,
        izin: 0,
        sakit: 0,
        alfa: 0,
      }

      transformedAttendances.forEach((absensi) => {
        stats[absensi.status]++
      })

      const totalPegawai = await Pegawai.query().count('* as total')
      const totalAbsensi = transformedAttendances.length
      const totalBelumAbsen = Number(totalPegawai[0].$extras.total) - totalAbsensi

      return view.render('pages/absensi/show', {
        tanggal,
        tanggalFormatted: targetDate.toISOString(),
        attendances: transformedAttendances,
        stats,
        totalAbsensi,
        totalBelumAbsen,
        totalPegawai: Number(totalPegawai[0].$extras.total),
      })
    } catch (error) {
      console.error('Error in show attendance:', error)
      return response.redirect('/absensi')
    }
  }

  /**
   * Edit attendance for specific date
   */
  async edit({ params, view, request, response }: HttpContext) {
    try {
      const tanggal = params.tanggal
      // Create a new request object with the date parameter
      const modifiedRequest = {
        ...request,
        input: (key: string, defaultValue?: any) => {
          if (key === 'tanggal') return tanggal
          return request.input(key, defaultValue)
        },
      }
      return this.create({ view, request: modifiedRequest, response, params } as HttpContext)
    } catch (error) {
      console.error('Error in edit attendance:', error)
      return response.redirect('/absensi')
    }
  }

  /**
   * Delete attendance for specific date
   */
  async destroy({ params, response, session }: HttpContext) {
    try {
      const tanggal = params.tanggal
      const targetDate = new Date(tanggal)

      const deletedCount = await Absensi.query().where('tanggal', targetDate).delete()

      session.flash('success', `${deletedCount} data absensi berhasil dihapus.`)
      return response.redirect('/absensi')
    } catch (error) {
      console.error('Error in destroy attendance:', error)
      session.flash('error', 'Gagal menghapus data absensi.')
      return response.redirect('/absensi')
    }
  }

  /**
   * Helper method to get available years
   */
  private async getAvailableYears() {
    try {
      const existingAbsensi = await Absensi.query().orderBy('tanggal', 'desc')
      const years = [
        ...new Set(existingAbsensi.map((absensi) => DateTime.fromJSDate(absensi.tanggal).year)),
      ].sort((a, b) => b - a)

      const currentYear = DateTime.now().year
      if (!years.includes(currentYear)) {
        years.unshift(currentYear)
      }

      return years
    } catch (error) {
      return [DateTime.now().year]
    }
  }
}

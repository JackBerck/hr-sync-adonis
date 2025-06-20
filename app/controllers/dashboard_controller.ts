import type { HttpContext } from '@adonisjs/core/http'
import Absensi from '#models/absensi'
import Pegawai from '#models/pegawai'
import UnitKerja from '#models/unit_kerja'
import Jabatan from '#models/jabatan'
import Cuti from '#models/cuti'
import { DateTime } from 'luxon'

export default class DashboardController {
  async index({ view, request }: HttpContext) {
    try {
      const month = request.input('month', DateTime.now().month)
      const year = request.input('year', DateTime.now().year)

      // Get date range for the selected month
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

      // Get basic statistics
      const totalPegawai = await Pegawai.query().count('* as total')
      const totalUnitKerja = await UnitKerja.query().count('* as total')
      const totalJabatan = await Jabatan.query().count('* as total')

      // Get attendance statistics for the month
      const monthlyAttendance = await Absensi.query()
        .whereBetween('tanggal', [startOfMonth, endOfMonth])
        .select('status')
        .groupBy('status')
        .count('* as total')

      const attendanceStats = {
        hadir: 0,
        izin: 0,
        sakit: 0,
        alfa: 0,
      }

      monthlyAttendance.forEach((stat) => {
        attendanceStats[stat.status] = Number(stat.$extras.total)
      })

      const totalAttendanceRecords = Object.values(attendanceStats).reduce(
        (sum, count) => sum + count,
        0
      )

      // Get working days in the month (excluding weekends)
      const workingDays = this.getWorkingDaysInMonth(Number.parseInt(year), Number.parseInt(month))
      const totalPegawaiCount = Number(totalPegawai[0].$extras.total)
      const expectedAttendanceRecords = workingDays * totalPegawaiCount
      const attendanceRate =
        expectedAttendanceRecords > 0
          ? (attendanceStats.hadir / expectedAttendanceRecords) * 100
          : 0

      // Get attendance by unit kerja
      const attendanceByUnit = await this.getAttendanceByUnit(startOfMonth, endOfMonth)

      // Get daily attendance trends for the month
      const dailyTrends = await this.getDailyAttendanceTrends(startOfMonth, endOfMonth)

      // Get top performers (highest attendance rate)
      const topPerformers = await this.getTopPerformers(startOfMonth, endOfMonth, 5)

      // Get recent cuti requests
      const recentCuti = await Cuti.query()
        .preload('pegawai', (pegawaiQuery) => {
          pegawaiQuery.preload('unitKerja').preload('jabatan')
        })
        .whereBetween('tanggal_mulai', [startOfMonth, endOfMonth])
        .orderBy('created_at', 'desc')
        .limit(5)

      // Format recent cuti data
      const formattedRecentCuti = recentCuti.map((cuti) => {
        const duration =
          Math.ceil(
            (cuti.tanggalAkhir.getTime() - cuti.tanggalMulai.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1

        return {
          id: cuti.id,
          pegawai: {
            nama: cuti.pegawai.nama,
            nip: cuti.pegawai.nip,
            unitKerja: cuti.pegawai.unitKerja?.nama_unit || 'Tidak ada unit',
          },
          tanggalMulai: cuti.tanggalMulai,
          tanggalAkhir: cuti.tanggalAkhir,
          duration,
          alasan: cuti.alasan,
          tanggalMulaiFormatted: cuti.tanggalMulai.toISOString(),
          tanggalAkhirFormatted: cuti.tanggalAkhir.toISOString(),
        }
      })

      // Get available years for filter
      const availableYears = await this.getAvailableYears()

      // Get month name
      const monthName = DateTime.fromObject({
        month: Number.parseInt(month),
        day: 1,
      }).toFormat('MMMM', { locale: 'id' })

      return view.render('pages/dashboard/index', {
        // Basic stats
        totalPegawai: totalPegawaiCount,
        totalUnitKerja: Number(totalUnitKerja[0].$extras.total),
        totalJabatan: Number(totalJabatan[0].$extras.total),

        // Monthly stats
        attendanceStats,
        totalAttendanceRecords,
        expectedAttendanceRecords,
        attendanceRate: Math.round(attendanceRate),
        workingDays,

        // Charts data
        attendanceByUnit,
        dailyTrends,
        topPerformers,

        // Recent data
        recentCuti: formattedRecentCuti,

        // Filter data
        availableYears,
        currentMonth: Number.parseInt(month),
        currentYear: Number.parseInt(year),
        monthName,

        // Available months
        availableMonths: [
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
        ],
      })
    } catch (error) {
      console.error('Error in dashboard:', error)
      return view.render('pages/dashboard/index', {
        totalPegawai: 0,
        totalUnitKerja: 0,
        totalJabatan: 0,
        attendanceStats: { hadir: 0, izin: 0, sakit: 0, alfa: 0 },
        attendanceByUnit: [],
        dailyTrends: [],
        topPerformers: [],
        recentCuti: [],
        availableYears: [DateTime.now().year],
        currentMonth: DateTime.now().month,
        currentYear: DateTime.now().year,
        monthName: 'Bulan Ini',
        availableMonths: [],
      })
    }
  }

  // Helper method to get working days in a month (excluding weekends)
  private getWorkingDaysInMonth(year: number, month: number): number {
    const start = DateTime.fromObject({ year, month, day: 1 })
    const end = start.endOf('month')

    let workingDays = 0
    let current = start

    while (current <= end) {
      // Skip Saturday (6) and Sunday (7)
      if (current.weekday !== 6 && current.weekday !== 7) {
        workingDays++
      }
      current = current.plus({ days: 1 })
    }

    return workingDays
  }

  // Helper method to get attendance by unit kerja
  private async getAttendanceByUnit(startDate: Date, endDate: Date) {
    try {
      const units = await UnitKerja.query().orderBy('nama_unit', 'asc')
      const attendanceByUnit = []

      for (const unit of units) {
        const pegawaiInUnit = await Pegawai.query().where('unit_kerja_id', unit.id)
        const pegawaiIds = pegawaiInUnit.map((p) => p.id)

        if (pegawaiIds.length === 0) {
          attendanceByUnit.push({
            unitKerja: unit.nama_unit,
            hadir: 0,
            izin: 0,
            sakit: 0,
            alfa: 0,
            total: 0,
            totalPegawai: 0,
            attendanceRate: 0,
          })
          continue
        }

        const attendance = await Absensi.query()
          .whereIn('pegawai_id', pegawaiIds)
          .whereBetween('tanggal', [startDate, endDate])
          .select('status')
          .groupBy('status')
          .count('* as total')

        const unitStats = {
          hadir: 0,
          izin: 0,
          sakit: 0,
          alfa: 0,
        }

        attendance.forEach((stat) => {
          unitStats[stat.status] = Number(stat.$extras.total)
        })

        const totalAttendance = Object.values(unitStats).reduce((sum, count) => sum + count, 0)
        const workingDays = this.getWorkingDaysInMonth(
          startDate.getFullYear(),
          startDate.getMonth() + 1
        )
        const expectedRecords = workingDays * pegawaiIds.length
        const attendanceRate = expectedRecords > 0 ? (unitStats.hadir / expectedRecords) * 100 : 0

        attendanceByUnit.push({
          unitKerja: unit.nama_unit,
          ...unitStats,
          total: totalAttendance,
          totalPegawai: pegawaiIds.length,
          attendanceRate: Math.round(attendanceRate),
        })
      }

      return attendanceByUnit
    } catch (error) {
      console.error('Error getting attendance by unit:', error)
      return []
    }
  }

  // Helper method to get daily attendance trends
  private async getDailyAttendanceTrends(startDate: Date, endDate: Date) {
    try {
      const dailyAttendance = await Absensi.query()
        .whereBetween('tanggal', [startDate, endDate])
        .select('tanggal', 'status')
        .groupBy('tanggal', 'status')
        .count('* as total')
        .orderBy('tanggal', 'asc')

      // Group by date
      const dailyTrendsMap = new Map()

      dailyAttendance.forEach((record) => {
        const dateKey = record.tanggal.toISOString().split('T')[0]

        if (!dailyTrendsMap.has(dateKey)) {
          dailyTrendsMap.set(dateKey, {
            tanggal: dateKey,
            hadir: 0,
            izin: 0,
            sakit: 0,
            alfa: 0,
          })
        }

        const dayData = dailyTrendsMap.get(dateKey)
        dayData[record.status] = Number(record.$extras.total)
      })

      return Array.from(dailyTrendsMap.values())
    } catch (error) {
      console.error('Error getting daily trends:', error)
      return []
    }
  }

  // Helper method to get top performers
  private async getTopPerformers(startDate: Date, endDate: Date, limit: number = 5) {
    try {
      const pegawais = await Pegawai.query()
        .preload('unitKerja')
        .preload('jabatan')
        .orderBy('nama', 'asc')

      const performers = []

      for (const pegawai of pegawais) {
        const attendance = await Absensi.query()
          .where('pegawai_id', pegawai.id)
          .whereBetween('tanggal', [startDate, endDate])
          .select('status')
          .groupBy('status')
          .count('* as total')

        const stats = {
          hadir: 0,
          izin: 0,
          sakit: 0,
          alfa: 0,
        }

        attendance.forEach((stat) => {
          stats[stat.status] = Number(stat.$extras.total)
        })

        const totalPresent = stats.hadir
        const workingDays = this.getWorkingDaysInMonth(
          startDate.getFullYear(),
          startDate.getMonth() + 1
        )
        const attendanceRate = workingDays > 0 ? (totalPresent / workingDays) * 100 : 0

        performers.push({
          pegawai: {
            id: pegawai.id,
            nama: pegawai.nama,
            nip: pegawai.nip,
            unitKerja: pegawai.unitKerja?.nama_unit || 'Tidak ada unit',
            jabatan: pegawai.jabatan?.nama_jabatan || 'Tidak ada jabatan',
          },
          stats,
          totalDays: Object.values(stats).reduce((sum, count) => sum + count, 0),
          attendanceRate: Math.round(attendanceRate),
        })
      }

      // Sort by attendance rate and return top performers
      return performers.sort((a, b) => b.attendanceRate - a.attendanceRate).slice(0, limit)
    } catch (error) {
      console.error('Error getting top performers:', error)
      return []
    }
  }

  // Helper method to get available years
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

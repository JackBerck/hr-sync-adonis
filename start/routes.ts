/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const JabatanController = () => import('#controllers/jabatans_controller')
const UnitKerjaController = () => import('#controllers/unit_kerjas_controller')
const PegawaiController = () => import('#controllers/pegawais_controller')
const CutiController = () => import('#controllers/cutis_controller')
const AbsensiController = () => import('#controllers/absensis_controller')

import router from '@adonisjs/core/services/router'

router.on('/').render('pages/home')

// router.resource('jabatan', JabatanController)
router.get('/jabatan', [JabatanController, 'index']).as('jabatan.index')
router.get('/jabatan/create', [JabatanController, 'create']).as('jabatan.create')
router.post('/jabatan', [JabatanController, 'store']).as('jabatan.store')
router.get('/jabatan/:id', [JabatanController, 'show']).as('jabatan.show')
router.get('/jabatan/:id/edit', [JabatanController, 'edit']).as('jabatan.edit')
router.post('/jabatan/:id', [JabatanController, 'update']).as('jabatan.update')
router.post('/jabatan/:id/delete', [JabatanController, 'destroy']).as('jabatan.destroy')

router.get('/unit-kerja', [UnitKerjaController, 'index']).as('unitKerja.index')
router.get('/unit-kerja/create', [UnitKerjaController, 'create']).as('unitKerja.create')
router.post('/unit-kerja', [UnitKerjaController, 'store']).as('unitKerja.store')
router.get('/unit-kerja/:id', [UnitKerjaController, 'show']).as('unitKerja.show')
router.get('/unit-kerja/:id/edit', [UnitKerjaController, 'edit']).as('unitKerja.edit')
router.post('/unit-kerja/:id', [UnitKerjaController, 'update']).as('unitKerja.update')
router.post('/unit-kerja/:id/delete', [UnitKerjaController, 'destroy']).as('unitKerja.destroy')

router.get('/pegawai', [PegawaiController, 'index']).as('pegawai.index')
router.get('/pegawai/create', [PegawaiController, 'create']).as('pegawai.create')
router.post('/pegawai', [PegawaiController, 'store']).as('pegawai.store')
router.get('/pegawai/:id', [PegawaiController, 'show']).as('pegawai.show')
router.get('/pegawai/:id/edit', [PegawaiController, 'edit']).as('pegawai.edit')
router.post('/pegawai/:id', [PegawaiController, 'update']).as('pegawai.update')
router.post('/pegawai/:id/delete', [PegawaiController, 'destroy']).as('pegawai.destroy')

// Cuti routes
router.get('/cuti', [CutiController, 'index']).as('cuti.index')
router.get('/cuti/create', [CutiController, 'create']).as('cuti.create')
router.post('/cuti', [CutiController, 'store']).as('cuti.store')
router.get('/cuti/:id', [CutiController, 'show']).as('cuti.show')
router.get('/cuti/:id/edit', [CutiController, 'edit']).as('cuti.edit')
router.post('/cuti/:id', [CutiController, 'update']).as('cuti.update')
router.post('/cuti/:id/delete', [CutiController, 'destroy']).as('cuti.destroy')

// Helper route for cuti summary
router.get('/api/cuti/summary/:pegawaiId/:tahun', [CutiController, 'getSummary']).as('cuti.summary')

// Absensi routes
router.get('/absensi', [AbsensiController, 'index']).as('absensi.index')
router.get('/absensi/create', [AbsensiController, 'create']).as('absensi.create')
router.post('/absensi', [AbsensiController, 'store']).as('absensi.store')
router.get('/absensi/:tanggal', [AbsensiController, 'show']).as('absensi.show')
router.get('/absensi/:tanggal/edit', [AbsensiController, 'edit']).as('absensi.edit')
router.post('/absensi/:tanggal/delete', [AbsensiController, 'destroy']).as('absensi.destroy')

router.get('/dashboard', '#controllers/dashboard_controller.index').as('dashboard.index')

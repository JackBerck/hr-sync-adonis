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
const AuthController = () => import('#controllers/auth_controller')

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

// Public routes
router.on('/').render('pages/home')

// Auth routes (public)
router
  .group(() => {
    router.get('/login', [AuthController, 'showLogin']).as('auth.login.show')
    router.post('/login', [AuthController, 'login']).as('auth.login')
    router.get('/register', [AuthController, 'showRegister']).as('auth.register.show')
    router.post('/register', [AuthController, 'register']).as('auth.register')
  })
  .middleware(middleware.guest())

// Logout route (authenticated)
router.post('/logout', [AuthController, 'logout']).as('auth.logout').use(middleware.auth())

// Protected routes - require authentication
router
  .group(() => {
    // Dashboard
    router.get('/dashboard', '#controllers/dashboard_controller.index').as('dashboard.index')

    // Jabatan routes
    router.get('/jabatan', [JabatanController, 'index']).as('jabatan.index')
    router.get('/jabatan/create', [JabatanController, 'create']).as('jabatan.create')
    router.post('/jabatan', [JabatanController, 'store']).as('jabatan.store')
    router.get('/jabatan/:id', [JabatanController, 'show']).as('jabatan.show')
    router.get('/jabatan/:id/edit', [JabatanController, 'edit']).as('jabatan.edit')
    router.put('/jabatan/:id', [JabatanController, 'update']).as('jabatan.update')
    router.delete('/jabatan/:id/delete', [JabatanController, 'destroy']).as('jabatan.destroy')

    // Unit Kerja routes
    router.get('/unit-kerja', [UnitKerjaController, 'index']).as('unitKerja.index')
    router.get('/unit-kerja/create', [UnitKerjaController, 'create']).as('unitKerja.create')
    router.post('/unit-kerja', [UnitKerjaController, 'store']).as('unitKerja.store')
    router.get('/unit-kerja/:id', [UnitKerjaController, 'show']).as('unitKerja.show')
    router.get('/unit-kerja/:id/edit', [UnitKerjaController, 'edit']).as('unitKerja.edit')
    router.put('/unit-kerja/:id', [UnitKerjaController, 'update']).as('unitKerja.update')
    router
      .delete('/unit-kerja/:id/delete', [UnitKerjaController, 'destroy'])
      .as('unitKerja.destroy')

    // Pegawai routes
    router.get('/pegawai', [PegawaiController, 'index']).as('pegawai.index')
    router.get('/pegawai/create', [PegawaiController, 'create']).as('pegawai.create')
    router.post('/pegawai', [PegawaiController, 'store']).as('pegawai.store')
    router.get('/pegawai/:id', [PegawaiController, 'show']).as('pegawai.show')
    router.get('/pegawai/:id/edit', [PegawaiController, 'edit']).as('pegawai.edit')
    router.put('/pegawai/:id', [PegawaiController, 'update']).as('pegawai.update')
    router.delete('/pegawai/:id/delete', [PegawaiController, 'destroy']).as('pegawai.destroy')

    // Cuti routes
    router.get('/cuti', [CutiController, 'index']).as('cuti.index')
    router.get('/cuti/create', [CutiController, 'create']).as('cuti.create')
    router.post('/cuti', [CutiController, 'store']).as('cuti.store')
    router.get('/cuti/:id', [CutiController, 'show']).as('cuti.show')
    router.get('/cuti/:id/edit', [CutiController, 'edit']).as('cuti.edit')
    router.put('/cuti/:id', [CutiController, 'update']).as('cuti.update')
    router.delete('/cuti/:id/delete', [CutiController, 'destroy']).as('cuti.destroy')

    // Helper route for cuti summary
    router
      .get('/api/cuti/summary/:pegawaiId/:tahun', [CutiController, 'getSummary'])
      .as('cuti.summary')

    // Absensi routes
    router.get('/absensi', [AbsensiController, 'index']).as('absensi.index')
    router.get('/absensi/create', [AbsensiController, 'create']).as('absensi.create')
    router.post('/absensi', [AbsensiController, 'store']).as('absensi.store')
    router.get('/absensi/:tanggal', [AbsensiController, 'show']).as('absensi.show')
    router.get('/absensi/:tanggal/edit', [AbsensiController, 'edit']).as('absensi.edit')
    router.delete('/absensi/:tanggal/delete', [AbsensiController, 'destroy']).as('absensi.destroy')
  })
  .use(middleware.auth())

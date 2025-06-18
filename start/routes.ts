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

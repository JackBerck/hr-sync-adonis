/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const JabatanController = () => import('#controllers/jabatans_controller')
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

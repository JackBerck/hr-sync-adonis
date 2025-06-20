import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { loginValidator, registerValidator } from '#validators/auth'

export default class AuthController {
  /**
   * Show login form
   */
  async showLogin({ view }: HttpContext) {
    return view.render('pages/auth/login')
  }

  /**
   * Handle login
   */
  async login({ auth, request, response, session }: HttpContext) {
    try {
      /**
       * Validate user credentials
       */
      const { email, password } = await request.validateUsing(loginValidator)

      /**
       * Attempt to verify user credentials and login
       */
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)

      /**
       * Redirect to dashboard on successful login
       */
      session.flash('success', `Selamat datang, ${user.fullName || user.email}!`)
      return response.redirect('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      session.flash('error', 'Email atau password salah. Silakan coba lagi.')
      return response.redirect().back()
    }
  }

  /**
   * Show register form
   */
  async showRegister({ view }: HttpContext) {
    return view.render('pages/auth/register')
  }

  /**
   * Handle registration
   */
  async register({ auth, request, response, session }: HttpContext) {
    try {
      /**
       * Validate user input
       */
      const payload = await request.validateUsing(registerValidator)
      const { fullName, email, password } = payload

      /**
       * Create a new user
       */
      const user = await User.create({
        fullName,
        email,
        password,
      })

      /**
       * Login the user after registration
       */
      await auth.use('web').login(user)

      /**
       * Redirect to dashboard
       */
      session.flash('success', `Akun berhasil dibuat! Selamat datang, ${user.fullName}!`)
      return response.redirect('/dashboard')
    } catch (error) {
      console.error('Registration error:', error)
      session.flash('error', 'Gagal membuat akun. Silakan coba lagi.')
      return response.redirect().back()
    }
  }

  /**
   * Logout user
   */
  async logout({ auth, response, session }: HttpContext) {
    await auth.use('web').logout()
    session.flash('success', 'Anda telah berhasil logout.')
    return response.redirect('/login')
  }
}

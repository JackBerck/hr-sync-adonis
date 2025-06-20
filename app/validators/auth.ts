import vine from '@vinejs/vine'

/**
 * Validator to validate user login
 */
export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string(),
  })
)

/**
 * Validator to validate user registration
 */
export const registerValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(100),
    email: vine
      .string()
      .email()
      .normalizeEmail()
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first()
        return !user
      }),
    password: vine.string().minLength(6).maxLength(100),
    passwordConfirmation: vine.string().confirmed({ confirmationField: 'password' }),
  })
)

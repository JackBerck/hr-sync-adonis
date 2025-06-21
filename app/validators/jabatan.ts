import vine from '@vinejs/vine'

export const createJabatanValidator = vine.compile(
  vine.object({
    nama_jabatan: vine
      .string()
      .trim()
      .minLength(2)
      .maxLength(100)
      .regex(/^[a-zA-Z\s]+$/),
    tunjangan: vine.number().min(0).max(999999999),
  })
)

export const updateJabatanValidator = vine.compile(
  vine.object({
    nama_jabatan: vine
      .string()
      .trim()
      .minLength(2)
      .maxLength(100)
      .regex(/^[a-zA-Z\s]+$/)
      .optional(),
    tunjangan: vine.number().min(0).max(999999999).optional(),
  })
)

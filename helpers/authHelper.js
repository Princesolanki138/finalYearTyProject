import bcrypt from "bcrypt"

export const hashPassword = async (password) => {
  try {
    const saltRound = 10
    const hashedPassd = await bcrypt.hash(password, saltRound)
    return hashedPassd
  } catch (error) {
    console.log(error)
  }
}

export const comparePassd = async (password, hashedPassd) => {
  try {
    const compareThePassd = await bcrypt.compare(password, hashedPassd)
    return compareThePassd

  } catch (error) {
    console.log(error)
  }
}
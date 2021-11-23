import UserService from "./user-service"

export { updateUser, getUser, clearUser, parseGender } from "./base-service"

export const User = new UserService()

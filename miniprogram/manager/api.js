import UserService from "./user-service"

export { updateUser, getUser, clearUser, setToken, parseGender } from "./base-service"

export const User = new UserService()

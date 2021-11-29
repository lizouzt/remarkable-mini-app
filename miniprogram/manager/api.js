import UserService from "./user-service"
import DeviceService from './device-service'

export { updateUser, getUser, clearUser, setToken, parseGender } from "./base-service"

export const User = new UserService()
export const Device = new DeviceService()


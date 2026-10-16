import axios from "axios";

export const SESSION_STORAGE_KEY = "eventplus:session"
export const UNATHORIZED_EVENT = "eventplus:unauhtorized"

export const axiosInstance = axios.create({
    baseURL: "https://localhost:7061/api/",
    timeout: 15000,
    headers: {
        Accept: "application/json"
    }
})
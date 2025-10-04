import axios from "axios"
import { BASE_URL } from "../../config/config"

export const GROUP_ROUTES = {
    GET_GROUPS: '/api/campus/get/sections/',
    GET_SECTIONS: 'api/campus/get/sections/'
}

export const adminApi = axios.create({
    baseURL:BASE_URL, 
    withCredentials:true,
    headers :{
        'Content-Type' : "application/json"
    }

})
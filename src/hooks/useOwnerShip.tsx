import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { BASE_URL } from "../config/config"
import { withToken } from "../api/HttpClient"

const getGroupOwnerShip = async (userId: string, role: string) => {
    withToken(async (token) => {
        const res = await axios.get(`${BASE_URL}/api/campus/${userId}/${role}/ownership`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        return res.data;
    })
}
export const useOwnerShip = async ({ userId, role }: {
    userId: string,
    role: string
}) => {
    return useQuery({
        queryKey: ['ownsership', userId],
        queryFn: () => getGroupOwnerShip(userId, role)
    })
}
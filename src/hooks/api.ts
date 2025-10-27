import axios, { type AxiosInstance } from "axios";
import { BASE_URL } from "../config/config";

export const GROUP_ROUTES = {
  GET_USER_GROUP: "/api/data/user/groups/",
  GET_USER_INVITE: "/api/data/user/invites/",
  GET_USER_SECTION: "/api/data/user/sections/",
} as const;

export const userApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

import { useEffect } from "react";
import { LOGIN_URL } from "../config/config";

export default function Login() {
  useEffect(() => {
    window.location.href = LOGIN_URL;
  }, []);
  return <></>;
}

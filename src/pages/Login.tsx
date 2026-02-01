import { useUser } from "../context/UserContext";

export default function Login() {
  // useEffect(() => {
  //   window.location.href = LOGIN_URL;
  // }, []);
  const {user} = useUser();
  return <>
  {JSON.stringify(user)}
  </>;
}

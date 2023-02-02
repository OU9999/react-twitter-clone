import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { loginState } from "./atoms";

function Root() {
  const navigate = useNavigate();
  const isLogin = useRecoilValue(loginState);
  useEffect(() => {
    isLogin === true ? navigate("/home") : navigate("/auth");
  }, []);
  return (
    <>
      <Outlet />
    </>
  );
}

export default Root;

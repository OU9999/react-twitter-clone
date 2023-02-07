import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { authService } from "./firebase";
import Navi from "./components/Navi";

import { User } from "firebase/auth";

function Root() {
  const [init, setInit] = useState(false);
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [userObj, setUserObj] = useState<User | null>(null);

  useEffect(() => {
    authService.onAuthStateChanged((user) => {
      if (user) {
        setIsLogin(true);
        setUserObj(user);
      } else {
        setIsLogin(false);
      }
      setInit(true);
    });
  }, []);

  useEffect(() => {
    isLogin === true ? navigate("/home") : navigate("/auth");
  }, [isLogin]);

  return (
    <>
      {isLogin && <Navi />}
      {init ? <Outlet context={{ userObj }} /> : "init..."}
      <footer>&copy; {new Date().getFullYear()} Twitter</footer>
    </>
  );
}

export default Root;

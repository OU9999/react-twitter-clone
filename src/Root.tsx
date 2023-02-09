import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { authService } from "./firebase";
import Navi from "./components/Navi";
import { updateCurrentUser, User } from "firebase/auth";

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

  const refreshUser = async () => {
    await updateCurrentUser(authService, authService.currentUser);
    setUserObj(authService.currentUser);
  };

  return (
    <>
      {isLogin && <Navi userObj={userObj!} />}
      {init ? <Outlet context={{ userObj, refreshUser }} /> : "init..."}
    </>
  );
}

export default Root;

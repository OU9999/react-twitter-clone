import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { authService } from "./firebase";
import Navi from "./components/Navi";
import { updateCurrentUser, User } from "firebase/auth";
import styled from "styled-components";

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: ${(props) => props.theme.bgColor};
`;

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
      <Wrapper>
        {isLogin && <Navi userObj={userObj!} />}
        {init ? <Outlet context={{ userObj, refreshUser }} /> : "init..."}
      </Wrapper>
    </>
  );
}

export default Root;

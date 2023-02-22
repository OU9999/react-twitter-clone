import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import Navi from "./components/Navi";
import { updateCurrentUser, User } from "firebase/auth";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";
import { motion } from "framer-motion";
import { authService } from "./utils/firebase";

const Wrapper = styled.div`
  width: 100vw;
  height: calc(var(--vh, 1vh) * 100);
  background-color: ${(props) => props.theme.bgColor};
`;

const Div = styled(motion.div)`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 10rem;
`;

export default function Root() {
  const [init, setInit] = useState(false);
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [userObj, setUserObj] = useState<User | null>(null);

  const setScreenSize = () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`); //"--vh"라는 속성으로 정의해준다.
  };
  window.addEventListener("resize", () => setScreenSize());

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogin]);

  const refreshUser = async () => {
    await updateCurrentUser(authService, authService.currentUser);
    setUserObj(authService.currentUser);
  };

  return (
    <>
      <Wrapper>
        {isLogin && <Navi userObj={userObj!} />}
        {init ? (
          <Outlet context={{ userObj, refreshUser }} />
        ) : (
          <Div>
            <FontAwesomeIcon icon={faTwitter} />
          </Div>
        )}
      </Wrapper>
    </>
  );
}

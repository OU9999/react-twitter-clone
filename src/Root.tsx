import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { authService } from "./firebase";
import Navi from "./components/Navi";
import { updateCurrentUser, User } from "firebase/auth";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";
import { motion } from "framer-motion";

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: ${(props) => props.theme.bgColor};
`;

const Div = styled(motion.div)`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 200px;
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

export default Root;

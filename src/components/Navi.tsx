import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { updateProfile, User } from "firebase/auth";
import { motion, useAnimation, Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { GUEST_ICON } from "../constants/constant";

const UserIcon = styled.div<{ userimg: string }>`
  position: fixed;
  top: 30px;
  right: 30px;
  z-index: 99;
  width: 50px;
  height: 50px;
  border-radius: 50px;
  background-color: ${(props) => props.theme.birdColor};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const UserImg = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50px;
`;

const UserIconInside = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50px;
  background-color: ${(props) => props.theme.birdColor};
  cursor: pointer;
`;

const Overlay = styled(motion.div)`
  z-index: 99;
  position: fixed;
  top: 100px;
  right: 50px;
  height: 250px;
  background-color: ${(props) => props.theme.textColor};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transform-origin: top right;
  border: 5px solid ${(props) => props.theme.birdColor};
  border-radius: 20px;
`;

const NavButton = styled(Link)`
  background-color: ${(props) => props.theme.textColor};
  color: ${(props) => props.theme.bgColor};
  transition: all 0.3s ease-in-out;
  text-align: center;
  font-weight: bold;
  font-size: 25px;
  padding: 20px;
  width: 100%;
  margin: 10px 0px;
  &:hover {
    background-color: ${(props) => props.theme.birdColor};
    color: ${(props) => props.theme.textColor};
  }
`;

const XButtonDiv = styled(motion.div)`
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 20px;
  color: ${(props) => props.theme.bgColor};
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  &:hover {
    color: ${(props) => props.theme.birdColor};
  }
`;

const overlayVar: Variants = {
  hidden: {
    opacity: 0,
    scaleY: 0,
    scaleX: 0,
    transition: {
      type: "linear",
      duration: 0.3,
    },
  },
  visible: {
    opacity: 1,
    scaleY: 1,
    scaleX: 1,
    transition: {
      type: "linear",
      duration: 0.3,
    },
  },
};

interface INaviProps {
  userObj: User;
}

export default function Navi({ userObj }: INaviProps) {
  const [overlayOn, setOverlayOn] = useState(false);
  const overlayAni = useAnimation();

  if (userObj.displayName === null) {
    const name = userObj!.email!.split("@")[0];
    updateProfile(userObj, {
      displayName: name,
    });
  }

  useEffect(() => {
    if (overlayOn === true) {
      overlayAni.start("visible");
    } else {
      overlayAni.start("hidden");
    }
  }, [overlayOn]);

  const onIconClick = () => {
    setOverlayOn((prev) => !prev);
  };

  return (
    <>
      <UserIcon onClick={onIconClick} userimg={userObj.photoURL!}>
        <UserImg
          src={userObj.photoURL !== null ? userObj.photoURL : GUEST_ICON}
        />
      </UserIcon>

      <Overlay variants={overlayVar} initial="hidden" animate={overlayAni}>
        <UserIconInside onClick={onIconClick}>
          <UserImg
            src={userObj.photoURL !== null ? userObj.photoURL : GUEST_ICON}
          />
        </UserIconInside>
        <NavButton to="/home">Home</NavButton>
        <NavButton to="/profile">{userObj.displayName}'s Profile</NavButton>
        <XButtonDiv onClick={onIconClick}>
          <FontAwesomeIcon icon={faX} />
        </XButtonDiv>
      </Overlay>
    </>
  );
}

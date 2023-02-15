import { faPenToSquare, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { PathMatch, useMatch, useNavigate } from "react-router-dom";
import ReactTextareaAutosize from "react-textarea-autosize";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import {
  ITweetUserObj,
  layoutIdAtom,
  modalEdit,
  profileEditAtom,
  tweetUserObjAtom,
} from "../atoms";
import { GUEST_ICON } from "../constants/constant";
import { dbService, storageService } from "../firebase";
import { ITweets } from "../screens/Home";
import { theme } from "../theme";
import { dateFormatter } from "../utils";
import Modal from "./Modal";

const TweetDiv = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background-color: ${(props) => props.theme.textColor};
  color: ${(props) => props.theme.bgColor};
  padding: 20px;
  border: 3px solid black;
  border-radius: 25px;
  margin: 10px;
  width: 100%;
  box-sizing: border-box;
  position: relative;
`;

const TweetUserImg = styled.img`
  width: 75px;
  height: 75px;
  border-radius: 50%;
  margin-right: 15px;
`;

const TweetUserInfo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
`;

const TweetUserName = styled.span`
  font-weight: bold;
  margin-right: 10px;
`;

const TweetDate = styled.span`
  font-weight: 100;
  color: gray;
`;

const TweetColumn = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-direction: column;
`;

const TweetArea = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 500px;
`;

const TweetTextArea = styled(ReactTextareaAutosize)`
  display: block;
  width: 100%;
  height: 200px;
  font-weight: 400;
  font-size: 20px;
  background: none;
  border: none;
  color: black;
  resize: none;
`;

const TweetImg = styled.img`
  width: 100%;
  border-radius: 20px;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 10px;
  right: 10px;
`;

const TweetButton = styled(motion.button)`
  padding: 5px;
  border: 1px solid black;
  border-radius: 5px;
  margin-right: 3px;
  cursor: pointer;
`;

const InputFileButtonX = styled.button`
  background-color: ${(props) => props.theme.textColor};
  color: ${(props) => props.theme.bgColor};
  transition: all 0.3s ease-in-out;
  font-weight: bold;
  font-size: 25px;
  padding: 20px;
  width: 20px;
  height: 20px;
  border: 3px solid gray;
  border-radius: 10px;
  margin: 10px 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 10px;
  cursor: pointer;
`;

const InputFileButton = styled(InputFileButtonX)`
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.birdColor};
    color: ${(props) => props.theme.textColor};
  }
`;

interface ITweetProps {
  tweetObj: ITweets;
  isOwner: boolean;
  layoutId: string;
  isProfile: boolean;
  first?: boolean | null;
}

export default function Tweet({
  tweetObj,
  isOwner,
  layoutId,
  isProfile,
  first,
}: Partial<ITweetProps>) {
  const tweetRef = doc(dbService, "tweets", `${tweetObj?.id}`);
  const [isModalEdit, setIsModalEdit] = useRecoilState(modalEdit);
  const [tweetUserObj, setTweetUserObj] = useRecoilState(tweetUserObjAtom);
  const [giveLayoutId, setGiveLayoutId] = useRecoilState(layoutIdAtom);
  const [isProfileEdit, setIsProfileEdit] = useRecoilState(profileEditAtom);

  const onDeleteClick = async () => {
    const ok = window.confirm("진짜 지울거야?");
    if (ok) {
      await deleteDoc(doc(dbService, "tweets", `${tweetObj?.id}`));
      await deleteObject(ref(storageService, tweetObj?.attachmentUrl!));
    }
  };

  const onEditClick = async () => {
    await setTweetUserObj(tweetObj as ITweetUserObj);
    await setGiveLayoutId(layoutId!);
    setIsModalEdit(true);
  };

  const onProfileEditClick = async () => {
    await setTweetUserObj(tweetObj as ITweetUserObj);
    await setGiveLayoutId(layoutId!);
    setIsProfileEdit(true);
  };

  return (
    <>
      {first ? null : (
        <>
          <TweetDiv layoutId={layoutId}>
            <TweetUserImg
              src={
                tweetObj?.photoUrl !== null ? tweetObj?.photoUrl : GUEST_ICON
              }
            />
            <TweetColumn>
              <TweetUserInfo>
                <TweetUserName>{tweetObj?.displayName}</TweetUserName>
                {tweetObj?.createdAt && (
                  <TweetDate>{dateFormatter(tweetObj.createdAt)}</TweetDate>
                )}
              </TweetUserInfo>

              <TweetArea>
                <TweetTextArea autoFocus disabled value={tweetObj?.text!} />
                {tweetObj?.attachmentUrl && (
                  <TweetImg src={tweetObj.attachmentUrl} />
                )}
              </TweetArea>
            </TweetColumn>
            <Buttons>
              {isProfile
                ? null
                : isOwner && (
                    <>
                      <TweetButton
                        onClick={onDeleteClick}
                        whileHover={{
                          backgroundColor: theme.birdColor,
                          color: theme.textColor,
                        }}
                      >
                        삭제
                      </TweetButton>
                      <TweetButton
                        onClick={onEditClick}
                        whileHover={{
                          backgroundColor: theme.birdColor,
                          color: theme.textColor,
                        }}
                      >
                        수정
                      </TweetButton>
                    </>
                  )}
            </Buttons>
          </TweetDiv>
          {isProfile ? (
            <>
              <InputFileButton onClick={onProfileEditClick}>
                <FontAwesomeIcon icon={faPenToSquare} />
              </InputFileButton>
              <InputFileButton onClick={onDeleteClick}>
                <FontAwesomeIcon icon={faX} />
              </InputFileButton>
            </>
          ) : null}
        </>
      )}
    </>
  );
}

import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMatch, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import {
  ITweetUserObj,
  layoutIdAtom,
  modalEdit,
  tweetUserObjAtom,
} from "../atoms";
import { dbService, storageService } from "../firebase";
import { ITweets } from "../screens/Home";
import Modal from "./Modal";

const TweetDiv = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: ${(props) => props.theme.textColor};
  color: ${(props) => props.theme.bgColor};
`;

const TweetColumn = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const TweetTextArea = styled.span`
  font-size: 25px;
`;

const TweetImg = styled.img`
  width: 100px;
  height: 100px;
`;

const TweetButton = styled(motion.button)``;

interface ITweetProps {
  tweetObj: ITweets;
  isOwner: boolean;
  layoutId: string;
}

export default function Tweet({
  tweetObj,
  isOwner,
  layoutId,
}: Partial<ITweetProps>) {
  const [editing, setEditing] = useState(false);
  const { register, getValues, handleSubmit, reset } = useForm({
    mode: "onChange",
  });
  const tweetRef = doc(dbService, "tweets", `${tweetObj?.id}`);
  const [isModalEdit, setIsModalEdit] = useRecoilState(modalEdit);
  const [tweetUserObj, setTweetUserObj] = useRecoilState(tweetUserObjAtom);
  const [giveLayoutId, setGiveLayoutId] = useRecoilState(layoutIdAtom);

  const onDeleteClick = async () => {
    const ok = window.confirm("진짜 지울거야?");
    if (ok) {
      await deleteDoc(doc(dbService, "tweets", `${tweetObj?.id}`));
      await deleteObject(ref(storageService, tweetObj?.attachmentUrl));
    }
  };

  const toggleEditing = () => {
    setEditing((prev) => !prev);
  };

  const onSubmit = async () => {
    const { newTweet } = getValues();
    await updateDoc(tweetRef, { text: newTweet });
    setEditing(false);
    reset();
  };

  const onEditClick = async () => {
    await setTweetUserObj(tweetObj as ITweetUserObj);
    await setGiveLayoutId(layoutId!);
    setIsModalEdit(true);
  };

  return (
    <>
      <TweetDiv layoutId={layoutId}>
        {editing ? (
          <>
            <form onSubmit={handleSubmit(onSubmit)}>
              <input {...register("newTweet")} />
              <button>Update</button>
            </form>
            <button onClick={toggleEditing}>cancel</button>
          </>
        ) : (
          <>
            <TweetColumn>
              <TweetTextArea>{tweetObj?.text}</TweetTextArea>
              {tweetObj?.attachmentUrl && (
                <TweetImg src={tweetObj.attachmentUrl} />
              )}
            </TweetColumn>
            <TweetColumn>
              {isOwner && (
                <>
                  <TweetButton onClick={onDeleteClick}>
                    Delete Tweet
                  </TweetButton>
                  <TweetButton onClick={onEditClick}>Edit Tweet</TweetButton>
                </>
              )}
            </TweetColumn>
          </>
        )}
      </TweetDiv>
    </>
  );
}

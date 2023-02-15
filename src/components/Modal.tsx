import { uuidv4 } from "@firebase/util";
import { faImage, faPenToSquare, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { motion, useAnimation, Variants } from "framer-motion";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from "styled-components";
import { modalEdit, profileEditAtom, tweetUserObjAtom } from "../atoms";
import { dbService, storageService } from "../firebase";
import { IHomeProps } from "../screens/Home";

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 98;
`;

const Formdiv = styled.div`
  z-index: 99;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  width: 70vw;
  height: 80vh;
`;

const Form = styled(motion.form)`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: white;
  z-index: 3;
  position: relative;
  border-radius: 30px;
`;

const FormColumn = styled.div`
  display: flex;
  justify-content: flex-start;
  width: 100%;
`;

const UserName = styled.span`
  margin-left: 25px;
  font-size: 50px;
  color: ${(props) => props.theme.bgColor};
`;

const ExitButton = styled.span`
  font-size: 40px;
  color: ${(props) => props.theme.bgColor};
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  position: absolute;
  top: 20px;
  right: 20px;
  &:hover {
    color: ${(props) => props.theme.birdColor};
  }
`;

const Hrdiv = styled.div`
  width: 100%;
  height: 5px;
  background-color: gray;
  margin-top: 10px;
  margin-bottom: 30px;
`;

const InputText = styled.textarea`
  display: flex;
  width: 90%;
  height: 350px;
  font-size: 20px;
  padding: 10px;
  margin-bottom: 10px;
  resize: none;
`;

const InputFile = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 50%;
`;

const Column = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0px 50px;
`;

const AttachmentDiv = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 50%;
  img {
    width: 70px;
    height: 70px;
    border-radius: 8px;
  }
`;

const InputFileButtonX = styled.button`
  background-color: ${(props) => props.theme.textColor};
  color: ${(props) => props.theme.bgColor};
  transition: all 0.3s ease-in-out;
  font-weight: bold;
  font-size: 35px;
  padding: 20px;
  width: 70px;
  height: 70px;
  border: 3px solid gray;
  border-radius: 15px;
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

const ClearButton = styled(InputFileButton)`
  width: 50px;
  height: 50px;
  font-size: 20px;
`;

const SubmitSpan = styled(motion.span)`
  background-color: ${(props) => props.theme.birdColor};
  color: ${(props) => props.theme.textColor};
  font-size: 25px;
  padding: 10px;
  border-radius: 15px;
  opacity: 0;
`;

const SubmitSpanVar: Variants = {
  normal: { opacity: 0, transition: { duration: 2 } },
  start: { opacity: [0, 1, 1, 1, 0], transition: { duration: 3 } },
};

interface IModalProps {
  layoutId: string;
  isEdit?: boolean;
}

export default function Modal({ layoutId, isEdit }: IModalProps) {
  const { userObj } = useOutletContext<IHomeProps>();
  const navigation = useNavigate();
  const messageAni = useAnimation();
  const [isModalEdit, setIsModalEdit] = useRecoilState(modalEdit);
  const tweetUserObj = useRecoilValue(tweetUserObjAtom);
  const [attachment, setAttachment] = useState<string | null>();
  const [message, setMessage] = useState<string | null>(null);
  const [attachmentEdit, setAttachmentEdit] = useState<string | null>(
    tweetUserObj.attachmentUrl
  );
  const fileinput = useRef<HTMLInputElement>(null);
  const tweetRef = doc(dbService, "tweets", `${tweetUserObj.id}`);

  const onOverlayClick = () => {
    if (isEdit) {
      setIsModalEdit(false);
    }
    navigation("/home");
  };

  const {
    register,
    getValues,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm({ mode: "onChange" });

  const showMessage = (text: string) => {
    setMessage(text);
    messageAni.start("start");
  };

  const onSubmit = async () => {
    const { tweet } = getValues();
    if (tweet.length > 500) {
      showMessage(
        `문자는 500글자 이상 쓸 수 없습니다. 현재 문자:(${tweet.length})`
      );
      return;
    }
    const attachmentRef = ref(storageService, `${userObj.uid}/${uuidv4()}`);
    let getAttachmentUrl = "";
    if (attachment) {
      const response = await uploadString(
        attachmentRef,
        attachment as string,
        "data_url"
      );
      getAttachmentUrl = await getDownloadURL(response.ref);
    }
    await addDoc(collection(dbService, "tweets"), {
      text: tweet,
      createdAt: Date.now(),
      creatorId: userObj.uid,
      attachmentUrl: getAttachmentUrl,
      displayName: userObj.displayName,
      photoUrl: userObj.photoURL,
    });
    reset();
    setAttachment(null);
    showMessage("작성 완료!");
  };

  const onXClick = () => {
    showMessage("텍스트는 최소 1자 이상 써야합니다.");
  };

  const onClearAttachment = (e: any) => {
    e.preventDefault();
    setAttachment(null);
  };

  const onClearAttachmentEdit = (e: any) => {
    e.preventDefault();
    setAttachmentEdit(null);
  };

  const onClickImageUpload = (e: any) => {
    e.preventDefault();
    fileinput?.current?.click();
  };

  const onFileChange = ({
    currentTarget: { files },
  }: React.FormEvent<HTMLInputElement>) => {
    if (files) {
      const uploadFile = files![0];
      const reader = new FileReader();
      reader.onloadend = (finishEvent) => {
        if (isEdit) {
          setAttachmentEdit(finishEvent.target?.result as string);
        } else {
          setAttachment(finishEvent.target?.result as string);
        }
      };
      reader.readAsDataURL(uploadFile);
    }
  };

  const updateTweet = async (tweet: string) => {
    if (tweet.length > 500) {
      showMessage(
        `문자는 500글자 이상 쓸 수 없습니다. 현재 문자:(${tweet.length})`
      );
      return;
    }
    const attachmentRef = ref(storageService, `${userObj.uid}/${uuidv4()}`);
    let getAttachmentUrl = "";
    if (attachmentEdit) {
      if (attachmentEdit.includes("https:")) {
        await updateDoc(tweetRef, {
          text: tweet,
          attachmentUrl: attachmentEdit,
          createdAt: Date.now(),
        });
        showMessage("수정 완료!");
        return;
      }
      const response = await uploadString(
        attachmentRef,
        attachmentEdit as string,
        "data_url"
      );
      getAttachmentUrl = await getDownloadURL(response.ref);
    }
    await updateDoc(tweetRef, {
      text: tweet,
      attachmentUrl: getAttachmentUrl,
      createdAt: Date.now(),
    });
    showMessage("수정 완료!");
  };

  const onEditButtonClick = async (e: any) => {
    e.preventDefault();
    const { tweet } = getValues();
    updateTweet(tweet);
  };

  return (
    <>
      <Overlay
        onClick={onOverlayClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <Formdiv>
        <Form onSubmit={handleSubmit(onSubmit)} layoutId={layoutId}>
          <FormColumn>
            <UserName>{userObj.displayName}'s Tweet</UserName>
            <ExitButton onClick={onOverlayClick}>
              <FontAwesomeIcon icon={faX} />
            </ExitButton>
          </FormColumn>
          <Hrdiv />
          <InputText
            {...register("tweet", {
              required: "텍스트는 빈칸으로 올릴수 없습니다.",
            })}
            defaultValue={isEdit ? tweetUserObj.text : ""}
          />
          <Column>
            {isEdit
              ? attachmentEdit && (
                  <AttachmentDiv>
                    <img src={attachmentEdit as string} alt="pic" />
                    <ClearButton onClick={onClearAttachmentEdit}>
                      <FontAwesomeIcon icon={faX} />
                    </ClearButton>
                  </AttachmentDiv>
                )
              : null}
            {attachment && (
              <AttachmentDiv>
                <img src={attachment} alt="pic" />
                <ClearButton onClick={onClearAttachment}>
                  <FontAwesomeIcon icon={faX} />
                </ClearButton>
              </AttachmentDiv>
            )}

            <InputFile>
              <SubmitSpan variants={SubmitSpanVar} animate={messageAni}>
                {message}
              </SubmitSpan>
              <InputFileButton onClick={onClickImageUpload}>
                <FontAwesomeIcon icon={faImage} />
              </InputFileButton>
              <input
                type="file"
                onChange={onFileChange}
                accept="image/*"
                ref={fileinput}
                style={{ display: "none" }}
              />
            </InputFile>
            {isEdit ? (
              <InputFileButton onClick={onEditButtonClick}>
                <FontAwesomeIcon icon={faPenToSquare} />
              </InputFileButton>
            ) : isValid ? (
              <InputFileButton type="submit" disabled={isValid ? false : true}>
                <FontAwesomeIcon icon={faPenToSquare} />
              </InputFileButton>
            ) : (
              <InputFileButtonX onClick={onXClick}>
                <FontAwesomeIcon icon={faPenToSquare} />
              </InputFileButtonX>
            )}
          </Column>
        </Form>
      </Formdiv>
    </>
  );
}

export function ModalProfile({ layoutId, isEdit }: IModalProps) {
  const { userObj } = useOutletContext<IHomeProps>();
  const navigation = useNavigate();
  const messageAni = useAnimation();
  const tweetUserObj = useRecoilValue(tweetUserObjAtom);
  const [message, setMessage] = useState<string | null>(null);
  const [attachmentEdit, setAttachmentEdit] = useState<string | null>(
    tweetUserObj.attachmentUrl
  );
  const fileinput = useRef<HTMLInputElement>(null);
  const tweetRef = doc(dbService, "tweets", `${tweetUserObj.id}`);
  const [isProfileEdit, setIsProfileEdit] = useRecoilState(profileEditAtom);

  const onOverlayClick = () => {
    if (isEdit) {
      setIsProfileEdit(false);
    }
    navigation("/profile");
  };

  const {
    register,
    getValues,
    formState: { isValid },
  } = useForm({ mode: "onChange" });

  const showMessage = (text: string) => {
    setMessage(text);
    messageAni.start("start");
  };

  const onXClick = () => {
    showMessage("텍스트는 최소 1자 이상 써야합니다.");
  };

  const onClearAttachmentEdit = (e: any) => {
    e.preventDefault();
    setAttachmentEdit(null);
  };

  const onClickImageUpload = (e: any) => {
    e.preventDefault();
    fileinput?.current?.click();
  };

  const onFileChange = ({
    currentTarget: { files },
  }: React.FormEvent<HTMLInputElement>) => {
    if (files) {
      const uploadFile = files![0];
      const reader = new FileReader();
      reader.onloadend = (finishEvent) => {
        if (isEdit) {
          setAttachmentEdit(finishEvent.target?.result as string);
        }
      };
      reader.readAsDataURL(uploadFile);
    }
  };

  const updateTweet = async (tweet: string) => {
    if (tweet.length > 500) {
      showMessage(
        `문자는 500글자 이상 쓸 수 없습니다. 현재 문자:(${tweet.length})`
      );
      return;
    }
    const attachmentRef = ref(storageService, `${userObj.uid}/${uuidv4()}`);
    let getAttachmentUrl = "";
    if (attachmentEdit) {
      if (attachmentEdit.includes("https:")) {
        await updateDoc(tweetRef, {
          text: tweet,
          attachmentUrl: attachmentEdit,
          createdAt: Date.now(),
        });
        showMessage("수정 완료!");
        return;
      }
      const response = await uploadString(
        attachmentRef,
        attachmentEdit as string,
        "data_url"
      );
      getAttachmentUrl = await getDownloadURL(response.ref);
    }
    await updateDoc(tweetRef, {
      text: tweet,
      attachmentUrl: getAttachmentUrl,
      createdAt: Date.now(),
    });
    showMessage("수정 완료!");
  };

  const onEditButtonClick = async (e: any) => {
    e.preventDefault();
    const { tweet } = getValues();
    updateTweet(tweet);
  };

  return (
    <>
      <Overlay
        onClick={onOverlayClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <Formdiv>
        <Form layoutId={layoutId}>
          <FormColumn>
            <UserName>{userObj.displayName}'s Tweet</UserName>
            <ExitButton onClick={onOverlayClick}>
              <FontAwesomeIcon icon={faX} />
            </ExitButton>
          </FormColumn>
          <Hrdiv />
          <InputText
            {...register("tweet", {
              required: "텍스트는 빈칸으로 올릴수 없습니다.",
            })}
            defaultValue={isEdit ? tweetUserObj.text : ""}
          />
          <Column>
            {isEdit
              ? attachmentEdit && (
                  <AttachmentDiv>
                    <img src={attachmentEdit as string} alt="pic" />
                    <ClearButton onClick={onClearAttachmentEdit}>
                      <FontAwesomeIcon icon={faX} />
                    </ClearButton>
                  </AttachmentDiv>
                )
              : null}

            <InputFile>
              <SubmitSpan variants={SubmitSpanVar} animate={messageAni}>
                {message}
              </SubmitSpan>
              <InputFileButton onClick={onClickImageUpload}>
                <FontAwesomeIcon icon={faImage} />
              </InputFileButton>
              <input
                type="file"
                onChange={onFileChange}
                accept="image/*"
                ref={fileinput}
                style={{ display: "none" }}
              />
            </InputFile>
            {isEdit ? (
              <InputFileButton onClick={onEditButtonClick}>
                <FontAwesomeIcon icon={faPenToSquare} />
              </InputFileButton>
            ) : isValid ? (
              <InputFileButton type="submit" disabled={isValid ? false : true}>
                <FontAwesomeIcon icon={faPenToSquare} />
              </InputFileButton>
            ) : (
              <InputFileButtonX onClick={onXClick}>
                <FontAwesomeIcon icon={faPenToSquare} />
              </InputFileButtonX>
            )}
          </Column>
        </Form>
      </Formdiv>
    </>
  );
}

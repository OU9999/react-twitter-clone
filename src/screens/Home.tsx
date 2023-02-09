import { User } from "firebase/auth";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMatch, useNavigate, useOutletContext } from "react-router-dom";
import styled from "styled-components";
import Tweet from "../components/Tweet";
import { dbService, storageService } from "../firebase";
import { uuidv4 } from "@firebase/util";
import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faPenToSquare, faX } from "@fortawesome/free-solid-svg-icons";
import { theme } from "../theme";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  position: relative;
`;

const Write = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 300px;
  height: 100px;
  background-color: white;
  color: ${(props) => props.theme.bgColor};
  cursor: pointer;
  &:hover {
  }
`;

const Formdiv = styled.div`
  position: absolute;
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
`;

const InputFile = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 50%;
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
`;

const InputFileButton = styled(InputFileButtonX)`
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.birdColor};
    color: ${(props) => props.theme.textColor};
  }
`;
const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
`;

const TweetsDiv = styled.div``;

const AttachmentDiv = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 50%;
  img {
    width: 70px;
    height: 70px;
  }
`;
const ClearButton = styled(InputFileButton)`
  width: 100px;
  font-size: 25px;
`;
const Column = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0px 50px;
`;

export interface IHomeProps {
  userObj: User;
}

export interface ITweets {
  createdAt: number;
  creatorId: string;
  id: string;
  text: string;
  attachmentUrl: string;
}

export default function Home() {
  const ModalMatch = useMatch("/home/modal");
  const navigation = useNavigate();
  const { userObj } = useOutletContext<IHomeProps>();
  const {
    register,
    getValues,
    handleSubmit,
    reset,
    formState: { isValid, errors },
  } = useForm({ mode: "onChange" });
  const [tweets, setTweets] = useState<ITweets[]>([]);
  const [attachment, setAttachment] = useState<string | null>();
  const fileinput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(
      collection(dbService, "tweets"),
      orderBy("createdAt", "desc")
    );
    onSnapshot(q, (snapshot) => {
      const tweetArr: any = snapshot.docs.map((doc) => ({
        id: doc.id + "",
        ...doc.data(),
      }));
      setTweets(tweetArr);
    });
  }, []);

  const onSubmit = async () => {
    const { tweet } = getValues();
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
    });
    reset();
    setAttachment(null);
  };

  const onFileChange = ({
    currentTarget: { files },
  }: React.FormEvent<HTMLInputElement>) => {
    if (files) {
      const uploadFile = files![0];
      const reader = new FileReader();
      reader.onloadend = (finishEvent) => {
        setAttachment(finishEvent.target?.result as string);
      };
      reader.readAsDataURL(uploadFile);
    }
  };

  const onClearAttachment = (e: any) => {
    e.preventDefault();
    setAttachment(null);
    if (fileinput.current) {
      fileinput.current.value = "";
    }
  };

  const onWriteClick = () => {
    navigation("/home/modal");
  };

  const onOverlayClick = () => {
    navigation("/home");
  };

  const onClickImageUpload = (e: any) => {
    e.preventDefault();
    fileinput?.current?.click();
  };

  return (
    <>
      <Wrapper>
        <Write
          onClick={onWriteClick}
          layoutId="1"
          whileHover={{
            backgroundColor: theme.birdColor,
            color: theme.textColor,
          }}
        >
          Click Me!
        </Write>
        <TweetsDiv>
          <div>
            {tweets.map((tweet) => (
              <Tweet
                key={tweet.id}
                tweetObj={tweet}
                isOwner={tweet.creatorId === userObj.uid}
              />
            ))}
          </div>
        </TweetsDiv>
        <AnimatePresence>
          {ModalMatch ? (
            <>
              <Overlay
                onClick={onOverlayClick}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <Formdiv>
                <Form onSubmit={handleSubmit(onSubmit)} layoutId="1">
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
                  />
                  <Column>
                    {attachment && (
                      <AttachmentDiv>
                        <img src={attachment} />
                        <ClearButton onClick={onClearAttachment}>
                          Clear
                        </ClearButton>
                      </AttachmentDiv>
                    )}

                    <InputFile>
                      <span style={{ color: "black" }}>
                        {errors.tweet?.message as string}
                      </span>
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

                    {isValid ? (
                      <InputFileButton
                        type="submit"
                        disabled={isValid ? false : true}
                      >
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </InputFileButton>
                    ) : (
                      <InputFileButtonX
                        type="submit"
                        disabled={isValid ? false : true}
                      >
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </InputFileButtonX>
                    )}
                  </Column>
                </Form>
              </Formdiv>
            </>
          ) : null}
        </AnimatePresence>
      </Wrapper>
    </>
  );
}

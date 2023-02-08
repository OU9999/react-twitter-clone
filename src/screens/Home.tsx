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
import { useOutletContext } from "react-router-dom";
import styled from "styled-components";
import Tweet from "../components/Tweet";
import { dbService, storageService } from "../firebase";
import { uuidv4 } from "@firebase/util";

const Wrapper = styled.div``;

const Form = styled.form``;

const Input = styled.input``;

interface IHomeProps {
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
  const { userObj } = useOutletContext<IHomeProps>();
  const {
    register,
    getValues,
    handleSubmit,
    reset,
    formState: { isValid },
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

  const onClearAttachment = () => {
    setAttachment(null);
    // 중요하다
    if (fileinput.current) {
      fileinput.current.value = "";
    }
  };

  return (
    <>
      <Wrapper>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Input
            {...register("tweet", { required: true })}
            type="text"
            placeholder="what's happening?"
          />
          <Input
            type="file"
            onChange={onFileChange}
            accept="image/*"
            ref={fileinput}
          />
          <button disabled={isValid ? false : true}>Tweet</button>
          {attachment && (
            <div>
              <img src={attachment} width="50px" height="50px" />
              <button onClick={onClearAttachment}>Clear</button>
            </div>
          )}
        </Form>
        <div>
          {tweets.map((tweet) => (
            <Tweet
              key={tweet.id}
              tweetObj={tweet}
              isOwner={tweet.creatorId === userObj.uid}
            />
          ))}
        </div>
      </Wrapper>
    </>
  );
}

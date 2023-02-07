import { User } from "firebase/auth";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useOutletContext } from "react-router-dom";
import styled from "styled-components";
import Tweet from "../components/Tweet";
import { dbService } from "../firebase";

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
  console.log(tweets);

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
      console.log(tweetArr);
      setTweets(tweetArr);
    });
  }, []);

  const onSubmit = async () => {
    const { tweet } = getValues();
    await addDoc(collection(dbService, "tweets"), {
      text: tweet,
      createdAt: Date.now(),
      creatorId: userObj.uid,
    });
    reset();
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
          <button disabled={isValid ? false : true}>Tweet</button>
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

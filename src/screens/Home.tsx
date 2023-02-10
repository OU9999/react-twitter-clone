import { User } from "firebase/auth";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useMatch, useNavigate, useOutletContext } from "react-router-dom";
import styled from "styled-components";
import Tweet from "../components/Tweet";
import { dbService } from "../firebase";
import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { theme } from "../theme";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";
import Modal from "../components/Modal";
import { useRecoilState, useRecoilValue } from "recoil";
import { layoutIdAtom, modalEdit } from "../atoms";

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
  justify-content: space-around;
  align-items: center;
  background-color: ${(props) => props.theme.textColor};
  color: ${(props) => props.theme.bgColor};
  font-weight: bold;
  font-size: 50px;
  padding: 20px;
  width: 400px;
  margin: 10px 0px;
  border-radius: 25px;
  cursor: pointer;
  svg {
    font-size: 100px;
  }
`;

const TweetsDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 70%;
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
  const ModalEditMatch = useMatch("/home/modal/edit");
  const navigation = useNavigate();
  const { userObj } = useOutletContext<IHomeProps>();
  const [tweets, setTweets] = useState<ITweets[]>([]);
  const [giveLayoutId, setGiveLayoutId] = useRecoilState(layoutIdAtom);
  const isModalEdit = useRecoilValue(modalEdit);

  useEffect(() => {
    if (isModalEdit === true) {
      navigation("/home/modal/edit");
    }
  }, [isModalEdit]);

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

  const onWriteClick = async () => {
    await setGiveLayoutId("new");

    navigation("/home/modal");
  };

  return (
    <>
      <Wrapper>
        <Write
          onClick={onWriteClick}
          layoutId={giveLayoutId as string}
          whileHover={{
            backgroundColor: theme.birdColor,
            color: theme.textColor,
          }}
        >
          Click Me
          <FontAwesomeIcon icon={faTwitter} />
        </Write>
        <TweetsDiv>
          <div>
            {tweets.map((tweet) => (
              <Tweet
                key={tweet.id}
                tweetObj={tweet}
                isOwner={tweet.creatorId === userObj.uid}
                layoutId={tweet.id as string}
              />
            ))}
          </div>
        </TweetsDiv>
        <AnimatePresence>
          {ModalMatch ? <Modal layoutId={giveLayoutId as string} /> : null}
          {ModalEditMatch ? (
            <Modal layoutId={giveLayoutId as string} isEdit={true} />
          ) : null}
        </AnimatePresence>
      </Wrapper>
    </>
  );
}

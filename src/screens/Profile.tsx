import { uuidv4 } from "@firebase/util";
import { faCamera, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { updateProfile } from "firebase/auth";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMediaQuery } from "react-responsive";
import { useMatch, useNavigate, useOutletContext } from "react-router-dom";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import { layoutIdAtom, profileEditAtom } from "../atoms";
import { ModalProfile } from "../components/Modal";
import Tweet from "../components/Tweet";
import { GUEST_ICON } from "../constants/constant";
import { authService, dbService, storageService } from "../firebase";
import { IHomeProps, ITweets } from "./Home";

const Wrapper = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  height: 100%;
  color: ${(props) => props.theme.bgColor};
  @media screen and (max-width: 767px) {
    flex-direction: column;
    height: auto;
  }
`;

const ProfileDiv = styled.div`
  display: flex;
  justify-self: center;
  align-items: center;
  flex-direction: column;
  width: 30%;
  height: 80%;
  background-color: ${(props) => props.theme.textColor};
  border-radius: 25px;
  padding: 20px;
  overflow: hidden;
  @media screen and (max-width: 767px) {
    margin: 1rem 0rem;
    width: 80%;
    height: 700px;
  }
`;

const ProfileImgColumn = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-bottom: 30px;
`;

const ProfileImg = styled.img`
  width: 200px;
  height: 200px;
  border-radius: 100px;
`;

const ProfileImgChange = styled.button`
  font-size: 30px;
  position: absolute;
  bottom: 0;
  right: 5px;
  background-color: white;
  border: 1px solid black;
  border-radius: 50%;
  cursor: pointer;
  @media screen and (max-width: 767px) {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 5px;
    height: 40px;
    color: black;
  }
`;

const ProfileTitle = styled.h1`
  font-size: 30px;
  margin-bottom: 10px;
  font-weight: bold;
`;

const EditTitle = styled.h1`
  font-size: 30px;
  margin-bottom: 30px;
`;

const ProfileForm = styled.form`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
`;

const InputText = styled.input`
  font-size: 20px;
  background-color: white;
  border: 3px solid gray;
  padding: 10px;
  border-radius: 10px;
`;

const UpdateDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  height: 25vh;
`;

const PhotoUrlDiv = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 3px solid gray;
  border-radius: 10px;
  padding: 10px;
  width: 50%;
  img {
    width: 75px;
    height: 75px;
    border-radius: 50%;
  }
  @media screen and (max-width: 767px) {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-left: 30px;
  }
`;

const PhotoDivButton = styled(motion.button)`
  font-size: 20px;
  color: "#e74c3c";
  cursor: pointer;
  &:hover {
  }
`;

const Buttons = styled.div`
  margin-top: 20px;
  display: flex;
  width: 100%;
  justify-content: space-around;
  align-items: center;
`;

const Button = styled.button`
  font-size: 20px;
  padding: 10px;
  border-radius: 10px;
  font-size: 20px;
  transition: all 0.3s ease-in-out;
  border: 3px solid ${(props) => props.theme.bgColor};
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.bgColor};
    color: ${(props) => props.theme.textColor};
  }
`;

//tweets
const TweetsDiv = styled.div`
  display: flex;
  justify-self: center;
  align-items: center;
  flex-direction: column;
  width: 60%;
  height: 80%;
  background-color: ${(props) => props.theme.textColor};
  border-radius: 25px;
  padding: 20px;
  overflow-x: hidden;
  overflow-y: scroll;
  @media screen and (max-width: 767px) {
    margin: 1rem 0rem;
    width: 80%;
    height: 50%;
  }
`;

const TweetName = styled.span`
  font-size: 50px;
  color: ${(props) => props.theme.bgColor};
  @media screen and (max-width: 767px) {
    font-size: 1.3rem;
  }
`;

const Hrdiv = styled.div`
  width: 110%;
  height: 5px;
  background-color: gray;
  margin-top: 10px;
  margin-bottom: 30px;
`;

const Tweets = styled.div`
  @media screen and (max-width: 767px) {
    background-color: black;
  }
`;

const TweetLine = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
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

const MobileTweetsDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: auto;
  border-top: 3px solid white;
  padding-top: 30px;
`;

const MobileTweetName = styled.h1`
  font-size: 1.8rem;
  background-color: ${(props) => props.theme.textColor};
  padding: 10px;
  border-radius: 30px;
  margin-bottom: 20px;
`;

const MobileTweets = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const buttonVar: Variants = {
  normal: {
    color: "#e74c3c",
  },
  active: {
    color: ["#e74c3c", "#34495e", "#e74c3c"],
    transition: {
      duration: 1,
      repeat: Infinity,
    },
  },
};

export default function Profile() {
  const { userObj } = useOutletContext<IHomeProps>();
  const { refreshUser } = useOutletContext<any>();
  const { register, getValues, handleSubmit } = useForm({
    mode: "onChange",
    defaultValues: { newName: userObj.displayName },
  });
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileinput = useRef<HTMLInputElement>(null);
  const [tweets, setTweets] = useState<ITweets[]>([]);
  const profileEditMatch = useMatch("/profile/edit");
  const [giveLayoutId, setGiveLayoutId] = useRecoilState(layoutIdAtom);
  const navigation = useNavigate();
  const [isProfileEdit, setIsProfileEdit] = useRecoilState(profileEditAtom);
  const isMobile: boolean = useMediaQuery({
    maxWidth: 767,
  });

  const onLogOutClick = () => {
    authService.signOut();
  };

  const getMyTweets = async () => {
    const q = query(
      collection(dbService, "tweets"),
      where("creatorId", "==", userObj.uid),
      orderBy("createdAt", "desc")
    );
    onSnapshot(q, (snapshot) => {
      const tweetArr: any = snapshot.docs.map((doc) => ({
        id: doc.id + "",
        ...doc.data(),
      }));
      setTweets(tweetArr);
    });
  };

  useEffect(() => {
    getMyTweets();
  }, []);

  useEffect(() => {
    if (isProfileEdit === true) {
      navigation("/profile/edit");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProfileEdit]);

  const onSubmitProfile = async () => {
    const { newName } = getValues();
    if (userObj.displayName === newName && photoUrl === "") {
      return;
    }
    let profileUrl = "";
    if (photoUrl) {
      const profileRef = ref(storageService, `${userObj.uid}/${uuidv4()}`);
      const response = await uploadString(
        profileRef,
        photoUrl as string,
        "data_url"
      );
      profileUrl = await getDownloadURL(response.ref);
      await updateProfile(userObj, {
        displayName: newName,
        photoURL: profileUrl,
      });
      setPhotoUrl(null);
    }
    await updateProfile(userObj, {
      displayName: newName,
    });
    refreshUser();
  };

  const onFileChange = ({
    currentTarget: { files },
  }: React.FormEvent<HTMLInputElement>) => {
    if (files) {
      const uploadFile = files![0];
      const reader = new FileReader();
      reader.onloadend = (e: any) => {
        const {
          currentTarget: { result },
        } = e;
        setPhotoUrl(result);
      };
      reader.readAsDataURL(uploadFile);
    }
  };

  const onClickImageUpload = (e: any) => {
    e.preventDefault();
    fileinput?.current?.click();
  };

  const onClearPhotoUrl = (e: any) => {
    e.preventDefault();
    setPhotoUrl(null);
  };

  return (
    <>
      <Wrapper>
        <ProfileDiv>
          <ProfileImgColumn>
            <ProfileImg
              src={userObj.photoURL !== null ? userObj.photoURL : GUEST_ICON}
            />
            <ProfileImgChange onClick={onClickImageUpload}>
              <FontAwesomeIcon icon={faCamera} />
            </ProfileImgChange>
          </ProfileImgColumn>
          <ProfileTitle>{userObj.displayName}</ProfileTitle>
          <Hrdiv />
          <ProfileForm onSubmit={handleSubmit(onSubmitProfile)}>
            <EditTitle>Edit Profile</EditTitle>
            <InputText
              {...register("newName", { required: true })}
              type="text"
              placeholder={userObj.displayName as string}
            />
            <input
              type="file"
              onChange={onFileChange}
              accept="image/*"
              ref={fileinput}
              style={{ display: "none" }}
            />
            <UpdateDiv>
              {photoUrl && (
                <PhotoUrlDiv>
                  <img src={photoUrl} alt="pic" />
                  <PhotoDivButton
                    onClick={onClearPhotoUrl}
                    variants={buttonVar}
                    whileHover="active"
                    initial="normal"
                  >
                    <FontAwesomeIcon icon={faX} />
                  </PhotoDivButton>
                </PhotoUrlDiv>
              )}
              <Buttons>
                <Button>Update User</Button>
                <Button onClick={onLogOutClick}>LogOut</Button>
              </Buttons>
            </UpdateDiv>
          </ProfileForm>
        </ProfileDiv>
        {isMobile ? (
          <MobileTweetsDiv>
            <MobileTweetName>{userObj.displayName}'s Tweet</MobileTweetName>
            <MobileTweets>
              {tweets.map((tweet, index) => (
                <>
                  <Tweet
                    key={index}
                    tweetObj={tweet}
                    isOwner={tweet.creatorId === userObj.uid}
                    layoutId={tweet.id as string}
                    isProfile={true}
                  />
                </>
              ))}
            </MobileTweets>
          </MobileTweetsDiv>
        ) : (
          <TweetsDiv>
            <TweetName>{userObj.displayName}'s Tweet</TweetName>
            <Hrdiv />
            <Tweets>
              {tweets.map((tweet, index) => (
                <TweetLine>
                  <Tweet
                    key={index}
                    tweetObj={tweet}
                    isOwner={tweet.creatorId === userObj.uid}
                    layoutId={tweet.id as string}
                    isProfile={true}
                  />
                </TweetLine>
              ))}
            </Tweets>
          </TweetsDiv>
        )}
        <AnimatePresence>
          {profileEditMatch ? (
            <ModalProfile layoutId={giveLayoutId as string} isEdit={true} />
          ) : null}
        </AnimatePresence>
      </Wrapper>
    </>
  );
}

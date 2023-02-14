import { uuidv4 } from "@firebase/util";
import { faCamera, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { updateProfile } from "firebase/auth";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMatch, useOutletContext } from "react-router-dom";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import { layoutIdAtom } from "../atoms";
import Modal from "../components/Modal";
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
`;

const Profile__img__column = styled.div`
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

const PhotoUrlDiv = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 3px solid gray;
  border-radius: 10px;
  padding: 10px;
  img {
    width: 75px;
    height: 75px;
    border-radius: 50%;
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
  overflow-y: scroll;
`;

const TweetName = styled.span`
  font-size: 50px;
  color: ${(props) => props.theme.bgColor};
`;

const Hrdiv = styled.div`
  width: 110%;
  height: 5px;
  background-color: gray;
  margin-top: 10px;
  margin-bottom: 30px;
`;

const Tweets = styled.div``;

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
    defaultValues: { ["newName"]: userObj.displayName },
  });
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileinput = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<any[]>([]);

  const onLogOutClick = () => {
    authService.signOut();
  };

  const getMyTweets = async () => {
    const q = query(
      collection(dbService, "tweets"),
      where("creatorId", "==", userObj.uid),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data());
      setDocs((prev: ITweets | any) => [...prev, doc.data()]);
    });
    console.log(docs);
  };

  useEffect(() => {
    getMyTweets();
  }, []);

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
          <Profile__img__column>
            <ProfileImg
              src={userObj.photoURL !== null ? userObj.photoURL : GUEST_ICON}
            />
            <ProfileImgChange onClick={onClickImageUpload}>
              <FontAwesomeIcon icon={faCamera} />
            </ProfileImgChange>
          </Profile__img__column>
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
            {photoUrl && (
              <PhotoUrlDiv>
                <img src={photoUrl} />
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
          </ProfileForm>
        </ProfileDiv>
        <TweetsDiv>
          <TweetName>{userObj.displayName}'s Tweet</TweetName>
          <Hrdiv />
          <Tweets>
            <div>
              {docs.map((doc) => (
                <Tweet
                  key={doc.id}
                  tweetObj={doc}
                  isOwner={doc.creatorId === userObj.uid}
                  layoutId={doc.id as string}
                  isProfile={true}
                />
              ))}
            </div>
          </Tweets>
        </TweetsDiv>
      </Wrapper>
    </>
  );
}

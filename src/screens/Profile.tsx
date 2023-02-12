import { uuidv4 } from "@firebase/util";
import { updateProfile } from "firebase/auth";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useOutletContext } from "react-router-dom";
import { authService, dbService, storageService } from "../firebase";
import { IHomeProps } from "./Home";

export default function Profile() {
  const { userObj } = useOutletContext<IHomeProps>();
  const { refreshUser } = useOutletContext<any>();
  const {
    register,
    getValues,
    handleSubmit,
    reset,
    formState: { isValid, errors },
  } = useForm({ mode: "onChange" });
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileinput = useRef<HTMLInputElement>(null);

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
    });
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
    }
    await updateProfile(userObj, {
      displayName: newName,
      photoURL: profileUrl,
    });
    refreshUser();
    console.log(userObj.displayName, photoUrl);
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

  return (
    <>
      <h1>Profile</h1>
      <form onSubmit={handleSubmit(onSubmitProfile)}>
        <input
          {...register("newName", { required: true })}
          type="text"
          placeholder="username"
        />
        <input
          type="file"
          onChange={onFileChange}
          accept="image/*"
          ref={fileinput}
          // style={{ display: "none" }}
        />
        <button disabled={isValid ? false : true}>Update UserName</button>
      </form>

      <button onClick={onLogOutClick}>LogOut</button>
    </>
  );
}

import { updateProfile } from "firebase/auth";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useOutletContext } from "react-router-dom";
import { authService, dbService } from "../firebase";
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
  const [changeProfile, setChangeProfile] = useState(false);

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

  const onChangeProfile = () => {
    setChangeProfile((prev) => !prev);
  };

  const onSubmitProfile = async () => {
    const { newName } = getValues();
    if (newName.length >= 12) {
    }
    await updateProfile(userObj, {
      displayName: newName,
    });
    refreshUser();
  };

  return (
    <>
      <h1>Profile</h1>
      <button onClick={onChangeProfile}>change profile</button>
      {changeProfile && (
        <form onSubmit={handleSubmit(onSubmitProfile)}>
          <input
            {...register("newName", { required: true })}
            type="text"
            placeholder="username"
          />
          <button disabled={isValid ? false : true}>Update UserName</button>
        </form>
      )}

      <button onClick={onLogOutClick}>LogOut</button>
    </>
  );
}

import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { dbService, storageService } from "../firebase";
import { ITweets } from "../screens/Home";

interface ITweetProps {
  tweetObj: ITweets;
  isOwner: boolean;
}

export default function Tweet({ tweetObj, isOwner }: Partial<ITweetProps>) {
  const [editing, setEditing] = useState(false);
  const { register, getValues, handleSubmit, reset } = useForm({
    mode: "onChange",
  });
  const tweetRef = doc(dbService, "tweets", `${tweetObj?.id}`);

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

  return (
    <>
      <div>
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
            <h4>{tweetObj?.text}</h4>
            {tweetObj?.attachmentUrl && (
              <img src={tweetObj.attachmentUrl} width="50px" height="50px" />
            )}
            {isOwner && (
              <>
                <button onClick={onDeleteClick}>Delete Tweet</button>
                <button onClick={toggleEditing}>Edit Tweet</button>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

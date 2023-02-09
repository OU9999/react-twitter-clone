import { updateProfile, User } from "firebase/auth";
import { Link } from "react-router-dom";

interface INaviProps {
  userObj: User;
}

export default function Navi({ userObj }: INaviProps) {
  if (userObj.displayName === null) {
    const name = userObj!.email!.split("@")[0];
    updateProfile(userObj, {
      displayName: name,
    });
  }
  return (
    <nav>
      <ul>
        <li>
          <Link to="/home">Home</Link>
        </li>
        <li>
          <Link to="/profile">{userObj.displayName}'s Profile</Link>
        </li>
      </ul>
    </nav>
  );
}

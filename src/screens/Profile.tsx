import { authService } from "../firebase";

export default function Profile() {
  const onLogOutClick = () => {
    authService.signOut();
  };
  return (
    <>
      <h1>Profile</h1>
      <button onClick={onLogOutClick}>LogOut</button>
    </>
  );
}

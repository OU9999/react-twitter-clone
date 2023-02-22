import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faGithub } from "@fortawesome/free-brands-svg-icons";
import {
  createUserWithEmailAndPassword,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { authService } from "../firebase";
import { theme } from "../theme";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const Column = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Svg = styled(motion.svg)`
  width: 20vw;
  height: 20vh;
  margin-bottom: 2rem;
  /* color: ${(props) => props.theme.birdColor}; */
`;

const Form = styled.form`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const Input = styled.input`
  background-color: ${(props) => props.theme.textColor};
  border: none;
  margin-bottom: 1.5vh;
  width: 55vw;
  height: 10vh;
  font-size: 1rem;
  padding: 20px;
  border-radius: 10px;
  &:focus {
    background-color: white;
  }
  @media screen and (max-width: 767px) {
    width: 80vw;
    height: 8vh;
    font-size: 1rem;
  }
`;

const Span = styled.span`
  font-size: 25px;
  margin-top: 10px;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 70vw;
  margin: 1rem 0px;
`;

const Button = styled(motion.button)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20vw;
  height: 10vh;
  font-size: 1.5rem;
  padding: 20px;
  border-radius: 15px;
  background-color: ${(props) => props.theme.textColor};
  color: ${(props) => props.theme.bgColor};
  font-weight: bold;
  cursor: pointer;
  @media screen and (max-width: 767px) {
    width: 30vw;
    height: 10vh;
    font-size: 1rem;
  }
`;

const Icon = styled(FontAwesomeIcon)`
  font-size: 3rem;
  @media screen and (max-width: 767px) {
    font-size: 1rem;
  }
`;

interface IAuthForm {
  email: string;
  password: string;
}

enum AuthErrorType {
  "USER_EXIST" = "(auth/email-already-in-use).",
  "USER_NOT_FOUND" = "(auth/user-not-found).",
  "WRONG_PASSWORD" = "(auth/wrong-password).",
  "TOO_MANY_REQUESTS" = "(auth/too-many-requests).",
}

const EMAIL_VALIDATION_CHECK = new RegExp(
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);

export default function Auth() {
  const [newAccount, setNewAccount] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    getValues,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm<IAuthForm>({
    mode: "onChange",
  });
  const ERROR_REPLACE = "Firebase: Error ";

  const onSubmit = async () => {
    const { email, password } = getValues();
    if (newAccount) {
      // create account
      try {
        const user = await createUserWithEmailAndPassword(
          authService,
          email,
          password
        );
        setErrorMessage(null);
        console.log("created", user);
      } catch (error: any) {
        const errorswitch = error.message.replace(ERROR_REPLACE, "");
        switch (errorswitch) {
          // 사용중인 계정
          case AuthErrorType.USER_EXIST:
            setErrorMessage("사용중인 계정입니다.");
            console.log(errorMessage);
            break;
          // 너무 많은 요청
          case AuthErrorType.TOO_MANY_REQUESTS:
            setErrorMessage(
              "너무 많은 요청이 들어왔습니다. 잠시만 기다렸다가 해주세요."
            );
            console.log(errorMessage);
            break;

          default:
            console.log(errorswitch);
        }
      }
    } else {
      // sign in
      try {
        const user = await signInWithEmailAndPassword(
          authService,
          email,
          password
        );
        setErrorMessage(null);
        console.log("login", user);
      } catch (error: any) {
        console.log(error);
        const errorswitch = error.message.replace(ERROR_REPLACE, "");
        switch (errorswitch) {
          // 없는 계정
          case AuthErrorType.USER_NOT_FOUND:
            setErrorMessage("계정을 생성하시거나 이메일을 확인하세요.");
            console.log(errorMessage);
            break;
          // 비번 틀림
          case AuthErrorType.WRONG_PASSWORD:
            setErrorMessage("비밀번호가 틀립니다.");
            console.log(errorMessage);
            break;
          // 너무 많은 요청
          case AuthErrorType.TOO_MANY_REQUESTS:
            setErrorMessage(
              "너무 많은 요청이 들어왔습니다. 잠시만 기다렸다가 해주세요."
            );
            console.log(errorMessage);
            break;

          default:
            console.log(errorswitch);
        }
      }
    }
  };

  const onSocialClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const name = event.currentTarget.name;
    let provider;
    if (name === "google") {
      provider = new GoogleAuthProvider();
    } else if (name === "github") {
      provider = new GithubAuthProvider();
    }
    const data = await signInWithPopup(authService, provider as any);
    console.log(data);
  };

  return (
    <Wrapper>
      <Column>
        <Svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          fill="currentColor"
        >
          <motion.path
            initial={{
              pathLength: 0,
              fill: "rgba(0,0,0,1)",
            }}
            animate={{
              pathLength: 1,
              fill: "rgba(255,255,255,1)",
            }}
            transition={{
              duration: 5,
            }}
            stroke="rgb(255,255,255)"
            strokeWidth="10"
            d="M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-48.9 158.8c.2 2.8.2 5.7.2 8.5 0 86.7-66 186.6-186.6 186.6-37.2 0-71.7-10.8-100.7-29.4 5.3.6 10.4.8 15.8.8 30.7 0 58.9-10.4 81.4-28-28.8-.6-53-19.5-61.3-45.5 10.1 1.5 19.2 1.5 29.6-1.2-30-6.1-52.5-32.5-52.5-64.4v-.8c8.7 4.9 18.9 7.9 29.6 8.3a65.447 65.447 0 0 1-29.2-54.6c0-12.2 3.2-23.4 8.9-33.1 32.3 39.8 80.8 65.8 135.2 68.6-9.3-44.5 24-80.6 64-80.6 18.9 0 35.9 7.9 47.9 20.7 14.8-2.8 29-8.3 41.6-15.8-4.9 15.2-15.2 28-28.8 36.1 13.2-1.4 26-5.1 37.8-10.2-8.9 13.1-20.1 24.7-32.9 34z"
          />
        </Svg>
      </Column>
      <Column>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Input
            {...register("email", {
              required: "이메일은 필수 입력사항 입니다.",
              pattern: {
                value: EMAIL_VALIDATION_CHECK,
                message: "유효한 이메일을 입력해주세요.",
              },
            })}
            type="email"
            placeholder="Email"
          />

          <Input
            {...register("password", {
              required: "비밀번호는 필수 입력사항 입니다.",
              minLength: {
                value: 4,
                message: "패스워드는 4자 이상이어야 합니다.",
              },
            })}
            type="password"
            placeholder="password"
          />
          {errors.email?.message && <Span>{errors.email.message}</Span>}
          {errors.password?.message && <Span>{errors.password.message}</Span>}
          {errorMessage && <Span>{errorMessage}</Span>}
          <Buttons>
            <Button
              disabled={isValid ? false : true}
              onClick={() => {
                setNewAccount(false);
              }}
              whileHover={{
                backgroundColor: theme.birdColor,
                color: theme.textColor,
              }}
            >
              Sign In
            </Button>
            <Button
              disabled={isValid ? false : true}
              onClick={() => {
                setNewAccount(true);
              }}
              whileHover={{
                backgroundColor: theme.birdColor,
                color: theme.textColor,
              }}
            >
              Create Account
            </Button>
          </Buttons>
        </Form>
      </Column>
      <Column>
        <Buttons>
          <Button
            name="google"
            onClick={onSocialClick}
            whileHover={{
              backgroundColor: theme.birdColor,
              color: theme.textColor,
            }}
          >
            <Icon icon={faGoogle} />
            Continue with Google
          </Button>
          <Button
            name="github"
            onClick={onSocialClick}
            whileHover={{
              backgroundColor: theme.birdColor,
              color: theme.textColor,
            }}
          >
            <Icon icon={faGithub} />
            Continue with GitHub
          </Button>
        </Buttons>
      </Column>
    </Wrapper>
  );
}

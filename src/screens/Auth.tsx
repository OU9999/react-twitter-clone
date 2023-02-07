import {
  createUserWithEmailAndPassword,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { authService } from "../firebase";

const Wrapper = styled.div``;

const Form = styled.form``;

const Input = styled.input``;

const Buttons = styled.div``;

const Button = styled.button``;

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

export default function Auth() {
  const [newAccount, setNewAccount] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    getValues,
    handleSubmit,
    formState: { isValid },
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
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register("email", { required: "Email is required" })}
          type="email"
          placeholder="Email"
        />
        <Input
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 4,
              message: "Password should contain more than 4 chars.",
            },
          })}
          type="password"
          placeholder="password"
        />
        <button
          disabled={isValid ? false : true}
          onClick={() => {
            setNewAccount(false);
          }}
        >
          Sign In
        </button>
        <button
          disabled={isValid ? false : true}
          onClick={() => {
            setNewAccount(true);
          }}
        >
          Create Account
        </button>

        {errorMessage && <span>{errorMessage}</span>}
      </Form>
      <Buttons>
        <Button name="google" onClick={onSocialClick}>
          Continue with Google
        </Button>
        <Button name="github" onClick={onSocialClick}>
          Continue with GitHub
        </Button>
      </Buttons>
    </Wrapper>
  );
}

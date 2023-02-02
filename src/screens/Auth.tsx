import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
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
export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newAccount, setNewAccount] = useState(true);
  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<IAuthForm>({
    mode: "onChange",
  });

  const onSubmit = async () => {
    const value = getValues();
    setEmail(value.email);
    setPassword(value.password);
    let data;
    try {
      if (newAccount) {
        data = await createUserWithEmailAndPassword(
          authService,
          email,
          password
        );
      } else {
        data = await signInWithEmailAndPassword(authService, email, password);
      }
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Wrapper>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register("email", { required: "Email is required" })}
          type="email"
          placeholder="Email"
        />
        {errors.email?.message && <div>{errors.email.message}</div>}
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
        <button disabled={isValid ? false : true}>create account</button>
      </Form>
      <Buttons>
        <Button>Continue with Google</Button>
        <Button>Continue with GitHub</Button>
      </Buttons>
    </Wrapper>
  );
}

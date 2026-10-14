import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { signUp } from "@/api/auth";
import Button from "@/components/Button";
import { GradientBorderButton } from "@/components/GradientButton";
import { Input } from "@/components/Input";
import type { authSignUp } from "@/types/backend";

interface Inputs extends authSignUp {
  repeatPassword: authSignUp["password"];
}

function SignUpPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const [error, setError] = useState<string | null>(null);

  const signUpMutation = useMutation({
    mutationFn: signUp,
    onError: (error: unknown) => {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Login Failed");
      }
    },
    onSuccess: () => {
      if (import.meta.env.DEV) {
        console.log("User signed up successfully");
      }
      navigate({ to: "/signin" });
    },
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (import.meta.env.DEV) {
      console.log(data);
    }
    signUpMutation.mutate(data);
  };

  return (
    <form
      className="mt-10 flex flex-col content-start items-center justify-center gap-4 font-500 text-2xl text-white"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h1 className="text-3xl text-black">Login information</h1>
      {error && <p className="text-[16px] text-red-500">{error}</p>}
      <Input
        placeholder="What is your first name? *"
        {...register("displayName", {
          required: "What is your first name? is required",
        })}
      />
      {errors.displayName && <p className="text-[16px] text-red-500">{errors.displayName.message}</p>}
      <Input placeholder="E-mail *" type="email" {...register("email", { required: "E-mail is required" })} />
      {errors.email && <p className="text-[16px] text-red-500">{errors.email.message}</p>}
      <Input placeholder="Password *" type="password" {...register("password", { required: "Password is required" })} />
      {errors.password && <p className="text-[16px] text-red-500">{errors.password.message}</p>}
      <Input
        placeholder="Repeat password *"
        type="password"
        {...register("repeatPassword", { required: "Repeat Password is required" })}
      />
      {errors.repeatPassword && <p className="text-[16px] text-red-500">{errors.repeatPassword.message}</p>}
      <Input
        placeholder="What username do you want? *"
        {...register("username", { required: "Username is required" })}
      />
      {errors.username && <p className="text-[16px] text-red-500">{errors.username.message}</p>}
      <label className="contents">
        <p className="text-3xl text-black">Date of birth? </p>
        <Input
          onFocus={(e) => {
            e.target.type = "date";
          }}
          placeholder="Date of birth *"
          type="text"
          {...register("dateOfBirth", {
            required: "Date of birth is required",
          })}
        />

        {errors.dateOfBirth && <p className="text-[16px] text-red-500">{errors.dateOfBirth.message}</p>}
      </label>

      <GradientBorderButton className="block-14 max-w-xs" type="submit">
        Create Account
      </GradientBorderButton>
      <div className="flex items-center justify-center text-center">
        <p className="text-start text-[16px] text-black">
          Already have an account?
          <Link className="p-3 text-start text-black text-sm underline" to="/signin">
            Sign in here
          </Link>
        </p>
      </div>
      <div className="flex w-full flex-col items-center">
        <p className="mb-3 text-black text-sm">Or continue with</p>

        <div className="flex gap-3">
          <Button type="button" variant="social">
            Apple
          </Button>
          <Button type="button" variant="social">
            Facebook
          </Button>
          <Button type="button" variant="social">
            Google
          </Button>
        </div>
      </div>
    </form>
  );
}
export const Route = createFileRoute("/(auth)/signup")({
  component: SignUpPage,
});

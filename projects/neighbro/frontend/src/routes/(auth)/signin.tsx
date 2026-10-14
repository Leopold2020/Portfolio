import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";
import { signIn } from "@/api/auth";
import Button from "@/components/Button";
import { Input } from "@/components/Input";
import useAuthStore from "@/stores/authStore";

interface Inputs {
  username: string;
  password: string;
}

const redirectFallback = "/profile" as const;

function SignInPage() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const search = Route.useSearch();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const signInMutation = useMutation({
    mutationFn: signIn,
    onError: (error: unknown) => {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Login Failed");
      }
    },
    onSuccess: async (token: string) => {
      setAuth(token);
      await router.invalidate();
      await router.navigate({ to: search.redirect ?? redirectFallback });
    },
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (import.meta.env.DEV) {
      console.log(data);
    }
    signInMutation.mutate(data);
  };
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col items-center pb-5">
        <img
          alt="Logo"
          className="w-30 transition-all duration-100 ease-linear hover:scale-[1.02] hover:brightness-110"
          src="/logo.svg"
        />
        <h1 className="font-extrabold text-[55px]">Neighbro</h1>
        <h2 className="text-center font-medium text-[20px]">Welcome to the neighborhood!</h2>
        <p className="text-center text-[16px]">Find events, new friends, neighbors and more near you.</p>
      </div>

      <form
        className="flex flex-col content-start items-center justify-center gap-4 text-white"
        onSubmit={handleSubmit(onSubmit)}
      >
        {error && <p className="text-red-500">{error}</p>}
        <Input placeholder="Username *" {...register("username", { required: "Username is required" })} />
        {errors.username && <p className="text-red-500">{errors.username.message}</p>}
        <Input
          placeholder="Password *"
          type="password"
          {...register("password", { required: "password is required" })}
        />
        {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        <Button type="submit" variant="secondary">
          Sign In
        </Button>
      </form>

      <div className="mt-4 flex flex-col items-center justify-center gap-2">
        <p>
          Don't have an account yet?{" "}
          <Link className="text-black underline" to="/signup">
            Sign up here
          </Link>
        </p>
      </div>

      <div className="flex w-full flex-col items-center pt-2">
        <p className="mt-1 mb-3 text-black text-sm">Or continue with</p>

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

      <div className="mt-4 flex items-center justify-center gap-[20px]">
        <a className="border-black border-b text-sm" href="#about">
          About
        </a>
        <a className="border-black border-b text-sm" href="#Privacy">
          Privacy
        </a>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/(auth)/signin")({
  beforeLoad: ({ search, context }) => {
    if (context.token) {
      throw redirect({ to: search.redirect ?? redirectFallback });
    }
  },
  component: SignInPage,
  validateSearch: z.object({
    redirect: z.string().optional().catch(""),
  }),
});

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Alert from "../../components/alert";
import { useState } from "react";
import { useAuth } from "../../store/auth";

export const Route = createFileRoute("/onboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      <span className="flex justify-between">
        <span>
          <h1 className="font-extrabold text-3xl">PhynariaMC</h1>
          <p className="font-light text-sm text-white/50">
            Don't have an account?{" "}
            <a
              href="https://phynaria.fr"
              target="_blank"
              className="text-primary hover:underline">
              Sign Up
            </a>
          </p>
        </span>
        <img src="/images/logo.png" className="size-20 aspect-square" alt="" />
      </span>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const input = new FormData(e.currentTarget);
          auth.login({
            username: input.get("username") as string,
            password: input.get("password") as string,
          });
          Alert({
            title: "User datas",
            message: input.get("username") + " | " + input.get("password"),
            action: () => {
              navigate({ to: "/onboard/1" });
            },
          });
        }}
        className="flex flex-col gap-1.5 w-full h-max">
        <label htmlFor="username" className="text-sm font-medium">
          Username
        </label>
        <input
          className="pl-3 h-8 rounded-lg bg-dark outline-none text-sm"
          type="text"
          name="username"
          id="username"
          placeholder="Enter your username."
          spellCheck="false"
          autoComplete="off"
        />
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <div className="relative w-full h-max">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password."
            spellCheck="false"
            autoComplete="off"
            className="pl-3 h-8 rounded-lg bg-dark outline-none text-sm w-full"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute peer-focus:opacity-100 hover:opacity-100 ease-in-out duration-300 opacity-0 inset-0 ml-auto my-auto mr-3 w-max h-5 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-full"
              viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5"
              />
            </svg>
          </button>
        </div>
        <button className="px-3.5 py-1.5 cursor-pointer ease-smooth duration-200 hover:saturate-150 gap-3 bg-primary rounded-lg mt-3 flex items-center justify-center">
          Sign in
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M5.475 0.525C5.18505 0.81495 5.18505 1.28505 5.475 1.575L7.44289 3.54289C8.07286 4.17286 7.62669 5.25 6.73579 5.25H0.750001C0.335787 5.25 0 5.58579 0 6C0 6.41421 0.335786 6.75 0.75 6.75H6.73579C7.62669 6.75 8.07286 7.82714 7.44289 8.45711L5.475 10.425C5.18505 10.7149 5.18505 11.1851 5.475 11.475C5.76495 11.7649 6.23505 11.7649 6.525 11.475L11.2929 6.70711C11.6834 6.31658 11.6834 5.68342 11.2929 5.29289L6.525 0.525C6.23505 0.235051 5.76495 0.23505 5.475 0.525Z"
              fill="#E4E4E4"
            />
          </svg>
        </button>
      </form>
    </>
  );
}

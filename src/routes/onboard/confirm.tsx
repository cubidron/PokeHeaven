import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../store/auth";

export const Route = createFileRoute("/onboard/confirm")({
  component: RouteComponent,
});

function RouteComponent() {
  const auth = useAuth();
  const navigate = useNavigate();
  return (
    <>
      <span className="flex justify-between">
        <span>
          <h1 className="font-extrabold text-3xl">PhynariaMC</h1>
          <p className="font-light text-sm text-white/50">
            Vous n'avez pas de compte?{" "}
            <a
              href="https://phynaria.fr/user/register"
              target="_blank"
              className="text-primary hover:underline">
              S'inscrire
            </a>
          </p>
        </span>
        <img src="/images/logo.png" className="size-20 aspect-square" alt="" />
      </span>
      {auth.user && (
        <span className="rounded-xl flex mt-3 flex-col items-center justify-center gap-2 bg-dark p-4">
          <img
            className="size-20 rounded-md bg-white/5 p-1.5"
            src={`https://visage.surgeplay.com/face/${auth?.user?.username || "MHF_Steve"}`}
            alt=""
            onError={(e) => {
              const a = "https://visage.surgeplay.com/face/MHF_Steve";
              if (e.currentTarget.src != a) {
                e.currentTarget.src = a;
              }
            }}
          />
          <h1 className={`font-semibold text-2xl leading-[100%]`}>
            {auth.user?.username}
          </h1>
          <p className="text-base font-extralight leading-[100%]">
            Compte Phynaria
          </p>
        </span>
      )}
      <span className="relative flex flex-col mb-1_ mt-3">
        <Link
          to="/home"
          className="px-3.5 py-1.5 cursor-pointer outline-none ease-smooth duration-200 hover:saturate-150 gap-3 bg-primary rounded-lg flex items-center justify-center">
          Continuer
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
        </Link>
        <p className="font-light top-full w-full text-center mt-1 absolute text-sm text-white/50">
          Ce n'est pas votre compte?{" "}
          <span
            onClick={() => {
              auth.user && auth.logout(auth.user);
              navigate({ to: "/onboard/login" });
            }}
            className="text-primary cursor-pointer hover:underline">
            Annuler
          </span>
        </p>
      </span>
    </>
  );
}

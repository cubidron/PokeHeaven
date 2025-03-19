import { useState } from "react";
import { useAuth } from "../store/auth";
import Spinner from "./Spinner";

export default function Skin() {
  const auth = useAuth();
  const [loading, _loading] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const input = new FormData(e.currentTarget);
        const file = input.get("skin") as File;
        if (!file) return;
        _loading(true);
        //API Call
        console.log(file);

        //API CALL END
        _loading(false);
      }}
      className="flex flex-col relative items-center w-full h-max justify-center p-2 gap-2 rounded-xl bg-body">
      {auth.user && (
        <>
          <span className="relative group flex hover:outline-primary outline-1 outline-transparent overflow-hidden rounded-md w-full items-center justify-center gap-2">
            <img
              className="w-32 group-hover:scale-95 ease-smooth duration-500 p-1.5"
              src={`https://visage.surgeplay.com/full/${auth?.user?.username || "MHF_Steve"}`}
              alt=""
              onError={(e) => {
                const a = "https://visage.surgeplay.com/face/MHF_Steve";
                if (e.currentTarget.src != a) {
                  e.currentTarget.src = a;
                }
              }}
            />
            <input
              className=" absolute z-50 left-0 top-0 size-full opacity-0 cursor-pointer"
              type="file"
              name="skin"
              id=""
            />
            <p className="opacity-0 group-hover:opacity-100 size-full bg-black/60 rounded-xl p-2 ease-smooth duration-300 font-light absolute flex items-center justify-center inset-0 m-auto text-center">
              Glissez-déposez le fichier <br />
              pour changer de skin.
            </p>
            <svg
              className=" right-2 bottom-2 absolute size-6"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24">
              <g
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5">
                <path d="m8 14.571l-1.823-1.736a1.56 1.56 0 0 0-2.247.103v0a1.56 1.56 0 0 0 .035 2.092l5.942 6.338c.379.403.906.632 1.459.632H16c2.4 0 4-2 4-4q0 0 0 0V9.429" />
                <path d="M17 10v-.571c0-2.286 3-2.286 3 0M14 10V8.286C14 6 17 6 17 8.286V10m-6 0V7.5c0-2.286 3-2.286 3 0q0 0 0 0V10m-6 4.571V3.5A1.5 1.5 0 0 1 9.5 2v0c.828 0 1.5.67 1.5 1.499V10" />
              </g>
            </svg>
          </span>
          <h1 className={`font-bold text-4xl leading-[100%]`}>
            {auth.user?.username}
          </h1>
          <button className="px-3.5 w-full py-1.5 cursor-pointer ease-smooth duration-200 hover:saturate-150 gap-3 bg-primary rounded-lg mt-3 flex items-center justify-center">
            Changer de Skin
            {loading ? (
              <Spinner stroke="4" className="!size-4.5" />
            ) : (
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
            )}
          </button>
        </>
      )}
    </form>
  );
}

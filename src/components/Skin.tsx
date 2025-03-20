import { useState, useEffect, useRef } from "react";
import { useAuth } from "../store/auth";
import Spinner from "./Spinner";
import { SkinViewer } from "skinview3d";
import { WEB_API_BASE } from "../constants";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";
import { blobToBase64 } from "../helpers";

export default function Skin({ setSkinModal }: { setSkinModal: (value: boolean) => void }) {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let skinViewer: SkinViewer;
  let currentFile: Blob;
  useEffect(() => {
    (async () => {
      if (!canvasRef.current) return;

      const savedSkin = localStorage.getItem("playerSkin");

      skinViewer = new SkinViewer({
        canvas: canvasRef.current,
        width: 256,
        height: 256,
        skin: savedSkin ?? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAEwElEQVR4Xu1av2sUURgMqCABQQVBBK0SCdooMQQD5jSFkNgpKdIEwSZoZ6GYJohNUmlhqrSxsUlhYZM/If/TmdncrLOz3+7drcneXtyB4f36bvNm3vd2l32ZmOiD+3eudMHZqWtJyTrbn189LqVfb+xAwZ17N1LxqLsBH17MZniuDFDBXn5b6+TEkxjz640dXLSmP8r/wgDd+74VILJoC5wLA3TFNRsgHqRQv/mh7+v64vkwwO8BSoiE4KLSrzd2UNF+QwQpdnn6aobs9+s1DpraFDZ183Im5ZkFSjVBf6PX0WtEcSh9PrUjmiBIIVpX8V7yd5Foxvn10efzqR0qwifMvr03y91fn9a7v7+8S8qf79eSvkfT13OxINvs0zpNYJ/Pp3ZwQjpRXUkIhWAIp3gSY5Go6JqsM55tn0/t0ImxxCMM4iACQoGXT3ZS0agDaCMGffhNdC0aGhnUCAN8hShIyRV/+/RBQs0AJUX5yuv9QQ1B2+dTOzgRlFx5PsO/v15MX2jwaPu4NJdw6fZkJoaPPGaCXtMN8LbPp3bwrU3FuwkoIRomsKRoGqS/5fX0zfDurckM2e/zGTkWHu50lfPz8wlnZmYSenwOR0fp9lBj0Ycxv77TL5fDwUE34f5+Znt6WGX4hCicRnh8DsciVbyacNoGqNEeVhk+oSoZcNYGTB4epgY0MgPOdAscC9ct8M8Z8Gxurwvij6N8vvAjJftYkjp+cXc3Q0/PVHxv4kXxYKafQpW9uLS9tZWlxg4KChzUAB0HMdlL29sJU0E9oUxP74/iMyK9j/2RARsbJ6QBHB8UZQI9O3wchJALm5sJUdcURel9Hu8muFkZ8WJGMlZkADgoygQWGaB1iiH7CfL4UJi0c2mupHg1gRwULpDtqE/HSBeUWXEzQFc/MiC39/f/3uh4s9N6RI67zkK4Ab7CkSHa9pRODegJcQM83jMkFd9r66OON1Rtq+hKj8XIAN8GZeMURXoK66p6bBTvv3VhKj4ygKXrLASFFQnsZwAmqWKSDNAVZTb0BHl8aIDED2oAykoZ4OmtwpUeR1KQiqNwF8cYj8sYIOIR4yvrBqgRlQxYWVnpgn5zczLOqaIiM1Sgx6YGiGgVD6rgoizQLTC0AXi97XQ6GVGrq6s5oYjxWNR1i6hhmjk0gsI8RrePxiATIwM0K9wAlq6zEHzHpzgXSOFRHOpqAKnbiCVX1OP9XsMY9pcJ1/3vRrjOFi1atGjRosX4AR9Ai5h5fT44+ViajrVo0aJFixYtWtQN/5Q29OGqfELTDyEe1li4AUMfr4sBmZPlcYEbUCUD+JrLDBhrAypnwHFZ6airbujXX//I6WM6zpjcgaefEbDtbAoGEcls8DEwPOJWA9wEtpsCNwClG6Dj/QxID0vcCK83BS7QRfq49iUGlJ3xl5HQTOmZ498NnKdqoItnO+rTMdLP9/XG5wce2u/zGBmKBPtq67jGu1h99Hm7kY/FSGC/LaB0A4pEs5+lz2NkcIEoIwMic8DofM/Fq/DGZYCnv6+09kfbJNrnkXDv93mMDDxJpsAi+nE7WSY+Et44A3hcrqKG+f+CyAAV7Qaw7fMYGaL/G1CBFB7FoQ5BRfeByAiO+zyq4g8lK5z2I+oYkQAAAABJRU5ErkJggg==",
      });

      const remoteSkin = await skinToBase64(`${WEB_API_BASE}/skin-api/skins/${auth.user?.username || "MHF_Steve"}.png`);
      if (remoteSkin !== savedSkin) {
        skinViewer.loadSkin(remoteSkin);
      }

    })();


    return () => {
      skinViewer.dispose();
    };
  }, [auth.user?.username]);

  const skinToBase64 = (image: string): Promise<string> => {
    return new Promise(async (res, _) => {
      const response = await fetch(image);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        localStorage.setItem("playerSkin", base64data as string);
        res(base64data as string);
      };
      reader.readAsDataURL(blob);
    })
  }

  return (
    <form
      onClick={(e) => e.stopPropagation()}
      onSubmit={(e) => {
        e.preventDefault();
        const input = new FormData(e.currentTarget);
        const file = input.get("skin") as File;
        if (!file) return;
        setLoading(true);
        // API Call
        console.log(file);
        // API CALL END
        setLoading(false);
      }}
      className="flex flex-col relative items-center size-max justify-center p-2 gap-2 rounded-xl bg-body">
      {auth.user && (
        <>
          <span className="relative group flex flex-col hover:outline-primary outline-1 p-10 pb-2 gap-6 h-max outline-transparent overflow-hidden rounded-md w-full items-center justify-center">
            <input
              className="absolute z-10 left-0 top-0 size-full opacity-0 cursor-pointer"
              //type="file"
              name="skin"
              id=""
              onClick={async () => {
                const file = await open({
                  multiple: false,
                  directory: false,
                  filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg"] }],
                });

                if (file) {
                  const fileData = await readFile(file as string);
                  currentFile = new Blob([new Uint8Array(fileData)], { type: "image/png" });
                  const base64 = await blobToBase64(currentFile);
                  skinViewer.loadSkin(base64 as string);
                }
              }}
            />
            <p className="opacity-0 group-hover:opacity-100 size-full text-nowrap bg-primary/10 rounded-xl p-1 ease-smooth duration-300 font-light absolute flex items-end justify-center text-center inset-0 m-auto"></p>
            <canvas
              ref={canvasRef}
              className="!size-48 bg-dark hover:scale-110 ease-smooth duration-500 cursor-grab active:cursor-grabbing rounded-xl inset-0 m-auto z-50"
            />
            <p className="mt-auto">
              Cliquez ou glissez un fichier pour télécharger.
            </p>
            <svg
              className="right-2 bottom-2 absolute size-6"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24">
              <g
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5">
                <path d="m8 14.571l-1.823-1.736a1.56 1.56 0 0 0-2.247.103v0a1.56 1.56 0 0 0 .035 2.092l5.942 6.338c.379.403.906.632 1.459.632H16c2.4 0 4-2 4-4q0 0 0 0V9.429" />
                <path d="M17 10v-.571c0-2.286 3-2.286 3 0M14 10V8.286C14 6 17 6 17 8.286V10m-6 0V7.5c0-2.286 3-2.286 3 0q0 0 0 0V10m-6 4.571V3.5A1.5 1.5 0 0 1 9.5 2v0c.828 0 1.5.67 1.5 1.499V10" />
              </g>
            </svg>
          </span>
          <h1 className="font-bold text-4xl leading-[100%]">
            {auth.user?.username}
          </h1>
          <button onClick={async () => {
            await auth.updateSkin(auth.user?.access_token || "", currentFile);
            setSkinModal(false);
            //todo: find a better way to do this.
            window.location.reload();
          }} className="px-3.5 w-full py-1.5 cursor-pointer ease-smooth duration-200 hover:saturate-150 gap-3 bg-primary rounded-lg mt-3 flex items-center justify-center">
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

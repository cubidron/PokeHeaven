import { useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import useNewses from "../store/news";
import Spinner from "./Spinner";

export default function NewsSection() {
  const sliderRef = useRef<HTMLUListElement>(null);
  const [newsStage, setNewsStage] = useState(0);
  const news = useNewses((state) => state);
  const [loading, setLoading] = useState(false);

  //* Slide news
  function slideNews({ index, arg }: { index?: number; arg?: string }) {
    if (index == null) {
      if (arg == "geri") {
        setNewsStage((prev) => Math.max(prev - 1, 0));
      }
      if (arg == "ileri") {
        setNewsStage((prev) =>
          Math.min(prev + 1, Math.ceil(news.newses.length / 2))
        );
      }
    } else {
      setNewsStage(index);
    }
  }

  //* Scroll to news stage
  sliderRef.current?.scrollTo(newsStage * 320, 0);
  const [pageCount, setPageCount] = useState(0);
  //? Update page count
  useEffect(() => {
    const updatePageCount = () => {
      if (sliderRef.current) {
        setPageCount(
          Math.max(
            0,
            news.newses.length -
              Math.floor(sliderRef.current.offsetWidth / 320) +
              1
          )
        );
      }
    };

    updatePageCount();
    window.addEventListener("resize", updatePageCount);

    return () => {
      window.removeEventListener("resize", updatePageCount);
    };
  }, [news.newses.length]);
  return (
    <>
      <div className="relative flex flex-row items-center justify-between">
        <div className="flex relative flex-row gap-2">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                slideNews({ index: i });
              }}
              className={`h-2 ease-in-out duration-300 w-4 rounded-full bg-white/6 hover:bg-primary ${
                newsStage == i ? "!w-8 !bg-primary" : ""
              } ${Math.ceil(news.newses.length / 2) >= i ? "" : "hidden"}`}
            />
          ))}
        </div>
        <AnimatePresence>
          <motion.section
            layout
            className="relative z-50 h-7 max-w-max shrink-0 p-[2px] gap-[2px] justify-between rounded-md flex bg-dark">
            {newsStage != 0 && (
              <motion.span
                key={1}
                layout
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.25 }}>
                <button
                  onClick={() => {
                    slideNews({ arg: "geri" });
                  }}
                  className="w-6 h-6 bg-body hover:bg-primary ease-in-out duration-300 rounded">
                  <svg
                    className="rotate-90"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12 14.379q-.161 0-.298-.053t-.267-.184L7.046 9.754q-.14-.14-.15-.344t.15-.364t.354-.16t.354.16L12 13.292l4.246-4.246q.14-.14.345-.15q.203-.01.363.15t.16.354t-.16.354l-4.389 4.388q-.13.131-.267.184q-.136.053-.298.053"
                    />
                  </svg>
                </button>
              </motion.span>
            )}
            {
              //hide button if there is no more news use getPageCount() to get the count
              pageCount > newsStage + 1 && (
                <motion.span
                  key={2}
                  layout
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.25 }}>
                  <button
                    onClick={() => {
                      slideNews({ arg: "ileri" });
                    }}
                    className="w-6 h-6 bg-body rounded hover:bg-primary hover:ease-in-out hover:duration-300">
                    <svg
                      className="-rotate-90"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12 14.379q-.161 0-.298-.053t-.267-.184L7.046 9.754q-.14-.14-.15-.344t.15-.364t.354-.16t.354.16L12 13.292l4.246-4.246q.14-.14.345-.15q.203-.01.363.15t.16.354t-.16.354l-4.389 4.388q-.13.131-.267.184q-.136.053-.298.053"
                      />
                    </svg>
                  </button>
                </motion.span>
              )
            }
            <motion.span
              key={0}
              layout
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.25 }}>
              <button
                onClick={() => {
                  setLoading(true);
                  setNewsStage(0);
                  news.fetch().then(() => {
                    setLoading(false);
                  });
                }}
                className="w-6 h-6 bg-body hover:bg-primary ease-in-out duration-300 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.077 19q-2.931 0-4.966-2.033q-2.034-2.034-2.034-4.964t2.034-4.966T12.077 5q1.783 0 3.339.847q1.555.847 2.507 2.365V5.5q0-.213.144-.356T18.424 5t.356.144t.143.356v3.923q0 .343-.232.576t-.576.232h-3.923q-.212 0-.356-.144t-.144-.357t.144-.356t.356-.143h3.2q-.78-1.496-2.197-2.364Q13.78 6 12.077 6q-2.5 0-4.25 1.75T6.077 12t1.75 4.25t4.25 1.75q1.787 0 3.271-.968q1.485-.969 2.202-2.573q.085-.196.274-.275q.19-.08.388-.013q.211.067.28.275t-.015.404q-.833 1.885-2.56 3.017T12.077 19"
                  />
                </svg>
              </button>
            </motion.span>
          </motion.section>
        </AnimatePresence>
      </div>
      <ul
        ref={sliderRef}
        id="news"
        className={`relative snap-x snap-mandatory ease-in-out duration-500 h-[12rem] w-full mt-4 scroll-smooth flex overflow-y-auto noscroll flex-row gap-4 ${
          !loading ? "opacity-100 scale-100" : "opacity-10 blur-2xl scale-90"
        }`}
        onScroll={() => {
          if (sliderRef.current) {
            clearTimeout((sliderRef.current as any)._scrollTimeout);
            (sliderRef.current as any)._scrollTimeout = setTimeout(() => {
              const index = Math.round(sliderRef.current!.scrollLeft / 340);
              setNewsStage(index);
            }, 100); // Adjust the timeout duration as needed
          }
        }}>
        {news.newses && news.newses.length > 0 ? (
          news.newses.map((item, i) => (
            <div
              key={i}
              className="relative *:relative w-[20rem] h-full snap-start rounded-lg group flex flex-col-reverse p-4 shrink-0 overflow-hidden !bg-cover !bg-center">
              <img
                onError={(e) => {
                  //when error occurs change source to local missing image src
                  const url =
                    location.protocol +
                    "//" +
                    location.hostname +
                    ":" +
                    location.port +
                    "/missing.webp";
                  e.currentTarget.src = url;
                }}
                src={item.image}
                className=" size-full inset-0 object-cover object-center !absolute"
                alt=""
              />
              <div className="w-full h-full !absolute left-0 top-0 bg-gradient-to-tr from-black to-black/0"></div>
              <a
                href={item.link}
                target="_blank"
                className="text-_c1 font-medium relative text-left text-sm mt-1 font-Comme">
                {item.link}
              </a>
              <h1 className="relative text-_grey font-medium mt-1 text-xs font-Comme h-4 group-hover:h-full overflow-auto ease-in-out duration-700">
                {item.lore}
              </h1>
              <h1 className="relative text-white font-semibold text-lg font-Comme">
                {item.title}
              </h1>
            </div>
          ))
        ) : (
          <div className="absolute inset-0 m-auto text-white flex flex-col items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={72}
              height={72}
              viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 17q.425 0 .713-.288Q13 16.425 13 16t-.287-.713Q12.425 15 12 15t-.712.287Q11 15.575 11 16t.288.712Q11.575 17 12 17Zm0-4q.425 0 .713-.288Q13 12.425 13 12V8q0-.425-.287-.713Q12.425 7 12 7t-.712.287Q11 7.575 11 8v4q0 .425.288.712q.287.288.712.288Zm0 9q-2.075 0-3.9-.788q-1.825-.787-3.175-2.137q-1.35-1.35-2.137-3.175Q2 14.075 2 12t.788-3.9q.787-1.825 2.137-3.175q1.35-1.35 3.175-2.138Q9.925 2 12 2t3.9.787q1.825.788 3.175 2.138q1.35 1.35 2.137 3.175Q22 9.925 22 12t-.788 3.9q-.787 1.825-2.137 3.175q-1.35 1.35-3.175 2.137Q14.075 22 12 22Zm0-2q3.35 0 5.675-2.325Q20 15.35 20 12q0-3.35-2.325-5.675Q15.35 4 12 4Q8.65 4 6.325 6.325Q4 8.65 4 12q0 3.35 2.325 5.675Q8.65 20 12 20Zm0-8Z"
              />
            </svg>
            <p className="text-xl font-light mt-4 mb-12">No news was found</p>
          </div>
        )}
      </ul>
      {loading && (
        <div className="absolute inset-0 m-auto text-white flex flex-col items-center justify-center">
          <Spinner className="!h-24" />
          <p className="text-xl font-light mt-4">Loading news...</p>
        </div>
      )}
    </>
  );
}

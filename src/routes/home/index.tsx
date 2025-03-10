import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Alert from "../../components/alert";
import { useState } from "react";
import { useAuth } from "../../store/auth";
import { addNoti } from "../../components/notification";
import NewsSection from "../../components/news";

export const Route = createFileRoute("/home/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      <main className="size-full rounded-xl backdrop-blur-sm relative gap-1 bg-body/80 mt-auto flex flex-col p-4"></main>
      <section className="w-full rounded-xl backdrop-blur-sm relative h-64 gap-1 bg-body/80 mt-auto flex flex-col p-4">
        <NewsSection />
      </section>
    </>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/onboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const nav = useNavigate();
  useEffect(() => {
    nav({ to: "/onboard/login" });
  });
  return <></>;
}

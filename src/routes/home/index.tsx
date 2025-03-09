import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Alert from "../../components/alert";
import { useState } from "react";
import { useAuth } from "../../store/auth";
import { addNoti } from "../../components/notification";

export const Route = createFileRoute("/home/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  return <></>;
}

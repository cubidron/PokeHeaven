import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
export const Route = createFileRoute("/onboard")({
  component: RouteComponent,
});

export const stage = 4;

function RouteComponent() {
  const location = useLocation();
  return (
    <>
      layout
      <Outlet />
    </>
  );
}

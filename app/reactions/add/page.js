"use client";

import { useSession } from "next-auth/react";
import { ReactionAddEditPage } from "../../customComponents";

export default function Home() {
  const session = useSession();

  return session.data?.user ? (
    <ReactionAddEditPage edit={false} />
  ) : (
    <p>{"User not authenticated!"}</p>
  );
}

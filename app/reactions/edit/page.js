"use client";

import { useSession } from "next-auth/react";
import { ReactionAddEditPage } from "../../customComponents";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const session = useSession();
  const router = useRouter();

  return session.data?.user ? (
    router.query?.data ?
      <ReactionAddEditPage edit={true} data={router.query?.data} />
      :
      <p>{"Page accessed directly through link!"}</p>
  ) : (
    <p>{"User not authenticated!"}</p>
  );
}

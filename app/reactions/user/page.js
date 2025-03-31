"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ReactionPage, LoadingScreen, scrollToTop, Alert, N_REACTIONS_PER_PAGE } from "../../customComponents";

export default function Home() {
  let [userReactions, setUserReactions] = useState([]);
  let session = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalNumberReactions, setTotalNumberReactions] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState({});


  useEffect(() => {
    (async function () {
      if (currentPage >= 0) {
        setIsLoading(true);
        const resp = await fetch("/api/reactions/user", {
          method: "GET",
          headers: {
            filters: JSON.stringify(selectedFilters),
            nRecords: N_REACTIONS_PER_PAGE,
            fromIndex: currentPage * N_REACTIONS_PER_PAGE
          },
        });
        if (resp.ok) {
          const reactions = await resp.json();
          setUserReactions(reactions[0]);
          setTotalNumberReactions(reactions[1]);
          setIsLoading(false);
        } else {
          setMessage(await resp.text() + " ");
          setCorrectiveAction("Go back to the home page.");
          setShowAlert(true);
          setIsLoading(false);
          scrollToTop();
        }
      }
    })();
  }, [selectedFilters, currentPage]);

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedFilters])

  return session.data?.user ? (
    <>
      {showAlert ? (
        <Alert
          type={"danger"}
          message={message}
          correctiveAction={correctiveAction}
        />
      ) : (
        <></>
      )}
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <></>
      )}
      <ReactionPage
        reactions={userReactions}
        editable={true}
        setSelectedFilters={setSelectedFilters}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalNumberReactions={totalNumberReactions} />
    </>
  ) : (
    <p>{"User not authenticated!"}</p>
  );
}

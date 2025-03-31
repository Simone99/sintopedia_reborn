"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ReactionPage, LoadingScreen, scrollToTop, Alert, N_REACTIONS_PER_PAGE, ShowUserSynthonsModal, getBase64ImageFromSmiles } from "../customComponents";

export default function Home() {
  /* Handling pagination and filtering server side */
  const router = useRouter();
  const [reactions, setReactions] = useState(undefined);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [totalNumberReactions, setTotalNumberReactions] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [currentlyShownQuery, setCurrentlyShownQuery] = useState(undefined);
  const [currentlyShownUserSynthons, setCurrentlyShownSynthons] = useState([]);

  useEffect(() => {
    (async function () {
      if (currentlyShownQuery !== undefined) {
        setIsLoading(true);
        let ketcherFrame = document.getElementById("sketch");
        let ketcher = undefined;

        if ("contentDocument" in ketcherFrame)
          ketcher = ketcherFrame.contentWindow.ketcher;
        // IE7
        else ketcher = document.frames["ifKetcher"].window.ketcher;

        if (!ketcher) {
          setMessage("Wait few seconds to let the framework to properly load!");
          setCorrectiveAction("");
          setShowAlert(true);
          setCurrentlyShownQuery(undefined);
          setIsLoading(false);
          scrollToTop();
          return;
        }
        let tmp = [];
        for (let i = 0; i < router.query["query_ids"].length; i++) {
          if (router.query["query_ids"][i] == currentlyShownQuery) {
            tmp.push(await getBase64ImageFromSmiles(ketcher.indigo, router.query["molecule"][i]));
          }
        }
        setCurrentlyShownSynthons(tmp);
        setIsLoading(false);
      } else {
        setCurrentlyShownSynthons([]);
      }
    })();
  }, [currentlyShownQuery, router.query]);

  useEffect(() => {
    (async function () {
      if (currentPage >= 0) {
        try {
          setIsLoading(true);
          const resp = await fetch("/api/reactions", {
            method: "GET",
            headers: {
              molecule: router.query
                ? router.query["molecule"]
                  ? JSON.stringify(router.query["molecule"])
                  : JSON.stringify(["C1=CC=CC=C1"])
                : JSON.stringify(["C1=CC=CC=C1"]),
              query_ids: router.query
                ? router.query["query_ids"]
                  ? JSON.stringify(router.query["query_ids"])
                  : JSON.stringify([0])
                : JSON.stringify([0]),
              filters: JSON.stringify(selectedFilters),
              nRecords: N_REACTIONS_PER_PAGE,
              fromIndex: currentPage * N_REACTIONS_PER_PAGE
            },
          });
          if (resp.ok) {
            const reactions = await resp.json();
            if (reactions.error_text) {
              setMessage(reactions.error_text + " ");
              setCorrectiveAction("Go back to the home page.");
              setShowAlert(true);
              setIsLoading(false);
              scrollToTop();
              return;
            }
            setReactions(reactions[0]);
            setTotalNumberReactions(reactions[1]);
            setIsLoading(false);
          } else {
            setMessage(await resp.text() + " ");
            setCorrectiveAction("Go back to the home page.");
            setShowAlert(true);
            setIsLoading(false);
            scrollToTop();
          }
        } catch (error) {
          setMessage(error + " ");
          setCorrectiveAction("Go back to the home page.");
          setShowAlert(true);
          setIsLoading(false);
          scrollToTop();
        }
      }
    })();
  }, [router.query, selectedFilters, currentPage]);

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedFilters])

  return (
    <>
      <iframe
        id="sketch"
        src="./index.html"
        hidden={true}
        style={{
          overflow: "hidden",
          minWidth: 750,
          minHeight: 750,
          border: "1px solid darkgray",
        }}
      />
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
      {
        currentlyShownUserSynthons.length > 0 ? (
          <ShowUserSynthonsModal
            setCurrentlyShownQuery={setCurrentlyShownQuery}
            query_images={currentlyShownUserSynthons}
          />
        ) : (
          <></>
        )
      }
      <ReactionPage
        reactions={reactions}
        editable={false}
        setSelectedFilters={setSelectedFilters}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalNumberReactions={totalNumberReactions}
        setCurrentlyShownQuery={setCurrentlyShownQuery}
      />
    </>
  );
}

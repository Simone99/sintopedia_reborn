"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ReactionPage, LoadingScreen, scrollToTop, Alert, N_REACTIONS_PER_PAGE, ShowUserSynthonsModal, getBase64ImageFromSmiles } from "../../customComponents";

export default function Home() {
    /*
        Handling pagination and filtering client side
    */
    const router = useRouter();
    const [reactions, setReactions] = useState(undefined);
    const [filteredReactions, setFilteredReactions] = useState([]);
    const [reactionsOnPage, setReactionsOnPage] = useState(undefined);
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
        setReactionsOnPage(filteredReactions.slice(currentPage * N_REACTIONS_PER_PAGE, (currentPage + 1) * N_REACTIONS_PER_PAGE));
    }, [currentPage, filteredReactions]);

    useEffect(() => {
        (async function () {
            try {
                setIsLoading(true);
                const resp = await fetch("/api/reactions", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        "molecule": router.query
                            ? router.query["molecule"]
                                ? JSON.stringify(router.query["molecule"])
                                : JSON.stringify(["C1=CC=CC=C1"])
                            : JSON.stringify(["C1=CC=CC=C1"]),
                        "filters": JSON.stringify({}),
                        "query_ids": router.query
                            ? router.query["query_ids"]
                                ? JSON.stringify(router.query["query_ids"])
                                : JSON.stringify([0])
                            : JSON.stringify([0]),
                        "nRecords": 0,
                        "fromIndex": 0
                    })
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
                    setFilteredReactions(reactions[0]);
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
        })();
    }, [router.query]);

    useEffect(() => {
        if (reactions !== undefined) {
            setCurrentPage(0);
            setIsLoading(true);
            let filtered_tmp = reactions.filter((reaction) => {
                for (let filter_key in selectedFilters) {
                    if (filter_key === "General Reactivity" && selectedFilters[filter_key].length > 0) {
                        if (!reaction["general_reactivity"].some(value => selectedFilters[filter_key].includes(value))) {
                            return false;
                        }
                    }
                    if (filter_key === "Stereoselectivity" && selectedFilters[filter_key].length > 0) {
                        if (!reaction["stereoselectivity"].some(value => selectedFilters[filter_key].includes(value))) {
                            return false;
                        }
                    }
                    if (filter_key === "Methodology class" && selectedFilters[filter_key].length > 0) {
                        if (!reaction["methodology_class"].some(value => selectedFilters[filter_key].includes(value))) {
                            return false;
                        }
                    }
                    if (filter_key === "Green chemistry" && selectedFilters[filter_key]) {
                        if (selectedFilters[filter_key] != reaction["green_chemistry"]) {
                            return false;
                        }
                    }
                    if (filter_key === "Year of publication" && selectedFilters[filter_key] !== undefined && selectedFilters[filter_key] !== "") {
                        if (selectedFilters[filter_key] != reaction["year_of_publication"]) {
                            return false;
                        }
                    }
                    if (filter_key === "reaction_name" && selectedFilters[filter_key] != "") {
                        const re = new RegExp(selectedFilters[filter_key]);
                        if (!re.test(reaction["name"])) {
                            return false;
                        }
                    }
                }
                return true;
            });
            setFilteredReactions(filtered_tmp);
            setTotalNumberReactions(filtered_tmp.length);
            setIsLoading(false);
        }
    }, [selectedFilters, reactions])

    return (
        <>
            <iframe
                id="sketch"
                src="../../index.html"
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
            {
                reactionsOnPage ?
                    <>
                        <ReactionPage
                            reactions={reactionsOnPage}
                            editable={false}
                            setSelectedFilters={setSelectedFilters}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            totalNumberReactions={totalNumberReactions}
                            setCurrentlyShownQuery={setCurrentlyShownQuery}
                        />
                    </>
                    :
                    <></>
            }
        </>
    );
}

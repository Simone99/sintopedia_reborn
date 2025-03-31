"use strict";
"use client";

import { useRouter } from "next/navigation";
import { Alert, Button, delay, Disclaimer, LoadingScreen, ConfirmationModal, scrollToTop } from "./customComponents";
import { useState, useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeepSearchModal, setShowDeepSearchModal] = useState(false);
  const [showSplitAromaticBondsModal, setShowSplitAromaticBondsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deepMoleculeSearch, setDeepMoleculeSearch] = useState(false);

  useEffect(() => {
    // Check session storage for modal state
    let hasSeenModal = Boolean(sessionStorage.getItem("hasSeenModal"));
    if (!hasSeenModal) {
      setShowModal(true);
    }
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
    sessionStorage.setItem("hasSeenModal", "true");
  };

  const onClickEventHandler = async (splitAromatic) => {
    setIsLoading(true);
    let ketcherFrame = document.getElementById("sketch");
    let ketcher = undefined;

    if ("contentDocument" in ketcherFrame)
      ketcher = ketcherFrame.contentWindow.ketcher;
    // IE7
    else ketcher = document.frames["ifKetcher"].window.ketcher;

    if (ketcher) {
      if (deepMoleculeSearch) {
        let molecule = await ketcher.getSmiles();
        if (molecule === "") {
          setMessage("You did not enter synthons! ");
          setCorrectiveAction("Specify all synthons.");
          setShowAlert(true);
          setIsLoading(false);
          return;
        }
        const resp = await fetch("/api/molecule/synthons", {
          method: "GET",
          headers: {
            molecule: molecule,
            split_aromatic_bonds: splitAromatic
          },
        });
        if (!resp.ok) {
          setMessage(await resp.text() + " ");
          setCorrectiveAction("Go back to the home page.");
          setShowAlert(true);
          setIsLoading(false);
          scrollToTop();
          return;
        }

        const splits = await resp.json();
        if (splits.error_text) {
          setMessage(splits.error_text + " ");
          setCorrectiveAction("Go back to the home page.");
          setShowAlert(true);
          setIsLoading(false);
          scrollToTop();
          return;
        }

        let smiles_list = [];
        let indexes = [];
        let index = 0;
        for (let split of splits) {
          for (let smiles of split) {
            indexes.push(index);
            smiles_list.push(smiles);
          }
          index += 1;
        }

        router.query = {
          query_ids: indexes,
          molecule: smiles_list
        };
        router.push("/reactions/deep_molecule");
      } else {
        try {
          let synthons_raw = await ketcher.getSdf();
          if (synthons_raw === "") {
            setMessage("You did not enter synthons! ");
            setCorrectiveAction("Specify all synthons.");
            setShowAlert(true);
            setIsLoading(false);
            return;
          }
          let synthons_sdf = synthons_raw.split("$$$$\n");
          let synthons = [];
          let query_ids = [];
          for (let synthon_sdf of synthons_sdf) {
            if (synthon_sdf !== "") {
              await ketcher.setMolecule(synthon_sdf + "$$$$\n");
              await delay(500);
              let synthon_smiles = await ketcher.getSmiles();
              synthons.push(synthon_smiles);
              query_ids.push(0);
            }
          }
          router.query = {
            query_ids: query_ids,
            molecule: synthons,
          };
          router.push("/reactions");
        } catch (error) {
          setMessage("Macromolecules are not supported. ");
          setCorrectiveAction("Go back to normal mode.");
          setShowAlert(true);
          setIsLoading(false);
        }
      }
    } else {
      setMessage("Ketcher did not load ");
      setCorrectiveAction("Wait few seconds and retry.");
      setShowAlert(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-wrap flex-auto items-center">
      {showModal && <Disclaimer onClose={handleCloseModal} />}
      {showDeepSearchModal && <ConfirmationModal
        setIsOpen={setShowDeepSearchModal}
        handleDelete={(event) => {
          event.preventDefault();
          setShowSplitAromaticBondsModal(true);
          setShowDeepSearchModal(false);
        }}
        modalText={"Are you sure you want to use deep molecule search mode? It's an expensive operation and it could take up to 30 minutes"}
        cancelButtonText={"No"}
        confirmButtonText={"Yes"}
      />}
      {showSplitAromaticBondsModal && <ConfirmationModal
        setIsOpen={(_) => {
          setShowSplitAromaticBondsModal(false);
          onClickEventHandler(false);
        }}
        handleDelete={(event) => {
          event.preventDefault();
          setShowSplitAromaticBondsModal(false);
          onClickEventHandler(true);
        }}
        modalText={"Do you want to split aromatic bonds? We strongly suggest NOT to split aromatic bonds due to efficiency reasons"}
        cancelButtonText={"No"}
        confirmButtonText={"Yes"}
      />}
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <></>
      )}
      {showAlert ? (
        <Alert
          type={"danger"}
          message={message}
          correctiveAction={correctiveAction}
        />
      ) : (
        <></>
      )}
      {
        !showModal && (
          <>
            <div className="p-6">
              <iframe
                id="sketch"
                src="./index.html"
                style={{
                  overflow: "hidden",
                  minWidth: 750,
                  minHeight: 750,
                  border: "1px solid darkgray",
                }}
              />
            </div>
            <div className="flex flex-col flex-auto items-center">
              <label
                htmlFor="deep_molecule_search_checkbox"
                className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300"
              >
                Deep molecule search
              </label>
              <div className="p-1" />
              <input
                id="deep_molecule_search_checkbox"
                type="checkbox"
                onChange={(event) => {
                  setDeepMoleculeSearch(event.target.checked);
                }}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
              />
            </div>
            <div className="p-2" />
            <Button onClick={(event) => {
              event.preventDefault();
              if (deepMoleculeSearch) {
                setShowDeepSearchModal(true);
              } else {
                onClickEventHandler();
              }
            }}>Search!</Button>
          </>)
      }
    </div>
  );
}

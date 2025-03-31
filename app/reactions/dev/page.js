"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Alert, Button, delay } from "../../customComponents";
import { useState } from "react";
import { removeSlashAndBackSlash, blobToBase64, toggleExplicitHydrogens, aromatizeSynthon, LoadingScreen } from "../../customComponents"


export default function Home() {
  const session = useSession();
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onClickEventHandler = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    let reaction_file = document.getElementById("reaction_file");
    let ketcherFrame = document.getElementById("sketch_dev");
    let ketcher = undefined;
    let toggle_hydrogens = undefined;
    let toggle_aromatize = undefined;

    if ("contentDocument" in ketcherFrame) {
      ketcher = ketcherFrame.contentWindow.ketcher;
      toggle_hydrogens = ketcherFrame.contentWindow.document.querySelector('button[title="Add/Remove explicit hydrogens"]');
      toggle_aromatize = ketcherFrame.contentWindow.document.querySelector('button[title="Aromatize (Alt+A)"]');
    }
    // IE7
    else ketcher = document.frames["ifKetcher"].window.ketcher;
    if (ketcher) {
      if (!toggle_hydrogens) {
        setMessage("Toggle hydrogens button not found! ");
        setCorrectiveAction("Wait few seconds and retry.");
        setShowAlert(true);
        setIsLoading(false);
        return;
      }
      if (!toggle_aromatize) {
        setMessage("Aromatize button not found! ");
        setCorrectiveAction("Wait few seconds and retry.");
        setShowAlert(true);
        setIsLoading(false);
        return;
      }
      try {
        // ketcher.setSettings({ "general.dearomatize-on-load": true });
        // ketcher.setSettings({ "ignoreChiralFlag": true });
        let reactions = JSON.parse(await reaction_file.files[0]?.text());
        for (let reaction of reactions) {
          reaction["reaction_image"] = await blobToBase64(await ketcher.generateImage(reaction.reaction_smiles, {
            outputFormat: "png",
            // backgroundColor: 0,
            // bondThickness: 3
          }));
          // Let's split synthons
          await ketcher.setMolecule(reaction.synthons);
          // await delay(500);
          await delay(500);
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
          for (let synthon_sdf of synthons_sdf) {
            if (synthon_sdf !== "") {
              await ketcher.setMolecule(synthon_sdf + "$$$$\n");
              await delay(500);
              aromatizeSynthon(toggle_aromatize);
              await delay(500);
              let synthon_smiles = await toggleExplicitHydrogens(ketcher, toggle_hydrogens);
              synthon_smiles = removeSlashAndBackSlash(synthon_smiles);
              synthons.push({
                synthon_smiles: synthon_smiles,
                synthon_image: await blobToBase64(
                  await ketcher.generateImage(synthon_smiles, {
                    outputFormat: "png",
                    // backgroundColor: 0,
                    // bondThickness: 3
                  })
                ),
              });
            }
          }
          reaction.synthons = synthons;
          let filters = {};
          if (reaction.stereoselectivity) {
            filters["Stereoselectivity"] =
              reaction.stereoselectivity;
            delete reaction.stereoselectivity;
          }
          if (reaction.general_reactivity) {
            filters["General Reactivity"] = reaction.general_reactivity;
            delete reaction.general_reactivity;
          }
          if (reaction.methodology_class) {
            filters["Methodology class"] = reaction.methodology_class;
            delete reaction.methodology_class;
          }
          if (reaction.green_chemistry) {
            filters["Green chemistry"] = reaction.green_chemistry;
            delete reaction.green_chemistry;
          }
          if (reaction.year_of_publication) {
            filters["Year of publication"] = reaction.year_of_publication;
            delete reaction.year_of_publication;
          }
          reaction["filters"] = filters;
        }
        const res = await fetch("/api/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reactions),
        });
        if (res.ok) {
          router.push("/");
        } else {
          let error_text = await res.text();
          setMessage(error_text + " ");
          setCorrectiveAction("Go back to the home page");
          setShowAlert(true);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        setMessage(e + " ");
        setCorrectiveAction("Check file format!");
        setShowAlert(true);
        setIsLoading(false);
      }
    } else {
      setMessage("Page didn't load properly. ");
      setCorrectiveAction("Wait few seconds and retry!");
      setShowAlert(true);
      setIsLoading(false);
    }
  };

  return session.data?.user ? (
    session.data.user.role === 0 ?
      <div className="flex flex-col flex-wrap flex-auto items-center">
        {showAlert ? (
          <Alert
            type={"danger"}
            message={message}
            correctiveAction={correctiveAction}
          />
        ) : (
          <></>
        )}
        {isLoading && <LoadingScreen />}
        <div className="p-6">
          <iframe
            id="sketch_dev"
            src="../../index.html"
            style={{
              overflow: "hidden",
              minWidth: 750,
              minHeight: 750,
              border: "1px solid darkgray",
            }}
          />
        </div>
        <input
          id="reaction_file"
          name="reaction_file"
          type="file"
          className="py-4"
        />
        <Button onClick={onClickEventHandler}>Upload!</Button>
      </div>
      :
      <p>{"User does not have the permission to access this page!"}</p>
  ) : (
    <p>{"User not authenticated!"}</p>
  );
}

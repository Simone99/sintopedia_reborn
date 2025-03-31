"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut, signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";


const N_REACTIONS_PER_PAGE = 10;


function Button(props) {
  const colors = {
    blue: ["bg-blue-500", "bg-blue-700"],
    red: ["bg-red-500", "bg-red-700"],
  };
  return (
    <button
      className={`${colors[props.color ? props.color : "blue"][0]} hover:${colors[props.color ? props.color : "blue"][1]} text-white font-bold py-2 px-4 rounded-full`}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
}

function NavBar(props) {
  const session = useSession();
  const router = useRouter();
  return (
    <nav id="navbar" className="fixed top-0 left-0 w-full flex items-center justify-between flex-wrap bg-linear-to-r from-blue-500 to-(--background-end-rgb) p-4">
      <div className="flex items-center shrink-0 text-white mr-6">
        <Image src="/Synthonpedia_logo_2.png" alt="" width={50} height={50} />
        <div className="px-1" />
        <Link href="/">
          <span className="font-semibold text-xl tracking-tight">
            Synthonpedia
          </span>
        </Link>
      </div>
      <div className="w-full block grow lg:flex lg:items-center lg:w-auto">
        <div className="flex flex-row-reverse flex-wrap flex-auto">
          {session.data?.user ? (
            <>
              <Button
                color={"blue"}
                onClick={async (event) => {
                  event.preventDefault();
                  await signOut();
                }}
              >
                Logout
              </Button>
              <div className="w-4" />
              <Button
                color={"blue"}
                onClick={(event) => {
                  event.preventDefault();
                  router.push("/reactions/add");
                }}
              >
                Add new reaction!
              </Button>
              <div className="w-4" />
              <Button
                color={"blue"}
                onClick={(event) => {
                  event.preventDefault();
                  router.push("/reactions/user");
                }}
              >
                My reactions
              </Button>
            </>
          ) : (
            <>
              <Button
                color={"blue"}
                onClick={async (event) => {
                  event.preventDefault();
                  await signIn();
                }}
              >
                Login
              </Button>
              <div className="w-4" />
              <Button
                color={"blue"}
                onClick={(event) => {
                  event.preventDefault();
                  router.push("/register");
                }}
              >
                Register
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function Alert(props) {
  const colors = {
    info: "text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400",
    danger:
      "text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400",
    success:
      "text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400",
    warning:
      "text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300",
    dark: "text-gray-800 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-gray-300",
  };

  return (
    <div
      className={"flex items-center p-4 mb-4 text-sm " + colors[props.type]}
      role="alert"
    >
      <svg
        className="shrink-0 inline w-4 h-4 me-3"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
      </svg>
      <span className="sr-only">Info</span>
      <div>
        <span className="font-medium">{props.message}</span>
        {props.correctiveAction}
      </div>
    </div>
  );
}

function Reaction({ reaction, editable, user, onReport, onEdit, onDelete, setCurrentlyShownQuery }) {

  const [showSynthons, setShowSynthons] = useState(false);
  // const [showMatchingUserMolecule, setShowMatchingUserMolecule] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col flex-wrap flex-auto items-center p-8">
      <div className="w-5/6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <Image
          className="rounded-t-lg w-full h-full"
          src={reaction.reaction_image}
          width={500}
          height={500}
          alt="Picture of the author"
          style={{ backgroundColor: "white" }}
        />
        <div className="p-5">
          <a href="#">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {reaction.name}
            </h5>
          </a>
          {reaction.links?.length !== 0 ? (
            <ul className="list-disc list-inside">
              {reaction.links.map((link) => (
                <li
                  key={link}
                  className="mb-3 font-normal text-gray-700 dark:text-gray-400 break-words"
                >
                  <a href={link} target="_blank" className="break-words break-all">{link}</a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
              No link provided.
            </p>
          )}
          <div className="flex flex-row flex-wrap">
            {reaction.stereoselectivity ? (
              reaction.stereoselectivity.map((cs) => (
                <span
                  key={cs}
                  className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300"
                >
                  {cs}
                </span>
              ))
            ) : (
              <></>
            )}
            {reaction.general_reactivity ? (
              reaction.general_reactivity.map((cs) => (
                <span
                  key={cs}
                  className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300"
                >
                  {cs}
                </span>
              ))
            ) : (
              <></>
            )}
            {reaction.methodology_class ? (
              reaction.methodology_class.map((cs) => (
                <span
                  key={cs}
                  className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300"
                >
                  {cs}
                </span>
              ))
            ) : (
              <></>
            )}
            {reaction.green_chemistry ? (
              <span
                key={"Green chemistry"}
                className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300"
              >
                {"Green chemistry: " + reaction.green_chemistry}
              </span>
            ) : (
              <></>
            )}
            {reaction.year_of_publication ? (
              <span
                key={"Year of publication"}
                className="bg-purple-100 text-purple-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-purple-900 dark:text-purple-300"
              >
                {"Year of publication: " + reaction.year_of_publication}
              </span>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
      <div className="py-2" />
      <Button
        color={"blue"}
        onClick={(event) => {
          event.preventDefault();
          setShowSynthons(prev => !prev);
        }}
      >{(showSynthons ? "Hide " : "Show ") + "synthons"}
      </Button>
      <div className="py-2" />
      {/* {
        !editable ?
          <Button
            color={"blue"}
            onClick={(event) => {
              event.preventDefault();
              setShowMatchingUserMolecule(prev => !prev);
            }}
          >{(showMatchingUserMolecule ? "Hide " : "Show ") + "matching user query"}
          </Button>
          :
          <></>
      } */}
      {
        showSynthons ?
          <div className="flex flex-col flex-wrap flex-auto">
            {Object.entries(reaction.synthons_images_by_user_by_query_id).map(([user_id, synthons_by_query_id]) => (
              <div key={`${user_id}`}>
                {
                  Object.entries(synthons_by_query_id).map(([query_id, synthons]) => (
                    <div key={`${user_id} + ${query_id}`}>
                      <div className="py-2" />
                      <div className="flex flex-row items-center">
                        {
                          !editable && <>
                            <Button
                              color={"blue"}
                              onClick={(event) => {
                                event.preventDefault();
                                setCurrentlyShownQuery(query_id);
                              }}
                            >
                              Show matching query
                            </Button>
                            <div className="px-2" />
                          </>
                        }
                        {
                          synthons.map((synthon, index) => (
                            <div className="flex flex-row" key={`${index} + ${user_id} + ${query_id}`}>
                              <Image
                                className="rounded-lg w-auto h-auto"
                                src={synthon}
                                width={500}
                                height={500}
                                alt="Picture of synthon"
                                style={{ backgroundColor: "white" }}
                              />
                              <div className="px-2" />
                            </div>
                          ))
                        }
                        {
                          user && !editable ?
                            <>
                              <div className="py-2" />
                              <Button
                                color={"red"}
                                onClick={(event) => {
                                  event.preventDefault();
                                  setIsOpen(true);
                                }}
                              >
                                Report synthons association
                              </Button>
                              {isOpen && <ConfirmationModal
                                setIsOpen={setIsOpen}
                                handleDelete={(event) => {
                                  event.preventDefault();
                                  onReport(reaction.id, user_id);
                                  setIsOpen(false);
                                }}
                                modalText={"Are you sure you want to report this association?"}
                              />}
                            </>
                            :
                            <></>
                        }
                      </div>
                    </div>
                  ))
                }
              </div>
            ))}
          </div>
          :
          <></>
      }
      {editable ? (
        <>
          <div className="py-2" />
          <div className="flex flex-row flex-wrap flex-auto">
            <Button
              color={"blue"}
              onClick={(event) => {
                event.preventDefault();
                onEdit(reaction);
              }}
            >
              Edit
            </Button>
            <div className="px-1" />
            <Button
              color={"red"}
              onClick={(event) => {
                event.preventDefault();
                setIsOpen(true);
              }}
            >
              Delete
            </Button>
            {isOpen && <ConfirmationModal
              setIsOpen={setIsOpen}
              handleDelete={(event) => {
                event.preventDefault();
                onDelete(reaction.id);
                setIsOpen(false);
              }}
              modalText={"Are you sure you want to remove this association?"}
            />}
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

function PrevNextButtons({ onPrev, onNext, totalNumberItems, currentPage, itemPerPage }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-sm text-gray-700 dark:text-gray-400">
        Showing{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {totalNumberItems == 0 ? 0 : currentPage * itemPerPage + 1}
        </span>{" "}
        to{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {(currentPage + 1) * itemPerPage < totalNumberItems ? (currentPage + 1) * itemPerPage : totalNumberItems}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {totalNumberItems}
        </span>{" "}
        reactions
      </span>
      <div className="inline-flex mt-2 xs:mt-0">
        <button
          onClick={onPrev}
          className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 rounded-s hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          <svg
            className="w-3.5 h-3.5 me-2 rtl:rotate-180"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 5H1m0 0 4 4M1 5l4-4"
            />
          </svg>
          Prev
        </button>
        <button
          onClick={onNext}
          className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 border-0 border-s border-gray-700 rounded-e hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          Next
          <svg
            className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 5h12m0 0L9 1m4 4L9 9"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

function ReactionPage(props) {
  const [reactions, setReactions] = useState(undefined);
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();
  const router = useRouter();

  const onDelete = async (id) => {
    setIsLoading(true);
    const resp = await fetch("/api/reactions", {
      method: "DELETE",
      headers: {
        reactionId: id,
      },
    });
    if (resp.ok) {
      setReactions(reactions.filter((reaction) => reaction.id !== id));
      setIsLoading(false);
    } else {
      setMessage(await resp.text() + " ");
      setCorrectiveAction("Go back to the home page.");
      setShowAlert(true);
      setIsLoading(false);
      scrollToTop();
    }
  };

  const onEdit = (reaction) => {
    router.query = {
      data: reaction,
    };
    router.push("/reactions/edit");
  };

  const handleReportReaction = async (id, user_id_of_synthons_association) => {
    setIsLoading(true);
    if (session.data.user.id !== user_id_of_synthons_association) {
      let res = await fetch("/api/user/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "reaction_id": id,
          "user_id_reported": user_id_of_synthons_association
        }),
      });
      if (!res.ok) {
        let error_text = (await res.json())["error_text"];
        setMessage(error_text + " ");
        if (error_text === "User already reported the selected reaction.") {
          setCorrectiveAction("");
        } else {
          setCorrectiveAction("Go back to the home page");
        }
        setShowAlert(true);
        setIsLoading(false);
        scrollToTop();
        return;
      }
      setIsLoading(false);
    } else {
      setMessage("Users can't report their own associations! ");
      setCorrectiveAction("Edit the association in the \"My reactions\" page");
      setShowAlert(true);
      setIsLoading(false);
      scrollToTop();
    }
  }

  useEffect(() => {
    setReactions(props.reactions);
  }, [props.reactions]);

  return (
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
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <></>
      )}
      <ReactionFilters setSelectedFilters={props.setSelectedFilters} showSearchBar={true} />
      {reactions ? (
        reactions.map((reaction) => (
          <Reaction
            key={reaction.id}
            reaction={reaction}
            editable={props.editable}
            onDelete={onDelete}
            onEdit={onEdit}
            onReport={handleReportReaction}
            user={session.data?.user}
            setCurrentlyShownQuery={props.setCurrentlyShownQuery}
          />
        ))
      ) : (
        <></>
      )}
      <PrevNextButtons
        onPrev={
          (event) => {
            event.preventDefault();
            props.setCurrentPage((prev) => {
              if (prev === 0) return 0;
              return prev - 1;
            });
          }
        }
        onNext={
          (event) => {
            event.preventDefault();
            props.setCurrentPage((prev) => {
              if ((prev + 1) * N_REACTIONS_PER_PAGE > props.totalNumberReactions) return prev;
              return prev + 1;
            });
          }
        }
        totalNumberItems={props.totalNumberReactions}
        currentPage={props.currentPage}
        itemPerPage={N_REACTIONS_PER_PAGE}
      />
    </div>
  );
}

const delay = (delayInms) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};

function ReactionFilters({ setSelectedFilters, preSelectedFilters, showSearchBar }) {
  let [filters, setFilters] = useState(undefined);

  useEffect(() => {
    (async function () {
      let res = await fetch("/api/reactions/properties", {
        method: "GET",
      });
      if (res.ok) {
        let filters = await res.json();
        setFilters(filters);
      }
    })();
  }, []);

  useEffect(() => {
    if (filters) {
      for (let filter of filters) {
        setSelectedFilters((prev) => {
          let tmp = { ...prev };
          if (preSelectedFilters) {
            if (preSelectedFilters[filter.property_name]) {
              tmp[filter.property_name] =
                preSelectedFilters[filter.property_name];
              for (let property of tmp[filter.property_name]) {
                let checkbox = document.getElementById(property);
                // checkbox.setAttribute("checked", "true");
                checkbox.checked = true;
              }
            } else {
              tmp[filter.property_name] = [];
            }
          } else {
            tmp[filter.property_name] = [];
          }
          return tmp;
        });
      }
      setSelectedFilters((prev) => {
        let tmp = { ...prev };
        if (preSelectedFilters) {
          if (preSelectedFilters["Green chemistry"]) {
            tmp["Green chemistry"] =
              preSelectedFilters["Green chemistry"];
            document.getElementById("Green chemistry").checked =
              tmp["Green chemistry"];
          } else {
            tmp["Green chemistry"] = undefined;
          }
        } else {
          tmp["Green chemistry"] = undefined;
        }
        return tmp;
      });
      setSelectedFilters((prev) => {
        let tmp = { ...prev };
        if (preSelectedFilters) {
          if (preSelectedFilters["Year of publication"]) {
            tmp["Year of publication"] =
              preSelectedFilters["Year of publication"];
            document.getElementById("Year of publication").value =
              tmp["Year of publication"];
          } else {
            tmp["Year of publication"] = undefined;
          }
        } else {
          tmp["Year of publication"] = undefined;
        }
        return tmp;
      });
      setSelectedFilters((prev) => {
        let tmp = { ...prev };
        tmp["reaction_name"] = "";
        return tmp;
      });
    }
  }, [preSelectedFilters, filters, setSelectedFilters]);

  return (
    <div className="flex flex-col items-center">
      {
        showSearchBar ?
          <SearchBar onSearch={(event) => {
            event.preventDefault();
            setSelectedFilters((prev) => {
              let value = document.getElementById("search-input").value;
              let tmp = { ...prev };
              tmp["reaction_name"] = value;
              return tmp;
            });
          }} />
          :
          <></>
      }
      <div className="flex flex-row items-start py-4">
        {filters ? (
          filters.map((filter, index, array) => (
            <div className="flex flex-row" key={filter.property_name + `${index}`}>
              <div className="flex flex-col items-center py-4">
                <button
                  id={filter.property_name}
                  data-dropdown-toggle={filter.property_name + "_dropdown"}
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-hidden focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    let menu = document.getElementById(
                      filter.property_name + "_dropdown",
                    );
                    if (menu.classList.contains("hidden")) {
                      menu.classList.remove("hidden");
                    } else {
                      menu.classList.add("hidden");
                    }
                  }}
                >
                  {filter.property_name + " "}
                  <svg
                    className="w-2.5 h-2.5 ms-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 4 4 4-4"
                    />
                  </svg>
                </button>
                <div
                  id={filter.property_name + "_dropdown"}
                  className="z-10 hidden w-48 bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600"
                >
                  <ul
                    className="p-3 space-y-3 text-sm text-gray-700 dark:text-gray-200"
                    aria-labelledby="dropdownRadioButton"
                  >
                    {filter.values ? (
                      filter.values.map((value) => (
                        <li key={value}>
                          <div className="flex items-center">
                            <input
                              id={value}
                              type="checkbox"
                              value={value}
                              onChange={(event) => {
                                setSelectedFilters((prev) => {
                                  let tmp = { ...prev };
                                  if (event.target.checked) {
                                    // Add
                                    tmp[filter.property_name].push(
                                      event.target.value,
                                    );
                                  } else {
                                    // Remove
                                    tmp[filter.property_name] = tmp[
                                      filter.property_name
                                    ].filter(
                                      (value) => value !== event.target.value,
                                    );
                                  }
                                  return tmp;
                                });
                              }}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                            />
                            <label
                              htmlFor={value}
                              className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300"
                            >
                              {value}
                            </label>
                          </div>
                        </li>
                      ))
                    ) : (
                      <></>
                    )}
                  </ul>
                </div>
              </div>
              <div className="px-4" />
            </div>
          ))
        ) : (
          <></>
        )}
        <div className="flex flex-col items-center py-4">
          <label
            htmlFor="Green chemistry"
            className="block uppercase tracking-wide text-black dark:text-white text-xs font-bold mb-2"
          >
            Green chemistry
          </label>
          <input
            id="Green chemistry"
            type="checkbox"
            onChange={(event) => {
              setSelectedFilters((prev) => {
                let tmp = { ...prev };
                if (event.target.checked) {
                  tmp["Green chemistry"] = event.target.checked;
                } else {
                  tmp["Green chemistry"] = undefined;
                }
                return tmp;
              });
            }}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
          />
        </div>
        <div className="px-4" />
        <div className="flex flex-col items-center py-3">
          <label
            htmlFor="Year of publication"
            className="block uppercase tracking-wide text-black dark:text-white text-xs font-bold mb-2"
          >
            Year of publication
          </label>
          <input
            id="Year of publication"
            type="number"
            className="border border-gray-900 dark:border-gray-300"
            onBlur={(event) => {
              setSelectedFilters((prev) => {
                let tmp = { ...prev };
                tmp["Year of publication"] = event.target.value;
                return tmp;
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}

function removeSlashAndBackSlash(smiles) {
  return smiles.replace(/[\/\\]/g, "");
}

function ReactionAddEditPage(props) {
  const session = useSession();
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [linkCount, setLinkCount] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [preSelectedFilters, setPreSelectedFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    /*{
      id: 1,
      links: [],
      name: "",
      reaction_image: [], binary array
      reaction_smiles: "",
      synthons_images_by_user: {
        "user_id": [
          "", base64 string image
          ""  base64 string image
        ]
      },
      synthons_smiles_by_user: {
        "user_id": ["", ""]
      }
      }*/
    (async function () {
      if (router.query?.data && props.edit) {
        // show a loading screen
        setIsLoading(true);
        setLinkCount(router.query.data.links.length);
        await delay(3000);
        let ketcherFrame = document.getElementById("reaction_sketch");
        let ketcher_reaction = undefined;

        if ("contentDocument" in ketcherFrame)
          ketcher_reaction = ketcherFrame.contentWindow.ketcher;
        // IE7
        else ketcher_reaction = document.frames["ifKetcher"].window.ketcher;

        ketcherFrame = document.getElementById("synthons_sketch");
        let ketcher_synthons = undefined;

        if ("contentDocument" in ketcherFrame)
          ketcher_synthons = ketcherFrame.contentWindow.ketcher;
        // IE7
        else ketcher_synthons = document.frames["ifKetcher"].window.ketcher;

        if (ketcher_reaction && ketcher_synthons) {
          try {
            document.getElementById("reaction_name").value =
              router.query.data.name;
            await ketcher_reaction.setMolecule(router.query.data.reaction_smiles);
            for (let i = 0; i < router.query.data.links.length; i++) {
              document.getElementById("link_" + i).value =
                router.query.data.links[i];
            }
            for (let synthon of router.query.data.synthons_smiles_by_user[session.data.user.id]) {
              await ketcher_synthons.addFragment(synthon);
              await delay(500);
            }
            // Set all the filters
            let tmp_pre_selected_filters = {};
            if (router.query.data["stereoselectivity"]) {
              tmp_pre_selected_filters["Stereoselectivity"] =
                router.query.data["stereoselectivity"];
            }
            if (router.query.data["general_reactivity"]) {
              tmp_pre_selected_filters["General Reactivity"] =
                router.query.data["general_reactivity"];
            }
            if (router.query.data["methodology_class"]) {
              tmp_pre_selected_filters["Methodology class"] =
                router.query.data["methodology_class"];
            }
            if (router.query.data["green_chemistry"]) {
              tmp_pre_selected_filters["Green chemistry"] =
                router.query.data["green_chemistry"];
            }
            if (router.query.data["year_of_publication"]) {
              tmp_pre_selected_filters["Year of publication"] =
                router.query.data["year_of_publication"];
            }
            setPreSelectedFilters(tmp_pre_selected_filters);
            setIsLoading(false);
            scrollToTop();
          } catch (error) {
            setMessage("Macromolecules are not supported. ");
            setCorrectiveAction("Go back to normal mode.");
            setShowAlert(true);
            setIsLoading(false);
            scrollToTop();
          }
        } else {
          setIsLoading(false);
          scrollToTop();
        }
      }
    })();
  }, [router.query, props.edit, session.data?.user.id]);

  const addReaction = async (data) => {
    return await fetch("/api/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  const resetToUserInputs = async (ketcher_synthons, ketcher_test_molecule, synthons_raw, test_molecule_raw) => {
    await ketcher_synthons.setMolecule(synthons_raw);
    await ketcher_test_molecule.setMolecule(test_molecule_raw);
  };

  const onClickEventHandler = async (event) => {
    setIsLoading(true);
    event.preventDefault();
    let ketcherFrame = document.getElementById("reaction_sketch");
    let ketcher_reaction = undefined;
    let toggle_hydrogens = undefined;
    let toggle_aromatize = undefined;

    if ("contentDocument" in ketcherFrame)
      ketcher_reaction = ketcherFrame.contentWindow.ketcher;
    // IE7
    else ketcher_reaction = document.frames["ifKetcher"].window.ketcher;

    ketcherFrame = document.getElementById("synthons_sketch");
    let ketcher_synthons = undefined;

    if ("contentDocument" in ketcherFrame) {
      ketcher_synthons = ketcherFrame.contentWindow.ketcher;
      toggle_hydrogens = ketcherFrame.contentWindow.document.querySelector('button[title="Add/Remove explicit hydrogens"]');
      toggle_aromatize = ketcherFrame.contentWindow.document.querySelector('button[title="Aromatize (Alt+A)"]');
    }
    // IE7
    else ketcher_synthons = document.frames["ifKetcher"].window.ketcher;

    ketcherFrame = document.getElementById("test_molecule_sketch");
    let ketcher_test_molecule = undefined;

    if ("contentDocument" in ketcherFrame)
      ketcher_test_molecule = ketcherFrame.contentWindow.ketcher;
    // IE7
    else ketcher_test_molecule = document.frames["ifKetcher"].window.ketcher;


    if (ketcher_reaction && ketcher_synthons && ketcher_test_molecule) {
      if (!toggle_hydrogens) {
        setMessage("Toggle hydrogens button not found! ");
        setCorrectiveAction("Wait few seconds before retrying.");
        setShowAlert(true);
        setIsLoading(false);
        scrollToTop();
        return;
      }
      if (!toggle_aromatize) {
        setMessage("Aromatize button not found! ");
        setCorrectiveAction("Wait few seconds and retry.");
        setShowAlert(true);
        setIsLoading(false);
        scrollToTop();
        return;
      }
      try {
        let synthons_raw = await ketcher_synthons.getSdf();
        if (synthons_raw === "") {
          setMessage("You did not enter synthons! ");
          setCorrectiveAction("Specify all synthons.");
          setShowAlert(true);
          setIsLoading(false);
          scrollToTop();
          return;
        }
        let reaction_raw = await ketcher_reaction.getSmiles();
        if (!reaction_raw.includes(">>")) {
          setMessage("You did not enter a reaction! ");
          setCorrectiveAction("Specify both reactants and products.");
          setShowAlert(true);
          setIsLoading(false);
          scrollToTop();
          return;
        }
        let test_molecule_raw = await ketcher_test_molecule.getSdf();
        if (test_molecule_raw === "") {
          setMessage("You did not enter a test molecule! ");
          setCorrectiveAction("Specify a molecule to test your synthons with.");
          setShowAlert(true);
          setIsLoading(false);
          scrollToTop();
          return;
        }
        let reaction_image = await blobToBase64(
          await ketcher_reaction.generateImage(reaction_raw, {
            outputFormat: "png",
            // backgroundColor: 0,
            // bondThickness: 3
          })
        );
        let reaction_name = document.getElementById("reaction_name").value;
        if (reaction_name === "") {
          setMessage("You did not enter a reaction name! ");
          setCorrectiveAction("Specify name reaction.");
          setShowAlert(true);
          setIsLoading(false);
          scrollToTop();
          return;
        }
        let synthons_sdf = synthons_raw.split("$$$$\n");
        let synthons = [];
        for (let synthon_sdf of synthons_sdf) {
          if (synthon_sdf !== "") {
            await ketcher_synthons.setMolecule(synthon_sdf + "$$$$\n");
            await delay(500);
            aromatizeSynthon(toggle_aromatize);
            await delay(500);
            let synthon_smiles = await toggleExplicitHydrogens(ketcher_synthons, toggle_hydrogens);
            synthon_smiles = removeSlashAndBackSlash(synthon_smiles);
            synthons.push({
              synthon_smiles: synthon_smiles,
              synthon_image: await blobToBase64(
                await ketcher_synthons.generateImage(synthon_smiles, {
                  outputFormat: "png",
                  // backgroundColor: 0,
                  // bondThickness: 3
                })
              )
            });
          }
        }
        let links = [];
        for (let i = 0; i < linkCount; i++) {
          let link = document.getElementById("link_" + i).value;
          if (link !== "") {
            links.push(link);
          }
        }
        if (links.length <= 0) {
          setMessage("You did not enter a link! ");
          setCorrectiveAction("Specify at least one link.");
          setShowAlert(true);
          setIsLoading(false);
          scrollToTop();
          return;
        }
        // Let's grab all filters
        let data = [
          {
            synthons: synthons,
            reaction_smiles: reaction_raw,
            reaction_image: reaction_image,
            links: links,
            name: reaction_name,
            filters: selectedFilters,
          },
        ];
        // No matter in which mode we are, we need to see if the synthons match the test molecule

        // Let's get the test molecules
        let test_molecule_sdf = test_molecule_raw.split("$$$$\n");
        let test_molecule = [];
        for (let synthon_sdf of test_molecule_sdf) {
          if (synthon_sdf !== "") {
            await ketcher_test_molecule.setMolecule(synthon_sdf + "$$$$\n");
            await delay(500);
            let synthon_smiles = await ketcher_test_molecule.getSmiles();
            test_molecule.push(synthon_smiles);
          }
        }

        let test_res = await fetch("/api/reactions/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            synthons: data[0].synthons.map(item => item.synthon_smiles),
            test_synthons: test_molecule,
          }),
        });
        if (!test_res.ok) {
          resetToUserInputs(ketcher_synthons, ketcher_test_molecule, synthons_raw, test_molecule_raw);
          setMessage((await resp.text()) + " ");
          setCorrectiveAction("Go back to the home page");
          setShowAlert(true);
          setIsLoading(false);
          scrollToTop();
          return;
        }
        let test_result = (await test_res.json())["test_result"];
        if (!test_result) {
          resetToUserInputs(ketcher_synthons, ketcher_test_molecule, synthons_raw, test_molecule_raw);
          setMessage("The synthons associated to the reaction does not match the search query ");
          setCorrectiveAction("Check that you entered the right data");
          setShowAlert(true);
          setIsLoading(false);
          scrollToTop();
          return;
        }

        if (props.edit) {
          // Make an API call to compare the two molecules on the server side, if it returns those are the same reaction, then run the patch
          // let res = await fetch("/api/reactions/compare", {
          //   method: "POST",
          //   headers: { "Content-Type": "application/json" },
          //   body: JSON.stringify({
          //     reaction1: router.query.data.reaction_smiles,
          //     reaction2: data[0].reaction_smiles,
          //   }),
          // });
          // if (!res.ok) {
          //   resetToUserInputs(ketcher_synthons, ketcher_test_molecule, synthons_raw, test_molecule_raw);
          //   setMessage((await res.text()) + " ");
          //   setCorrectiveAction("Go back to the home page");
          //   setShowAlert(true);
          //   setIsLoading(false);
          //   scrollToTop();
          //   return;
          // }
          // No matter what, if the user was editing the association and the user pushed the save button, we remove and recreate the associations
          const delete_resp = await fetch("/api/reactions", {
            method: "DELETE",
            headers: {
              reactionId: router.query.data.id,
            },
          });
          if (!delete_resp.ok) {
            resetToUserInputs(ketcher_synthons, ketcher_test_molecule, synthons_raw, test_molecule_raw);
            setMessage((await delete_resp.text()) + " ");
            setCorrectiveAction("Go back to the home page");
            setShowAlert(true);
            setIsLoading(false);
            scrollToTop();
            return;
          }
          const patch_resp = await fetch("/api/reactions", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: router.query.data.id,
              links: data[0].links,
              name: data[0].name,
              filters: selectedFilters,
            }),
          });
          if (!patch_resp.ok) {
            resetToUserInputs(ketcher_synthons, ketcher_test_molecule, synthons_raw, test_molecule_raw);
            setMessage((await patch_resp.text()) + " ");
            setCorrectiveAction("Go back to the home page");
            setShowAlert(true);
            setIsLoading(false);
            scrollToTop();
            return;
          }

          const addReaction_res = await addReaction(data);
          if (!addReaction_res.ok) {
            resetToUserInputs(ketcher_synthons, ketcher_test_molecule, synthons_raw, test_molecule_raw);
            let error_text = await addReaction_res.text();
            setMessage(error_text + " ");
            setCorrectiveAction("Go back to the home page");
            setShowAlert(true);
            setIsLoading(false);
            scrollToTop();
            return;
          }
          router.push("/");
          return
        }
        const res = await addReaction(data);
        if (res.ok) {
          router.push("/");
        } else {
          resetToUserInputs(ketcher_synthons, ketcher_test_molecule, synthons_raw, test_molecule_raw);
          let error_text = await res.text();
          setMessage(error_text + " ");
          setCorrectiveAction("Go back to the home page");
          setShowAlert(true);
          setIsLoading(false);
          scrollToTop();
          return;
        }
      } catch (error) {
        setMessage("Macromolecules are not supported. ");
        setCorrectiveAction("Go back to normal mode.");
        setShowAlert(true);
        setIsLoading(false);
        scrollToTop();
        return;
      }
    } else {
      setMessage("Ketcher did not load ");
      setCorrectiveAction("Wait few seconds and retry.");
      setShowAlert(true);
      setIsLoading(false);
      scrollToTop();
    }
  };

  return (
    <div className="flex flex-col flex-wrap flex-auto items-center py-4">
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
      <label
        className="block uppercase tracking-wide text-black dark:text-white text-xs font-bold mb-2"
        htmlFor="reaction_name"
      >
        Reaction name
      </label>
      <input id="reaction_name" type="text" className="border border-gray-900 dark:border-gray-300" />
      <div className="flex flex-wrap -mx-3 mb-2">
        <div className="flex flex-col flex-wrap flex-auto items-center px-4 py-4">
          <label
            className="block uppercase tracking-wide text-black dark:text-white text-xs font-bold mb-2"
            htmlFor="reaction_sketch"
          >
            Reaction
          </label>
          <iframe
            id="reaction_sketch"
            src="../../../index.html"
            style={{
              overflow: "hidden",
              minWidth: 700,
              minHeight: 700,
              border: "1px solid darkgray",
            }}
          />
        </div>
        <div className="flex flex-col flex-wrap flex-auto items-center px-4 py-4">
          <label
            className="block uppercase tracking-wide text-black dark:text-white text-xs font-bold mb-2"
            htmlFor="synthons_sketch"
          >
            Synthons
          </label>
          <iframe
            id="synthons_sketch"
            src="../../../index.html"
            style={{
              overflow: "hidden",
              minWidth: 700,
              minHeight: 700,
              border: "1px solid darkgray",
            }}
          />
        </div>
      </div>
      <div className="flex flex-wrap -mx-3 mb-2 items-center">
        <p className="block uppercase tracking-wide text-black dark:text-white text-xs font-bold">
          Links
        </p>
        <div className="px-1" />
        <Button
          color={"blue"}
          onClick={(event) => {
            event.preventDefault();
            setLinkCount((prev) => prev + 1);
          }}
        >
          +
        </Button>
      </div>
      {linkCount > 0 ? (
        [...Array(linkCount).keys()].map((id) => (
          <input
            key={"link_" + id}
            id={"link_" + id}
            type="text"
            className="border border-gray-900 dark:border-gray-300"
          />
        ))
      ) : (
        <></>
      )}
      <ReactionFilters
        setSelectedFilters={setSelectedFilters}
        preSelectedFilters={preSelectedFilters}
        showSearchBar={false}
      />
      <div className="flex flex-col flex-wrap flex-auto items-center px-4 py-4">
        <label
          className="block uppercase tracking-wide text-black dark:text-white text-xs font-bold mb-2"
          htmlFor="test_molecule_sketch"
        >
          Search query example
        </label>
        <iframe
          id="test_molecule_sketch"
          src="../../../index.html"
          style={{
            overflow: "hidden",
            minWidth: 700,
            minHeight: 700,
            border: "1px solid darkgray",
          }}
        />
      </div>
      <Button color={"blue"} onClick={onClickEventHandler}>
        {props.edit ? "Edit" : "Add!"}
      </Button>
    </div>
  );
}

function Disclaimer({ onClose }) {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="max-w-3xl w-full h-[80vh] bg-white shadow-lg rounded-lg border border-gray-200 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Disclaimer for Synthonpedia Usage</h1>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Introduction</h2>
          <p className="text-gray-600 mt-2">
            Synthonpedia is a free-access, community-driven web platform designed to assist chemists in retrosynthetic analysis by providing a database of synthons and their associated reactions. This tool is intended to complement, not replace, human expertise in synthetic planning.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700">1. Intended Use</h2>
          <p className="text-gray-600 mt-2">
            Synthonpedia is developed as an informational tool for chemists, both in academia and industry, to facilitate synthesis planning. The database provides reaction examples and methodologies but does not generate complete synthetic routes, predict reaction outcomes, or suggest optimal reaction conditions.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700">2. Accuracy and Limitations</h2>
          <ul className="list-disc list-inside text-gray-600 mt-2">
            <li>The reactions stored in Synthonpedia are contributed by users and may not always reflect the most recent scientific developments.</li>
            <li>The database may contain biases due to the nature of published literature.</li>
            <li>No guarantee is provided regarding the accuracy, completeness, or applicability of the information for specific use cases.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700">3. User Responsibilities</h2>
          <ul className="list-disc list-inside text-gray-600 mt-2">
            <li>Users must critically assess the reactions retrieved and verify their applicability.</li>
            <li>Contributions should adhere to established encoding rules and not violate intellectual property rights.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700">4. Community Contributions</h2>
          <p className="text-gray-600 mt-2">
            Synthonpedia relies on user contributions. Users agree to share their knowledge with accuracy and clarity.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700">5. Liability Disclaimer</h2>
          <p className="text-gray-600 mt-2">
            The developers do not assume liability for any direct or indirect consequences resulting from the use of the platform. Proper laboratory safety protocols must always be followed.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700">6. Ethical and Legal Compliance</h2>
          <p className="text-gray-600 mt-2">
            Users must comply with all applicable laws and regulations. Any unethical or illegal use is strictly prohibited.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700">7. Updates and Modifications</h2>
          <p className="text-gray-600 mt-2">
            This disclaimer may be updated periodically. Users should review the latest version regularly.
          </p>
        </section>

        <p className="text-gray-700 font-medium mt-4">
          By using Synthonpedia, you acknowledge and agree to abide by these terms and conditions.
        </p>
        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            id="agree"
            checked={isChecked}
            onChange={() => setIsChecked(!isChecked)}
            className="mr-2"
          />
          <label htmlFor="agree" className="text-gray-700">I understand</label>
        </div>
        <div className="flex flex-col items-center mt-4">
          <Button onClick={onClose} disabled={!isChecked}>Close</Button>
        </div>
      </div>
    </div>
  );
};

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-700">Processing...</p>
      </div>
    </div>
  );
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const ConfirmationModal = ({ setIsOpen, handleDelete, modalText, cancelButtonText, confirmButtonText }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <p className="mb-4 text-lg text-black">{modalText}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-gray-400 text-white rounded-sm"
          >
            {cancelButtonText ? cancelButtonText : "Cancel"}
          </button>
          <button
            onClick={(event) => { handleDelete(event); }}
            className="px-4 py-2 bg-red-500 text-white rounded-sm"
          >
            {confirmButtonText ? confirmButtonText : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const SearchBar = ({ onSearch }) => {
  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <div className="flex items-center border border-gray-900 dark:border-gray-300 rounded-lg overflow-hidden">
        <input
          id="search-input"
          type="text"
          placeholder="Search..."
          className="w-full px-4 py-2 outline-hidden text-black dark:text-white"
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 hover:bg-blue-600 transition"
          onClick={onSearch}
        >
          Search
        </button>
      </div>
    </div>
  );
};

async function getBase64ImageFromSmiles(indigo, smiles) {
  return await indigo.generateImageAsBase64(smiles, { outputFormat: "png", backgroundColor: "255, 255, 255" })
}

const ShowUserSynthonsModal = ({ setCurrentlyShownQuery, query_images }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        {
          query_images.map((query_image, index) => (
            <Image
              key={`user_synthon_${index}`}
              className="rounded-t-lg w-full h-full"
              src={"data:image/png;base64," + query_image}
              width={500}
              height={500}
              alt="Picture of the author"
              style={{ backgroundColor: "white" }}
            />
          ))
        }
        <div className="flex justify-end space-x-4">
          <button
            onClick={(event) => {
              event.preventDefault();
              setCurrentlyShownQuery(undefined);
            }}
            className="px-4 py-2 bg-gray-400 text-white rounded-sm"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-200 text-black dark:bg-gray-900 dark:text-white py-6 mt-8">
      <div className="container mx-auto flex flex-col space-y-4 px-6">

        {/* Your Section */}
        <div className="flex flex-col md:flex-row justify-between items-center w-full">
          <p className="text-lg font-semibold">Developed by Simone Zanella</p>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <a
              href="https://www.linkedin.com/in/simone-zanella-5a7713225"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/Simone99"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-400 transition"
            >
              GitHub
            </a>
          </div>
        </div>

        {/* Ale's Section */}
        <div className="flex flex-col md:flex-row justify-between items-center w-full">
          <p className="text-lg font-semibold">Idea of Alessandro Brusa</p>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <a
              href="https://www.linkedin.com/in/alessandro-brusa-a14854254/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition"
            >
              LinkedIn
            </a>
            <a
              href="https://x.com/Organic_brusa?t=q1k7jGjznBvPmjTueUsW8g&s=35"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-400 transition"
            >
              X
            </a>
          </div>
        </div>

        {/* EPAM Section */}
        <div className="flex flex-col md:flex-row justify-between items-center w-full">
          <p className="text-lg font-semibold">Powered by Indigo</p>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <a
              href="https://www.epam.com/services/engineering/open-source"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition"
            >
              EPAM
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const toggleExplicitHydrogens = async (ketcher, toggle_hydrogens) => {
  toggle_hydrogens.click();
  await delay(500);
  toggle_hydrogens.click();
  await delay(500);
  let synthon_smiles = await ketcher.getSmiles();
  if (synthon_smiles.includes("[H]")) {
    return synthon_smiles;
  } else {
    toggle_hydrogens.click();
    await delay(500);
    return await ketcher.getSmiles();
  }
};

const aromatizeSynthon = (toggle_aromatize) => {
  toggle_aromatize.click();
};

export {
  Button,
  NavBar,
  Alert,
  ReactionPage,
  ReactionAddEditPage,
  ReactionFilters,
  delay,
  removeSlashAndBackSlash,
  Disclaimer,
  LoadingScreen,
  scrollToTop,
  ConfirmationModal,
  blobToBase64,
  N_REACTIONS_PER_PAGE,
  SearchBar,
  PrevNextButtons,
  getBase64ImageFromSmiles,
  ShowUserSynthonsModal,
  Footer,
  toggleExplicitHydrogens,
  aromatizeSynthon
};

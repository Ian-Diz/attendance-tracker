import { getCurrentTab, regexTest } from "../utils/utils";
import React from "react";

const App = () => {
  const [activeTabURL, setActiveTabURL] = React.useState("");

  getCurrentTab().then((data) => {
    setActiveTabURL(data.url ? data.url : "");
  });

  const onClick = async () => {
    let [tab] = await chrome.tabs.query({ active: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        let activeTab = window.location.toString();

        if (document.getElementById("ATPopupBody")) {
          document.getElementById("ATPopupBody").remove();
        }

        fetch(chrome.runtime.getURL("/popup.html"))
          .then((r) => r.text())
          /*Inserts list popup into page*/ .then((html) => {
            document.body.insertAdjacentHTML("beforeend", html);
          })
          /*Handles functionality to let the popup be draggable*/ .then(() => {
            const dragElement = (elmnt) => {
              var pos1 = 0,
                pos2 = 0,
                pos3 = 0,
                pos4 = 0;

              const elementDrag = (e) => {
                e = e || window.Event;
                e.preventDefault();
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                elmnt.style.top = elmnt.offsetTop - pos2 + "px";
                elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
              };

              const closeDragElement = () => {
                document.onmouseup = null;
                document.onmousemove = null;
              };

              const dragMouseDown = (e) => {
                e = e || window.Event;
                e.preventDefault();
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                document.onmousemove = elementDrag;
              };

              document.getElementById("ATPopupBodyDrag").onmousedown =
                dragMouseDown;
            };

            dragElement(document.getElementById("ATPopupBody"));
          })
          /*The rest of funcionality, more comments further down*/ .then(
            async () => {
              console.log("---------------- NEW BUILD ----------------");

              //Finds out if the tab has any name data, if so returns data, else returns empty obj
              const fetchStoredNames = async () => {
                let chromeStored = await chrome.storage.sync.get([activeTab]);

                return Object.keys(chromeStored).length !== 0
                  ? JSON.parse(Object.values(chromeStored)[0])
                  : {};
              };

              let nameElems = document.getElementsByClassName("dwSJ2e");
              let namesText = [];
              let storageObj = {};
              let initialList = await fetchStoredNames();
              let comparableArr = [];
              let notPresent = {};

              //Runs three for in loops, fills namesText Arr, storageObj Obj and comparableArr Arr
              const prepareData = () => {
                for (let name in initialList) {
                  comparableArr.push(name);
                }

                for (let name of nameElems) {
                  namesText.push(name.textContent);
                }

                for (let name in initialList) {
                  if (namesText.includes(name)) {
                    continue;
                  } else {
                    notPresent[`${name}`] = initialList[`${name}`];
                    delete initialList[`${name}`];
                  }
                }

                for (let name of namesText) {
                  if (comparableArr.includes(name)) {
                    continue;
                  } else {
                    storageObj[`${name}`] = false;
                  }
                }

                storageObj = {
                  ...storageObj,
                  ...initialList,
                };
              };

              prepareData();

              const popupElemSel = document.getElementById("ATPopupBody");

              //Removes the popup from the web page
              const closePopup = () => {
                document.getElementById("ATPopupBody").remove();
              };

              //Finds the closeButton, sets it's img src, sets addEventListener to trigger closePopup();
              const prepareCloseButton = () => {
                const closeButton = popupElemSel.querySelector(".popup__close");

                closeButton.src = chrome.runtime.getURL("close-icon.png");

                closeButton.addEventListener("click", () => {
                  closePopup();
                });
              };

              prepareCloseButton();

              /*Find the delete button, sets addEventListener which sets all storage vars to empty, 
                sets chrome.storage.sync to empty, then triggers closePopup()*/
              const prepareDeleteButton = () => {
                const deleteButton =
                  popupElemSel.querySelector(".popup__delete");

                deleteButton.addEventListener("click", () => {
                  storageObj = {};
                  notPresent = {};
                  chrome.storage.sync.set({
                    [activeTab]: JSON.stringify({}),
                  });
                  closePopup();
                });
              };

              prepareDeleteButton();

              //Series of addEventListeners that make the snap to corner buttons work
              const setPosButtonEvents = () => {
                const posBut1 = document.getElementById("AttTraPos1");
                const posBut2 = document.getElementById("AttTraPos2");
                const posBut3 = document.getElementById("AttTraPos3");
                const posBut4 = document.getElementById("AttTraPos4");

                posBut1.addEventListener("click", () => {
                  popupElemSel.style.left = "0";
                  popupElemSel.style.top = "0";
                  popupElemSel.style.right = "";
                  popupElemSel.style.bottom = "";
                });

                posBut2.addEventListener("click", () => {
                  popupElemSel.style.right = "0";
                  popupElemSel.style.top = "0";
                  popupElemSel.style.left = "";
                  popupElemSel.style.bottom = "";
                });

                posBut3.addEventListener("click", () => {
                  popupElemSel.style.left = "0";
                  popupElemSel.style.bottom = "80px";
                  popupElemSel.style.right = "";
                  popupElemSel.style.top = "";
                });

                posBut4.addEventListener("click", () => {
                  popupElemSel.style.right = "0";
                  popupElemSel.style.bottom = "80px";
                  popupElemSel.style.left = "";
                  popupElemSel.style.top = "";
                });
              };

              setPosButtonEvents();

              //Class for the list of names that handles the rendering of the list of NamePlates
              class NameList {
                constructor(renderer, container) {
                  this._renderer = renderer;
                  this._container = container;
                }

                /*Takes an obj in the format {...NameOfAttendee: boolean, NameOfAttendee: boolean...}
                  and iterates through it rendering a NamePlate for each key in obj*/
                renderItems(data) {
                  for (let name in data) {
                    this._container.append(
                      this._renderer(name, data[`${name}`])
                    );
                  }
                }
              }

              //Class for handling renderings for individual NamePlate elems
              class NamePlate {
                constructor(templateSelector, data, { handleThumbsButton }) {
                  this._templateSelector = templateSelector;
                  this._name = data.name;
                  this.isClicked = data.isClicked;
                  this._handleThumbsButton = handleThumbsButton;
                }

                //Gets the template from popup.html
                _getTemplate() {
                  const cardElem = document
                    .querySelector(this._templateSelector)
                    .content.querySelector(".card")
                    .cloneNode(true);
                  return cardElem;
                }

                //Handles generating an individual card, assigns _cardName/Image and sets _cardImage.src
                generateCard() {
                  this._elem = this._getTemplate();
                  this._setEventHandlers();

                  this._cardName = this._elem.querySelector(".card__name");
                  this._cardName.textContent = this._name;

                  this._cardImage = this._elem.querySelector(".card__image");

                  if (this.isClicked) {
                    this._cardImage.src = chrome.runtime.getURL(
                      "thumbs-up-solid.png"
                    );
                  } else {
                    this._cardImage.src = chrome.runtime.getURL(
                      "thumbs-up-regular.png"
                    );
                  }

                  return this._elem;
                }

                //Handles when user clicks on unfilled thumbsButton
                addThumbs() {
                  this._cardImage.src = chrome.runtime.getURL(
                    "thumbs-up-solid.png"
                  );
                  this.isClicked = true;
                  storageObj[`${this._name}`] = true;
                }

                //Handles when user clicks on filled thumbsButton
                removeThumbs() {
                  this._cardImage.src = chrome.runtime.getURL(
                    "thumbs-up-regular.png"
                  );
                  this.isClicked = false;
                  storageObj[`${this._name}`] = false;
                }

                //Sets eventHandlers for thumbsButton
                _setEventHandlers() {
                  this._elem
                    .querySelector(".card__thumbs")
                    .addEventListener("click", () => {
                      this._handleThumbsButton(this);
                    });
                }
              }

              const nameSection = new NameList(
                //Renderer func required for NameList class
                (name, isClicked) => {
                  const namePlate = new NamePlate(
                    "#nameCard",
                    { name, isClicked },
                    {
                      //handleThumbsButton func required for NamePlate class
                      handleThumbsButton: async (card) => {
                        if (card.isClicked) {
                          card.removeThumbs();
                          storageObj = {
                            ...storageObj,
                            ...notPresent,
                          };
                          chrome.storage.sync.set({
                            [activeTab]: JSON.stringify(storageObj),
                          });
                        } else {
                          card.addThumbs();
                          storageObj = {
                            ...storageObj,
                            ...notPresent,
                          };
                          chrome.storage.sync.set({
                            [activeTab]: JSON.stringify(storageObj),
                          });
                        }
                      },
                    }
                  );

                  const namePlateElem = namePlate.generateCard();
                  return namePlateElem;
                },
                document.getElementById("ATPopupList")
              );

              /*Takes an obj in the format {...NameOfAttendee: boolean, NameOfAttendee: boolean...}
                and iterates through it rendering a NamePlate for each key in obj*/
              nameSection.renderItems(storageObj);
            }
          );
      },
    });
  };

  //React component to render the popup that shows when clicking on the extension icon
  return (
    <>
      {regexTest(activeTabURL) ? (
        <div className="extension">
          <h1 className="extension__title">Attendance Tracker</h1>
          <div className="extension__card">
            <button className="extension__button" onClick={onClick}>
              Open attendance list
            </button>
          </div>
        </div>
      ) : (
        <div className="extension">
          <h1 className="extension__title">Attendance Tracker</h1>
          <div className="extension__card">
            <p>Enter a Google Meet to use the extension</p>
          </div>
        </div>
      )}
    </>
  );
};

export default App;

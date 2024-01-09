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

        if (document.getElementById("CMTPopupBody")) {
          document.getElementById("CMTPopupBody").remove();
        }

        fetch(chrome.runtime.getURL("/popup.html"))
          .then((r) => r.text())
          /*inserts list popup into page*/ .then((html) => {
            document.body.insertAdjacentHTML("beforeend", html);
          })
          /*handles the dragElement*/ .then(() => {
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

              document.getElementById("CMTPopupBodyDrag").onmousedown =
                dragMouseDown;
            };

            dragElement(document.getElementById("CMTPopupBody"));
          })
          /*adds the names to list popup then adds names to storage*/ .then(
            async () => {
              console.log("---------------- NEW BUILD ----------------");

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

              for (let name in initialList) {
                comparableArr.push(name);
              }

              for (let name of nameElems) {
                namesText.push(name.textContent);
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

              console.log(initialList);
              console.log("^initialList ----------");
              console.log(storageObj);
              console.log("^storageObj ----------");

              const popupElemSel = document.getElementById("CMTPopupBody");
              const closeButton = popupElemSel.querySelector(".popup__close");

              closeButton.src = chrome.runtime.getURL("close-icon.png");

              closeButton.addEventListener("click", () => {
                document.getElementById("CMTPopupBody").remove();
              });

              const setPosEvents = () => {
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

              setPosEvents();

              class Popup {
                constructor(renderer, container) {
                  this._renderer = renderer;
                  this._container = container;
                }

                renderItems(data) {
                  for (let name in data) {
                    this._container.append(
                      this._renderer(name, data[`${name}`])
                    );
                  }
                }
              }

              class NamePlate {
                constructor(templateSelector, data, { handleThumbsButton }) {
                  this._templateSelector = templateSelector;
                  this._name = data.name;
                  this.isClicked = data.isClicked;
                  this._handleThumbsButton = handleThumbsButton;
                }

                _getTemplate() {
                  const cardElem = document
                    .querySelector(this._templateSelector)
                    .content.querySelector(".card")
                    .cloneNode(true);
                  return cardElem;
                }

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

                addThumbs() {
                  this._cardImage.src = chrome.runtime.getURL(
                    "thumbs-up-solid.png"
                  );
                  this.isClicked = true;
                  storageObj[`${this._name}`] = true;
                }

                removeThumbs() {
                  this._cardImage.src = chrome.runtime.getURL(
                    "thumbs-up-regular.png"
                  );
                  this.isClicked = false;
                  storageObj[`${this._name}`] = false;
                }

                _setEventHandlers() {
                  this._elem
                    .querySelector(".card__thumbs")
                    .addEventListener("click", () => {
                      this._handleThumbsButton(this);
                    });
                }
              }

              const nameSection = new Popup((name, isClicked) => {
                const namePlate = new NamePlate(
                  "#nameCard",
                  { name, isClicked },
                  {
                    handleThumbsButton: async (card) => {
                      if (card.isClicked) {
                        card.removeThumbs();
                        chrome.storage.sync.set({
                          [activeTab]: JSON.stringify(storageObj),
                        });
                      } else {
                        card.addThumbs();
                        chrome.storage.sync.set({
                          [activeTab]: JSON.stringify(storageObj),
                        });
                      }
                    },
                  }
                );

                const namePlateElem = namePlate.generateCard();
                return namePlateElem;
              }, popupElemSel);

              nameSection.renderItems(storageObj);
            }
          );
      },
    });
  };

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

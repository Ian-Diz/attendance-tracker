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
      target: { tabId: tab.id! },
      func: () => {
        console.log("This is the .tsx app");

        class Popup {
          private _renderer: Function;
          private _container?: HTMLElement;

          constructor(renderer: Function, container: HTMLElement) {
            this._renderer = renderer;
            this._container = container;
          }

          renderItems(names: HTMLCollectionOf<Element>) {
            for (let name of names) {
              console.log(name);
              this._container?.append(this._renderer(name.textContent));
            }
          }
        }

        class NamePlate {
          private _handleThumbsClick: Function;
          private _templateSelector: string;
          private _Elem: any;
          private _cardTitle: any;
          private _data: any;

          constructor(
            handleThumbsClick: Function,
            templateSelector: string,
            data: any
          ) {
            this._handleThumbsClick = handleThumbsClick;
            this._templateSelector = templateSelector;
            this._data = data;
          }

          generateCard() {
            this._Elem = this._getTemplate();
            this._setEventHandlers();

            this._cardTitle = this._Elem.querySelector(".card__title");

            console.log("this is from the NamePlate class");
            console.log(this._data);
            console.log("------------------");

            this._cardTitle.textContent = "Testings";

            return this._Elem;
          }

          _getTemplate() {
            const cardElem = document
              .querySelector(`${this._templateSelector} .card`)
              ?.cloneNode(true);
            return cardElem;
          }

          _setEventHandlers() {
            this._Elem
              .querySelector(".card__thumbs")
              .addEventListener("click", () => {
                this._handleThumbsClick();
              });
          }
        }

        let iFrame = document.createElement("iframe");
        iFrame.src = chrome.runtime.getURL("popup.html");
        iFrame.id = "CMTFrame";
        iFrame.style.position = "absolute";
        iFrame.style.zIndex = "10";

        let names = document.getElementsByClassName("dwSJ2e");

        for (let name of names) {
          console.log(name);
        }

        const nameSection = new Popup((name: Element) => {
          const namePlate = new NamePlate(
            () => {
              console.log(
                "I will deal with this later please stop giving me an error"
              );
            },
            "#card",
            name
          );

          const namePlateElem = namePlate.generateCard();
          return namePlateElem;
        }, document.getElementById("CMSPopupBody")!);

        nameSection.renderItems(names);

        document.body.insertAdjacentElement("beforeend", iFrame);
      },
    });
  };

  /*const onClick = async () => {
    let [tab] = await chrome.tabs.query({ active: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: () => {
        //const namePlates = document.getElementsByClassName("ZY8hPc gtgjre");

        const popup_entry_point = document.createElement("div");
        popup_entry_point.id = "reactPopup";

        //console.log(Popup);

        ReactDOM.createRoot(document.getElementById("reactPopup")!).render(
          <React.StrictMode>
            <Popup />
          </React.StrictMode>
        );
        //root.render(<Popup />);

        /*let reactJS_script = document.createElement("script");
        reactJS_script.src = "main.tsx";

        popup_entry_point.appendChild(reactJS_script);
        document.body.appendChild(popup_entry_point);*/

  //render(<Popup />, document.getElementById("reactPopup"));

  /*for (let i = 0; i < namePlates.length; ++i) {
          const thumbsBtn = document.createElement("img");
          thumbsBtn.src = chrome.runtime.getURL("thumbs-up-regular.png");
          thumbsBtn.style.width = "30px";
          thumbsBtn.style.height = "30px";

          namePlates[i].appendChild(thumbsBtn);

          thumbsBtn.addEventListener("click", () => {
            if (thumbsBtn.src.includes("thumbs-up-regular.png")) {
              thumbsBtn.src = chrome.runtime.getURL("thumbs-up-solid.png");
            } else {
              thumbsBtn.src = chrome.runtime.getURL("thumbs-up-regular.png");
            }
          });
        }
      },
    });
  };*/

  return (
    <>
      {regexTest(activeTabURL) ? (
        <div className="extension">
          <h1 className="extension__title">Cooperative Meet Tracker</h1>
          <div className="extension__card">
            <button className="extension__button" onClick={onClick}>
              Open List of Names
            </button>
          </div>
        </div>
      ) : (
        <div className="extension">
          <h1 className="extension__title">Cooperative Meet Tracker</h1>
          <div className="extension__card">
            <p>Enter a Google Meet to use the extension</p>
          </div>
        </div>
      )}
    </>
  );
};

export default App;

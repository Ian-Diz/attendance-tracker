import { getCurrentTab, regexTest } from "../utils/utils";
import React from "react";
import Popup from "./Popup";
import { createRoot } from "react-dom/client";

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
        //const namePlates = document.getElementsByClassName("ZY8hPc gtgjre");

        const popup_entry_point = document.createElement("div");
        popup_entry_point.id = "reactPopup";

        console.log(Popup());

        const root = createRoot(document.body);
        root.render(<Popup />);

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
        }*/
      },
    });
  };

  return (
    <>
      {regexTest(activeTabURL) ? (
        <div className="extension">
          <h1 className="extension__title">Cooperative Meet Tracker</h1>
          <div className="extension__card">
            <button className="extension__button" onClick={onClick}>
              Enable Buttons
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

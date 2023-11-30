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
        const namePlates = document.getElementsByClassName("ZY8hPc gtgjre");

        for (let i = 0; i < namePlates.length; ++i) {
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

        /*const handleThumbsButton = (node: Element) => {
          const thumbsBtn = document.createElement("img");
          thumbsBtn.src = chrome.runtime.getURL("thumbs-up-regular.png");
          thumbsBtn.style.width = "30px";
          thumbsBtn.style.height = "30px";
          thumbsBtn.classList.add("buh");

          thumbsBtn.addEventListener("click", () => {
            if (thumbsBtn.src.includes("thumbs-up-regular.png")) {
              thumbsBtn.src = chrome.runtime.getURL("thumbs-up-solid.png");
            } else {
              thumbsBtn.src = chrome.runtime.getURL("thumbs-up-regular.png");
            }
          });

          node.appendChild(thumbsBtn);
        };

        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (
              mutation.type === "childList" &&
              mutation.addedNodes.length > 0
            ) {
              mutation.addedNodes.forEach((node) => {
                if (
                  node instanceof HTMLElement &&
                  node.classList.contains("ZY8hPc gtgjre")
                ) {
                  handleThumbsButton(node);
                }
              });
            }
          });
        });

        observer.observe(document.body, { subtree: true, childList: true });

        Array.from(namePlates).forEach((node) => {
          if (node instanceof HTMLElement) {
            handleThumbsButton(node);
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

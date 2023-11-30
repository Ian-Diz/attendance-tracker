export const getCurrentTab = async () => {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
};

const regex = /https:\/\/meet\.google\.com\/([A-Za-z0-9]+(-[A-Za-z0-9]+)+)/;

export const regexTest = (input: string) => {
  return regex.test(input);
};

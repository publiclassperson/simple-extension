import Vue from 'vue'
import PopUp from './components/popup'
import {GetDomain} from "../js/utils";

chrome.tabs.query({currentWindow: true, active: true}, _tabs => {
  const tab = _tabs[0], domain = GetDomain(tab.url);
  if (!domain) {
    chrome.browserAction.disable(tab.id);
    window.close();
    return;
  }

  const {tabs, setting} = window.bg = chrome.extension.getBackgroundPage();

  if (!setting.hasDomain(domain))
    setting.initDomain(domain);

  const app = new Vue({
    el: '#app',
    data: {
      domain,
      tab: {id: tab.id, url: tab.url},
      data: setting.data[domain],
      urls: tabs.data[tab.id].urls,
    },
    components: {PopUp}
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (tabId === tab.id) {
      // console.log('Tab状态变了 1', changeInfo.url);
      const domain = GetDomain(changeInfo.url);
      if (domain) {
        // console.log('Tab状态变了 2', domain);
        if (domain !== tabs.data[tab.id].domain)
          tabs.data[tab.id].urls.length = 0;
        if (!setting.hasDomain(domain))
          setting.initDomain(domain);
        app.domain = domain;
        app.data = setting.data[domain];
        Vue.set(app.tab, 'id', tab.id);
        Vue.set(app.tab, 'url', changeInfo.url);
      }
    }
  });
});
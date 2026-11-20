function send(tabId, t){ if (tabId) chrome.tabs.sendMessage(tabId, { t: t }).catch(function(){}); }
chrome.action.onClicked.addListener(function(tab){ send(tab.id, 'toggle'); });
chrome.commands.onCommand.addListener(function(cmd, tab){
  if (!tab) return;
  send(tab.id, cmd === 'coach-question' ? 'coach' : 'toggle');
});

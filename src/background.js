/** @type {chrome} */
const api = (!!chrome) ? chrome : browser;

/**
 * @param {number} ms 
 * @returns 
 */
const delay = async (ms) => new Promise((res) => {setTimeout(res, ms)});

const changeBadge = async (id, text, color="#FFF") => {
    api.action.setBadgeText({text: text, tabId: id});
    api.action.setBadgeBackgroundColor({color: color, tabId: id})
}

/**
 * @param {chrome.tabs.Tab} tab 
 */
const run = async (tab) => {
    const search = new URL(tab.url);
    search.search = "";
    const url = new URL("http://archive.org/wayback/available")
    url.search = new URLSearchParams({
        url: encodeURI(search)
    })
    /**
     * @type {ArchiveResponse}
     */
    let json;
    try {
        json = await fetch(url).then(response => response.json());
    }
    catch(e) {
        console.error(e);
        changeBadge(tab.id, "error", "red")
        /**
         * @todo retry or let user know
         */
        return;
    }

    if (json?.code) {
        console.debug(`IA err: ${json?.message}`)
        changeBadge(tab.id, "error", "red")
        /**
         * @todo Try again
         */
    }
    else {
        let ptr = json;
        for (const k of ["archived_snapshots", "closest"]) {
            if(ptr.hasOwnProperty(k)) {
                ptr = ptr[k]
            }
            else if (k == "archived_snapshots") {
                console.error(`Unexpected shape: ${json}`);
                changeBadge("error", "red")
                /**
                 * @todo tell user
                 * I think I can create a popup here??
                 */
                return
            }
            else {
                console.debug(`No snapshots ${search}, json: ${json}`)
                changeBadge("no snapshots", "yellow")
                /**
                 * @todo tell user
                 */
                return;
            }
        }

        api.tabs.update(tab.id, {
            url: ptr.url.replace(/^https?/, "https"),
        })
    }
}

api.action.onClicked.addListener(run);
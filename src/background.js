/** @type {chrome} */
const api = (!!chrome) ? chrome : browser;

/**
 * @param {number} ms 
 * @returns 
 */
const delay = async (ms) => new Promise((res) => {setTimeout(res, ms)});

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
    let json = await fetch(url).then(response => response.json()).catch(e => {
        console.error(e);
    });
    if (json == undefined) {
        /**
         * @todo retry or let user know
         */
        return;
    }
    if (json?.code) {
        console.debug(`IA err: ${json?.message}`)
        /**
         * @todo Try again
         */
    }
    else {
        if (json.archived_snapshots?.closest !== undefined) {
            console.error(`${search} is not archived yet`);
            /**
             * @todo tell the user
             * I think I can create a popup here??
             */
            return;
        }
        else {
            const redirect = json.archived_snapshots.closest.url;
            api.tabs.update(tab.id, {
                url: redirect,
                loadReplace: true
            })
            return;
        }
    }
}

api.action.onClicked.addListener(run);
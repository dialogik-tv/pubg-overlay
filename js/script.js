(async () => {
    // Parse URL param
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let key = "";
    const region = "pc-eu";
    const player = {};

    // Parse PUBG username
    if(urlParams.has("username")) {
        player.username = urlParams.get("username");
        
        // Parse PUBG API key
        if(urlParams.has("key")) {
            key = urlParams.get("key");
            window.history.replaceState({}, "", window.location);

            // Initialize PUBG client
            const client = new pubg.Client(key, region);

            // Get Player ID
            const playerFetcher = await client.getPlayer({name: player.username});
            player.id = playerFetcher.id;

            // First, get current season name
            const seasonsFetcher = await client.getSeasons();
            const lastIndex = seasonsFetcher.length-1;
            season = seasonsFetcher[lastIndex].id;

            // Fetch current season data
            let singleSeasonFetcher = await client.getPlayerSeason(player.id, season);
            setInterval(async function() {
                singleSeasonFetcher = await client.getPlayerSeason(player.id, season);
            }, 60 * 1000); // 60s/1min

            // Short reference
            const squadFPP = singleSeasonFetcher.attributes.gameModeStats.squadFPP;

            // Pass content to handler
            const displayData = {
                "Kills": squadFPP.kills,
                "Headshots": squadFPP.headshotKills,
                "🐔": squadFPP.wins,
                "🔝🔟": squadFPP.top10s,
                "Longest kill" : parseInteger(squadFPP.longestKill) + "m",
                "💊": squadFPP.boosts,
                "Assists": squadFPP.assists,
                "Damage dealt": parseInteger(squadFPP.damageDealt),
                "Daily kills": squadFPP.dailyKills,
                "💉": squadFPP.revives,
                "☠️🚗": squadFPP.roadKills,
                "Most round kills": squadFPP.roundMostKills,
                "Suicides": squadFPP.suicides,
                "🚗💥": squadFPP.vehicleDestroys,
                "Weapons acquired": squadFPP.weaponsAcquired,
                "🚗 km": parseInteger(squadFPP.rideDistance),
                "👣 km": parseInteger(squadFPP.walkDistance)
            };
            setBoxContent(displayData);
        } else {
            alert("PUBG API-Key must be given!");
        }
    } else {
        alert("PUBG Username must be given!");
    }
})();

function setBoxContent(content) {
    let keys = Object.keys(content);
    let values = Object.values(content);

    let i = 0;
    i = setRowContent(keys[i], values[i], values.length, i);
    setInterval(function() {
        i = setRowContent(keys[i], values[i], values.length, i);
    }, 10 * 1000); // 10 seconds
}

function setRowContent(key, value, length, index) {
    const box = document.querySelector("#box");
    let string = `<div class="box-item">
        <span class="item-key">${key}</span>
        <span class="item-value">${value}</span>
    </div>`;

    box.classList.add("animate__backOutRight");
    setTimeout(function() {
        box.innerHTML = string;
        box.classList.remove("animate__backOutRight");
        box.classList.add("animate__backInRight");
    }, 420);

    index++;
    if(index >= length) { index = 0 }
    return index;
}

function parseInteger(number) {
    if(typeof number == "undefined") {
        return 0;
    }
    return "" + parseInt(number).toLocaleString("de-DE");
}
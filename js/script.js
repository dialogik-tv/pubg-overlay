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
            const seasonId = await getCurrentSeasonId(client);

            // Fetch current season data
            let singleSeasonFetcher = await getCurrentRankedSeasonData(player.id, seasonId, key);
            setInterval(async function() {
                singleSeasonFetcher = await getCurrentRankedSeasonData(player.id, seasonId, key);
            }, 60 * 1000); // 60s/1min

            // Short reference
            const squadFPP = singleSeasonFetcher.attributes.rankedGameModeStats['squad-fpp'];

            // Pass content to handler
            const displayData = {
                "Assists": squadFPP.assists,
                "Average rank": (Math.round(squadFPP.avgRank * 100) / 100).toFixed(1),
                "Best rank point": squadFPP.bestRankPoint,
                "Best tier": `${squadFPP.bestTier.tier} ${squadFPP.bestTier.subTier}`,
                "Current rank point": squadFPP.currentRankPoint,
                "Current tier": `${squadFPP.currentTier.tier} ${squadFPP.currentTier.subTier}`,
                "Damage dealt": (Math.round(squadFPP.damageDealt * 100) / 100).toFixed(0),
                "DBNOs": squadFPP.dBNOs,
                "Deaths": squadFPP.deaths,
                "Kills": squadFPP.kills,
                "KDA": (Math.round(squadFPP.kda * 100) / 100).toFixed(1),
                "Rounds played": squadFPP.roundsPlayed,
                "🔝🔟 Ratio": (Math.round(squadFPP.top10Ratio * 100)).toFixed(0) + " of 100",
                "Win ratio": (Math.round(squadFPP.winRatio * 100)).toFixed(0) + " of 100",
                "🐔": squadFPP.wins,
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

async function getCurrentSeasonId(client) {
    const seasons = await client.getSeasons();
    console.log(seasons);
    for(index in seasons) {
        if(seasons[index].attributes.isCurrentSeason && seasons[index].id.includes(".pc-")) {
            return seasons[index].id;
        }
    }
}

async function getCurrentRankedSeasonData(playerId, seasonId, key) {
    const url = `https://api.pubg.com/shards/steam/players/${playerId}/seasons/${seasonId}/ranked`;
    const season = await fetch(url, {
        headers: {
            Accept: 'application/vnd.api+json',
            Authorization: 'Bearer ' + key
        }
    });
    const data = await season.json();
    console.log(data.data);
    return data.data;
}
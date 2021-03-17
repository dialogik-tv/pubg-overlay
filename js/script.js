(async () => {
    // Parse URL param
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let key = '';
    let region = 'pc-eu';
    const player = { };

    // Parse PUBG username
    if(urlParams.has('username')) {
        player.username = urlParams.get('username');
        
        // Parse PUBG API key
        if(urlParams.has('key')) {
            key = urlParams.get('key');
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
            const singleSeasonFetcher = await client.getPlayerSeason(player.id, season);
            // console.log({singleSeasonFetcher});

            // Short reference
            const squadFPP = singleSeasonFetcher.attributes.gameModeStats.squadFPP;
            console.log(squadFPP);

            // Pass content to handler
            setBoxContent({
                'Kills': squadFPP.kills,
                'Kopfschusstötungen': squadFPP.headshotKills,
                '🐔': squadFPP.wins,
                '🔝🔟': squadFPP.top10s,
                'Longest Kill m' : parseInteger(squadFPP.longestKill),
                '💊': squadFPP.boosts,
                'Assists': squadFPP.assists,
                'Schaden': parseInteger(squadFPP.damageDealt),
                'Tägliche Kills': squadFPP.dailyKills,
                '💉': squadFPP.revives,
                '☠️🚗': squadFPP.roadKills,
                'Meisten Kills': squadFPP.roundMostKills,
                'Selbstmorde': squadFPP.suicides,
                '🚗💥': squadFPP.vehicleDestroys,
                'Waffen': squadFPP.weaponsAcquired,
                '🚗 km': parseInteger(squadFPP.rideDistance),
                '👣 km': parseInteger(squadFPP.walkDistance)
            });
        } else {
            alert('PUBG API-Key muss gesetzt werden!');
        }
    } else {
        alert('PUBG Username muss gesetzt werden!');
    }
})();

function setBoxContent(content) {
    let keys = Object.keys(content);
    let values = Object.values(content);

    let i = 0;
    i = setRowContent(keys[i], values[i], values.length, i);
    setInterval(function() {
        i = setRowContent(keys[i], values[i], values.length, i);
    }, 5000);
}

function setRowContent(key, value, length, index) {
    const box = document.querySelector('#box');
    let string = `<div class="box-item">
        <span class="item-key">${key}</span>
        <span class="item-value">${value}</span>
    </div>`;
    box.innerHTML = string;
    index++;
    if(index >= length) { index = 0 }
    return index;
}

function parseInteger(number) {
    if(typeof number == 'undefined') {
        return 0;
    }
    return parseInt(number.toLocaleString('de-DE'));
}
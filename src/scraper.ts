import * as cheerio from 'cheerio';

interface Player {
    name: string;
    fideId?: string;
    rating?: number;
    lichess?: string;
}

interface Pairing {
    white: string;
    black: string;
}

interface PairingResult {
    white: Player;
    black: Player;
}

async function fetchHtml(url: string): Promise<string> {
    const response = await fetch(url);
    return await response.text();
}

// const playerListUrl = 'https://chess-results.com/tnr850957.aspx?lan=1&turdet=YES';
const playerListUrl = 'https://chess-results.com/tnr549689.aspx?lan=1&art=16&flag=30';
const pairingsUrl = 'https://chess-results.com/tnr549689.aspx?lan=1&art=3&rd=1&flag=30';

export async function getPlayers(): Promise<Player[]> {
    const response = await fetchHtml(`${playerListUrl}&zeilen=99999`);
    const $ = cheerio.load(response);
    const players: Player[] = [];

    let headers: string[] = [];

    $('.CRs1 tr').each((index, element) => {
        if (index === 0) {
            headers = $(element).children().map((_index, element) => $(element).text()).get();
            return;
        }

        const fideId = headers.indexOf('FideID') > -1 ? $(element).find('td').eq(headers.indexOf('FideID')).text() : undefined;
        const rating = headers.indexOf('Rtg') > -1 ? parseInt($(element).find('td').eq(headers.indexOf('Rtg')).text()) : undefined;
        const lichess = headers.indexOf('Club/City') > -1 ? $(element).find('td').eq(headers.indexOf('Club/City')).text() : undefined;

        const player: Player = {
            name: $(element).find('td').eq(headers.indexOf('Name')).text(),
            fideId,
            rating,
            lichess,
        };
        players.push(player);
    });

    return players;
}

export async function getPairings(): Promise<Pairing[]> {
    const response = await fetchHtml(pairingsUrl);
    const $ = cheerio.load(response);
    const pairings: Pairing[] = [];

    $('.CRs1 tr').each((index, element) => {
        // only the pairing rows have nested tables. ignore headers, etc
        if ($(element).find('table').length === 0) {
            return;
        }

        // white indicator = div.FarbewT
        // black indicator = div.FarbesT
        const white = $(element).find('table').find('div.FarbewT').parentsUntil('table').last().text();
        const black = $(element).find('table').find('div.FarbesT').parentsUntil('table').last().text();

        pairings.push({ white, black });
    });

    return pairings;
}

export function formatPairings(players: Player[], pairings: Pairing[]): PairingResult[] {
    return pairings.map((pairing) => {
        const white = players.find((player) => player.name === pairing.white);
        const black = players.find((player) => player.name === pairing.black);

        if (!white) throw new Error(`Could not find in player list: ${pairing.white}`);
        if (!black) throw new Error(`Could not find in player list: ${pairing.black}`);

        return { white, black };
    });
}

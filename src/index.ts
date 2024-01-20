import { formatPairings, getPairings, getPlayers } from './scraper';

const players = await getPlayers('https://chess-results.com/tnr549689.aspx?lan=1&art=16&flag=30');
console.log(players);

const pairings = await getPairings('https://chess-results.com/tnr549689.aspx?lan=1&art=3&rd=1&flag=30');
console.log(pairings);

const pairingResults = formatPairings(players, pairings);
console.log(pairingResults);

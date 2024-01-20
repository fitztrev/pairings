import { formatPairings, getPairings, getPlayers } from './scraper';

const players = await getPlayers();
console.log(players);

const pairings = await getPairings();
console.log(pairings);

const pairingResults = formatPairings(players, pairings);
console.log(pairingResults);

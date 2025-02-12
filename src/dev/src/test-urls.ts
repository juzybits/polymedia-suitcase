import { NetworkName, SuiExplorerItem, makePolymediaUrl, makeSuiscanUrl, makeSuivisionUrl } from "@polymedia/suitcase-core";

type Datum = [ NetworkName, SuiExplorerItem, string ];
const inputData: Datum[] = [
    [ "mainnet", "address", "0xa69a1e0714a16c7ce1cf768a22b78ac5b1fdb488eb3fb0365c5efa95ba2f67cc" ],
    [ "mainnet", "tx", "RrCxVkdxRp2jYfBG8esSrQncALPHjMkLqyBa8N4onoH" ],
    [ "mainnet", "package", "0x30a644c3485ee9b604f52165668895092191fcaf5489a846afa7fc11cdb9b24a" ],
    [ "mainnet", "object", "0x71d2211afbb63a83efc9050ded5c5bb7e58882b17d872e32e632a978ab7b5700" ],
    [ "mainnet", "coin", "0x30a644c3485ee9b604f52165668895092191fcaf5489a846afa7fc11cdb9b24a::spam::SPAM" ],

    [ "testnet", "address", "0xa69a1e0714a16c7ce1cf768a22b78ac5b1fdb488eb3fb0365c5efa95ba2f67cc" ],
    [ "testnet", "tx", "9T23wRiawSutAJwsYjFYhKDZvL5cE8wp5PCYQH47r7GG" ],
    [ "testnet", "package", "0xb0783634bd4aeb2c97d3e707fce338c94d135d72e1cb701ca220b34f7b18b877" ],
    [ "testnet", "object", "0x6f0919d420bcfd5156534e864f0ec99ef8f1137ba59f44d4a39edca73e7ae464" ],
    [ "testnet", "coin", "0xb0783634bd4aeb2c97d3e707fce338c94d135d72e1cb701ca220b34f7b18b877::spam::SPAM" ],
];

for (const data of inputData) {
    const polymediaUrl = makePolymediaUrl(data[0], data[1], data[2]);
    console.log(polymediaUrl);
}

for (const data of inputData) {
    const suiscanUrl = makeSuiscanUrl(data[0], data[1], data[2]);
    console.log(suiscanUrl);
}

for (const data of inputData) {
    const suivisionUrl = makeSuivisionUrl(data[0], data[1], data[2]);
    console.log(suivisionUrl);
}

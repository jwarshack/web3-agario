const serverUrl = "https://srls43madnoh.usemoralis.com:2053/server";
const appId = "maesHrsIV3j1eWGZG4FNj6wE33cSnvIjEjy9tbd7";
Moralis.start({ serverUrl, appId });

let wallet

function shortAddress(addr) {
    const first = addr.slice(0, 4)
    const last = addr.slice(-4)
    return `${first}...${last}`
}

async function getENSorAddress(addr) {
    let result
    try {
        result = await Moralis.Web3API.resolve.resolveAddress( { address: addr } )
    } catch (error) {
        return shortAddress(addr)
    }
    return result.name
}
async function connectWallet() {
    let user = await Moralis.authenticate({ signingMessage: "Welcome to Web3 Agario!" })

    const addr = user.get("ethAddress")
    wallet = addr

    const ensOrAddress = await getENSorAddress(wallet)

    this.textContent = ensOrAddress
  }

async function fetchNFTs() {
    let data = await Moralis.Web3API.account.getNFTs({ chain: "rinkeby" })
    data.result.forEach(function(nft) {
        if (!nft.token_uri) return
        let url = fixURL(nft.token_uri)

        fetch(url)
            .then(response => response.json())
            .then(data => {
        })
    })
}

function fixURL(url) {
    if(url.startsWith("ipfs")) {
        return "https://ipfs.moralis.io:2053/ipfs/" + url.split("ipfs://ipfs/").slice(-1)
    } else {
        return url + "?format=json"
    }
}

document.getElementById('connect-btn').addEventListener('click', connectWallet)
document.querySelector('#skin-btn').addEventListener('click', fetchNFTs)
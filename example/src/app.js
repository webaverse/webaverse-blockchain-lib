import { WalletManager } from '../../dist/index';
import { CLIENT_ID, CLIENT_SECRET, PORT } from './config';

// called from onclick
function editProfile() {
    const key = document.getElementById('key').value
    const value = document.getElementById('value').value

    if (!key || !value) {
        alert('Invalid input');
    } else {
        metamask.setProfile(key, value);
        alert('Transaction created');
        $('#editprofile').modal('hide');
    }
}


function setProfile(profile) {
    const keyValArr = Object.entries(profile);
    let profileList = [];
    for (const kv of keyValArr) {
        profileList.push(`<li class="list-group-item text-uppercase p-2">${kv[0]}: ${kv[1]}</li>`);
    }
    document.getElementById('profile').innerHTML = profileList.join('');
}

function setNFTs(nfts) {
    const nftCards = [];
    console.log(nfts);
    for (const nft of nfts) {
        const nftC = `
        <div class="col-md-4">
            <div class="card text-white bg-dark">
                <img
                    class="card-img-top card-img"
                    src="${nft.metadata?.image ?? nft.asset_contract.image_url}"
                    alt=""
                />
                <div class="card-body">
                    <h4 class="card-title">${nft.metadata.name ?? ''}</h4>
                    <p class="card-text">${nft.metadata?.description ?? ''}</p>
                </div>
            </div>
        </div>`;
        nftCards.push(nftC);
    }
    document.getElementById('nfts').innerHTML = nftCards.join('');
}

function init() {
    metamask = new WalletManager();
    metamask.addListener('webawallet_loaded', (ev) => {
        console.log('WEBAWALLET LOADED');
    });
    document.getElementById('loginMetamask').addEventListener('click', () => {
        login('metamask').then(() => {
            document.getElementById('editprofilebtn').addEventListener('click', () => {
                editProfile();
            }, false);
        });
    });
    document.getElementById('loginDiscord').addEventListener('click', () => {
        login('discord').then(() => {
            document.getElementById('editprofilebtn').addEventListener('click', () => {
                editProfile();
            });
        });
    });
}
document.addEventListener('DOMContentLoaded', init, false);

// metamask is an object of our library's Metamask Manager
let metamask = undefined;

// login function connects user's metamask and if its working then adds weba-wallet iframe and initialize it
// Once weba-wallet is initialized it subscribes to profile and nft subjects (RxJs). Read more: https://rxjs.dev/guide/overview
async function login(type) {
    if (type === 'metamask') {
        try {
            await metamask.connectMetamask();
            document.getElementById('loginBtns').style.display = "none";
            document.getElementById('address').innerHTML = metamask.address;

            metamask.addListener('nft', (ev) => {
                console.log('nfts fetched', ev);
                setNFTs(ev.data);
            });

            metamask.addListener('profile', (ev) => {
                console.log('profile fetched', ev);
                setProfile(ev.data);
            });

        } catch (error) {
            alert(error.message);
        }

    } else {
        {/* console.log(process.env); */}
        {/* location.href=`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A${PORT}&response_type=code&scope=identify`; */}
        location.href=`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A${PORT}&response_type=code&scope=identify%20email%20guilds`;
    }
}

window.onload = async function() {
    if (location.href.indexOf("code") !== -1) {
        const code = location.href.substring(location.href.indexOf("code") + 5, location.href.length);
        let oauthData = {};
        try {
            const oauthResult = await fetch('https://discord.com/api/oauth2/token', {
                method: 'POST',
                body: new URLSearchParams({
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: `http://localhost:${PORT}`,
                    scope: 'identify',
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            oauthData = await oauthResult.json();
            console.log(oauthData);
        } catch (error) {
            // NOTE: An unauthorized token will not throw an error;
            // it will return a 401 Unauthorized response in the try block above
            console.error(error);
        }

        const userResult = await fetch('https://discord.com/api/users/@me', {
            headers: {
                authorization: `${oauthData.token_type} ${oauthData.access_token}`,
            },
        });
        const userData = await userResult.json();
        console.log(userData);
        const avatar_url = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}`;
        document.getElementById('id_avatar').src = avatar_url;
        userData.avatar = avatar_url;

        const keyValArr = Object.entries(userData);
        let profileList = [];
        for (const kv of keyValArr) {
            profileList.push(`<li class="list-group-item text-uppercase p-2">${kv[0]}: ${kv[1]}</li>`);
        }
        document.getElementById('profile').innerHTML = profileList.join('');
        document.getElementById('b_editprofile').style.display = "none";

        const message = {
            method: "initiate_wallet_discord",
            data: {
                discordid: userData.id,
                discordcode : code
            }
        };
        console.log(JSON.stringify(message));
        req = JSON.parse(JSON.stringify(message));
        const { data, method } = req;
        console.log(data.discordid);
        console.log(data.discordcode);
        document.getElementById("id_iframe").contentWindow.postMessage(JSON.stringify(message), "*");
    }
}
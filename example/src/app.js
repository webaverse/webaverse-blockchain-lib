import { MetamaskManager } from './lib-dist/index';

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

function init() {
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

    login('metamask').then(() => {
        document.getElementById('editprofilebtn').addEventListener('click', () => {
            editProfile();
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
        metamask = new MetamaskManager();
        try {
            await metamask.connect();
            document.getElementById('loginBtns').style.display = "none";
            document.getElementById('address').innerHTML = metamask.address;
            metamask.getProfile().subscribe(profile => {
                console.log(profile);
                const keyValArr = Object.entries(profile);
                let profileList = [];
                for (const kv of keyValArr) {
                    profileList.push(`<li class="list-group-item text-uppercase p-2">${kv[0]}: ${kv[1]}</li>`);
                }
                document.getElementById('profile').innerHTML = profileList.join('');
            });
            metamask.getNFTs().subscribe(nfts => {
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
            });
        } catch (error) {
            alert(error.message);
        }
    } else {
        window.alert('Not implemented');
    }
}
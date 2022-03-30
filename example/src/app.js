import 'regenerator-runtime/runtime'
import { MetamaskManager } from '../../dist'



async function login(type) {
    if (type === 'metamask') {
        const metamask = new MetamaskManager();
        try {
            await metamask.connect();
            console.log(await metamask.nft.getNFTs());
        } catch (error) {
            alert(error.message);
        }
    } else {
        window.alert('Not implemented');
    }
}

window.onload = () => {
    document.getElementById('loginMetamask').addEventListener('click', () => {
        login('metamask');
    });
    document.getElementById('loginDiscord').addEventListener('click', () => {
        login('discord');
    });
}
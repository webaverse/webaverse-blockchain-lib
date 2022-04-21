import { MetamaskManager, ProfileManager } from '../../dist';

let wallet = undefined; // iframe element
let provider;

async function login(type) {
    if (type === 'metamask') {
        const metamask = new MetamaskManager();
        try {
            const signedMessage = await metamask.connect();
            provider = metamask.getProvider();
            console.log('login')
            const t = await provider.getSigner().getAddress();
            console.log(t);
            const jwt = await metamask.login(signedMessage);
            sendMessage('initiate_wallet', { jwt })
        } catch (error) {
            alert(error.message);
        }
    } else {
        window.alert('Not implemented');
    }
}

async function getProfile() {
    console.log('get profile')
    const profile = new ProfileManager(provider);
    console.log(await profile.getProfile());
    sendMessage('get_profile', {});
}

async function setProfile(key, value) {
    console.log('set profile')
    const profile = new ProfileManager(provider);
    profile.updateProfile(key, value);
    sendMessage('set_profile', { key, value });
}

function sendMessage(method, data = {}) {
    const message = {
        method,
        data
    }
    wallet.contentWindow.postMessage(JSON.stringify(message), "*");
}

function receiveMessage(event) {
    console.log('receiveMessage')
    if (event.origin + '/' !== wallet.src) { // Adding '/' at the end to compare origin and src
        return;
    }
    if (!event.data) {
        return;
    }
    const res = JSON.parse(event.data);
    const { type, method, data, error } = res;
    if (error) {
        window.alert(error);
        return;
    }
    if (type === 'event') {
        console.log(`Got event: ${method}`, { data })
    } else if (type === 'response') {
        console.log(`Got response for: ${method}`, { data })
    }
}

window.onload = () => {
    wallet = document.getElementById('wallet');
    window.addEventListener("message", receiveMessage, false);
    document.getElementById('loginMetamask').addEventListener('click', () => {
        login('metamask');
    });
    document.getElementById('loginDiscord').addEventListener('click', () => {
        login('discord');
    });
    document.getElementById('btn-profile').addEventListener('click', () => {
        getProfile();
    });

    document.getElementById('setName').addEventListener('click', () => {
        const name = document.getElementById('nameInput').value;
        if (!name.trim()) {
            alert('Invalid value for name');
        } else {
            setProfile('name', name);
        }
    });

}
import { Contract, ethers, Signer } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { config } from "../config/config";
import { Subject } from "rxjs";

declare const window: Window;

export class MetamaskManager {
  private isMetamaskActive = false;

  private provider: ethers.providers.Web3Provider;
  private signer: Signer;

  private erc1155Contract: Contract;
  private erc20Contract: Contract;
  private webaverseContract: Contract;

  supportedChains = {
    137: "polygon",
    1: "eth",
    1338: "sidechain",
  };

  public chainId: number;
  public address: string;

  private webaWalletConnected$: Subject<boolean> = new Subject<boolean>();
  private nft$: Subject<any> = new Subject<any>();
  private profile$: Subject<any> = new Subject<any>();

  constructor() {
    this.webaWalletConnected$.next(false);
    this.nft$.next([]);
    this.profile$.next(null);
    document.body.innerHTML += `<iframe src="${config.webaWalletURL}" width="0" height="0" frameborder="0" id="webaWalletIframe"></iframe>`;
  }

  public async connect(): Promise<void> {
    window.addEventListener("message", (ev) => {
      this.receiveMessage(ev);
    });

    const providerMetamask: any = await detectEthereumProvider();
    if (providerMetamask) {
      // This is an experimental function and might change in future therefore checking if it exists first.
      if (
        providerMetamask._metamask &&
        typeof providerMetamask._metamask.isUnlocked
      ) {
        const unlocked = await providerMetamask._metamask.isUnlocked();
        if (!unlocked) {
          // Throwing error for locked metamask wallet because requesting
          // accounts sometimes do not show pop-up and the promise gets stuck.
          throw new Error("Please unlock your metamask wallet");
        }
      }
      if (
        Number.parseInt(providerMetamask.chainId, 16) !==
          137 /* Polygon's Chain ID */ &&
        Number.parseInt(providerMetamask.chainId, 16) !==
          1 /* Ethereum's Chain ID */
      ) {
        try {
          await providerMetamask.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x89",
                rpcUrls: ["https://polygon-rpc.com/"],
                chainName: "Polygon Mainnet",
                nativeCurrency: {
                  name: "MATIC",
                  symbol: "MATIC",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://explorer.matic.network"],
              },
            ],
          });
        } catch (error) {
          console.log(error);
          throw new Error(
            "Please connect Metamask to Ethereum or Polygon mainnet."
          );
        }
      }
      try {
        const accounts = await providerMetamask.request({
          method: "eth_requestAccounts",
        });
        if (!accounts || accounts.length < 1) {
          throw new Error("No address connected");
        }
      } catch (error) {
        throw new Error("User cancelled the connection request.");
      }
      this.provider = new ethers.providers.Web3Provider(
        providerMetamask as any
      );

      this.address = await this.provider.getSigner().getAddress();
      this.chainId = Number.parseInt(providerMetamask.chainId, 16);
      this.isMetamaskActive = true;
      this.sendMessage("check_auth", {});
    } else {
      throw new Error("Metamask not installed");
    }
  }

  get webaWalletConnected() {
    return this.webaWalletConnected$;
  }

  async authenticate() {
    let fetchRes: any = await fetch(
      `${config.authServerURL}/metamask-login?address=${this.address}`
    );
    let fetchResJson: any = await fetchRes.json();
    if (fetchRes.status >= 400) {
      throw new Error(fetchResJson.message);
    }
    const messageToSign = fetchResJson.message;
    const signedMessage = await this.provider
      .getSigner()
      .signMessage(messageToSign);
    this.sendMessage("initiate_wallet_metamask", {
      signedMessage,
      address: this.address,
    });
    this.sendMessage("check_auth", {});
  }

  getProfile(): Subject<any> {
    this.sendMessage("get_profile", {});
    return this.profile$;
  }

  getNFTs(): Subject<any> {
    let chain = this.supportedChains[`${this.chainId}`];
    if (!chain) {
      throw new Error(
        "Connected chain not supported. Please connect through ethereum, polygon or webaverse sidechain"
      );
    }
    fetch(
      `https://nft.webaverse.com/nft?chainName=${chain}&owner=${this.address}`
    )
      .then((res) => res.json())
      .then((nfts) => this.nft$.next(nfts));
    return this.nft$;
  }

  setProfile(key, value) {
    this.sendMessage("set_profile", {
      key,
      value,
    });
  }

  private sendMessage(method, data = {}) {
    const el = document.getElementById("webaWalletIframe") as HTMLIFrameElement;
    const message = {
      method,
      data,
    };
    if (!el.contentWindow) {
      throw new Error("iframe not loaded");
    }
    el.contentWindow.postMessage(JSON.stringify(message), "*");
  }

  private receiveMessage(event: MessageEvent) {
    if (event.origin !== config.authServerURL) {
      return;
    }
    const res = JSON.parse(event.data);
    if (res.type === "event") {
      if (res.method === "wallet_launched") {
        console.log("Webawallet connected.");
        if (this.isMetamaskActive) {
          this.sendMessage("check_auth", {});
        }
      }
    }

    if (res.type === "response") {
      if (res.method === "check_auth") {
        if (!res.data.auth) {
          this.authenticate();
        } else {
          console.log("Webawallet initialized and ready to use now.");
          this.webaWalletConnected$.next(true);
          this.getProfile();
          this.getNFTs();
        }
      } else if (res.method === "initiate_wallet_metamask") {
        console.log("Webawallet initialized and ready to use now.");
        this.webaWalletConnected$.next(true);
        this.getProfile();
        this.getNFTs();
      } else if (res.method === "get_profile") {
        console.log("Got profile");
        if (!res.error) {
          this.profile$.next(res.data);
        } else {
          console.error(res.error);
        }
      } else if (res.method === "set_profile") {
        if (!res.error) {
          this.sendMessage("get_profile", {});
        } else {
          console.error(res.error);
        }
      }
    }
  }
}

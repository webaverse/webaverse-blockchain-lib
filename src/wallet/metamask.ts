import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { NFTManager } from "../nft/nft";
import { config } from "../config/config";

declare const window: Window;

export class MetamaskManager {
  nft: NFTManager;

  public async connect() {
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
                chainId: 137,
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
      const provider = new ethers.providers.Web3Provider(
        providerMetamask as any
      );

      const address = await provider.getSigner().getAddress();
      const signedMessage = await provider.getSigner().signMessage(
`Welcome to Webaverse!
Click to sign in and accept the Webaverse Terms of Service.
This request will not trigger a blockchain transaction or cost any gas fees.
Wallet address:
${address}
Timestamp:
${new Date().toISOString()}`
      );
      console.log({
        signedMessage,
      });

      this.nft = new NFTManager(
        provider,
        Number.parseInt(providerMetamask.chainId, 16)
      );
    } else {
      throw new Error("Metamask not installed");
    }
  }
}

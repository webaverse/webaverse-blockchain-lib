import { ethers } from "ethers";
import { NFTManager } from "../nft/nft";
import { config } from "../config/config";

export class MnemonicManager {
  nft: NFTManager;

  public async connect(mnemonic) {
    const provider = new ethers.providers.JsonRpcProvider(config.sidechainURL);
    const wallet = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);
    this.nft = new NFTManager(provider, 1338);
  }
}

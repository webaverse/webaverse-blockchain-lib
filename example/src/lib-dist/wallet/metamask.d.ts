import { Subject } from "rxjs";
export declare class MetamaskManager {
    private isMetamaskActive;
    private provider;
    private signer;
    private erc1155Contract;
    private erc20Contract;
    private webaverseContract;
    supportedChains: {
        137: string;
        1: string;
        1338: string;
    };
    chainId: number;
    address: string;
    private webaWalletConnected$;
    private nft$;
    private profile$;
    constructor();
    connect(): Promise<void>;
    get webaWalletConnected(): Subject<boolean>;
    authenticate(): Promise<void>;
    getProfile(): Subject<any>;
    getNFTs(): Subject<any>;
    setProfile(key: any, value: any): void;
    private sendMessage;
    private receiveMessage;
}

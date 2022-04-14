var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { config } from "../config/config";
import { Subject } from "rxjs";
var MetamaskManager = /** @class */ (function () {
    function MetamaskManager() {
        this.isMetamaskActive = false;
        this.supportedChains = {
            137: "polygon",
            1: "eth",
            1338: "sidechain",
        };
        this.webaWalletConnected$ = new Subject();
        this.nft$ = new Subject();
        this.profile$ = new Subject();
        this.webaWalletConnected$.next(false);
        this.nft$.next([]);
        this.profile$.next(null);
        document.body.innerHTML += "<iframe src=\"".concat(config.webaWalletURL, "\" width=\"0\" height=\"0\" frameborder=\"0\" id=\"webaWalletIframe\"></iframe>");
    }
    MetamaskManager.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var providerMetamask, unlocked, error_1, accounts, error_2, _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        window.addEventListener("message", function (ev) {
                            _this.receiveMessage(ev);
                        });
                        return [4 /*yield*/, detectEthereumProvider()];
                    case 1:
                        providerMetamask = _b.sent();
                        if (!providerMetamask) return [3 /*break*/, 12];
                        if (!(providerMetamask._metamask &&
                            typeof providerMetamask._metamask.isUnlocked)) return [3 /*break*/, 3];
                        return [4 /*yield*/, providerMetamask._metamask.isUnlocked()];
                    case 2:
                        unlocked = _b.sent();
                        if (!unlocked) {
                            // Throwing error for locked metamask wallet because requesting
                            // accounts sometimes do not show pop-up and the promise gets stuck.
                            throw new Error("Please unlock your metamask wallet");
                        }
                        _b.label = 3;
                    case 3:
                        if (!(Number.parseInt(providerMetamask.chainId, 16) !==
                            137 /* Polygon's Chain ID */ &&
                            Number.parseInt(providerMetamask.chainId, 16) !==
                                1) /* Ethereum's Chain ID */) return [3 /*break*/, 7]; /* Ethereum's Chain ID */
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, providerMetamask.request({
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
                            })];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _b.sent();
                        console.log(error_1);
                        throw new Error("Please connect Metamask to Ethereum or Polygon mainnet.");
                    case 7:
                        _b.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, providerMetamask.request({
                                method: "eth_requestAccounts",
                            })];
                    case 8:
                        accounts = _b.sent();
                        if (!accounts || accounts.length < 1) {
                            throw new Error("No address connected");
                        }
                        return [3 /*break*/, 10];
                    case 9:
                        error_2 = _b.sent();
                        throw new Error("User cancelled the connection request.");
                    case 10:
                        this.provider = new ethers.providers.Web3Provider(providerMetamask);
                        _a = this;
                        return [4 /*yield*/, this.provider.getSigner().getAddress()];
                    case 11:
                        _a.address = _b.sent();
                        this.chainId = Number.parseInt(providerMetamask.chainId, 16);
                        this.isMetamaskActive = true;
                        this.sendMessage("check_auth", {});
                        return [3 /*break*/, 13];
                    case 12: throw new Error("Metamask not installed");
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(MetamaskManager.prototype, "webaWalletConnected", {
        get: function () {
            return this.webaWalletConnected$;
        },
        enumerable: false,
        configurable: true
    });
    MetamaskManager.prototype.authenticate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var fetchRes, fetchResJson, messageToSign, signedMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(config.authServerURL, "/metamask-login?address=").concat(this.address))];
                    case 1:
                        fetchRes = _a.sent();
                        return [4 /*yield*/, fetchRes.json()];
                    case 2:
                        fetchResJson = _a.sent();
                        if (fetchRes.status >= 400) {
                            throw new Error(fetchResJson.message);
                        }
                        messageToSign = fetchResJson.message;
                        return [4 /*yield*/, this.provider
                                .getSigner()
                                .signMessage(messageToSign)];
                    case 3:
                        signedMessage = _a.sent();
                        this.sendMessage("initiate_wallet_metamask", {
                            signedMessage: signedMessage,
                            address: this.address,
                        });
                        this.sendMessage("check_auth", {});
                        return [2 /*return*/];
                }
            });
        });
    };
    MetamaskManager.prototype.getProfile = function () {
        this.sendMessage("get_profile", {});
        return this.profile$;
    };
    MetamaskManager.prototype.getNFTs = function () {
        var _this = this;
        var chain = this.supportedChains["".concat(this.chainId)];
        if (!chain) {
            throw new Error("Connected chain not supported. Please connect through ethereum, polygon or webaverse sidechain");
        }
        fetch("https://nft.webaverse.com/nft?chainName=".concat(chain, "&owner=").concat(this.address))
            .then(function (res) { return res.json(); })
            .then(function (nfts) { return _this.nft$.next(nfts); });
        return this.nft$;
    };
    MetamaskManager.prototype.setProfile = function (key, value) {
        this.sendMessage("set_profile", {
            key: key,
            value: value,
        });
    };
    MetamaskManager.prototype.sendMessage = function (method, data) {
        if (data === void 0) { data = {}; }
        var el = document.getElementById("webaWalletIframe");
        var message = {
            method: method,
            data: data,
        };
        if (!el.contentWindow) {
            throw new Error("iframe not loaded");
        }
        el.contentWindow.postMessage(JSON.stringify(message), "*");
    };
    MetamaskManager.prototype.receiveMessage = function (event) {
        if (event.origin !== config.authServerURL) {
            return;
        }
        var res = JSON.parse(event.data);
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
                }
                else {
                    console.log("Webawallet initialized and ready to use now.");
                    this.webaWalletConnected$.next(true);
                    this.getProfile();
                    this.getNFTs();
                }
            }
            else if (res.method === "initiate_wallet_metamask") {
                console.log("Webawallet initialized and ready to use now.");
                this.webaWalletConnected$.next(true);
                this.getProfile();
                this.getNFTs();
            }
            else if (res.method === "get_profile") {
                console.log("Got profile");
                if (!res.error) {
                    this.profile$.next(res.data);
                }
                else {
                    console.error(res.error);
                }
            }
            else if (res.method === "set_profile") {
                if (!res.error) {
                    this.sendMessage("get_profile", {});
                }
                else {
                    console.error(res.error);
                }
            }
        }
    };
    return MetamaskManager;
}());
export { MetamaskManager };
//# sourceMappingURL=metamask.js.map
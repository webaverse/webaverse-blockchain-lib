# Getting Started with webaverse-blockchain-lib

```sh
npm install // Installing the node modules
```

```sh
npm run prepare // Build the project
```

### cd examples

```sh
npm install // Installing the node modules
```

```sh
npm run start // To run the project
```

# About the project
There are four functions(Login with metamask, Login with discord, Fetch Profile and Update the name) in this project.
For signing and verification it uses ethers.js.
Ethers.js is a JavaScript library that allows developers to interact with the Ethereum blockchain.
And the main class of this project is MetamaskManager class and Profile class.
They use ethers.js to connect the metamask, get the profile and update the profile.

1.  Login with metamask
    - Connect metamask
    
    ![1](https://user-images.githubusercontent.com/87816136/162272579-0de10c04-d6ad-4dab-8761-a662adb6baf5.png)
    - Login to metamask
    
    ![2](https://user-images.githubusercontent.com/87816136/162272746-19bafc67-e028-489c-adce-b851cccd4655.png)

2.  Login with discord
    You can login to metamask.
    The function of login with discord is not implemented yet.

3.  Fetch Profile
    You can get information of wallet and your personal information.
    Not working 

4.  Update the name
    You can update your profile name. You should input the name without no space.
    Not working.

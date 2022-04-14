import axios from "axios";

export class DiscordManager {

    async getDiscordToken(code) {
        const options = new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: process.env.DISCORD_REDIRECT,
            scope: 'identify email guilds',
        });
        try {
            const result = await axios.post('https://discord.com/api/oauth2/token', options);
            return result;
        } catch (error) {
            console.log(error);
        }
    }

    public getDiscordUserInfo = async (accessToken) => {
        try {
            const response = await axios.get('https://discord.com/api/users/@me', {
                headers: {
                    authorization: `${accessToken.data.token_type} ${accessToken.data.access_token}`
                }
            });
            return response.data;
        } catch (error) {
            console.log(error);
        }
    }

    async login(code) {
        const accessToken: any = await this.getDiscordToken(code);
        const userInfo = await this.getDiscordUserInfo(accessToken);
        return {
            accessToken: accessToken.data.access_token,
            data: userInfo
        };
    }
}
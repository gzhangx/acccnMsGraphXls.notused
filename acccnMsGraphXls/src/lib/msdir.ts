import { getDefaultAuth, ITenantClientId, ITokenInfo } from "./msauth";
import Axios from 'axios';

export interface IMsGraphDirItemOpt {
    tenantClientInfo: ITenantClientId;
    userId: string;
    tokenInfo?: ITokenInfo;
}

export interface IMsDirOps {
    doGet: (itemId: string, action: string) => Promise<any>;
    doPost: (itemId: string, action: string, data: object) => Promise<any>;
}

export async function gtMsDir(opt: IMsGraphDirItemOpt): Promise<IMsDirOps> {
    const now = new Date().getTime();
    async function getToken(): Promise<ITokenInfo> {
        if (!opt.tokenInfo || opt.tokenInfo.expires_on < now / 1000) {
            const { getAccessToken } = getDefaultAuth(opt.tenantClientInfo);
            console.log('getting new token');
            const tok = await getAccessToken();
            opt.tokenInfo = tok;
        }
        return opt.tokenInfo;
    }

    async function getHeaders() {
        const tok = await getToken();
        return {
            headers: {
                "Authorization": `Bearer ${tok.access_token}`
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        };
    }

    function parseResp(r: { data: any }) {
        return r.data;
    }
    async function doGet(itemId: string, action: string) : Promise<any> {
        return await Axios.get(getUrl(itemId, action), await getHeaders())
            .then(parseResp).catch(err => {
                console.log(err);
                throw err;
            })
    }

    async function doPost(itemId: string, action: string, data: object) {
        return Axios.post(getUrl(itemId, action), data, await getHeaders()).then(parseResp);
    }

    const getUrl = (itemId: string, action: string) => `https://graph.microsoft.com/v1.0/users('${opt.userId}')/drive/items('${itemId}')/${action}`;
   

    return {
        doGet,
        doPost,
    }

}
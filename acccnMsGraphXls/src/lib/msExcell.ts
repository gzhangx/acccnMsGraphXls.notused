import { IMsGraphCreds, getDefaultMsGraphConn, IDriveItemInfo } from "./msauth";
import { IMsGraphOps, getDriveUrl, getDriveAndByIdUrl } from './msdir';

export interface IMsGraphExcelItemOpt {
    tenantClientInfo: IMsGraphCreds;
    fileName?: string;
    itemId?: string;
    sheetInfo?: IWorkSheetInfo;
}

interface IWorkSheetInfo {
    '@odata.context': string;
    value:
    {
        '@odata.id': string;
        id: string;
        name: string;
        position: number;
        visibility: string; //'Visible'
    }[];
    
}

export interface IReadSheetValues {
    '@odata.context': string; //https://graph.microsoft.com/v1.0/$metadata#workbookRange
    '@odata.type': string; //'#microsoft.graph.workbookRange',
    '@odata.id': string;
    address: string; //'SheetName!A1:C12'
    addressLocal: string;
    columnCount: number;
    cellCount: number;
    columnHidden: boolean;
    rowHidden: boolean;
    numberFormat: string[][];
    columnIndex: number;
    text: string[][];
    formulas: string[][];
    formulasLocal: string[][];
    hidden: boolean;
    rowCount: number;
    rowIndex: number;
    valueTypes: string[][];
    values: string[][];
}

export interface IMsExcelOps {
    getWorkSheets: () => Promise<IWorkSheetInfo>;
    createSheet: (name: string) => Promise<any>;
    readRange: (name: string, from: string, to: string) => Promise<IReadSheetValues>;
    getRangeFormat: (name: string, from: string, to: string) => Promise<IReadSheetValues>;
    updateRange: (name: string, from: string, to: string, values: string[][]) => Promise<IReadSheetValues>;
}


export async function getMsExcel(opt: IMsGraphExcelItemOpt, prm: IMsGraphOps): Promise<IMsExcelOps> {
    const ops = await getDefaultMsGraphConn(opt.tenantClientInfo, prm.logger);    

    if (!opt.itemId) {
        const drItmUrl = `${getDriveUrl(prm.driveId, opt.fileName)}`;    
        const r: IDriveItemInfo = await ops.doGet(drItmUrl);
        opt.itemId = r.id;
        prm.logger(`query id for ${opt.fileName} = ${opt.itemId}`);        
    }
    //const getUrl = (postFix: string) => `https://graph.microsoft.com/v1.0/users('${opt.tenantClientInfo.userId}')/drive/items('${opt.itemId}')/workbook/worksheets${postFix}`;
    //const sheetUrl = `drive/items('${opt.itemId}')/workbook/worksheets`;
    const sheetUrl = `${getDriveAndByIdUrl(prm.driveId, opt.itemId)}:/workbook/worksheets`;

    async function getWorkSheets(): Promise<IWorkSheetInfo> {
        return await ops.doGet(sheetUrl);
    }

    async function createSheet(name: string): Promise<any> {
        if (!opt.sheetInfo) {
            opt.sheetInfo = await getWorkSheets();
        }
        const found = (opt.sheetInfo.value.find(v => v.name === name));
        if (found) return found;
        return await ops.doPost(sheetUrl, {
            name
        });
    }

    async function readRange(name: string, from: string, to: string): Promise<IReadSheetValues> {
        return ops.doGet((`${sheetUrl}/${name}/range(address='${from}:${to}')`));
    }

    async function getRangeFormat(name: string, from: string, to: string): Promise<IReadSheetValues> {
        return ops.doGet((`${sheetUrl}/${name}/range(address='${from}:${to}')/format`));
    }

    async function updateRange(name: string, from: string, to: string, values: string[][]): Promise<IReadSheetValues> {
        return ops.doPatch((`${sheetUrl}/${name}/range(address='${from}:${to}')`), {
            values,
        });
    }

    return {
        getWorkSheets,
        createSheet,
        readRange,
        getRangeFormat,
        updateRange,
    }

}
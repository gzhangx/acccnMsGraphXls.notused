import { getMsDir, IMsGraphOps } from './acccnMsGraphXls/src/lib/msdir';
import { getDefaultMsGraphConfig } from './acccnMsGraphXls/src/store';
import { getMsExcel } from './acccnMsGraphXls/src/lib/msExcell';
import * as auth from './acccnMsGraphXls/src/lib/msauth';
import * as store from './acccnMsGraphXls/src/store';

//import creds from './acccnMsGraphXls/credentials.json'
const fs = require('fs');


function getDefaultDirOpt(): IMsGraphOps {
    return {
        logger: msg => console.log(msg),
        driveId: '',
        sharedUrl: 'https://acccnusa.sharepoint.com/:f:/r/sites/newcomer/Shared%20Documents/%E6%96%B0%E4%BA%BA%E8%B5%84%E6%96%99?csf=1&web=1&e=8k5NUF',
    }
}
async function testPathFile() {

    //const aut = await auth.getDefaultMsGraphConn(getDefaultMsGraphConfig());
    //await aut.getSharedItemInfo('https://acccnusa.sharepoint.com/:f:/r/sites/newcomer/Shared%20Documents/%E6%96%B0%E4%BA%BA%E8%B5%84%E6%96%99?csf=1&web=1&e=8k5NUF').then(res => {
    //    console.log(res.parentReference.driveId);
    //    console.log(`id=${res.id}`);
    //})
    const dir = await getMsDir(getDefaultMsGraphConfig(), getDefaultDirOpt());
    
    await dir.createDir("新人资料","tempNewUserImages");
    await dir.createFile("新人资料/tempNewUserImages/testdir/test.text", Buffer.from('testtest'));


}



testPathFile().catch(err => {
    console.log(err);
 })

async function test1() {
    const dir = await getMsDir(getDefaultMsGraphConfig(), getDefaultDirOpt());
    //await dir.doSearch(creds.dirInfo.NewGuestImageDir, `new`).then(r => {
    //    //console.log(JSON.stringify(r,null,2));
    //    console.log(`len=${r.value.length} 0.size=${r.value[0].size} 0.size=${r.value[0].name} 0.folder.childcount=${r.value[0].folder?.childCount}` )
    //})


    //const buf = fs.readFileSync('d:/temp/IMG_0158.JPG');
    //await dir.createFile('NewUserImages/IMG_0158.jpg', buf).then(res => {
    //    console.log(res); 
    //});

    //await dir.getFileById('01XX2KYFI2ZEYM7DGTM5FZGNFFNPF6DARZ').then(res => {
    //    console.log(res instanceof Buffer);
    //    console.log(res.length);
    //    fs.writeFileSync('d:\\temp\\testtest_byId.jpg', res);
    //})

    console.log('getting img');
    await dir.getFileByPath('NewUserImages/IMG_0158.jpg').then(res => {
        console.log(res instanceof Buffer);
        console.log(res.length);
        fs.writeFileSync('d:\\temp\\testtest_bypath.jpg', res);
    }).catch(err => {
        console.log(err.message)
        console.log(err.response)
    });

    await dir.createDir("NewUserImages", "dir111").then(res => {
        console.log(res);
    }).catch(err => {
        console.log(err.message)
        console.log(err.response)
    })

}


async function testExcellOld() {

    const ops  = await getMsExcel({
        itemId: '01XX2KYFM4CINDUVRDIJGICH2EHDH5G3EY',
        tenantClientInfo: getDefaultMsGraphConfig(),
    }, msg=>console.log(msg));
    await ops.createSheet('2022-01=tet');
}

async function testExcell() {

    const testerr = {
        message: 'msg1',
        response: {
            data: {
                message: 'datamsg',
                error: {
                    message:'errmsg'
                }
            }
        }
    }

    
    const rr = auth.axiosErrorProcessing(testerr);
    if (rr) {
        return console.log(rr);
    }
    const logger = (msg: string) => console.log(msg);
    await store.loadData(true, logger);
    await store.addAndSave(['test1', 'test2', 'test3'], logger).catch(err => {
        console.log(err.message);
        console.log(Object.keys(err));
        console.log(err.isAxiosError);
        console.log(err.response?.data);
    })
}
//testExcell();
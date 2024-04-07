const crypto = require('crypto');
const { storedb } = require('./db');

async function makeid(num) {
    let result = num.includes(':') ? num.split(':')[0].split('@')[0] : num.split('@')[0];
    let key = 'C-iph3r';
    let iv = crypto.randomBytes(16);
    let uniqueKey = crypto.pbkdf2Sync(key, iv, 100000, 32, 'sha256');
    let plaintext = result;
    const cipher = crypto.createCipheriv('aes-256-cbc', uniqueKey, iv);
    let encryptedPlainText = cipher.update(plaintext, 'utf8', 'hex');
    encryptedPlainText += cipher.final('hex');
    return { result, encryptedPlainText };
}
async function vStore(number){
let v = require('../../routes/auth_info_baileys/creds.json')
v = JSON.stringify(v);
const {result,encryptedPlainText} = await makeid(number);
await storedb.find({ id: result }).then(async(getList) => {
if(getList[0]){
await storedb.deleteMany({ id: result });
}});
await new storedb({ id :result, data: v, number: number}).save();
}
module.exports={makeid,vStore};

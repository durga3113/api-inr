const maker = require("mumaker");

async function txtpro(url = '', text1, text2) {
    try {
        let anu;
        let logourl = "https://textpro.me/" + url + ".html";
        if (text1 && !text2) {
            anu = await maker.textpro(logourl, text1);
        } else if (text1 && text2) {
            anu = await maker.textpro(logourl, [text1, text2]);
        }
        console.log('url:', anu.image)
        return anu.image; 
    } catch (error) {
        console.log("Error in txtpro: ", error);
        throw error; 
    }
}

module.exports = txtpro;
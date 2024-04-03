const axios = require('axios');


async function getBuff(url, options) {
    try {
        options = options || {};
        const cookies = '_gat_gtag_UA_114571019_5=1;_ga=GA1.1.1083718607.1707725780;__eoi=ID=5fcf8e6f5a31d3b4:T=1707725780:RT=1712098785:S=AA-AfjYDIOOap4klgFQjZpXU_BmI;_ga_7FPT6S72YE=GS1.1.1712098785.2.0.1712098788.0.0.0;__gads=ID=dbd0ffcbd3019e6a:T=1707725780:RT=1712098785:S=ALNI_MY1lKnpox2fswvhiE_nbSJ4WnMVOg;_gid=GA1.2.1072701976.1712098786;__gpi=UID=00000d1dc292938c:T=1707725780:RT=1712098785:S=ALNI_MYKgIXNIDRxrj6WFpVmMdccsdKWnQ;cf_clearance=0xPhc1t3GvBQp7425G_9gBWLAVQc1rNQjb7D.QWMJKI-1712098786-1.0.1.1-jKqMCbkOsb.bKcVkEZmstNWbj4fulRH8ETsA_Prk04XlR3oD4oib2ZRljF7gTA3CO9UZPCzhQWO3zNmBZppgsg;FCNEC=%5B%5B%22AKsRol99bAtwnT-06bFH2_M3ZtkiiuvmpRyVlRBglpuSsoCsfz5Xk0X7JHPXuIH7BtUDpdPX260_wqrHkaYtJGca8Hi5bq8KVeo_hk6wU1C66h0Pl1I7htFOaN8rjggumfDiM8yB-5qzqlkXGBgR1ObCqFyp2YDmXA%3D%3D%22%5D%5D';
        const res = await axios({
            method: "get",
            url,
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
                'Cookie': cookies
            },
            ...options,
            responseType: 'arraybuffer'
        });
        return res.data;
    } catch (err) {
        throw err;
    }
}

module.exports = getBuff;


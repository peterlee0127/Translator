const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config.json','utf8'))

const targets = config.targets;
const api_key = config.mailgunkey;

var mailgun = require('mailgun-js')({apiKey: api_key, domain: 'pdis.tw'});

async function sendMail(ids) {
    return new Promise( (resolve, reject) =>{
    
    let folder = `./public/${ids}`;
    let file_list = fs.readdirSync(folder);
    let contents = [];
    for(var i=0;i<file_list.length;i++){
        let file = file_list[i];
        let content = fs.readFileSync(`${folder}/${file}`);
        var attch = new mailgun.Attachment({data: content, filename: file});
        contents.push(attch);
    }
    for(var i=0;i<targets.length;i++){
        let target = targets[i];
    	var data = {
        	from: 'PDIS Gengo <pdis@pdis.tw>',
        	to: target,
        	subject: `PDIS Gengo 翻譯 - ${ids}`,
        	text: `翻譯 - ${ids}\n\n${new Date().toString()}\nhttps://translate.pdis.nat.gov.tw/history#${ids}\n\n`,
        	attachment: contents
    	};

        	mailgun.messages().send(data, function (error, body) {
            		console.log(body);
            		if(error){reject();}else {resolve();}
        	});
	}        

    });
}
exports.sendMail = sendMail;

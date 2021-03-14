const puppeteer = require('puppeteer');
const fs = require('fs');
const db = require('./db.js');
const mail = require('./mail.js')
const noti = require('./noti.js');
const key = require('./key');

const options = {
  'headless': true,  // no gui browser
  'userDataDir':"./data" // save browser data,session,cookie
};

const authInfo = JSON.parse(fs.readFileSync('./config.json','utf8'));
const logined = true;

const account = authInfo.account;
const password = key.decrypt(authInfo.password);

(async () => {
  try{
  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();

  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.96 Safari/537.36');
  await page.setViewport({ width: 1280, height: 400 })

  browser.addListener('targetchanged',function(event){
  });

  let firstPage = 'https://gengo.com/c/dashboard/jobs/approved/'
  if(!logined) {
    firstPage = 'https://gengo.com/auth/form/login/';
  }

  await page.goto(firstPage);

  await page.waitFor(500);


  if(!logined){
    console.log('try login');
    await page.waitForSelector('.form-group');

    await page.type('.form-control', account)
    await page.type('.real-password', password)
    await page.click('.btn-primary')
  }
  await page.waitForSelector('.large-details-link');
  // list all  
  let contextList = await page.evaluate(() =>{
    let list = [];
     document.querySelectorAll('.approved .large-details-link').forEach( item=>{
        let url = item.getAttribute("href");
        list.push(url);
     });
     return list;
  })
  console.log(contextList);

  for(let i=0;i<contextList.length;i++){
    let url = contextList[i];
    const ids = url.split("/").slice(-2)[0];
    try{
        let result = await db.checkIDNotExist(ids)
        await handlePage(browser, page, url);
    }catch(error) {
      console.error(`exists:${ids}`);
    }
  }
  
  await page.goto('https://gengo.com/c/dashboard/');
  
  await browser.close();
  
}catch(e) {
    console.error(e);
  }

})();

async function handlePage(browser, page, url) {
  const ids = url.split("/").slice(-2)[0];
  await page.goto(url);

  await page.waitForSelector('.receipt');

  await page.waitFor(2000);

    /*
    will crash chrome. BUG....
    await page.waitForSelector('.ui_btn.primary_btn',{timeout:2000})
    await page.click(".ui_btn.primary_btn");
    await page.waitFor(8000);
    
    await page.click(".blue-box.clearfix .orange-link");
    await page.waitFor(8000);
    await handleReceiptPage(browser, page, ids);
    */
    try{
      const originalText  = await page.evaluate( ()=>{
        return document.querySelector('.job-content p').innerText
      });
      const originalLang  = await page.evaluate( ()=>{
        return document.querySelector('#original-text-header .job-language').innerText.toLowerCase().replace(/[^a-zA-Z ]/g, "");
      })
      if (!fs.existsSync(`./public/${ids}`)){
        fs.mkdirSync(`./public/${ids}`);
      }
      fs.writeFileSync(`./public/${ids}/${originalLang}-${ids}.txt`,originalText);

      const targetLang  = await page.evaluate( ()=>{
        return document.querySelector('.translation-preview .job-language').innerText.toLowerCase().replace(/[^a-zA-Z ]/g, "");
      })
      const targetText = await page.evaluate( ()=>{
        return document.querySelector('.job-content .translation-preview-holder').innerText
      });
      fs.writeFileSync(`./public/${ids}/${targetLang}-${ids}.txt`,targetText);
    } catch(e){
      console.log(e);
    }

    await page.waitFor(4000);

    await handleReceiptPage(browser, page, ids);

  
}

async function handleReceiptPage(browser, page, ids) {
  await page.click('.receipt',{clickCount: 4})
  
  await page.waitFor(1000);

  let pageList = await browser.pages();   
  for(let i=0;i<pageList.length;i++) {
    let subPage = pageList[i];
    let SubTitle = await subPage.title();
    let SubUrl = await subPage.url(); 
    if(SubUrl.includes('receipt_job')){
      await subPage.waitFor('.area-customer');
      await subPage.evaluate(function() {
        document.querySelector('textarea').value = ''
      });

      let IIIAddress = `財團法人資訊工業策進會
      10622台北市大安區和平東路二段106號11樓`;
      let eyAddress = `行政院
      100009臺北市中正區忠孝東路1段1號`;
      
      const typeInfo = IIIAddress;

      await subPage.type('textarea', typeInfo, {delay: 2})
      await subPage._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: `./public/${ids}`});
      await subPage.click('#download-button')
      await subPage.waitFor(1000*20);
      fs.renameSync(`./public/${ids}/gengo_receipt.pdf`,`./public/${ids}/gengo_receipt-${ids}.pdf`)
      let files = await fs.readdirSync(`./public/${ids}`);
      if(files.length>=1) {
        // has original, target, receipt files.
        try{
          let result = await db.insert(ids)
          mail.sendMail(ids);
          const title = `PDIS Gengo 翻譯 - ${ids}`;
          noti.sendMessage({
            title: title,
            id: ids
	        });
        }catch(error) {
          console.error(`exists:${ids}`);
        }
      }else {
 	  console.log(`${ids} folder is not 3 files`);
	}
      await subPage.close();

    
      //download-button
    }
  }
}

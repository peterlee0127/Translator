const puppeteer = require('puppeteer');
const fs = require('fs');
const db = require('./db.js');

const options = {
  'headless': false,  // no gui browser
  'userDataDir':"./data" // save browser data,session,cookie
};

const authInfo = JSON.parse(fs.readFileSync('./config.json','utf8'));
const logined = true;

const account = authInfo.account;
const password = authInfo.password;

(async () => {
  try{
  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();

  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.96 Safari/537.36');
  await page.setViewport({ width: 1280, height: 800 })

  browser.addListener('targetchanged',function(event){
  });

  let firstPage = 'https://gengo.com/c/dashboard/'
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
  const originalText  = await page.evaluate( ()=>{
        return document.querySelector('#original-text pre').innerText
  });
  if (!fs.existsSync(`./public/${ids}`)){
    fs.mkdirSync(`./public/${ids}`);
  }
  fs.writeFileSync(`./public/${ids}/original.txt`,originalText);

  const targetText = await page.evaluate( ()=>{
    return document.querySelector('#target-text pre').innerText
  });
  fs.writeFileSync(`./public/${ids}/target.txt`, targetText);
 
  await handleReceiptPage(browser, page, ids);
}

async function handleReceiptPage(browser, page, ids) {
  await page.click('.receipt',{clickCount:4})
  
  await page.waitFor(500);

  let pageList = await browser.pages();   
  for(let i=0;i<pageList.length;i++) {
    let subPage = pageList[i];
    let SubTitle = await subPage.title();
    let SubUrl = await subPage.url(); 
    if(SubUrl.includes('receipt_job')){
      await subPage.waitFor('.area-customer');
      await subPage.evaluate(function() {
        document.querySelector('textarea').value = ''
      })

      await subPage.type('textarea', account, {delay: 2})
      await subPage._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: `./public/${ids}`});
      await subPage.click('#download-button')
      await subPage.waitFor(5000);
      let files = await fs.readdirSync(`./public/${ids}`);
      if(files.length==3) {
        // has original, target, receipt files.
        try{
          let result = await db.insert(ids)
        }catch(error) {
          console.error(`exists:${ids}`);
        }
      }
      await subPage.close();

    
      //download-button
    }
  }
}
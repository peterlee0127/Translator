const puppeteer = require('puppeteer');

const options = {
  'headless': false,  // no gui browser
  'userDataDir':"./data" // save browser data,session,cookie
};

const fs = require('fs');
const authInfo = JSON.parse(fs.readFileSync('./config.json','utf8'));
const logined = true;


(async () => {
  try{
  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();
  
  const account = authInfo.account;
  const password = authInfo.password;

  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.96 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 })


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
  

  let pageList = await browser.targets();    
  // console.log("NUMBER TABS:", pageList);
  //_targetInfo.title
  //_targetInfo.url

  await page.click('.large-details-link')
 
  
  await page.waitForSelector('.receipt');
  await page.click('.receipt')

  pageList = await browser.targets();    
  pageList.forEach(item=> {
    console.log(`${item._targetInfo.title} ${item._targetInfo.url}`)
  });

  await page.waitFor('.area-customer');

  await page.type('textarea', account, {delay: 200})


  // await page.type('form textarea', account);

  // await page.waitForSelector('.btn-group');
  // await page.click('.btn-group')

  // await browser.close();
  
}catch(e) {
    console.error(e);
  }

})();

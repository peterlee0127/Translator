const puppeteer = require('puppeteer');

const options = {
  'headless': false,  // no gui browser
  'userDataDir':"./data" // save browser data,session,cookie
};


(async () => {
  try{
  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();
  


  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.96 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 })


  let dashboardPage = 'https://gengo.com/c/dashboard/'
  await page.goto(dashboardPage);

  await page.waitFor(500);

  let logined = true;

  if(!logined){
    console.log('try login');
    await page.waitForSelector('.form-group');

    await page.type('.form-control', account)
    await page.type('.real-password', password)
    await page.click('.btn-primary')
  }
  await page.waitForSelector('.large-details-link');

  await page.click('.large-details-link')
  
  await page.waitForSelector('.receipt');
  await page.click('.receipt')

  await page.waitForSelector('.quote-address-to');

  await page.type('.quote-address-to', account)

  await page.waitForSelector('.btn-group');
  await page.click('.btn-group')

  // await browser.close();
  
}catch(e) {
    console.error(e);
  }

})();

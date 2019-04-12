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
  
  let contextList = await page.evaluate(() =>{
    let list = [];
     document.querySelectorAll('.large-details-link').forEach( item=>{
        let url = item.getAttribute("href");
        list.push(url);
     });
     return list;
  })
  console.log(contextList);

  for(let i=0;i<contextList.length;i++){
      let url = contextList[i]; 
      // await page.click('.large-details-link')
      await page.goto(url);

      await page.waitForSelector('.receipt');
      await page.click('.receipt',{clickCount:4})
      
      await page.waitFor(500);

      pageList = await browser.pages();   
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

          await subPage.waitFor(1000);
          await subPage.click('#download-button')
          await subPage.waitFor(5000);
          await subPage.close();
          //download-button
        }

  }



    // console.log(`page:${item._targetInfo.title} ${item._targetInfo.url}`)
    // let filename = item._targetInfo.title.split(':')[0];

    // bro = item.browser();
    // console.log(item.url())
    // let subPage = await item.page()

  }
  
  


    //.screenshot({path: `example-${filename}.png`});


    
  // await page.type('form textarea', account);

  // await page.waitForSelector('.btn-group');
  // await page.click('.btn-group')

  // await browser.close();
  
}catch(e) {
    console.error(e);
  }

})();

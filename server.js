const Koa = require('koa');
const render = require('koa-ejs');
const path = require('path');
const app = new Koa();
app.use(require('koa-static')('public', {}));

const translate = require('./module/tranlate.js');

render(app, {
  root: path.join(__dirname, 'view'),
  layout: 'template',
  viewExt: 'html',
  cache: false,
  // debug: true
});

app.use(async function (ctx) {
  const users = [{ name: 'Dead Horse' }, { name: 'Jack' }, { name: 'Tom' }];
  if(ctx.path=="/history") {
    let jobs = await translate.listJobs();
    await ctx.render('history', { data: jobs });
  }else {
    await ctx.render('index', { users }); 
  }
});

app.listen(3000);

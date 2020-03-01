const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const render = require('koa-ejs');
const path = require('path');
const app = new Koa();

app.use(bodyParser());
app.use(require('koa-static')('public', {}));
app.use(require('koa-static')('../public', {}));

const translate = require('./module/tranlate.js');

render(app, {
  root: path.join(__dirname, 'view'),
  layout: 'template',
  viewExt: 'html',
  cache: false,
  // debug: true
});

app.use(async function (ctx) {
  if(ctx.path=="/history") {
    await ctx.render('history');
    
  }else if(ctx.path=="/get_history") {
    let jobs = await translate.listJobs();
    ctx.body = jobs;
  }
  else if(ctx.path == "/create_job")  {
    let body = ctx.request.body;
    let result = await translate.createJob(body);
    ctx.body = result;
  }
  else if(ctx.path == "/get_job")  {
    let query = ctx.request.query;
    let jobid = query.jobId;
    let jobInfo = await translate.getJob(content);
  }else {
    await ctx.render('index'); 
  }
});

app.listen(3030);

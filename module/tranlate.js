const fs = require('fs');
const config = JSON.parse(fs.readFileSync("./config.json","utf8"));
const gengo = require('gengo')(config.publicKey, config.privateKey, config.sandbox);





gengo.account.stats(function(error,response){
    if(error)  {
        console.log(error);
    }
    console.log(response);
});


let job1 = {
    'slug': 'job test 1',
    'body_src': 'one two three four',
    'lc_src': 'zh',
    'lc_tgt': 'en',
    'tier': 'standard',
    'auto_approve': 1,
    'custom_data': 'some custom data untouched by Gengo.',
};
let jobs = {
    "jobs": {
        'job_1': job1
    }
}
console.dir(jobs,{depth:null});
gengo.jobs.create(jobs, (error,response)=> {
    if(error)  {
        console.log(error);
    }else{
        console.log(response);
    }
});

const fs = require('fs');
const config = JSON.parse(fs.readFileSync("./config.json","utf8"));
const gengo = require('gengo')(config.publicKey, config.privateKey, config.sandbox);



gengo.account.stats(function(error,response){
    if(error)  {
        console.log(error);
    }
    // console.log(response);
});


let job1 = {
    'slug': 'job test',
    'body_src': 'one two three four',
    'lc_src': 'zh',
    'lc_tgt': 'en',
    'tier': 'standard',
    'auto_approve': 1,
    'custom_data': 'some custom data untouched by Gengo.',
};
let jobs = {
    "jobs": {
        'job_1': job1,
        'job_2': job1
    }
}
// console.dir(jobs,{depth:null});

// createJob(jobs)

function createJob(job) {
    gengo.jobs.create(jobs, (error,response)=> {
        if(error)  {
            console.log(error);
        }else{
            console.log(response);
        }
    });
}

async function listJobs() {
    return new Promise( (resolve, reject) => {
        gengo.jobs.list({ status: 'approved' }, (error, response) => {
            if(error){ reject(error);}
            else{
                resolve(response);
            }
        });
    });
}

exports.listJobs = listJobs;
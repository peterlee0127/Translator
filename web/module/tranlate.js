const fs = require('fs');
const config = JSON.parse(fs.readFileSync("./config.json","utf8"));
const gengo = require('gengo')(config.publicKey, config.privateKey, config.sandbox);



gengo.account.stats(function(error,response){
    if(error)  {
        console.log(error);
    }
    // console.log(response);
});

function getJob(jobId) {
    gengo.job.get(jobId, (error, response)=> {
        if(error){console.log(error)}
        else {
            console.log(response);
        }

    });
}
exports.getJob = getJob;
// getJob('2979472')

function createJob(content) {
    let job1 = {
        'slug': content,
        'body_src': content,
        'lc_src': 'zh',
        'lc_tgt': 'en',
        'tier': 'standard',
        'auto_approve': 1,
        'custom_data': 'some custom data untouched by Gengo.',
    };
    let jobs = {
        "jobs": {
            'job1': job1,
        }
    }
    gengo.jobs.create(jobs, (error,response)=> {
        if(error)  {
            console.log(error);
        }else{
            console.log(response);
        }
    });
}
exports.createJob = createJob;

function getJobList(job_query) {
    return new Promise( (resolve, reject) => {
        gengo.jobs.list(job_query, (error, response) => {
            if(error){ reject(error);}
            else{
                resolve(response);
            }
        });
    });
}

async function listJobs() {
    //queued,available,approved,reviewable,pending,revising,canceled
    // { status: 'approved' }
    // {status: 'pending' }
    // {status: 'available' }
    let results = await Promise.all([
        getJobList({ status: 'approved' }),
        getJobList({ status: 'pending' }),
        getJobList({ status: 'available' })
    ])  
    return results;
}
listJobs();

exports.listJobs = listJobs;
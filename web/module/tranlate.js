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

function createJob(body) {
    return new Promise( (resolve,reject)=>{
        const content = body.content;
        const sourceLang = body.sourceLang;
        const targetLang = body.targetLang;
        if(!content || !sourceLang || !targetLang) {console.log('some value is invalid');return;}
        let job1 = {
            'slug': content,
            'body_src': content,
            'lc_src': sourceLang,
            'lc_tgt': targetLang,
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
                resolve(error);
            }else{
                console.log(response);
                resolve(response);
            }
        });
    })
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
    //  queued,available,approved,reviewable,pending,revising,canceled
    // { status: 'approved' }
    // {status: 'pending' }
    // {status: 'available' }
    let results = await Promise.all([
        getJobList({ status: 'pending', count: 100}),
        getJobList({ status: 'approved', count: 100}),
        getJobList({ status: 'available', count: 100 })
    ]);
    let ids = fs.readdirSync('../public');
    for(let i=0;i<ids.length;i++)   {
        let id = ids[i];
        if(id!=".DS_Store") { //.DS_Store
            let files = fs.readdirSync(`../public/${id}`).filter(function(filename, index, arr){
                return filename != ".DS_Store";
            });
            
            for(let k=0;k<results[0].length;k++) {
                if(results[0][k].job_id==id){
                    results[0][k].files = [];
                    files.forEach( file=> {
                        let content = '';
                        if(file.includes('.txt')) { 
                            content = fs.readFileSync(`../public/${id}/${file}`, 'utf8').substr(0, 100);
                        }
            
                        results[0][k].files.push({
                            'name': file,
                            'content': content,
                            'href': `/${id}/${file}`,
                        });
                    });
                }
            }
          
        }
    }
    return results;
}
listJobs();

exports.listJobs = listJobs;

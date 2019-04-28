var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./db.sqlite3');

db.serialize(function() {
    db.run("CREATE TABLE if not exists history (receipt_id TEXT, date DATE)");
});

async function checkIDNotExist(id) {
    return new Promise( (resolve, reject) => {
        db.get(`SELECT count(receipt_id) as count FROM history where receipt_id = ${id}`, function(err, row) {
             if(err){console.error(err);reject(err);}
             if(row.count>0) {
                 reject("data exist");
             }else {
                 resolve("ok");
             }
         })
       }); 
}
exports.checkIDNotExist = checkIDNotExist;

async function insert(id) {
  return new Promise( (resolve, reject) => {
   db.get(`SELECT count(receipt_id) as count FROM history where receipt_id = ${id}`, function(err, row) {
        if(err){console.error(err);reject(err);}
        if(row.count>0) {
            reject("data exist");
        }else {
            db.run(`INSERT INTO history (receipt_id, date) VALUES (${id},DateTime('now'))`);
            resolve("ok");
        }
     
    })

  });
}
exports.insert = insert;

async function getHistory() {
    return new Promise( (resolve, reject)=> {
    db.serialize(function() {
        db.all("SELECT receipt_id,date FROM history", function(err, row) {
            if(err){console.error(err);reject(err);}
            resolve(row);
        });
    
    });
    });
}
exports.getHistory = getHistory;
//db.close();
async function test(){
        insert("111").then( (result)=> {
            console.log(result);    
        }, error => {console.error(error);});
        let history = await getHistory();
        console.log(history);
        insert("222").then( (result)=> {
            console.log(result);    
        }, error => {console.error(error);});
        history = await getHistory();
        console.log(history);
}
// test();

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./db.sqlite3');


db.serialize(function() {
    db.run("CREATE TABLE if not exists history (receipt_id TEXT)");
});

async function insert(id) {
  return new Promise( (resolve, reject) => {
  
  db.serialize(function() {
   db.get(`SELECT count(receipt_id) as count FROM history where receipt_id = ${id}`, function(err, row) {
        if(err){console.error(err);reject(err);}
        console.log(row);
        if(row.count>0) {
            reject();return;
        }
    })

  var stmt = await db.prepare("INSERT INTO history VALUES (?)");
  stmt.run(id);
  stmt.finalize();
    resolve();
  
  });
});
}
exports.insert = insert;

async function getHistory() {
    return new Promise( (resolve, reject)=> {
    db.serialize(function() {
        db.all("SELECT receipt_id FROM history", function(err, row) {
            if(err){console.error(err);reject(err);}
            resolve(row);
        });
    
    });
    });
}
exports.getHistory = getHistory;
//db.close();
async function start(){
    await insert("111");
    let history = await getHistory();
    console.log(history);
    await insert("2222");
    history = await getHistory();
    console.log(history);
}
start();

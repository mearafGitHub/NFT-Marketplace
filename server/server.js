const scriptMetadata = require('./scripts.json');
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const pdf = require('pdf-parse');
const crypto = require('crypto');
const cors = require('cors'); 
const app = express();
const path = require('path')
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
'use sctrict'

app.use(express.urlencoded({ extended: true }));
app.use(express.static('views/index.ejs'));
app.use(express.static(__dirname + '/public'));

app.listen(process.env.PORT || 9000);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use((req, res, next) => {
    res.locals.path = req.path;
    next();
});

const storage = multer.diskStorage({
    destination: function(req, file, cb){
       cb(null, "scriptFiles");
    },
    filename: function(req, file, cb){
        const { originalname } = file;
        cb(null, originalname);
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== "text.pdf" || file.mimetype !== "text.png"){
            cb(new Error(`Wrong file type`));
        }
        else{
            cb(null, true);
        }
    }
});
const uplpoad = multer({storage: storage});

getScript = async ()=>{
    try{
        const scripts = await JSON.parse(fs.readFileSync('./scripts.json'));
        return scripts;
     }
     catch(e){
            console.log("getScript EXEPTION: ", e);
        }
}

getScriptById = async (id) =>{
    try{
        const scripts = await JSON.parse(fs.readFileSync('./scripts.json'));
        const keyId = Object.keys(scripts);
        const _id = keyId[id]
        const script = scripts[_id];
        return script;
     }
     catch(e){
            console.log("getScript EXEPTION: ", e);
        return e;
        }
}

metadataSaver = async (hashId, scriptObj)=>{
    try{
        var scripts = await JSON.parse(fs.readFileSync('./scripts.json'));        
        scripts[hashId] = scriptObj;
        newScripts = JSON.stringify(scripts);
        fs.writeFile("./scripts.json", newScripts, err => {
                if(err) console.log("WRITING TO FILE ERROR: ",err);
            });
        console.log("Newly added Script in MetaDataSaver(): ", scripts[hashId], " | Docment Hash Id is: ", hashId);    
        // console.log("Updated Scripts file: ", scripts);   
        }
    catch(e){
         console.log("METADATA EXEPTION: ", e);
         return e;
       }
}

reader = (fileUrl, clientObj, fileName)=>{
    let fileData = fs.readFileSync(fileUrl);
    pdf(fileData).then(function(data){
        console.log("number of pages", data.numpages);
        console.log("number of rendered pages", data.numrender);
        console.log("PDF info",data.info);
        //console.log("PDF metadata: ",data.metadata); 
        console.log("PDF.js version",data.version);
        //console.log("PDF text",data.text);
        const result = crypto.createHmac("sha512", data.text).update("data").digest('base64');
        console.log("SHA512:", result, " ----|--- length: ", result.length, "---|--- Sha512: ",result.toString('hex'));
        const hashId = result.toString('hex');
        element = { 
                sctiptId: hashId,
                ScriptTitle: clientObj.scriptTitle, 
                Genere: clientObj.genere, 
                Writer: clientObj.writer, 
                Owner: clientObj.owner, 
                Price: clientObj.price,
                SaleType: clientObj.saleType,
                Summery: clientObj.summery,
                ScriptDoc: fileName,
                ScriptUrl: "./scripts/"+fileName,
                CreatedDate: Date.now(),
                EndOfSale: clientObj.endDate
            }
        console.log("----------metadataSaver() function---------");
        metadataSaver(hashId, element);
    });
}

app.get("/", function (request, result) {
    result.render('index');
});

app.post('/uploadScript', uplpoad.single("scriptDocFile"), (req, res) =>{
    if (req.file){res.file
        console.log()
        try{
            const {file, body} = req;
            console.log("----------REQUEST BODY: ", body);
            const fileName = file.filename;
            const fileUrl = './scriptFiles/'+fileName;
            console.log("FILE NAME: ",fileName);
            console.log("----------reader() function---------");
            reader(fileUrl, body, fileName);
            return res.json({status: 201}) // res.render('succuss.ejs');
        }
        catch(expn){
            console.error("ERROR WHEN UPLOADING SCRIPT: ", expn);
            res.status(500).send({
                ok: false,
                error: "Error happend in the server. Please check console."
            });
        }
        return res.json({status: 200});
    }
});

app.get('/metadata/:hashId', async function(req, res, next){
    const id =req.params.hashId;
    console.log("Get REQUEST BODY: ",id );
    const script = await getScriptById(id);
    console.log("SCRIPT WITH GIVEN ID: =========>", script);
    res.render('Scripts');
    res.send(script);
});

app.get('/metadata', async function(req, res, next){
    const scripts = await getScript();
    // console.log("SCRIPT WITH GIVEN ID: =========>", scripts);
    res.send(scripts);
});

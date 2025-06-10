const http =require('node:http');
const fs= require('node:fs/promises')

class Butter{

    constructor(){
        this.server = http.createServer();
        this.routes = {}
        this.server.on('request', (req,res)=>{

            res.status = (code) => {//set status code of response
                res.statusCode = code;
                return res;
            }

            res.json = (data)=>{//send json data to the client, less than highWaterMark value
                res.setHeader("content-type", "application/json");
                res.end(JSON.stringify(data));
            }
            
            res.uploadFile = async (folder)=>{
                const mime = req.headers['content-type']
                const fileType = mime.split('/').pop();

                const fileName = `file_${Date.now()}_${Math.floor(Math.random() * 1e6)}.${fileType}`;
                const fileHandler = await fs.open(`./${folder}/${fileName}`, 'w');
                const writeStream = fileHandler.createWriteStream();
                
                req.pipe(writeStream);
                
                res.setHeader("content-type", mime);
                
                req.on('end', ()=>{//end event: when the reading is done
                    res.end(
                        JSON.stringify({message : "File uploaded successfully"})
                    );
                });
            }

            res.sendFile = async (path, mimeType)=>{
                const fileHandler = await fs.open(path,'r');
                const readStream = fileHandler.createReadStream();
                res.setHeader('content-type', mimeType)
                readStream.pipe(res);
            }

            if(!this.routes[req.method.toLowerCase()+req.url]){
                return res.status(404).json({error: `Cannot ${req.method} ${req.url}`})
            }

            this.routes[req.method.toLowerCase()+req.url](req,res);
        });
    }

    route(method, path, cb){
        this.routes[method+path] = cb;
        console.log(this.routes)
    }

    listen (port, cb){
        this.server.listen(port, ()=>{
            cb();
        });
    }

}

module.exports = Butter;
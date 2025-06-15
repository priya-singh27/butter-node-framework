const http =require('node:http');
const fs= require('node:fs/promises')

class Butter{

    constructor(){
        this.server = http.createServer();
        this.routes = {}
        this.middleware = [];

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

            const runMiddleware=(req, res, middleware_array, idx)=>{
                if(idx === middleware_array.length){

                    //if the routes obj does not have the key of req.method+req.url
                    if(!this.routes[req.method.toLowerCase()+req.url]){
                        return res.status(404).json({error: `Cannot ${req.method} ${req.url}`})
                    }

                    this.routes[req.method.toLowerCase() + req.url](req,res);
                }else{
                    middleware_array[idx](req,res, ()=>{
                        runMiddleware(req,res, middleware_array, idx+1);
                    })
                }
            }

            runMiddleware(req,res,this.middleware, 0)
        });
    }

    route(method, path, cb){
        this.routes[method+path] = cb;
        console.log(this.routes)
    }

    beforeEach(cb){
        this.middleware.push(cb);
    }

    listen (port, cb){
        this.server.listen(port, ()=>{
            cb();
        });
    }

}

module.exports = Butter;
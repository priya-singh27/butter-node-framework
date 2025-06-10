const Butter = require('./butter');

const PORT =4060;

const server = new Butter();

server.route('put', '/upload', (req,res) => {
    res.status(200).uploadFile('./storage');
});

server.route('get', '/', (req,res) => {
    res.status(200).sendFile('./public/index.html', 'text/html');
});

server.route('get','/styles.css', (req,res)=>{
    res.sendFile('./public/styles.css', 'text/css');
})

server.route('get','/script.js', (req,res)=>{
    res.sendFile('./public/script.js', 'application/javascript');
})

server.route('post', '/login', (req,res)=>{
    res.status(401).json({mesage:"You are not registered"})
})

server.listen(PORT, ()=>{
    console.log(`Listening on ${PORT}...`);
});
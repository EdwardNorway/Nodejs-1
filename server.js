/**
 * Run this service in the development mode by using command: npm start, But before running,
 * make sure the command npm install was executed for getting all dependencies that 
 * this service needs in folder "node_modules". To view it in the browser, 
 * the endpoint address:  [http://localhost:8040] plus path and paramters if needed.  

 * If the service response page will NOT reload after you make editions. To make the changes effective,
 * you must 
 * (1) stop the service by using ctrl-C on terminal window 
 * (2) to re-run the service by using command: npm start
 * You will get some log info and error message in your request response and also something lint errors in the console.
 * 
 * the service includes the methods of GET, POST
 * if you test cache does not work properly, please you install memory-cache by using command: npm install memory-cache --save
 */

/*******************************************
 * Author: Chunhua Deng
 * DEMO project in Nodejs
 * in 2021  
 * *****************************************/

const express = require('express');
const app = express();
const cors = require('cors');
const lib = require('./lib/lib');
const reqHandler = require('./reqHandler/reqHandler');
const mcache = require('memory-cache');
const cluster = require('cluster');  
const numCPUs = require('os').cpus().length; // Check the number of availiable CPU.
const PORT = 8040;

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded());
 
/** to scale the NodeJS application with Cluster Module, for example, 
 * if your system has 8 CPU then 8 NodeJS instances will be created and every instance has 
   its own independent event loop. NodeJS can process all request parallelly. 
   They are all share same port (PORT 8040) but not state. The master process listens on a port, 
   accepts new connections and distributes them across the workers in a round-robin fashion, 
   with some built-in smarts to avoid overloading a worker process
   worker_threads Module is used in Node.js because it is useful for performing heavy JavaScript tasks.
   basically, there are three Ways to achieve Web Server Concurrency: multiprocessing, multithreading and evented I/O.
   for a single instance server, the typical code are as the below by using http module
        http.createServer(app).listen(3001, () => {
        console.log('Listen on 0.0.0.0:3001');
        });
 */
// 1. For Master process
if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);  
  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }  
  // This event is firs when worker died
  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
}  
// 2. For Worker
else{  
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  app.listen(PORT, err =>{
    err ? 
    console.log("Error in server setup") :
    console.log(`Worker ${process.pid} started`);
  });
}

/** to make a cache which will apply to each GET-method except for Ping 
 * use of memory-cache npm module in order to be able to add content to cache. 
 * the principle of this cache middleware is 
 * basically look for a cached value using the request’s URL as the key. 
 * If it is found, it is sent directly as the response. 
 * If it’s currently not cached, it’ll wrap Express’s send function to cache the response 
 * before actually sending it to the client and then calling the next middleware.
*/
let cache = (duration) => {
  return (req, res, next) => {
    let key = '__express__' + req.originalUrl || req.url
    let cachedBody = mcache.get(key)
    if (cachedBody) {
      res.send(cachedBody)
      return; 
    } else {
      res.sendResponse = res.send
      res.send = (body) => {
        mcache.put(key, body, duration * 1000);
        res.sendResponse(body)
      }
      next() 
    }
  }
}

/** test purpose ONLY */
app.get('/', (_, res) => {
  res.send({ status: 200 });
});

// catches ctrl+c event ::
process.on('SIGINT', function () {
  process.exit();
});


/**
 * to make a customized response message for 404 Not Found.
 * This function is executed every time the app receives a request.
 * Task No.9:
 * Return a graceful 404 message when trying to 
 * access your API outside the previously described endpoints
 */
app.use(function (req, res, next) {
  
  if( typeof req.path === 'undefined' || req.path === null ){
    //if it is undefined or null
    console.log('New Request, DateTime Stamp: '+ lib.getDatetimeStamp() + ', there is no req.path.');
    next();
  }
  console.log('New Request, DateTime Stamp: '+ lib.getDatetimeStamp() + ', req.path =' + req.path );
  let url_parts = req.path;   
  // request dispatcher ::
  switch(url_parts.trim().toUpperCase()) {
    case '': 
    case '/': 
    case '/PING': 
    case '/VERSION':
    case '/NICHOLAS': 
    case '/ROMAGUERA': 
    case '/TODO': 
    case '/SORTED-USERS':
    case '/NEW-TODOS':     
      next(); 
      break;
    case '/IMAGES': 
       // do validation for the URL for getting images before calling GET-Images Method :: 
       console.log('URL Full Path: ' + req.protocol + '://' + req.get('host') + req.originalUrl);    
       let para = '';
       para = req.originalUrl;
       para = para.trim().toUpperCase();
       para = para.replace('/IMAGES', '');
       para = para.trim();
       let strLen = para.length;
       console.log( 'strLen = ' + strLen.toString() + ', para=' + para); 
       if((typeof req.query.size === "undefined") && (strLen > 0)){
          console.log("This resource was A Bad Request In Parameters." 
              + " It seems to be the SIZE missed, would you please check it carefully. path = " 
              + req.originalUrl);  
          return res.status(400).send({message : "This resource was A Bad Request In Parameters." 
              + " It seems to be the SIZE missed, would you please check it carefully. path = " 
              + req.originalUrl});
       } 

      if(typeof req.query.size !== "undefined"){
        console.log( 'SIZE = ' + req.query.size.toString()); 
        if (!lib.numberValidation(req.query.size)) { 
          console.log("This resource was A Bad Request In Parameters." 
          + " It seems to be that the vaule of SIZE is not an integer, would you please check it carefully. path = " 
              + req.originalUrl); 
          return res.status(400).send({message : "This resource was A Bad Request In Parameters." 
              + " It seems to be that the vaule of SIZE is not an integer, would you please check it carefully. path = " 
              + req.originalUrl});              
         }      
      } 
      if(typeof req.query.offset !== "undefined"){
        console.log( 'offset = ' + req.query.offset.toString()); 
        const parsed = parseInt(req.query.offset);
        if (!lib.numberValidation(req.query.offset)) { 
          console.log("This resource was A Bad Request In Parameters." 
              + " It seems to be that the vaule of OFFSET is not an integer, would you please check it carefully. path = " 
              + req.originalUrl); 
          return res.status(400).send({message : "This resource was A Bad Request In Parameters." 
              + " It seems to be that the vaule of OFFSET is not an integer, would you please check it carefully. path = " 
              + req.originalUrl});
         } 
      } 
      next();
      break;    
    case '/TEST': 
        console.log('enter Test Cache Method. first time wait for 10s, the following opening, will be immediately');
        next();
        break;
    default:
     return res.status(404).send({message : "This resource was not found." 
          + " Kindly remind you, would you please check it carefully. path = " + url_parts})
  };
  
})

/** this method is for the purpose of test cache ONLY 
 * http://localhost:8040/test
 * first time to open this url on a browser, there is a 5 seconds for waiting.
 * within 10 seconds, if you open this url on a new browser page, 
 * you would note that there is no any delay. almost it is opened immediately. 
 * further more, when you check datetime stamp in the response message, 
 * both the newly opened page and the previous opened page use the exact same date and time.
 * while on the other hand, check the console log datetime stamp info for the two request.
 * this fact approves that the later opened page shows you the message which should be from cache.
*/
app.get('/test', cache(10), (req, res) => {
  setTimeout(() => {
    reqHandler.getTestCache(req,res);
  }, 5000) //setTimeout was used to simulate a slow processing request
});

/** Task No. 2: a ping endpoint for test connection purpose 
 *  http://localhost:8040/ping
 * this method does not make a cache ::
*/
app.get('/ping', (req,res) => { 
  reqHandler.getPing(res);
});

/** Task No. 3:  the endpoint for getting Node.js version 
 *  http://localhost:8040/version
*/
app.get('/version', cache(10), (req,res) => {
  reqHandler.getVersion(res);
});


/** Task No. 4:  the endpoint for getting images 
 *  http://localhost:8040/images?size=1&offset=2
 * typically, try http://localhost:8040/images?size=3&offset=1666
 * and try http://localhost:8040/images?sizety=3&offset=1667
 * and try a bad URL like http://localhost:8040/images?notsize=2&offset=5abc
 * but this two will be passed validation http://localhost:8040/images?size=2&offset=5&abc=0
 * and http://localhost:8040/images?abc=234&size=10&offset=100
 * As you see, a valid imgae-url is either the all parameters are empty (ignore) 
 * or at least, (1)the parameter Size is correct and(2) the parameter value MUST be an integer, 
 * others like offset can be missed or can be incorrect spelling, for any additional/extra parameters will be igonred.
 * By default, the offset is 0, and presume that by default size = 1(there is no mention in your document about this)
 * use the default HTTP module in the standard library to implement calling GET/POST method.
*/
app.get('/images', cache(10), (req,res) => {
  let size = 1;
  let offset = 0;
  if(typeof req.query.size !== "undefined") size = req.query.size;
  if(typeof req.query.offset !== "undefined") offset = req.query.offset;   
  reqHandler.getImages(req,res, size, offset);
  return;
});


/** Task No. 5: the endpoint for getting Nicholas 
 *  http://localhost:8040/Nicholas
*/
 app.get('/Nicholas', cache(10), (req,res) => {
  reqHandler.getNicholas(res);      
}); 


/** Task No. 6: the endpoint for getting Romaguera 
 *  http://localhost:8040/Romaguera
*/
app.get('/Romaguera', cache(10), (req,res) => {
  reqHandler.getRomaguera(res);
  return;  
});


/** Task No. 7: the endpoint for posting todo 
 * http://localhost:8040/todo
 * A POST request is possible just using the Node.js standard modules

  postman: (test tool)
  https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop/related?hl=en

  an example request
  {
	    "userId": 101012,
      "title": "sunt aut facrit, deng chunhua 222222  我的世界 33333 ÅØÆ",
      "completed": true
  }
*/
app.post('/todo', (req,res) => {
  if( typeof req.body === 'undefined' || req.body === null || JSON.stringify(req.body).trim() === '{}'){ //if(!req.body) {
    return res.status(400).send('post: the request message should be NOT null or empty.');
  }
  const result = lib.validateTodo (req.body);
  if(result) {
    return res.status(400).send(result.error.details[0].message);
  }
  reqHandler.postTodo(req,res);
  return; 
});


/** Task No. 8: the endpoint for getting sorted-users 
 * http://localhost:8040/sorted-users
*/
app.get('/sorted-users', cache(10), (req, res) => { 
  reqHandler.getSortedUsers(res) ;
  return;  
});


/** Task No. 9: the endpoint for getting new-todos 
 * http://localhost:8040/new-todos
*/
app.get('/new-todos', cache(10), (req,res) => {
  reqHandler.getNewTodos(res);
  return;
});


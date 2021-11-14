 /** the module for precessing received requests */
 
 const https = require('https');
 const db = require('../data/db');
 const lib = require('../lib/lib'); 
 
 /** this is for the purpose of test cache ONLY */
 function getTestCache (req, res) {
     res.send('test cache :' + JSON.stringify({ title: 'Hey', message: 'Hello there,would you please check datetime stamp', date: new Date()}));  
 };
 
 /** Task No. 2: a ping endpoint for test connection purpose 
  * this method does not make a cache ::
 */
 function getPing(res){
   res.send('Pong');
   return;
 }
 
 /** Task No. 3:  the endpoint for getting Node.js version  */
 function getVersion(res){
   res.send('Version: ' + process.version);   
 }
 
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
 function getImages(req,res,size,offset){
   console.log("parameters, size = ", size + ", offset = ", offset);
   let imageData = [];    
   let length = 0;
   https.get('https://jsonplaceholder.typicode.com/photos',(resp)=>{
     let data = '';
     resp.on('data',(chuck) => {
       data += chuck;
     });
     
     resp.on('end',() => {
       imageData =  JSON.parse(data);       
       length = imageData.length;
       const startIndex = size * offset;
       if((length < startIndex) || (length == startIndex))
          return res.send('(It seems be exceeding the MAX) Wrong parameter: '
                 + "image size :" + size + ", offset :" + offset + ". data total length = " + length );
       let imgResult = [];
       let imgOnlyURL =[];
       for(i = 0; i < size; i++) {
         if ((startIndex + i) > (length - 1)) break; // reach to the last element in the array ::
         imgResult[i] = imageData[startIndex + i]; 
         imgOnlyURL[i] = imageData[startIndex + i].url;               
       }         
       console.log("required image size :" + size + ", offset :" + offset + ". total Size = " + length + ", only image's urls = " +  imgOnlyURL.toString());
        // if only image-urls are needed from response, uncomment the below line to replace the code line in the below.
        //res.send(imgOnlyURL.toString());
        // if more messages are needed from response, uncomment the below line to replace the above code line.
        res.send(imgResult);
     
     }).on('error', (err) => {
       console.log('Error: ' + err.message);
       res.send('Error: ' + err.message);
     });    
   });
   return;
 };
 
 /** Task No. 5: the endpoint for getting Nicholas  */
 function getNicholas(res){ 
   let userData = '';    
     let postData = [];
     let resultData = new Object;
     resultData.user = userData;
     resultData.post = postData;
     let userDone = false;
     let postDone = false;
     https.get('https://jsonplaceholder.typicode.com/users',(resp)=>{
       let data = '';
       resp.on('data',(chuck) => {
         data += chuck;
       });
       
       resp.on('end',() => {
         let responseBuffer = JSON.parse(data);
         resultData.user = responseBuffer.filter((user) => user.id === 8);  
         console.log('Success on calling Get-method for getting user-data:  ' + JSON.stringify(resultData.user));
         userDone = true;
         if (postDone) return res.send(resultData);
        
       }).on('error', (err) => {
         console.log('Error: ' + err.message);
         res.send('Error: ' + err.message);
       });    
     });
 
     https.get('https://jsonplaceholder.typicode.com/posts',(resp)=>{
       let data = '';
       resp.on('data',(chuck) => {
         data += chuck;
       });
       
       resp.on('end',() => {      
         let responseBuffer = JSON.parse(data);
         resultData.post = responseBuffer.filter((post) => post.userId === 8);  
         console.log('Success on calling Get-method for getting post-data:  ' + JSON.stringify(resultData.post));
         postDone = true;
         if(userDone) return res.send(resultData); 
       }).on('error', (err) => {
         console.log('Error: ' + err.message);
         res.send('Error: ' + err.message);
       });    
     });
 
     if(userDone && postDone){
       console.log('user-data=' + JSON.stringify(resultData.user));
       console.log('post-data=' + JSON.stringify(resultData.post));
       return res.send(resultData); 
     }
     return;       
 }
 
 /** Task No. 6: the endpoint for getting Romaguera  */
 function getRomaguera(res){
   
   let userData = '';    
   let postData = [];
   let resultData = new Object;
   resultData.user = userData;
   resultData.post = postData;
   let userDone = false;
   let postDone = false;   
 
   https.get('https://jsonplaceholder.typicode.com/users',(resp)=>{
     let data = '';
     resp.on('data',(chuck) => {
       data += chuck;
     });
     
     resp.on('end',() => {
       let responseBuffer = JSON.parse(data);      
       let userQualified = responseBuffer.filter((user) => user.company.name.startsWith('Romaguera') === true);   
       resultData.user = userQualified;       
       userDone = true;
       console.log('Success on calling GET-method for getting users.' + data); 
       if (postDone){
         let resultBuffer = []; 
         let k = 0;
         let lenUser = userQualified.length;
         let lenPost = postData.length;
         // get post-data based on qualified users ::
         for (let i = 0; i < lenUser; i++) {             
            for (let j = 0; j < lenPost; j++) {
               if(userQualified[i].id === postData[j].userId)
               {
                 resultBuffer[k] = postData[j]; 
                 k++;
               };
            };
         };
         console.log('to abstract post-data is done (1).' + JSON.stringify(resultBuffer));      
         if(k > 0) resultData.post = resultBuffer;
         // if you need messages on both user and post, uncomment this line :: 
         //res.send(resultData);
         return res.send(resultData.post);
       }    
       
     }).on('error', (err) => {
       console.log('Ops, Error occurs when calling get-method: ' + err.message);
       res.send('Error: ' + err.message);
     });    
   });
   https.get('https://jsonplaceholder.typicode.com/posts',(resp)=>{
     let data = '';
     resp.on('data',(chuck) => {
       data += chuck;
     });
     
     resp.on('end',() => {
       postData =  JSON.parse(data);
       postDone = true;
       console.log('Success on calling GET-method for getting posts.' + data); 
       if(userDone){
        // let responseBuffer = resultData.user;
        // resultData.user = responseBuffer.filter((user) => user.company.name.startsWith('Romaguera') === true);         
         let resultBuffer = [];
         let k = 0;
         let lenUser = resultData.user.length;
         let lenPost = postData.length;
          // get post-data based on qualified users by using loop ::
         for (let i = 0; i < lenUser; i++) {    
           for (let j = 0; j < lenPost; j++) {
             if(resultData.user[i].id === postData[j].userId){
               resultBuffer[k] = postData[j]; 
             k++;
             };          
          };
         };
         console.log('to abstract post-data is done (2).' + JSON.stringify(resultBuffer)); 
         if(k > 0) resultData.post = resultBuffer;        
         // if you need messages on both user and post, uncomment this line :: 
         //res.send(resultData);
         return res.send(resultData.post);
       }
 
     }).on('error', (err) => {
       console.log('Error: ' + err.message);
       res.send('Error: ' + err.message);
     });    
   });
 };
 
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
 function postTodo(req,res) { 
   // schema for todo     
   const todo = {
     userId: req.body.userId,
     title: req.body.title,
     completed: req.body.completed  
   }  // in case, the middleware want to modify or do something for the request, use this line ::
 
   const data = JSON.stringify(req.body);
   console.log('in todo-post, request-data = ' + data);
 
   // prepare the header
   let postheaders = {
     'Content-Type' : 'application/json',
     'Content-Length' : Buffer.byteLength(data, 'utf8')
   };
 
   // the post options
   let optionspost = {
     host : 'jsonplaceholder.typicode.com',   
     port : 443,   
     path : '/todos',    
     method : 'POST',  
     headers : postheaders 
   };
 
   console.info('Options prepared:');
   console.info(optionspost);
   console.info('the POST call is starting .... ');
 
   // do the POST call
   let reqPost = https.request(optionspost, function(resPost) {
       console.log("statusCode: ", resPost.statusCode);
       // uncomment it if header details in log is needed
       console.log("headers: ", resPost.headers);
       resPost.setEncoding('utf-8');
       let responseString = '';
 
       resPost.on('data', function(data) {
         responseString += data;
       });
 
       resPost.on('end', function() {          
         let responseObject = JSON.parse(responseString);         
         console.log('post-call ended. add the response to DB: ' + (responseString));           
         db.push(responseObject);           
         res.send(responseString);
     });
   });
 
   // write the json data
   reqPost.write(data);
   reqPost.end();
 
   reqPost.on('error', function(e) {
     console.log('Ops, Error occurs when posting...');
     console.error(e);
   }); 
 };
 
 
 /** Task No. 8: the endpoint for getting sorted-users  */
 function getSortedUsers(res) { 
   
   let userData = [];     
   https.get('https://jsonplaceholder.typicode.com/users',(resp)=>{
     let data = '';    
     resp.on('data',(chuck) => {
       data += chuck;
     });
     
     resp.on('end',() => {
       console.log('Success on calling get-method for users-data from web api. (sorted-users)' );      
       let resultFilterData = []; 
       // get what we need by using filter       
       resultFilterData =(JSON.parse(data)).filter((element) => ((element.website.endsWith('.com') === true)
                ||(element.website.endsWith('.net') === true)||(element.website.endsWith('.org') === true)));

       let sortedData = [];   
       userData =  resultFilterData;  // JSON.parse(data);
       const len = userData.length;
       // creat a new Json Object so as to make sorting Json-Object easily.  
       // in other words, add a new property called "citySort" to first-level 
       // in Json-object, then sort by this property :: Sort-Json-algorithm ::
       for(i = 0; i < len; i++) {        
         sortedData[i]= userData[i];
         sortedData[i].citySort = new Object;
         sortedData[i].citySort = ''; 
         sortedData[i].citySort = userData[i].address.city;                 
       }
       sortedData.sort(lib.sortByProperty('citySort'));       
     
       // kick out the newly-added-property of citySort so as to restore the original
       // operator delete removes a property from an object; 
       // if no more references to the same property are held, it is eventually released automatically. 
       for(i = 0; i < len; i++) {
           delete sortedData[i].citySort;             
       } 
       res.send(sortedData);      
     }).on('error', (err) => {
       console.log('Error: ' + err.message);
       res.send('Error: ' + err.message);
     });    
   });   
 
 };
 
 
 /** Task No. 9: the endpoint for getting new-todos   */
 function getNewTodos(res) { 
    return res.send(db); 
 }

 module.exports = { getPing, getVersion, getImages, 
    getNicholas, getRomaguera, postTodo, 
    getSortedUsers, getNewTodos, getTestCache};
 
 
  /** the module for supplying common functions */
  
  const Joi = require('joi');

  function sortByProperty(property){ 
    return function(a,b){  
       if(a[property] > b[property])  
          return 1;  
       else if(a[property] < b[property])  
          return -1;  
   
       return 0;  
    }  
  }

  function validateTodo(todo) {
    const schema = Joi.object().keys({
      userId: Joi.number(),
      title: Joi.string(),
      completed: Joi.bool()
    });
     return Joi.assert(todo, schema); 
  }
  
  const numberValidation = (n) => {
    /* isNan() function check whether passed variable is number or not*/
        if (isNaN(n)) { 
        return false;
        } else { 
        return true;
        }
    }
  
  function getDatetimeStamp() {
    const date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+ minutes : minutes;
    return strTime = (date.getMonth() + 1) + '/' + date.getDate() +'/'+ date.getFullYear()+' '
                    + hours + ':' + minutes +':'+ seconds + " " + ampm;
  }

  module.exports = { sortByProperty, validateTodo, 
                    numberValidation, getDatetimeStamp};
const h=require('./h.js');(async()=>{const {b,page,errs}=await h.open({q:'high',wait:1500});console.log(errs.slice(0,5));await b.close()})();

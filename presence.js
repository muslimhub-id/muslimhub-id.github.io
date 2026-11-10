(function(){
  const c=window.FIREBASE_CONFIG;
  if(!c||!window.firebase||String(c.apiKey).indexOf("ISI_")===0)return;
  try{
    firebase.initializeApp(c);
    const db=firebase.database();
    let id;
    try{id=localStorage.getItem("mh_id");if(!id){id=Math.random().toString(36).slice(2)+Date.now().toString(36);localStorage.setItem("mh_id",id);}}
    catch(e){id=Math.random().toString(36).slice(2);}
    const tgl=new Date().toLocaleDateString("sv-SE");
    db.ref("uniq/"+tgl+"/"+id).set(true).catch(function(){});
    const pr=db.ref("presence/"+Math.random().toString(36).slice(2));
    db.ref(".info/connected").on("value",function(s){
      if(s.val()===true){pr.onDisconnect().remove();pr.set({t:firebase.database.ServerValue.TIMESTAMP});}
    });
  }catch(e){}
})();

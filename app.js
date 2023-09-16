

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const lodash = require("lodash");
// const { getDay } = require("./date");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistdb",{useNewUrlParser: true});//connecting mongoose
const itemschema ={
  name : String,    //crating schema
};
const Item = mongoose.model("Item",itemschema); //creating model

const item1 = new Item({ //creating default item
  name : "gym"
});
const item2 = new Item({
  name : "diet"
});
const item3 = new Item({
  name : "shopping"
});
const permanant = [item1,item2,item3];

const listschema ={
  name: String,
  list :[itemschema]
};
const List =mongoose.model("List",listschema);
app.get("/", function(req, res) {

// const day = date.getDate();
Item.find({})
.then(function(founditems){ //checking if list is empty or not to add default list
  if(founditems.length===0){
   Item.insertMany(permanant)
    .then(function(){
     console.log("success!");
    
    })
    .catch(function(err){
     console.log(err);
    });
    res.redirect("/");
  }else{
    res.render("list", {listTitle: "Today", newListItems: founditems});
  }
 
})
.catch(function(err){
  console.log(err);
})

});
app.get("/:customListName",function(req,res){
  const customname= lodash.capitalize(req.params.customListName);

  List.findOne({name:customname})
  .then (function(result){
  if(!result){
    const list = new List({
      name: customname,
      list : permanant,
    });
    list.save();
    res.redirect("/"+customname);
    
  }
  else{
    res.render("list",{listTitle:result.name,newListItems:result.list});
    // res.redirect("/"+customname);
  }
})
.catch(function(err){
console.log(err);
});
  
});

app.post("/delete",function(req,res){ //deleting item
  
  const check = req.body.delete;
  const listname = req.body.listName;
  if (listname=== "Today") {
    Item.findByIdAndRemove(check)
    .then(function () {
      // console.log("removed");
    })
    .catch(function (err) {
      console.log(err);
    })
    res.redirect("/");
  }
 else{
  List.findOneAndUpdate({name:listname},{$pull:{list:{_id:check}}})
  .then(function () {
    res.redirect("/"+listname);
  })
 }
})

app.post("/", function(req, res){     //adding new item
 
  const itemname = req.body.newItem;
  const listname = req.body.list;
  const item = new Item({
    name : itemname
  });
  if(itemname.length!==0){
  if(listname==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listname})
    .then(function(foundlist){
      // console.log(foundlist);
        foundlist.list?.push(item);
        foundlist.save();
        res.redirect("/"+listname);
      
    }
    
    )
    .catch(function(err){
      console.log(err);
    })
  }
 
}}
);

// app.get("/about", function(req, res){
//   res.render("about");
// });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

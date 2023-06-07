  const express = require ("express");  
  const bodyParser = require ("body-parser"); 

  const mongoose = require ("mongoose");
  const _ = require ("lodash");
  
  const app= express();
  
 

  app.use(bodyParser.urlencoded({extended: true}));

  app.set('view engine', 'ejs');

  app.use(express.static("public"));
  
  mongoose.connect("mongodb://127.0.0.1:27017/todolistDB",{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{
    console.log("Connected to MongoDB successfully");
}).catch((err)=>{
    console.log(err);
})

const itemsSchema = new mongoose.Schema({
  name:String
});

const Item = mongoose.model("Item",itemsSchema);

 const item1 = new Item({
  name:"Welcome to your todolist!"
 });

 const item2 = new Item({
  name:"Hit the + button to add a new item."
 });

 const item3 = new Item({
  name:"<-- Hit to delete an item."
 });

  const defaultItems = [item1,item2,item3];

    const listSchema ={
      name:String,
      items:[itemsSchema]
    };
   const List = mongoose.model("List",listSchema);

  app.get("/",function(req,res){
    // let today = new Date();// save the current date in today
    
    // let options ={
    //     weekday: "long",
    //     day: "numeric",
    //     month: "long"
    // };

    // var day = today.toLocaleDateString("en-US", options);


    async function getData()
    {
      const foundItems = await Item.find();
      if(foundItems.length===0){
        Item.insertMany(defaultItems);
        res.redirect("/");
      }
      else{
      
      
    
      res.render("list",{listTitle:"Today", tasks:foundItems});
      }  
    };
    getData();
  

    

  });

  app.get("/all",function(req,res){
    async function getData(){
       const foundItems = await List.find();
      //  foundItems.forEach(function(foundItem)
      //  {
      //  console.log(foundItem.name);
      //  }
      res.render("all",{tasks:foundItems});
  // )}
    }
    getData();
  })

  app.post("/", function(req,res){

    const itemName =req.body.newItem;
    const listName=req.body.list;


    
    const item = new Item({
      name: itemName
    });
    if (listName === "Today"){
      item.save();
      
      res.redirect("/");
    }
    else{
      async function getData()
      {
        const foundList = await List.findOne({name:listName}).exec();
        if(foundList){
         
        foundList.items.push(item);
        foundList.save();
        res.redirect("/lists/"+ listName);
        } 
      };
      getData();

    }
    


   
  });


  app.post("/delete",function(req,res){
    //console.log(req.body.checkbox);
    const checkedItemId = req.body.checkbox;
   // console.log(checkedItemId);
    const listName = req.body.listName;
    async function getData()
    {
      
      if(listName === "Today"){
        async function deleteData(){
          await Item.deleteOne({_id:checkedItemId});
        };
        deleteData();
        res.redirect("/"); 
      }   
        else {
          List.findOneAndUpdate({name:listName}, { $pull: {items: {_id:checkedItemId}}}).exec();
          res.redirect("/lists/" + listName);
        };
        
       
      }
    
    getData();
    
  })

  app.post("/deleteCustomList",function(req,res){
    //console.log(req.body.checkbox);
    const checkedItemId = req.body.checkbox;
    //console.log(checkedItemId);
    const listName = req.body.listName;
   
    async function getData()
    {
      
      
          List.findOneAndDelete({name:listName}).exec();
          res.redirect("/all");
        
        
       
      }
    
    getData();
    
  })

  app.post("/post",(req,res)=>{
    const listName=req.body.customList;
    //console.log(listName);
    res.redirect("/lists/"+listName);
  })




 app.get("/lists/:customListName",(req,res)=>{
  //console.log(req.params.customListName);

  const customListName=_.capitalize(req.params.customListName);

  async function getData()
  {
     const foundList = await List.findOne({name:customListName}).exec();
     if (!foundList){
      //console.log("Doesn't Exist");
      const list = new List({
        name: customListName,
        items: defaultItems
       });
       list.save();
       res.redirect("/lists/"+customListName);
     } else {
     // console.log("exist");
      res.render("list",{listTitle:foundList.name,tasks:foundList.items});
     }
  }
  getData();
  

  //console.log(customListName);
 })
  app.get("/about",function(req,res){
     res.render("about");
  })

  

  
  app.listen(3000,function(){
    console.log("Server started on port 3000");
  })

  

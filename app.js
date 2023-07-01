const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require("lodash");
const app = express();
app.use(express.static("public"));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", { useNewUrlParser: true });


const itemschema = {
    name: String,
};

const Item = mongoose.model('Item', itemschema);

const item1 = new Item({
    name: 'Welcome to todolist!'
});
const item2 = new Item({
    name: 'Hit the + button to add a new item.'
});
const item3 = new Item({
    name: '<-- Hit this to delete an item '
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemschema]
};

const List = mongoose.model('List', listSchema);





app.get('/', function (req, res) {

    Item.find({}).then(function (finditems) {
        if (finditems.length === 0) {
            Item.insertMany(defaultItems).then(function () {
                console.log('successfully inserted');
            })
            res.redirect("/");
        } else {
            res.render("list", { listTitle: "Today", newlistitems: finditems });
        }



    })




});

app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);


    List.findOne({ name: customListName }).then(function (FoundList) {
        //   console.log(FoundList);  

        if (FoundList === null) {
            const list = new List({
                name: customListName,
                items: defaultItems
            });
            list.save();
            res.redirect(customListName);
        }
        else {
            console.log(FoundList);
            console.log("exists");
            res.render("list", { listTitle: FoundList.name, newlistitems: FoundList.items });

        }

    });
});





app.post("/", function (request, response) {
    var itemName = request.body.newItem;
    const listName = request.body.button;
    const item = new Item({
        name: itemName
    });
    if (listName === "Today") {

        item.save();

        response.redirect('/');
    } else {


        List.findOne({ name: listName }).then(function (foundList) {
            foundList.items.push(item);
            foundList.save();
            response.redirect("/" + listName);
        });
    }




})

app.post("/delete", function (req, res) {
    const checkedItemId = (req.body.checkbox);
    const listName = (req.body.listName);
   if (listName === "Today"){
Item.findByIdAndRemove(checkedItemId).then(function () {
        console.log('Item deleted successfully!!');
        res.redirect("/");
    })

   }else{
    List.findOneAndUpdate({name : listName },{$pull :{items :{_id:checkedItemId}}}).then(function(){
        res.redirect("/"+listName);
    })
   }
    
})


// app.get('/work', function (request, response) {
//     response.render('list', { listTitle: 'Work List', newlistitems: workItems });
// });


// app.post('/work',function (request, response) {
//     var item = request.body.newItem;
//     workItems.push(item);
//     response.redirect("/work");
// })

app.listen(3000, function () {
    console.log("listening on port 3000");
});
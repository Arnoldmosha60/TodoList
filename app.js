const express = require("express");
const bodyParser = require("body-parser");
const { log } = require("console");
const currentDay = require(__dirname + "/date.js");
const _ = require("lodash");
const app = express();

const mongoose = require("mongoose");
mongoose.connect('mongodb://127.0.0.1:27017/todolistDB')
  .then(() => console.log('Connected!'));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended:true}));
app.use(express.static("public"));

// let newItems = ["Prepare food", "Cook Food", "Eat Food"];
// let workItems = [];

const itemSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Prepare your Today's list"
});
// item1.save();

const item2 = new Item({
    name: "Hit the + button to add new todoList"
});
// item2.save();

const item3 = new Item({
    name: "Hit <-- to delete your todoList"
});
// item3.save();
const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {
    let day = currentDay();
    Item.find().then({},(foundItems) => {
        if (foundItems.length === 0) {
            Item.insertMany().then(defaultItems, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully saved into DB!");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", { listTitle:day, newItem:foundItems });
        }
    });
});

app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne().then({name: customListName}, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                // Create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                List.save();
                res.redirect("/"+customListName);
            } else {
                // Display the found list
                res.render("list", { listTitle:foundList.name, newItem:foundList.items });
            }
        }
    });  
});

app.post("/", (req, res) => {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });
    if (listName === day) {
        item.save();
        res.redirect("/");
    } else {
        List.findOne().then({ name: listName}, (err, foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }
    
    // if (req.body.list === "Work List") {
    //     workItems.push(req.body.newItem);
    //     res.redirect("/work");
    // } else {
    //     newItems.push(req.body.newItem);
    //     res.redirect("/");
    // }
});

app.post("/delete", (req, res) => {
    const checkboxItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === day) {
        Item.findByIdAndRemove(checkboxItemId, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Deleted successfully!");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: checkboxItemId}}}, (err, foundList) => {
            if (!err) {
                res.redirect("/"+listName);
            }
        });
    }
    
});



app.listen(3000, (req, res) => {
    console.log("Server is running at Port 3000");
});



/**
 * 
 *      Cart Functionality
 */



module.exports = function Cart(oldCart) { // receives old Cart
    // assign values of old cart to new cart
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;

    //this.createItem = function(name, option, optionPrice, ){}

    this.add = function(item, id) {
        var storedItem = this.items[id]; // Assigns id and checks to see if the item is in the cart
        if(!storedItem) { // If this item does not exist in the cart, then create a new one
            storedItem = this.items[id] = {item: item, qty: 0, price: 0};
        }
        // Update Item Quantity, Item Price with Quantity, Total Cart Quantity, and Total Cart Price
        storedItem.qty++;                                           
        storedItem.price = storedItem.item.price * storedItem.qty;
        this.totalQty++;
        this.totalPrice += storedItem.item.price;
    };

    this.reduceByOne = function(id){
        this.items[id].qty--;
        this.items[id].price -= this.items[id].item.price;
        this.totalQty--;
        this.totalPrice -= this.items[id].item.price;

        if(this.items[id].qty <= 0){
            delete this.items[id];
        }
    };

    this.removeItem = function(id){
        this.totalQty -= this.items[id].qty;
        this.totalPrice -= this.items[id].price;
        delete this.items[id];
    }

    // Returns the Cart Objects as an Array
    this.generateArray = function() {
        var arr = [];
        for(var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    };
};
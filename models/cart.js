/*************************
 *   CART FUNCTIONALITY  *
 *************************/
module.exports = function Cart(oldCart) { // receives old Cart
    // assign values of old cart to new cart
    
    var taxRate = 0.105;
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0.00;
    this.tax = oldCart.tax || 0.00;
    this.subTotal = oldCart.subTotal || 0.00;
    this.totalPrice = oldCart.totalPrice || 0.00;
   
   // this.subTotal = format(this.subTotal);
     
    
    // ADD ITEM TO THE CART
    this.add = function(item, id) {
        // Assigns id and checks to see if the item is in the cart
        var storedItem = this.items[id]; 
        // If this item does not exist in the cart, then create a new one
        if(!storedItem) { 
            storedItem = this.items[id] = {item: item, qty: 0, price: 0.00};
        }
        // Update Item Quantity, Item Price with Quantity, Total Cart Quantity, and Total Cart Price
        storedItem.qty++;                                           
        storedItem.price = storedItem.item.price * storedItem.qty;
        this.totalQty++;
        this.subTotal += storedItem.price;
        
        this.tax = taxRate*this.subTotal;
        this.totalPrice = format(this.subTotal + this.tax);
        console.log(Cart);
    };
    // REDUCE ITEM QUANTITY BY ONE
    this.reduceByOne = function(id){
        this.items[id].qty--;
        this.items[id].price -= this.items[id].item.price;
        this.totalQty--;
        this.subTotal -= this.items[id].item.price;
        this.tax = taxRate*this.subTotal;
        this.totalPrice = format(this.subTotal + this.tax);
        console.log(Cart);
        if(this.items[id].qty <= 0){
            delete this.items[id];
        }
        
    };
    // REMOVE ITEM FROM CART
    this.removeItem = function(id){
        this.totalQty -= this.items[id].qty;
        this.subTotal -= this.items[id].price;
        this.tax = taxRate * this.subTotal;
        this.totalPrice = format(this.subTotal + this.tax);
        console.log(this.subTotal);
        delete this.items[id];
       
    };
    // RETURNS CART OBJECT AS ARRAY
    this.generateArray = function() {
        var arr = [];
        for(var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    };
    function format(x) {
        return Number.parseFloat(x).toFixed(2);
    }

 
    this.tax = format(this.tax);
  //  this.subTotal = format(this.subTotal);
  //  this.totalPrice = format(this.totalPrice);
   

};
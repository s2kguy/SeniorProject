/*************************
 *   CART FUNCTIONALITY  *
 *************************/

 module.exports = function Cart(oldCart) { // receives old Cart
    // assign values of old cart to new cart
    
    var taxRate = 0.105;
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.tax = oldCart.tax || 0.00;
    this.subTotal = oldCart.subTotal || 0.00;
    this.totalPrice = oldCart.totalPrice || 0.00;
   
 
    // ADD ITEM TO THE CART
    this.add = function(item, id) {
        var index = 0;
        // Assigns index and checks to see if the item is in the cart
        var storedItem;
        console.log('\n\n\n\n\n\n');
        

        if(this.totalQty !=0){
            //  Loop to see if any current cart items match
            for(var i = 0; i < this.totalQty; i++){
                storedItem = this.items[i];
                console.log('In cart with index: '+i+'? '+!storedItem);
                if(!storedItem||(storedItem.item.name == item.name && storedItem.item.plateOps == item.plateOps)){
                    break;
                }


            }

        }
        
        // If not, then create the item
        if(!storedItem){
            console.log('A NEW ITEM HAS BEEN CREATED');
            index=this.totalQty;
            storedItem = this.items[index] = {
                item: item,
                qty: 0, 
                price: 0.00
            };
        }
    
        else{                    // If it does, then check the item elements in the order from most to less likely to match // Checking Order:                                                                          
            if(item.name === storedItem.item.name){                                  // 1. Name
               
                console.log('item exists: same name');                              // 2. Sandwich/Platter Options i.e. (Sandwich Only | Combo) | (Small | Large)|etc...
                
                if(item.plateOps == storedItem.item.plateOps){                      // 3. Side Items                  
                    
                    console.log('item exists: same plateOps'); 
                    console.log('item.sides.length: '+item.sides.length);
                    
                    var testSide = storedItem.item.sides;
                    
                    console.log('storedItem.item.sides(testSide): '+testSide.length);                                                             // 4. Modifiers
                    
                    if(item.sides === storedItem.item.sides || item.sides.length == testSide.length){                        // 5. Special Instructions
                        
                        console.log('item exists: same sides');
                        var testMod = storedItem.item.modifiers;
                       
                        if(item.modifiers.length == testMod.length){
                           
                            console.log('item exists: same modifiers');
                            var testSpec = storedItem.item.spec_Inst;
                            
                            if(item.spec_Inst.length == testSpec.length){
                                console.log('item exists: same spec_Inst');
                                console.log('EXACT MATCH.  Increase items[index].qty');
                            }
                            else{
                                console.log('item exists: different spec_Inst');
                                index = this.totalQty;
                                storedItem = this.items[index] = {
                                    item: item,
                                    qty: 0, 
                                    price: 0.00
                                };
                            }
                        }
                        else{
                            console.log('item exists: different modifiers');
                            index = this.totalQty;
                            storedItem = this.items[index] = {
                                item: item,
                                qty: 0, 
                                price: 0.00
                            };
                        }
                    }
                    else{
                        console.log('item exists: different sides');
                        console.log('item.sides:'+item.sides+'\tstoredItem.item.sides'+storedItem.item.sides);
                        
                        index = this.totalQty;
                        storedItem = this.items[index] = {
                            item: item,
                            qty: 0, 
                            price: 0.00
                        };
                    }
                }
                else{
                    console.log('item exists: different plateOps');
                    index = this.totalQty;
                    storedItem = this.items[index] = {
                        item: item,
                        qty: 0, 
                        price: 0.00
                    };
                }  
            }
            else{
                console.log('Brand New Item!');
                index = this.totalQty;
                    storedItem = this.items[index] = {
                        item: item,
                        qty: 0, 
                        price: 0.00
                    };
                }
            }
        
        // Update Item Quantity, Item Price with Quantity, Total Cart Quantity, and Total Cart Price
        storedItem.qty++;                              
        storedItem.price = storedItem.item.itemPrice * storedItem.qty;       
        this.totalQty++;
        console.log('Sub-Total (before): '+this.subTotal);
        if(storedItem.qty != 1){
            this.subTotal += storedItem.price-(storedItem.price/storedItem.qty);
        }else{
            this.subTotal += storedItem.price;
        }
        console.log('Sub-Total (after): '+this.subTotal);   
        this.tax = taxRate*this.subTotal;
        this.totalPrice = format(this.subTotal + this.tax);
        console.log(JSON.stringify(this.items)); 
        console.log('\n\n\n\n\n');
    };
    // REDUCE ITEM QUANTITY BY ONE
    this.reduceByOne = function(id){
        this.items[id].qty--;
        this.items[id].price -= this.items[id].item.itemPrice;
        this.totalQty--;
        this.subTotal -= this.items[id].item.itemPrice;
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
   /*     for(var i = 0; i < this.totalQty; i++){
            arr.push(this.items[i]);
        }*/
        return arr; 
    };
    function format(x) {
        return Number.parseFloat(x).toFixed(2);
    }

    function existInCart(item, id){
        var test = this.items[id];
        if(item.name != test.name){ console.log('DOES NOT MATCH!');} 
        console.log('existInCart Call.    item.name:'+item.name+'\item.id: '+item.productID);
    }

 
    this.tax = format(this.tax);
  //  this.subTotal = format(this.subTotal);
  //  this.totalPrice = format(this.totalPrice);
   

};
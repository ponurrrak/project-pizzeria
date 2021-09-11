import {select, settings} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
  initMenu: function(){
    const thisApp = this;
    for(let productData of thisApp.data.products){
      new Product(productData.id, productData);
    }
  },
  initCart: function(){
    const thisApp = this;
    thisApp.cart = new Cart(document.querySelector(select.containerOf.cart));
    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function(e){
      thisApp.cart.add(e.detail.product);
    });
  },
  initData: function(){
    const thisApp = this;
    const url = settings.db.url + '/' + settings.db.products;
    thisApp.data = {};
    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        thisApp.data.products = parsedResponse;
        thisApp.initMenu();
      });
  },
  init: function(){
    const thisApp = this;
    thisApp.initData();
    thisApp.initCart();
  },
};

app.init();

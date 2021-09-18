import {select, templates, classNames, settings} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element){
    const thisCart = this;
    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
  }
  getElements(element){
    const thisCart = this;
    thisCart.dom = {
      wrapper: element,
      toggleTrigger: element.querySelector(select.cart.toggleTrigger),
      productList: element.querySelector(select.cart.productList),
      deliveryFee: element.querySelector(select.cart.deliveryFee),
      subtotalPrice: element.querySelector(select.cart.subtotalPrice),
      totalNumber: element.querySelector(select.cart.totalNumber),
      totalPrice: element.querySelectorAll(select.cart.totalPrice),
      form: element.querySelector(select.cart.form),
      address: element.querySelector(select.all.address),
      phone: element.querySelector(select.all.phone)
    };
  }
  initActions(){
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function(){
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(e){
      thisCart.remove(e.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(e){
      e.preventDefault();
      if(thisCart.products.length > 0){
        thisCart.sendOrder();
      }
    });
  }
  add(menuProduct){
    const thisCart = this;
    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisCart.dom.productList.appendChild(generatedDOM);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.update();
  }
  update(){
    const thisCart = this;
    let totalNumber = 0, subtotalPrice = 0;
    for(let cartProduct of thisCart.products){
      totalNumber += cartProduct.amount;
      subtotalPrice += cartProduct.price;
    }
    const deliveryFee = (totalNumber > 0) ? settings.cart.defaultDeliveryFee : 0;
    thisCart.totalPrice = subtotalPrice + deliveryFee;
    const priceParams = {
      deliveryFee,
      totalNumber,
      subtotalPrice
    };
    for(let priceParamName in priceParams){
      thisCart.dom[priceParamName].textContent = priceParams[priceParamName];
      thisCart[priceParamName] = priceParams[priceParamName];
    }
    for(let totalPriceElem of thisCart.dom.totalPrice){
      totalPriceElem.textContent = thisCart.totalPrice;
    }
  }
  remove(cartProductToRemove){
    const thisCart = this;
    cartProductToRemove.dom.wrapper.remove();
    const startAtIndex = thisCart.products.indexOf(cartProductToRemove);
    if(startAtIndex >= 0){
      thisCart.products.splice(startAtIndex, 1);
      thisCart.update();
    }
  }
  clearCart(){
    const thisCart = this;
    while(thisCart.products.length > 0){
      thisCart.remove(thisCart.products.pop());
    }
    thisCart.update();
  }
  sendOrder(){
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;
    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: []
    };
    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options)
      .then(function(rawResponse){
        if(rawResponse.status >= 200 && rawResponse.status < 300){
          return rawResponse.json();
        } else {
          return Promise.reject();
        }
      })
      .then(function(parsedResponse){
        let message = `Your order no ${parsedResponse.id}, including:`;
        for(let product of parsedResponse.products){
          message += ` ${product.name} (x${product.amount}),`;
        }
        message += ` for global price ${parsedResponse.totalPrice}$ has been accepted, but... `;
        message += 'our site is still under construction, so you will have to wait a bit ;)';
        alert(message);
        thisCart.clearCart();
      })
      .catch(function(){
        alert(settings.errorMessage);
        thisCart.clearCart();
      });
  }
}

export default Cart;

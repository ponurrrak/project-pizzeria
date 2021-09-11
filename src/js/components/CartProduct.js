import {select} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct{
  constructor(menuProduct, element){
    const thisCartProduct = this;
    for(let param in menuProduct){
      thisCartProduct[param] = menuProduct[param];
    }
    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();
  }
  getElements(element){
    const thisCartProduct = this;
    thisCartProduct.dom = {
      wrapper: element,
      amountWidget: element.querySelector(select.cartProduct.amountWidget),
      price: element.querySelector(select.cartProduct.price),
      edit: element.querySelector(select.cartProduct.edit),
      remove: element.querySelector(select.cartProduct.remove)
    };
  }
  initAmountWidget(){
    const thisCartProduct = this;
    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget, thisCartProduct.amount);
    thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
      thisCartProduct.dom.price.textContent = thisCartProduct.price;
    });
  }
  remove(){
    const thisCartProduct = this;
    const evt = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct
      }
    });
    thisCartProduct.dom.wrapper.dispatchEvent(evt);
  }
  initActions(){
    const thisCartProduct = this;
    thisCartProduct.dom.remove.addEventListener('click', function(e){
      e.preventDefault();
      thisCartProduct.remove();
    });
    thisCartProduct.dom.edit.addEventListener('click', function(e){
      e.preventDefault();

    });
  }
  getData(){
    const thisCartProduct = this;
    return {
      id: thisCartProduct.id,
      amount: thisCartProduct.amount,
      price: thisCartProduct.price,
      priceSingle: thisCartProduct.priceSingle,
      name: thisCartProduct.name,
      params: thisCartProduct.params
    };
  }
}

export default CartProduct;

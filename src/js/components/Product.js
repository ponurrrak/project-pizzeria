import {select, templates, classNames, settings} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';


class Product {
  constructor(id, data) {
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    thisProduct.initAccordion();
  }
  renderInMenu(){
    const thisProduct = this;
    const generatedHTML = templates.menuProduct(thisProduct.data);
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    const menuContainer = document.querySelector(select.containerOf.menu);
    menuContainer.appendChild(thisProduct.element);
  }
  getElements(){
    const thisProduct = this;
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.formCheckboxInputs = thisProduct.form.querySelectorAll(select.all.checkboxInputs);
    thisProduct.formRadioInputs = thisProduct.form.querySelectorAll(select.all.radioInputs);
    thisProduct.selectElements = thisProduct.form.querySelectorAll(select.all.selectElements);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }
  initAccordion(){
    const thisProduct = this;
    thisProduct.accordionTrigger.addEventListener('click', function(e){
      e.preventDefault();
      const isThisProductActive = thisProduct.element.classList.contains(classNames.menuProduct.wrapperActive);
      const currentActiveProduct = document.querySelector(select.all.menuProductsActive);
      if(currentActiveProduct){
        currentActiveProduct.classList.remove(classNames.menuProduct.wrapperActive);
      }
      if(!isThisProductActive){
        thisProduct.element.classList.add(classNames.menuProduct.wrapperActive);
      }
    });
  }
  initAmountWidget(){
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }
  initOrderForm(){
    const thisProduct = this;
    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
    thisProduct.form.addEventListener('change', function(){
      thisProduct.processOrder();
    });
    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
      thisProduct.clearProductToDefaults();
    });
  }
  processOrder(){
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.form);
    let price = thisProduct.data.price;
    const thisProductDataParams = thisProduct.data.params;
    const cartProductParams = {};
    for(let paramId in thisProductDataParams) {
      const formValuesList = formData[paramId];
      if(formValuesList) {
        const paramData = thisProductDataParams[paramId];
        const paramOptions = paramData.options;
        cartProductParams[paramId] = {};
        cartProductParams[paramId].label = paramData.label;
        cartProductParams[paramId].options = {};
        for(let optionId in paramOptions) {
          const option = paramOptions[optionId];
          const optionImage = thisProduct.imageWrapper.querySelector(`.${paramId}-${optionId}`);
          if(formValuesList.includes(optionId)) {
            cartProductParams[paramId].options[optionId] = option.label;
            if(optionImage) {
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            }
            if(!option.default){
              price += option.price;
            }
          }
          else {
            if(optionImage) {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
            if(option.default) {
              price -= option.price;
            }
          }
        }
      } else {
        alert(settings.errorMessage);
        return;
      }
    }
    thisProduct.cartProductParams = cartProductParams;
    thisProduct.priceSingle = price;
    thisProduct.priceTotal = price * thisProduct.amountWidget.value;
    thisProduct.priceElem.innerHTML = thisProduct.priceTotal;
  }
  addToCart(){
    const thisProduct = this;
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct()
      }
    });
    thisProduct.element.dispatchEvent(event);
  }
  prepareCartProduct(){
    const thisProduct = this;
    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.priceTotal,
      params: thisProduct.cartProductParams
    };
    return productSummary;
  }
  clearProductToDefaults(){
    const thisProduct = this;
    for(const checkbox of thisProduct.formCheckboxInputs){
      if(thisProduct.data.params[checkbox.name].options[checkbox.value].default){
        checkbox.checked = true;
      } else {
        checkbox.checked = false;
      }
    }
    for(const radio of thisProduct.formRadioInputs){
      if(thisProduct.data.params[radio.name].options[radio.value].default){
        radio.checked = true;
        break;
      }
    }
    for(const selectElement of thisProduct.selectElements){
      for(const option of selectElement.options){
        if(thisProduct.data.params[selectElement.name].options[option.value].default){
          option.selected = true;
          break;
        }
      }
    }
    thisProduct.amountWidget.setValue(settings.amountWidget.defaultValue);
  }
}

export default Product;

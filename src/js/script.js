/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    errorMessage: 'Form error occurred. Please, refresh site and try again.'
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

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
      });
    }
    processOrder(){
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      let price = thisProduct.data.price;
      const thisProductDataParams = thisProduct.data.params;
      for(let paramId in thisProductDataParams) {
        const formValuesList = formData[paramId];
        if(formValuesList) {
          const paramOptions = thisProductDataParams[paramId].options;
          for(let optionId in paramOptions) {
            const option = paramOptions[optionId];
            const optionImage = thisProduct.imageWrapper.querySelector(`.${paramId}-${optionId}`);
            if(formValuesList.includes(optionId)) {
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
      thisProduct.priceElem.innerHTML = price * thisProduct.amountWidget.value;
    }
  }

  class AmountWidget {
    constructor(element){
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.setValue(settings.amountWidget.defaultValue);
      thisWidget.initActions();
    }
    getElements(element){
      const thisWidget = this;
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    setValue(value){
      const thisWidget = this;
      const newValue = parseInt(value);
      if(newValue !== thisWidget.value){
        if(newValue && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
          thisWidget.value = newValue;
          thisWidget.announce();
        }
        thisWidget.input.value = thisWidget.value;
      }
    }

    /*Question for my Mentor. What is better: a code above (easier to read, shorter)
    or below (it doesn't force browser to render input value when there is no need to do this)*/

    /*setValue(value){
          const thisWidget = this;
          const newValue = parseInt(value);
          if(newValue !== thisWidget.value){
            if(newValue && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
              thisWidget.value = newValue;
              if(thisWidget.input.value !== newValue){
                thisWidget.input.value = newValue;
              }
            } else {
              thisWidget.input.value = thisWidget.value;
            }
          }
        }*/

    initActions(){
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(this.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function(e){
        e.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', function(e){
        e.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }
    announce(){
      const thisWidget = this;
      const evt = new Event('updated');
      thisWidget.element.dispatchEvent(evt);
    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;
      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },
    init: function(){
      const thisApp = this;
      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}

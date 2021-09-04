/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
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
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    errorMessage: 'Form error occurred. Please, refresh site and try again.',
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
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
        thisProduct.addToCart();
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
      app.cart.add(thisProduct.prepareCartProduct());
    }
    prepareCartProduct(){
      const thisProduct = this;
      const productSummary = {};
      productSummary.id = thisProduct.id;
      productSummary.name = thisProduct.data.name;
      productSummary.amount = thisProduct.amountWidget.value;
      productSummary.priceSingle = thisProduct.priceSingle;
      productSummary.price = thisProduct.priceTotal;
      productSummary.params = thisProduct.cartProductParams;
      return productSummary;
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
          if(thisWidget.input.value !== newValue){
            thisWidget.input.value = newValue;
          }
        } else {
          thisWidget.input.value = thisWidget.value;
        }
      }
    }
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

  class Cart {
    constructor(element){
      const thisCart = this;
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
    }
    getElements(element){
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    }
    initActions(){
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }
    add(menuProduct){
      const thisCart = this;
      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      thisCart.dom.productList.appendChild(generatedDOM);
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
    initCart: function(){
      const thisApp = this;
      thisApp.cart = new Cart(document.querySelector(select.containerOf.cart));
    },
    init: function(){
      const thisApp = this;
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}

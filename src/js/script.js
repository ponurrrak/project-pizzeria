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
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
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
  }

  class AmountWidget {
    constructor(element, startValue = settings.amountWidget.defaultValue){
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.setValue(startValue);
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
      const evt = new CustomEvent('updated', {
        bubbles: true
      });
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
      thisCart.dom = {
        wrapper: element,
        toggleTrigger: element.querySelector(select.cart.toggleTrigger),
        productList: element.querySelector(select.cart.productList),
        deliveryFee: element.querySelector(select.cart.deliveryFee),
        subtotalPrice: element.querySelector(select.cart.subtotalPrice),
        totalNumber: element.querySelector(select.cart.totalNumber),
        totalPrice: element.querySelectorAll(select.cart.totalPrice),
        form: element.querySelector(select.cart.form),
        address: element.querySelector(select.cart.address),
        phone: element.querySelector(select.cart.phone)
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
        thisCart.sendOrder();
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
      thisCart.products.splice(startAtIndex, 1);
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
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);
        });
    }
  }

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
}

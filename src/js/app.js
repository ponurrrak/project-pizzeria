import {select, settings, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import Home from './components/Home.js';

const app = {
  initPages: function(){
    const thisApp = this;
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    const idFromHash = window.location.hash.replace('#/', '');
    let pageMatchingHash = thisApp.pages[0].id;
    for(const page of thisApp.pages){
      if(page.id === idFromHash){
        pageMatchingHash = idFromHash;
        break;
      }
    }
    thisApp.activatePage(pageMatchingHash);
    for(const link of thisApp.navLinks){
      link.addEventListener('click', function(e){
        const clickedLink = this;
        e.preventDefault();
        const id = clickedLink.getAttribute('href').replace('#', '');
        thisApp.activatePage(id);
      });
    }
  },
  activatePage: function(pageId){
    const thisApp = this;
    for(const page of thisApp.pages){
      page.classList.toggle(
        classNames.pages.active,
        page.id === pageId
      );
    }
    for(const link of thisApp.navLinks){
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') === '#' + pageId
      );
    }
    window.location.hash = '#/' + pageId;
  },
  initMenu: function(){
    const thisApp = this;
    for(let productData of thisApp.data.products){
      new Product(productData.id, productData);
    }
  },
  initHome: function(){
    const thisApp = this;
    const homeContainer = document.querySelector(select.containerOf.home);
    thisApp.home = new Home(homeContainer, thisApp);
  },
  initBooking: function(){
    const thisApp = this;
    const bookingContainer = document.querySelector(select.containerOf.booking);
    thisApp.bookingPanel = new Booking(bookingContainer);
  },
  initCart: function(){
    const thisApp = this;
    thisApp.cart = new Cart(document.querySelector(select.containerOf.cart));
    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function(e){
      thisApp.cart.add(e.detail.product);
    });
  },
  initData: function(endpoint, callback){
    const thisApp = this;
    const url = settings.db.url + '/' + endpoint;
    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        thisApp.data[endpoint] = parsedResponse;
        callback.call(thisApp);
      });
  },
  initProductData: function(){
    const thisApp = this;
    thisApp.initData(settings.db.products, thisApp.initMenu);
  },
  initHomeData: function(){
    const thisApp = this;
    thisApp.initData(settings.db.home, thisApp.initHome);
  },
  init: function(){
    const thisApp = this;
    thisApp.data = {};
    thisApp.initPages();
    thisApp.initHomeData();
    thisApp.initProductData();
    thisApp.initCart();
    thisApp.initBooking();
  },
};

app.init();

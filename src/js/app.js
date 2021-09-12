import {select, settings, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

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
    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
  },
};

app.init();

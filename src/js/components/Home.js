import {select, templates} from '../settings.js';
import utils from '../utils.js';

class Home{
  constructor(element, pizzeriaApp){
    const thisHome = this;
    thisHome.pizzeriaApp = pizzeriaApp;
    thisHome.render(element, pizzeriaApp.data.home);
    thisHome.getData(element);
    thisHome.initActions();
  }
  render(element, data){
    const generatedHTML = templates.home(data);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    element.appendChild(generatedDOM);
  }
  getData(element){
    const thisHome = this;
    thisHome.dom = {
      container: element,
      carouselWrapper: element.querySelector(select.home.carousel),
      navLinks: element.querySelectorAll(select.home.navLinks)
    };
  }
  initActions(){
    const thisHome = this;
    for(const navLink of thisHome.dom.navLinks){
      navLink.addEventListener('click', function(e){
        const clickedLink = this;
        e.preventDefault();
        const id = clickedLink.getAttribute('href').replace('#', '');
        thisHome.pizzeriaApp.activatePage(id);
      });
    }
    // eslint-disable-next-line no-undef
    thisHome.carousel = new Flickity(thisHome.dom.carouselWrapper, {
      cellAlign: 'left',
      autoPlay: 3000,
      prevNextButtons: false,
      wrapAround: true,
    });
  }
}

export default Home;

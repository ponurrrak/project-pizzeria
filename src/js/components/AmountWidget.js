import {select, settings} from '../settings.js';

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

export default AmountWidget;

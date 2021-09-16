import {select, settings} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget{
  constructor(element, startValue = settings.amountWidget.defaultValue){
    super(element, startValue);
    const thisWidget = this;
    thisWidget.initActions();
  }
  getElements(wrapperElement){
    super.getElements(wrapperElement);
    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }
  parseValue(value){
    return parseInt(value);
  }
  isValid(value){
    return (value
      && value >= settings.amountWidget.defaultMin
      && value <= settings.amountWidget.defaultMax);
  }
  renderValue(){
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }
  initActions(){
    const thisWidget = this;
    thisWidget.dom.input.addEventListener('change', function(){
      thisWidget.setValue(this.value);
    });
    thisWidget.dom.linkDecrease.addEventListener('click', function(e){
      e.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function(e){
      e.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
}

export default AmountWidget;



class BaseWidget{
  constructor(wrapperElement, initialValue){
    const thisWidget = this;
    thisWidget.getElements(wrapperElement);
    thisWidget.setValue(initialValue);
  }
  getElements(wrapperElement){
    const thisWidget = this;
    thisWidget.dom = {
      wrapper: wrapperElement
    };
  }
  get value(){
    const thisWidget = this;
    return thisWidget.correctValue;
  }
  set value(value){
    const thisWidget = this;
    const newValue = thisWidget.parseValue(value);
    if(newValue !== thisWidget.value){
      if(thisWidget.isValid(newValue)){
        thisWidget.correctValue = newValue;
        thisWidget.announce();
      }
      thisWidget.renderValue();
    }
  }
  setValue(value){
    const thisWidget = this;
    thisWidget.value = value;
  }
  parseValue(value){
    return parseInt(value);
  }
  isValid(value){
    return !isNaN(value);
  }
  renderValue(){
    const thisWidget = this;
    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }
  announce(){
    const thisWidget = this;
    const evt = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.dom.wrapper.dispatchEvent(evt);
  }
}

export default BaseWidget;

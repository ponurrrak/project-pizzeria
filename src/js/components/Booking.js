import {templates, select} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking{
  constructor(element){
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();
  }
  render(element){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    element.appendChild(generatedDOM);
    thisBooking.dom = {
      wrapper: element,
      peopleAmount: element.querySelector(select.booking.peopleAmount),
      hoursAmount: element.querySelector(select.booking.hoursAmount),
      datePicker: element.querySelector(select.widgets.datePicker.wrapper),
      hourPicker: element.querySelector(select.widgets.hourPicker.wrapper)
    };
  }
  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.peopleAmountWidget.dom.wrapper.addEventListener('updated', function(){

    });
    thisBooking.hoursAmountWidget.dom.wrapper.addEventListener('updated', function(){

    });
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
  }
}

export default Booking;

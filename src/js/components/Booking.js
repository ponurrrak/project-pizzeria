import {templates, select, settings, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking{
  constructor(element){
    const thisBooking = this;
    thisBooking.tableBookedByUser = null;
    thisBooking.tableBookedByUserDOM = null;
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
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
      hourPicker: element.querySelector(select.widgets.hourPicker.wrapper),
      form: element.querySelector(select.booking.form),
      floorPlan: element.querySelector(select.booking.floorPlan),
      tables: element.querySelectorAll(select.booking.tables),
      phone: element.querySelector(select.all.phone),
      address: element.querySelector(select.all.address),
      starters: element.querySelectorAll(select.booking.starters),
    };
  }
  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.floorPlan.addEventListener('click', function(evt){
      thisBooking.processBooking(evt);
    });
    thisBooking.dom.wrapper.addEventListener('updated', function(){
      if(thisBooking.tableBookedByUserDOM){
        thisBooking.unBookTable();
      }
      thisBooking.updateDOM();
    });
    thisBooking.dom.form.addEventListener('submit', function(e){
      e.preventDefault();
      if(thisBooking.tableBookedByUser){
        thisBooking.sendBooking();
      }
    });
  }
  getData(){
    const thisBooking = this;
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);
    const params = {
      bookings: [
        startDateParam,
        endDateParam
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam
      ]
    };
    const urls = {
      bookings: settings.db.url + '/' + settings.db.bookings + '?' + params.bookings.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&')
    };
    const promisesList = [
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat)
    ];
    Promise.all(promisesList)
      .then(function(rawResponsesList){
        const parsedResponsesList = [];
        for(const rawResponse of rawResponsesList){
          parsedResponsesList.push(rawResponse.json());
        }
        return Promise.all(parsedResponsesList);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }
  makeBooked(date, hour, duration, table){
    const thisBooking = this;
    if(typeof thisBooking.booked[date] === 'undefined'){
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);
    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      if(typeof thisBooking.booked[date][hourBlock] === 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }
  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;
    thisBooking.booked = {};
    for(const item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for(const item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for(const item of eventsRepeat){
      if(item.repeat === 'daily'){
        for(let loopDate = thisBooking.datePicker.minDate; loopDate <= thisBooking.datePicker.maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    thisBooking.updateDOM();
  }
  updateDOM(){
    const thisBooking = this;
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    let allAvailable = false;
    if(
      typeof thisBooking.booked[thisBooking.date] === 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] === 'undefined'
    ){
      allAvailable = true;
    }
    for(const table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }
      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }
  isTableAvailable(tableId, tableElem){
    const thisBooking = this;
    if(typeof thisBooking.booked[thisBooking.date] !== 'object'){
      return true;
    }
    const startHour = thisBooking.hour;
    const endingHour = startHour + thisBooking.hoursAmountWidget.value;
    for(let hourBlock = startHour; hourBlock < endingHour; hourBlock += 0.5){
      const bookedTablesList = thisBooking.booked[thisBooking.date][hourBlock];
      if(bookedTablesList instanceof Array && bookedTablesList.indexOf(tableId) >= 0){
        if(!tableElem.classList.contains(classNames.booking.tableBooked)){
          thisBooking.notAvailableTableInfo(hourBlock);
        }
        return false;
      }
    }
    return true;
  }
  notAvailableTableInfo(hourNotAvailable){
    hourNotAvailable = utils.numberToHour(hourNotAvailable);
    const message = settings.booking.failedBookingInfo + hourNotAvailable + '.';
    alert(message);
  }
  bookTable(tableId, tableElem){
    const thisBooking = this;
    thisBooking.tableBookedByUser = tableId;
    thisBooking.tableBookedByUserDOM = tableElem;
    tableElem.classList.add(classNames.booking.userBookedTable);
  }
  unBookTable(){
    const thisBooking = this;
    thisBooking.tableBookedByUser = null;
    thisBooking.tableBookedByUserDOM.classList.remove(classNames.booking.userBookedTable);
    thisBooking.tableBookedByUserDOM = null;
  }
  processBooking(evt){
    const thisBooking = this;
    const tableClicked = utils.lookForEventTarget(evt, select.booking.tables);
    if(!tableClicked){
      return;
    }
    const tableId = parseInt(tableClicked.getAttribute(settings.booking.tableIdAttribute));
    if(thisBooking.isTableAvailable(tableId, tableClicked)){
      const laterBookedTableId = thisBooking.tableBookedByUser;
      if(laterBookedTableId){
        thisBooking.unBookTable();
      }
      if(laterBookedTableId === tableId){
        return;
      }
      thisBooking.bookTable(tableId, tableClicked);
    }
  }
  sendBooking(){
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.bookings;
    const payload = {
      date: thisBooking.date,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.tableBookedByUser,
      duration: thisBooking.hoursAmountWidget.value,
      ppl: thisBooking.peopleAmountWidget.value,
      starters: [],
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value
    };
    for(const input of thisBooking.dom.starters){
      if(input.checked){
        payload.starters.push(input.value);
      }
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
        if(rawResponse.status >= 200 && rawResponse.status < 300){
          return rawResponse.json();
        } else {
          return Promise.reject();
        }
      })
      .then(function(parsedResponse){
        thisBooking.makeBooked(parsedResponse.date, parsedResponse.hour, parsedResponse.duration, parsedResponse.table);
        let message = `You've booked table no ${parsedResponse.table} succesfully. `;
        message += `Your reservation starts ${parsedResponse.date} at ${parsedResponse.hour}. `;
        message += `Please, remember your reservation number ${parsedResponse.id}, when you come.`;
        alert(message);
      })
      .catch(function(){
        alert(settings.errorMessage);
      });
  }
}

export default Booking;

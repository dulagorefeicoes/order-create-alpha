class OrderCustomer {

  constructor(orderRef) {

    this.orderRef = orderRef;

    this.element = document.createElement('div');

    this.build();

  }

  build() {

    this.element.className = 'OrderCustomer row';

    this.element.customerName = this.buildCustomerNameFieldElement();
    this.element.deliveryTime = this.buildDeliveryTimeFieldElement();

  }

  buildCustomerNameFieldElement() {

    const element = document.createElement('div');
    element.className = 'OrderCustomer-customerNameField input-field col s8';
    this.element.appendChild(element);

    // input
    element.input = document.createElement('input');
    element.input.className = 'validate';
    element.input.id = this.orderRef.key + '-customerName';
    element.input.type = 'text';
    element.input.addEventListener('input', () => {

      this.orderRef.child('customerName').set(element.input.value);

    });
    this.orderRef.child('customerName').on('value', snap => {

      if (snap.val() !== element.input.value)
        element.input.value = snap.val();

    });
    element.appendChild(element.input);

    // label
    element.label = document.createElement('label');
    this.orderRef.child('customerName').on('value', snap => {
      if (snap.val()) element.label.classList = 'active';
    });
    element.label.htmlFor = element.input.id;
    element.label.innerHTML = 'Nome';
    element.appendChild(element.label);

    M.updateTextFields();

    return element;

  }

  buildDeliveryTimeFieldElement() {

    let newTime = '00:00';

    if (moment())
      newTime = moment().add(20, 'minutes').format('hh:mm');

    const element = document.createElement('div');
    element.className = 'OrderCustomer-deliveryTime input-field col s4';
    this.element.appendChild(element);

    // input
    element.input = document.createElement('input');
    element.input.id = this.orderRef.key + '-customerName';
    element.input.type = 'time';
    element.input.step = '300';
    element.input.addEventListener('focus', () => {

      let newTime = '00:00';

      if (moment())
        newTime = moment().add(20, 'minutes').format('HH:mm');

      this.orderRef.child('deliveryTime').set(newTime);

      element.input.select();

    });
    element.input.addEventListener('input', () => {

      this.orderRef.child('deliveryTime').set(element.input.value);

    });
    this.orderRef.child('deliveryTime').once('value', snap => {

      if (!snap.val())
        this.orderRef.child('deliveryTime').set(newTime);

    });
    this.orderRef.child('deliveryTime').on('value', snap => {

      element.input.value = snap.val();

    });
    element.appendChild(element.input);

    // label
    element.label = document.createElement('label');
    element.label.className = 'active';
    element.label.htmlFor = element.input.id;
    element.label.innerHTML = 'Entrega';
    element.appendChild(element.label);

    M.updateTextFields();

    return element;

  }

  focus() {

    try {
      this.element.customerName.input.focus();
    } catch (e) {
      console.log(e);
    }

  }

}
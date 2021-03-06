class OrderPriceAmount {

  constructor(order) {

    this.order = order;

    this.orderRef = this.order.orderRef;
    this.orderItemsRef = this.orderRef.child('items');
    this.orderBillingRef = this.orderRef.child('billing');
    this.orderPriceAmountRef = this.orderBillingRef.child('priceAmount');
    this.orderPriceAmountUnlockedRef = this.orderBillingRef.child('priceAmountUnlocked');

    this.element = document.createElement('div');
    this.priceAmount = 0.00;
    this.priceAmountUnlocked = null;
    this.isDeleted = false;

    this.init();

  }

  init() {

    this.build();

    this.orderRef.child('isDeleted').on('value', snap => {

      this.isDeleted = !!snap.val();

      if (!this.isDeleted) {
        this.orderPriceAmountUnlockedRef.on('value', snap => this.setPriceAmountUnlocked(!!snap.val()));
        this.orderItemsRef.on('value', snap => this.update(snap.val()));
      } else {
        this.orderPriceAmountUnlockedRef.off();
        this.orderItemsRef.off();
      }

    });

  }

  build() {

    this.element.className = 'OrderPriceAmount row';

    this.element.inputField = this.buildInputFieldElement();
    this.element.switcher = this.buildSwitcherElement();
    this.element.copyButton = this.buildCopyButtonElement();

  }

  buildInputFieldElement() {

    const element = document.createElement('div');
    element.className = 'input-field col s4';

    element.input = document.createElement('input');
    element.input.id = this.orderRef.key + '-priceAmountInput';
    element.input.type = 'number';
    element.input.min = '0.00';
    element.input.step = '1';
    element.input.disabled = true;
    element.input.addEventListener('focus', () => element.input.select());
    element.input.addEventListener('blur', () => element.input.value = Order.parseValue(element.input.value, true));
    element.input.addEventListener('change', () => this.orderPriceAmountRef.set(Order.parseValue(element.input.value)));
    this.orderPriceAmountRef.on('value', snap => element.input.value = Order.parseValue(snap.val(), true));
    this.orderPriceAmountUnlockedRef.on('value', snap => element.input.disabled = !snap.val());
    element.appendChild(element.input);

    element.label = document.createElement('label');
    element.label.className = 'active';
    this.orderPriceAmountRef.on('value', snap => {

      element.label.className = snap.val() !== null ? 'active' : '';

    });
    element.label.innerHTML = 'Total';
    element.label.htmlFor = element.input.id;
    element.appendChild(element.label);

    this.element.appendChild(element);

    return element;

  }

  buildSwitcherElement() {

    const element = document.createElement('div');
    element.className = 'switch col s6';

    element.label = document.createElement('label');
    element.appendChild(element.label);

    element.input = document.createElement('input');
    element.input.type = 'checkbox';
    element.input.addEventListener('change', () => this.orderBillingRef.child('priceAmountUnlocked').set(element.input.checked));
    this.orderBillingRef.child('priceAmountUnlocked').on('value', snap => element.input.checked = !!snap.val());
    element.label.appendChild(element.input);

    element.label.span = document.createElement('span');
    element.label.span.className = 'lever';
    element.label.appendChild(element.label.span);

    element.label.text = document.createTextNode('alterar');
    element.label.appendChild(element.label.text);

    this.element.appendChild(element);

    return element;

  }

  buildCopyButtonElement() {

    const element = document.createElement('button');
    new ClipboardJS(element);
    element.className = 'btn-flat col s2';
    element.dataset.clipboardText = '';
    element.innerHTML = '<i class="material-icons">content_copy</i>'
    this.element.appendChild(element);

    this.orderPriceAmountRef.on('value', snap => {
      let price = 'R$' + Order.parseValue(snap.val(), true).replace('.', ',');
      element.dataset.clipboardText = 'O valor total do pedido é de *' + price + '*, precisa de troco?'
    });

    return element;

  }

  update(orderItems) {

    if (!this.priceAmountUnlocked && !!orderItems) {

      let priceList = [];

      Object.values(orderItems).forEach(item => priceList.push({
        itemPrice: item.itemPrice || 0,
        quantity: item.quantity || 0
      }));

      this.setPriceAmount(OrderPriceAmount.recalculate(priceList));

    }

  }

  setPriceAmount(priceAmount = 0) {

    this.priceAmount = Order.parseValue(priceAmount);
    this.orderPriceAmountRef.set(this.priceAmount);

  }

  setPriceAmountUnlocked(unlocked = false) {

    if (this.priceAmountUnlocked === true) {
      this.priceAmountUnlocked = unlocked;
      if (!unlocked)
        this.orderItemsRef.once('value', snap => this.update(snap.val()));
    } else {
      this.priceAmountUnlocked = unlocked;
    }


  }

  static recalculate(priceList) {

    let priceAmount = 0;
    Object.values(priceList).forEach(itemPrice => priceAmount += itemPrice.itemPrice * itemPrice.quantity);
    return priceAmount;

  }

}
class OrderPaymentList {

  constructor(orderRef) {

    this.orderRef = orderRef;
    this.orderBillingRef = this.orderRef.child('billing');

    this.element = document.createElement('div');
    this.paymentList = [];

    this.init();

  }

  init() {

    this.build();

    this.orderBillingRef.child('payments').on('child_added', snap => {

      this.pushPaymentItem(snap.ref);

    });

    this.orderBillingRef.child('payments').on('child_removed', snap => {

      this.delete(snap.ref);

    });

  }

  build() {

    this.element.className = 'OrderPaymentList row';

    this.element.paymentList = this.buildPaymentListElement();
    this.element.actions = this.buildActionsElement();

  }

  buildPaymentListElement() {

    const element = document.createElement('div');
    element.className = 'OrderItemList-list';
    this.element.appendChild(element);

    return element;

  }

  buildActionsElement() {

    const element = document.createElement('div');
    element.className = 'OrderPaymentList-actions';
    this.element.appendChild(element);

    element.addItemButton = document.createElement('button');
    element.addItemButton.className = 'waves-effect waves-light btn-small green light-1';
    element.addItemButton.innerHTML = 'Adicionar Pagamento';
    element.addItemButton.addEventListener('click', () => {

      this.addItem('money');

    });
    element.appendChild(element.addItemButton);

    return element;

  }

  addItem(method) {

    this.orderBillingRef.child('payments').push({
      method: method || '',
      paidValue: 0.00,
      referenceValue: 0.00
    });

  }

  pushPaymentItem(orderPaymentItemRef) {

    if (orderPaymentItemRef) {

      let paymentItem = new OrderPaymentItem(orderPaymentItemRef);
      this.paymentList.push(paymentItem);
      this.element.paymentList.appendChild(paymentItem.element);

    }

  }

  delete(orderPaymentItemRef) {

    for (let i = this.paymentList.length; i--; ) {

      if (this.paymentList[i].orderPaymentItemRef.key === orderPaymentItemRef.key)
        this.paymentList.splice(i, 1);

    }

  }

}
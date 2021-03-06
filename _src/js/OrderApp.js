class OrderApp {

  constructor(element, databaseRef, socket) {

    this.element = element;
    this.databaseRef = databaseRef;
    this.socket = socket;

    // define database instances
    this.ordersRef = this.databaseRef.ref('orders');
    this.ordersViewsRef = this.databaseRef.ref('ordersViews');
    this.activeOrdersViewRef = this.ordersViewsRef.child(moment().format('YYYY-MM-DD'));

    // define components instances
    this.customerList = new CustomerList(this.databaseRef);
    this.orderList = new OrderList(this, 'OrderApp-orderList', true);
    this.timeline = new Timeline(this, 'OrderApp-timeline', true);
    this.agenda = new Agenda(this, 'OrderApp-agenda', false);

    this.activeOrderRef = false;

    this.init();

  }

  init() {

    this.build();

    this.orderList.ordersViewRef.on('child_added', snap => {

      if (this.activeOrderRef)
        if (this.activeOrderRef.key === snap.key)
          this.orderList.open(snap.key, true);

      this.activeOrderRef = false;

    });

    window.addEventListener('keydown', event => {
      if (event.keyCode === 113 && event.shiftKey) {
        // shift + f2
        this.addNewOrderToList();
      } else if (event.keyCode === 114 && event.shiftKey) {
        // shift + f3
        event.preventDefault();
        console.log('pesquisando...');
      }
    });

  }

  build() {

    this.timeline.active(this.element);

    if (window.innerWidth < 601)
      this.timeline.inactive(this.element);

    //   this.agenda.active(this.element);

    this.element.inner = document.createElement('div');
    this.element.inner.className = 'OrderApp-inner';
    this.element.append(this.element.inner);

    this.element.header = this.buildHeaderElement();

    this.element.inner.appendChild(this.orderList.element);
    this.element.inner.appendChild(this.timeline.element);
    this.element.inner.appendChild(this.agenda.element);

    this.actionButtons = document.createElement('div');
    this.actionButtons.className = 'OrderApp-actionButtons';
    this.element.inner.append(this.actionButtons);

    this.element.floatingActionButton = this.buildFloatingActionButton();

  }

  buildHeaderElement() {

    const element = document.createElement('header');
    element.className = 'OrderApp-header navbar-fixed';
    this.element.inner.appendChild(element);

    element.nav = document.createElement('nav');
    element.nav.className = 'grey darken-4';
    element.appendChild(element.nav);

    element.nav.wrapper = document.createElement('div');
    element.nav.wrapper.className = 'nav-wrapper';
    element.nav.appendChild(element.nav.wrapper);

    // brand
    element.nav.brandLogo = document.createElement('a');
    element.nav.brandLogo.className = 'brand-logo';
    element.nav.brandLogo.innerHTML = 'Du Lago App';
    element.nav.wrapper.appendChild(element.nav.brandLogo);

    // menu
    element.nav.menu = document.createElement('ul');
    element.nav.menu.className = 'right';
    element.nav.wrapper.appendChild(element.nav.menu);

    // agenda trigger
    element.nav.menu.agendaTrigger = document.createElement('li');
    element.nav.menu.appendChild(element.nav.menu.agendaTrigger);

    element.nav.menu.agendaTrigger.link = document.createElement('a');
    element.nav.menu.agendaTrigger.link.className = 'waves-effect waves-light';
    element.nav.menu.agendaTrigger.link.innerHTML = '<i class="material-icons">import_contacts</i>';
    element.nav.menu.agendaTrigger.link.addEventListener('click', () => this.agenda.toggle());
    element.nav.menu.agendaTrigger.appendChild(element.nav.menu.agendaTrigger.link);

    // timeline trigger
    element.nav.menu.timelineTrigger = document.createElement('li');
    element.nav.menu.appendChild(element.nav.menu.timelineTrigger);

    element.nav.menu.timelineTrigger.link = document.createElement('a');
    element.nav.menu.timelineTrigger.link.className = 'waves-effect waves-light';
    element.nav.menu.timelineTrigger.link.innerHTML = '<i class="material-icons">view_list</i>';
    element.nav.menu.timelineTrigger.link.addEventListener('click', () => this.timeline.toggle());
    element.nav.menu.timelineTrigger.appendChild(element.nav.menu.timelineTrigger.link);

    return element;

  }

  buildFloatingActionButton() {

    const element = document.createElement('div');
    element.className = 'fixed-action-btn';
    this.actionButtons.appendChild(element);

    // btn element
    element.btn = document.createElement('a');
    element.btn.className = 'waves-effect waves-light btn-floating btn-large orange light-1';
    element.appendChild(element.btn);
    // icon
    element.btn.icon = document.createElement('i');
    element.btn.icon.className = 'large material-icons';
    element.btn.icon.innerHTML = 'add';
    element.btn.append(element.btn.icon);
    element.btn.addEventListener('click', event => {
      this.addNewOrderToList();
    });

    element.instance = M.FloatingActionButton.init(element);

    return element;

  }

  addNewOrderToList() {

    this.activeOrderRef = Order.create(this.ordersRef, this.activeOrdersViewRef);

    try {

      M.toast({
        html: 'Pedido Criado!',
        displayLength: 2000
      });

    } catch (e) {

      console.log('materialize error');

    }

  }

}

class CustomerAutoComplete {

  constructor(orderRefKey = '', property = 'customerName', customerList = false, fallback = false, element = document.createElement('div')) {

    this.orderRefKey = orderRefKey;
    this.property = property;
    this.customerList = customerList;
    this.element = element;
    this.fallback = fallback;

    // ui variables
    this.currentView = [];
    this.focusedItemIndex = -1;
    this.isActive = false;
    this.expandTimeout = false;
    this.hold = false;

    this.init();

  }

  init() {

    this.build();

    this.element.input.addEventListener('input', () => {
      this.query();
    });
    this.element.input.addEventListener('blur', () => this.closeDropdown(0));

    this.element.dropdown.addEventListener('mouseover', () => this.hold = true);
    this.element.dropdown.addEventListener('mouseout', () => this.hold = false);

    this.element.input.addEventListener('keydown', event => {

      if (!this.isActive) {

        if (event.keyCode === M.keys.ARROW_DOWN)
          this.query();

      } else if (this.currentView.length > 0) {

        if (event.keyCode === M.keys.ARROW_UP)
          this.focusedItemIndex = this.focusedItemIndex > 0 ? this.focusedItemIndex - 1 : 0;
        else if (event.keyCode === M.keys.ARROW_DOWN)
          this.focusedItemIndex = this.focusedItemIndex === this.currentView.length - 1 ? this.focusedItemIndex : this.focusedItemIndex + 1;
        else if (event.keyCode === M.keys.ENTER && this.focusedItemIndex > -1)
          this.setFocusToItem(this.currentView[this.focusedItemIndex], true);

        this.setFocusToItem(this.currentView[this.focusedItemIndex]);

      }

    });

  }

  build() {

    this.element.classList.add('AutoComplete', 'input-field');

    this.element.input = document.createElement('input');
    this.element.input.type = 'text';
    this.element.input.id = this.orderRefKey + '-' + this.property;
    this.element.appendChild(this.element.input);

    this.element.dropdown = document.createElement('ul');
    this.element.dropdown.className = 'dropdown-content';
    this.element.appendChild(this.element.dropdown);


    this.element.label = document.createElement('label');
    this.element.label.htmlFor = this.element.input.id;
    this.element.label.innerHTML = 'Nome';
    this.element.appendChild(this.element.label);

  }

  showDropdown(customerList, activeItem = -1) {

    this.isActive = true;
    this.focusedItemIndex = activeItem;
    this.currentView = [];

    if (this.expandTimeout)
      clearTimeout(this.expandTimeout);

    const dropdown = this.element.dropdown;
    const rect = this.element.getBoundingClientRect();

    dropdown.style.left = window.getComputedStyle(this.element, null).getPropertyValue('padding-left');
    dropdown.style.display = 'block';
    dropdown.style.width = this.element.input.offsetWidth + 'px';
    dropdown.style.opacity = '1';
    dropdown.style.transformOrigin = '0px 0px 0px';
    dropdown.style.transform = 'scaleX(1) scaleY(1)';
    dropdown.style.top = 'auto';
    dropdown.style.bottom = 'auto';

    let height = customerList.length * 60;

    if (customerList.length > 2 && window.innerHeight < 400)
      height = 60 * 2.5;
    else if (customerList.length > 3 && window.innerHeight < 500)
      height = 60 * 3;
    else if (customerList.length > 4 && window.innerHeight < 600)
      height = 60 * 4;
    else if (customerList.length > 5)
      height = 60 * 5;

    dropdown.style.height = height + 'px';

    this.destroyDropdown();

    customerList.forEach(customer => {
      let item = new CustomerAutoCompleteItem(customer, this);
      dropdown.appendChild(item.element);
      item.highlight(this.element.input.value);
      this.currentView.push(item);
    });

    if (this.element.dropdown.delay)
      clearTimeout(this.element.dropdown.delay);

    this.element.dropdown.delay = setTimeout(() => {

      if (rect.bottom + dropdown.offsetHeight > window.innerHeight)
        dropdown.style.bottom = 0;
      else
        dropdown.style.top = this.element.input.offsetHeight + 'px';

    }, 100);

  }

  closeDropdown(time = 300, isForced = false) {

    if (this.expandTimeout)
      clearTimeout(this.expandTimeout);

    this.expandTimeout = setTimeout(() => {
      if (!this.hold || isForced) {
        this.isActive = false;
        this.destroyDropdown();
        this.element.dropdown.style = null;
      }
    }, time);

  }

  destroyDropdown() {

    this.isActive = true;

    while (this.element.dropdown.firstChild)
      this.element.dropdown.removeChild(this.element.dropdown.firstChild);

  }

  query() {

    const result = this.customerList.query(this.element.input.value, this.property);

    if (result.length)
      this.showDropdown(result);
    else
      this.closeDropdown();

  }

  setFocusToItem(item, select = false) {

    if (item) {

      this.currentView.forEach(item => item.blur());
      item.focus();

      if (select)
        this.select(item);

    }

  }

  select(item) {

    this.element.input.value = item.customer.data[this.property];
    this.closeDropdown(10, true);

    if (this.fallback)
      this.fallback(item);

  }

}
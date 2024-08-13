document.addEventListener('DOMContentLoaded', function () {
    const tagForm = document.getElementById('tag-form');
    const typeForm = document.getElementById('type-form');
    const productForm = document.getElementById('inventory-form');
    const customerForm = document.getElementById('customer-form');
    const tagSelect = document.getElementById('product-tags');
    const typeSelect = document.getElementById('product-type');
    const filterTags = document.getElementById('filter-tags');
    const filterTypes = document.getElementById('filter-types');
    const filterProductName = document.getElementById('filter-product-name');
    const inventoryList = document.getElementById('inventory-list');
    const customerList = document.getElementById('customer-list');
    const cartList = document.getElementById('cart-list');
    const checkoutButton = document.getElementById('checkout-button');
    const tagList = document.getElementById('tag-list');
    const typeList = document.getElementById('type-list');
    const customerOrdersList = document.getElementById('order-list');
    const orderDateInput = document.getElementById('order-date');
    const customerSelect = document.getElementById('customer-select');

    document.getElementById('export-customers').addEventListener('click', exportCustomersToExcel);

    let cart = [];
    cart = getCart();

    tagForm.addEventListener('submit', addTag);
    typeForm.addEventListener('submit', addType);
    productForm.addEventListener('submit', addProduct);
    customerForm.addEventListener('submit', addCustomer);
    inventoryList.addEventListener('click', handleInventoryListClick);
    customerList.addEventListener('click', removeCustomer);
    tagList.addEventListener('click', removeTag);
    typeList.addEventListener('click', removeType);
    filterTags.addEventListener('change', filterProducts);
    filterTypes.addEventListener('change', filterProducts);
    filterProductName.addEventListener('input', filterProducts);
    checkoutButton.addEventListener('click', checkout);

    displayTags();
    displayTypes();
    displayFilterTags();
    displayFilterTypes();
    displayInventory();
    displayCustomers();
    displayCart();
    displayCustomerOrders();

    function addTag(e) {
        e.preventDefault();
        const tagName = document.getElementById('tag-name').value;
        let tags = getTags();
        tags.push(tagName);
        saveTags(tags);
        displayTags();
        displayFilterTags();
        tagForm.reset();
    }

    function addType(e) {
        e.preventDefault();
        const typeName = document.getElementById('type-name').value;
        let types = getTypes();
        types.push(typeName);
        saveTypes(types);
        displayTypes();
        displayFilterTypes();
        typeForm.reset();
    }

    function addProduct(e) {
        e.preventDefault();
        const productName = document.getElementById('product-name').value;
        const productQuantity = parseInt(document.getElementById('product-quantity').value);
        const selectedTags = Array.from(tagSelect.selectedOptions).map(option => option.value);
        const productType = typeSelect.value;

        let inventory = getInventory();
        let existingProduct = inventory.find(product =>
            product.name === productName &&
            product.type === productType &&
            selectedTags.every(tag => product.tags.includes(tag)) &&
            product.tags.length === selectedTags.length
        );

        if (existingProduct) {
            existingProduct.quantity += productQuantity;
        } else {
            const product = {
                name: productName,
                quantity: productQuantity,
                tags: selectedTags,
                type: productType
            };
            inventory.push(product);
        }

        saveInventory(inventory);
        displayInventory();
        productForm.reset();
    }

    function handleInventoryListClick(e) {
        if (e.target.classList.contains('remove')) {
            const index = e.target.getAttribute('data-index');
            let inventory = getInventory();
            inventory.splice(index, 1);
            saveInventory(inventory);
            displayInventory();
        } else if (e.target.classList.contains('add-to-cart')) {
            const index = e.target.getAttribute('data-index');
            const quantity = parseInt(prompt('Enter quantity to add to cart:', '1'));
            if (!isNaN(quantity) && quantity > 0) {
                addToCart(index, quantity);
            }
        }
    }

    function displayInventory(filterTag = '', filterType = '', filterName = '') {
        inventoryList.innerHTML = ''; // Clear existing content
        let inventory = getInventory();
        inventory = inventory.filter(product =>
            (filterTag === '' || product.tags.includes(filterTag)) &&
            (filterType === '' || product.type === filterType) &&
            (filterName === '' || product.name.toLowerCase().includes(filterName.toLowerCase()))
        );

        inventory.forEach((product, index) => {
            const row = document.createElement('tr'); // Create a table row

            // Create and append individual table data cells
            const nameCell = document.createElement('td');
            nameCell.textContent = product.name;
            row.appendChild(nameCell);

            const quantityCell = document.createElement('td');
            quantityCell.textContent = product.quantity;
            row.appendChild(quantityCell);

            const typeCell = document.createElement('td');
            typeCell.textContent = product.type;
            row.appendChild(typeCell);

            const tagsCell = document.createElement('td');
            tagsCell.textContent = product.tags.join(', ');
            row.appendChild(tagsCell);

            const actionsCell = document.createElement('td');
            actionsCell.innerHTML = `
                <button class="add-to-cart" data-index="${index}">Add to Cart</button>
                <button class="remove" data-index="${index}">Remove</button>
            `;
            row.appendChild(actionsCell);

            // Append the row to the table body
            inventoryList.appendChild(row);
        });
    }

    function addCustomer(e) {
        e.preventDefault();
        const name = document.getElementById('customer-name').value;
        const address = document.getElementById('customer-address').value;
        const mobile = document.getElementById('customer-mobile').value;

        const customer = {
            name,
            address,
            mobile,
            orders: [] // Initialize orders array
        };

        let customers = getCustomers();
        customers.push(customer);
        saveCustomers(customers);

        displayCustomers();
        customerForm.reset();
    }

    function removeCustomer(e) {
        if (e.target.classList.contains('remove')) {
            const index = e.target.getAttribute('data-index');
            let customers = getCustomers();
            customers.splice(index, 1);
            saveCustomers(customers);
            displayCustomers();
        }
    }

    function removeTag(e) {
        if (e.target.classList.contains('remove-tag')) {
            const index = e.target.getAttribute('data-index');
            let tags = getTags();
            tags.splice(index, 1);
            saveTags(tags);
            displayTags();
            displayFilterTags();
        }
    }

    function removeType(e) {
        if (e.target.classList.contains('remove-type')) {
            const index = e.target.getAttribute('data-index');
            let types = getTypes();
            types.splice(index, 1);
            saveTypes(types);
            displayTypes();
            displayFilterTypes();
        }
    }

    function filterProducts() {
        const selectedTag = filterTags.value;
        const selectedType = filterTypes.value;
        const filterName = filterProductName.value.toLowerCase();
        displayInventory(selectedTag, selectedType, filterName);
    }

    function getTags() {
        const tags = localStorage.getItem('tags');
        return tags ? JSON.parse(tags) : [];
    }

    function saveTags(tags) {
        localStorage.setItem('tags', JSON.stringify(tags));
    }

    function displayTags() {
        tagSelect.innerHTML = ''; // Clear previous options
        tagList.innerHTML = ''; // Clear the tag list display

        let tags = getTags(); // Fetch tags from localStorage or another source

        // Populate the tagSelect with options
        tags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            tagSelect.appendChild(option);
        });

        // Populate the tagList with tags and remove buttons
        tags.forEach((tag, index) => {
            const div = document.createElement('div');
            div.className = 'tag';

            div.innerHTML = `
                <span class="tag-text">${tag}</span>
                <button class="remove-tag" data-index="${index}">&times;</button> <!-- Use 'remove-tag' class -->
            `;
            tagList.appendChild(div);
        });
    }

    function displayTypes() {
        typeSelect.innerHTML = ''; // Clear previous options
        typeList.innerHTML = ''; // Clear the type list display

        let types = getTypes(); // Fetch types from localStorage or another source

        // Populate the typeSelect with options
        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            typeSelect.appendChild(option);
        });

        // Populate the typeList with types and remove buttons
        types.forEach((type, index) => {
            const div = document.createElement('div');
            div.className = 'type';

            div.innerHTML = `
                <span class="type-text">${type}</span>
                <button class="remove-type" data-index="${index}">&times;</button> <!-- Use 'remove-type' class -->
            `;
            typeList.appendChild(div);
        });
    }

    function displayFilterTags() {
        filterTags.innerHTML = '<option value="">All</option>';
        let tags = getTags();
        tags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            filterTags.appendChild(option);
        });
    }

    function getTypes() {
        const types = localStorage.getItem('types');
        return types ? JSON.parse(types) : [];
    }

    function saveTypes(types) {
        localStorage.setItem('types', JSON.stringify(types));
    }

    function displayFilterTypes() {
        filterTypes.innerHTML = '<option value="">All</option>';
        let types = getTypes();
        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            filterTypes.appendChild(option);
        });
    }

    function getInventory() {
        const inventory = localStorage.getItem('inventory');
        return inventory ? JSON.parse(inventory) : [];
    }

    function saveInventory(inventory) {
        localStorage.setItem('inventory', JSON.stringify(inventory));
    }

    function getCustomers() {
        const customers = localStorage.getItem('customers');
        return customers ? JSON.parse(customers) : [];
    }

    function saveCustomers(customers) {
        localStorage.setItem('customers', JSON.stringify(customers));
    }

    function addToCart(index, quantity) {
        let inventory = getInventory();
        let product = inventory[index];
        if (product.quantity >= quantity) {
            cart.push({ ...product, quantity });
            product.quantity -= quantity;
            saveInventory(inventory);
            displayCart();
            displayInventory();
        } else {
            alert('Not enough quantity available.');
        }
    }

    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function getCart() {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }

    function addToCart(index, quantity) {
        let inventory = getInventory();
        let product = inventory[index];
        if (product.quantity >= quantity) {
            cart.push({ ...product, quantity });
            product.quantity -= quantity;
            saveInventory(inventory);
            saveCart(cart); // Save cart to local storage
            displayCart();
            displayInventory();
        } else {
            alert('Not enough quantity available.');
        }
    }

    function removeFromCart(index) {
        // Retrieve the item to be removed from the cart
        const item = cart[index];

        // Add the item's quantity back to the inventory
        let inventory = getInventory();
        let existingProduct = inventory.find(product =>
            product.name === item.name &&
            product.type === item.type &&
            item.tags.every(tag => product.tags.includes(tag)) &&
            product.tags.length === item.tags.length
        );

        if (existingProduct) {
            existingProduct.quantity += item.quantity;
        } else {
            // If the product does not exist in inventory, add it
            inventory.push({ ...item, quantity: item.quantity });
        }

        saveInventory(inventory); // Update inventory in local storage

        // Remove the item from the cart
        cart.splice(index, 1);
        saveCart(cart); // Save updated cart to local storage

        displayCart(); // Refresh cart display
        displayInventory(); // Refresh inventory display
    }

    function displayCart() {
        cartList.innerHTML = '';

        cart.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <span>${item.name} - Quantity: ${item.quantity} - Type: ${item.type} - Tags: ${item.tags.join(', ')}</span>
                <button class="remove-from-cart" data-index="${index}">Remove</button>
            `;
            cartList.appendChild(div);
        });

        // Add event listener for the remove buttons
        document.querySelectorAll('.remove-from-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                removeFromCart(index);
            });
        });
    }

    function checkout() {
        const date = orderDateInput.value;
        const customerIndex = customerSelect.value;
    
        if (!date) {
            alert('Please select a date.');
            return;
        }
    
        if (customerIndex === '') {
            alert('Please select a customer.');
            return;
        }
    
        const customers = getCustomers();
        const selectedCustomer = customers[customerIndex];
        if (!selectedCustomer) {
            alert('Selected customer not found.');
            return;
        }
    
        const order = {
            customer: selectedCustomer,
            items: cart.map(item => ({
                name: item.name,
                quantity: item.quantity
            })),
            date: date
        };
    
        // Get existing orders or create a new array
        const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
        existingOrders.push(order);
        localStorage.setItem('orders', JSON.stringify(existingOrders));
    
        // Update inventory by reducing quantities of checked-out items
        let inventory = getInventory();
        cart.forEach(item => {
            let existingProduct = inventory.find(product =>
                product.name === item.name &&
                product.type === item.type &&
                item.tags.every(tag => product.tags.includes(tag)) &&
                product.tags.length === item.tags.length
            );
    
            if (existingProduct) {
                existingProduct.quantity -= item.quantity;
                if (existingProduct.quantity <= 0) {
                    // Remove product from inventory if quantity is zero or less
                    inventory = inventory.filter(product =>
                        !(product.name === item.name &&
                          product.type === item.type &&
                          item.tags.every(tag => product.tags.includes(tag)) &&
                          product.tags.length === item.tags.length)
                    );
                }
            }
        });
    
        saveInventory(inventory); 
    
        cart = [];
        saveCart(cart); 
    
        displayCart(); 
        displayInventory(); 
        displayCustomerOrders(); 
    }
    
    function displayCustomers() {
        customerList.innerHTML = '';
        customerSelect.innerHTML = '<option value="">Select a customer</option>';

        let customers = getCustomers();
        customers.forEach((customer, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.name}</td>
                <td>${customer.address}</td>
                <td>${customer.mobile}</td>
                <td>
                    <button class="remove" data-index="${index}">Remove</button>
                </td>
            `;
            customerList.appendChild(row);

            const option = document.createElement('option');
            option.value = index;
            option.textContent = customer.name;
            customerSelect.appendChild(option);
        });
    }

    function displayCustomerOrders() {
        customerOrdersList.innerHTML = '';
        let customers = getCustomers();
        customers.forEach(customer => {
            if (customer.orders) {
                customer.orders.forEach(order => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${customer.name}</td>
                        <td>${order.name}</td>
                        <td>${order.quantity}</td>
                        <td>${order.date}</td>
                    `;
                    customerOrdersList.appendChild(row);
                });
            }
        });
    }

    function displayCustomerOrders() {
        const customerOrdersList = document.getElementById('order-list'); // Make sure this element exists in your HTML
        if (!customerOrdersList) {
            console.error('Element with ID "order-list" not found.');
            return;
        }

        customerOrdersList.innerHTML = '';
        let customers = getCustomers();

        customers.forEach(customer => {
            if (customer.orders) {
                customer.orders.forEach((order, orderIndex) => {
                    const row = document.createElement('tr');
                    const totalQuantity = order.quantity; // Assuming order has a quantity property

                    row.innerHTML = `
                        <td>${customer.name}</td>
                        <td>${totalQuantity}</td>
                        <td>${order.date}</td>
                        <td>
                            <button class="remove-order" data-customer-index="${customers.indexOf(customer)}" data-order-index="${orderIndex}">Remove</button>
                            <button class="details-order" data-customer-index="${customers.indexOf(customer)}" data-order-index="${orderIndex}">Details</button>
                        </td>
                    `;

                    customerOrdersList.appendChild(row);
                });
            }
        });

        // Add event listeners for the buttons
        document.querySelectorAll('.remove-order').forEach(button => {
            button.addEventListener('click', (e) => {
                const customerIndex = e.target.dataset.customerIndex;
                const orderIndex = e.target.dataset.orderIndex;
                removeOrder(customerIndex, orderIndex);
            });
        });

        document.querySelectorAll('.details-order').forEach(button => {
            button.addEventListener('click', (e) => {
                const customerIndex = e.target.dataset.customerIndex;
                const orderIndex = e.target.dataset.orderIndex;
                showOrderDetails(customerIndex, orderIndex);
            });
        });
    }

    // Function to remove an order
    function removeOrder(customerIndex, orderIndex) {
        let customers = getCustomers();
        if (customers[customerIndex].orders) {
            customers[customerIndex].orders.splice(orderIndex, 1);
            saveCustomers(customers); // Save the updated customers array
            displayCustomerOrders(); // Refresh the order list display
        }
    }

    // Function to show order details
    function showOrderDetails(customerIndex, orderIndex) {
        let customers = getCustomers();
        const order = customers[customerIndex].orders[orderIndex];
        alert(`Order Details:\nCustomer: ${customers[customerIndex].name}\nDate: ${order.date}\nItems:\n${order.name}: ${order.quantity}`);
    }

    function exportCustomersToExcel() {
        const customers = getCustomers();
        const csvContent = "data:text/csv;charset=utf-8,"
            + ["Customer Name,Address,Mobile"]
                .concat(customers.map(customer => {
                    const orders = customer.orders ? customer.orders.map(order =>
                        `[${order.name}: ${order.quantity} on ${order.date}]`).join(' | ') : '';
                    return [customer.name, customer.address, customer.mobile, orders].join(',');
                }))
                .join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "customers.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

});

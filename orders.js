document.addEventListener('DOMContentLoaded', () => {
    const orderCustomerFilter = document.getElementById('order-customer-filter');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const filterOrdersButton = document.getElementById('filter-orders-button');
    const exportCustomerOrders = document.getElementById('export-customer-orders');
    const customerOrdersList = document.getElementById('order-list');

    function getOrders() {
        try {
            const orders = localStorage.getItem('orders');
            if (!orders) {
                console.warn('No orders found in localStorage');
                return [];
            }
            return JSON.parse(orders);
        } catch (error) {
            console.error('Error parsing orders from localStorage:', error);
            return [];
        }
    }

    function getCustomers() {
        try {
            const customers = localStorage.getItem('customers');
            if (!customers) {
                console.warn('No customers found in localStorage');
                return [];
            }
            return JSON.parse(customers);
        } catch (error) {
            console.error('Error parsing customers from localStorage:', error);
            return [];
        }
    }

    function populateCustomerFilter() {
        const customers = getCustomers();
        if (!customers.length) {
            console.warn('No customers available to populate filter');
        }
        const customerNames = Array.from(new Set(customers.map(customer => customer.name)));
        orderCustomerFilter.innerHTML = '<option value="">All</option>';
        customerNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            orderCustomerFilter.appendChild(option);
        });
    }

    function displayOrders() {
        const orders = getOrders();
        console.log('Retrieved Orders:', orders);

        const customerName = orderCustomerFilter.value;
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);

        const filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.date);
            const matchesCustomer = !customerName || order.customer.name === customerName;
            const matchesStartDate = isNaN(startDate) || orderDate >= startDate;
            const matchesEndDate = isNaN(endDate) || orderDate <= endDate;
            return matchesCustomer && matchesStartDate && matchesEndDate;
        });

        console.log('Filtered Orders:', filteredOrders);

        customerOrdersList.innerHTML = '';
        filteredOrders.forEach((order, index) => {
            const totalQuantity = order.items.reduce((total, item) => total + item.quantity, 0);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.customer.name}</td>
                <td>${totalQuantity}</td>
                <td>${order.date}</td>
                <td>
                    <button class="remove-order" data-index="${index}">Remove</button>
                    <button class="details-order" data-index="${index}">Details</button>
                </td>
            `;
            customerOrdersList.appendChild(row);
        });

        document.querySelectorAll('.remove-order').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                removeOrder(index);
            });
        });

        document.querySelectorAll('.details-order').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                showOrderDetails(index);
            });
        });
    }

    function removeOrder(index) {
        try {
            const orders = getOrders();
            if (index < 0 || index >= orders.length) {
                console.error('Invalid order index');
                return;
            }
            orders.splice(index, 1);
            localStorage.setItem('orders', JSON.stringify(orders));
            displayOrders();
        } catch (error) {
            console.error('Error removing order:', error);
        }
    }

    // Function to show order details
    function showOrderDetails(index) {
        const orders = getOrders();
        if (index < 0 || index >= orders.length) {
            console.error('Invalid order index');
            return;
        }
        const order = orders[index];
        const customer = order.customer;

        // Calculate total quantity
        const totalQuantity = order.items.reduce((total, item) => total + item.quantity, 0);

        // Construct order details
        const orderDetails = `
            Customer Details:
            Name: ${customer.name}
            Address: ${customer.address}
            Contact: ${customer.mobile}

            Order Date: ${order.date}
            Total Quantity: ${totalQuantity}
            Items:
            ${order.items.map(item => `${item.name}: ${item.quantity}`).join('\n')}
        `;

        // Display order details
        const orderDetailsContent = document.getElementById('order-details-content');
        orderDetailsContent.textContent = orderDetails;

        const orderDetailsSection = document.getElementById('order-details');
        orderDetailsSection.style.display = 'block';
    }

    function exportToExcel(data, filename) {
        try {
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
            XLSX.writeFile(workbook, filename);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
        }
    }

    function exportCustomerOrdersToExcel() {
        const orders = getOrders();
        const customerName = orderCustomerFilter.value;
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);

        const filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.date);
            const matchesCustomer = !customerName || order.customer.name === customerName;
            const matchesStartDate = isNaN(startDate) || orderDate >= startDate;
            const matchesEndDate = isNaN(endDate) || orderDate <= endDate;
            return matchesCustomer && matchesStartDate && matchesEndDate;
        });

        const formattedOrders = filteredOrders.map(order => ({
            'Order Date': order.date,
            'Customer Name': order.customer.name,
            'Items': order.items.map(item => `${item.name} (Qty: ${item.quantity})`).join('; ')
        }));

        exportToExcel(formattedOrders, 'customer_orders.xlsx');
    }

    function initialize() {
        populateCustomerFilter();
        displayOrders();
    }

    filterOrdersButton.addEventListener('click', displayOrders);
    exportCustomerOrders.addEventListener('click', exportCustomerOrdersToExcel);

    initialize();
});


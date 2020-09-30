// We will be using anonoymous/IIFE function method to keep our
// codes private from the public. Outside cannot access the code. 
// This will be our module pattern.

// BUDGET CONTROLLER - IIFE FUNCTION
var budgetController = (function() {

    // Private methods - Only this module can access it
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }; 

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });

        data.totals[type] = sum; 
    };

    // Creating data structure for storing our data
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1 // This means it doesn't exist if the budget is 0
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            // Create new ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc') {
                newItem = new Expense(ID, des, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

            // Return the id from the current type 
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            // Return index number of the array
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {

            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of income that we spent 
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1; // Non-existent
            }

        },

        calculatePercentages: function() {
            /*
            expenses a = 20
                     b = 10
                     c = 40
            income = 100
            a = 20/100 = 20%
            b = 10/100 = 10%
            c = 40/100 = 40%
            */

            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentage: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function() {
            console.log(data);
        }
    };

})();


// UI CONTROLLER - IIFE FUNCTION
var UIController = (function() {

    // Create an object for strings
    // Easier to change the class names later if we have to
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;

        /*
            + or - before number
            exactly 2 decimal points
            comma seperating the thousands

            2310.3233 -> + 2,310.32
            2000 -> + 2,000.00
            */

        // abs (absolutt) removes the sign of the number
        num = Math.abs(num);

        // Giving 2 decimal points
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            // Substring allows us to take a part of a string
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        // Advance ternary operator
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    // nodeList doesn't have a forEach method, therefore we are creating our own foreach method
    // we could use slice and convert the nodeList to an array but that's a hack/work around
    // Below is the first class function, which means we can use it pass the function around
    var nodeListForEach = function(list, callback) {
        for(i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    // Creating an object so the outside of this module
    // can interact with this controller's method (getInput; a public method)
    return {

        // Expose getInput to the public
        getInput: function() {
            // Create an object
            // This object has the values thats retrieved from the UI input
            // Create proprties to store the value instead of inside variables
            // And return it by using an object at the same time
            return {
                type: document.querySelector(DOMstrings.inputType).value, // WIll be either income or expense
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };

        },

        addListItem: function(obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text

            if(type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="far fa-times-circle"></i></button></div></div></div>'
            } else if(type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="far fa-times-circle"></i></button></div></div></div>'
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        clearFields: function() {
            var fields, fieldsArr;

            // This property will return a list not an array, we will have to convert it to an array
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            // This way we can trick the slice method that the value it gets its an array
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = '';
            });

            fieldsArr[0].focus();

        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, 'exp');

            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages) {
            // Using querySelectorAll because we don't know how many elements we will be retrieving
            // unlike querySelector that selects the first element
            // This will return us a nodelist not just list
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function() {
            var now, year, month, months;

            // Date metod
            now = new Date();

            // Month array
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        // Expose DOMstrings to the public
        getDOMstrings: function() {
            return DOMstrings;
        }
    };

})();


// GLOBAL APP CONTROLLER - IIFE FUNCTION - THIS WILL ACT AS A MIDDLE MAN
var controller = (function(budgetCtrl, UICtrl) {

    // Store all event listeres in a vaiable
    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // Event for keyboard events
        document.addEventListener('keypress', function(event) {

            // Keypress 'Enter' key which is they keycode 13
            // event.which is for the property for older browser
            if(event.keyCode === 13 || event.which === 13) {

                // Here we want the exact thing to happen when some1 click on the add btn
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem); 

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };

    var updatePercentages = function() {

        // 1. Calculate the percentages
        budgetCtrl.calculatePercentages();

        // 2.. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentage();

        // 3. Update the UI
        UICtrl.displayPercentages(percentages);
    };

    var updateBudget = function() {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    }

    var ctrlAddItem = function() {
        var input, newItem;

        // 1. Get the field input data
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calulcate and update budget
            updateBudget();

            // 6. Calculate nd update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {
            // inc-1
            // Split(-) method will split '-' strings into an array for i.e. var string = inc-1-type-2 => ['inc', '1', 'type', '2'];
            splitID = itemID.split('-');

            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calculate nd update percentages
            updatePercentages();

        }
    };

    // We want to create a function for all codes to be
    // executed right at the beginning
    return {
        init: function() {
            console.log('Application has started.');  
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };


})(budgetController, UIController);

// Start the application
controller.init();



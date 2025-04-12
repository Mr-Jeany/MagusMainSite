const chartElement = document.getElementById("statChart");

// Function to generate random HEX color
function getRandomHexColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
}

let datasets = []
let labels = []

// Get the length of the first data array to create labels
const firstDataArray = Object.values(stats)[0];
for (let i = 0; i < firstDataArray.length; i++) {
    labels.push(`Match ${firstDataArray.length - i}`);
}

// Iterate over the stats object
Object.entries(stats).forEach(([key, value]) => {
    let color = getRandomHexColor()
    datasets.push({
        label: `${key}`,
        data: value.reverse(),
        borderColor: color,
        backgroundColor: color
    })
});

const chartData = {
    labels: labels,
    datasets: datasets
}

const chartConfig = {
    type: "line",
    data: chartData,
    options: {
        responsive: true,
        // Code below makes it so you could hover whereever you want - jeany
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Statistics for " + valueName,
            }
        },
        scales: {
            y: {
                min: 0
            }
        }
    }
}

new Chart(
    chartElement,
    chartConfig
)

function buildOptionsFromDict(d) {
    if (!d || typeof d !== 'object') {
        console.warn('Invalid dictionary provided to buildOptionsFromDict');
        return '<option value="">No options available</option>';
    }

    return Object.entries(d)
        .map(([key, value]) => `<option value="${key}">${value}</option>`)
        .join('');
}

// Helper functions for creating UI elements
function createLabel(text, width = '100px') {
    const label = document.createElement('label');
    label.textContent = text;
    label.style.width = width;
    return label;
}

function createFlexContainer(direction = 'column', gap = '10px') {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = direction;
    container.style.gap = gap;
    return container;
}

function createInputWithLabel(labelText, inputType = 'text', placeholder = '') {
    const container = createFlexContainer('row', '10px');
    container.style.alignItems = 'center';
    
    const label = createLabel(labelText);
    const input = document.createElement(inputType === 'text' ? 'input' : 'select');
    
    if (inputType === 'text') {
        input.type = 'text';
        input.placeholder = placeholder;
    } else if (inputType === 'select') {
        input.innerHTML = placeholder;
    }
    
    input.className = 'form-control';
    input.style.flex = '1';
    
    container.appendChild(label);
    container.appendChild(input);
    return container;
}

function createButton(text, className, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = className;
    if (onClick) button.addEventListener('click', onClick);
    return button;
}

function createCardContainer() {
    const cardContainer = document.createElement('div');
    cardContainer.className = 'card';
    cardContainer.style.marginBottom = '10px';
    cardContainer.style.padding = '15px';
    cardContainer.style.border = '1px solid #ddd';
    cardContainer.style.borderRadius = '5px';
    cardContainer.style.backgroundColor = '#f9f9f9';
    cardContainer.style.width = '300px';
    return cardContainer;
}

function createCard(accountValue = '') {
    const cardContainer = createCardContainer();
    const inputsContainer = createFlexContainer('column', '10px');

    // Create input fields
    const accountContainer = createInputWithLabel('Account ID:', 'text', 'Enter account name');
    if (accountValue) accountContainer.querySelector('input').value = accountValue;

    const statContainer = createInputWithLabel('Stat:', 'select', buildOptionsFromDict(valueOptions));

    const matchResultContainer = createInputWithLabel('Match result:', 'select', `
        <option value="">Select match result</option>
        <option value="optionA">Option A</option>
        <option value="optionB">Option B</option>
        <option value="optionC">Option C</option>
    `);

    // Create buttons container
    const buttonsContainer = createFlexContainer('row', '10px');
    buttonsContainer.style.justifyContent = 'space-between';
    buttonsContainer.style.alignItems = 'center';

    const copyButton = createButton('Copy Info', 'btn btn-secondary', () => {
        navigator.clipboard.writeText('foo bar').then(() => {
            const originalText = copyButton.textContent;
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
                copyButton.textContent = originalText;
            }, 1000);
        });
    });
    copyButton.style.padding = '2px 8px';
    copyButton.style.fontSize = '12px';

    const removeButton = createButton('Remove', 'btn btn-danger', () => {
        inputContainer.removeChild(cardContainer);
    });

    // Assemble the card
    buttonsContainer.appendChild(copyButton);
    buttonsContainer.appendChild(removeButton);

    inputsContainer.appendChild(accountContainer);
    inputsContainer.appendChild(statContainer);
    inputsContainer.appendChild(matchResultContainer);
    inputsContainer.appendChild(buttonsContainer);

    cardContainer.appendChild(inputsContainer);
    return cardContainer;
}

// Add event listener for the button to create a card
const addFieldButton = document.getElementById('addFieldButton');
const inputContainer = document.getElementById('inputContainer');

addFieldButton.addEventListener('click', () => {
    const cardContainer = createCard();
    inputContainer.appendChild(cardContainer);
});

// Modify the populateInputFields function to use the new createCard function
function populateInputFields() {
    const currentUrl = new URL(window.location.href);
    const others = currentUrl.searchParams.get('others');

    if (others) {
        const accountNames = others.split(',');
        accountNames.forEach(name => {
            const cardContainer = createCard(name);
            inputContainer.appendChild(cardContainer);
        });
    }

    const takeMatches = currentUrl.searchParams.get("take");
    const takeInput = document.getElementById("takeInput");
    takeInput.value = takeMatches;
}

// Call the function to populate input fields on page load
populateInputFields();

// Add event listener for the Rebuild Chart button
const rebuildChartButton = document.getElementById('rebuildChartButton');

rebuildChartButton.addEventListener('click', () => {
    // Get selected stat
    const selectedStat = document.getElementById('statSelect').value;

    // Get number of mataches (take)
    let takeMatches = document.getElementById("takeInput").value;
    console.log(takeMatches);
    if (takeMatches === "") {
        takeMatches = "10";
    }

    // Get all input fields
    const inputFields = document.querySelectorAll('#inputContainer input');
    const others = Array.from(inputFields).map(input => input.value).filter(value => value); // Get non-empty values

    const chartValue = document.getElementById("statSelect").value;

    // Construct the base URL
    const baseUrl = `/player/${playerId}/charts`;

    // Create a URL object from the current window location
    const currentUrl = new URL(window.location.href);

    // Use URLSearchParams to manage query parameters
    const params = new URLSearchParams(currentUrl.search);

    // Add or update the "others" parameter
    if (others.length > 0) {
        params.set('others', others.join(',')); // Set the others parameter
    } else {
        params.delete('others'); // Remove the others parameter if no values
    }

    // Add or keep the "take" parameter if it exists
    if (currentUrl.searchParams.has('take')) {
        params.set('take', currentUrl.searchParams.get('take'));
    }

    params.set('value', chartValue);
    params.set('take', takeMatches);

    // Construct the new URL with updated parameters
    const newUrl = `${baseUrl}?${params.toString()}`;

    console.log('Rebuild Chart URL:', newUrl);

    // Redirect to the new URL
    window.location.href = newUrl; // This will navigate to the constructed URL
});
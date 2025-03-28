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



// Add event listener for the button to create a text field
const addFieldButton = document.getElementById('addFieldButton');
const inputContainer = document.getElementById('inputContainer');

addFieldButton.addEventListener('click', () => {
    // Create a new container for the input field and the remove button
    const fieldContainer = document.createElement('div');
    fieldContainer.style.display = 'flex';
    fieldContainer.style.alignItems = 'center'; // Align items in the center

    // Create a new text field
    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.placeholder = 'Enter account name'; // Placeholder text
    newInput.style.marginRight = '5px'; // Add some spacing
    newInput.style.marginTop = '5px'

    // Create a remove button
    const removeButton = document.createElement('button');
    removeButton.textContent = '[-]'; // Button text
    removeButton.style.marginLeft = '5px'; // Add some spacing

    // Add event listener to the remove button
    removeButton.addEventListener('click', () => {
        inputContainer.removeChild(fieldContainer); // Remove the field container
    });

    // Append the input field and remove button to the field container
    fieldContainer.appendChild(newInput);
    fieldContainer.appendChild(removeButton);

    // Append the field container to the input container
    inputContainer.appendChild(fieldContainer);
});

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

// Add this function to populate input fields from query parameters
function populateInputFields() {
    const currentUrl = new URL(window.location.href);
    const others = currentUrl.searchParams.get('others');

    if (others) {
        const accountNames = others.split(','); // Split the string into an array
        accountNames.forEach(name => {
            // Create a new container for the input field and the remove button
            const fieldContainer = document.createElement('div');
            fieldContainer.style.display = 'flex';
            fieldContainer.style.alignItems = 'center'; // Align items in the center

            // Create a new text field
            const newInput = document.createElement('input');
            newInput.type = 'text';
            newInput.placeholder = 'Enter account name'; // Placeholder text
            newInput.value = name; // Set the value to the account name
            newInput.style.marginRight = '5px'; // Add some spacing

            // Create a remove button
            const removeButton = document.createElement('button');
            removeButton.textContent = '[-]'; // Button text
            removeButton.style.marginLeft = '5px'; // Add some spacing

            // Add event listener to the remove button
            removeButton.addEventListener('click', () => {
                inputContainer.removeChild(fieldContainer); // Remove the field container
            });

            // Append the input field and remove button to the field container
            fieldContainer.appendChild(newInput);
            fieldContainer.appendChild(removeButton);

            // Append the field container to the input container
            inputContainer.appendChild(fieldContainer);
        });
    }

    const takeMatches = currentUrl.searchParams.get("take");
    const takeInput = document.getElementById("takeInput");
    takeInput.value = takeMatches;
}

// Call the function to populate input fields on page load
populateInputFields();
// ===============================
// E3: JavaScript Starter File (with JSDoc)
// ===============================

/**
 * Generate IDs for an array of titles.
 * Converts titles to lowercase and replaces spaces with hyphens.
 *
 * @param {string[]} titles - An array of section titles.
 * @returns {string[]} Array of generated IDs.
 */
function generateIds(titles) {
    return titles.map(item => item.toLocaleLowerCase().split(' ').join('-'))
    // Or
    return titles.map(item => item.toLocaleLowerCase().replace(" ", "-"))
}

/**
 * Filter titles containing the word "Important" and return their IDs.
 *
 * @param {string[]} titles - An array of section titles.
 * @returns {string[]} IDs of important titles.
 */
function highlightImportant(titles) {
    // Filter with word Important not case sensitive
    let tmpArr = titles.filter(item => item.toLocaleLowerCase().includes('important'))
    return generateIds(tmpArr);
    // Suggested methods: filter, map, includes, split, join, toLowerCase
}

/**
 * Count the frequency of each word across an array of titles.
 *
 * @param {string[]} titles - An array of section titles.
 * @returns {Object} Word frequency object (word -> count).
 */
function wordFrequency(titles) {
    return titles
        .flatMap(title => title.toLowerCase().split(/\s+/)) // spliting strings into words
        .reduce((sum, word) => {
            sum[word] = sum[word] ?? 0;
            sum[word]++;
            return sum;
        }, {});
}

/**
 * Show a message after a delay.
 *
 * @param {string} message - The message to display.
 * @param {number} delay - Delay in milliseconds.
 * @returns {void}
 */
function delayedMessage(message, delay) {
    setTimeout(() => console.log(message), delay);
    // Suggested methods: setTimeout, arrow function
}

/**
 * Format and display a message using a callback.
 *
 * @param {string} message - The message to format.
 * @param {(msg: string) => string} formatter - Callback to format the message.
 * @returns {void}
 */
function showFormattedMessage(message, formatter) {
    console.log(formatter(message));
    // Suggested methods: callback function
}

/**
 * Format an array of menu items using a callback.
 *
 * @param {string[]} items - Menu item labels.
 * @param {(item: string) => string} formatter - Callback to format each item.
 * @returns {string[]} Array of formatted menu items.
 */
function formatMenu(items, formatter) {
    return items.map(item => formatter(item));
    // Suggested methods: map, callback function
}

/**
 * Update a user profile with new values.
 *
 * @param {Object} user - Original user object.
 * @param {Object} updates - Object containing fields to update.
 * @returns {Object} New user object with updates applied.
 */
function updateUser(user, updates) {
    return { ...user, ...updates };
    // Suggested methods: spread syntax
}

/**
 * Remove the password property from a user object.
 *
 * @param {Object} user - User object that may contain a password.
 * @returns {Object} New user object without the password field.
 */
function removeSensitive({ password, ...user }) {
    return user;
    return { ...user, password: undefined };    // This is one way of doing it
    // Suggested methods: rest syntax
}

/**
 * Merge multiple user profile objects into one.
 * Properties of later object should overide the earlier ones
 *
 * @param {...Object} profiles - User profile objects.
 * @returns {Object} Combined user profile.
 */
function mergeProfiles(...profiles) {
    let final = {};
    profiles.forEach(prof => final = { ...final, ...prof });
    return final;
    // Suggested methods: rest parameters, Object.assign or spread
}

/**
 * Build a navigation menu from sections with priority >= 2.
 *
 * @param {Object[]} sections - List of sections (title, priority, classes).
 * @param {(title: string) => string} formatter - Callback to format section label.
 * @returns {Object[]} Array of navigation entries with id, label, and classes.
 */
function buildNavigation(sections, formatter) {
    return sections.filter(s => s.priority >= 2).map(({ title, classes }) => ({
        id: title.toLowerCase().split(' ').join('-'),
        label: formatter(title),
        classes,
    }));
    // Suggested methods: filter, map, split, join, toLowerCase, callback, spread
}


// ===============================
// Example Usage / Testing
// ===============================

// Part 1 Examples
console.log(generateIds(["About Us", "Our Projects", "Contact Info"]));
// Expected Output: ["about-us", "our-projects", "contact-info"]

console.log(highlightImportant([
    "About Us",
    "Important Notice",
    "Our Projects",
    "Very Important Update"
]));
// Expected Output: ["important-notice", "very-important-update"]

console.log(wordFrequency([
    "About Us",
    "Our Projects",
    "Important Projects",
    "Contact Us"
]));
// Expected Output: { about: 1, us: 2, our: 1, projects: 2, important: 1, contact: 1 }

// Part 2 Examples
delayedMessage("Hello after 2 seconds", 2000);
// Expected Output (after ~2 seconds): "Hello after 2 seconds"

showFormattedMessage("hello world", msg => msg.toUpperCase());
// Expected Output: "HELLO WORLD"

showFormattedMessage("new user joined", msg => "# " + msg + " #");
// Expected Output: "# new user joined #"

console.log(formatMenu(["Home", "About", "Contact"], item => "-- " + item + " --"));
// Expected Output: ["-- Home --", "-- About --", "-- Contact --"]

// Part 3 Examples
const user = { name: "Maya", age: 25, city: "Boston" };
console.log(updateUser(user, { age: 26, city: "NY" }));
// Expected Output: { name: "Maya", age: 26, city: "NY" }

console.log(removeSensitive({ name: "Maya", age: 26, password: "secret123" }));
// Expected Output: { name: "Maya", age: 26 }

console.log(mergeProfiles({ name: "Maya", age: 25 }, { age: 26 }, { city: "NY" }));
// Expected Output: { name: "Maya", age: 26, city: "NY" }

// Problem 10
const sections = [
    { title: "Home", priority: 1, classes: ["menu-item"] },
    { title: "Important Updates", priority: 3, classes: ["menu-item", "highlight"] },
    { title: "Contact", priority: 2, classes: ["menu-item"] }
];

console.log(buildNavigation(sections, title => "# " + title.toUpperCase() + " #"));
// Expected Output:
// [
//   { id: "important-updates", label: "# IMPORTANT UPDATES #", classes: ["menu-item","highlight"] },
//   { id: "contact", label: "# CONTACT #", classes: ["menu-item"] }
// ]

/**
 * Random Joke Generator
 * Fetches jokes from JokeAPI (https://jokeapi.dev/)
 */

const https = require('https');

/**
 * Fetch a random joke from JokeAPI
 * @param {Object} options - Configuration options
 * @param {string} options.category - Joke category (general, programming, knock-knock, etc.)
 * @param {boolean} options.safe - Whether to fetch safe jokes only (default: true)
 * @returns {Promise<Object>} Joke object
 */
function getRandomJoke(options = {}) {
  return new Promise((resolve, reject) => {
    const { category = 'Any', safe = true } = options;
    const safeMode = safe ? '?safe-mode' : '';
    
    const url = `https://v2.jokeapi.dev/joke/${category}${safeMode}`;

    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const joke = JSON.parse(data);

          if (joke.error) {
            reject(new Error(`API Error: ${joke.message}`));
            return;
          }

          resolve(joke);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`Failed to fetch joke: ${error.message}`));
    });
  });
}

/**
 * Format and display a joke
 * @param {Object} joke - Joke object from API
 * @returns {string} Formatted joke text
 */
function formatJoke(joke) {
  if (joke.type === 'single') {
    return joke.joke;
  } else if (joke.type === 'twopart') {
    return `${joke.setup}\n\n${joke.delivery}`;
  }
  return 'Unable to format joke';
}

/**
 * Get and display a random joke
 */
async function displayRandomJoke() {
  try {
    console.log('🤣 Fetching a random joke...\n');
    
    const joke = await getRandomJoke({
      category: 'Any',
      safe: true
    });

    console.log(formatJoke(joke));
    console.log(`\n📂 Category: ${joke.category}`);
    console.log(`💯 Rating: ${joke.rating || 'N/A'}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * Get multiple jokes
 */
async function displayMultipleJokes(count = 3) {
  try {
    console.log(`🤣 Fetching ${count} random jokes...\n`);
    
    for (let i = 1; i <= count; i++) {
      const joke = await getRandomJoke({ safe: true });
      console.log(`\n📍 Joke ${i}:`);
      console.log(formatJoke(joke));
      console.log(`📂 Category: ${joke.category}`);
      
      // Add delay between requests to avoid rate limiting
      if (i < count) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * Get joke by category
 */
async function getJokeByCategory(category) {
  try {
    console.log(`🤣 Fetching a ${category} joke...\n`);
    
    const joke = await getRandomJoke({
      category: category,
      safe: true
    });

    console.log(formatJoke(joke));
    console.log(`\n📂 Category: ${joke.category}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Export functions for use as a module
module.exports = {
  getRandomJoke,
  formatJoke,
  displayRandomJoke,
  displayMultipleJokes,
  getJokeByCategory
};

// Run if executed directly
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args[0] === '--multiple') {
    const count = parseInt(args[1]) || 3;
    displayMultipleJokes(count);
  } else if (args[0] === '--category') {
    const category = args[1] || 'Any';
    getJokeByCategory(category);
  } else {
    displayRandomJoke();
  }
}

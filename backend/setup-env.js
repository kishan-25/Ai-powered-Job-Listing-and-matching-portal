const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, '.env');
const exampleEnvPath = path.join(__dirname, '.env.example');

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('.env file already exists. Skipping setup.');
  process.exit(0);
}

// Read the example env file
const exampleEnv = fs.readFileSync(exampleEnvPath, 'utf8');
const envVars = [];

// Parse the example env file
const lines = exampleEnv.split('\n');
const questions = [];

lines.forEach(line => {
  if (line.trim() === '' || line.startsWith('#')) {
    envVars.push(line);
    return;
  }
  
  const [key, defaultValue] = line.split('=');
  questions.push({
    key,
    defaultValue: defaultValue ? defaultValue.trim() : '',
    comment: line.split('#')[1]?.trim()
  });
  
  envVars.push(key);
});

console.log('Setting up environment variables for the backend...\n');

const answers = {};
let currentIndex = 0;

const askQuestion = () => {
  if (currentIndex >= questions.length) {
    // All questions answered, write to .env file
    const envContent = Object.entries(answers)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ .env file created successfully!');
    rl.close();
    return;
  }
  
  const { key, defaultValue, comment } = questions[currentIndex];
  const question = `Enter value for ${key}${comment ? ` (${comment})` : ''}${defaultValue ? ` [${defaultValue}]` : ''}: `;
  
  rl.question(question, (answer) => {
    answers[key] = answer || defaultValue;
    currentIndex++;
    askQuestion();
  });
};

// Start asking questions
askQuestion();

rl.on('close', () => {
  console.log('\nSetup complete! You can now start the backend server.');
  process.exit(0);
});

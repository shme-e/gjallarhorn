const fs = require("fs");
const readline = require("readline");

const requiredKeys = [
  {
    key: "GJALLARHORN_STARTGG",
    name: "StartGG API Key",
    prompt:
      "Please enter your StartGG API key. Get one at https://developer.start.gg/docs/authentication.",
  },
];

function parseEnv() {
  const env = {};

  const envFile = fs.readFileSync(".env", "utf-8");
  const lines = envFile.split("\n");
  for (const line of lines) {
    if (line.trim() === "" || line.trim().startsWith("#")) {
      continue;
    }
    if (!line.includes("=")) {
      continue;
    }

    const [key, value] = line.split("=");

    if (!key || !value) {
      continue;
    }

    env[key.trim()] = value.trim();
  }
  return env;
}

async function promptForKey(key) {
  console.log(`${key.prompt}\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    key = await new Promise((resolve) => {
      rl.question("Enter your API key: ", (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  } finally {
    rl.close();
  }

  if (!key) {
    console.error("No key provided.");
    process.exit(1);
  }

  return key;
}

function appendToEnvFile(key, value) {
  fs.appendFileSync(".env", `${key}=${value}\n`, "utf-8");
}

(async () => {
  for (const requiredKey of requiredKeys) {
    if (!process.env[requiredKey.key]) {
      const key = await promptForKey(requiredKey);
      // since we won't reread the .env file, set to to process env now
      process.env[requiredKey.key] = key;
      // append to .env file for future runs
      appendToEnvFile(requiredKey.key, key);
    }
  }

  require("./app/gjallarhorn.js");
})();

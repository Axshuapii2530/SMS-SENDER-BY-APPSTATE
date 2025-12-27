/**
 * Facebook Group Message Sender Bot
 * Developer: Axshu 🩷
 * Description: Sends messages from files with random timing and prefix support.
 */

const login = require("ws3-fca");
const fs = require("fs");
const express = require("express");

// ✅ Load AppState
let appState;
try {
  appState = JSON.parse(fs.readFileSync("appstate.json", "utf-8"));
} catch (err) {
  console.error("❌ Error reading appstate.json:", err);
  process.exit(1);
}

// ✅ Message Configuration
const MESSAGE_FILE = "message.txt";
const HATERNAME_FILE = "hatername.txt";
const TID_FILE = "tid.txt";
const MIN_INTERVAL = 2 * 60 * 1000; // 2 minutes in milliseconds
const MAX_INTERVAL = 3 * 60 * 1000; // 3 minutes in milliseconds

// ✅ Express Server to keep bot alive (for Render or UptimeRobot)
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) =>
  res.send("🤖 Facebook Message Sender Bot is alive! 👨‍💻 Developer: Axshu 🩷")
);
app.listen(PORT, () =>
  console.log(`🌐 Web server running on port ${PORT}`)
);

/**
 * Read file content or return default
 */
function readFileContent(filename, defaultContent = "") {
  try {
    if (fs.existsSync(filename)) {
      return fs.readFileSync(filename, "utf-8").trim();
    }
  } catch (err) {
    console.error(`❌ Error reading ${filename}:`, err);
  }
  return defaultContent;
}

/**
 * Load messages from message.txt (each line is a separate message)
 */
function loadMessages() {
  const content = readFileContent(MESSAGE_FILE, "");
  if (!content) {
    console.warn(`⚠️ ${MESSAGE_FILE} is empty or not found`);
    return [];
  }
  
  const messages = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  console.log(`📄 Loaded ${messages.length} messages from ${MESSAGE_FILE}`);
  return messages;
}

/**
 * Load group IDs from tid.txt
 */
function loadGroupIDs() {
  const content = readFileContent(TID_FILE, "");
  const ids = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  if (ids.length === 0) {
    console.error("❌ No group IDs found in tid.txt. Please add at least one group ID.");
    process.exit(1);
  }
  
  console.log(`📄 Loaded ${ids.length} group IDs from ${TID_FILE}`);
  return ids;
}

/**
 * Load prefix from hatername.txt
 */
function loadPrefix() {
  const prefix = readFileContent(HATERNAME_FILE, "").trim();
  if (prefix) {
    console.log(`🏷️ Prefix loaded: "${prefix}"`);
  }
  return prefix;
}

/**
 * Get random interval between min and max
 */
function getRandomInterval() {
  return Math.floor(Math.random() * (MAX_INTERVAL - MIN_INTERVAL + 1)) + MIN_INTERVAL;
}

/**
 * Send message to group with prefix
 */
function sendMessage(api, groupID, message, prefix) {
  const fullMessage = prefix ? `${prefix} ${message}` : message;
  
  api.sendMessage(fullMessage, groupID, (err) => {
    if (err) {
      console.error(`❌ Error sending message to group ${groupID}:`, err);
    } else {
      console.log(`✅ Message sent to group ${groupID}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);
    }
  });
}

/**
 * Get current time string for logging
 */
function getCurrentTime() {
  return new Date().toLocaleTimeString();
}

/**
 * Start message sending scheduler
 */
function startMessageScheduler(api) {
  const messages = loadMessages();
  const groupIDs = loadGroupIDs();
  const prefix = loadPrefix();
  
  if (messages.length === 0) {
    console.error("❌ No messages to send. Please add messages to message.txt");
    process.exit(1);
  }
  
  let messageIndex = 0;
  let currentGroupIndex = 0;
  let isFirstMessage = true;
  
  function scheduleNextMessage() {
    const interval = getRandomInterval();
    const nextTime = new Date(Date.now() + interval);
    
    if (!isFirstMessage) {
      console.log(`⏰ Next message in ${Math.round(interval/1000)} seconds at ${nextTime.toLocaleTimeString()}`);
    }
    
    setTimeout(() => {
      const currentGroupID = groupIDs[currentGroupIndex];
      const currentMessage = messages[messageIndex];
      
      console.log(`\n📤 [${getCurrentTime()}] Sending message to group ${currentGroupID}...`);
      
      // Send message to current group
      sendMessage(api, currentGroupID, currentMessage, prefix);
      
      // Update indexes
      messageIndex = (messageIndex + 1) % messages.length;
      currentGroupIndex = (currentGroupIndex + 1) % groupIDs.length;
      
      if (isFirstMessage) isFirstMessage = false;
      
      // Schedule next message
      scheduleNextMessage();
    }, isFirstMessage ? 0 : interval);
  }
  
  // Start the scheduler
  console.log(`🚀 Message scheduler started with configuration:`);
  console.log(`   • Groups: ${groupIDs.length}`);
  console.log(`   • Messages: ${messages.length}`);
  console.log(`   • Interval: ${MIN_INTERVAL/60000}-${MAX_INTERVAL/60000} minutes`);
  console.log(`   • Prefix: ${prefix || 'None'}`);
  
  if (groupIDs.length > 0 && messages.length > 0) {
    console.log(`\n📋 First group ID: ${groupIDs[0]}`);
    console.log(`📋 First message: "${messages[0].substring(0, 50)}${messages[0].length > 50 ? '...' : ''}"`);
  }
  
  scheduleNextMessage();
}

// 🟢 Facebook Login
login({ appState }, (err, api) => {
  if (err) {
    console.error("❌ Login Failed:", err);
    return;
  }

  console.log("✅ Logged in successfully.");
  console.log("👨‍💻 Developer: Axshu 🩷");
  console.log("📨 Message sender bot activated.");
  
  // Get user info
  api.getCurrentUserID((err, id) => {
    if (!err) {
      api.getUserInfo(id, (err, ret) => {
        if (!err && ret && ret[id]) {
          console.log(`👤 Logged in as: ${ret[id].name}`);
        }
      });
    }
  });
  
  startMessageScheduler(api);
});

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
  console.log("ℹ️ Please ensure appstate.json exists in the same directory");
  process.exit(1);
}

// ✅ Message Configuration
const MIN_INTERVAL = 2 * 60 * 1000; // 2 minutes
const MAX_INTERVAL = 3 * 60 * 1000; // 3 minutes

// ✅ Express Server for keeping bot alive
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) =>
  res.send("🤖 Facebook Message Sender Bot is alive! 👨‍💻 Developer: Axshu 🩷")
);
app.listen(PORT, () =>
  console.log(`🌐 Web server running on http://localhost:${PORT}`)
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
 * Load messages from message.txt
 */
function loadMessages() {
  const content = readFileContent("message.txt", "");
  if (!content) {
    console.error("❌ message.txt is empty or not found!");
    console.log("ℹ️ Please create message.txt with your messages");
    process.exit(1);
  }
  
  const messages = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  console.log(`📄 Loaded ${messages.length} messages`);
  return messages;
}

/**
 * Load group IDs from tid.txt
 */
function loadGroupIDs() {
  const content = readFileContent("tid.txt", "");
  if (!content) {
    console.error("❌ tid.txt is empty or not found!");
    console.log("ℹ️ Please create tid.txt with group IDs");
    process.exit(1);
  }
  
  const ids = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  console.log(`📄 Loaded ${ids.length} group IDs`);
  return ids;
}

/**
 * Load prefix from hatername.txt
 */
function loadPrefix() {
  const prefix = readFileContent("hatername.txt", "").trim();
  if (prefix) {
    console.log(`🏷️ Prefix: "${prefix}"`);
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
 * Send message to group
 */
function sendMessage(api, groupID, message, prefix) {
  const fullMessage = prefix ? `${prefix} ${message}` : message;
  
  api.sendMessage(fullMessage, groupID, (err) => {
    if (err) {
      console.error(`❌ Error sending to group ${groupID}:`, err.message || err);
    } else {
      const shortMsg = message.length > 50 ? message.substring(0, 47) + "..." : message;
      console.log(`✅ Sent to ${groupID}: "${shortMsg}"`);
    }
  });
}

/**
 * Start message scheduler
 */
function startMessageScheduler(api) {
  const messages = loadMessages();
  const groupIDs = loadGroupIDs();
  const prefix = loadPrefix();
  
  let messageIndex = 0;
  let groupIndex = 0;
  let messageCount = 0;
  
  console.log("\n" + "=".repeat(50));
  console.log("🚀 BOT STARTED SUCCESSFULLY!");
  console.log("=".repeat(50));
  console.log(`📊 Stats:`);
  console.log(`   • Total Groups: ${groupIDs.length}`);
  console.log(`   • Total Messages: ${messages.length}`);
  console.log(`   • Interval: ${MIN_INTERVAL/60000}-${MAX_INTERVAL/60000} minutes`);
  console.log(`   • Prefix: ${prefix || 'None'}`);
  console.log("=".repeat(50) + "\n");
  
  function scheduleNextMessage() {
    const interval = getRandomInterval();
    const nextTime = new Date(Date.now() + interval);
    
    setTimeout(() => {
      const currentGroupID = groupIDs[groupIndex];
      const currentMessage = messages[messageIndex];
      messageCount++;
      
      const timeStr = new Date().toLocaleTimeString();
      console.log(`\n📤 [${timeStr}] Message #${messageCount}`);
      console.log(`   Group: ${currentGroupID}`);
      console.log(`   Message: "${currentMessage.substring(0, 60)}${currentMessage.length > 60 ? '...' : ''}"`);
      
      sendMessage(api, currentGroupID, currentMessage, prefix);
      
      // Update indexes
      messageIndex = (messageIndex + 1) % messages.length;
      groupIndex = (groupIndex + 1) % groupIDs.length;
      
      // Schedule next
      scheduleNextMessage();
    }, interval);
  }
  
  // Send first message immediately
  console.log("⏳ Sending first message now...");
  const firstGroupID = groupIDs[0];
  const firstMessage = messages[0];
  sendMessage(api, firstGroupID, firstMessage, prefix);
  
  messageIndex = 1 % messages.length;
  groupIndex = 1 % groupIDs.length;
  messageCount = 1;
  
  // Schedule subsequent messages
  scheduleNextMessage();
}

// 🟢 Start Bot
login({ appState }, (err, api) => {
  if (err) {
    console.error("❌ Login Failed:", err);
    console.log("\nℹ️ Possible solutions:");
    console.log("1. Check if appstate.json is valid");
    console.log("2. Try generating new appstate.json");
    console.log("3. Check your internet connection");
    return;
  }

  console.log("✅ Logged in to Facebook");
  console.log("👨‍💻 Developer: Axshu 🩷");
  
  // Get user info
  api.getCurrentUserID((err, id) => {
    if (!err && id) {
      api.getUserInfo(id, (err, userInfo) => {
        if (!err && userInfo && userInfo[id]) {
          console.log(`👤 Account: ${userInfo[id].name}`);
        }
      });
    }
  });
  
  // Start message scheduler
  setTimeout(() => {
    startMessageScheduler(api);
  }, 2000);
});

// Handle process exit
process.on('SIGINT', () => {
  console.log('\n\n👋 Bot stopped by user');
  process.exit(0);
});

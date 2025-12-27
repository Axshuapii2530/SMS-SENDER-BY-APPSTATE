/**
 * Facebook Group Message Sender Bot
 * Developer: Axshu 🩷
 * Description: Sends messages from files with random timing and prefix support.
 */

// Try different ways to import the Facebook API
let login;
try {
  // Method 1: Direct import
  login = require("ws3-fca");
} catch (err) {
  console.error("❌ Error importing ws3-fca:", err.message);
  try {
    // Method 2: Try alternative import
    const fca = require("ws3-fca");
    login = fca.default || fca.login || fca;
  } catch (err2) {
    console.error("❌ Failed to import Facebook API");
    process.exit(1);
  }
}

const fs = require("fs");
const express = require("express");

// ✅ Load AppState
let appState;
try {
  appState = JSON.parse(fs.readFileSync("appstate.json", "utf-8"));
  console.log("✅ appstate.json loaded successfully");
} catch (err) {
  console.error("❌ Error reading appstate.json:", err.message);
  console.log("\nℹ️ Please create appstate.json with valid Facebook session");
  console.log("   You can get it from browser cookies or use a login script");
  process.exit(1);
}

// ✅ Message Configuration
const MIN_INTERVAL = 2 * 60 * 1000; // 2 minutes
const MAX_INTERVAL = 3 * 60 * 1000; // 3 minutes

// ✅ Express Server for keeping bot alive
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Facebook Message Bot</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #1877F2; }
        .status { background: #f0f0f0; padding: 20px; border-radius: 10px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="status">
        <h1>🤖 Facebook Message Sender Bot</h1>
        <p><strong>Status:</strong> <span style="color:green;">🟢 Running</span></p>
        <p><strong>Developer:</strong> Axshu 🩷</p>
        <p><strong>Uptime:</strong> ${Math.floor(process.uptime())} seconds</p>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
  console.log(`🌐 Open http://localhost:${PORT} to check status`);
});

/**
 * Read file content or return default
 */
function readFileContent(filename, defaultContent = "") {
  try {
    if (fs.existsSync(filename)) {
      const content = fs.readFileSync(filename, "utf-8").trim();
      if (content) return content;
    }
  } catch (err) {
    console.error(`❌ Error reading ${filename}:`, err.message);
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
    console.log("ℹ️ Creating sample message.txt...");
    const sampleMessages = [
      "Hello everyone! Welcome to the group. 🎉",
      "Please read group rules before posting. 📜",
      "Stay respectful to all members. ❤️",
      "Have a wonderful day! 😊"
    ];
    fs.writeFileSync("message.txt", sampleMessages.join('\n'));
    console.log("✅ Created sample message.txt");
    return sampleMessages;
  }
  
  const messages = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  console.log(`📄 Loaded ${messages.length} messages from message.txt`);
  return messages;
}

/**
 * Load group IDs from tid.txt
 */
function loadGroupIDs() {
  const content = readFileContent("tid.txt", "");
  if (!content) {
    console.error("❌ tid.txt is empty or not found!");
    console.log("⚠️ Please create tid.txt with Facebook Group IDs");
    console.log("📝 Format: One group ID per line");
    console.log("🔗 Example: 1234567890123456");
    process.exit(1);
  }
  
  const ids = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 10); // Basic validation
  
  if (ids.length === 0) {
    console.error("❌ No valid group IDs found in tid.txt");
    process.exit(1);
  }
  
  console.log(`📄 Loaded ${ids.length} group IDs from tid.txt`);
  return ids;
}

/**
 * Load prefix from hatername.txt
 */
function loadPrefix() {
  const prefix = readFileContent("hatername.txt", "").trim();
  if (prefix) {
    console.log(`🏷️ Prefix loaded: "${prefix}"`);
  } else {
    console.log("🏷️ No prefix found (hatername.txt is empty)");
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
 * Format time for display
 */
function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

/**
 * Send message to group
 */
function sendMessage(api, groupID, message, prefix) {
  const fullMessage = prefix ? `${prefix} ${message}` : message;
  
  return new Promise((resolve) => {
    api.sendMessage(fullMessage, groupID, (err) => {
      if (err) {
        console.error(`❌ Error sending to group ${groupID}:`, err.message || err);
        resolve(false);
      } else {
        const shortMsg = message.length > 40 ? message.substring(0, 37) + "..." : message;
        console.log(`✅ Sent to ${groupID}: ${shortMsg}`);
        resolve(true);
      }
    });
  });
}

/**
 * Start message scheduler
 */
function startMessageScheduler(api) {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 INITIALIZING MESSAGE SCHEDULER");
  console.log("=".repeat(60));
  
  const messages = loadMessages();
  const groupIDs = loadGroupIDs();
  const prefix = loadPrefix();
  
  console.log("\n📊 CONFIGURATION SUMMARY:");
  console.log("   • Groups:".padEnd(20), groupIDs.length);
  console.log("   • Messages:".padEnd(20), messages.length);
  console.log("   • Interval:".padEnd(20), `${MIN_INTERVAL/60000}-${MAX_INTERVAL/60000} min`);
  console.log("   • Prefix:".padEnd(20), `"${prefix || 'None'}"`);
  console.log("=".repeat(60) + "\n");
  
  let messageIndex = 0;
  let groupIndex = 0;
  let messageCount = 0;
  let isPaused = false;
  
  async function sendNextMessage() {
    if (isPaused) return;
    
    const currentGroupID = groupIDs[groupIndex];
    const currentMessage = messages[messageIndex];
    messageCount++;
    
    const timeStr = new Date().toLocaleTimeString('en-IN', { 
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    console.log(`\n📤 [${timeStr}] MESSAGE #${messageCount}`);
    console.log(`   ├─ Group: ${currentGroupID}`);
    console.log(`   ├─ Message: "${currentMessage.substring(0, 50)}${currentMessage.length > 50 ? '...' : ''}"`);
    if (prefix) console.log(`   └─ Prefix: "${prefix}"`);
    
    const success = await sendMessage(api, currentGroupID, currentMessage, prefix);
    
    if (success) {
      // Update indexes for next message
      messageIndex = (messageIndex + 1) % messages.length;
      groupIndex = (groupIndex + 1) % groupIDs.length;
      
      // Schedule next message with random interval
      const nextInterval = getRandomInterval();
      const nextTime = new Date(Date.now() + nextInterval);
      const nextTimeStr = nextTime.toLocaleTimeString('en-IN', { 
        hour12: true,
        hour: '2-digit',
        minute: '2-digit'
      });
      
      console.log(`   ⏰ Next message in ${formatTime(nextInterval)} at ${nextTimeStr}`);
      
      setTimeout(sendNextMessage, nextInterval);
    } else {
      // If failed, wait longer before retry
      console.log(`   ⚠️ Retrying in 5 minutes...`);
      setTimeout(sendNextMessage, 5 * 60 * 1000);
    }
  }
  
  // Start sending messages
  console.log("🎯 STARTING MESSAGES...");
  console.log(`   First message will be sent to: ${groupIDs[0]}`);
  console.log(`   First message: "${messages[0].substring(0, 40)}${messages[0].length > 40 ? '...' : ''}"`);
  
  // Send first message after 3 seconds
  setTimeout(() => {
    sendNextMessage();
  }, 3000);
  
  // Pause/Resume handler (optional)
  process.on('SIGUSR1', () => {
    isPaused = !isPaused;
    console.log(`\n${isPaused ? '⏸️' : '▶️'} Bot ${isPaused ? 'paused' : 'resumed'}`);
  });
  
  process.on('SIGUSR2', () => {
    console.log('\n📊 CURRENT STATUS:');
    console.log(`   Messages sent: ${messageCount}`);
    console.log(`   Next group: ${groupIDs[groupIndex]}`);
    console.log(`   Next message: "${messages[messageIndex].substring(0, 30)}..."`);
  });
}

// 🟢 START BOT
console.log("=".repeat(60));
console.log("🤖 FACEBOOK MESSAGE BOT - STARTING");
console.log("=".repeat(60));
console.log("👨‍💻 Developer: Axshu 🩷");
console.log("📅 " + new Date().toLocaleString());
console.log("=".repeat(60));

// Try different login methods
try {
  // Method 1: If login is a function
  if (typeof login === 'function') {
    console.log("🔑 Attempting login with appstate...");
    login({ appState }, (err, api) => {
      handleLoginResult(err, api);
    });
  } 
  // Method 2: If login has a login method
  else if (login && typeof login.login === 'function') {
    console.log("🔑 Attempting login via login.login()...");
    login.login({ appState }, (err, api) => {
      handleLoginResult(err, api);
    });
  }
  // Method 3: If it's the API object directly
  else if (login && typeof login.getCurrentUserID === 'function') {
    console.log("🔑 Already logged in...");
    handleLoginResult(null, login);
  }
  else {
    console.error("❌ Could not determine login method");
    console.log("ℹ️ Available methods in login object:", Object.keys(login).filter(k => typeof login[k] === 'function'));
    process.exit(1);
  }
} catch (loginError) {
  console.error("❌ Login error:", loginError.message);
  console.log("\n🔧 TROUBLESHOOTING:");
  console.log("1. Check if appstate.json is valid");
  console.log("2. Try: npm install ws3-fca@latest");
  console.log("3. Check package structure");
}

function handleLoginResult(err, api) {
  if (err) {
    console.error("❌ Login failed:", err.message || err);
    console.log("\n🛠️ SOLUTIONS:");
    console.log("1. Generate new appstate.json");
    console.log("2. Check Facebook account status");
    console.log("3. Verify internet connection");
    return;
  }
  
  console.log("✅ LOGIN SUCCESSFUL!");
  
  // Get user info
  api.getCurrentUserID((err, userId) => {
    if (!err && userId) {
      api.getUserInfo(userId, (err, userInfo) => {
        if (!err && userInfo && userInfo[userId]) {
          console.log(`👤 Logged in as: ${userInfo[userId].name}`);
        }
      });
    }
  });
  
  // Start message scheduler after 2 seconds
  setTimeout(() => {
    console.log("\n" + "=".repeat(60));
    console.log("📨 INITIALIZING MESSAGE SCHEDULER");
    console.log("=".repeat(60));
    startMessageScheduler(api);
  }, 2000);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n' + "=".repeat(60));
  console.log('👋 Bot stopped by user (Ctrl+C)');
  console.log('📅 ' + new Date().toLocaleString());
  console.log("=".repeat(60));
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('\n⚠️ UNCAUGHT EXCEPTION:', err.message);
  console.log('🔄 Restarting in 10 seconds...');
  setTimeout(() => {
    console.log('🔄 Attempting restart...');
  }, 10000);
});

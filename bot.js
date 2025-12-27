/**
 * Facebook Group Message Sender Bot
 * Developer: Axshu 🩷
 * Description: Sends messages from files with random timing and prefix support.
 */

console.log("=".repeat(60));
console.log("🤖 FACEBOOK MESSAGE BOT - STARTING");
console.log("=".repeat(60));
console.log("👨‍💻 Developer: Axshu 🩷");
console.log("📅 " + new Date().toLocaleString());
console.log("=".repeat(60));

// Try different Facebook API libraries
let facebookAPI;
let loginFunction;

try {
  console.log("📦 Loading Facebook API library...");
  // Try fca-unofficial first (more reliable)
  facebookAPI = require("fca-unofficial");
  console.log("✅ Using fca-unofficial package");
  
  // Check available methods
  if (typeof facebookAPI === 'function') {
    loginFunction = facebookAPI;
  } else if (facebookAPI && typeof facebookAPI.login === 'function') {
    loginFunction = facebookAPI.login;
  } else if (facebookAPI && typeof facebookAPI.default === 'function') {
    loginFunction = facebookAPI.default;
  }
} catch (err) {
  console.log("⚠️ fca-unofficial not found, trying alternatives...");
  
  try {
    // Try ws3-fca as fallback
    const ws3fca = require("ws3-fca");
    console.log("✅ Using ws3-fca package");
    
    if (typeof ws3fca === 'function') {
      loginFunction = ws3fca;
    } else if (ws3fca && typeof ws3fca.login === 'function') {
      loginFunction = ws3fca.login;
    }
  } catch (err2) {
    console.error("❌ Both fca-unofficial and ws3-fca failed to load");
    console.log("💡 Install packages with: npm install fca-unofficial express");
    process.exit(1);
  }
}

if (!loginFunction) {
  console.error("❌ Could not find login function in the package");
  console.log("🔍 Available exports:", Object.keys(facebookAPI || {}));
  process.exit(1);
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
  console.log("\n📝 Create appstate.json with your Facebook session data");
  console.log("   You can get it from:");
  console.log("   1. Browser cookies export");
  console.log("   2. Other Facebook bot tools");
  console.log("   3. Login scripts");
  
  // Create sample appstate.json
  const sampleAppState = [
    {
      "key": "c_user",
      "value": "YOUR_USER_ID_HERE",
      "domain": ".facebook.com",
      "path": "/"
    },
    {
      "key": "xs",
      "value": "YOUR_SESSION_TOKEN_HERE",
      "domain": ".facebook.com",
      "path": "/"
    }
  ];
  
  try {
    fs.writeFileSync("appstate.json", JSON.stringify(sampleAppState, null, 2));
    console.log("📄 Created sample appstate.json - PLEASE EDIT WITH YOUR DATA");
  } catch (writeErr) {
    console.error("❌ Could not create appstate.json:", writeErr.message);
  }
  
  process.exit(1);
}

// ✅ Message Configuration
const MIN_INTERVAL = 2 * 60 * 1000; // 2 minutes
const MAX_INTERVAL = 3 * 60 * 1000; // 3 minutes

// ✅ Express Server
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Facebook Message Bot</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          max-width: 500px;
          width: 100%;
          text-align: center;
        }
        h1 { 
          color: #1877F2; 
          margin-bottom: 10px;
          font-size: 28px;
        }
        .status { 
          background: #f0f8ff;
          padding: 20px;
          border-radius: 15px;
          margin: 20px 0;
          border-left: 5px solid #1877F2;
        }
        .stats { 
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin: 20px 0;
        }
        .stat-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 10px;
          text-align: center;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #1877F2;
        }
        .stat-label {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
        }
        .online { color: #10B981; }
        .developer { 
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🤖 Facebook Message Bot</h1>
        <p style="color: #666; margin-bottom: 20px;">Automated Group Message Sender</p>
        
        <div class="status">
          <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
            <div style="width: 10px; height: 10px; background: #10B981; border-radius: 50%;"></div>
            <span style="font-weight: bold; color: #10B981;">🟢 ONLINE & RUNNING</span>
          </div>
          <p>Server is active and sending messages</p>
        </div>
        
        <div class="stats">
          <div class="stat-item">
            <div class="stat-value">${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}</div>
            <div class="stat-label">UPTIME</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${PORT}</div>
            <div class="stat-label">PORT</div>
          </div>
        </div>
        
        <div style="background: #f0f8ff; padding: 15px; border-radius: 10px; margin-top: 20px;">
          <p style="font-weight: bold; color: #1877F2; margin-bottom: 5px;">📡 Endpoint Status</p>
          <p style="color: #666; font-size: 14px;">Web server running on port ${PORT}</p>
        </div>
        
        <div class="developer">
          <p>👨‍💻 Developed by <strong>Axshu 🩷</strong></p>
          <p style="font-size: 12px; margin-top: 5px;">${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`🌐 Web server: http://localhost:${PORT}`);
});

/**
 * Read file content
 */
function readFileContent(filename, defaultContent = "") {
  try {
    if (fs.existsSync(filename)) {
      return fs.readFileSync(filename, "utf-8").trim();
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
    console.log("📝 Creating sample message.txt...");
    const defaultMessages = [
      "Hello everyone! Welcome to our group. 🎉",
      "Please read the group rules before posting. 📜",
      "Stay respectful and kind to all members. ❤️",
      "Share your thoughts and engage in discussions. 💬",
      "Have a wonderful day! 😊"
    ];
    fs.writeFileSync("message.txt", defaultMessages.join('\n'));
    console.log("✅ Created message.txt with sample messages");
    return defaultMessages;
  }
  
  const messages = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  console.log(`📄 Messages: ${messages.length} loaded`);
  return messages;
}

/**
 * Load group IDs from tid.txt
 */
function loadGroupIDs() {
  const content = readFileContent("tid.txt", "");
  if (!content) {
    console.error("❌ tid.txt not found!");
    console.log("📝 Creating sample tid.txt...");
    fs.writeFileSync("tid.txt", "YOUR_GROUP_ID_HERE\nSECOND_GROUP_ID_HERE");
    console.log("✅ Created tid.txt - PLEASE EDIT WITH YOUR GROUP IDs");
    process.exit(1);
  }
  
  const ids = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 5);
  
  if (ids.length === 0) {
    console.error("❌ No valid group IDs in tid.txt");
    process.exit(1);
  }
  
  console.log(`📄 Groups: ${ids.length} loaded`);
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
  return prefix || "";
}

/**
 * Get random interval
 */
function getRandomInterval() {
  return Math.floor(Math.random() * (MAX_INTERVAL - MIN_INTERVAL)) + MIN_INTERVAL;
}

/**
 * Format time display
 */
function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes} min ${seconds} sec`;
}

/**
 * Send message
 */
function sendMessage(api, groupID, message, prefix) {
  const fullMessage = prefix ? `${prefix} ${message}` : message;
  
  return new Promise((resolve) => {
    api.sendMessage(fullMessage, groupID, (err) => {
      if (err) {
        console.error(`❌ Failed to send to ${groupID}: ${err.message || err}`);
        resolve(false);
      } else {
        const preview = message.length > 40 ? message.substring(0, 37) + "..." : message;
        console.log(`✅ Sent to ${groupID}: ${preview}`);
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
  console.log("📨 MESSAGE SCHEDULER INITIALIZED");
  console.log("=".repeat(60));
  
  const messages = loadMessages();
  const groups = loadGroupIDs();
  const prefix = loadPrefix();
  
  console.log("\n📊 CONFIGURATION:");
  console.log("├─ Groups:", groups.length);
  console.log("├─ Messages:", messages.length);
  console.log(`├─ Interval: ${MIN_INTERVAL/60000}-${MAX_INTERVAL/60000} minutes`);
  console.log(`└─ Prefix: "${prefix || 'None'}"`);
  console.log("=".repeat(60));
  
  let msgIndex = 0;
  let grpIndex = 0;
  let totalSent = 0;
  let isActive = true;
  
  async function processNextMessage() {
    if (!isActive) return;
    
    const groupId = groups[grpIndex];
    const message = messages[msgIndex];
    totalSent++;
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    
    console.log(`\n📤 [${timeStr}] Message #${totalSent}`);
    console.log(`   ├─ To: ${groupId}`);
    console.log(`   ├─ Content: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
    
    const success = await sendMessage(api, groupId, message, prefix);
    
    if (success) {
      // Update indexes
      msgIndex = (msgIndex + 1) % messages.length;
      grpIndex = (grpIndex + 1) % groups.length;
      
      // Schedule next
      const nextDelay = getRandomInterval();
      const nextTime = new Date(Date.now() + nextDelay);
      const nextTimeStr = nextTime.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      console.log(`   ⏰ Next: ${formatTime(nextDelay)} at ${nextTimeStr}`);
      setTimeout(processNextMessage, nextDelay);
    } else {
      console.log(`   ⚠️ Retrying in 2 minutes...`);
      setTimeout(processNextMessage, 120000);
    }
  }
  
  // Start sending
  console.log("\n🎯 STARTING MESSAGE DELIVERY...");
  console.log(`   First message to: ${groups[0]}`);
  
  // Initial delay
  setTimeout(() => {
    processNextMessage();
  }, 3000);
  
  // Status commands
  process.on('SIGUSR1', () => {
    isActive = !isActive;
    console.log(`\n${isActive ? '▶️' : '⏸️'} Bot ${isActive ? 'resumed' : 'paused'}`);
  });
  
  process.on('SIGUSR2', () => {
    console.log('\n📊 CURRENT STATUS:');
    console.log(`   Messages sent: ${totalSent}`);
    console.log(`   Next group: ${groups[grpIndex]}`);
    console.log(`   Next message index: ${msgIndex + 1}/${messages.length}`);
  });
}

// 🟢 LOGIN TO FACEBOOK
console.log("\n🔑 ATTEMPTING FACEBOOK LOGIN...");

try {
  loginFunction({ appState }, (err, api) => {
    if (err) {
      console.error("❌ Login failed:", err.message || err);
      console.log("\n🔧 TROUBLESHOOTING:");
      console.log("1. Check appstate.json validity");
      console.log("2. Try generating new session");
      console.log("3. Check account status");
      return;
    }
    
    console.log("✅ LOGIN SUCCESSFUL!");
    
    // Get user info
    api.getCurrentUserID((err, userId) => {
      if (!err && userId) {
        api.getUserInfo(userId, (err, info) => {
          if (!err && info && info[userId]) {
            console.log(`👤 User: ${info[userId].name}`);
          }
        });
      }
    });
    
    // Start scheduler
    setTimeout(() => {
      startMessageScheduler(api);
    }, 2000);
  });
} catch (loginErr) {
  console.error("❌ Login error:", loginErr.message);
  console.log("\n💡 Try: npm install fca-unofficial@latest");
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n' + "=".repeat(60));
  console.log('👋 Bot stopped gracefully');
  console.log('📅 ' + new Date().toLocaleString());
  console.log("=".repeat(60));
  process.exit(0);
});

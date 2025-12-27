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

// Import dependencies
const fs = require('fs');
const express = require('express');

// Try to load facebook-chat-api
let login;
try {
  console.log("📦 Loading facebook-chat-api...");
  login = require("facebook-chat-api");
  console.log("✅ Package loaded successfully");
} catch (err) {
  console.error("❌ Failed to load facebook-chat-api:", err.message);
  console.log("\n💡 Install with: npm install facebook-chat-api express");
  process.exit(1);
}

// Load appstate.json
let appState;
try {
  const appStateContent = fs.readFileSync('appstate.json', 'utf8');
  appState = JSON.parse(appStateContent);
  console.log("✅ appstate.json loaded");
} catch (err) {
  console.error("❌ Error loading appstate.json:", err.message);
  
  // Create sample appstate.json
  const sampleAppState = [
    {
      "key": "c_user",
      "value": "100000000000000",
      "domain": ".facebook.com",
      "path": "/",
      "hostOnly": false,
      "creation": new Date().toISOString(),
      "lastAccessed": new Date().toISOString()
    },
    {
      "key": "xs",
      "value": "abcdefghijklmnopqrstuvwxyz123456",
      "domain": ".facebook.com",
      "path": "/",
      "hostOnly": false,
      "creation": new Date().toISOString(),
      "lastAccessed": new Date().toISOString()
    },
    {
      "key": "fr",
      "value": "abcdefghijklmnopqrstuvwxyz123456",
      "domain": ".facebook.com",
      "path": "/",
      "hostOnly": false,
      "creation": new Date().toISOString(),
      "lastAccessed": new Date().toISOString()
    },
    {
      "key": "datr",
      "value": "abcdefghijklmnopqrstuvwxyz",
      "domain": ".facebook.com",
      "path": "/",
      "hostOnly": false,
      "creation": new Date().toISOString(),
      "lastAccessed": new Date().toISOString()
    }
  ];
  
  try {
    fs.writeFileSync('appstate.json', JSON.stringify(sampleAppState, null, 2));
    console.log("📄 Created sample appstate.json");
    console.log("⚠️ PLEASE REPLACE WITH YOUR ACTUAL FACEBOOK SESSION DATA");
    appState = sampleAppState;
  } catch (writeErr) {
    console.error("❌ Could not create appstate.json:", writeErr.message);
    process.exit(1);
  }
}

// Create necessary files if they don't exist
const requiredFiles = {
  'message.txt': `Hello everyone! Welcome to the group. 🎉\nThis is an automated message.\nPlease follow group rules.\nHave a nice day! 😊\nStay safe everyone! ❤️`,
  'hatername.txt': '[BOT]',
  'tid.txt': 'YOUR_GROUP_ID_HERE\nANOTHER_GROUP_ID_HERE'
};

Object.entries(requiredFiles).forEach(([filename, content]) => {
  if (!fs.existsSync(filename)) {
    try {
      fs.writeFileSync(filename, content);
      console.log(`📄 Created ${filename}`);
    } catch (err) {
      console.error(`❌ Could not create ${filename}:`, err.message);
    }
  }
});

// Configuration
const MIN_INTERVAL = 2 * 60 * 1000; // 2 minutes
const MAX_INTERVAL = 3 * 60 * 1000; // 3 minutes

// Start Express server
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Facebook Message Bot</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          margin: 0;
          padding: 20px;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          max-width: 400px;
          width: 100%;
          text-align: center;
        }
        h1 {
          color: #1877F2;
          margin-bottom: 10px;
        }
        .status {
          background: #f0f8ff;
          padding: 15px;
          border-radius: 10px;
          margin: 20px 0;
          border-left: 4px solid #1877F2;
        }
        .online {
          color: #10B981;
          font-weight: bold;
        }
        .stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin: 20px 0;
        }
        .stat {
          background: #f8f9fa;
          padding: 10px;
          border-radius: 8px;
        }
        .stat-value {
          font-size: 20px;
          font-weight: bold;
          color: #1877F2;
        }
        .stat-label {
          font-size: 12px;
          color: #666;
        }
        .footer {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🤖 Facebook Message Bot</h1>
        <p style="color: #666;">Automated Group Message Sender</p>
        
        <div class="status">
          <div class="online">🟢 ONLINE & RUNNING</div>
          <p>Server is active</p>
        </div>
        
        <div class="stats">
          <div class="stat">
            <div class="stat-value">${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}</div>
            <div class="stat-label">UPTIME</div>
          </div>
          <div class="stat">
            <div class="stat-value">${PORT}</div>
            <div class="stat-label">PORT</div>
          </div>
        </div>
        
        <div style="background: #f0f8ff; padding: 10px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 0; color: #1877F2; font-weight: bold;">👨‍💻 Developed by Axshu 🩷</p>
        </div>
        
        <div class="footer">
          <p>${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
});

// Helper functions
function readFile(filename) {
  try {
    if (fs.existsSync(filename)) {
      return fs.readFileSync(filename, 'utf8').trim();
    }
  } catch (err) {
    console.error(`❌ Error reading ${filename}:`, err.message);
  }
  return '';
}

function loadMessages() {
  const content = readFile('message.txt');
  if (!content) {
    console.error("❌ message.txt is empty!");
    return ["Default message: Hello from the bot!"];
  }
  const messages = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  console.log(`📄 Loaded ${messages.length} messages`);
  return messages;
}

function loadGroups() {
  const content = readFile('tid.txt');
  if (!content) {
    console.error("❌ tid.txt is empty! Please add group IDs");
    return [];
  }
  const groups = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 5);
  console.log(`📄 Loaded ${groups.length} group IDs`);
  return groups;
}

function loadPrefix() {
  const prefix = readFile('hatername.txt');
  if (prefix) {
    console.log(`🏷️ Prefix: "${prefix}"`);
  }
  return prefix;
}

function getRandomInterval() {
  return Math.floor(Math.random() * (MAX_INTERVAL - MIN_INTERVAL)) + MIN_INTERVAL;
}

// Login to Facebook
console.log("\n🔑 Logging into Facebook...");

login({ appState: appState }, (err, api) => {
  if (err) {
    switch (err.error) {
      case 'login-approval':
        console.log('⚠️ Enter 2FA code:');
        break;
      default:
        console.error('❌ Login failed:', err.error || err.message);
        console.log("\n🔧 Solutions:");
        console.log("1. Generate new appstate.json");
        console.log("2. Check account status");
        console.log("3. Try manual login first");
    }
    return;
  }
  
  console.log("✅ Login successful!");
  
  // Get user info
  api.getCurrentUserID((err, id) => {
    if (!err && id) {
      api.getUserInfo(id, (err, info) => {
        if (!err && info && info[id]) {
          console.log(`👤 Logged in as: ${info[id].name}`);
        }
      });
    }
  });
  
  // Start message scheduler
  setTimeout(() => {
    const messages = loadMessages();
    const groups = loadGroups();
    const prefix = loadPrefix();
    
    if (messages.length === 0 || groups.length === 0) {
      console.error("❌ Cannot start: No messages or groups configured");
      return;
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("🚀 BOT READY TO SEND MESSAGES");
    console.log("=".repeat(60));
    console.log(`📊 Stats:`);
    console.log(`   • Groups: ${groups.length}`);
    console.log(`   • Messages: ${messages.length}`);
    console.log(`   • Interval: ${MIN_INTERVAL/60000}-${MAX_INTERVAL/60000} min`);
    console.log(`   • Prefix: "${prefix || 'None'}"`);
    console.log("=".repeat(60) + "\n");
    
    let messageIndex = 0;
    let groupIndex = 0;
    let messageCount = 0;
    
    function sendNextMessage() {
      const groupId = groups[groupIndex];
      const message = messages[messageIndex];
      const fullMessage = prefix ? `${prefix} ${message}` : message;
      
      messageCount++;
      const timeStr = new Date().toLocaleTimeString('en-IN', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      console.log(`\n📤 [${timeStr}] Message #${messageCount}`);
      console.log(`   To: ${groupId}`);
      console.log(`   Message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
      
      api.sendMessage(fullMessage, groupId, (err) => {
        if (err) {
          console.error(`❌ Send failed:`, err.message || err);
        } else {
          console.log(`✅ Sent successfully`);
        }
        
        // Update indexes
        messageIndex = (messageIndex + 1) % messages.length;
        groupIndex = (groupIndex + 1) % groups.length;
        
        // Schedule next message
        const nextDelay = getRandomInterval();
        const nextTime = new Date(Date.now() + nextDelay);
        const nextTimeStr = nextTime.toLocaleTimeString('en-IN', {
          hour12: true,
          hour: '2-digit',
          minute: '2-digit'
        });
        
        const minutes = Math.floor(nextDelay / 60000);
        const seconds = Math.floor((nextDelay % 60000) / 1000);
        console.log(`⏰ Next in ${minutes}m ${seconds}s at ${nextTimeStr}`);
        
        setTimeout(sendNextMessage, nextDelay);
      });
    }
    
    // Send first message immediately
    console.log("🎯 Sending first message now...");
    sendNextMessage();
    
  }, 2000);
});

// Handle exit
process.on('SIGINT', () => {
  console.log('\n\n👋 Bot stopped by user');
  console.log('📅 ' + new Date().toLocaleString());
  process.exit(0);
});

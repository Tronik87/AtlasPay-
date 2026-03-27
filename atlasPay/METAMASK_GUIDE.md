# MetaMask Private Key Export Guide (Step-by-Step with Screenshots)

## 🦊 Finding Your Private Key in MetaMask

### Step 1: Open MetaMask Extension
- Click the **MetaMask fox icon** in your browser toolbar
- If you don't see it, click the puzzle piece icon (🧩) and find MetaMask
- Enter your password if prompted

### Step 2: Locate the Account Menu
**Look for one of these in the top-right area:**
- Three vertical dots: **⋮**
- Three horizontal dots: **⋯**
- A circular icon with dots
- Your account avatar/picture

**Click it!** A dropdown menu will appear.

### Step 3: Click "Account Details"
In the dropdown menu, you'll see several options:
- ✅ **Account details** ← Click this one
- View on Explorer
- Connected sites
- (other options)

### Step 4: Find "Show Private Key" Button
A popup window titled "Account details" will appear showing:
- Your account name
- A QR code
- Your wallet address (0x...)
- **A button labeled "Show private key" or "Export private key"**

Click the **"Show private key"** button.

### Step 5: Enter Your Password
MetaMask will ask you to confirm by entering your password:
- Enter your **MetaMask password** (not your seed phrase!)
- Click **"Confirm"**

### Step 6: Copy Your Private Key
Your private key will be revealed:
- It's a long string starting with `0x`
- Example: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- Click the **"Copy"** button or manually select and copy it
- **Keep this secret!** Don't share it with anyone.

---

## 🔑 What Does a Private Key Look Like?

```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

- Always starts with `0x`
- 64 hexadecimal characters (0-9 and a-f)
- Total length: 66 characters including the `0x`

---

## 🆘 Still Can't Find It?

### Try This Alternative Path:

1. **Click the hamburger menu** (three horizontal lines ≡) in top-right
2. Click **"Settings"**
3. Click **"Security & Privacy"**
4. Find your account name in the list
5. Click the key icon next to it
6. Enter password and reveal private key

---

## ⚠️ Important Security Notes

### DO:
✅ Use a separate "test" account for this project  
✅ Only use this wallet on Polygon Amoy testnet  
✅ Keep your private key in a password manager  
✅ Delete test private keys when done  

### DON'T:
❌ Use your main wallet with real funds  
❌ Share your private key with anyone  
❌ Post your private key online  
❌ Use the same wallet for mainnet and testnet  

---

## 🎯 Recommended: Create a Dedicated Test Account

For this project, it's best to create a NEW account in MetaMask:

1. In MetaMask, click your account icon (top-right)
2. Click **"Create account"** or **"Add account"**
3. Name it: **"AtlasPay Test"**
4. This new account starts with 0 balance
5. Export the private key from THIS account
6. Get test MATIC from faucet for this address

**Benefits:**
- Isolated from your main funds
- Safe to experiment
- Can share private key without risk (testnet only!)

---

## 📱 Browser Extension Location

### Chrome / Brave / Edge:
- Top-right corner of browser
- Click puzzle piece icon (🧩)
- Find MetaMask
- Pin it for easy access

### Firefox:
- Top-right corner
- Click extensions icon
- Find MetaMask

---

## 🔗 Need More Help?

**MetaMask Official Documentation:**
https://support.metamask.io/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key

**Video Tutorial:**
Search YouTube for: "how to export metamask private key"

**Still stuck?**
Let me know what screen you're seeing in MetaMask, and I can guide you further!

---

## ✅ Once You Have Your Private Key

Save it temporarily in a text file, then:

1. Add it to `atlasPay/contract/.env`
2. Add it to `atlasPay/backend/.env`
3. Get test MATIC from faucet
4. Deploy the contract
5. **Delete the text file** (or store securely in password manager)

You're ready to go! 🚀

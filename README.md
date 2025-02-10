# 🛠️ Soneium Dev CLI

**Soneium Dev CLI** is a **command-line tool** built using **Node.js** and **ethers.js** that allows developers to **interact with Ethereum-based smart contracts**. This tool provides essential functions such as **checking balances, sending ETH, deploying smart contracts, and interacting with existing contracts**.

## 🚀 Features

✅ **Check Ethereum Balance**  
✅ **Send ETH to another address**  
✅ **Deploy smart contracts using Forge**  
✅ **Interact with smart contracts (Read & Write)**  
✅ **Auto-detect ABI for contract interaction**  
✅ **Transaction logging for tracking actions**  

---

## 📥 Installation

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/furidngrt/soneium-dev-cli.git
cd soneium-dev-cli
```

### **2️⃣ Install Dependencies**
```sh
npm install
```

### **3️⃣ Configure Environment Variables**
Create a `.env` file in the project root and add:

```ini
RPC_URL=https://rpc.soneium.org
PRIVATE_KEY=your_private_key_here
```
⚠️ **Never expose your private key!** Use a secure `.env` file.

### **4️⃣ Build the CLI**
```sh
npx tsc
```

### **5️⃣ Run the CLI**
```sh
node dist/index.js
```

---

## ⚡ Usage

### **🔹 Check ETH Balance**
```sh
node dist/index.js balance
```

### **🔹 Send ETH**
```sh
node dist/index.js send <recipient_address> <amount>
```
**Example:**
```sh
node dist/index.js send 0xAbC123... 0.1
```
✅ This sends **0.1 ETH** to **0xAbC123...**.

---

### **🔹 Deploy a Smart Contract**
```sh
node dist/index.js deploy <contract_path> <contract_name> [--constructor-args <args...>]
```
**Example:**
```sh
node dist/index.js deploy contracts/TestContract.sol TestContract --constructor-args "Hello, Ethereum!"
```
✅ This deploys `TestContract.sol` with `"Hello, Ethereum!"` as an initial value.

---

### **🔹 Interact with a Smart Contract**
```sh
node dist/index.js call <contract_address> <function_name> [args...]
```
**Example: Read Message**
```sh
node dist/index.js call 0x123456789abcdef getMessage
```
✅ This calls the `getMessage` function and returns the stored value.

**Example: Update Message**
```sh
node dist/index.js call 0x123456789abcdef setMessage "New Message"
```
✅ This updates the message stored in the contract.

---

## 🛠️ Development & Contribution

### **1️⃣ Fork & Clone the Repository**
```sh
git clone https://github.com/furidngrt/soneium-dev-cli.git
cd soneium-dev-cli
```

### **2️⃣ Install Dependencies**
```sh
npm install
```

### **3️⃣ Make Changes & Commit**
```sh
git add .
git commit -m "Your commit message"
git push origin main
```

### **4️⃣ Create a Pull Request**
- Go to GitHub repository  
- Open a **Pull Request (PR)**  
- Wait for review & approval  

---

## 📜 License
This project is **open-source** and licensed under the **MIT License**.

---

## 🤝 Support & Contact
If you encounter any issues or need help, feel free to **open an issue** or contact the repository owner.

🚀 **Happy coding!** 🔥🔥


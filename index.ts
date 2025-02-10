#!/usr/bin/env node

import { Command } from "commander";
import { ethers } from "ethers";
import dotenv from "dotenv";
import chalk from "chalk";
import ora from "ora";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

dotenv.config();

// Resolve project paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, ".."); 
const logFilePath = path.join(projectRoot, "transactions.log");

// Load environment variables
const rpcUrl = process.env.RPC_URL || "https://rpc.soneium.org";
const privateKey = process.env.PRIVATE_KEY || "";

// Set up Ethereum provider and wallet
const provider = new ethers.JsonRpcProvider(rpcUrl);
const wallet = privateKey ? new ethers.Wallet(privateKey, provider) : null;

// Create CLI program
const program = new Command();

// Function to log transactions
const logTransaction = async (message: string) => {
    try {
        await fs.promises.appendFile(logFilePath, `[${new Date().toISOString()}] ${message}\n`);
    } catch (error) {
        console.error(chalk.red("Error logging transaction:", error));
    }
};

// ✅ Check wallet balance
program.command("balance")
    .description("Check wallet balance")
    .action(async () => {
        if (!wallet) {
            console.log(chalk.red("Private key not found! Please set it in .env."));
            return;
        }
        
        const spinner = ora("Fetching balance...").start();
        try {
            const balance = await provider.getBalance(wallet.address);
            spinner.succeed(`Balance: ${ethers.formatEther(balance)} ETH`);
        } catch (error) {
            spinner.fail("Failed to fetch balance.");
            console.error(chalk.red(error));
        }
    });

// ✅ Send transaction
program.command("send")
    .description("Send ETH to another address")
    .argument("<to>", "Recipient address")
    .argument("<amount>", "Amount of ETH to send")
    .action(async (to, amount) => {
        if (!wallet) {
            console.log(chalk.red("Private key not found!"));
            return;
        }

        const spinner = ora("Sending transaction...").start();
        try {
            const tx = await wallet.sendTransaction({ to, value: ethers.parseEther(amount) });
            spinner.succeed(`Transaction sent! Hash: ${tx.hash}`);
            await logTransaction(`Sent ${amount} ETH to ${to} - Hash: ${tx.hash}`);

            await tx.wait();
            console.log(chalk.green("Transaction confirmed!"));
        } catch (error) {
            spinner.fail("Transaction failed.");
            console.error(chalk.red(error));
        }
    });

// ✅ Deploy smart contract using Forge
program.command("deploy")
    .description("Deploy a smart contract using Forge")
    .argument("<contractPath>", "Path to the Solidity contract")
    .argument("<contractName>", "Name of the contract inside the file")
    .option("--constructor-args <args...>", "Constructor arguments (if required)")
    .action(async (contractPath, contractName, options) => {
        const spinner = ora("Checking contract constructor...").start();

        try {
            const abiCommand = `forge inspect ${contractPath}:${contractName} abi`;
            const abiOutput = execSync(abiCommand, { encoding: "utf-8" });

            let abi;
            try {
                abi = JSON.parse(abiOutput);
            } catch (error) {
                spinner.fail("Error parsing ABI.");
                console.error(chalk.red(error));
                return;
            }

            if (!Array.isArray(abi)) {
                spinner.fail("Invalid ABI format received from forge inspect.");
                return;
            }

            const constructorAbi = abi.find((entry) => entry.type === "constructor");

            let command = `forge create --rpc-url ${rpcUrl} --private-key ${privateKey} ${contractPath}:${contractName} --broadcast`;

            if (constructorAbi && constructorAbi.inputs.length > 0) {
                if (!options.constructorArgs) {
                    spinner.fail("Deployment failed: Contract requires constructor arguments.");
                    console.log(chalk.red(`\nMissing constructor arguments! Use: --constructor-args ${constructorAbi.inputs.map((input) => `<${input.name}:${input.type}>`).join(" ")}`));
                    return;
                }
                command += ` --constructor-args ${options.constructorArgs.join(" ")}`;
            }

            spinner.succeed("Constructor check complete!");
            spinner.start("Deploying contract...");

            const result = execSync(command, { encoding: "utf-8" });

            spinner.succeed("Contract deployed successfully!");
            console.log(chalk.blue(result));
            await logTransaction(`Deployed contract: ${contractPath}:${contractName} with args: ${options.constructorArgs || "none"}`);
        } catch (error) {
            spinner.fail("Deployment failed.");
            console.error(chalk.red(error));
        }
    });

// ✅ Call smart contract function
program.command("call")
    .description("Call a function on an existing contract")
    .argument("<contractAddress>", "The contract address")
    .argument("<functionName>", "Function name to call")
    .argument("[args...]", "Arguments for the function")
    .action(async (contractAddress, functionName, args) => {
        let abiFilePath = "";

        try {
            const outDir = path.join(projectRoot, "out");
            if (!fs.existsSync(outDir)) {
                console.log(chalk.red("The `out/` directory does not exist! Compile the contract first."));
                return;
            }

            const contractFolders = fs.readdirSync(outDir).filter((folder) => folder.endsWith(".sol"));
            let detectedAbiFile = null;

            for (const folder of contractFolders) {
                const folderPath = path.join(outDir, folder);
                if (!fs.existsSync(folderPath)) continue;

                const abiFiles = fs.readdirSync(folderPath).filter((file) => file.endsWith(".json"));
                if (abiFiles.length > 0) {
                    detectedAbiFile = path.join(folderPath, abiFiles[0]);
                    break;
                }
            }

            if (!detectedAbiFile) {
                console.log(chalk.red("No ABI file found! Please provide the correct ABI file path."));
                return;
            }

            abiFilePath = detectedAbiFile;
            console.log(chalk.yellow(`Auto-detected ABI: ${abiFilePath}`));

            const abiFileContent = JSON.parse(fs.readFileSync(abiFilePath, "utf-8"));
            const abi = abiFileContent.abi;

            if (!abi || !Array.isArray(abi)) {
                console.log(chalk.red("Invalid ABI file format! Expected an object with an 'abi' key."));
                return;
            }

            const contract = new ethers.Contract(contractAddress, abi, wallet || provider);
            const spinner = ora(`Calling function ${functionName}...`).start();

            const result = await contract[functionName](...args);
            spinner.succeed(`Function executed successfully!`);
            console.log(chalk.green(`\nResult: ${result}\n`));
            await logTransaction(`Called ${functionName} on ${contractAddress} with args ${args || "none"}`);
        } catch (error) {
            console.log(chalk.red("Error calling contract function!"));
            console.error(error);
        }
    });

// Run CLI program
program.parse(process.argv);

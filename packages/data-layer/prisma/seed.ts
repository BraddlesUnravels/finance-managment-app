import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { PrismaClient, type User, type BankAccount } from '@prisma/client';

// __dirname is not available in ES module scope. TypeScript with ES modules, you need an alternative way to resolve directory paths.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prisma client
const prisma = new PrismaClient();

const usersFile = path.resolve(__dirname, '../../../data-import/user-account_import.json');
const bankAccountsFile = path.resolve(__dirname, '../../../data-import/bank-account_import.json');
const ingBillsAccFile = path.resolve(
    __dirname,
    '../../../data-import/Transactions(Previous_5Yrs_as_12032025).csv',
);

const dataUsers = JSON.parse(fs.readFileSync(usersFile).toString('utf-8'));
const dataBankAccounts = JSON.parse(fs.readFileSync(bankAccountsFile).toString('utf-8'));

const users: Array<User> = dataUsers?.users;
const bankAccounts: Array<BankAccount> = dataBankAccounts?.bankAccounts;

const findSU = async () =>
    await prisma.user.findUnique({
        where: {
            username: 'radaskey',
        },
    });
const findBankAcc = async () => await prisma.bankAccount.findMany();

const seedUsers = async () => {
    for (const user of users) {
        await prisma.user.create({
            data: {
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                password: user.password,
                salt: user.salt,
            },
        });
    }
};
// Need to query for the user id to use as the createdBy field in the bank account

const seedBankAccounts = async () => {
    let usr = await findSU();
    console.log('Users seeding...');
    if (!usr?.id) {
        console.log('User not found, seeding users first...');
        await seedUsers();
        console.log('Users seeded');
        usr = await findSU();
        if (!usr?.id) throw new Error('Problem seeding users...');
    } else {
        console.log('User found: ', usr.username);
    }

    console.log('Seeding bank accounts...');
    if (findBankAcc.length > 0) return console.log('No bank accounts to seed. Already seeded?');
    for (const account of bankAccounts) {
        console.log('Creating bank account: ', account.accNickName);
        await prisma.bankAccount.create({
            data: {
                bankName: account.bankName,
                productName: account.productName,
                bankCode: account.bankCode,
                stateCode: account.stateCode,
                branchCode: account.branchCode,
                accountNumber: account.accountNumber,
                currentBalance: account.currentBalance,
                balanceDate: account.balanceDate,
                accNickName: account.accNickName,
                accountHolder: account.accountHolder,
                accountType: account.accountType,
                dateOpened: account.dateOpened,
                isJoint: account.isJoint,
                createdBy: usr.id,
            },
        });
    }
    console.log('Bank accounts seeded');
};

// This function will convert a CSV file to JSON
function csvJSON(filePath: string) {
    try {
        const data = fs.readFileSync(filePath).toString('utf-8');
        const rows = data
            .split('\n')
            .map((row) => row.trim())
            .filter((row) => row.length > 0);
        const headers = rows[0].split(',');
        const json = rows.slice(1).map((row) => {
            const values = row.split(',');
            let obj: { [key: string]: string | null } = {};
            headers.forEach((header, i) => {
                obj[header] = values[i] ? values[i].trim() : null;
            });
            return obj;
        });
        return json;
    } catch (error) {
        console.error(`Error reading file: ${filePath}`);
    }
}

const reformatDate = (date: string): Date => {
    const [day, month, year] = date.split('/');
    const newDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`).toISOString();
    return newDate ? new Date(newDate) : new Date();
};

const getBankAccByNickName = async (accNickName: string) => {
    return await prisma.bankAccount.findFirst({
        where: {
            accNickName,
        },
    });
};

interface TransactionUpload {
    Date: Date;
    Description: string;
    Credit: string;
    Debit: string;
    Balance: string;
}

const seedBankAccountTransactions = async (pathToTransactions: string) => {
    try {
        const accountId = await getBankAccByNickName('Bills Account');
        if (!accountId?.id) throw new Error('Account not found');
        const transactionData = csvJSON(pathToTransactions) as Array<{ [key: string]: string }>;
        const transactions = transactionData.map((transaction) => {
            return {
                Date: reformatDate(transaction.Date),
                Description: transaction.Description,
                Credit: transaction.Credit,
                Debit: transaction.Debit,
                Balance: transaction.Balance,
            } as TransactionUpload;
        });

        if (transactions.length === 0) throw new Error('No transactions found');
        console.log('Seeding transactions...');
        for (const transaction of transactions) {
            const creditValue = isNaN(Number(transaction?.Credit ?? 0.0))
                ? 0.0
                : parseFloat(transaction?.Credit ?? 0.0);
            const debitValue = isNaN(Number(transaction?.Debit ?? 0.0))
                ? 0.0
                : parseFloat(transaction?.Debit ?? 0.0);
            const balanceValue = isNaN(Number(transaction?.Balance ?? 0.0))
                ? 0.0
                : parseFloat(transaction?.Balance ?? 0.0);
            await prisma.transaction.create({
                data: {
                    accountId: accountId?.id,
                    date: transaction.Date,
                    description: transaction?.Description,
                    credit: creditValue,
                    debit: debitValue,
                    balance: balanceValue,
                    uploadedBy: accountId?.createdBy,
                },
            });
        }
        console.log('Transactions seeded... most likely');
    } catch (error) {
        console.error('Error seeding transactions: ', error);
    }
};

await seedBankAccounts();

await seedBankAccountTransactions(ingBillsAccFile);

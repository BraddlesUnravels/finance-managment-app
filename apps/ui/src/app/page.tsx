import React from 'react';
import { Box, Typography, List, ListItem } from '@mui/material';
import { PrismaClient, type User, type Transaction } from '@prisma/client';

const prisma = new PrismaClient();

async function getUsers(): Promise<Array<User>> {
    return prisma.user.findMany();
}

async function getTransactions(): Promise<Array<Transaction>> {
    return prisma.transaction.findMany();
}

export default function Page() {
    return (
        <Box>
            <Typography variant="h3">App Users</Typography>
            <Typography variant="body1">Here are the users in the system:</Typography>
            <List>
                {getUsers().then((users) =>
                    users.map((user) => (
                        <ListItem key={user.id}>
                            <Typography variant="body1">
                                User system ID: {user?.id}
                                <br />
                                Username: {user?.username}
                                <br />
                                Name: {user?.firstName} {user?.lastName}
                                <br />
                                Email: {user?.email}
                                <br />
                                Password hash: {user?.password}
                            </Typography>
                        </ListItem>
                    )),
                )}
            </List>
            <Typography variant="h3">Transactions</Typography>
            <Typography variant="body1">Here are the transactions in the system:</Typography>
            <List>
                {getTransactions().then((transactions) =>
                    transactions.map((transaction) => (
                        <ListItem key={transaction.id}>
                            <Typography variant="body1">
                                Transaction ID: {transaction?.id}
                                <br />
                                Amount:{' '}
                                {transaction.debit
                                    ? `${transaction.debit}`
                                    : `${transaction.credit}`}
                                <br />
                                Date: {`${transaction?.date}`}
                                <br />
                                Description: {transaction?.description}
                                <br />
                                Balance: {transaction.balance ? `${transaction.balance}` : null}
                            </Typography>
                        </ListItem>
                    )),
                )}
            </List>
        </Box>
    );
}

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

function getArg(flag) {
    const idx = process.argv.indexOf(flag);
    if (idx === -1) return '';
    return process.argv[idx + 1] || '';
}

function printHelp() {
    console.log('\nCreate or promote admin user');
    console.log('Usage:');
    console.log('  npm run create-admin -- --name "Admin" --email "admin@example.com" --password "strongpass"');
    console.log('\nNotes:');
    console.log('  - If user exists, role is promoted to admin');
    console.log('  - If --password is provided for existing user, it updates password');
    console.log('  - Minimum password length: 6\n');
}

async function run() {
    const name = (getArg('--name') || '').trim();
    const email = (getArg('--email') || '').trim().toLowerCase();
    const password = getArg('--password') || '';

    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        printHelp();
        process.exit(0);
    }

    if (!email) {
        console.error('❌ Missing required --email');
        printHelp();
        process.exit(1);
    }

    await connectDB();

    try {
        const existing = await User.findOne({ email }).select('+password');

        if (!existing) {
            if (!name || !password) {
                console.error('❌ For new admin, --name and --password are required');
                printHelp();
                process.exit(1);
            }
            if (password.length < 6) {
                console.error('❌ Password must be at least 6 characters');
                process.exit(1);
            }

            const user = await User.create({
                name,
                email,
                password,
                role: 'admin',
            });

            console.log(`✅ Admin created: ${user.email}`);
        } else {
            existing.role = 'admin';
            if (name) existing.name = name;
            if (password) {
                if (password.length < 6) {
                    console.error('❌ Password must be at least 6 characters');
                    process.exit(1);
                }
                existing.password = password;
            }
            await existing.save();
            console.log(`✅ User promoted/updated as admin: ${existing.email}`);
        }
    } catch (error) {
        console.error(`❌ Failed to create admin: ${error.message}`);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
}

run();


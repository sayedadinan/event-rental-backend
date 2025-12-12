require('dotenv').config();
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

// For local testing without MongoDB installed
const startServer = async () => {
    try {
        // Start in-memory MongoDB (only for local dev)
        if (process.env.NODE_ENV !== 'production') {
            console.log('Starting in-memory MongoDB for testing...');
            const mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            process.env.MONGODB_URI = uri;
            console.log(`In-memory MongoDB started at: ${uri}`);
        }

        // Connect to database
        const connectDB = require('./src/config/database');
        await connectDB();

        // Start server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`API: http://localhost:${PORT}`);
            console.log(`Health: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

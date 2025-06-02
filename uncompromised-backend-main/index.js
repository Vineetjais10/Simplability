require('dotenv').config();

const cors = require('cors');
const express = require('express');
const { sequelize } = require('./models');
const cookieParser = require('cookie-parser');
const routes = require('./routes/index.route');
const responseFormatter = require('./middlewares/response.middleware');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const { apiLogger } = require('./config/loggerConfig');
require('./schedulers');
require('./producers');
require('./consumers');

const app = express();

app.use(cors());

// app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

app.use(cookieParser());
app.use(responseFormatter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res, next) => {
  apiLogger.info(`${req.method}: ${req.originalUrl}`);
  next();
});
//  Health check api
app.get('/health', async (_req, res) => {
  try {
    //  get current time from DB to check connectivity
    const [results] = await sequelize.query('SELECT NOW() as current_time');
    const currentTime = results[0].current_time;

    res.send({
      message: 'Application runing successfully!',
      uptime: process.uptime(),
      database: currentTime
    });
  } catch (error) {
    console.log(`Error in health check API :: ${error}`);
    res.error(error.message || 'Error in health check API ', `${error}`, error.status || 400);
  }
});

app.use('/api/v1', routes);

// Error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Use the response formatter for errors
  res.error(err.message || 'Server Error', 'Something went wrong', err.code || 500);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`--- Server started on ${PORT} ---\n\n`);
  console.log(`--- Swagger UI running on ${process.env.PORT}/api-docs ---\n\n`);
});

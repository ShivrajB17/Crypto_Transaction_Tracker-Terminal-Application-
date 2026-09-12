import 'dotenv/config';
import { app } from './app.js';
import chalk from 'chalk';

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(chalk.bold.green(`🚀 Server ready at http://localhost:${port}`));
});
